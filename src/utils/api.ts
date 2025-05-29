import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

export const getAttachmentUrl = (attachmentPath: string) => {
  // Remove any leading /api from the attachment path
  const cleanPath = attachmentPath.replace(/^\/api\//, "");
  // Remove any leading slash from the API_URL to prevent double slashes
  const baseUrl = API_URL.replace(/\/$/, "");
  return `${baseUrl}/${cleanPath}`;
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let currentUser: { id: number } | null = null;

export const auth = {
  async register(data: { email: string; password: string; name: string }) {
    const response = await apiClient.post("/auth/register", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      currentUser = response.data.user;
    }
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post("/auth/login", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      currentUser = response.data.user;
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get("/auth/me");
    currentUser = response.data;
    return response.data;
  },
  async getUsers() {
    try {
      const response = await apiClient.get("/auth/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  logout() {
    localStorage.removeItem("token");
    currentUser = null;
  },
};

export const getCurrentUserId = () => currentUser?.id;

export const projects = {
  async createProject(data: {
    name: string;
    description?: string;
    memberIds?: number[];
  }) {
    const response = await apiClient.post("/projects", data);
    return response.data;
  },

  async getProjects() {
    const response = await apiClient.get("/projects");
    return response.data;
  },

  async getProject(id: number) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
      status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
    }
  ) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async addMember(projectId: number, userId: number) {
    const response = await apiClient.post(`/projects/${projectId}/members`, {
      userId,
    });
    return response.data;
  },

  async removeMember(projectId: number, userId: number) {
    const response = await apiClient.delete(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data;
  },

  async createTask(
    projectId: number,
    data: {
      title: string;
      description?: string;
      assigneeId?: number;
      priority?: "LOW" | "MEDIUM" | "HIGH";
    }
  ) {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  async updateTask(
    projectId: number,
    taskId: number,
    data: {
      title?: string;
      description?: string;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      assigneeId?: number;
    }
  ) {
    const response = await apiClient.put(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    );
    return response.data;
  },
};

export const expenses = {
  async createExpense(formData: FormData) {
    const response = await apiClient.post("/expenses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateExpense(id: number, formData: FormData) {
    const response = await apiClient.put(`/expenses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getTaskExpenses(taskId: number) {
    const response = await apiClient.get(`/expenses/task/${taskId}`);
    return response.data;
  },

  async deleteExpense(id: number) {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },
};

export { apiClient as api };
