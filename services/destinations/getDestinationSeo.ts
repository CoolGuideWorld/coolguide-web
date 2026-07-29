import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationSeoSupabaseRow = {
  seo_title: string | null;
  seo_description: string | null;
  short_description: string | null;
  introduction: string | null;
};

export type DestinationSeoData = {
  seoTitle: string | null;
  seoDescription: string | null;
  shortDescription: string | null;
  introduction: string | null;
};

const EMPTY_SEO: DestinationSeoData = {
  seoTitle: null,
  seoDescription: null,
  shortDescription: null,
  introduction: null,
};

function normalizeNullableText(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getDestinationSeo(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<DestinationSeoData> {
  if (!context) {
    return EMPTY_SEO;
  }

  try {
    const { data: contentRow, error: contentError } = await supabase
      .from("destination_contents")
      .select("seo_title,seo_description,short_description,introduction")
      .eq("destination_id", context.destinationId)
      .eq("language_id", context.languageId)
      .maybeSingle<DestinationSeoSupabaseRow>();

    if (contentError) {
      console.error(
        `Supabase destination_contents SEO query failed for destination_id "${context.destinationId}" and language_id "${context.languageId}": ${contentError.message}`
      );
      return EMPTY_SEO;
    }

    return {
      seoTitle: normalizeNullableText(contentRow?.seo_title ?? null),
      seoDescription: normalizeNullableText(contentRow?.seo_description ?? null),
      shortDescription: normalizeNullableText(contentRow?.short_description ?? null),
      introduction: normalizeNullableText(contentRow?.introduction ?? null),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase destination_contents SEO query failed: ${message}`
    );

    return EMPTY_SEO;
  }
}
