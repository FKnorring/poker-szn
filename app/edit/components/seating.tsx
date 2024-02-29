import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Player } from "@prisma/client";
import { useEffect, useState } from "react";

interface SeatingProps {
  players: Player[];
}

export default function Seating({ players }: SeatingProps) {
  const [_players, setPlayers] = useState(players);

  useEffect(() => {
    setPlayers(players);
  }, [players]);

  function randomize() {
    const shuffled = _players.sort(() => 0.5 - Math.random());
    setPlayers([...shuffled]);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Seating</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] rounded">
        <DialogHeader>
          <DialogTitle>Seating</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="relative w-[150px] h-[150px] rounded-full mx-auto bg-slate-900 my-16">
            {_players.map((player, i, arr) => {
              const angle = (360 / arr.length) * i; // Angle for each player
              // Calculate the player's position on a circle
              const radius = 100; // Adjust this value to move players closer or further from the center
              const playerX = radius * Math.cos((angle * Math.PI) / 180);
              const playerY = radius * Math.sin((angle * Math.PI) / 180);

              return (
                <div
                  key={player.id}
                  className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${playerX}px)`,
                    top: `calc(50% + ${playerY}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {getInitials(player.name)}
                </div>
              );
            })}
          </div>
          <Button className="float-right" onClick={randomize}>
            Randomize
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
