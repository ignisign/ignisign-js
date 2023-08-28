import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import * as _ from "lodash";

import { IGNISIGN_ERROR_CODES } from "@ignisign/public";

const BASE_URL = process.env.REACT_APP_BACKEND_URL

// /!\ https://github.com/axios/axios/issues/1510#issuecomment-525382535

export interface AxiosRequestConfigWithUrlParams extends AxiosRequestConfig {
  urlParams ?: { [key: string] : string | number | boolean };
  params    ?: { [key: string] : string | number | boolean};
}

declare module 'axios' {
  export interface AxiosInstance {
    request<T = any> (config: AxiosRequestConfigWithUrlParams): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfigWithUrlParams): Promise<T>;
  }
}

const connectedApi      = axios.create({ baseURL : BASE_URL, headers: { Accept: 'application/json' } });
const publicApi         = axios.create({ baseURL : BASE_URL, headers: { Accept: 'application/json' } });

const configureInterceptors = () => {

  const MAX_CALL_TOGETHER       = 30;
  let callCurrentlyRunning      = 0;
  let isRunningCallRetriever    = false
  let networkStatus:any         = { connected : true, connectionType : "unknown"};
  const callsConfigFifo: { resolve, reject, config }[] = [];

  const handleOnline  = () => networkStatus   = { connected : true, connectionType : "unknown" };
  const handleOffline = () => networkStatus   = { connected : false, connectionType : "unknown" };

  networkStatus = window.navigator.onLine ? handleOnline() : handleOffline();

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  setInterval( () => {
    if(!isRunningCallRetriever){

      isRunningCallRetriever = true;
      while((callsConfigFifo.length > 0) && (callCurrentlyRunning <= MAX_CALL_TOGETHER) && networkStatus.connected) {
          const callToExecute = callsConfigFifo.splice(0, 1)[0];
          callToExecute.resolve(callToExecute.config);
      }
      isRunningCallRetriever = false;
    }

  }, 1000);

  const formatUrlRequestInterceptor = (config : AxiosRequestConfigWithUrlParams) => {
    if (!config.url) {
      return config;
    }

    const currentUrl = new URL(config.url, config.baseURL);
    Object.entries(config.urlParams || {})
      .forEach(([k, v]) => currentUrl.pathname = currentUrl.pathname.replace(`:${k}`, encodeURIComponent(v)));
    return {
      ...config,
      baseURL: `${currentUrl.protocol}//${currentUrl.host}`,
      url: currentUrl.pathname,
    };
  };

  // const authRequestInterceptor = (config : AxiosRequestConfigWithUrlParams) => {
  //   try {
  //     const JWT_token = localStorage.getItem(IGNISIGN_LOCAL_STORAGE_KEYS.JWT_TOKEN)

  //     if(!JWT_token) {
  //       console.error("JWT_token not found in localStorage");
  //     }

  //     config.headers.authorization = `Bearer ${JWT_token}`;

  //     return config;
  //   } catch (e) {
  //     console.error(e)
  //     return config
  //   }
  // };



  const responseStdInterceptor = (resp) => {
    callCurrentlyRunning--;
    return resp.data;
  }

  const errorHandlerStrInterceptor = async (error ) => {
    callCurrentlyRunning--;
    let msg = "error-occurred";

    if( error.response ){
      const errorData = error.response.data;
      if(errorData?.code){
        error.code = errorData?.code
      }
      if(errorData && errorData.message){
        msg = errorData.message
        console.error(msg);
      }
    }

    return Promise.reject(error);
  };

 
  publicApi.interceptors.request.use(formatUrlRequestInterceptor)
  publicApi.interceptors.response.use(responseStdInterceptor, errorHandlerStrInterceptor)

  connectedApi.interceptors.request.use(formatUrlRequestInterceptor)
  connectedApi.interceptors.response.use(responseStdInterceptor, errorHandlerStrInterceptor)
}

export {
  publicApi,
  connectedApi,
  configureInterceptors,
}

