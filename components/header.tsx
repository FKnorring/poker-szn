import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Spade, Heart, Diamond, Club, BarChart2 } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { ModeToggle } from "@/components/toggle-theme";
import { Season } from "@prisma/client";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import SeasonSelector from "./season-selector";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

interface HeaderProps {
  showStats?: boolean;
  editLink?: string;
  showThemeToggle?: boolean;
  showSeasonSelector?: boolean;
  totalBuyin?: number;
  roomId?: string;
  seasons?: Pick<Season, "id" | "name">[];
  currentSeasonId?: string;
}

export default async function Header({
  showStats = false,
  editLink,
  showThemeToggle = true,
  showSeasonSelector = false,
  roomId,
  seasons = [],
  currentSeasonId,
}: HeaderProps) {
  const { isAuthenticated } = getKindeServerSession();

  const isAuth = await isAuthenticated();

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
        {showSeasonSelector && roomId && (
          <SeasonSelector
            roomId={roomId}
            seasons={seasons}
            currentSeasonId={currentSeasonId}
          />
        )}
        <div className="ms-auto flex gap-2 items-center">
          {showThemeToggle && (
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
          )}
          {editLink && (
            <Link href={editLink}>
              <Button size="icon">
                <Calendar size={16} />
              </Button>
            </Link>
          )}
          {showStats && (
            <Link href="/">
              <Button className="gap-2">
                <BarChart2 size={16} />
                Show Stats
              </Button>
            </Link>
          )}
          {isAuth ? (
            <LogoutLink>
              <Button>Log out</Button>
            </LogoutLink>
          ) : (
            <LoginLink>
              <Button>Log in</Button>
            </LoginLink>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
