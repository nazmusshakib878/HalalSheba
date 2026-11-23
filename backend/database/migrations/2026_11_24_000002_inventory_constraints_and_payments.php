<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB,Schema};
return new class extends Migration {
    public function up():void {
        if(DB::getDriverName()==='sqlite') {
            foreach(['INSERT','UPDATE'] as $event) DB::unprepared("CREATE TRIGGER variants_stock_".strtolower($event)." BEFORE {$event} ON variants WHEN NEW.physical < 0 OR NEW.reserved < 0 OR NEW.reserved > NEW.physical OR NEW.price < 0 OR NEW.cost < 0 BEGIN SELECT RAISE(ABORT, 'Invalid stock or price'); END");
        } else DB::statement('ALTER TABLE variants ADD CONSTRAINT variants_stock_valid CHECK (physical >= 0 AND reserved >= 0 AND physical >= reserved AND price >= 0 AND cost >= 0)');
        Schema::create('payments',function(Blueprint $t){$t->id();$t->foreignId('order_id')->constrained();$t->foreignId('user_id')->nullable()->constrained();$t->string('type');$t->unsignedBigInteger('amount');$t->string('method');$t->text('reference');$t->timestamps();$t->unique(['order_id','type']);});
    }
    public function down():void {
        Schema::dropIfExists('payments');
        if(DB::getDriverName()==='sqlite') {DB::unprepared('DROP TRIGGER IF EXISTS variants_stock_insert');DB::unprepared('DROP TRIGGER IF EXISTS variants_stock_update');}
        else DB::statement('ALTER TABLE variants DROP CONSTRAINT variants_stock_valid');
    }
};
