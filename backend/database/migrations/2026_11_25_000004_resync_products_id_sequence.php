<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Heal the products_id_seq desync left by catalog:import, which seeded
        // products with explicit IDs (1-32) without advancing the sequence.
        // Every new product create then collided on the primary key (id=1)
        // and failed with HTTP 500, while updates kept working.
        // COALESCE keeps this safe on an empty products table (next id = 1).
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }
        DB::statement("SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0))");
    }

    public function down(): void {
        // Nothing to undo: resyncing the sequence is a one-way heal.
    }
};
