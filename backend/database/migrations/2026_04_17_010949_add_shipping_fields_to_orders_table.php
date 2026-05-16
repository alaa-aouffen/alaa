<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('ayor_order_id');
            $table->string('shipping_company')->nullable()->after('tracking_number');
            $table->string('shipping_status')->nullable()->after('shipping_company');
        });

        // Update ENUM values to include 'shipped'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('new', 'assigned', 'in_progress', 'confirmed', 'cancelled', 'postponed', 'not_reachable', 'delivered', 'returned', 'shipped') DEFAULT 'new'");
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'shipping_company', 'shipping_status']);
        });

        // Revert ENUM values (CAUTION: 'shipped' orders will lose status if reverted)
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('new', 'assigned', 'in_progress', 'confirmed', 'cancelled', 'postponed', 'not_reachable', 'delivered', 'returned') DEFAULT 'new'");
    }
};
