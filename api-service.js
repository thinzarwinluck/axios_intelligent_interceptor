import axios from "axios";
import store from "./store/index";

const serverApiUrl = import.meta.env.VITE_API_ENDPOINT; // call the url from enviroment file
const apiVersion = import.meta.env.VITE_API_VERSION; // call the version of your api  from enviroment file

//create the service to call the api
const service = axios.create({
  baseURL: `${serverApiUrl}${apiVersion}`,
  withCredentials: true,
});

service.defaults.timeout = import.meta.env.VITE_API_TIMEOUT;
service.defaults.headers.post["Content-Type"] = "multipart/form-data";

//request with interceptors for all api request including token
service.interceptors.request.use(function (config) {
  const token = JSON.parse(window.localStorage.getItem("token"));
  config.headers.Authorization = token ? `Bearer ${token.access_token}` : "";

  return config;
});

//handling the response
service.interceptors.response.use(
  (response) => response,
  async (error) => {
    //if token is expired and need to call the api you must call like that 
    if (error.response?.status === 401) {
      try {
        await store.dispatch("userService/refreshToken");
        const config = error.config;
        const token = JSON.parse(window.localStorage.getItem("token"));
        config.headers.Authorization = token
          ? `Bearer ${token.access_token}`
          : "";
        return axios.request(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    } else {
      store.dispatch("userService/setError", error.response.data.errors); // handling the error with vuex
    }
    return Promise.reject(error);
  }
);

export { service };
