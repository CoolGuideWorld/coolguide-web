import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExperienceStats = {
  availableAudioCount: number | null;
  availablePoiCount: number | null;
};

const getExperienceStatsCached = cache(async (): Promise<ExperienceStats> => {
  try {
    const supabase = createServerSupabaseClient();

    const [{ count: availableAudioCount, error: audioError }, { count: availablePoiCount, error: poiError }] =
      await Promise.all([
        supabase.from("audios").select("id", { count: "exact", head: true }),
        supabase.from("poi").select("id", { count: "exact", head: true }),
      ]);

    if (audioError || poiError) {
      console.error("[getExperienceStats] Unable to retrieve available audio count", {
        audioError: audioError
          ? {
              message: audioError.message,
              code: audioError.code,
              details: audioError.details,
              hint: audioError.hint,
            }
          : null,
        poiError: poiError
          ? {
              message: poiError.message,
              code: poiError.code,
              details: poiError.details,
              hint: poiError.hint,
            }
          : null,
      });

      return { availableAudioCount: null, availablePoiCount: null };
    }

    const normalizedAvailableAudioCount = Number(availableAudioCount);
    const normalizedAvailablePoiCount = Number(availablePoiCount);

    if (!Number.isFinite(normalizedAvailableAudioCount) || !Number.isFinite(normalizedAvailablePoiCount)) {
      console.error("[getExperienceStats] Supabase returned a non-numeric experience count", {
        availableAudioCount,
        availablePoiCount,
      });

      return { availableAudioCount: null, availablePoiCount: null };
    }

    return {
      availableAudioCount: normalizedAvailableAudioCount,
      availablePoiCount: normalizedAvailablePoiCount,
    };
  } catch (error) {
    console.error("[getExperienceStats] Unable to retrieve available audio count", error);

    return { availableAudioCount: null, availablePoiCount: null };
  }
});

export async function getExperienceStats(): Promise<ExperienceStats> {
  return getExperienceStatsCached();
}
