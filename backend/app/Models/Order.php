<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_phone',
        'wilaya',
        'commune',
        'address',
        'product_name',
        'quantity',
        'unit_price',
        'total_price',
        'status',
        'assigned_to',
        'notes',
        'call_attempts',
        'ayor_order_id',
        'category_id',
        'tracking_number',
        'shipping_company',
        'shipping_status',
        'delivery_type',
        'stopdesk_id',
        'postponed_date',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
        'call_attempts' => 'integer',
        'category_id' => 'integer',
        'postponed_date' => 'date',
    ];

    // Relationships
    public function agent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function callLogs()
    {
        return $this->hasMany(CallLog::class);
    }
}
