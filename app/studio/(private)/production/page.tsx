import StudioProductionPage from "@/components/studio/StudioProductionPage";
import { readStudioProductionSnapshot } from "@/lib/studio/production";

export default async function StudioProductionRoutePage() {
  const snapshot = await readStudioProductionSnapshot();

  return <StudioProductionPage snapshot={snapshot} />;
}
