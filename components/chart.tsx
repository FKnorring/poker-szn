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

type PlayerNames = {
  [id: string]: string;
};

type PlayerData = {
  [name: string]: number;
};

type GameData = {
  name: string;
} & PlayerData;

export function stringToColorHash(name: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert the hash to a 6-digit hexadecimal code
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
}

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
  renderPlayer: (payload: Payload) => JSX.Element;
}

export function extractGameData(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, { name, id }) => {
    return { [id]: name, ...acc };
  }, {});
  const data: GameData[] = [...new Array(games.length)];

  games
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((game, i) => {
      const players: PlayerData = Object.values(playerNames).reduce(
        (acc, name) => {
          return { [name]: 0, ...acc };
        },
        {}
      );
      if (i !== 0) {
        const prev = { ...data[i - 1] };
        // @ts-ignore
        delete prev.name;
        Object.entries(prev).forEach(([name, score]) => {
          // @ts-ignore
          players[name] = score;
        });
      }
      game.scores.forEach(({ playerId, stack, buyins }) => {
        players[playerNames[playerId]] += stack - buyins * 100;
      });
      // @ts-ignore
      data[i] = {
        name: game.date.toLocaleDateString("sv-SE", {
          month: "short",
          day: "2-digit",
        }),
        ...players,
      };
    });
  return data;
}

export default function Chart({ games, players, renderPlayer }: ChartProps) {
  const data = extractGameData(games, players);

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
        <Brush dataKey="name" height={30} stroke="#8884d8" />
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
