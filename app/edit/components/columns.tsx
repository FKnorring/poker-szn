import { ColumnDef } from "@tanstack/react-table";
import { Player, Score } from "@prisma/client";
import { ExtendedPlayer } from "../utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const columns: ColumnDef<ExtendedPlayer>[] = [
  {
    accessorKey: "name",
    header: "Namn",
  },
  {
    accessorKey: "score",
    header: "Utfall",
    cell: (cell) => {
      const score = cell.row.original.score;
      const id = cell.row.original.id;

      interface EditableCellProps {
        id: number;
        score: number;
      }

      function EditableCell({ id, score }: EditableCellProps) {
        const [value, setValue] = useState(score);

        return (
          <div className="flex flex-shrink-0 items-center gap-2">
            <Input
              className="w-24"
              name={`score-${id}`}
              type="number"
              value={value}
              onChange={(e) => {
                setValue(Number(e.target.value));
              }}
            />
            kr
          </div>
        );
      }

      return <EditableCell id={id} score={score} />;
    },
  },
];
