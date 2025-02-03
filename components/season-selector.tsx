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

interface SeasonSelectorProps {
  roomId: string;
  seasons: Pick<Season, "id" | "name">[];
  currentSeasonId?: string;
}

export default function SeasonSelector({
  roomId,
  seasons,
  currentSeasonId,
}: SeasonSelectorProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Label className="hidden lg:block">Season</Label>
      <Select
        value={currentSeasonId || seasons[0]?.id}
        onValueChange={(value) => {
          if (value === "all") {
            router.push(`/pokerroom/${roomId}/all`);
          } else {
            router.push(`/pokerroom/${roomId}/${value}`);
          }
        }}
      >
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
