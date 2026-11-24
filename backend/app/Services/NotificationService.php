<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService {

    public static function getNotificationConfig(): array {
        try {
            $raw = DB::table('settings')->where('key', 'notifications')->value('value');
            if ($raw) {
                return json_decode($raw, true) ?: [];
            }
        } catch (\Throwable $e) {}
        return [];
    }

    public static function sendNewOrderAlert(object $order, ?object $customer = null, array $items = []): array {
        $config = self::getNotificationConfig();
        $results = ['email' => false, 'sms' => false, 'telegram' => false];

        $ref = strtoupper(substr($order->reference ?? 'ORDER', 0, 8));
        $custName = $customer->name ?? ($order->name ?? 'Customer');
        $custPhone = $customer->phone ?? ($order->phone ?? '');
        $custAddress = $order->address ?? '';
        $totalAmount = number_format(($order->total ?? 0) / 100, 0);

        // 1. Email Alert
        $adminEmail = $config['admin_email'] ?? env('ADMIN_NOTIFICATION_EMAIL', 'halalsheba878@gmail.com');
        $emailEnabled = !empty($config['email_enabled']) || !empty(env('ORDER_EMAIL_NOTIFY'));
        if ($emailEnabled && !empty($adminEmail)) {
            try {
                $subject = "🔔 নতুন অর্ডার #{$ref} পেয়েছেন - হালাল সেবা (৳{$totalAmount})";
                $itemRowsHtml = '';
                foreach ($items as $it) {
                    $iName = is_array($it) ? ($it['name'] ?? 'Item') : ($it->name ?? 'Item');
                    $iQty = is_array($it) ? ($it['quantity'] ?? 1) : ($it->quantity ?? 1);
                    $iPrice = is_array($it) ? (($it['price'] ?? 0) / 100) : (($it->price ?? 0) / 100);
                    $itemRowsHtml .= "<tr><td style='padding:8px;border-bottom:1px solid #e2e8f0;'>{$iName}</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;'>{$iQty}</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;'>৳{$iPrice}</td></tr>";
                }

                $html = "
                <div style='font-family:sans-serif;max-width:600px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>
                    <div style='background:#075744;color:#ffffff;padding:20px;text-align:center;'>
                        <h2 style='margin:0;font-size:20px;'>Halal Sheba — নতুন অর্ডার নোটিফিকেশন</h2>
                        <p style='margin:4px 0 0;font-size:14px;color:#d1fae5;'>ওয়েবসাইটে একটি নতুন অর্ডার প্লেস হয়েছে</p>
                    </div>
                    <div style='padding:24px;'>
                        <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin-bottom:20px;'>
                            <strong style='color:#166534;font-size:16px;'>অর্ডার রেফারেন্স: #{$ref}</strong><br>
                            <span style='color:#15803d;font-size:14px;'>মোট মূল্য: <strong>৳{$totalAmount}</strong> (ক্যাশ অন ডেলিভারি)</span>
                        </div>
                        <table style='width:100%;margin-bottom:18px;font-size:14px;color:#334155;'>
                            <tr><td style='width:120px;color:#64748b;padding:4px 0;'>কাস্টমারের নাম:</td><td><strong>{$custName}</strong></td></tr>
                            <tr><td style='color:#64748b;padding:4px 0;'>মোবাইল নম্বর:</td><td><a href='tel:{$custPhone}' style='color:#075744;font-weight:bold;'>{$custPhone}</a></td></tr>
                            <tr><td style='color:#64748b;padding:4px 0;'>ডেলিভারি ঠিকানা:</td><td>{$custAddress}</td></tr>
                        </table>
                        " . ($itemRowsHtml ? "
                        <h4 style='margin:16px 0 8px;color:#0f172a;'>অর্ডারের পণ্যসমূহ:</h4>
                        <table style='width:100%;border-collapse:collapse;font-size:13px;color:#334155;margin-bottom:20px;'>
                            <tr style='background:#f8fafc;'><th style='padding:8px;text-align:left;'>পণ্য</th><th style='padding:8px;text-align:center;'>পরিমাণ</th><th style='padding:8px;text-align:right;'>মূল্য</th></tr>
                            {$itemRowsHtml}
                        </table>
                        " : "") . "
                        <div style='text-align:center;margin-top:24px;'>
                            <a href='https://halal-sheba.vercel.app/admin/orders' style='background:#075744;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;'>অ্যাডমিন প্যানেল থেকে দেখুন →</a>
                        </div>
                    </div>
                </div>";

                Mail::html($html, function ($msg) use ($adminEmail, $subject) {
                    $msg->to($adminEmail)->subject($subject);
                });
                $results['email'] = true;
            } catch (\Throwable $e) {
                Log::warning("Order email alert failed: " . $e->getMessage());
            }
        }

        // 2. SMS Alert
        $adminPhone = $config['admin_phone'] ?? env('ADMIN_PHONE', '01716333670');
        $smsEnabled = !empty($config['sms_enabled']) || !empty(env('ORDER_SMS_NOTIFY'));
        if ($smsEnabled && !empty($adminPhone) && !empty($config['sms_api_key'])) {
            try {
                $smsText = "Halal Sheba: New Order #{$ref} from {$custName} ({$custPhone}). Total: {$totalAmount} Tk. View: https://halal-sheba.vercel.app/admin/orders";
                self::dispatchSms($config, $adminPhone, $smsText);
                $results['sms'] = true;
            } catch (\Throwable $e) {
                Log::warning("Order SMS alert failed: " . $e->getMessage());
            }
        }

        // 3. Telegram Instant Push Notification (Free & Instant)
        $tgEnabled = !empty($config['telegram_enabled']) || !empty(env('TELEGRAM_NOTIFY'));
        $tgToken = $config['telegram_bot_token'] ?? env('TELEGRAM_BOT_TOKEN');
        $tgChatId = $config['telegram_chat_id'] ?? env('TELEGRAM_CHAT_ID');
        if ($tgEnabled && !empty($tgToken) && !empty($tgChatId)) {
            try {
                $tgText = "🚨 *নতুন অর্ডার এসেছে!* (Halal Sheba)\n\n"
                    . "📦 *অর্ডার আইডি:* `#{$ref}`\n"
                    . "👤 *কাস্টমার:* {$custName}\n"
                    . "📞 *মোবাইল:* {$custPhone}\n"
                    . "📍 *ঠিকানা:* {$custAddress}\n"
                    . "💰 *মোট বিল:* ৳{$totalAmount} (COD)\n\n"
                    . "👉 [অর্ডারের বিস্তারিত দেখুন](https://halal-sheba.vercel.app/admin/orders)";
                Http::timeout(5)->post("https://api.telegram.org/bot{$tgToken}/sendMessage", [
                    'chat_id' => $tgChatId,
                    'text' => $tgText,
                    'parse_mode' => 'Markdown',
                ]);
                $results['telegram'] = true;
            } catch (\Throwable $e) {
                Log::warning("Telegram order alert failed: " . $e->getMessage());
            }
        }

        return $results;
    }

    public static function dispatchSms(array $config, string $to, string $msg): void {
        $provider = strtolower($config['sms_provider'] ?? 'greenweb');
        $token = $config['sms_api_key'] ?? '';
        $senderId = $config['sms_sender_id'] ?? '';

        $cleanPhone = preg_replace('/[^0-9]/', '', $to);
        if (str_starts_with($cleanPhone, '880')) {
            $cleanPhone = substr($cleanPhone, 2);
        }
        if (!str_starts_with($cleanPhone, '01')) {
            $cleanPhone = '01' . ltrim($cleanPhone, '0');
        }

        if ($provider === 'greenweb') {
            Http::timeout(6)->asForm()->post('https://api.greenweb.com.bd/api.php', [
                'token' => $token,
                'to' => $cleanPhone,
                'message' => $msg,
            ]);
        } elseif ($provider === 'bulksmsbd') {
            Http::timeout(6)->get('http://bulksmsbd.net/api/smsapi', [
                'api_key' => $token,
                'type' => 'text',
                'number' => '88' . $cleanPhone,
                'senderid' => $senderId ?: '8809612...',
                'message' => $msg,
            ]);
        } elseif ($provider === 'elitbuzz') {
            Http::timeout(6)->asForm()->post('https://msg.elitbuzz-bd.com/smsapi', [
                'api_key' => $token,
                'type' => 'text',
                'contacts' => '88' . $cleanPhone,
                'senderid' => $senderId,
                'msg' => $msg,
            ]);
        } elseif ($provider === 'mimsms') {
            Http::timeout(6)->asForm()->post('https://esms.mimsms.com/smsapi', [
                'api_key' => $token,
                'type' => 'text',
                'contacts' => '88' . $cleanPhone,
                'senderid' => $senderId,
                'msg' => $msg,
            ]);
        } else {
            // Webhook or Custom URL format
            $url = str_replace(['{to}', '{msg}'], [$cleanPhone, urlencode($msg)], $token);
            Http::timeout(6)->get($url);
        }
    }
}
