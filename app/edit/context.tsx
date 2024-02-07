import { Player } from "@prisma/client";
import { createContext, useContext } from "react";

interface EditGameContextProps {
  players: Player[];
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
