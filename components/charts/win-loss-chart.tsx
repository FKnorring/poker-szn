"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import { Player } from "@prisma/client";
import {
  extractAverageBuyinStackData,
  extractWinsLossesData,
  stringToColorHash,
} from "../chart-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function WinLossChart({ games, players }: ChartProps) {
  const data = extractWinsLossesData(games, players);

  return (
    <ChartContainer
      config={{
        wins: {
          label: "Vinster",
          color: "#82ca9d",
        },
        losses: {
          label: "Förluster",
          color: "#d45079",
        },
      }}
      className="flex-1"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          interval={0}
          tick={({ x, y, payload }) => {
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  className="hidden lg:block text-xs"
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="start"
                  fill="#666"
                >
                  {payload.value}
                </text>
                <text
                  className="block lg:hidden text-xs"
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="end"
                  fill="#666"
                  transform="rotate(-35)"
                >
                  {payload.value
                    .split(" ")
                    .map((c: string) => c[0])
                    .join("")}
                </text>
              </g>
            );
          }}
          dataKey="name"
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="wins" fill="var(--color-wins)" name="Vinster" />
        <Bar dataKey="losses" fill="var(--color-losses)" name="Förluster" />
      </BarChart>
    </ChartContainer>
  );
}
