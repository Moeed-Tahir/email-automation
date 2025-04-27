import { NextResponse } from 'next/server';

const protectedPaths = [
  /^\/[^\/]+\/dashboard$/,
  /^\/[^\/]+\/bidding-requests$/,
  /^\/[^\/]+\/bid-details$/,
  /^\/[^\/]+\/profile$/
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userEmail = request.cookies.get('userEmail')?.value;
  const userId = request.cookies.get('UserId')?.value;
  const token = request.cookies.get('Token')?.value;

  const isAuthenticated = userEmail && userId && token;

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
    '/login'
  ]
};