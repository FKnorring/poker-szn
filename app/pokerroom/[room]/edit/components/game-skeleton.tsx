"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function GameSkeleton() {
  return (
    <div className="border py-5 px-6 rounded-md flex flex-col shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    </div>
  );
}
