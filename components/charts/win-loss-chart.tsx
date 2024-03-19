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
  extractWinsLossesData,
  stringToColorHash,
} from "../chart-utils";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function WinLossChart({ games, players }: ChartProps) {
  const data = extractWinsLossesData(games, players);

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
          content={({ payload, label }) => (
            <div className="bg-white p-4 shadow-md rounded-md border">
              <p className="text-sm font-bold">{label}</p>
              <ul className="text-xs flex flex-col gap-1">
                {payload?.map((entry) => (
                  <li key={entry.dataKey}>
                    {entry.name}: {entry.value?.toLocaleString()}
                  </li>
                ))}
                <li></li>
              </ul>
            </div>
          )}
        />
        <Legend />
        <Bar dataKey="wins" fill="#82ca9d" name="Vinster" />
        <Bar dataKey="losses" fill="#d45079" name="Förluster" />
      </BarChart>
    </ResponsiveContainer>
  );
}
