export const runtime = "nodejs";
import { NextResponse } from "next/server"; //jo reponse banaega middleware se uske liye import krna padega
import type { NextRequest } from "next/server"; //jo request lega middleware se uske liye import krna padega
import { auth } from "@/auth";


export async function middleware(request: NextRequest) {
const session = await auth();
const { pathname } = request.nextUrl;
const isLoggedIn = !!session?.user;

// logged-in user should not see auth pages
if (
    isLoggedIn &&
    (pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/verify") ||
    pathname === "/")
) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
}

// not logged-in user should not see private pages
if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
}

return NextResponse.next();
}

export const config = {
matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/dashboard/:path*",
],
};