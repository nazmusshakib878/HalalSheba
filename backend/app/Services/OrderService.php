<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class OrderService {
    public const STATUSES = [
        'new','pending','confirmed','processing','packed',
        'shipped','out_for_delivery','delivered','cancelled','returned','refunded'
    ];

    public function create(array $d, bool $isAdmin = false, bool $isQuote = false): object {
        $subtotal = 0;
        $items = [];
        foreach ($d['items'] as $item) {
            $v = DB::table('variants')->where('id', $item['variant_id'])->where('active', true)->first();
            if (!$v) {
                $v = DB::table('variants')->where('product_id', $item['variant_id'])->where('active', true)->first();
            }
            abort_unless($v, 422, 'Product variant unavailable.');
            $qty = (int)$item['quantity'];
            abort_unless($qty > 0, 422, 'Quantity must be positive.');
            if (!$isAdmin && !$isQuote) {
                $available = max(0, (int)($v->physical - $v->reserved));
                abort_if($available < $qty, 422, "দুঃখিত, '{$v->name}' বর্তমানে পর্যাপ্ত স্টকে নেই।");
            }
            $subtotal += $v->price * $qty;
            $items[] = ['variant' => $v, 'quantity' => $qty];
        }

        // Calculate delivery charge from settings
        $deliverySettings = json_decode(DB::table('settings')->where('key', 'delivery')->value('value') ?? '{}', true);
        $dhakaFee = (int)($deliverySettings['dhaka'] ?? 6000);
        $outsideFee = (int)($deliverySettings['outside'] ?? 12000);
        $freeAbove = isset($deliverySettings['free_above']) && $deliverySettings['free_above'] !== null ? (int)$deliverySettings['free_above'] : null;

        $district = trim($d['district'] ?? 'Dhaka');
        $isDhaka = strcasecmp($district, 'Dhaka') === 0 || stripos($d['address'] ?? '', 'Dhaka') !== false;
        $deliveryCharge = $deliverySettings['districts'][$district] ?? ($isDhaka ? $dhakaFee : $outsideFee);

        if ($freeAbove !== null && $freeAbove > 0 && $subtotal >= $freeAbove) {
            $deliveryCharge = 0;
        }

        // Calculate discount from coupon if provided
        $discount = 0;
        $couponId = null;
        if (!empty($d['coupon'])) {
            $code = strtoupper(trim($d['coupon']));
            $coupon = DB::table('coupons')->where('code', $code)->where('active', true)->first();
            if ($coupon) {
                $expired = $coupon->expires_at && strtotime($coupon->expires_at) < time();
                $limitReached = $coupon->usage_limit !== null && $coupon->used >= $coupon->usage_limit;
                $minMet = $subtotal >= ($coupon->minimum ?? 0);
                if (!$expired && !$limitReached && $minMet) {
                    $couponId = $coupon->id;
                    if ($coupon->type === 'free_delivery') {
                        $deliveryCharge = 0;
                    } elseif ($coupon->type === 'percent') {
                        $discount = (int)round($subtotal * ($coupon->value / 100));
                    } elseif ($coupon->type === 'fixed') {
                        $discount = min($subtotal, (int)$coupon->value);
                    }
                }
            }
        }

        $total = max(0, $subtotal - $discount + $deliveryCharge);

        if ($isQuote) {
            return (object)[
                'reference' => (string)\Illuminate\Support\Str::uuid(),
                'status' => 'quote',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_charge' => $deliveryCharge,
                'total' => $total,
                'created_at' => now()->toIso8601String(),
            ];
        }

        return DB::transaction(function() use ($d, $items, $subtotal, $discount, $deliveryCharge, $total, $couponId) {
            // Find or create customer
            $cust = DB::table('customers')->where('phone', $d['phone'])->first();
            if ($cust) {
                $cid = $cust->id;
                DB::table('customers')->where('id', $cid)->update([
                    'name' => $d['name'],
                    'address' => $d['address'],
                    'updated_at' => now(),
                ]);
            } else {
                $cid = DB::table('customers')->insertGetId([
                    'name' => $d['name'],
                    'phone' => $d['phone'],
                    'email' => $d['email'] ?? null,
                    'address' => $d['address'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $reference = (string)\Illuminate\Support\Str::uuid();
            $idempotencyKey = $d['idempotency_key'] ?? (string)\Illuminate\Support\Str::uuid();

            // If idempotency_key already exists, return existing order
            $existing = DB::table('orders')->where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }

            $oid = DB::table('orders')->insertGetId([
                'reference' => $reference,
                'idempotency_key' => $idempotencyKey,
                'customer_id' => $cid,
                'status' => 'new',
                'payment_status' => 'unpaid',
                'payment_method' => $d['payment_method'] ?? 'cod',
                'source' => $d['source'] ?? 'web',
                'address' => $d['address'],
                'district' => $d['district'] ?? 'Dhaka',
                'note' => $d['note'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_charge' => $deliveryCharge,
                'delivery_cost' => 0,
                'total' => $total,
                'refunded_amount' => 0,
                'stock_state' => 'reserved',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($items as $i) {
                $v = $i['variant'];
                $qty = $i['quantity'];
                $p = DB::table('products')->find($v->product_id);
                DB::table('variants')->where('id', $v->id)->increment('reserved', $qty);
                DB::table('order_items')->insert([
                    'order_id' => $oid,
                    'variant_id' => $v->id,
                    'name' => $p ? $p->name : $v->name,
                    'variant' => $v->name,
                    'sku' => $v->sku,
                    'quantity' => $qty,
                    'price' => $v->price,
                    'cost' => $v->cost ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                app(InventoryService::class)->record($v, 0, 'reserve', "Reserved {$qty} units", $oid);
            }

            if ($couponId) {
                DB::table('coupons')->where('id', $couponId)->increment('used');
            }

            Audit::record('order.create', 'order', $oid);
            return DB::table('orders')->find($oid);
        }, 3);
    }

    public function place(array $d): object {
        return $this->create($d);
    }

    public function transition(int $id, array $d): object {
        return DB::transaction(function() use($id, $d) {
            $o = DB::table('orders')->lockForUpdate()->find($id);
            abort_unless($o, 404);
            $next = $d['status'];
            abort_unless(in_array($next, self::STATUSES), 422, 'Invalid order status.');
            $state = $o->stock_state;
            foreach (DB::table('order_items')->where('order_id', $id)->orderBy('variant_id')->get() as $item) {
                $v = DB::table('variants')->lockForUpdate()->find($item->variant_id);
                if (!$v) continue;
                $delta = 0;
                if (in_array($next, ['shipped', 'out_for_delivery', 'delivered']) && $o->stock_state === 'reserved') {
                    $delta = -$item->quantity;
                    $state = 'consumed';
                    DB::table('variants')->where('id', $v->id)->update([
                        'reserved' => max(0, $v->reserved - $item->quantity),
                        'physical' => max(0, $v->physical - $item->quantity),
                        'sold' => $v->sold + $item->quantity,
                    ]);
                } elseif ($next === 'cancelled' && $o->stock_state === 'reserved') {
                    $state = 'released';
                    DB::table('variants')->where('id', $v->id)->update([
                        'reserved' => max(0, $v->reserved - $item->quantity),
                    ]);
                } elseif ($next === 'returned' && $o->stock_state === 'consumed') {
                    $delta = $item->quantity;
                    $state = 'restored';
                    DB::table('variants')->where('id', $v->id)->update([
                        'physical' => $v->physical + $item->quantity,
                        'sold' => max(0, $v->sold - $item->quantity),
                    ]);
                }
                if ($state !== $o->stock_state) {
                    app(InventoryService::class)->record($v, $delta, $next, $d['reason'] ?? 'Status updated by Admin', $id);
                }
            }
            $update = ['status' => $next, 'stock_state' => $state, 'updated_at' => now()];
            foreach (['courier', 'tracking_number', 'delivery_cost'] as $key) {
                if (array_key_exists($key, $d)) $update[$key] = $d[$key];
            }
            if (isset($d['payment_status'])) {
                abort_unless(in_array($d['payment_status'], ['unpaid', 'paid']), 422);
                $update['payment_status'] = $d['payment_status'];
            }
            if ($next === 'refunded') {
                $update['payment_status'] = 'refunded';
                $update['refunded_amount'] = $o->total;
            }
            DB::table('orders')->where('id', $id)->update($update);
            if (($update['payment_status'] ?? null) === 'paid' && $o->payment_status !== 'paid') {
                DB::table('payments')->insert([
                    'order_id' => $id,
                    'user_id' => auth()->id(),
                    'type' => 'receipt',
                    'amount' => $o->total,
                    'method' => $o->payment_method,
                    'reference' => $d['reason'] ?? 'Cash on Delivery',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            Audit::record('order.update', 'order', $id, ['status' => $next, 'reason' => $d['reason'] ?? null]);
            return DB::table('orders')->find($id);
        }, 3);
    }
}
