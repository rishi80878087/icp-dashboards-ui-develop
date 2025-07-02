import axios from 'axios';
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig();
const { CACHE_ENABLED } = publicRuntimeConfig;

const BASE_URL = '';
let cache = {};

export function clearApiResponseCache() {
  cache = {};
}

export default class Http {
  static async get({ url, isBlob = false, isCacheEnabled = CACHE_ENABLED, handleDiscard = () => {} }) {
    if (cache[url] && isCacheEnabled === 'true') {
      await new Promise((res, rej) => {
        handleDiscard({ cancel: rej });
        res();
      });
      return cache[url];
    }
    const cancelGetRequest = axios.CancelToken.source();
    handleDiscard(cancelGetRequest);
    const response = await axios.get(`${BASE_URL}${url}`, {
      cancelToken: cancelGetRequest.token,
      responseType: isBlob ? 'blob' : 'json',
    });
    if (isCacheEnabled === 'true') {
      cache[url] = response.data;
    }
    return response.data;
  }

  static async delete({ url }) {
    const response = await axios.delete(`${BASE_URL}${url}`);
    return response.data;
  }

  static async post({ url, data, isCacheEnabled = CACHE_ENABLED, handleDiscard = () => {} }) {
    const key = `${url}_${JSON.stringify(data)}`;

    if (cache[key] && isCacheEnabled === 'true') {
      await new Promise((res, rej) => {
        handleDiscard({ cancel: rej });
        res();
      });
      return cache[key];
    }
    const cancelPostRequest = axios.CancelToken.source();
    handleDiscard(cancelPostRequest);
    const response = await axios.post(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPostRequest.token,
    });
    if (isCacheEnabled === 'true') {
      cache[key] = response.data;
    }
    return response.data;
  }

  static async put({ url, data, handleDiscard = () => {} }) {
    
    const cancelPutRequest = axios.CancelToken.source();
    handleDiscard(cancelPutRequest);
    
    const response = await axios.put(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPutRequest.token,
    });
    return response.data;
  }

  static async patch({ url, data, handleDiscard = () => {} }) {
    
    const cancelPutRequest = axios.CancelToken.source();
    handleDiscard(cancelPutRequest);
    
    const response = await axios.patch(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPutRequest.token,
    });
    return response.data;
  }
}
