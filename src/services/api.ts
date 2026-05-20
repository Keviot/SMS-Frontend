export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get token from local storage
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  forgetPassword: async (emailOrPhone: string) => {
    const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    const body = isEmail
      ? { email: emailOrPhone }
      : { phoneNumber: emailOrPhone };
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
      ...(isEmail
        ? { email: data.emailOrPhone }
        : { phoneNumber: data.emailOrPhone }),
      otp: data.otp,
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
      ...(isEmail
        ? { email: data.emailOrPhone }
        : { phoneNumber: data.emailOrPhone }),
      otp: data.otp,
      password: data.password,
      confirmPassword: data.confirmPassword,
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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

  createPassword: async (
    token: string,
    password: any,
    confirmPassword: any,
  ) => {
    const response = await fetch(
      `${API_URL}/resident/create-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      },
    );
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/resident/get`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Update maintenance status (e.g. for Cash payments by admin)
  updateMaintenanceStatus: async (
    id: string,
    data: { status: string; payment: string },
  ) => {
    const response = await fetch(`${API_URL}/maintenance/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Edit other income
  editOtherIncome: async (
    id: string,
    data: {
      title: string;
      amount: number;
      date: string;
      dueDate: string;
      description: string;
      society: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/income/edit-income/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Add new expense
  addExpense: async (data: any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/expanse/add`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeader(),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Edit expense
  editExpense: async (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/expanse/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeader(),
      },
      body: isFormData ? data : JSON.stringify(data),
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
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Add new note
  addNote: async (data: {
    title: string;
    description: string;
    date: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/note/add`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Edit note
  editNote: async (
    id: string,
    data: {
      title: string;
      description: string;
      date: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/note/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Complaint Tracking API
export const complaintApi = {
  // Get all complaints
  getAllComplaints: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/complain/getAllComplain?societyId=${societyId}`
      : `${API_URL}/complain/getAllComplain`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Create new complaint
  createComplaint: async (data: {
    compainerName: string;
    complainName: string;
    description: string;
    wing: string;
    unit: string;
    priority: string;
    status: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/complain/createComplain`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Edit complaint
  editComplaint: async (
    id: string,
    data: {
      compainerName: string;
      complainName: string;
      description: string;
      wing: string;
      unit: string;
      priority: string;
      status: string;
      society: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/complain/editComplain/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
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
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Request Tracking API
export const requestTrackingApi = {
  // Get all requests
  getAllRequests: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/request/get?societyId=${societyId}`
      : `${API_URL}/request/get`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Create new request
  createRequest: async (data: {
    requesterName: string;
    requestName: string;
    description?: string;
    wing: string;
    unit: string;
    priority: string;
    status: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/request/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Edit request
  editRequest: async (
    id: string,
    data: {
      requesterName: string;
      requestName: string;
      description?: string;
      wing: string;
      unit: string;
      priority: string;
      status: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/request/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete request
  deleteRequest: async (id: string) => {
    const response = await fetch(`${API_URL}/request/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const facilityApi = {
  add: async (data: any) => {
    const response = await fetch(`${API_URL}/facility/add`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAll: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/facility/get?societyId=${societyId}`
      : `${API_URL}/facility/get`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  edit: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/facility/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/facility/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const importantNumberApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/important-number/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/important-number/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  edit: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/important-number/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/important-number/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const announcementApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/announcement/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAll: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/announcement/get?societyId=${societyId}`
      : `${API_URL}/announcement/get`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  edit: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/announcement/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/announcement/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Security Management API
export const securityApi = {
  // Security Protocols
  getAllSecurityProtocols: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/security-protocol/get?societyId=${societyId}`
      : `${API_URL}/security-protocol/get`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  createSecurityProtocol: async (data: {
    title: string;
    description: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/security-protocol/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  editSecurityProtocol: async (
    id: string,
    data: {
      title: string;
      description: string;
      date?: string;
      time?: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/security-protocol/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteSecurityProtocol: async (id: string) => {
    const response = await fetch(`${API_URL}/security-protocol/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Visitor Logs
  getAllVisitors: async () => {
    // Backend uses req.user.society from auth token, no query params needed
    const response = await fetch(`${API_URL}/visitor/get`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  addVisitor: async (data: {
    name: string;
    phoneNumber: string;
    wing: string;
    unit: string;
    date: string;
    time: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/visitor/add`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const securityGuardApi = {
  create: async (data: any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/security-guard/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeader(),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAll: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/security-guard/get?societyId=${societyId}`
      : `${API_URL}/security-guard/get`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  edit: async (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/security-guard/edit/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeader(),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/security-guard/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const emergencyApi = {
  create: async (data: {
    alertType: string;
    description: string;
    society: string;
  }) => {
    const response = await fetch(`${API_URL}/emergency`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/emergency`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/emergency/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const notificationApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/notification`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  markAsRead: async (id: string) => {
    const response = await fetch(`${API_URL}/notification/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  clearAll: async () => {
    const response = await fetch(`${API_URL}/notification`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Payment API

// Payment API
export const paymentApi = {
  createOrder: async (amount: number) => {
    const response = await fetch(`${API_URL}/payment/create-order`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },

  verify: async (paymentData: any) => {
    const response = await fetch(`${API_URL}/payment/verify`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },
};

// Poll API
export const pollApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/poll/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAll: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/poll/get?societyId=${societyId}`
      : `${API_URL}/poll/get`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  getActive: async (societyId: string) => {
    const response = await fetch(
      `${API_URL}/poll/get?societyId=${societyId}&status=Active`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      },
    );
    return handleResponse(response);
  },

  answer: async (data: {
    pollId: string;
    optionIds?: string[];
    rating?: number;
    numericValue?: number;
    text?: string;
    ranking?: string[];
  }) => {
    const response = await fetch(`${API_URL}/poll/answer`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getResults: async (pollId: string) => {
    const response = await fetch(`${API_URL}/poll/results/${pollId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (pollId: string, status: string) => {
    const response = await fetch(`${API_URL}/poll/status/${pollId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  delete: async (pollId: string) => {
    const response = await fetch(`${API_URL}/poll/${pollId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const chatApi = {
  getMembers: async (societyId: string) => {
    const response = await fetch(
      `${API_URL}/chat/members?societyId=${societyId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      },
    );
    return handleResponse(response);
  },

  getHistory: async (societyId: string) => {
    const response = await fetch(
      `${API_URL}/chat/history?societyId=${societyId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      },
    );
    return handleResponse(response);
  },

  getPersonalHistory: async (otherUserId: string) => {
    const response = await fetch(
      `${API_URL}/chat/personal-history?otherUserId=${otherUserId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      },
    );
    return handleResponse(response);
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}/chat/upload`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    return handleResponse(response);
  },
};

// export const videoApi = {
//     generateToken: async (userId: string) => {
//         const response = await fetch(`${API_URL}/video/generate-token`, {
//             method: "POST",
//             credentials: "include",
//             headers: {
//                 "Content-Type": "application/json",
//                 ...getAuthHeader()
//             },
//             body: JSON.stringify({ userId }),
//         });
//         return handleResponse(response);
//     },
// };

export const discussionApi = {
  getAll: async (societyId: string) => {
    const response = await fetch(
      `${API_URL}/discussion/all?societyId=${societyId}`,
      {
        method: "GET",
        credentials: "include",
        headers: { ...getAuthHeader() },
      },
    );
    return handleResponse(response);
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/discussion/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { ...getAuthHeader() },
    });
    return handleResponse(response);
  },
  create: async (data: { title: string; content: string; society: string }) => {
    const response = await fetch(`${API_URL}/discussion/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  createAnswer: async (data: { discussionId: string; content: string }) => {
    const response = await fetch(`${API_URL}/discussion/answer/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  getAnswers: async (discussionId: string) => {
    const response = await fetch(`${API_URL}/discussion/answers`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ discussionId }),
    });
    return handleResponse(response);
  },
  voteDiscussion: async (id: string) => {
    const response = await fetch(
      `${API_URL}/discussion/vote/discussion/${id}`,
      {
        method: "POST",
        credentials: "include",
        headers: { ...getAuthHeader() },
      },
    );
    return handleResponse(response);
  },
  voteAnswer: async (id: string) => {
    const response = await fetch(`${API_URL}/discussion/vote/answer/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { ...getAuthHeader() },
    });
    return handleResponse(response);
  },
};

export const dashboardApi = {
  getStats: async (societyId?: string) => {
    const url = societyId
      ? `${API_URL}/dashboard/stats?societyId=${societyId}`
      : `${API_URL}/dashboard/stats`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const eventPaymentApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/event-payment/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  get: async () => {
    const response = await fetch(`${API_URL}/event-payment/get`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export const videoApi = {
  generateToken: async (
    userId: string,
    userName?: string,
    userImage?: string,
  ) => {
    const response = await fetch(`${API_URL}/video/generate-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ userId, userName, userImage }),
    });
    return handleResponse(response);
  },
};
