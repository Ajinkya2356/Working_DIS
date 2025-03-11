// src/api/axiosInstance.ts
import axios from 'axios';
import { BASE_URL } from '../constant';
import store from '../store';
import { logoutUser } from '../slices/userSlice';
import { isRejected } from '@reduxjs/toolkit';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let isLoggedOut = false;
const MAX_RETRIES = 3;
let retryCount = 0;

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (isLoggedOut) {
              isRejected(new Error('User logged out'))
            }
            else {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            }
          });
        });
      }

      if (retryCount >= MAX_RETRIES) {
        isRefreshing = false;
        isLoggedOut = true;
        window.location.href = '/';
        localStorage.removeItem('access_token');
        return Promise.reject(new Error('Maximum retries reached'));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      retryCount += 1;

      try {
        const response = await axios.get(`${BASE_URL}/refresh`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        console.log("Response", response)
        const newAccessToken = response.data.token;
        localStorage.setItem('access_token', newAccessToken);
        isRefreshing = false;
        retryCount = 0;
        onRefreshed(newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        isLoggedOut = true;
        window.location.href = '/';
        localStorage.removeItem('access_token');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;