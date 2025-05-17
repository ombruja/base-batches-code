import { type NextRequest } from "next/server";
import { updateSession } from "~/server/lib/middleware/supabase.middleware";

export async function middleware(request: NextRequest) {
  console.log("middleware", request.url);
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /monitoring (monitoring endpoints)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
