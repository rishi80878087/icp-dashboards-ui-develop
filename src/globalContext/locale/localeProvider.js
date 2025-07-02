import PropTypes from "prop-types"
import { createContext, useReducer, useMemo } from "react";
import StorageService from "../../services/storageService";
import * as types from "./types";

const initialState = {
  projectTranslation: StorageService.get("locale") || "en",
};

const localeReducer = (state, action) => {
  if (action.type === types.SET_LOCALE) {
    return {
      ...state,
      ...action.payload,
    };
  } else {
    return state;
  }
};

export const LocaleContext = createContext(initialState);

const LocaleProvider = ({ children }) => {
  const [localeState, localeDispatch] = useReducer(localeReducer, initialState);

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => [localeState, localeDispatch], [localeState, localeDispatch]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

LocaleProvider.propTypes = {
  children: PropTypes.any
}

export default LocaleProvider;
