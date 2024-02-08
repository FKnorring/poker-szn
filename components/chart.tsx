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

interface ChartProps {
  games: ExtendedGame[];
  players: Player[];
}

function stringToColorHash(name: string): string {
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

export default function Chart({ games, players }: ChartProps) {
  const playerNames = players.reduce((acc, { name, id }) => {
    return { [id]: name, ...acc };
  }, {});
  const data = [...new Array(games.length)];

  games
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((game, i) => {
      const players = Object.values(playerNames).reduce((acc, name) => {
        return { [name]: 0, ...acc };
      }, {});
      if (i !== 0) {
        const prev = { ...data[i - 1] };
        delete prev.name;
        Object.entries(prev).forEach(([name, score]) => {
          players[name] = score;
        });
      }
      game.scores.forEach(({ playerId, stack, buyins }) => {
        players[playerNames[playerId]] += stack - buyins * 100;
      });
      data[i] = { name: game.date.toLocaleDateString("sv-SE"), ...players };
    });

  return (
    <ResponsiveContainer width="100%" height={600}>
      <LineChart
        width={500}
        height={600}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        {Object.values(playerNames).map((name) => (
          <Line
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
