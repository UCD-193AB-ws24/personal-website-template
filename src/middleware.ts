import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect to /login if the user isn't signed in and visits any of the routes
  // matched by an entry in `matches` except "/", "/login", and "/signup"
  const session = request.cookies.get("__session");
  if (
    pathname !== "/" &&
    pathname !== "/login" &&
    pathname !== "/signup" &&
    session === undefined
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to /setusername if the user is signed in but doesn't have a
  // username
  const username = request.cookies.get("username");
  if (
    pathname !== "/setusername" &&
    session !== undefined &&
    username === undefined
  ) {
    return NextResponse.redirect(new URL("/setusername", request.url));
  }

  // Redirect to "/" if the user is signed in and tries to visit
  // "/login" or "/signup"
  if (
    session !== undefined &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to "/" if the user is signed in, has a username, and tries to
  // visit "/setusername"
  if (
    session !== undefined &&
    username !== undefined &&
    pathname === "/setusername"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/editor/:path*",
    "/profile/:path*",
    "/saveddrafts/:path*",
    "/setupdraft/:path*",
    "/setusername/:path",
    "/templates/:path*",
    "/login/:path*",
    "/signup/:path*",
    "/setusername/:path*",
  ],
};
