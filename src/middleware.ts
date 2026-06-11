import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Временно отключаем жесткий редирект, пока не синхронизируем куки
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
