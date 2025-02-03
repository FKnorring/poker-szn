"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Spade,
  Heart,
  Diamond,
  Club,
  Coins,
  BarChart2,
} from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { ModeToggle } from "@/components/toggle-theme";
import { ALL_SEASONS, CURRENT } from "@/config/season";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "./ui/select";
import { useRouter, usePathname } from "next/navigation";
import { Label } from "./ui/label";

interface HeaderProps {
  showStats?: boolean;
  showPlay?: boolean;
  showEdit?: boolean;
  showThemeToggle?: boolean;
  showSeasonSelector?: boolean;
  totalBuyin?: number;
}

export default function Header({
  showStats = false,
  showPlay = true,
  showEdit = true,
  showThemeToggle = true,
  showSeasonSelector = false,
  totalBuyin,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSeasonId =
    pathname === "/"
      ? CURRENT.id.toString()
      : pathname === "/all"
      ? "all"
      : pathname.slice(1);

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid grid-cols-2 grid-rows-2 rounded-sm overflow-hidden">
            <Heart
              size={16}
              strokeWidth={3}
              className="text-red-100 bg-red-800 p-[1px]"
            />
            <Spade
              size={16}
              strokeWidth={3}
              className="text-slate-100 bg-slate-800 p-[1px]"
            />
            <Diamond
              size={16}
              strokeWidth={3}
              className="text-blue-100 bg-blue-800 p-[1px]"
            />
            <Club
              size={16}
              strokeWidth={3}
              className="text-green-100 bg-green-800 p-[1px]"
            />
          </div>
          <h1
            className={`text-xl sm:text-2xl lg:text-4xl font-extrabold -tracking-widest ${GeistMono.className}`}
          >
            POKER-SZN
          </h1>
        </Link>
        {totalBuyin !== undefined && (
          <span className="hidden lg:block ml-2 text-xs font-bold text-gray-300">
            total buyin {totalBuyin * 100}kr
          </span>
        )}
        {showSeasonSelector && (
          <>
            <Label className="hidden lg:block">Säsong</Label>
            <Select
              value={currentSeasonId}
              onValueChange={(value) =>
                router.push(`/${value === CURRENT.id.toString() ? "" : value}`)
              }
            >
              <SelectTrigger className="w-[90px] lg:w-[180px]">
                <SelectValue placeholder="Välj säsong" />
              </SelectTrigger>
              <SelectContent>
                {ALL_SEASONS.map((season) => (
                  <SelectItem key={season.id} value={season.id.toString()}>
                    {season.name}
                  </SelectItem>
                ))}
                <SelectItem value="all">Alla</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        <div className="ms-auto flex gap-2 items-center">
          {showThemeToggle && (
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
          )}
          {showPlay && (
            <Link href="/play">
              <Button variant="destructive" className="gap-1">
                <Coins size={16} />
                Spela
              </Button>
            </Link>
          )}
          {showEdit && (
            <Link href="/edit">
              <Button size="icon">
                <Calendar size={16} />
              </Button>
            </Link>
          )}
          {showStats && (
            <Link href="/">
              <Button className="gap-2">
                <BarChart2 size={16} />
                Visa Statistik
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
