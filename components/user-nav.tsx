import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Spade } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";

interface UserNavProps {
  user: {
    picture?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    email?: string | null;
  };
  editLink?: string;
}

export function UserNav({ user }: UserNavProps) {
  const initials =
    user.given_name && user.family_name
      ? `${user.given_name[0]}${user.family_name[0]}`
      : user.email
      ? user.email[0].toUpperCase()
      : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={user.picture || ""} alt="Profile picture" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/pokerrooms" className="flex items-center gap-2">
            <Spade className="h-4 w-4" />
            <span>Manage Rooms</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LogoutLink className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
