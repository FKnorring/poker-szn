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

export default function BuyinStackChart({ games, players }: ChartProps) {
  const data = extractAverageBuyinStackData(games, players);

  return (
    <ChartContainer
      config={{
        avgBuyin: {
          label: "Average Buy-in",
          color: "#8884d8",
        },
        avgStack: {
          label: "Average Stack",
          color: "#82ca9d",
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
        <Bar
          dataKey="avgBuyin"
          fill="var(--color-avgBuyin)"
          name="Average Buy-in"
        />
        <Bar
          dataKey="avgStack"
          fill="var(--color-avgStack)"
          name="Average Stack"
        />
      </BarChart>
    </ChartContainer>
  );
}
