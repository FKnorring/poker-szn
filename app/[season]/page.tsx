// pages/index/[season].tsx
import { getPageData } from "../utils/page-data";
import PageLayout from "@/components/page-layout";
import { ALL_SEASONS } from "@/config/season";

export async function generateStaticParams() {
  return [
    ...ALL_SEASONS.map((season) => ({ season: season.id.toString() })),
    { season: "all" },
  ];
}

export default async function SeasonPage({
  params,
}: {
  params: { season: string };
}) {
  const { games, players, totalBuyin } = await getPageData(params.season);
  return <PageLayout games={games} players={players} totalBuyin={totalBuyin} />;
}
