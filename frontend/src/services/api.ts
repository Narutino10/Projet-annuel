import axios from "axios";

const API_URL = "http://localhost:3000/auth"; // Backend

export const registerUser = async (email: string, password: string) => {
  return axios.post(`${API_URL}/register`, { email, password });
};

export const loginUser = async (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};
