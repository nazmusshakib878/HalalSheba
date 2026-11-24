<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller {
    public function create(Request $r) {
        $d = $r->validate([
            'phone' => 'required|string',
            'product_id' => 'required|integer',
            'author' => 'required|string|max:255',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|max:4000',
            'reference' => 'nullable|string',
        ]);

        $cleanPhone = preg_replace('/[^0-9]/', '', $d['phone']);
        $phone10 = strlen($cleanPhone) >= 10 ? substr($cleanPhone, -10) : $cleanPhone;

        // Find customer's order for this product
        $query = DB::table('orders')
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->join('order_items', 'order_items.order_id', '=', 'orders.id')
            ->join('variants', 'variants.id', '=', 'order_items.variant_id')
            ->where('variants.product_id', $d['product_id'])
            ->where(function($q) use ($d, $cleanPhone, $phone10) {
                $q->where('customers.phone', $d['phone'])
                  ->orWhere('customers.phone', $cleanPhone);
                if (!empty($phone10)) {
                    $q->orWhere('customers.phone', 'like', "%{$phone10}");
                }
            });

        if (!empty($d['reference'])) {
            $ref = trim($d['reference']);
            $numId = preg_replace('/[^0-9]/', '', $ref);
            $query->where(function($q) use ($ref, $numId) {
                $q->where('orders.reference', $ref);
                if (!empty($numId)) {
                    $q->orWhere('orders.id', (int)$numId);
                }
            });
        }

        // Prefer delivered orders, otherwise any active order
        $order = (clone $query)->where('orders.status', 'delivered')->select('orders.id', 'orders.status')->first();
        if (!$order) {
            $order = $query->whereNotIn('orders.status', ['cancelled', 'returned'])->select('orders.id', 'orders.status')->first();
        }

        abort_unless($order, 422, 'এই প্রোডাক্টটির জন্য কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে অর্ডারে ব্যবহৃত সঠিক মোবাইল নম্বর দিন।');

        // Check if already reviewed for this order
        $exists = DB::table('reviews')->where('order_id', $order->id)->where('product_id', $d['product_id'])->exists();
        abort_if($exists, 422, 'আপনি ইতিমধ্যে এই অর্ডারের জন্য রিভিউ দিয়েছেন। ধন্যবাদ!');

        DB::table('reviews')->insert([
            'order_id' => $order->id,
            'product_id' => $d['product_id'],
            'author' => $d['author'],
            'rating' => $d['rating'],
            'comment' => $d['comment'],
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'ধন্যবাদ! আপনার রিভিউটি সফলভাবে প্রকাশিত হয়েছে।'
        ]);
    }
}
