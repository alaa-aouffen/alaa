<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // Customer info
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('wilaya'); // Algerian province
            $table->string('commune')->nullable();
            $table->text('address')->nullable();
            // Product info
            $table->string('product_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            // Order management
            $table->enum('status', [
                'new',
                'assigned',
                'in_progress',
                'confirmed',
                'cancelled',
                'postponed',
                'not_reachable',
                'delivered',
                'returned'
            ])->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->integer('call_attempts')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
