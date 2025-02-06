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
import { calculateTotalBuyin, stringToColorHash } from "../chart-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function BuyinChart({ games, players }: ChartProps) {
  const data = calculateTotalBuyin(games, players);

  return (
    <ChartContainer
      config={{
        buyin: {
          label: "Total buyin",
          color: "#8884d8",
        },
      }}
      className="flex-1"
    >
      <BarChart data={data}>
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
        <YAxis
          label={{ value: "Total buyin", angle: -90, position: "insideLeft" }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="buyin" fill="var(--color-buyin)" />
      </BarChart>
    </ChartContainer>
  );
}
