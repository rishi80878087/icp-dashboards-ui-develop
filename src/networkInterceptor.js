import axios from 'axios'
import { signOut } from "next-auth/react"
import getConfig from 'next/config';
import StorageService from '../src/services/storageService';
import getRouter from './utils/router';

const { publicRuntimeConfig } = getConfig();
const { KEYCLOAK_ENABLED } = publicRuntimeConfig;

// Add a request interceptor
axios.interceptors.request.use(
  async function (config) {
    // Do something before request is sent
    // *** Just an example *** //
    const token = await StorageService.get('authorization')?.access_token
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`
      }
    }
    // ****** //
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshAccessToken = async () => {
  // const auth = StorageService.get('authorization');
  // const jwtDecode =  jwt(auth?.access_token);

  // refresh token api
  // const tokenRes = await signInApi({
  //   grantType: 'refresh_token',
  //   client: Object.keys(jwtDecode?.resource_access)?.[0],
  //   refreshToken: auth?.refresh_token,
  // });

  StorageService.set('authorization', tokenRes?.data)
  return tokenRes?.access_token;
};

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (KEYCLOAK_ENABLED === 'true') {
      if (error.response?.status === 401) {
        StorageService.removeAll();
        if (KEYCLOAK_ENABLED === 'true') {
          signOut({ redirect: false });
        }
        //  else {
        //   router.push('/login')
        // }
      }
      if (error.response?.status === 403) {
        const router = getRouter()         
        router.push('/access-denied')
      }
      return Promise.reject(error)
    }

    // handle refresh token in case keycloak is false
    const originalRequest = error.config;

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (
      error.response?.status === 401
      && !originalRequest?._retry
      && !originalRequest?.url?.includes('login')
      && !originalRequest?.url?.includes('forgot-password')
    ) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject})
        })
          .then(() => {
            const token = StorageService.get('authorization')?.access_token
            if (token) {
              originalRequest.headers['Authorization'] = getAuthToken(originalRequest, token);
            }
            return axios(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      return new Promise(function (resolve, reject) {
        refreshAccessToken()
          .then((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = getAuthToken(originalRequest, token);
            }
            processQueue(null, token);
            resolve(axios(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            StorageService.removeAll();   
            
            const router = getRouter()         
            router.push('/login')
            
            reject(err);
          })
          .then((err) => {
            isRefreshing = false;
          });
      });
    }

    if (error.response?.status === 403) {
      const router = getRouter()         
      router.push('/access-denied')
    }
    
    return Promise.reject(error)
  }
)
