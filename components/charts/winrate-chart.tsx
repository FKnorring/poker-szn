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
import { extractWinrate, stringToColorHash } from "../chart-utils";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function WinRateChart({ games, players }: ChartProps) {
  const data = extractWinrate(games, players);

  return (
    <ResponsiveContainer width="100%" className="flex-grow">
      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis
          label={{ value: "Vinst (%)", angle: -90, position: "insideLeft" }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          content={({ payload, label }) => (
            <div className="bg-white p-4 shadow-md rounded-md border">
              <p className="text-sm font-bold">{label}</p>
              <ul className="text-xs flex flex-col gap-1">
                {payload?.map((entry) => (
                  <li key={entry.dataKey}>
                    Vinst: {entry.value?.toLocaleString()}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        />
        <Bar dataKey="WinRate" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
