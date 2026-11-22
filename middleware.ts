import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Lewati file statis Next.js kecuali yang dicari di parameter URL
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan untuk rute API dan Clerk proxy (2 garis bawah)
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};