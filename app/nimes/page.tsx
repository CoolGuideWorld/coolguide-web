import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityDestinationPage from "@/components/cities/CityDestinationPage";
import { getCity } from "@/services/cities/getCity";
import { isCityPublishable } from "@/services/cities/isCityPublishable";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nimes | CoolGuide World",
  description: "Prototype de fiche destination premium pour la ville de Nimes.",
};

export default async function NimesPage() {
  const cityData = await getCity("nimes");

  if (!cityData || !isCityPublishable(cityData)) {
    notFound();
  }

  return <CityDestinationPage cityData={cityData} />;
}
