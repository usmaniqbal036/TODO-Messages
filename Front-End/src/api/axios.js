

import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
console.log("API base URL:", import.meta.env.VITE_API_BASE_URL);

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
  
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

   
    if (status === 403) {
      console.error('Access forbidden');
    }


    if (status === 500) {
      console.error('Server error, please try again later');
    }

    return Promise.reject(error);
  }
);

export default api;
