import { NextResponse } from 'next/server';

const protectedPaths = [
  /^\/[^\/]+\/dashboard$/,
  /^\/[^\/]+\/bidding-requests$/,
  /^\/[^\/]+\/bid-details$/,
  /^\/[^\/]+\/profile$/
];

const adminProtectedPath = /^\/admin\/dashboard$/;

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const userEmail = request.cookies.get('userEmail')?.value;
  const userId = request.cookies.get('UserId')?.value;
  const token = request.cookies.get('Token')?.value;
  const adminAccessible = request.cookies.get('adminAccessible')?.value === 'true';

  const isAuthenticated = userEmail && userId && token;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/admin/login' && adminAccessible) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname === '/admin/dashboard' && !adminAccessible) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${userId}/dashboard`, request.url));
  }

  const isProtected = protectedPaths.some((regex) => regex.test(pathname));

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/:userId/dashboard',
    '/:userId/bidding-requests',
    '/:userId/bid-details',
    '/:userId/profile',
    '/login',
    '/admin/login',
    '/admin/dashboard'
  ]
};
