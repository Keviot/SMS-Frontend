export const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

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
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    login: async (credentials: any) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
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
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        localStorage.removeItem("token");
        return handleResponse(response);
    },

    getProfile: async () => {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    forgetPassword: async (emailOrPhone: string) => {
        const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
        const body = isEmail ? { email: emailOrPhone } : { phoneNumber: emailOrPhone };
        const response = await fetch(`${API_URL}/auth/forget-password`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    verifyOtp: async (data: { emailOrPhone: string; otp: string }) => {
        const isEmail = /\S+@\S+\.\S+/.test(data.emailOrPhone);
        const body = {
            ...(isEmail ? { email: data.emailOrPhone } : { phoneNumber: data.emailOrPhone }),
            otp: data.otp
        };
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    resetPassword: async (data: any) => {
        const isEmail = /\S+@\S+\.\S+/.test(data.emailOrPhone);
        const body = {
            ...(isEmail ? { email: data.emailOrPhone } : { phoneNumber: data.emailOrPhone }),
            otp: data.otp,
            password: data.password,
            confirmPassword: data.confirmPassword
        };
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    updateProfile: async (id: string, userData: any) => {
        const isFormData = userData instanceof FormData;
        const response = await fetch(`${API_URL}/auth/edit-profile/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...getAuthHeader()
            },
            body: isFormData ? userData : JSON.stringify(userData),
        });
        return handleResponse(response);
    },
};

export const societyApi = {
    create: async (societyData: any) => {
        const response = await fetch(`${API_URL}/society/create`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(societyData),
        });
        return handleResponse(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_URL}/society/get`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        return handleResponse(response);
    },
};
export const residentApi = {
  create: async (residentData: any) => {
    const isFormData = residentData instanceof FormData;
    const response = await fetch(`${API_URL}/resident/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeader(),
      },
      body: isFormData ? residentData : JSON.stringify(residentData),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/resident/get`, {
      method: "GET",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
    });
    return handleResponse(response);
  },
};
