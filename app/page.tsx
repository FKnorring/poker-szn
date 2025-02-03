import { getPageData } from "./utils/page-data";
import PageLayout from "@/components/page-layout";

export default async function Home() {
  const { games, players, totalBuyin } = await getPageData();
  return <PageLayout games={games} players={players} totalBuyin={totalBuyin} />;
}
