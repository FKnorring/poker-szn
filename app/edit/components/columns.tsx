import { ColumnDef } from "@tanstack/react-table";
import { Player, Score } from "@prisma/client";
import { ExtendedPlayer } from "../utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  id: number;
  type: "buyins" | "stack";
  amount: number;
}

function EditableCell({ id, type, amount }: EditableCellProps) {
  const [value, setValue] = useState(amount);

  return (
    <Input
      className="w-24"
      name={`${type}-${id}`}
      type="number"
      value={value}
      onChange={(e) => {
        setValue(Number(e.target.value));
      }}
    />
  );
}

export const columns: ColumnDef<ExtendedPlayer>[] = [
  {
    accessorKey: "name",
    header: "Namn",
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

      return -buyins * 10 + stack;
    },
  },
];
