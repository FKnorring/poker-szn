import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { PokerRoom } from "@prisma/client";
import Header from "@/components/header";

type RoomWithCounts = PokerRoom & {
  _count: {
    players: number;
    games: number;
  };
};

export default async function PokerRooms() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  // Fetch rooms where user is either creator or manager
  const rooms = await prisma.pokerRoom.findMany({
    where: {
      OR: [
        { creatorId: user.id },
        {
          managers: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    include: {
      _count: {
        select: {
          players: true,
          games: true,
        },
      },
    },
  });

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="sm:text-3xl font-bold">Your Poker Rooms</h1>
            <Link href="/pokerrooms/create">
              <Button>Create New Room</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {rooms.map((room: RoomWithCounts) => (
              <div
                key={room.id}
                className="border rounded-lg p-6 space-y-4 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{room.name}</h2>
                    <p className="text-muted-foreground">
                      {room.currency} · Default Buy-in: {room.defaultBuyIn}
                    </p>
                  </div>
                  {room.creatorId === user.id && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Owner
                    </span>
                  )}
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{room._count.players} Players</span>
                  <span>{room._count.games} Games</span>
                </div>

                <div className="flex gap-4">
                  <Link href={`/pokerroom/${room.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      View Stats
                    </Button>
                  </Link>
                  <Link href={`/pokerroom/${room.id}/edit`} className="flex-1">
                    <Button className="w-full">Manage Room</Button>
                  </Link>
                </div>
              </div>
            ))}

            {rooms.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                You haven&apos;t created or been added to any poker rooms yet.
                <br />
                Create your first room to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
