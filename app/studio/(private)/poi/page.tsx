import StudioPoiCoveragePage from "@/components/studio/StudioPoiCoveragePage";
import { readPoiQualitySnapshot } from "@/lib/studio/poiQuality";

type StudioPoiPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StudioPoiPage({ searchParams }: StudioPoiPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filterParam = resolvedSearchParams.filter;
  const filterQuery = Array.isArray(filterParam) ? filterParam[0] : filterParam;

  const snapshot = await readPoiQualitySnapshot();

  return (
    <StudioPoiCoveragePage
      rows={snapshot.rows}
      citySummaries={snapshot.citySummaries}
      summary={snapshot.summary}
      error={snapshot.error}
      initialFilterQuery={filterQuery ?? null}
    />
  );
}
