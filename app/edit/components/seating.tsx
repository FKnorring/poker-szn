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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seating</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="relative w-[300px] h-[200px] rounded-full mx-auto bg-slate-900">
            {_players.map((player, i, arr) => {
              const theta = ((2 * Math.PI) / arr.length) * i; // Angle for each player in radians
              const radiusMult = 1.25;
              const a = 150 * radiusMult; // Semi-major axis (half the width of the oval)
              const b = 100 * radiusMult; // Semi-minor axis (half the height of the oval)

              // Calculate the player's position on an ellipse
              const playerX = a * Math.cos(theta);
              const playerY = b * Math.sin(theta);

              return (
                <div
                  key={player.id}
                  className="bg-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
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
          <Button onClick={randomize}>Randomize</Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
