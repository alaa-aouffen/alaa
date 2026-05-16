<?php

return [
    'base_url' => env('ZR_EXPRESS_BASE_URL', 'https://api.zrexpress.app'),
    'token' => env('ZR_EXPRESS_TOKEN'),
    'tenant_id' => env('ZR_EXPRESS_TENANT_ID'),
    
    /*
    |--------------------------------------------------------------------------
    | Order Mapping
    |--------------------------------------------------------------------------
    |
    | Map ZR Express API keys to your Order model attributes.
    |
    */
    'mapping' => [
        'customer_name'  => 'customer_name',
        'customer_phone' => 'customer_phone',
        'wilaya'         => 'wilaya',
        'commune'        => 'commune',
        'address'        => 'address',
        'product'        => 'product_name',
        'price'          => 'total_price',
    ],
];
