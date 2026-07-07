import { createContext, useContext } from "react";
import type { AppContextType } from "../types/types";

export const AppContext = createContext<AppContextType>({
  profile: null,
  setProfile: null,
  loading: true
});

export const useAppContext = () => useContext(AppContext);
