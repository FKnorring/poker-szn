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
  Cell,
  ReferenceLine,
} from "recharts";
import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { extractHourlyRate, stringToColorHash } from "../chart-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function RateChart({ games, players }: ChartProps) {
  const data = extractHourlyRate(games, players);

  return (
    <ChartContainer
      config={{
        hourlyRate: {
          label: "Timlön",
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
          label={{
            value: "Timlön",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="hourlyRate">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.hourlyRate > 0
                  ? "#22c55e"
                  : entry.hourlyRate < 0
                  ? "#ef4444"
                  : "#6b7280"
              }
            />
          ))}
        </Bar>
        <ReferenceLine y={0} stroke="#6b7280" />
      </BarChart>
    </ChartContainer>
  );
}
