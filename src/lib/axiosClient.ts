import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/",
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle errors — stores and hooks handle them gracefully
    // Never let unhandled rejections bubble up to the dev overlay
    return Promise.resolve(
      error.response ?? { data: null, status: error.response?.status ?? 500 }
    );
  }
);

export default axiosClient;
