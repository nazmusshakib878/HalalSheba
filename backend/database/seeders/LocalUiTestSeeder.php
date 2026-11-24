<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LocalUiTestSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $category = DB::table('categories')->insertGetId(['name'=>'Test foods','slug'=>'test-foods','created_at'=>$now,'updated_at'=>$now]);
        $thinProduct = DB::table('products')->insertGetId(['name'=>'Test chui jhal','slug'=>'chui-jhal','category_id'=>$category,'active'=>true,'legacy'=>'{}','images'=>'[]','features'=>'[]','tags'=>'[]','created_at'=>$now,'updated_at'=>$now]);
        $thin = DB::table('variants')->insertGetId(['product_id'=>$thinProduct,'name'=>'Chikon','sku'=>'TEST-CHUI-THIN','price'=>80000,'cost'=>0,'physical'=>12,'reserved'=>0,'low_stock_threshold'=>5,'received'=>12,'active'=>true,'created_at'=>$now,'updated_at'=>$now]);
        $thick = DB::table('variants')->insertGetId(['product_id'=>$thinProduct,'name'=>'Mota','sku'=>'TEST-CHUI-THICK','price'=>120000,'cost'=>0,'physical'=>12,'reserved'=>0,'low_stock_threshold'=>5,'received'=>12,'active'=>true,'created_at'=>$now,'updated_at'=>$now]);
        DB::table('variants')->where('id',$thin)->update(['physical'=>4,'received'=>4]);
        $customer = DB::table('customers')->insertGetId(['name'=>'Fixture buyer','phone'=>'01876543210','address'=>'Test Road, Dhaka','created_at'=>$now,'updated_at'=>$now]);
        $this->order($customer,$thin,'new',2,160000,6000,166000);
        $this->order($customer,$thick,'delivered',1,120000,6000,126000,'paid');
        $this->order($customer,$thin,'delivered',3,300000,18000,318000,'paid',0);
        DB::table('settings')->insert(['key'=>'delivery','value'=>json_encode(['dhaka'=>6000,'outside'=>12000,'districts'=>['Dhaka'=>6000,'Satkhira'=>12000],'free_above'=>null]),'created_at'=>$now,'updated_at'=>$now]);
        DB::table('users')->insert(['name'=>'Local Fixture Admin','email'=>'local-admin@example.test','password'=>Hash::make('LocalTest!234'),'role'=>'super_admin','active'=>true,'created_at'=>$now,'updated_at'=>$now]);
    }

    private function order(int $customer,int $variant,string $status,int $quantity,int $subtotal,int $delivery,int $total,string $payment='unpaid',int $cost=0): void
    {
        $now=now();$v=DB::table('variants')->find($variant);$p=DB::table('products')->find($v->product_id);
        $id=DB::table('orders')->insertGetId(['reference'=>(string)Str::uuid(),'idempotency_key'=>(string)Str::uuid(),'customer_id'=>$customer,'status'=>$status,'payment_status'=>$payment,'payment_method'=>'cod','source'=>'web','address'=>'Test Road, Dhanmondi, Dhaka','district'=>'Dhaka','subtotal'=>$subtotal,'discount'=>0,'delivery_charge'=>$delivery,'delivery_cost'=>$cost,'delivery_cost_confirmed'=>null,'total'=>$total,'refunded_amount'=>0,'stock_state'=>'reserved','created_at'=>$now,'updated_at'=>$now]);
        DB::table('order_items')->insert(['order_id'=>$id,'variant_id'=>$variant,'name'=>$p->name,'variant'=>$v->name,'sku'=>$v->sku,'quantity'=>$quantity,'price'=>(int)round($subtotal/$quantity),'cost'=>0,'created_at'=>$now,'updated_at'=>$now]);
    }
}
