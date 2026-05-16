<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'zr_express_account_id',
    ];

    public function zrExpressAccount()
    {
        return $this->belongsTo(ZrExpressAccount::class, 'zr_express_account_id');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // JWT required
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relationships
    public function assignedOrders()
    {
        return $this->hasMany(Order::class, 'assigned_to');
    }

    public function callLogs()
    {
        return $this->hasMany(CallLog::class, 'agent_id');
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    public function assignRole($role)
    {
        // Simple role check for testing, could use Spatie permissions
        $this->role = $role;
        $this->save();
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
