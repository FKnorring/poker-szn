"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Plus, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface CreationManagementProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onQuickAdd: () => void;
  onAddGame: () => void;
}

export default function CreationManagement({
  selectedDate,
  setSelectedDate,
  onQuickAdd,
  onAddGame,
}: CreationManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onQuickAdd}
                variant="default"
                className="flex items-center justify-center gap-1"
              >
                Quick add game <Zap size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Creates a new game for today&apos;s date</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DatePicker
          className="max-w-[150px] ml-auto"
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <Button
          onClick={onAddGame}
          variant="secondary"
          className="flex items-center justify-center gap-1"
          disabled={!selectedDate}
        >
          Add game <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
