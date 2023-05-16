import { NextResponse, type NextRequest } from "next/server";

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
  };

export function middleware(req: NextRequest) {
    console.log("middleware", req.nextUrl.pathname);
    // console.log("is this working middle?");
    return NextResponse.next();
}