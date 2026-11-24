<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;
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
        $results = ['email' => false];

        $ref = strtoupper(substr($order->reference ?? 'ORDER', 0, 8));
        $custName = $customer->name ?? ($order->name ?? 'Customer');
        $custPhone = $customer->phone ?? ($order->phone ?? '');
        $custAddress = $order->address ?? '';
        $totalAmount = number_format(($order->total ?? 0) / 100, 0);

        // Target recipient email (Default: n.shakib2027@gmail.com)
        $adminEmail = !empty($config['admin_email']) ? trim($config['admin_email']) : 'n.shakib2027@gmail.com';
        $emailEnabled = isset($config['email_enabled']) ? (bool)$config['email_enabled'] : true;

        if ($emailEnabled && !empty($adminEmail)) {
            try {
                $smtpUser = !empty($config['smtp_user']) ? trim($config['smtp_user']) : (!empty(env('MAIL_USERNAME')) ? env('MAIL_USERNAME') : $adminEmail);
                $smtpPass = !empty($config['smtp_pass']) ? trim($config['smtp_pass']) : env('MAIL_PASSWORD');

                if (!empty($smtpPass)) {
                    config([
                        'mail.default' => 'smtp',
                        'mail.mailers.smtp.transport' => 'smtp',
                        'mail.mailers.smtp.host' => $config['smtp_host'] ?? env('MAIL_HOST', 'smtp.gmail.com'),
                        'mail.mailers.smtp.port' => (int)($config['smtp_port'] ?? env('MAIL_PORT', 587)),
                        'mail.mailers.smtp.encryption' => $config['smtp_encryption'] ?? env('MAIL_ENCRYPTION', 'tls'),
                        'mail.mailers.smtp.username' => $smtpUser,
                        'mail.mailers.smtp.password' => $smtpPass,
                        'mail.from.address' => $smtpUser,
                        'mail.from.name' => 'Halal Sheba (নতুন অর্ডার)',
                    ]);
                    try {
                        Mail::purge('smtp');
                    } catch (\Throwable $te) {}
                }

                $subject = "🔔 নতুন অর্ডার #{$ref} পেয়েছেন - Halal Sheba (৳{$totalAmount})";
                $itemRowsHtml = '';
                foreach ($items as $it) {
                    $iName = is_array($it) ? ($it['name'] ?? 'Item') : ($it->name ?? 'Item');
                    $iQty = is_array($it) ? ($it['quantity'] ?? 1) : ($it->quantity ?? 1);
                    $iPrice = is_array($it) ? (($it['price'] ?? 0) / 100) : (($it->price ?? 0) / 100);
                    $itemRowsHtml .= "<tr><td style='padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;'>{$iName}</td><td style='padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;'>{$iQty}</td><td style='padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;'>৳{$iPrice}</td></tr>";
                }

                $html = "
                <div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);'>
                    <div style='background:#075744;color:#ffffff;padding:24px;text-align:center;'>
                        <h1 style='margin:0;font-size:22px;letter-spacing:-0.5px;'>Halal Sheba — নতুন অর্ডার নোটিফিকেশন</h1>
                        <p style='margin:6px 0 0;font-size:14px;color:#a7f3d0;'>আপনার ওয়েবসাইটে নতুন একটি অর্ডার এসেছে!</p>
                    </div>
                    <div style='padding:24px;'>
                        <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;'>
                            <div style='display:flex;justify-content:space-between;align-items:center;'>
                                <div>
                                    <div style='color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;'>অর্ডার নম্বর</div>
                                    <div style='color:#166534;font-size:20px;font-weight:bold;'>#{$ref}</div>
                                </div>
                                <div style='text-align:right;'>
                                    <div style='color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;'>মোট বিল</div>
                                    <div style='color:#166534;font-size:22px;font-weight:bold;'>৳{$totalAmount}</div>
                                </div>
                            </div>
                        </div>

                        <h3 style='margin:0 0 12px;font-size:15px;color:#0f172a;'>কাস্টমারের তথ্য:</h3>
                        <table style='width:100%;margin-bottom:20px;font-size:14px;color:#334155;border-collapse:collapse;'>
                            <tr><td style='width:120px;color:#64748b;padding:6px 0;'>নাম:</td><td style='padding:6px 0;'><strong>{$custName}</strong></td></tr>
                            <tr><td style='color:#64748b;padding:6px 0;'>মোবাইল নম্বর:</td><td style='padding:6px 0;'><a href='tel:{$custPhone}' style='color:#075744;font-weight:bold;text-decoration:none;'>{$custPhone}</a></td></tr>
                            <tr><td style='color:#64748b;padding:6px 0;'>ঠিকানা:</td><td style='padding:6px 0;'>{$custAddress}</td></tr>
                            <tr><td style='color:#64748b;padding:6px 0;'>পেমেন্ট:</td><td style='padding:6px 0;'>ক্যাশ অন ডেলিভারি (Cash on Delivery)</td></tr>
                        </table>

                        " . ($itemRowsHtml ? "
                        <h3 style='margin:0 0 10px;font-size:15px;color:#0f172a;'>অর্ডারের পণ্যসমূহ:</h3>
                        <table style='width:100%;border-collapse:collapse;font-size:13px;color:#334155;margin-bottom:24px;border:1px solid #e2e8f0;border-radius:6px;'>
                            <tr style='background:#f8fafc;'><th style='padding:10px 12px;text-align:left;border-bottom:1px solid #e2e8f0;'>পণ্য</th><th style='padding:10px 12px;text-align:center;border-bottom:1px solid #e2e8f0;'>পরিমাণ</th><th style='padding:10px 12px;text-align:right;border-bottom:1px solid #e2e8f0;'>মূল্য</th></tr>
                            {$itemRowsHtml}
                        </table>
                        " : "") . "

                        <div style='text-align:center;margin-top:20px;'>
                            <a href='https://halal-sheba.vercel.app/admin/orders' style='background:#075744;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;'>অর্ডারটি দেখতে এখানে ক্লিক করুন →</a>
                        </div>
                    </div>
                </div>";

                Mail::html($html, function ($msg) use ($adminEmail, $subject, $smtpUser) {
                    $msg->to($adminEmail)->subject($subject);
                    if (!empty($smtpUser)) {
                        $msg->from($smtpUser, 'Halal Sheba');
                    }
                });
                $results['email'] = true;
            } catch (\Throwable $e) {
                Log::warning("Order email alert failed: " . $e->getMessage());
                $results['error'] = $e->getMessage();
            }
        }

        return $results;
    }
}
