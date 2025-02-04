"use client";

import { Season } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/datepicker";
import { Edit2, Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

interface SeasonManagementProps {
  seasons: Season[];
  onSeasonUpdate: (
    seasonId: string,
    data: {
      name: string;
      startDate: string;
      endDate?: string;
    }
  ) => Promise<Season>;
  onSeasonCreate: (data: {
    name: string;
    startDate: Date;
    endDate?: Date;
  }) => Promise<Season>;
  roomId: string;
}

export default function SeasonManagement({
  seasons: initialSeasons,
  onSeasonUpdate,
  onSeasonCreate,
  roomId,
}: SeasonManagementProps) {
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [seasons, setSeasons] = useState(initialSeasons);
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
    endDate: undefined as Date | undefined,
  });
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({
    create: false,
  });

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (season: Season) => {
    setEditingSeasonId(season.id);
    setEditData({
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate || undefined,
    });
  };

  const handleSave = async (seasonId: string) => {
    try {
      setLoading(seasonId, true);
      const updatedSeason = await onSeasonUpdate(seasonId, {
        name: editData.name,
        startDate: new Date(editData.startDate).toISOString(),
        endDate: editData.endDate
          ? new Date(editData.endDate).toISOString()
          : undefined,
      });
      setSeasons((prev) =>
        prev.map((s) => (s.id === seasonId ? updatedSeason : s))
      );

      setEditingSeasonId(null);
      toast.success("Season updated successfully!");
    } catch (error) {
      toast.error("Failed to update season", {
        description: "Please try again",
      });
    } finally {
      setLoading(seasonId, false);
    }
  };

  const handleCreateSeason = async () => {
    if (!newSeason.name) {
      toast.error("Please enter a season name", {
        description: "The season name is required",
      });
      return;
    }

    try {
      setLoading("create", true);
      const createdSeason = await onSeasonCreate({
        name: newSeason.name,
        startDate: newSeason.startDate,
        endDate: newSeason.endDate,
      });
      setSeasons((prev) => [...prev, createdSeason]);
      setIsAddingNewSeason(false);
      setNewSeason({
        name: "",
        startDate: new Date(),
        endDate: undefined,
      });
      toast.success("New season created successfully!");
    } catch (error) {
      toast.error("Failed to create season", {
        description: "Please try again",
      });
    } finally {
      setLoading("create", false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return format(date, "PP");
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Seasons</h2>
        {!isAddingNewSeason && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingNewSeason(true)}
            className="flex items-center gap-1"
            disabled={loadingStates.create}
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
              disabled={loadingStates.create}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Season name"
              value={newSeason.name}
              onChange={(e) =>
                setNewSeason((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={loadingStates.create}
            />
            <div
              className={
                loadingStates.create ? "opacity-50 pointer-events-none" : ""
              }
            >
              <label className="text-sm text-muted-foreground mb-1 block">
                Start Date
              </label>
              <DatePicker
                className="max-w-[200px]"
                value={newSeason.startDate}
                onChange={(date) =>
                  setNewSeason((prev) => ({
                    ...prev,
                    startDate: date || new Date(),
                  }))
                }
              />
            </div>
            <div
              className={
                loadingStates.create ? "opacity-50 pointer-events-none" : ""
              }
            >
              <label className="text-sm text-muted-foreground mb-1 block">
                End Date (Optional)
              </label>
              <DatePicker
                className="max-w-[200px]"
                value={newSeason.endDate}
                onChange={(date) =>
                  setNewSeason((prev) => ({ ...prev, endDate: date }))
                }
              />
            </div>
            <Button
              onClick={handleCreateSeason}
              className="w-full"
              disabled={loadingStates.create}
            >
              {loadingStates.create ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loadingStates.create ? "Creating..." : "Create Season"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="flex flex-col gap-2 p-4 bg-muted/50 rounded-md"
          >
            {editingSeasonId === season.id ? (
              <>
                <div className="space-y-2">
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="max-w-full"
                    disabled={loadingStates[season.id]}
                  />
                  <div
                    className={
                      loadingStates[season.id]
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Start Date
                    </label>
                    <DatePicker
                      className="max-w-full"
                      value={editData.startDate}
                      onChange={(date) =>
                        setEditData((prev) => ({
                          ...prev,
                          startDate: date || new Date(),
                        }))
                      }
                    />
                  </div>
                  <div
                    className={
                      loadingStates[season.id]
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <label className="text-sm text-muted-foreground mb-1 block">
                      End Date
                    </label>
                    <DatePicker
                      className="max-w-full"
                      value={editData.endDate}
                      onChange={(date) =>
                        setEditData((prev) => ({ ...prev, endDate: date }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(season.id)}
                    disabled={loadingStates[season.id]}
                  >
                    {loadingStates[season.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{season.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(season.startDate)} -{" "}
                      {formatDate(season.endDate)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(season)}
                    disabled={loadingStates[season.id]}
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
