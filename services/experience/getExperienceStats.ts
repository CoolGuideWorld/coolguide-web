import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExperienceStats = {
  availableAudioCount: number | null;
};

type AudioPoiJoinRow = {
  poi_id: string | null;
};

const getExperienceStatsCached = cache(async (): Promise<ExperienceStats> => {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("audios")
      .select("poi_id, poi:poi!inner(id, status)")
      .eq("status", "active")
      .not("audio_url", "is", null)
      .eq("poi.status", "active");

    if (error) {
      console.error("[getExperienceStats] Unable to retrieve available audio count", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return { availableAudioCount: null };
    }

    const distinctPoiIds = new Set(
      ((data ?? []) as AudioPoiJoinRow[])
        .map((row) => row.poi_id)
        .filter((poiId): poiId is string => Boolean(poiId))
    );

    return {
      availableAudioCount: distinctPoiIds.size,
    };
  } catch (error) {
    console.error("[getExperienceStats] Unable to retrieve available audio count", error);

    return { availableAudioCount: null };
  }
});

export async function getExperienceStats(): Promise<ExperienceStats> {
  return getExperienceStatsCached();
}
