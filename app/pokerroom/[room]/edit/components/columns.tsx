import { ColumnDef } from "@tanstack/react-table";
import { Player, Score } from "@prisma/client";
import { ExtendedPlayer } from "../utils";
import { useEffect, useRef, useState } from "react";
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
import { Loader2, X } from "lucide-react";

interface EditableCellProps {
  id: string;
  type: "buyins" | "stack";
  amount: number;
}

function EditableCell({ id, type, amount }: EditableCellProps) {
  const { updatePlayer, players } = useTable();
  const [inputValue, setInputValue] = useState<string>(amount.toString());

  useEffect(() => {
    setInputValue(amount.toString());
  }, [amount]);

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
        variant="secondary"
      >
        +.5
      </Button>
      <Button
        className="aspect-square"
        onClick={() => increment(1)}
        size="icon"
        variant="destructive"
      >
        +1
      </Button>
    </>
  );

  const buyinW = "min-w-10";
  const stackW = "min-w-12";

  const minW = type === "buyins" ? buyinW : stackW;

  return (
    <div className="flex gap-1">
      <Input
        className={`${minW} px-[6px] lg:px-3`}
        name={`${type}-${id}`}
        type="number"
        value={inputValue}
        onChange={(e) => {
          // Replace comma with dot
          const value = e.target.value.replace(",", ".");
          setInputValue(value);
        }}
        onBlur={() => {
          const value = parseFloat(inputValue.replace(",", "."));
          if (!isNaN(value)) {
            updatePlayer(
              id,
              type === "buyins" ? value : undefined,
              type === "stack" ? value : undefined
            );
          }
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
        const { id, name } = row.original;
        const { loadingStates } = useTable();
        const isLoading = loadingStates.removePlayer === id;

        function handleClose() {
          buttonRef.current?.click();
          setOpen(false);
        }

        return (
          <>
            <button ref={buttonRef} style={{ display: "none" }} type="submit" />
            <Dialog open={open}>
              <DialogTrigger onClick={() => setOpen(true)} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X size={16} />
                )}
                {open && <input type="hidden" name="playerId" value={id} />}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove player</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove <strong>{name}</strong> from
                    the game?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex">
                  <Button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-1"
                    variant="destructive"
                    type="submit"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        Remove <X size={16} />
                      </>
                    )}
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
