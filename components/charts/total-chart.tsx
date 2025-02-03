"use client";;
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import { extractTotals, stringToColorHash } from "../chart-utils";

import type { JSX } from "react";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
  renderPlayer: (payload: Payload) => JSX.Element;
  includeLatest: boolean;
}

export default function TotalChart({
  games,
  players,
  renderPlayer,
  includeLatest,
}: ChartProps) {
  const data = extractTotals(games, players);

  return (
    <ChartContainer
      config={{
        desktop: {
          label: "Desktop",
          color: "#2563eb",
        },
        mobile: {
          label: "Mobile",
          color: "#60a5fa",
        },
      }}
      className="flex-1 saturate-200"
    >
      <LineChart accessibilityLayer data={data} className="rounded-md">
        <XAxis dataKey="name" />
        <YAxis axisLine={false} />
        <CartesianGrid strokeDasharray="3 3" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Brush
          startIndex={data.length - (includeLatest ? 6 : 7)}
          endIndex={data.length - (includeLatest ? 1 : 2)}
          travellerWidth={20}
          dataKey="name"
          height={30}
          stroke="#8884d8"
        />
        <Legend
          align="right"
          verticalAlign="middle"
          layout="vertical"
          content={({ payload }) => {
            return (
              <ul className="flex flex-col">
                {payload?.map((entry) => renderPlayer(entry))}
              </ul>
            );
          }}
        />
        {players
          .sort(
            (a, b) =>
              data[data.length - 1][b.name] - data[data.length - 1][a.name]
          )
          .map(({ name }) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={stringToColorHash(name)}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          ))}
      </LineChart>
    </ChartContainer>
  );
}
