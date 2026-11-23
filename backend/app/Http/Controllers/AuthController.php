<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
class AuthController extends Controller {
    public function csrf() { return response()->json(['token' => csrf_token()])->header('Cache-Control', 'no-store'); }
    public function login(Request $r) {
        $data = $r->validate(['email'=>'required|email', 'password'=>'required|string']);
        if (!Auth::attempt([...$data, 'active'=>true])) return response()->json(['message'=>'Invalid credentials.'],422);
        abort_unless(in_array($r->user()->role, ['admin','super_admin']),403);
        $r->session()->regenerate();
        return $this->user($r);
    }
    public function user(Request $r) { return $r->user()->only('id','name','email','role'); }
    public function logout(Request $r) { Auth::logout(); $r->session()->invalidate(); $r->session()->regenerateToken(); return ['message'=>'Signed out']; }
    public function changePassword(Request $r) {
        $d=$r->validate(['current_password'=>'required|current_password','password'=>'required|confirmed|min:12']);
        $r->user()->forceFill(['password'=>Hash::make($d['password']),'remember_token'=>Str::random(60)])->save();
        \Illuminate\Support\Facades\DB::table('sessions')->where('user_id',$r->user()->id)->where('id','!=',$r->session()->getId())->delete();
        $r->session()->regenerate();
        return ['message'=>'Password changed. Other sessions have been signed out.'];
    }
    public function forgot(Request $r) {
        $r->validate(['email'=>'required|email']);
        Password::sendResetLink($r->only('email'));
        return ['message'=>'If this account exists, a reset link has been sent.'];
    }
    public function reset(Request $r) {
        $r->validate(['token'=>'required','email'=>'required|email','password'=>'required|confirmed|min:12']);
        $status = Password::reset($r->only('email','password','password_confirmation','token'), function ($user, $password) {
            $user->forceFill(['password'=>Hash::make($password), 'remember_token'=>Str::random(60)])->save();
            \Illuminate\Support\Facades\DB::table('sessions')->where('user_id',$user->id)->delete();
            event(new PasswordReset($user));
        });
        abort_unless($status === Password::PASSWORD_RESET,422,'Invalid or expired reset link.');
        return ['message'=>'Password reset. Please sign in.'];
    }
}
