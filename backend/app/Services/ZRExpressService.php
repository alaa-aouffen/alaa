<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ZRExpressService
{
    protected $baseUrl;
    protected $token;
    protected $tenantId;
    protected $mapping;

    public function __construct()
    {
        $this->baseUrl  = config('zrexpress.base_url');
        $this->token    = config('zrexpress.token');
        $this->tenantId = config('zrexpress.tenant_id');
        $this->mapping  = config('zrexpress.mapping');
    }

    /**
     * Dynamically set credentials based on the order's assigned agent.
     */
    protected function setAccountFromOrder($order)
    {
        // 1. Get the category assigned to the order
        $category = $order->category ?? null;

        if ($category) {
            \Log::info("ZRExpress: Switching account for Order #{$order->id} (Category: {$category->name}, ID: {$category->id})");
            
            if ($category->zrExpressAccount) {
                \Log::info("ZRExpress: Using sub-account: " . $category->zrExpressAccount->name);
                $this->token = $category->zrExpressAccount->token;
                $this->tenantId = $category->zrExpressAccount->tenant_id;
            } else {
                \Log::info("ZRExpress: Category has no sub-account, using default config.");
                $this->token = config('zrexpress.token');
                $this->tenantId = config('zrexpress.tenant_id');
            }
        } else {
            \Log::info("ZRExpress: Order #{$order->id} has no category assigned, using default config.");
            $this->token = config('zrexpress.token');
            $this->tenantId = config('zrexpress.tenant_id');
        }
    }

    private function headers(): array
    {
        return [
            'X-Api-Key' => $this->token,
            'X-Tenant'  => $this->tenantId,
            'Accept'    => 'application/json',
        ];
    }

    /**
     * Create a shipment in ZR Express.
     *
     * @param \App\Models\Order $order
     * @return array
     * @throws Exception
     */
    public function createShipment($order)
    {
        $this->setAccountFromOrder($order);
        try {
            // 1. Get Territory IDs and Names
            $territories = $this->lookupTerritories(
                $order->{$this->mapping['wilaya']},
                $order->{$this->mapping['commune']}
            );

            if (!$territories) {
                throw new Exception("Territoire non trouvé chez ZR Express pour : " . $order->{$this->mapping['commune']});
            }

            // 2. Find or Create Customer
            $customerId = $this->findOrCreateCustomer(
                $order->{$this->mapping['customer_name']},
                $order->{$this->mapping['customer_phone']},
                $territories
            );

            if (!$customerId) {
                throw new Exception("Impossible de gérer le client chez ZR Express.");
            }

            // 3. Create Parcel
            $address = $order->{$this->mapping['address']}
                ?: ($order->{$this->mapping['commune']} . ', ' . $order->{$this->mapping['wilaya']});

            $payload = [
                'description'    => $order->{$this->mapping['product']},
                'deliveryType'   => $order->delivery_type ?? 'home',
                'amount'         => (float) $order->{$this->mapping['price']},
                'externalId'     => (string) $order->id,
                'customer' => [
                    'customerId' => $customerId,
                    'name'       => $order->{$this->mapping['customer_name']},
                    'phone'      => [
                        'number1' => $this->formatPhoneNumber($order->{$this->mapping['customer_phone']})
                    ],
                ],
                'orderedProducts' => [
                    [
                        'productName' => $order->{$this->mapping['product']},
                        'unitPrice'   => (float) $order->{$this->mapping['price']},
                        'quantity'    => (int) ($order->quantity ?? 1),
                        'stockType'   => 'none',
                    ]
                ],
                'deliveryAddress' => [
                    'street'              => $address,
                    'city'                => $territories['cityName'],
                    'cityTerritoryId'     => $territories['cityId'],
                    'district'            => $territories['districtName'],
                    'districtTerritoryId' => $territories['districtId'],
                    'country'             => 'Algeria',
                ],
                'weight' => [
                    'weight'            => 0.5,
                    'dimensionalWeight' => 0.5,
                ],
            ];

            // If delivery type is pickup-point (Stopdesk), we MUST provide the hubId
            if ($order->delivery_type === 'pickup-point') {
                if (!empty($order->stopdesk_id)) {
                    $payload['hubId'] = $order->stopdesk_id;
                } else {
                    // Fallback to searching if no stopdesk_id was explicitly selected
                    $hubsRes = Http::withoutVerifying()
                        ->withHeaders($this->headers())
                        ->post("{$this->baseUrl}/api/v1/hubs/search", [
                            'territoryId' => $territories['cityId'],
                            'page' => 1,
                            'pageSize' => 100
                        ]);
                    
                    if ($hubsRes->successful()) {
                        $hubs = $hubsRes->json()['items'] ?? [];
                        // Try to match by district first, then by city (wilaya)
                        // We MUST prioritize hubs that are valid pickup points
                        $hub = collect($hubs)
                            ->filter(fn($h) => ($h['isPickupPoint'] ?? false) === true)
                            ->first(function($h) use ($territories) {
                                return ($h['address']['districtTerritoryId'] ?? '') === $territories['districtId']
                                    || ($h['address']['cityTerritoryId'] ?? '') === $territories['cityId'];
                            });
                        
                        // Fallback to any hub if no specific pickup point is found (though the API might reject it)
                        if (!$hub) {
                            $hub = collect($hubs)->first(function($h) use ($territories) {
                                return ($h['address']['districtTerritoryId'] ?? '') === $territories['districtId']
                                    || ($h['address']['cityTerritoryId'] ?? '') === $territories['cityId'];
                            });
                        }
                        
                        if ($hub) {
                            $payload['hubId'] = $hub['id'];
                        } else {
                            throw new \Exception("Aucun bureau Stopdesk/Point de retrait trouvé pour la destination: " . $order->wilaya . " / " . $order->commune);
                        }
                    } else {
                        throw new \Exception("Impossible de récupérer la liste des bureaux Stopdesk depuis l'API ZR Express.");
                    }
                }
            }

            Log::info('ZR Express API: Sending request to create shipment', ['order_id' => $order->id, 'payload' => $payload]);

            $response = Http::withoutVerifying()
                ->withHeaders($this->headers())
                ->timeout(30)
                ->post("{$this->baseUrl}/api/v1/parcels", $payload);

            $data = $response->json();

            Log::info('ZR Express API: Received response', [
                'order_id' => $order->id,
                'status'   => $response->status(),
                'body'     => $response->body()
            ]);

            if ($response->successful()) {
                $parcelId = $data['id'] ?? null;
                $realTrackingNumber = $data['trackingNumber'] ?? $data['parcelNumber'] ?? null;

                // If the real tracking number is not in the creation response, fetch it from details
                if (!$realTrackingNumber && $parcelId) {
                    $details = $this->getReceipt($parcelId, $order);
                    if ($details && isset($details['data']['trackingNumber'])) {
                        $realTrackingNumber = $details['data']['trackingNumber'];
                    }
                }

                return [
                    'success'         => true,
                    'tracking_number' => $realTrackingNumber ?? $parcelId,
                    'data'            => $data
                ];
            }

            $errorMsg = collect($data['errors'] ?? [])->pluck('description')->implode(', ');
            throw new Exception($errorMsg ?: ('Erreur API: ' . $response->body()));

        } catch (Exception $e) {
            Log::error('ZR Express API Error: ' . $e->getMessage(), ['order_id' => $order->id]);
            throw $e;
        }
    }

    /**
     * Look up territory IDs (Wilaya/City and Commune/District)
     */
    /**
     * Normalize a wilaya/commune name using the comprehensive WilayaHelper mapping.
     * Handles Arabic, French with/without accents, Ayor typos, and "XX - Name - عربي" formats.
     */
    protected function cleanName($name)
    {
        if (empty($name)) return '';

        // Extract French name from Ayor format: "11 - Tamanrasset - تمنراست"
        if (str_contains($name, ' - ')) {
            $parts = explode(' - ', $name);
            if (is_numeric(trim($parts[0])) && isset($parts[1])) {
                $name = trim($parts[1]);
            }
        }

        // Delegate to the comprehensive 58-wilaya mapping
        return \App\Helpers\WilayaHelper::normalize($name);
    }

    protected function lookupTerritories($wilayaName, $communeName)
    {
        $cleanWilaya = $this->cleanName($wilayaName);
        $cleanCommune = $this->cleanName($communeName);

        // 1. Search for Wilaya specifically first to get its ID
        $wilayaRes = Http::withoutVerifying()
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/v1/territories/search", [
                'keyword'  => $cleanWilaya,
                'page'     => 1,
                'pageSize' => 10
            ]);

        $wilayaId = null;
        if ($wilayaRes->successful()) {
            $items = $wilayaRes->json()['items'] ?? [];
            $wilayaMatch = collect($items)->first(function($i) use ($cleanWilaya) {
                $name = strtolower($i['name']);
                $search = strtolower($cleanWilaya);
                return ($name === $search || str_contains($name, $search) || str_contains($search, $name)) 
                       && $i['level'] === 'wilaya';
            });
            if ($wilayaMatch) {
                $wilayaId = $wilayaMatch['id'];
            }
        }

        // 2. Search for Commune
        $keyword = !empty($cleanCommune) ? $cleanCommune : $cleanWilaya;
        $response = Http::withoutVerifying()
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/v1/territories/search", [
                'keyword'  => $keyword,
                'page'     => 1,
                'pageSize' => 20
            ]);

        if ($response->successful()) {
            $items = $response->json()['items'] ?? [];
            if (!empty($items)) {
                // Filter items to find a commune that belongs to our WilayaId
                $commune = collect($items)->first(function($i) use ($wilayaId, $cleanCommune) {
                    $isCommune = $i['level'] === 'commune';
                    $matchesWilaya = $wilayaId ? ($i['parentId'] === $wilayaId) : true;
                    
                    if (empty($cleanCommune)) return $isCommune && $matchesWilaya;

                    $name = strtolower($i['name']);
                    $search = strtolower($cleanCommune);
                    return $isCommune && $matchesWilaya && ($name === $search || str_contains($name, $search) || str_contains($search, $name));
                });

                // If no exact commune match within wilaya, fallback to any commune matching the name
                if (!$commune) {
                    $commune = collect($items)->firstWhere('level', 'commune');
                }

                // If still nothing, take the first item
                if (!$commune) {
                    $commune = $items[0];
                }
                
                return [
                    'districtId'   => $commune['id'],
                    'districtName' => $commune['name'],
                    'cityId'       => $commune['parentId'] ?? $wilayaId,
                    'cityName'     => $wilayaName,
                ];
            }
        }

        return null;
    }

    /**
     * Find existing customer or create a new one
     */
    protected function findOrCreateCustomer($name, $phone, $territories)
    {
        $phone = $this->formatPhoneNumber($phone);

        // 1. Search existing
        $search = Http::withoutVerifying()
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/v1/customers/search", [
                'keyword'  => $phone,
                'page'     => 1,
                'pageSize' => 1
            ]);

        if ($search->successful()) {
            $items = $search->json()['items'] ?? [];
            if (!empty($items)) {
                return $items[0]['id'];
            }
        }

        // 2. Create new if not found
        $payload = [
            'name'  => $name,
            'phone' => ['number1' => $phone],
            'addresses' => [
                [
                    'city'                => $territories['cityName'],
                    'cityTerritoryId'     => $territories['cityId'],
                    'district'            => $territories['districtName'],
                    'districtTerritoryId' => $territories['districtId'],
                    'country'             => 'Algeria',
                    'street'              => 'N/A',
                    'isPrimary'           => true
                ]
            ]
        ];

        $create = Http::withoutVerifying()
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/v1/customers/individual", $payload);

        if ($create->successful()) {
            return $create->json()['id'] ?? null;
        }

        Log::error('ZR Express: Failed to create customer', ['response' => $create->body(), 'payload' => $payload]);
        return null;
    }

    /**
     * Format phone number to international format E.164 (+213...)
     */
    protected function formatPhoneNumber($phone)
    {
        // Remove all non-numeric characters except +
        $cleaned = preg_replace('/[^0-9+]/', '', $phone);

        // If local format 05/06/07...
        if (preg_match('/^0([567][0-9]{8})$/', $cleaned, $matches)) {
            return '+213' . $matches[1];
        }

        // If international format 213... (no +)
        if (preg_match('/^213([567][0-9]{8})$/', $cleaned, $matches)) {
            return '+' . $cleaned;
        }

        // If already +213...
        if (preg_match('/^\+213([567][0-9]{8})$/', $cleaned)) {
            return $cleaned;
        }

        return $cleaned;
    }

    /**
     * Get shipment receipt status.
     *
     * @param string $trackingNumber
     * @return array
     */
    public function getReceipt($trackingNumber, $order = null)
    {
        if ($order) {
            $this->setAccountFromOrder($order);
        }
        try {
            $response = Http::withoutVerifying()
                ->withHeaders($this->headers())
                ->get("{$this->baseUrl}/api/v1/parcels/{$trackingNumber}");

            if ($response->successful()) {
                $data = $response->json();
                // Map the status field from the API response
                return [
                    'status' => $data['currentState']['stateName']
                        ?? $data['status']
                        ?? $data['state']
                        ?? null,
                    'data' => $data
                ];
            }

            Log::error('ZR Express API Sync Error: Failed to fetch receipt for ' . $trackingNumber);
            return null;

        } catch (Exception $e) {
            Log::error('ZR Express API Sync Exception: ' . $e->getMessage());
            return null;
        }
    }
    /**
     * Get the state history (timeline) of a parcel.
     *
     * @param string $trackingNumber
     * @return array
     */
    public function getHistory($trackingNumber, $order = null)
    {
        if ($order) {
            $this->setAccountFromOrder($order);
        }
        try {
            $response = Http::withoutVerifying()
                ->withHeaders($this->headers())
                ->get("{$this->baseUrl}/api/v1/parcels/{$trackingNumber}/state-history");

            if ($response->successful()) {
                return $response->json();
            }

            // If 404, likely no history yet or test environment purge
            if ($response->status() === 404) {
                return [];
            }

            Log::error('ZR Express History Error', ['status' => $response->status(), 'tracking' => $trackingNumber]);
            return [];

        } catch (\Exception $e) {
            Log::error('ZR Express History Exception: ' . $e->getMessage());
            return [];
        }
    }
    /**
     * Get available pickup points (hubs) for the order's destination.
     *
     * @param \App\Models\Order $order
     * @return array
     */
    public function getAvailableHubs($order)
    {
        $this->setAccountFromOrder($order);

        $territories = $this->lookupTerritories(
            $order->{$this->mapping['wilaya']},
            $order->{$this->mapping['commune']}
        );

        if (!$territories) {
            return [];
        }

        $hubsRes = Http::withoutVerifying()
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}/api/v1/hubs/search", [
                'territoryId' => $territories['cityId'],
                'page' => 1,
                'pageSize' => 100
            ]);

        if ($hubsRes->successful()) {
            $hubs = $hubsRes->json()['items'] ?? [];
            
            // Filter to only hubs that are valid pickup points AND match the district or city
            return collect($hubs)
                ->filter(function($h) use ($territories) {
                    $isPickup = ($h['isPickupPoint'] ?? false) === true;
                    $matchesLocation = ($h['address']['districtTerritoryId'] ?? '') === $territories['districtId']
                                    || ($h['address']['cityTerritoryId'] ?? '') === $territories['cityId'];
                    return $isPickup && $matchesLocation;
                })
                ->values()
                ->toArray();
        }

        return [];
    }
}

