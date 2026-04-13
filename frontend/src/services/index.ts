import api from './api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  access_token?: string;
  user?: any;
  order_id?: string;
  key_id?: string;
  amount?: number;
  currency?: string;
}

export const authService = {
  login: (data: any) => api.post<ApiResponse>('/auth/login', data) as unknown as Promise<ApiResponse>,

  register: (data: any) => api.post<ApiResponse>('/auth/register', data) as unknown as Promise<ApiResponse>,
  getMe: () => api.get<ApiResponse>('/auth/me') as unknown as Promise<ApiResponse>,
};

export const transactionService = {
  getAll: (params?: any) => api.get<ApiResponse>('/transactions/', { params }) as unknown as Promise<ApiResponse>,
  create: (data: any) => api.post<ApiResponse>('/transactions/', data) as unknown as Promise<ApiResponse>,
  update: (id: number, data: any) => api.put<ApiResponse>(`/transactions/${id}`, data) as unknown as Promise<ApiResponse>,
  delete: (id: number) => api.delete<ApiResponse>(`/transactions/${id}`) as unknown as Promise<ApiResponse>,
};

export const cardService = {
  getAll: () => api.get<ApiResponse>('/cards/') as unknown as Promise<ApiResponse>,
  create: (data: any) => api.post<ApiResponse>('/cards/', data) as unknown as Promise<ApiResponse>,
  delete: (id: number) => api.delete<ApiResponse>(`/cards/${id}`) as unknown as Promise<ApiResponse>,
};

export const dashboardService = {
  getSummary: () => api.get<ApiResponse>('/dashboard/') as unknown as Promise<ApiResponse>,
  getAnalytics: () => api.get<ApiResponse>('/analytics/') as unknown as Promise<ApiResponse>,
  getAIInsights: () => api.get<ApiResponse>('/ai/insights') as unknown as Promise<ApiResponse>,
};

export const budgetService = {
  getAll: (month?: string) => api.get<ApiResponse>('/budgets/', { params: { month } }) as unknown as Promise<ApiResponse>,
  create: (data: any) => api.post<ApiResponse>('/budgets/', data) as unknown as Promise<ApiResponse>,
  delete: (id: number) => api.delete<ApiResponse>(`/budgets/${id}`) as unknown as Promise<ApiResponse>,
};

export const goalService = {
  getAll: () => api.get<ApiResponse>('/goals/') as unknown as Promise<ApiResponse>,
  create: (data: any) => api.post<ApiResponse>('/goals/', data) as unknown as Promise<ApiResponse>,
  updateProgress: (id: number, data: any) => api.put<ApiResponse>(`/goals/${id}/add-funds`, data) as unknown as Promise<ApiResponse>,
  delete: (id: number) => api.delete<ApiResponse>(`/goals/${id}`) as unknown as Promise<ApiResponse>,
};

export const dueService = {
  getAll: () => api.get<ApiResponse>('/dues/') as unknown as Promise<ApiResponse>,
  create: (data: any) => api.post<ApiResponse>('/dues/', data) as unknown as Promise<ApiResponse>,
  update: (id: number, data: any) => api.put<ApiResponse>(`/dues/${id}`, data) as unknown as Promise<ApiResponse>,
  delete: (id: number) => api.delete<ApiResponse>(`/dues/${id}`) as unknown as Promise<ApiResponse>,
};

