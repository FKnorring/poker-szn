"use client";
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
import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import { extractTotals, stringToColorHash } from "../chart-utils";

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
    <ResponsiveContainer width="100%" className="flex-grow">
      <LineChart
        data={data}
        margin={{ top: 30, right: 10, left: 0, bottom: 30 }}
        className="bg-white rounded-md"
      >
        <XAxis dataKey="name" padding="gap" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          content={({ active, payload, label }) => (
            <div className="bg-white p-4 shadow-md rounded-md border">
              <p className="text-sm font-bold">{label}</p>
              <ul className="text-xs flex flex-col gap-1">
                {payload?.map((entry) => (
                  <li key={entry.dataKey}>
                    {entry.dataKey}: {entry.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        />
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
              activeDot={{ r: 8 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
