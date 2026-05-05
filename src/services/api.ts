const BASE_URL = "http://localhost:5000/api";

// Helper to get token from local storage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Generic handle response helper
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export const authApi = {
  signup: async (userData: any) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials: any) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  logout: async () => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
    });
    localStorage.removeItem("token");
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
    });
    return handleResponse(response);
  },

  forgetPassword: async (emailOrPhone: string) => {
    const response = await fetch(`${BASE_URL}/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone }),
    });
    return handleResponse(response);
  },

  verifyOtp: async (data: { emailOrPhone: string; otp: string }) => {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  resetPassword: async (data: any) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const societyApi = {
  create: async (societyData: any) => {
    const response = await fetch(`${BASE_URL}/society/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
      body: JSON.stringify(societyData),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${BASE_URL}/society/get`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },
};
