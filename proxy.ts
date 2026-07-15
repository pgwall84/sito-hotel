import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function hasValidStudioAuth(req: NextRequest): boolean {
  const user = process.env.STUDIO_USER;
  const pass = process.env.STUDIO_PASSWORD;
  if (!user || !pass) return false;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  const decoded = atob(header.slice(6));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const reqUser = decoded.slice(0, separatorIndex);
  const reqPass = decoded.slice(separatorIndex + 1);
  return reqUser === user && reqPass === pass;
}

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/studio")) {
    if (process.env.NODE_ENV === "production" && !hasValidStudioAuth(req)) {
      return new NextResponse("Autenticazione richiesta", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Sanity Studio"' },
      });
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
