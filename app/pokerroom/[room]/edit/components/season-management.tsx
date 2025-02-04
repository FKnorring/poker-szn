"use client";

import { Season } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/datepicker";
import { Edit2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

interface SeasonManagementProps {
  seasons: Season[];
  onSeasonUpdate: (seasonId: string, data: { name: string; startDate?: Date; endDate?: Date }) => Promise<void>;
  onSeasonCreate: (data: { name: string; startDate: Date; endDate?: Date }) => Promise<void>;
  roomId: string;
}

export default function SeasonManagement({ 
  seasons, 
  onSeasonUpdate,
  onSeasonCreate,
  roomId 
}: SeasonManagementProps) {
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    name: string;
    startDate: Date;
    endDate?: Date;
  }>({
    name: "",
    startDate: new Date(),
  });
  const [isAddingNewSeason, setIsAddingNewSeason] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: "",
    startDate: new Date(),
    endDate: undefined as Date | undefined
  });

  const handleEdit = (season: Season) => {
    setEditingSeasonId(season.id);
    setEditData({
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate || undefined
    });
  };

  const handleSave = async (seasonId: string) => {
    try {
      await onSeasonUpdate(seasonId, editData);
      setEditingSeasonId(null);
      toast("Season updated successfully!");
    } catch (error) {
      toast("Failed to update season", { 
        description: "Please try again"
      });
    }
  };

  const handleCreateSeason = async () => {
    if (!newSeason.name) {
      toast("Please enter a season name", {
        description: "The season name is required"
      });
      return;
    }

    try {
      await onSeasonCreate(newSeason);
      setIsAddingNewSeason(false);
      setNewSeason({
        name: "",
        startDate: new Date(),
        endDate: undefined
      });
      toast("New season created successfully!");
    } catch (error) {
      toast("Failed to create season", {
        description: "Please try again"
      });
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return format(date, "PP");
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Seasons</h2>
        {!isAddingNewSeason && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingNewSeason(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Season
          </Button>
        )}
      </div>

      {isAddingNewSeason && (
        <div className="border-b pb-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">New Season</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingNewSeason(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Season name"
              value={newSeason.name}
              onChange={(e) => setNewSeason(prev => ({ ...prev, name: e.target.value }))}
            />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
              <DatePicker
                value={newSeason.startDate}
                onChange={(date) => setNewSeason(prev => ({ ...prev, startDate: date || new Date() }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">End Date (Optional)</label>
              <DatePicker
                value={newSeason.endDate}
                onChange={(date) => setNewSeason(prev => ({ ...prev, endDate: date }))}
              />
            </div>
            <Button onClick={handleCreateSeason} className="w-full">
              Create Season
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {seasons.map((season) => (
          <div key={season.id} className="flex flex-col gap-2 p-2 bg-muted/50 rounded-md">
            {editingSeasonId === season.id ? (
              <>
                <div className="space-y-2">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="max-w-[200px]"
                  />
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                    <DatePicker
                      value={editData.startDate}
                      onChange={(date) => setEditData(prev => ({ ...prev, startDate: date || new Date() }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">End Date</label>
                    <DatePicker
                      value={editData.endDate}
                      onChange={(date) => setEditData(prev => ({ ...prev, endDate: date }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(season.id)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{season.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(season.startDate)} - {formatDate(season.endDate)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(season)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 