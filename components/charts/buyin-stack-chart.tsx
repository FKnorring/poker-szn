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
import {
  extractAverageBuyinStackData,
  stringToColorHash,
} from "../chart-utils";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function BuyinStackChart({ games, players }: ChartProps) {
  const data = extractAverageBuyinStackData(games, players);

  return (
    <ResponsiveContainer width="100%">
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
        <Tooltip
          content={({ payload, label }) => {
            const avgBuyin = payload?.find((p) => p.dataKey === "avgBuyin")
              ?.value as number;
            const avgStack = payload?.find((p) => p.dataKey === "avgStack")
              ?.value as number;
            const avgGain = (avgStack || 0) - (avgBuyin || 0);
            return (
              <div className="bg-white p-4 shadow-md rounded-md border">
                <p className="text-sm font-bold">{label}</p>
                <ul className="text-xs flex flex-col gap-1">
                  {payload?.map((entry) => (
                    <li key={entry.dataKey}>
                      {entry.name}: {entry.value?.toLocaleString()} kr
                    </li>
                  ))}
                  <li>Average Gain: {avgGain?.toLocaleString()} kr</li>
                </ul>
              </div>
            );
          }}
        />
        <Legend />
        <Bar dataKey="avgBuyin" fill="#8884d8" name="Average Buy-in" />
        <Bar dataKey="avgStack" fill="#82ca9d" name="Average Stack" />
      </BarChart>
    </ResponsiveContainer>
  );
}
