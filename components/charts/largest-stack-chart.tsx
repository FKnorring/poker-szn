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
import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { calculateMaxStack, stringToColorHash } from "../chart-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function LargestStackChart({ games, players }: ChartProps) {
  const data = calculateMaxStack(games, players);

  return (
    <ChartContainer
      config={{
        stack: {
          label: "Max Stack",
          color: "#8884d8",
        },
        buyin: {
          label: "Buyin",
          color: "#82ca9d",
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
          label={{ value: "Max stack", angle: -90, position: "insideLeft" }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="stack" fill="var(--color-stack)" name="Max Stack" />
        <Bar dataKey="buyin" fill="var(--color-buyin)" name="Buyin" />
      </BarChart>
    </ChartContainer>
  );
}
