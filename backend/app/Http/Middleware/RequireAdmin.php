<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class RequireAdmin {
    public function handle(Request $request, Closure $next, string $role = 'admin') {
        abort_unless($request->user(), 401, 'Please sign in.');
        abort_unless($request->user()->active && in_array($request->user()->role, ['admin','super_admin']), 403);
        if ($role === 'super_admin') abort_unless($request->user()->role === 'super_admin', 403);
        $response=$next($request);
        $response->headers->set('Cache-Control','private, no-store');
        return $response;
    }
}
