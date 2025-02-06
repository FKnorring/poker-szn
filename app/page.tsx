import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
import prisma from "@/lib/prisma";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to Poker SZN</h1>
            <p className="text-xl text-muted-foreground">
              Track and analyze your home poker games with friends
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Link href="/api/auth/login">
                  <Button>Log In</Button>
                </Link>
                <Link href="/api/auth/register">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Link href="/pokerrooms">
                  <Button size="lg">Manage Your Poker Rooms</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">
              View Room Statistics
            </h2>
            <form
              action={async (formData) => {
                "use server";
                const room = formData.get("room");
                if (!room) {
                  console.error("No room provided");
                  return;
                }
                const dbRoom = await prisma.pokerRoom.findFirst({
                  where: {
                    OR: [{ id: room as string }, { name: room as string }],
                  },
                });
                if (!dbRoom) {
                  console.error("Room not found");
                  return;
                }
                redirect(`/pokerroom/${dbRoom.id}`);
              }}
              className="flex gap-4 justify-center"
            >
              <Input
                name="room"
                placeholder="Enter room name or ID"
                className="max-w-xs"
              />
              <Button type="submit">Go to Room</Button>

            </form>
            <p className="text-muted-foreground text-xs text-center">
              Note: You can also use the room ID to view the room. <br />
              <Link
                href="/pokerroom/cm6pm9ngx0005kt08yym2gsgw"
                className="text-blue-500"
              >
                Try <strong>poker-szn</strong> to explore
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
