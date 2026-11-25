<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Manual bKash (Send Money) fields on orders: the customer pays by hand to the
// shop's bKash number and submits the Transaction ID (TrxID) at checkout.
// Both columns are nullable — COD orders never set them — so this migration
// is safe to run on the live database.
return new class extends Migration {
    public function up(): void {
        Schema::table('orders', function (Blueprint $t) {
            if (!Schema::hasColumn('orders', 'bkash_sender_number')) {
                $t->string('bkash_sender_number')->nullable();
            }
            if (!Schema::hasColumn('orders', 'bkash_trxid')) {
                $t->string('bkash_trxid')->nullable();
            }
        });
    }

    public function down(): void {
        Schema::table('orders', function (Blueprint $t) {
            $t->dropColumn(['bkash_sender_number', 'bkash_trxid']);
        });
    }
};
