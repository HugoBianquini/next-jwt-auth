import { setTokenCookies } from "@/contexts/AuthContext";
import axios, { AxiosError } from "axios"
import { parseCookies } from "nookies"

type ErrorResponseData = {
  code?: string;
  message?: string;
}

type RequestsQueue = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}

let cookies = parseCookies()
let isRefreshing = false;
let failedRequestsQueue: RequestsQueue[] = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextjwt.token']}`
  }
});

api.interceptors.response.use(response => {
  return response
}, onResponseError);

function onResponseError(error: AxiosError) {
  if(error.response?.status === 401){
    const data = error.response.data as ErrorResponseData;

    if(data.code === 'token.expired'){
      cookies = parseCookies();

      const {'nextjwt.refreshToken': refreshToken} = cookies;
      const originalConfig = error.config;

    if(!isRefreshing) {
      isRefreshing = true;

      api.post("/refresh", {
        refreshToken,
      }).then(response => {
        const {token, refreshToken: newRefreshToken} = response.data

        setTokenCookies(token, newRefreshToken)

        api.defaults.headers['Authorization'] = `Bearer ${token}`

        failedRequestsQueue.forEach(request => request.onSuccess(token))
        failedRequestsQueue = [];
      }).catch(err => {
        failedRequestsQueue.forEach(request => request.onFailure(err))
        failedRequestsQueue = [];
      }).finally(() => {
        isRefreshing = false
      })
    }

    return new Promise((resolve, reject) => {
      failedRequestsQueue.push({
        onSuccess: (token: string) => {
          originalConfig!.headers['Authorization'] = `Bearer ${token}`

          resolve(api(originalConfig!))
        },
        onFailure: (err: AxiosError) => {
          reject(err)
        }
      })
    })

    } else {
      // logout
    }
  }
}