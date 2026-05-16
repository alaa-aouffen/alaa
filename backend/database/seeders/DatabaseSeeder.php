<?php

namespace Database\Seeders;

use App\Models\CallLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Create Admin ──────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@callcenter.dz'],
            [
                'name'      => 'Administrateur',
                'password'  => 'admin123',
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        // ── 2. Create Agents ─────────────────────────────────────────
        $agents = [];
        $agentData = [
            ['name' => 'Amel Bensalem',   'email' => 'amel@callcenter.dz'],
            ['name' => 'Karim Ouadah',    'email' => 'karim@callcenter.dz'],
            ['name' => 'Fatima Meziane',   'email' => 'fatima@callcenter.dz'],
            ['name' => 'Yacine Boukhari', 'email' => 'yacine@callcenter.dz'],
        ];

        foreach ($agentData as $data) {
            $agents[] = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => 'agent123',
                    'role'      => 'agent',
                    'is_active' => true,
                ]
            );
        }

        // ── 3. Create Sample Orders ──────────────────────────────────
        $wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou', 'Sétif', 'Béjaïa', 'Tlemcen', 'Batna'];
        $products = [
            ['name' => 'Smartphone Samsung Galaxy A54', 'price' => 65000],
            ['name' => 'Chaussures Nike Air Max',        'price' => 12000],
            ['name' => 'Montre connectée Xiaomi',        'price' => 8500],
            ['name' => 'Écouteurs Bluetooth Sony',       'price' => 5500],
            ['name' => 'Tablette Lenovo Tab M10',        'price' => 42000],
            ['name' => 'Aspirateur Robot Xiaomi',        'price' => 28000],
            ['name' => 'Crème visage Bio',               'price' => 1800],
            ['name' => 'Set cuisine inoxydable',         'price' => 9000],
        ];
        $statuses = ['new', 'assigned', 'in_progress', 'confirmed', 'cancelled', 'postponed', 'not_reachable'];
        $firstNames = ['Mohamed', 'Fatima', 'Ahmed', 'Amina', 'Youcef', 'Nadia', 'Karim', 'Samia', 'Rachid', 'Assia'];
        $lastNames  = ['Boudiaf', 'Benali', 'Hamidi', 'Zerrouki', 'Saidi', 'Mekki', 'Ould Ali', 'Djaafri', 'Meziane', 'Kermiche'];

        for ($i = 0; $i < 60; $i++) {
            $product  = $products[array_rand($products)];
            $qty      = rand(1, 3);
            $agent    = $agents[array_rand($agents)];
            $status   = $statuses[array_rand($statuses)];

            $order = Order::create([
                'customer_name'  => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                'customer_phone' => '0' . rand(5, 7) . rand(10000000, 99999999),
                'wilaya'         => $wilayas[array_rand($wilayas)],
                'commune'        => 'Centre',
                'address'        => rand(1, 99) . ' Rue ' . ['Didouche Mourad', 'Larbi Ben Mhidi', 'Ibn Khaldoun', 'Hassiba Benbouali'][array_rand(['Didouche Mourad', 'Larbi Ben Mhidi', 'Ibn Khaldoun', 'Hassiba Benbouali'])],
                'product_name'   => $product['name'],
                'quantity'       => $qty,
                'unit_price'     => $product['price'],
                'total_price'    => $product['price'] * $qty,
                'status'         => $status,
                'assigned_to'    => in_array($status, ['new']) ? null : $agent->id,
                'call_attempts'  => rand(0, 4),
                'notes'          => rand(0, 1) ? 'Appeler le matin.' : null,
            ]);

            // Add 1-3 call logs for non-new orders
            if ($status !== 'new' && $order->call_attempts > 0) {
                $results = ['answered', 'not_reachable', 'confirmed', 'cancelled', 'postponed'];
                for ($c = 0; $c < min($order->call_attempts, 3); $c++) {
                    CallLog::create([
                        'order_id'  => $order->id,
                        'agent_id'  => $agent->id,
                        'result'    => $results[array_rand($results)],
                        'notes'     => null,
                        'called_at' => now()->subHours(rand(1, 48)),
                    ]);
                }
            }
        }
    }
}
