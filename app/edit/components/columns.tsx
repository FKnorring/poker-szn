import { ColumnDef } from "@tanstack/react-table";
import { Player, Score } from "@prisma/client";
import { ExtendedPlayer } from "../utils";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useTable } from "../context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EditableCellProps {
  id: number;
  type: "buyins" | "stack";
  amount: number;
}

function EditableCell({ id, type, amount }: EditableCellProps) {
  const { updatePlayer, players } = useTable();

  function increment(value: number) {
    const currentBuyins = players.find((p) => p.id === id)?.buyins;
    if (currentBuyins === undefined) return;
    updatePlayer(id, currentBuyins + value, undefined);
  }

  const incrementers = (
    <>
      <Button
        className="aspect-square"
        onClick={() => increment(0.5)}
        size="icon"
        variant="outline"
      >
        +.5
      </Button>
      <Button
        className="aspect-square"
        onClick={() => increment(1)}
        size="icon"
        variant="outline"
      >
        +1
      </Button>
    </>
  );

  const buyinW = "min-w-8";
  const stackW = "min-w-12";

  const minW = type === "buyins" ? buyinW : stackW;

  return (
    <div className="flex">
      <Input
        className={`${minW} px-1 lg:px-3`}
        name={`${type}-${id}`}
        type="number"
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          updatePlayer(
            id,
            type === "buyins" ? +value : undefined,
            type === "stack" ? +value : undefined
          );
        }}
      />
      {type === "buyins" && incrementers}
    </div>
  );
}

export const columns: ColumnDef<ExtendedPlayer>[] = [
  {
    accessorKey: "name",
    header: "Namn",
    cell: ({ row }) => {
      const { name } = row.original;
      const [firstName, ...rest] = name.split(" ");
      const shortenedSurname = `${firstName} ${rest
        .map((word) => word.charAt(0))
        .join("")}`;
      return (
        <>
          <div className=" block lg:hidden">{shortenedSurname}</div>
          <div className="hidden lg:block">{name}</div>
        </>
      );
    },
  },
  {
    accessorKey: "buyins",
    header: "Buy-ins",
    cell: ({ row }) => {
      const { buyins, id } = row.original;

      return <EditableCell id={id} type="buyins" amount={buyins} />;
    },
  },
  {
    accessorKey: "stack",
    header: "Stack",
    cell: ({ row }) => {
      const { stack, id } = row.original;

      return <EditableCell id={id} type="stack" amount={stack} />;
    },
  },
  {
    header: "Total",
    cell: (cell) => {
      const buyins = cell.row.original.buyins;
      const stack = cell.row.original.stack;

      return -buyins * 100 + stack;
    },
  },
  {
    id: "delete",
    header: "",
    cell: ({ row }) => {
      function DeleteButton() {
        const [open, setOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);
        const { id } = row.original;

        function handleClose() {
          buttonRef.current?.click();
          setOpen(false);
        }

        return (
          <>
            <button ref={buttonRef} style={{ display: "none" }} type="submit" />
            <Dialog open={open}>
              <DialogTrigger onClick={() => setOpen(true)}>
                <X size={16} />
                {open && <input type="hidden" name="playerId" value={id} />}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ta bort spelare</DialogTitle>
                  <DialogDescription>
                    Är du säker på att du vill ta bort{" "}
                    <strong>{row.original.name}</strong> från matchen?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex">
                  <Button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-1"
                    variant="destructive"
                    type="submit"
                    size="sm"
                  >
                    Ta bort
                    <X size={16} />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        );
      }
      return <DeleteButton />;
    },
  },
];
