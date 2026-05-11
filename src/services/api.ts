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

    updateStatus: async (id: string, data: any) => {
        const response = await fetch(`${API_URL}/resident/update-status/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    edit: async (id: string, residentData: any) => {
        const isFormData = residentData instanceof FormData;
        const response = await fetch(`${API_URL}/resident/edit/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...getAuthHeader()
            },
            body: isFormData ? residentData : JSON.stringify(residentData),
        });
        return handleResponse(response);
    },
};

// Financial Management API
export const financialApi = {
    // Maintenance APIs

    // Verify password before opening form
    verifyMaintenancePassword: async (password: string) => {
        const response = await fetch(`${API_URL}/maintenance/verify-password`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify({ password }),
        });
        return handleResponse(response);
    },

    // Set maintenance amount and penalty rules (requires password)
    setMaintenanceSetup: async (data: {
        password: string;
        maintenanceAmount: number;
        penaltyAmount: number;
        maintenanceDueDate: string;
        penaltyAppliedAfterDay: number;
        society: string;
    }) => {
        const response = await fetch(`${API_URL}/maintenance/maintenance-setup`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Bill a specific resident for maintenance
    createMaintenanceBill: async (data: {
        resident: string;
        maintenanceSetup: string;
        date: string;
        amount: number;
        penalty?: number;
        payment: string;
        status?: string;
    }) => {
        const response = await fetch(`${API_URL}/maintenance`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Get all maintenance bills with resident details
    getMaintenanceRecords: async () => {
        const response = await fetch(`${API_URL}/maintenance`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Other Income APIs

    // Get all other income records
    getOtherIncome: async () => {
        const response = await fetch(`${API_URL}/income/get-income`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Add new other income
    addOtherIncome: async (data: {
        title: string;
        amount: number;
        date: string;
        dueDate: string;
        description: string;
        society: string;
    }) => {
        const response = await fetch(`${API_URL}/income/add-income`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Edit other income
    editOtherIncome: async (id: string, data: {
        title: string;
        amount: number;
        date: string;
        dueDate: string;
        description: string;
        society: string;
    }) => {
        const response = await fetch(`${API_URL}/income/edit-income/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Delete other income
    deleteOtherIncome: async (id: string) => {
        const response = await fetch(`${API_URL}/income/delete-income/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Expense APIs

    // Get all expenses
    getExpenses: async () => {
        const response = await fetch(`${API_URL}/expanse/get`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Add new expense
    addExpense: async (data: {
        title: string;
        amount: number;
        date: string;
        description: string;
        uploadBill: string;
    }) => {
        const response = await fetch(`${API_URL}/expanse/add`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Edit expense
    editExpense: async (id: string, data: {
        title: string;
        amount: number;
        date: string;
        description: string;
        uploadBill: string;
    }) => {
        const response = await fetch(`${API_URL}/expanse/edit/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Delete expense
    deleteExpense: async (id: string) => {
        const response = await fetch(`${API_URL}/expanse/delete/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Note APIs

    // Get all notes
    getNotes: async () => {
        const response = await fetch(`${API_URL}/note/get`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Add new note
    addNote: async (data: {
        title: string;
        description: string;
        date: string;
    }) => {
        const response = await fetch(`${API_URL}/note/add`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Edit note
    editNote: async (id: string, data: {
        title: string;
        description: string;
        date: string;
    }) => {
        const response = await fetch(`${API_URL}/note/edit/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Delete note
    deleteNote: async (id: string) => {
        const response = await fetch(`${API_URL}/note/delete/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },
};

// Complaint Tracking API
export const complaintApi = {
    // Get all complaints
    getAllComplaints: async () => {
        const response = await fetch(`${API_URL}/complain/getAllComplain`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },

    // Create new complaint
    createComplaint: async (data: {
        complainerName: string;
        complaintName: string;
        description: string;
        wing: string;
        unit: string;
        priority: string;
        status: string;
    }) => {
        const response = await fetch(`${API_URL}/complain/createComplain`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Edit complaint
    editComplaint: async (id: string, data: {
        complainerName: string;
        complaintName: string;
        description: string;
        wing: string;
        unit: string;
        priority: string;
        status: string;
    }) => {
        const response = await fetch(`${API_URL}/complain/editComplain/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Delete complaint
    deleteComplaint: async (id: string) => {
        const response = await fetch(`${API_URL}/complain/deleteComplain/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
        });
        return handleResponse(response);
    },
};
