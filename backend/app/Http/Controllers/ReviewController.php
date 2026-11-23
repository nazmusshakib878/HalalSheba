<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ReviewController extends Controller {
    public function create(Request $r) {
        $d=$r->validate(['reference'=>'required|uuid','phone'=>'required|string','product_id'=>'required|integer','author'=>'required|string|max:255','rating'=>'required|integer|between:1,5','comment'=>'required|string|max:4000']);
        $order=DB::table('orders')->join('customers','customers.id','=','orders.customer_id')->where('reference',$d['reference'])->where('phone',$d['phone'])->where('orders.status','delivered')->select('orders.id')->first();
        abort_unless($order,422,'A delivered order and matching phone number are required.');
        abort_unless(DB::table('order_items')->join('variants','variants.id','=','order_items.variant_id')->where('order_id',$order->id)->where('variants.product_id',$d['product_id'])->exists(),422,'This product was not in the order.');
        abort_if(DB::table('reviews')->where('order_id',$order->id)->where('product_id',$d['product_id'])->exists(),422,'You already reviewed this purchase.');
        DB::table('reviews')->insert(['order_id'=>$order->id,'product_id'=>$d['product_id'],'author'=>$d['author'],'rating'=>$d['rating'],'comment'=>$d['comment'],'created_at'=>now(),'updated_at'=>now()]);
        return ['message'=>'Thank you. Your review is awaiting approval.'];
    }
}
