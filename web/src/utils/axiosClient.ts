import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

import store from "../store/store";
import { updateAccessToken } from "../features/auth/authSlice";
import { authService } from "../services";
import { showGlobalSnackbar } from "../common/snackbarProvider";

class AxiosClient {
  private axiosInstance: AxiosInstance;
  private navigate: Function | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 5 * 60 * 1000, //5 mins
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      (err) => Promise.reject(err)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response, // Return the response if successful
      this.handleResponseError.bind(this) // Handle the error
    );
  }

  // New method to accept and store the navigate function
  public setNavigate(navigate: Function) {
    this.navigate = navigate;
  }

  private handleRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    // const token = localStorage.getItem('accessToken');
    const { accessToken } = store.getState().auth;
    if (accessToken && config.headers) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return config;
  }

  private async handleResponseError(error: any) {
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized and the request is not retried already
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if the error message or code indicates that the token has expired
      const errorMessage = error.response.data?.msg || "";
      if (
        errorMessage === "Token has expired, please refresh your token" ||
        error.response.data?.code === "TOKEN_EXPIRED"
      ) {
        try {
          const response = await authService.refreshToken();

          const newAccessToken = response.data.accessToken;

          store.dispatch(updateAccessToken(newAccessToken));

          // Update the Authorization header for the original request
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Retry the original request with the new token
          return this.axiosInstance(originalRequest);
        } catch (err) {
          showGlobalSnackbar("Session expired, please login again!");
          if (this.navigate) {
            this.navigate("/"); // Use navigate to redirect to login page
          }
        }
      } else {
        if (this.navigate) {
          showGlobalSnackbar("Session expired, please login again!");
          this.navigate("/"); // Use navigate to redirect
        }
      }
    }

    // Reject the promise if there's no token or refresh fails
    return Promise.reject(error);
  }

  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}

const axiosClient = new AxiosClient().instance;

export default axiosClient;
