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
        $r->validate([
            'phone' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        if (empty(trim($r->phone ?? '')) && empty(trim($r->reference ?? ''))) {
            return response()->json(['message' => 'অনুগ্রহ করে মোবাইল নম্বর অথবা অর্ডার নম্বর লিখুন।'], 422);
        }

        $query = DB::table('orders')->join('customers', 'customers.id', '=', 'orders.customer_id');

        if (!empty(trim($r->phone ?? ''))) {
            $rawPhone = trim($r->phone);
            $cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);
            $phone10 = strlen($cleanPhone) >= 10 ? substr($cleanPhone, -10) : $cleanPhone;
            $query->where(function($q) use ($rawPhone, $cleanPhone, $phone10) {
                $q->where('customers.phone', $rawPhone)
                  ->orWhere('customers.phone', $cleanPhone);
                if (!empty($phone10)) {
                    $q->orWhere('customers.phone', 'like', "%{$phone10}");
                }
            });
        }

        if (!empty(trim($r->reference ?? ''))) {
            $ref = trim($r->reference);
            $numericId = preg_replace('/[^0-9]/', '', $ref);
            $query->where(function($q) use ($ref, $numericId) {
                $q->where('orders.reference', $ref);
                if (!empty($numericId)) {
                    $q->orWhere('orders.id', (int)$numericId);
                }
            });
        }

        $orders = $query->select(
            'orders.id',
            'orders.reference',
            'orders.status',
            'orders.subtotal',
            'orders.delivery_charge',
            'orders.discount',
            'orders.total',
            'orders.payment_method',
            'orders.payment_status',
            'orders.address',
            'orders.district',
            'orders.courier',
            'orders.tracking_number',
            'orders.created_at',
            'customers.name as customer_name',
            'customers.phone as customer_phone'
        )->orderByDesc('orders.id')->limit(10)->get();

        abort_if($orders->isEmpty(), 404, 'এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক মোবাইল নম্বর অথবা অর্ডার আইডি দিন।');

        $orderIds = $orders->pluck('id')->toArray();
        $items = DB::table('order_items')->whereIn('order_id', $orderIds)->get()->groupBy('order_id');

        $ordersWithItems = $orders->map(function($o) use ($items) {
            $o->items = $items->get($o->id) ?? [];
            return $o;
        });

        $latest = $ordersWithItems->first();
        return response()->json([
            'orders' => $ordersWithItems,
            'count' => $ordersWithItems->count(),
            'id' => $latest->id,
            'reference' => $latest->reference,
            'status' => $latest->status,
            'courier' => $latest->courier,
            'tracking_number' => $latest->tracking_number,
            'subtotal' => $latest->subtotal,
            'delivery_charge' => $latest->delivery_charge,
            'total' => $latest->total,
            'address' => $latest->address,
            'district' => $latest->district,
            'created_at' => $latest->created_at,
            'customer_name' => $latest->customer_name,
            'customer_phone' => $latest->customer_phone,
            'items' => $latest->items,
        ]);
    }
}
