import * as types from './types';
import StorageService from '@/services/storageService';

export const setTheme = (value) => {
  StorageService.set('theme', value)
  return {
    type: types.SET_THEME,
    payload: { selectedTheme: value },
  };
};
