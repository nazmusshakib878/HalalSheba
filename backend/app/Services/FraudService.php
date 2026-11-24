<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class FraudService {

    /**
     * Evaluates an order and returns risk analysis data
     */
    public static function evaluate(object $order, ?object $customer = null): array {
        $phone = $customer->phone ?? ($order->phone ?? '');
        $name = $customer->name ?? ($order->name ?? '');
        $address = $order->address ?? '';
        $total = (int)($order->total ?? 0);
        $cleanPhone = preg_replace('/[^0-9]/', '', (string)$phone);
        if (str_starts_with($cleanPhone, '880')) {
            $cleanPhone = '0' . substr($cleanPhone, 3);
        }

        $score = 0;
        $reasons = [];

        // 1. Phone number fraud check (Repeating digits, dummy sequences)
        if (preg_match('/^01[3-9](\d)\1{7}$/', $cleanPhone) || in_array($cleanPhone, ['01712345678', '01234567890', '01700000000', '01711111111', '01800000000', '01900000000'])) {
            $score += 50;
            $reasons[] = 'ভুয়া বা ডামি মোবাইল নম্বর (একই ডিজিট বারবার)';
        }

        // 2. Address quality check (Too short, gibberish, impossible for courier)
        $cleanAddress = trim(preg_replace('/[\s,.-]/', '', (string)$address));
        if (strlen($cleanAddress) < 8 || preg_match('/^(asdf|dsadv|test|demo|none|null|dhaka|chattogram)$/i', $cleanAddress)) {
            $score += 40;
            $reasons[] = 'অপর্যাপ্ত বা অস্পষ্ট ডেলিভারি ঠিকানা (কুরিয়ারে পার্সেল ডেলিভারি অসম্ভব)';
        }

        // 3. Customer name check
        $cleanName = trim((string)$name);
        if (strlen($cleanName) < 3 || preg_match('/^(asdf|test|fake|xxx|admin|user|guest)$/i', $cleanName)) {
            $score += 20;
            $reasons[] = 'সন্দেহজনক গ্রাহকের নাম';
        }

        // 4. Past customer order history analysis
        $totalPast = 0;
        $cancelledPast = 0;
        $deliveredPast = 0;

        if (!empty($cleanPhone)) {
            $phone10 = strlen($cleanPhone) >= 10 ? substr($cleanPhone, -10) : $cleanPhone;
            $pastOrders = DB::table('orders')
                ->join('customers', 'customers.id', '=', 'orders.customer_id')
                ->where(function($q) use ($cleanPhone, $phone10) {
                    $q->where('customers.phone', $cleanPhone)
                      ->orWhere('customers.phone', 'like', "%{$phone10}");
                })
                ->where('orders.id', '!=', $order->id ?? 0)
                ->select('orders.id', 'orders.status', 'orders.created_at')
                ->get();

            $totalPast = $pastOrders->count();
            $cancelledPast = $pastOrders->whereIn('status', ['cancelled', 'returned'])->count();
            $deliveredPast = $pastOrders->where('status', 'delivered')->count();

            // Repeated cancellations
            if ($cancelledPast > 0) {
                $score += 35;
                $reasons[] = "অতীতে এই নম্বরে {$cancelledPast}টি অর্ডার বাতিল বা রিটার্ন হয়েছিল";
            }

            // Rapid order placement (more than 2 orders within 1 hour)
            $recentCount = $pastOrders->filter(function($po) {
                return strtotime($po->created_at) > (time() - 3600);
            })->count();
            if ($recentCount >= 2) {
                $score += 30;
                $reasons[] = '১ ঘণ্টার মধ্যে একই নম্বর থেকে একাধিক অর্ডার প্লেস করা হয়েছে';
            }

            // Trusted verified customer discount
            if ($deliveredPast > 0 && $cancelledPast === 0) {
                $score = max(0, $score - 40);
            }
        }

        // 5. Unusually high COD order for first-time customer
        if (($total / 100) > 8000 && $deliveredPast === 0) {
            $score += 15;
            $reasons[] = 'নতুন গ্রাহকের জন্য বড় অঙ্কের ক্যাশ অন ডেলিভারি (৳' . number_format($total / 100) . ')';
        }

        // Risk Level determination
        if ($score >= 50) {
            $level = 'high'; // 🔴 ভুয়া সন্দেহজনক
        } elseif ($score >= 25) {
            $level = 'medium'; // 🟡 যাচাই প্রয়োজন
        } else {
            $level = 'low'; // 🟢 নিরাপদ
        }

        return [
            'risk_score' => min(100, $score),
            'risk_level' => $level,
            'reasons' => $reasons,
            'is_fake_suspected' => $score >= 50,
            'history' => [
                'total_orders' => $totalPast + 1,
                'delivered' => $deliveredPast,
                'cancelled' => $cancelledPast,
            ],
        ];
    }
}
