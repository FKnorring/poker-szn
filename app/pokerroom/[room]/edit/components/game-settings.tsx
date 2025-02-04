"use client";

import { ExtendedGame } from "../games";
import { Season } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface GameSettingsProps {
  game: ExtendedGame;
  seasons: Season[];
  onUpdate: (data: { seasonId?: string; buyIn?: number }) => Promise<void>;
}

export default function GameSettings({
  game,
  seasons,
  onUpdate,
}: GameSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    seasonId: game.seasonId,
    buyIn: game.buyIn,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onUpdate(settings);
      setHasChanges(false);
      toast.success("Game settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update game settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Season</Label>
          <Select
            value={settings.seasonId}
            onValueChange={(value) => handleChange("seasonId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Buy-in Amount</Label>
          <Input
            type="number"
            value={settings.buyIn}
            onChange={(e) => handleChange("buyIn", parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>
      {hasChanges && (
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="self-end"
          size="sm"
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              Save changes <Save className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
