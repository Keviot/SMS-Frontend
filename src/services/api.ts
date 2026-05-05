const BASE_URL = "http://localhost:5000/api";

export const authApi = {
  signup: async (userData: any) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials: any) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });
    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  forgetPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  resetPassword: async (data: any) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const societyApi = {
  create: async (societyData: any) => {
    const response = await fetch(`${BASE_URL}/society/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(societyData),
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${BASE_URL}/society/get`, {
      method: "GET",
    });
    return response.json();
  },
};
