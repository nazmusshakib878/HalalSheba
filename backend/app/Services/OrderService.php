<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use App\Models\User;
class OrderService {
    public function place(array $d): object {
        return DB::transaction(function() use($d) {
            $cust=DB::table('customers')->where('phone',$d['phone'])->first();
            $cid=$cust?$cust->id:DB::table('customers')->insertGetId([
                'name'=>$d['name'],'phone'=>$d['phone'],'address'=>$d['address'],'district'=>$d['district']??null,
                'created_at'=>now(),'updated_at'=>now()
            ]);
            $subtotal=0; $items=[]; $quoteItems=[];
            foreach($d['items'] as $item) {
                $v=DB::table('variants')->where('id',$item['variant_id'])->where('active',true)->first();
                abort_unless($v,422,'Product variant unavailable.');
                $qty=(int)$item['quantity']; abort_unless($qty>0,422,'Quantity must be positive.');
                $subtotal+=$v->price*$qty;
                $items[]=['variant'=>$v,'quantity'=>$qty];
                $quoteItems[]=['price'=>$v->price,'quantity'=>$qty];
            }
            $calc=app(PricingService::class)->calculate([
                'items'=>$quoteItems,'district'=>$d['district']??'Dhaka','payment_method'=>$d['payment_method'],'coupon'=>$d['coupon']??null
            ]);
            $oid=DB::table('orders')->insertGetId([
                'reference'=>(string)\Illuminate\Support\Str::uuid(),'idempotency_key'=>$d['idempotency_key'],
                'customer_id'=>$cid,'status'=>'new','payment_status'=>'unpaid','payment_method'=>$d['payment_method'],
                'source'=>$d['source']??'web','address'=>$d['address'],'district'=>$d['district']??'Dhaka','note'=>$d['note']??null,
                'subtotal'=>$calc['subtotal'],'discount'=>$calc['discount'],'delivery_charge'=>$calc['delivery_charge'],
                'delivery_cost'=>0,'total'=>$calc['total'],'refunded_amount'=>0,'stock_state'=>'reserved',
                'created_at'=>now(),'updated_at'=>now()
            ]);
            foreach($items as $i) {
                $v=$i['variant']; $qty=$i['quantity'];
                $p=DB::table('products')->find($v->product_id);
                DB::table('variants')->where('id',$v->id)->increment('reserved',$qty);
                DB::table('order_items')->insert([
                    'order_id'=>$oid,'product_id'=>$v->product_id,'variant_id'=>$v->id,'name'=>$p->name,
                    'variant'=>$v->name,'sku'=>$v->sku,'quantity'=>$qty,'price'=>$v->price,'cost'=>$v->cost,'created_at'=>now(),'updated_at'=>now()
                ]);
                app(InventoryService::class)->record($v,0,'reserve',"Reserved {$qty} units",$oid);
            }
            Audit::record('order.create','order',$oid);
            return DB::table('orders')->find($oid);
        },3);
    }
    public function transition(int $id,array $d): object {
        return DB::transaction(function() use($id,$d) {
            $o=DB::table('orders')->lockForUpdate()->find($id); abort_unless($o,404);
            $next=$d['status'];
            $allStatuses=['new','pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded'];
            abort_unless(in_array($next,$allStatuses),422,'Invalid order status.');
            $state=$o->stock_state;
            foreach(DB::table('order_items')->where('order_id',$id)->orderBy('variant_id')->get() as $item) {
                $v=DB::table('variants')->lockForUpdate()->find($item->variant_id); $delta=0;
                if(in_array($next,['shipped','out_for_delivery','delivered']) && $o->stock_state==='reserved') {
                    $delta=-$item->quantity; $state='consumed';
                    DB::table('variants')->where('id',$v->id)->update([
                        'reserved'=>max(0,$v->reserved-$item->quantity),
                        'physical'=>max(0,$v->physical-$item->quantity),
                        'sold'=>$v->sold+$item->quantity
                    ]);
                } elseif($next==='cancelled' && $o->stock_state==='reserved') {
                    $state='released';
                    DB::table('variants')->where('id',$v->id)->update([
                        'reserved'=>max(0,$v->reserved-$item->quantity)
                    ]);
                } elseif($next==='returned' && $o->stock_state==='consumed') {
                    $delta=$item->quantity; $state='restored';
                    DB::table('variants')->where('id',$v->id)->update([
                        'physical'=>$v->physical+$item->quantity,
                        'sold'=>max(0,$v->sold-$item->quantity)
                    ]);
                }
                if($state!==$o->stock_state) app(InventoryService::class)->record($v,$delta,$next,$d['reason']??'Status updated by Admin',$id);
            }
            $update=['status'=>$next,'stock_state'=>$state,'updated_at'=>now()];
            foreach(['courier','tracking_number','delivery_cost'] as $key) if(array_key_exists($key,$d)) $update[$key]=$d[$key];
            if(isset($d['payment_status'])) {
                abort_unless(in_array($d['payment_status'],['unpaid','paid']),422);
                $update['payment_status']=$d['payment_status'];
            }
            if($next==='refunded') {
                $update['payment_status']='refunded'; $update['refunded_amount']=$o->total;
            }
            DB::table('orders')->where('id',$id)->update($update);
            if(($update['payment_status']??null)==='paid' && $o->payment_status!=='paid') {
                DB::table('payments')->insert([
                    'order_id'=>$id,'user_id'=>auth()->id(),'type'=>'receipt','amount'=>$o->total,
                    'method'=>$o->payment_method,'reference'=>$d['reason']??'Cash on Delivery',
                    'created_at'=>now(),'updated_at'=>now()
                ]);
            }
            Audit::record('order.update','order',$id,['status'=>$next,'reason'=>$d['reason']??null]);
            return DB::table('orders')->find($id);
        },3);
    }
}
