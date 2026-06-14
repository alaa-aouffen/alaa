<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'keywords',
        'user_id',
        'zr_express_account_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function zrExpressAccount()
    {
        return $this->belongsTo(ZrExpressAccount::class, 'zr_express_account_id');
    }
}
