import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route protection. The dashboard and the saved-item API require a signed-in
 * user; everything else (the landing page and all generation routes) stays
 * public, so unauthenticated visitors can still use the tool — they only need to
 * sign in to save work.
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/saved(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|otf|map)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
