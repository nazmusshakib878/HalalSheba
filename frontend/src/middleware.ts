import { NextRequest, NextResponse } from 'next/server';
export async function middleware(request:NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  try {
    const result=await fetch(`${process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000'}/api/admin/me`, {headers:{Cookie:request.headers.get('cookie') || '',Accept:'application/json'},cache:'no-store'});
    if(result.ok) return NextResponse.next();
  } catch { /* Fail closed when authentication is unavailable. */ }
  return NextResponse.redirect(new URL('/admin/login',request.url));
}
export const config={matcher:['/admin/:path*']};
