"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  onSelect: (playerName: string) => void;
  isLoading?: boolean;
}

export default function AutoComplete({
  players,
  roomId,
  onSelect,
  isLoading = false,
}: AutoCompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const newValue = currentValue === value ? "" : currentValue;
      setValue(newValue);
      onSelect(newValue);
      setOpen(false);
    },
    [value, onSelect]
  );

  React.useEffect(() => {
    if (!isLoading && value) {
      setValue("");
      setInputValue("");
    }
  }, [isLoading]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding player...</span>
            </>
          ) : (
            <>
              {value || "Select player..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search players..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue && (
                <Button
                  type="button"
                  onClick={() => handleSelect(inputValue)}
                  className="flex items-center justify-center w-full gap-2 p-2"
                  disabled={isLoading}
                >
                  Add new player <Plus className="w-4 h-4" />
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  onSelect={handleSelect}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{player.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {player._count.games} games
                      </span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === player.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
