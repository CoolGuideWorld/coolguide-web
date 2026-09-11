"use client";

import dynamic from "next/dynamic";
import type { ExperienceDestinationMapPoint } from "@/services/destinations/getExperienceDestinationsMap";

type ExperienceDestinationsMapSlotProps = {
  destinations: ExperienceDestinationMapPoint[];
};

const ExperienceDestinationsMap = dynamic(
  () => import("./ExperienceDestinationsMap"),
  { ssr: false }
);

export default function ExperienceDestinationsMapSlot({ destinations }: ExperienceDestinationsMapSlotProps) {
  return <ExperienceDestinationsMap destinations={destinations} />;
}
