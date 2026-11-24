<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\OrderService;
class OrderController extends Controller {
    public function index(Request $r) {
        return DB::table('orders')->join('customers','customers.id','=','orders.customer_id')
            ->select('orders.*','customers.name','customers.phone')->orderByDesc('orders.id')->limit(500)->get();
    }
    public function detail(int $id) {
        $o=DB::table('orders')->find($id); abort_unless($o,404);
        return ['order'=>$o,'customer'=>DB::table('customers')->find($o->customer_id),'items'=>DB::table('order_items')->where('order_id',$id)->get(),
            'history'=>DB::table('audit_logs')->where('entity','order')->where('entity_id',$id)->orderByDesc('id')->get()];
    }
    public function create(Request $r,OrderService $service) {
        try {
            $d=$r->validate(['idempotency_key'=>'required|uuid','name'=>'required|string|max:255','phone'=>'required|regex:/^\+?[0-9]{10,15}$/',
                'email'=>'nullable|email','address'=>'required|string|max:2000','district'=>'required|string|max:100',
                'note'=>'nullable|string|max:2000','payment_method'=>'required|in:cod','source'=>'nullable|in:phone,whatsapp,manual,web',
                'coupon'=>'nullable|string|max:100','items'=>'required|array|min:1|max:100','items.*.variant_id'=>'required|integer',
                'items.*.quantity'=>'required|integer|min:1|max:10000']);
            $o=$service->create($d,$r->is('api/admin/*'),$r->is('api/quote'));
            return ['reference'=>$o->reference,'status'=>$o->status,'subtotal'=>$o->subtotal,'discount'=>$o->discount,'delivery_charge'=>$o->delivery_charge,'total'=>$o->total,'created_at'=>$o->created_at];
        } catch (\Illuminate\Validation\ValidationException $ve) {
            throw $ve;
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $he) {
            return response()->json(['message' => $he->getMessage()], $he->getStatusCode());
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Order creation failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => $e->getMessage() ?: 'Server Error'], 422);
        }
    }
    public function update(Request $r,int $id,OrderService $service) {
        $d=$r->validate(['status'=>'required|in:'.implode(',',OrderService::STATUSES),'reason'=>'required|string|min:3|max:2000',
            'payment_status'=>'nullable|in:paid,unpaid','courier'=>'nullable|string|max:255','tracking_number'=>'nullable|string|max:255','delivery_cost'=>'nullable|integer|min:0']);
        return $service->transition($id,$d);
    }
    public function track(Request $r) {
        $r->validate(['reference'=>'required|uuid','phone'=>'required|string']);
        $o=DB::table('orders')->join('customers','customers.id','=','orders.customer_id')->where('reference',$r->reference)->where('phone',$r->phone)
            ->select('reference','orders.status','courier','tracking_number','orders.created_at')->first();
        abort_unless($o,404,'Order not found.'); return $o;
    }
}
