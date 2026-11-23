<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('admin');
            $t->boolean('active')->default(true);
        });
        foreach (['categories', 'brands'] as $table) {
            Schema::create($table, function (Blueprint $t) use ($table) {
                $t->id(); $t->string('name'); $t->string('slug')->unique();
                $t->string('image')->nullable(); $t->boolean('active')->default(true);
                $t->unsignedInteger('sort_order')->default(0);
                if ($table === 'categories') $t->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
                $t->timestamps(); $t->softDeletes();
            });
        }
        Schema::create('products', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('name_en')->nullable(); $t->string('slug')->unique();
            $t->foreignId('category_id')->constrained(); $t->foreignId('brand_id')->nullable()->constrained();
            $t->text('short_description')->nullable(); $t->text('description')->nullable();
            $t->json('features')->nullable(); $t->json('images')->nullable(); $t->json('tags')->nullable();
            $t->json('legacy')->nullable(); $t->string('origin')->nullable(); $t->text('storage_instructions')->nullable();
            $t->string('seo_title')->nullable(); $t->text('seo_description')->nullable();
            $t->boolean('active')->default(true); $t->boolean('featured')->default(false);
            $t->boolean('bestseller')->default(false); $t->boolean('new_arrival')->default(false);
            $t->timestamps(); $t->softDeletes(); $t->index(['active', 'category_id']);
        });
        Schema::create('variants', function (Blueprint $t) {
            $t->id(); $t->foreignId('product_id')->constrained(); $t->string('name'); $t->string('sku')->unique();
            $t->unsignedBigInteger('price'); $t->unsignedBigInteger('regular_price')->nullable();
            $t->unsignedBigInteger('cost')->default(0); $t->unsignedInteger('physical')->default(0);
            $t->unsignedInteger('reserved')->default(0); $t->unsignedInteger('low_stock_threshold')->default(5);
            $t->unsignedInteger('received')->default(0); $t->unsignedInteger('sold')->default(0);
            $t->timestamp('restocked_at')->nullable(); $t->string('image')->nullable(); $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('customers', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('phone')->unique(); $t->string('email')->nullable();
            $t->text('address'); $t->text('notes')->nullable(); $t->boolean('vip')->default(false);
            $t->string('status')->default('active'); $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id(); $t->uuid('reference')->unique(); $t->uuid('idempotency_key')->unique();
            $t->foreignId('customer_id')->constrained(); $t->string('status')->default('new')->index();
            $t->string('payment_status')->default('unpaid'); $t->string('payment_method')->default('cod');
            $t->string('source')->default('web'); $t->text('address'); $t->string('district'); $t->text('note')->nullable();
            $t->unsignedBigInteger('subtotal'); $t->unsignedBigInteger('discount')->default(0);
            $t->unsignedBigInteger('delivery_charge')->default(0); $t->unsignedBigInteger('delivery_cost')->default(0);
            $t->unsignedBigInteger('total'); $t->unsignedBigInteger('refunded_amount')->default(0);
            $t->string('stock_state')->default('reserved'); $t->string('courier')->nullable();
            $t->string('tracking_number')->nullable(); $t->timestamps();
        });
        Schema::create('order_items', function (Blueprint $t) {
            $t->id(); $t->foreignId('order_id')->constrained(); $t->foreignId('variant_id')->constrained();
            $t->string('name'); $t->string('variant'); $t->string('sku'); $t->unsignedInteger('quantity');
            $t->unsignedBigInteger('price'); $t->unsignedBigInteger('cost'); $t->timestamps();
        });
        Schema::create('inventory_transactions', function (Blueprint $t) {
            $t->id(); $t->foreignId('variant_id')->constrained(); $t->foreignId('user_id')->nullable()->constrained();
            $t->foreignId('order_id')->nullable()->constrained(); $t->string('type'); $t->integer('quantity');
            $t->unsignedInteger('previous_stock'); $t->unsignedInteger('updated_stock'); $t->text('reason');
            $t->string('supplier')->nullable(); $t->string('batch')->nullable(); $t->date('expires_at')->nullable();
            $t->date('received_at')->nullable(); $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->nullable()->constrained(); $t->string('action');
            $t->string('entity'); $t->unsignedBigInteger('entity_id')->nullable(); $t->json('changes')->nullable(); $t->timestamps();
        });
        Schema::create('coupons', function (Blueprint $t) {
            $t->id(); $t->string('code')->unique(); $t->string('type'); $t->unsignedInteger('value');
            $t->unsignedBigInteger('minimum')->default(0); $t->unsignedInteger('usage_limit')->nullable();
            $t->unsignedInteger('used')->default(0); $t->timestamp('expires_at')->nullable();
            $t->foreignId('product_id')->nullable()->constrained(); $t->foreignId('category_id')->nullable()->constrained();
            $t->boolean('active')->default(true); $t->timestamps();
        });
        Schema::create('settings', function (Blueprint $t) { $t->string('key')->primary(); $t->json('value'); $t->timestamps(); });
        Schema::create('content_pages', function (Blueprint $t) {
            $t->id(); $t->string('slug')->unique(); $t->string('title'); $t->text('body');
            $t->boolean('active')->default(true); $t->timestamps();
        });
        Schema::create('reviews', function (Blueprint $t) {
            $t->id(); $t->foreignId('product_id')->constrained(); $t->foreignId('order_id')->constrained();
            $t->string('author'); $t->unsignedTinyInteger('rating'); $t->text('comment'); $t->json('images')->nullable();
            $t->string('status')->default('pending'); $t->text('reply')->nullable(); $t->timestamps();
            $t->unique(['product_id', 'order_id']);
        });
    }
    public function down(): void {
        foreach (['reviews','content_pages','settings','coupons','audit_logs','inventory_transactions','order_items','orders','customers','variants','products','brands','categories'] as $table) Schema::dropIfExists($table);
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['role','active']));
    }
};
