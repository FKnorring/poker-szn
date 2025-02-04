"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Player } from "@prisma/client";

interface PlayerWithCount extends Player {
  _count: {
    games: number;
  };
}

interface AutoCompleteProps {
  players: PlayerWithCount[];
  roomId: string;
}

export default function AutoComplete({ players, roomId }: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [_players, setPlayers] = useState<PlayerWithCount[]>(players);

  useEffect(() => {
    setPlayers(players);
  }, [players]);

  function addPlayer() {
    setPlayers((players) => {
      const player = {
        id: crypto.randomUUID(),
        name: query,
        _count: { games: 0 },
        roomId,
      };
      return [...players, player];
    });

    setValue(query);
    setOpen(false);
  }

  return (
    <>
      <input
        name="player"
        type="text"
        hidden
        value={value}
        onChange={() => {}}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value || "Search for players"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={(search) => setQuery(search)}
              placeholder="Search for players"
            />
            <CommandEmpty className="flex justify-center py-4">
              <Button
                onClick={addPlayer}
                className="flex gap-1 items-center justify-center"
              >
                Add new player <Plus size={16} />
              </Button>
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {_players.map((player) => (
                <CommandItem
                  key={player.id}
                  onSelect={() => {
                    setValue(player.name === value ? "" : player.name);
                    setOpen(false);
                  }}
                  className="flex justify-between"
                >
                  <span>{player.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {player._count.games}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
