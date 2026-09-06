import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BetaTesterRequestBody = {
  email?: unknown;
};

const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmail(body: BetaTesterRequestBody): string | null {
  if (typeof body.email !== "string") {
    return null;
  }

  const normalizedEmail = body.email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return null;
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }

  return normalizedEmail;
}

function createServerSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  let requestBody: BetaTesterRequestBody;

  try {
    requestBody = (await request.json()) as BetaTesterRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_EMAIL",
      },
      { status: 400 }
    );
  }

  const email = parseEmail(requestBody);

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_EMAIL",
      },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = createServerSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("beta_testers").insert({
      email,
      platform: "android",
      status: "pending",
      source: "website",
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_REGISTERED",
        },
        { status: 409 }
      );
    }

    if (error) {
      return NextResponse.json(
        {
          success: false,
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
