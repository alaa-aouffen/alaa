<?php

namespace App\Helpers;

/**
 * WilayaHelper
 *
 * Provides a canonical mapping of all 58 Algerian wilayas.
 * Handles Arabic names, French names with/without accents, and
 * all known spelling variations from Ayor and other sources.
 *
 * Values are the EXACT names used by ZR Express API.
 */
class WilayaHelper
{
    /**
     * Normalize a wilaya name to match ZR Express canonical name.
     * Returns the canonical name if found, otherwise the original trimmed name.
     */
    public static function normalize(string $name): string
    {
        $map = self::getMap();
        $lower = mb_strtolower(trim($name), 'UTF-8');
        return $map[$lower] ?? trim($name);
    }

    /**
     * Returns the full mapping: lowercase variant => canonical ZR Express name
     */
    public static function getMap(): array
    {
        return [
            // W01 - Adrar
            'adrar'                     => 'Adrar',
            "\u0627\u062f\u0631\u0627\u0631" => 'Adrar',

            // W02 - Chlef
            'chlef'                     => 'Chlef',
            'chelif'                    => 'Chlef',
            'el asnam'                  => 'Chlef',
            "\u0627\u0644\u0634\u0644\u0641" => 'Chlef',

            // W03 - Laghouat
            'laghouat'                  => 'Laghouat',
            'el aghouat'                => 'Laghouat',
            "\u0627\u0644\u0623\u063a\u0648\u0627\u0637" => 'Laghouat',

            // W04 - Oum El Bouaghi
            'oum el bouaghi'            => 'Oum El Bouaghi',
            'oum el baoughi'            => 'Oum El Bouaghi',
            'oum bouaghi'               => 'Oum El Bouaghi',
            'oum-el-bouaghi'            => 'Oum El Bouaghi',
            "\u0627\u0645 \u0627\u0644\u0628\u0648\u0627\u0642\u064a" => 'Oum El Bouaghi',

            // W05 - Batna
            'batna'                     => 'Batna',
            "\u0628\u0627\u062a\u0646\u0629" => 'Batna',

            // W06 - Bejaia
            'bejaia'                    => 'Bejaia',
            'béjaïa'                    => 'Bejaia',
            'bejaiah'                   => 'Bejaia',
            'bgayet'                    => 'Bejaia',
            'bijaya'                    => 'Bejaia',
            "\u0628\u062c\u0627\u064a\u0629" => 'Bejaia',

            // W07 - Biskra
            'biskra'                    => 'Biskra',
            "\u0628\u0633\u0643\u0631\u0629" => 'Biskra',

            // W08 - Bechar
            'bechar'                    => 'Bechar',
            'béchar'                    => 'Bechar',
            "\u0628\u0634\u0627\u0631" => 'Bechar',

            // W09 - Blida
            'blida'                     => 'Blida',
            "\u0627\u0644\u0628\u0644\u064a\u062f\u0629" => 'Blida',

            // W10 - Bouira
            'bouira'                    => 'Bouira',
            'bouïra'                    => 'Bouira',
            "\u0627\u0644\u0628\u0648\u064a\u0631\u0629" => 'Bouira',

            // W11 - Tamanrasset (all variations of this famous typo)
            'tamanrasset'               => 'Tamanrasset',
            'tamanghasset'              => 'Tamanrasset',
            'tamangaset'                => 'Tamanrasset',
            'tamanghassset'             => 'Tamanrasset',
            'tamenhgast'                => 'Tamanrasset',
            'tamenghest'                => 'Tamanrasset',
            "\u062a\u0645\u0646\u0631\u0627\u0633\u062a" => 'Tamanrasset',

            // W12 - Tebessa
            'tebessa'                   => 'Tebessa',
            'tébessa'                   => 'Tebessa',
            'tibessa'                   => 'Tebessa',
            "\u062a\u0628\u0633\u0629" => 'Tebessa',

            // W13 - Tlemcen
            'tlemcen'                   => 'Tlemcen',
            'tilimsen'                  => 'Tlemcen',
            "\u062a\u0644\u0645\u0633\u0627\u0646" => 'Tlemcen',

            // W14 - Tiaret
            'tiaret'                    => 'Tiaret',
            "\u062a\u064a\u0627\u0631\u062a" => 'Tiaret',

            // W15 - Tizi Ouzou
            'tizi ouzou'                => 'Tizi Ouzou',
            'tizi-ouzou'                => 'Tizi Ouzou',
            'tizi wezzu'                => 'Tizi Ouzou',
            "\u062a\u064a\u0632\u064a \u0648\u0632\u0648" => 'Tizi Ouzou',

            // W16 - Alger
            'alger'                     => 'Alger',
            'algiers'                   => 'Alger',
            'alger centre'              => 'Alger',
            "\u0627\u0644\u062c\u0632\u0627\u0626\u0631" => 'Alger',

            // W17 - Djelfa
            'djelfa'                    => 'Djelfa',
            "\u0627\u0644\u062c\u0644\u0641\u0629" => 'Djelfa',

            // W18 - Jijel
            'jijel'                     => 'Jijel',
            "\u062c\u064a\u062c\u0644" => 'Jijel',

            // W19 - Setif
            'setif'                     => 'Setif',
            'sétif'                     => 'Setif',
            'stif'                      => 'Setif',
            "\u0633\u0637\u064a\u0641" => 'Setif',

            // W20 - Saida
            'saida'                     => 'Saida',
            'saïda'                     => 'Saida',
            "\u0633\u0639\u064a\u062f\u0629" => 'Saida',

            // W21 - Skikda
            'skikda'                    => 'Skikda',
            "\u0633\u0643\u064a\u0643\u062f\u0629" => 'Skikda',

            // W22 - Sidi Bel Abbes
            'sidi bel abbes'            => 'Sidi Bel Abbes',
            'sidi bel abbès'            => 'Sidi Bel Abbes',
            'sidi bel-abbes'            => 'Sidi Bel Abbes',
            'sidi belabbes'             => 'Sidi Bel Abbes',
            "\u0633\u064a\u062f\u064a \u0628\u0644\u0639\u0628\u0627\u0633" => 'Sidi Bel Abbes',

            // W23 - Annaba
            'annaba'                    => 'Annaba',
            "\u0639\u0646\u0627\u0628\u0629" => 'Annaba',

            // W24 - Guelma
            'guelma'                    => 'Guelma',
            "\u0642\u0627\u0644\u0645\u0629" => 'Guelma',

            // W25 - Constantine
            'constantine'               => 'Constantine',
            "\u0642\u0633\u0646\u0637\u064a\u0646\u0629" => 'Constantine',

            // W26 - Medea
            'medea'                     => 'Medea',
            'médéa'                     => 'Medea',
            "\u0627\u0644\u0645\u062f\u064a\u0629" => 'Medea',

            // W27 - Mostaganem
            'mostaganem'                => 'Mostaganem',
            "\u0645\u0633\u062a\u063a\u0627\u0646\u0645" => 'Mostaganem',

            // W28 - MSila
            'msila'                     => 'MSila',
            "m'sila"                    => 'MSila',
            'm sila'                    => 'MSila',
            "\u0627\u0644\u0645\u0633\u064a\u0644\u0629" => 'MSila',

            // W29 - Mascara
            'mascara'                   => 'Mascara',
            "\u0645\u0639\u0633\u0643\u0631" => 'Mascara',

            // W30 - Ouargla
            'ouargla'                   => 'Ouargla',
            'wargla'                    => 'Ouargla',
            "\u0648\u0631\u0642\u0644\u0629" => 'Ouargla',

            // W31 - Oran
            'oran'                      => 'Oran',
            "\u0648\u0647\u0631\u0627\u0646" => 'Oran',

            // W32 - El Bayadh
            'el bayadh'                 => 'El Bayadh',
            'el-bayadh'                 => 'El Bayadh',
            "\u0627\u0644\u0628\u064a\u0636" => 'El Bayadh',

            // W33 - Illizi
            'illizi'                    => 'Illizi',
            "\u0625\u0644\u064a\u0632\u064a" => 'Illizi',

            // W34 - Bordj Bou Arreridj
            'bordj bou arreridj'        => 'Bordj Bou Arreridj',
            'bordj bou arréridj'        => 'Bordj Bou Arreridj',
            'bordj bouarreridj'         => 'Bordj Bou Arreridj',
            'bba'                       => 'Bordj Bou Arreridj',
            "\u0628\u0631\u062c \u0628\u0648\u0639\u0631\u064a\u0631\u064a\u062c" => 'Bordj Bou Arreridj',

            // W35 - Boumerdes
            'boumerdes'                 => 'Boumerdes',
            'boumerdès'                 => 'Boumerdes',
            'boumerdas'                 => 'Boumerdes',
            "\u0628\u0648\u0645\u0631\u062f\u0627\u0633" => 'Boumerdes',

            // W36 - El Tarf
            'el tarf'                   => 'El Tarf',
            "\u0627\u0644\u0637\u0627\u0631\u0641" => 'El Tarf',

            // W37 - Tindouf
            'tindouf'                   => 'Tindouf',
            "\u062a\u0646\u062f\u0648\u0641" => 'Tindouf',

            // W38 - Tissemsilt
            'tissemsilt'                => 'Tissemsilt',
            "\u062a\u064a\u0633\u0645\u0633\u064a\u0644\u062a" => 'Tissemsilt',

            // W39 - El Oued
            'el oued'                   => 'El Oued',
            'eloued'                    => 'El Oued',
            "\u0627\u0644\u0648\u0627\u062f\u064a" => 'El Oued',

            // W40 - Khenchela
            'khenchela'                 => 'Khenchela',
            "\u062e\u0646\u0634\u0644\u0629" => 'Khenchela',

            // W41 - Souk Ahras
            'souk ahras'                => 'Souk Ahras',
            "\u0633\u0648\u0642 \u0623\u0647\u0631\u0627\u0633" => 'Souk Ahras',

            // W42 - Tipaza
            'tipaza'                    => 'Tipaza',
            'tipasa'                    => 'Tipaza',
            "\u062a\u064a\u0628\u0627\u0632\u0629" => 'Tipaza',

            // W43 - Mila
            'mila'                      => 'Mila',
            "\u0645\u064a\u0644\u0629" => 'Mila',

            // W44 - Ain Defla
            'ain defla'                 => 'Ain Defla',
            'aïn defla'                 => 'Ain Defla',
            'ain-defla'                 => 'Ain Defla',
            "\u0639\u064a\u0646 \u0627\u0644\u062f\u0641\u0644\u0649" => 'Ain Defla',

            // W45 - Naama
            'naama'                     => 'Naama',
            "\u0627\u0644\u0646\u0639\u0627\u0645\u0629" => 'Naama',

            // W46 - Ain Temouchent
            'ain temouchent'            => 'Ain Temouchent',
            'aïn témouchent'            => 'Ain Temouchent',
            'ain-temouchent'            => 'Ain Temouchent',
            'ain temouchen'             => 'Ain Temouchent',
            "\u0639\u064a\u0646 \u062a\u064a\u0645\u0648\u0634\u0646\u062a" => 'Ain Temouchent',

            // W47 - Ghardaia
            'ghardaia'                  => 'Ghardaia',
            'ghardaïa'                  => 'Ghardaia',
            "\u063a\u0631\u062f\u0627\u064a\u0629" => 'Ghardaia',

            // W48 - Relizane
            'relizane'                  => 'Relizane',
            "\u063a\u0644\u064a\u0632\u0627\u0646" => 'Relizane',

            // W49 - Timimoun (new wilaya)
            'timimoun'                  => 'Timimoun',
            "\u062a\u064a\u0645\u064a\u0645\u0648\u0646" => 'Timimoun',

            // W50 - Bordj Badji Mokhtar
            'bordj badji mokhtar'       => 'Bordj Badji Mokhtar',
            'bordj baji mokhtar'        => 'Bordj Badji Mokhtar',
            "\u0628\u0631\u062c \u0628\u0627\u062c\u064a \u0645\u062e\u062a\u0627\u0631" => 'Bordj Badji Mokhtar',

            // W51 - Ouled Djellal
            'ouled djellal'             => 'Ouled Djellal',
            "\u0623\u0648\u0644\u0627\u062f \u062c\u0644\u0627\u0644" => 'Ouled Djellal',

            // W52 - Beni Abbes
            'beni abbes'                => 'Beni Abbes',
            'béni abbès'                => 'Beni Abbes',
            "\u0628\u0646\u064a \u0639\u0628\u0627\u0633" => 'Beni Abbes',

            // W53 - In Salah
            'in salah'                  => 'In Salah',
            'ain salah'                 => 'In Salah',
            "\u0639\u064a\u0646 \u0635\u0627\u0644\u062d" => 'In Salah',

            // W54 - In Guezzam
            'in guezzam'                => 'In Guezzam',
            "\u0639\u064a\u0646 \u0642\u0632\u0627\u0645" => 'In Guezzam',

            // W55 - Touggourt
            'touggourt'                 => 'Touggourt',
            "\u062a\u0642\u0631\u062a" => 'Touggourt',

            // W56 - Djanet
            'djanet'                    => 'Djanet',
            "\u062c\u0627\u0646\u062a" => 'Djanet',

            // W57 - El Meghaier
            'el meghaier'               => 'El Meghaier',
            "el m'ghair"                => 'El Meghaier',
            'el mghair'                 => 'El Meghaier',
            "\u0627\u0644\u0645\u063a\u064a\u0631" => 'El Meghaier',

            // W58 - El Meniaa
            'el meniaa'                 => 'El Meniaa',
            'el menia'                  => 'El Meniaa',
            "\u0627\u0644\u0645\u0646\u064a\u0639\u0629" => 'El Meniaa',
        ];
    }
}
