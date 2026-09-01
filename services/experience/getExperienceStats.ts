import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getGlobalPublishableCityCount } from "@/services/destinations";

export type ExperienceStats = {
  availableAudioCount: number | null;
  availablePoiCount: number | null;
  cityCount: number | null;
  premiumAudioCount: number | null;
};

const getExperienceStatsCached = cache(async (): Promise<ExperienceStats> => {
  try {
    const supabase = createServerSupabaseClient();

    const [
      { count: availableAudioCount, error: audioError },
      { count: availablePoiCount, error: poiError },
      { count: premiumAudioCount, error: premiumAudioError },
      cityCount,
    ] =
      await Promise.all([
        supabase.from("audios").select("id", { count: "exact", head: true }),
        supabase.from("poi").select("id", { count: "exact", head: true }),
        supabase.from("audio_premium").select("id", { count: "exact", head: true }),
        getGlobalPublishableCityCount(),
      ]);

    if (audioError || poiError || premiumAudioError) {
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
        premiumAudioError: premiumAudioError
          ? {
              message: premiumAudioError.message,
              code: premiumAudioError.code,
              details: premiumAudioError.details,
              hint: premiumAudioError.hint,
            }
          : null,
      });
    }

    const normalizedAvailableAudioCount = Number(availableAudioCount);
    const normalizedAvailablePoiCount = Number(availablePoiCount);
    const normalizedPremiumAudioCount = Number(premiumAudioCount);
    const normalizedCityCount = Number(cityCount);

    if (
      (!audioError && !Number.isFinite(normalizedAvailableAudioCount)) ||
      (!poiError && !Number.isFinite(normalizedAvailablePoiCount)) ||
      (!premiumAudioError && !Number.isFinite(normalizedPremiumAudioCount)) ||
      !Number.isFinite(normalizedCityCount)
    ) {
      console.error("[getExperienceStats] Supabase returned a non-numeric experience count", {
        availableAudioCount,
        availablePoiCount,
        premiumAudioCount,
        cityCount,
      });
    }

    return {
      availableAudioCount:
        !audioError && Number.isFinite(normalizedAvailableAudioCount)
          ? normalizedAvailableAudioCount
          : null,
      availablePoiCount:
        !poiError && Number.isFinite(normalizedAvailablePoiCount)
          ? normalizedAvailablePoiCount
          : null,
      cityCount: Number.isFinite(normalizedCityCount) ? normalizedCityCount : null,
      premiumAudioCount:
        !premiumAudioError && Number.isFinite(normalizedPremiumAudioCount)
          ? normalizedPremiumAudioCount
          : null,
    };
  } catch (error) {
    console.error("[getExperienceStats] Unable to retrieve available audio count", error);

    return {
      availableAudioCount: null,
      availablePoiCount: null,
      cityCount: null,
      premiumAudioCount: null,
    };
  }
});

export async function getExperienceStats(): Promise<ExperienceStats> {
  return getExperienceStatsCached();
}
