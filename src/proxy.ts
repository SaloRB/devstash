import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/constants/routes";

const { auth } = NextAuth(authConfig);

export const proxy = auth(function middleware(req) {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/profile",
    "/items/:path*",
    "/settings",
    "/settings/:path*",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
