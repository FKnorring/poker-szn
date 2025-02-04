import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Player } from "@prisma/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SeatingProps {
  players: Player[];
}

export default function Seating({ players }: SeatingProps) {
  const [_players, setPlayers] = useState(players);
  const [isTableView, setIsTableView] = useState(true);
  const [fixedPlayerId, setFixedPlayerId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tableRotation, setTableRotation] = useState(0);

  useEffect(() => {
    setPlayers(players);
  }, [players]);

  function shufflePlayers() {
    let playersToShuffle = fixedPlayerId
      ? [..._players.filter((p) => p.id !== fixedPlayerId)]
      : [..._players];

    const shuffled = playersToShuffle.sort(() => 0.5 - Math.random());

    // If there's a fixed player, add them back at the start
    if (fixedPlayerId) {
      const fixedPlayer = _players.find((p) => p.id === fixedPlayerId);
      if (fixedPlayer) {
        shuffled.unshift(fixedPlayer);
      }
    }

    setPlayers(shuffled);
  }

  function randomize() {
    setIsSpinning(true);
    // Spin the table
    setTableRotation((prev) => prev + 360);

    shufflePlayers();

    // Reset spinning after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 200);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("");
  }

  function toggleFixedPlayer(playerId: string) {
    if (fixedPlayerId === playerId) {
      setFixedPlayerId(null);
    } else {
      setFixedPlayerId(playerId);
    }
  }

  const TableView = () => (
    <div className="relative w-[150px] h-[150px] rounded-full mx-auto bg-green-900 border-2 border-white my-16">
      <motion.div
        className="absolute inset-0"
        animate={{
          rotate: tableRotation,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        {_players.map((player, i, arr) => {
          const angle = (2 * Math.PI * i) / arr.length - Math.PI / 2; // Start from top
          const radius = 110; // Slightly larger than half the container (150/2 = 75)
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={player.id}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer
                ${
                  player.id === fixedPlayerId ? "bg-green-600" : "bg-slate-800"
                }`}
              style={{
                left: x + 60,
                top: y + 60,
              }}
              animate={{
                rotate: -tableRotation,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              onClick={() => toggleFixedPlayer(player.id)}
            >
              {getInitials(player.name)}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  const ListView = () => (
    <div className="max-h-[300px] overflow-y-auto">
      {_players.map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-2 my-1 rounded cursor-pointer
            ${player.id === fixedPlayerId ? "bg-green-600" : "bg-slate-800"}`}
          onClick={() => toggleFixedPlayer(player.id)}
        >
          <span className="text-white">
            {index + 1}. {player.name}
          </span>
          {player.id === fixedPlayerId && (
            <span className="text-xs text-white">Fixed</span>
          )}
        </div>
      ))}
    </div>
  );

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
          <div className="flex items-center justify-end space-x-2 mb-4">
            <Label htmlFor="view-toggle">List</Label>
            <Switch
              id="view-toggle"
              checked={isTableView}
              onCheckedChange={setIsTableView}
            />
            <Label htmlFor="view-toggle">Table</Label>
          </div>

          {isTableView ? <TableView /> : <ListView />}

          <Button
            className="float-right"
            onClick={isTableView ? randomize : shufflePlayers}
            disabled={isSpinning}
          >
            Shuffle seats
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
