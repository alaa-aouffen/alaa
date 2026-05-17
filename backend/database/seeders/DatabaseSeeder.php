<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 0. Delivery Fees (58 wilayas algériennes) ─────────────────
        $this->call(DeliveryFeeSeeder::class);

        // ── 1. Admin ──────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@callcenter.dz'],
            [
                'name'      => 'Administrateur',
                'password'  => 'admin123',
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        // ── 2. Agents par défaut ───────────────────────────────────────
        $agentData = [
            ['name' => 'Amel Bensalem',   'email' => 'amel@callcenter.dz'],
            ['name' => 'Karim Ouadah',    'email' => 'karim@callcenter.dz'],
            ['name' => 'Fatima Meziane',  'email' => 'fatima@callcenter.dz'],
            ['name' => 'Yacine Boukhari', 'email' => 'yacine@callcenter.dz'],
        ];

        foreach ($agentData as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => 'agent123',
                    'role'      => 'agent',
                    'is_active' => true,
                ]
            );
        }

        // Les commandes, call logs et autres données de test
        // sont créées via l'interface de l'application.
    }
}
