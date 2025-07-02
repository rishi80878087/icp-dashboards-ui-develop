import * as types from './types';
import StorageService from '../../services/storageService';

export const setLocale = (value) => {
  StorageService.set('locale', value)
  return {
    type: types.SET_LOCALE,
    payload: { projectTranslation: value },
  };
};
