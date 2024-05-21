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
import { calculateMaxGain, stringToColorHash } from "../chart-utils";

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function BiggestGainChart({ games, players }: ChartProps) {
  const data = calculateMaxGain(games, players);

  return (
    <ResponsiveContainer width="100%" className="flex-grow">
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
        <Tooltip
          content={({ payload, label }) => {
            const buyin = payload?.find((p) => p.dataKey === "buyin")
              ?.value as number;
            const stack = payload?.find((p) => p.dataKey === "stack")
              ?.value as number;
            const gain = (stack || 0) + (buyin || 0);
            return (
              <div className="bg-white p-4 shadow-md rounded-md border">
                <p className="text-sm font-bold">{label}</p>
                <ul className="text-xs flex flex-col gap-1">
                  <li>Gain: {gain?.toLocaleString()} kr</li>
                  <li>Stack: {stack?.toLocaleString()} kr</li>
                  <li>Buyin: {-buyin?.toLocaleString()} kr</li>
                </ul>
              </div>
            );
          }}
        />
        <Bar dataKey="buyin" fill="#8884d8" name="Buyin" stackId="a" z={2} />
        <Bar dataKey="stack" fill="#82ca9d88" name="Stack" stackId="a" z={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}
