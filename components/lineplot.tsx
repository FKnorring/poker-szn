import * as d3 from "d3";
import { Game, Player, Score } from "@prisma/client";
import { ExtendedGame } from "@/app/edit/games";

interface LinePlotProps {
  players: Player[];
  games: Game[];
  scores: Score[];
}

export default function LinePlot({ games, players, scores }: LinePlotProps) {
  const width = 1000;
  const height = 800;
  const margin = { top: 20, right: 160, bottom: 50, left: 50 };
  const dates = games
    .map(({ date }) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  let minScore = Infinity;
  let maxScore = -Infinity;

  const playerData: { name: string; date: Date; total: number }[][] = [
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
          name: player.name,
          total,
        };
      });
    });

  const highestTotalPerDate: { date: Date; name: string; total: number }[] =
    dates.map((date, i) => {
      const playersOnDate = playerData.map((player) => player[i]);
      const highestTotal = playersOnDate.reduce((acc, player) => {
        if (player.total > acc.total) {
          return player;
        }
        return acc;
      }, playersOnDate[0]);
      return { date, name: highestTotal.name, total: highestTotal.total };
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

  const legendOffset = {
    x: width - margin.right + 40, // Position of the legend on the X axis
    y: margin.top, // Starting position of the legend on the Y axis
    gap: 20, // Gap between legend items
  };

  return (
    <svg width={width} height={height}>
      {/* Draw the axis labels */}
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
      {/* Draw the axes */}
      <g transform={`translate(0,${height - margin.bottom})`}>
        {x.ticks().map((tick) => (
          <line
            key={tick.toDateString()}
            x1={x(tick)}
            y1={0}
            x2={x(tick)}
            y2={-(height - margin.top - margin.bottom)}
            stroke="lightgrey"
          />
        ))}
        <path
          d={`M${margin.left},0H${width - margin.right}`}
          stroke="currentColor"
        />
      </g>
      <g transform={`translate(${margin.left},0)`}>
        {y.ticks().map((tick) => (
          <line
            key={tick}
            x1={0}
            y1={y(tick)}
            x2={width - margin.left - margin.right}
            y2={y(tick)}
            stroke="lightgrey"
          />
        ))}
        <path
          d={`M0,${margin.top}V${height - margin.bottom}`}
          stroke="currentColor"
        />
      </g>
      {/* Draw the lines for each player */}
      {playerData.map((player, idx) => (
        <path
          key={idx}
          d={lineGenerator(player)}
          fill="none"
          stroke={d3.schemeTableau10[idx % 10]}
          strokeWidth="2"
        />
      ))}
      {/* Highlight the player with the highest total on each date */}
      {highestTotalPerDate.map((data, idx) => (
        <g key={idx} className="highest-total">
          <circle cx={x(data.date)} cy={y(data.total)} r="5" fill="red" />
          <text x={x(data.date) + 5} y={y(data.total) - 10} fontSize="12">
            {`${data.name}: ${data.total}`}
          </text>
        </g>
      ))}
      {/*Legend*/}
      <g transform={`translate(${legendOffset.x},${legendOffset.y})`}>
        {players.map((player, idx) => (
          <g
            key={player.id}
            transform={`translate(0,${idx * legendOffset.gap})`}
          >
            <rect width="15" height="15" fill={d3.schemeTableau10[idx % 10]} />
            <text x="20" y="12" fontSize="12">
              {player.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
