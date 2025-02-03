import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import CreateRoomForm from "./create-room-form";

export default async function CreateRoom() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Create New Poker Room</h1>
          <p className="text-muted-foreground">
            Set up a new room to track your poker games with friends
          </p>
        </div>

        <CreateRoomForm userId={user.id} />
      </div>
    </div>
  );
}
