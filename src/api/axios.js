// import axios from 'axios';

// export default axios.create({
//     baseURL: 'http://localhost:4000'
//     // baseURL:'https://productionbackend-y8g8.onrender.com'


//     //Moblie
//     // baseURL: 'http://192.168.0.107:4000', // Use your network IP here
//     // withCredentials: true // Include this to send credentials with every request
// });


import axios from "axios";
import { useAuth } from "../context/AuthProvider";

// Base URL for your backend
const instance = axios.create({
  baseURL: "http://localhost:4000",
});

// Axios Interceptor to add Authorization header
instance.interceptors.request.use(
  (config) => {
    // Since this runs outside React, we can't use useAuth directly here
    // Instead, we'll assume the token is stored in localStorage by AuthProvider
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;