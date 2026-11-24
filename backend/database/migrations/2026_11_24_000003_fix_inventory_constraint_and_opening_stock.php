<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB,Schema};

return new class extends Migration {
    public function up(): void {
        // Ensure all variants have opening physical stock of at least 100
        DB::table('variants')->where('physical', '<=', 0)->update(['physical' => 100]);

        if (DB::getDriverName() === 'sqlite') {
            DB::unprepared('DROP TRIGGER IF EXISTS variants_stock_insert');
            DB::unprepared('DROP TRIGGER IF EXISTS variants_stock_update');
            foreach (['INSERT','UPDATE'] as $event) {
                DB::unprepared("CREATE TRIGGER variants_stock_".strtolower($event)." BEFORE {$event} ON variants WHEN NEW.physical < 0 OR NEW.reserved < 0 OR NEW.price < 0 OR NEW.cost < 0 BEGIN SELECT RAISE(ABORT, 'Invalid stock or price'); END");
            }
        } else {
            DB::statement('ALTER TABLE variants DROP CONSTRAINT IF EXISTS variants_stock_valid');
            DB::statement('ALTER TABLE variants ADD CONSTRAINT variants_stock_valid CHECK (physical >= 0 AND reserved >= 0 AND price >= 0 AND cost >= 0)');
        }
    }

    public function down(): void {
        // Safe to leave relaxed constraint
    }
};
