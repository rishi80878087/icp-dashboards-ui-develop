import PropTypes from "prop-types"
import { createContext, useReducer, useMemo } from "react";
import StorageService from "@/services/storageService";
import * as types from "./types";

const initialState = {
  selectedTheme: StorageService.get("theme") || "base",
};

const themeReducer = (state, action) => {
  if (action.type === types.SET_THEME) {
    return {
      ...state,
      ...action.payload,
    };
  }

  return state; // Default case
};

export const ThemeContext = createContext(initialState);

const ThemeProvider = ({ children }) => {
  const [themeState, themeDispatch] = useReducer(themeReducer, initialState);

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => [themeState, themeDispatch], [themeState, themeDispatch]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.any
}

export default ThemeProvider;
