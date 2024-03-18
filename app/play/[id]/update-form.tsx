"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BuyinInput from "./buyin-input";
import { ExtendedPlayer } from "@/app/edit/utils";
import { updateScore } from "@/app/utils";
import { redirect } from "next/navigation";
import { updatePlayerScore } from "./api";

interface UpdateFormProps {
  player: ExtendedPlayer;
  game: number;
}

export default function UpdateForm({ player, game }: UpdateFormProps) {
  async function handleSubmit(formData: FormData) {
    const stack = formData.get("stack");
    const buyins = formData.get("buyins");
    if (!stack || isNaN(+stack) || !buyins || isNaN(+buyins)) return;
    await updatePlayerScore({
      playerId: player.id,
      buyins: +buyins,
      stack: +stack,
      gameId: game,
    });
    redirect(`/play/${player.id}`);
  }

  return (
    <form action={handleSubmit} className="w-full p-4 flex flex-col gap-2">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="buyins">Buyins</Label>
        <BuyinInput value={player.buyins} />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="stack">Stack</Label>
        <Input name="stack" defaultValue={player.stack} />
      </div>
      <Button className="ms-auto" variant="secondary" type="submit">
        Spara
      </Button>
    </form>
  );
}
