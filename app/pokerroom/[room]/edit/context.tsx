import { Player } from "@prisma/client";
import { createContext, useContext } from "react";
import { ExtendedPlayer, PlayerWithCount } from "./utils";

interface EditGameContextProps {
  players: PlayerWithCount[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerWithCount[]>>;
}

export const EditGameContext = createContext<EditGameContextProps>(
  {} as EditGameContextProps
);

interface EditGameProviderProps {
  children: React.ReactNode;
  values: EditGameContextProps;
}

export function EditGameProvider({ children, values }: EditGameProviderProps) {
  return (
    <EditGameContext.Provider value={values}>
      {children}
    </EditGameContext.Provider>
  );
}

export function useEditGame() {
  return useContext(EditGameContext);
}

interface TableContextProps {
  players: ExtendedPlayer[];
  updatePlayer: (
    id: number,
    buyins: number | undefined,
    stack: number | undefined
  ) => void;
}

export const TableContext = createContext<TableContextProps>(
  {} as TableContextProps
);

interface TableProviderProps {
  children: React.ReactNode;
  values: TableContextProps;
}

export function TableProvider({ children, values }: TableProviderProps) {
  return (
    <TableContext.Provider value={values}>{children}</TableContext.Provider>
  );
}

export function useTable() {
  return useContext(TableContext);
}
