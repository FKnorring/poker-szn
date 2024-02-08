import * as d3 from "d3";
import { Game, Player, Score } from "@prisma/client";
import { ExtendedGame } from "@/app/edit/games";

interface LinePlotProps {
  players: Player[];
  games: Game[];
  scores: Score[];
}

export default function LinePlot({ games, players, scores }: LinePlotProps) {
  const width = 800;
  const height = 800;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const dates = games
    .map(({ date }) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  let minScore = Infinity;
  let maxScore = -Infinity;

  const playerData: { player: string; date: Date; total: number }[][] = [
    ...Array(players.length),
  ].map(() => [...Array(games.length)]);

  games
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach(({ date, id }, i) => {
      players.forEach((player, j) => {
        const score = scores.find(
          (score) => score.gameId === id && score.playerId === player.id
        );
        const stack = score?.stack || 0;
        const buyins = score?.buyins || 0;
        let total = stack - buyins * 100;
        if (j !== 0) {
          const prevScore = playerData[j - 1][i];
          total += prevScore.total;
        }
        minScore = Math.min(minScore, total);
        maxScore = Math.max(maxScore, total);
        playerData[j][i] = {
          date: new Date(date),
          player: player.name,
          total,
        };
      });
    });

  const x = d3
    .scaleTime()
    .domain(d3.extent(dates) as [Date, Date])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([minScore - 100, maxScore + 100])
    .range([height - margin.bottom, margin.top]);

  console.log(maxScore);

  const lineGenerator = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total));

  return (
    <svg width={width} height={height}>
      <g>
        {x.ticks().map((tick) => (
          <text
            key={tick.toDateString()}
            x={x(tick)}
            y={height - margin.bottom + 20}
            textAnchor="middle"
          >
            {d3.timeFormat("%b %d")(tick)}
          </text>
        ))}
      </g>
      <g>
        {y.ticks().map((tick) => (
          <text
            key={tick}
            x={margin.left - 10}
            y={y(tick)}
            dy=".32em"
            textAnchor="end"
          >
            {tick}
          </text>
        ))}
      </g>
      {playerData.map((player, idx) => (
        <path
          key={idx}
          d={lineGenerator(player)}
          fill="none"
          stroke={d3.schemeTableau10[idx % 10]}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
