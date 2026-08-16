"use server";

import { redirect } from "next/navigation";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

export async function logoutStudioAction() {
  const supabase = await createServerAuthSupabaseClient();
  await supabase.auth.signOut();
  redirect("/studio/login?message=signed-out");
}
