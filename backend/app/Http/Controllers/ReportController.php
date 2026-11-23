<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ReportController extends Controller {
    public function index(Request $r) {
        $r->validate(['from'=>'nullable|date','to'=>'nullable|date|after_or_equal:from']);
        $from=$r->input('from',now()->startOfMonth()->toDateString()); $to=$r->input('to',now()->toDateString());
        $orders=DB::table('orders')->whereDate('created_at','>=',$from)->whereDate('created_at','<=',$to)->get();
        $paid=$orders->where('payment_status','paid')->where('status','delivered');
        $items=DB::table('order_items')->whereIn('order_id',$paid->pluck('id'))->get();
        $cogs=$items->sum(fn($i)=>$i->cost*$i->quantity);
        $revenue=$paid->sum('subtotal')-$paid->sum('discount');
        $products=DB::table('products')->whereNull('deleted_at');
        $stock=DB::table('variants')->where('active',true)->get();
        return [
            'total_products'=>(clone $products)->count(),'active_products'=>(clone $products)->where('active',true)->count(),
            'inactive_products'=>(clone $products)->where('active',false)->count(),'total_stock'=>$stock->sum('physical'),
            'low_stock'=>$stock->filter(fn($v)=>$v->physical-$v->reserved>0 && $v->physical-$v->reserved<=$v->low_stock_threshold)->count(),
            'out_of_stock'=>$stock->filter(fn($v)=>$v->physical-$v->reserved===0)->count(),
            'today_orders'=>DB::table('orders')->whereDate('created_at',today())->count(),
            'pending_orders'=>DB::table('orders')->whereIn('status',['new','pending'])->count(),'customers'=>DB::table('customers')->count(),
            'total_sales'=>$paid->count(),'revenue'=>$revenue,'cogs'=>$cogs,'gross_profit'=>$revenue-$cogs,
            'estimated_net_profit'=>$revenue-$cogs+$paid->sum('delivery_charge')-$paid->sum('delivery_cost'),
            'delivery_costs'=>$paid->sum('delivery_cost'),'discounts'=>$paid->sum('discount'),'refunds'=>$orders->sum('refunded_amount'),
            'series'=>$paid->groupBy(fn($o)=>substr($o->created_at,0,10))->map(fn($group,$date)=>['date'=>$date,'revenue'=>$group->sum('subtotal')-$group->sum('discount')])->values(),
            'best_selling'=>$items->groupBy('variant_id')->map(fn($rows)=>['name'=>$rows->first()->name.' / '.$rows->first()->variant,'quantity'=>$rows->sum('quantity'),'revenue'=>$rows->sum(fn($i)=>$i->quantity*$i->price)])->sortByDesc('quantity')->values(),
            'recent_orders'=>DB::table('orders')->orderByDesc('id')->limit(8)->get(),
            'recent_stock'=>DB::table('inventory_transactions')->orderByDesc('id')->limit(8)->get(),
        ];
    }
}
