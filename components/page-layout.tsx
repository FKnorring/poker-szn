import { Player, PokerRoom } from "@prisma/client";
import ChartHandler from "./chart-handler";
import Header from "./header";
import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import SeasonSelector from "./season-selector";

type PageLayoutProps = {
  games: ExtendedGame[];
  players: Player[];
  totalBuyin: number;
  room: PokerRoom & { seasons: { id: string; name: string }[] };
};

export default function PageLayout({
  games,
  players,
  totalBuyin,
  room,
}: PageLayoutProps) {
  return (
    <>
      <Header editLink={`/pokerroom/${room.id}/edit`} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center">
            <div className="mr-8">
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <p className="text-muted-foreground">
                Total buyin: {room.currency} {totalBuyin}
              </p>
            </div>
            <SeasonSelector
              roomId={room.id}
              seasons={room.seasons}
              currentSeasonId={room.seasons[0].id}
            />
          </div>
          <ChartHandler
            games={games}
            players={players}
            currency={room.currency}
          />
        </div>
      </main>
    </>
  );
}
