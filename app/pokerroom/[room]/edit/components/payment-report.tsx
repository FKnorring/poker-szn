"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtendedGame } from "../games";
import { PokerRoom } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { Coins, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentReportProps {
  games: ExtendedGame[];
  room: PokerRoom;
}

interface PlayerPayment {
  name: string;
  totalBuyins: number;
  totalStack: number;
  balance: number;
}

function formatCurrency(amount: number, currency: string) {
  if (currency === "$") return currency + amount
  return amount + currency
}

export default function PaymentReport({ games, room }: PaymentReportProps) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (games.length === 0) return undefined;
    const latestGame = games[0];
    // Set default range to include all games from the latest game's date
    const gamesOnLatestDate = games.filter(
      (game) => game.date.toDateString() === latestGame.date.toDateString()
    );
    return {
      from: latestGame.date,
      to: latestGame.date,
    };
  });

  const filteredGames = games.filter((game) => {
    if (!date?.from || !date?.to) return false;
    return game.date >= date.from && game.date <= date.to;
  });

  const playerPayments = calculatePlayerPayments(filteredGames);
  const sortedPayments = playerPayments.sort((a, b) => b.balance - a.balance);

  const totalPositiveBalance = sortedPayments
    .filter((p) => p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
            <Button variant="destructive">
              <Coins size={16} />
              <span className="hidden md:block">Payment Report</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate payment report</p>
        </TooltipContent>
      </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Payment Report</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <DateRangePicker date={date} onDateChange={setDate} />
            <div className="text-sm text-muted-foreground">
              {filteredGames.length} games selected
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalPositiveBalance, room.currency)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Players Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerPayments.length}
                </div>
              </CardContent>
            </Card>
          </div>
          <ScrollArea className="max-h-[680px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Total Buy-in</TableHead>
                  <TableHead className="text-right">Total Stack</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => (
                  <TableRow key={payment.name}>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.totalBuyins * room.defaultBuyIn, room.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.totalStack, room.currency )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        payment.balance > 0
                          ? "text-green-600"
                          : payment.balance < 0
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {formatCurrency(payment.balance, room.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calculatePlayerPayments(games: ExtendedGame[]): PlayerPayment[] {
  const playerMap = new Map<string, PlayerPayment>();

  games.forEach((game) => {
    game.scores.forEach(({ playerId, buyins, stack }) => {
      const playerName = game.players.find((p) => p.id === playerId)?.name || "";
      
      if (!playerMap.has(playerName)) {
        playerMap.set(playerName, {
          name: playerName,
          totalBuyins: 0,
          totalStack: 0,
          balance: 0,
        });
      }

      const player = playerMap.get(playerName)!;
      player.totalBuyins += buyins;
      player.totalStack += stack;
      player.balance = player.totalStack - player.totalBuyins * 100;
    });
  });

  return Array.from(playerMap.values());
} 