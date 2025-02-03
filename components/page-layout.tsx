import { Player, PokerRoom } from "@prisma/client";
import ChartHandler from "./chart-handler";
import Header from "./header";
import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";

type PageLayoutProps = {
  games: ExtendedGame[];
  players: Player[];
  totalBuyin: number;
  room: PokerRoom & { seasons: { id: string; name: string }[] };
  showEditButton?: boolean;
  showSeasonSelector?: boolean;
  currentSeasonId?: string;
};

export default function PageLayout({
  games,
  players,
  totalBuyin,
  room,
  showEditButton = false,
  showSeasonSelector = false,
  currentSeasonId,
}: PageLayoutProps) {
  return (
    <>
      <Header
        editLink={`/pokerroom/${room.id}/edit`}
        showSeasonSelector={showSeasonSelector}
        roomId={room.id}
        seasons={room.seasons}
        currentSeasonId={currentSeasonId}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">
              Total buy-ins: {room.currency} {totalBuyin}
            </p>
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
