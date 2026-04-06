import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import config from "./config";

const apiBaseUrl = `${config.apiBaseUrl}/api/v1`;

interface RequestOptions extends AxiosRequestConfig {
  token?: string;
}

const getHeaders = (queryParamToken?: string, contentType?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let auth: any = {};
  const authCookie = Cookies.get("auth");
  if (authCookie) {
    try {
      auth = JSON.parse(authCookie);
    } catch (error) {
      console.error("Error parsing auth cookie", error);
      auth = {};
    }
  }
  const { token, user } = auth;
  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (token || queryParamToken) {
    const authToken = queryParamToken ? queryParamToken : token;
    headers["Authorization"] = `token ${authToken}`;
  }

  if (user) {
    headers["User"] = `${user.firstName} ${user.lastName}`;
  }

  return headers;
};

const requestClient = (options: RequestOptions = {}) => {
  const headers = getHeaders(options?.token, options?.headers?.["Content-Type"]);

  // Merge the computed headers with any provided ones
  const mergedOptions: RequestOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...headers,
    },
  };

  const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 120000,
    ...mergedOptions,
  });

  return axiosInstance;
};

export default requestClient;