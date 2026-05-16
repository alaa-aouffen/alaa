<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryFee extends Model
{
    protected $fillable = ['wilaya_name', 'wilaya_code', 'home_fee', 'desk_fee'];
}
