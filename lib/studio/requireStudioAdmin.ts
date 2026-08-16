import { redirect } from "next/navigation";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

type StudioAdminRow = {
  id: string;
  display_name: string | null;
  is_active: boolean;
};

export async function requireStudioAdmin() {
  const supabase = await createServerAuthSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/studio/login");
  }

  const { data, error } = await supabase
    .from("studio_admin")
    .select("id, display_name, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle<StudioAdminRow>();

  if (error) {
    console.error(`[studio] studio_admin check failed on server guard: ${error.message}`);
    redirect("/studio/login?error=access-denied");
  }

  if (!data) {
    redirect("/studio/login?error=access-denied");
  }

  return {
    user,
    admin: data,
  };
}
