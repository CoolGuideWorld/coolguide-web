import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const STUDIO_ROOT_PATH = "/studio";
const STUDIO_LOGIN_PATH = "/studio/login";

function getSupabasePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function isStudioPath(pathname: string): boolean {
  return pathname === STUDIO_ROOT_PATH || pathname.startsWith(`${STUDIO_ROOT_PATH}/`);
}

function isStudioLoginPath(pathname: string): boolean {
  return pathname === STUDIO_LOGIN_PATH;
}

async function isActiveStudioAdmin(
  request: NextRequest,
  response: NextResponse,
  userId: string
): Promise<{ allowed: boolean; response: NextResponse }> {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  let authResponse = response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        authResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          authResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase
    .from("studio_admin")
    .select("id")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(`[studio] studio_admin check failed in middleware: ${error.message}`);
    return { allowed: false, response: authResponse };
  }

  return {
    allowed: Boolean(data?.id),
    response: authResponse,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isStudioPath(pathname)) {
    return NextResponse.next();
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isStudioLoginPath(pathname)) {
      return response;
    }

    const loginUrl = new URL(STUDIO_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const adminAccess = await isActiveStudioAdmin(request, response, user.id);
  response = adminAccess.response;

  if (isStudioLoginPath(pathname)) {
    if (adminAccess.allowed) {
      return NextResponse.redirect(new URL(STUDIO_ROOT_PATH, request.url));
    }

    return response;
  }

  if (!adminAccess.allowed) {
    const loginUrl = new URL(STUDIO_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("error", "access-denied");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/studio/:path*"],
};
