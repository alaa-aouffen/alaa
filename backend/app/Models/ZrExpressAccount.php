<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZrExpressAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tenant_id',
        'token',
        'is_active',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'zr_express_account_id');
    }
}
