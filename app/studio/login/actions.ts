"use server";

import { redirect } from "next/navigation";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

export type StudioLoginState = {
  error: string;
};

function toSafeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function toFrenchAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Votre adresse e-mail n'est pas confirmée.";
  }

  return "Connexion impossible pour le moment. Réessayez dans quelques instants.";
}

export async function loginStudioAction(
  _prevState: StudioLoginState,
  formData: FormData
): Promise<StudioLoginState> {
  const email = toSafeString(formData.get("email"));
  const password = toSafeString(formData.get("password"));

  if (!email || !password) {
    return {
      error: "Veuillez renseigner votre adresse e-mail et votre mot de passe.",
    };
  }

  const supabase = await createServerAuthSupabaseClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return {
      error: toFrenchAuthError(authError?.message ?? "invalid login credentials"),
    };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("studio_admin")
    .select("id")
    .eq("id", authData.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError) {
    console.error(`[studio] studio_admin check failed after sign in: ${adminError.message}`);
    await supabase.auth.signOut();

    return {
      error: "Vérification administrateur impossible. Veuillez réessayer.",
    };
  }

  if (!adminRow) {
    await supabase.auth.signOut();

    return {
      error: "Accès refusé. Votre compte n'a pas d'accès administrateur actif.",
    };
  }

  redirect("/studio");
}
