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
        width={500}
        height={900}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" padding="gap" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
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
        {players.map(({ name }) => (
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
