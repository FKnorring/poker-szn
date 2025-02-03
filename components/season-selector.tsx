"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@prisma/client";
import { Label } from "./ui/label";
import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import { useState } from "react";

interface SeasonSelectorProps {
  seasons: Pick<Season, "id" | "name">[];
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
}

export default function SeasonSelector({
  seasons,
  selectedSeason,
  onSeasonChange,
}: SeasonSelectorProps) {
  const handleSeasonChange = (value: string) => {
    onSeasonChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="hidden lg:block">Season</Label>
      <Select value={selectedSeason} onValueChange={handleSeasonChange}>
        <SelectTrigger className="w-[90px] lg:w-[180px]">
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season.id} value={season.id}>
              {season.name}
            </SelectItem>
          ))}
          <SelectItem value="all">All Seasons</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
