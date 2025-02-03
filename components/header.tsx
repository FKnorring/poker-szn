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
import { UserNav } from "./user-nav";

interface HeaderProps {
  statsLink?: string;
  editLink?: string;
  showThemeToggle?: boolean;
}

export default async function Header({
  statsLink,
  editLink,
  showThemeToggle = true,
}: HeaderProps) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

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
          {statsLink && (
            <Link href={statsLink}>
              <Button size="icon">
                <BarChart2 size={16} />
              </Button>
            </Link>
          )}
          {isAuth ? (
            <UserNav user={user} editLink={editLink} />
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
