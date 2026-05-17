<?php

namespace Database\Seeders;

use App\Models\DeliveryFee;
use Illuminate\Database\Seeder;

class DeliveryFeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fees = [
            '01' => ['Adrar', 1350, 970],
            '02' => ['Chlef', 700, 520],
            '03' => ['Laghouat', 900, 670],
            '04' => ['Oum El Bouaghi', 750, 520],
            '05' => ['Batna', 750, 520],
            '06' => ['Bejaia', 750, 520],
            '07' => ['Biskra', 900, 670],
            '08' => ['Bechar', 1050, 720],
            '09' => ['Blida', 700, 520],
            '10' => ['Bouira', 700, 520],
            '11' => ['Tamanrasset', 1550, 1120],
            '12' => ['Tebessa', 800, 520],
            '13' => ['Tlemcen', 800, 570],
            '14' => ['Tiaret', 750, 520],
            '15' => ['Tizi Ouzou', 700, 520],
            '16' => ['Alger', 450, 420],
            '17' => ['Djelfa', 900, 670],
            '18' => ['Jijel', 750, 520],
            '19' => ['Setif', 700, 520],
            '20' => ['Saida', 750, 570],
            '21' => ['Skikda', 750, 520],
            '22' => ['Sidi Bel Abbes', 750, 520],
            '23' => ['Annaba', 750, 520],
            '24' => ['Guelma', 750, 520],
            '25' => ['Constantine', 750, 520],
            '26' => ['Medea', 700, 520],
            '27' => ['Mostaganem', 750, 520],
            '28' => ['MSila', 800, 570],
            '29' => ['Mascara', 750, 520],
            '30' => ['Ouargla', 900, 670],
            '31' => ['Oran', 750, 520],
            '32' => ['El Bayadh', 1050, 670],
            '33' => ['Illizi', 1550, 1120],
            '34' => ['Bordj Bou Arreridj', 700, 520],
            '35' => ['Boumerdes', 700, 520],
            '36' => ['El Tarf', 750, 520],
            '37' => ['Tindouf', 1550, 1120],
            '38' => ['Tissemsilt', 750, 520],
            '39' => ['El Oued', 900, 670],
            '40' => ['Khenchela', 750, 520],
            '41' => ['Souk Ahras', 750, 520],
            '42' => ['Tipaza', 400, 300],
            '43' => ['Mila', 750, 520],
            '44' => ['Ain Defla', 700, 520],
            '45' => ['Naama', 1050, 670],
            '46' => ['Ain Temouchent', 750, 520],
            '47' => ['Ghardaia', 900, 670],
            '48' => ['Relizane', 750, 520],
            '49' => ['Timimoun', 1350, 970],
            '50' => ['Bordj Badji Mokhtar', 1550, 1120],
            '51' => ['Ouled Djellal', 900, 670],
            '52' => ['Beni Abbes', 1150, 970],
            '53' => ['In Salah', 1550, 1120],
            '54' => ['In Guezzam', 1550, 0],
            '55' => ['Touggourt', 900, 670],
            '56' => ['Djanet', 1550, 1120],
            '57' => ['El Meghair', 900, 0],
            '58' => ['El Menia', 950, 670]
        ];

        // Clear existing to avoid duplicates if names change
        \DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DeliveryFee::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1');

        foreach ($fees as $code => $data) {
            DeliveryFee::create([
                'wilaya_code' => $code,
                'wilaya_name' => $data[0],
                'home_fee' => $data[1],
                'desk_fee' => $data[2]
            ]);
        }
    }
}
