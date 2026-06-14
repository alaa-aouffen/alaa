<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Remove from users
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['zr_express_account_id']);
            $table->dropColumn('zr_express_account_id');
        });

        // 2. Add to categories
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('zr_express_account_id')->nullable()->constrained('zr_express_accounts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Remove from categories
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['zr_express_account_id']);
            $table->dropColumn('zr_express_account_id');
        });

        // 2. Add back to users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('zr_express_account_id')->nullable()->constrained('zr_express_accounts')->nullOnDelete();
        });
    }
};
