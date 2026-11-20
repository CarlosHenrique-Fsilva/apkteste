import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const clientsApi = {
  list: (params?: { status?: string; search?: string }) => api.get('/clients', { params }),
  get: (id: string) => api.get(`/clients/${id}`),
  getSummary: (id: string) => api.get(`/clients/${id}/summary`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  archive: (id: string) => api.put(`/clients/${id}/archive`),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const loansApi = {
  list: (params?: { status?: string; clientId?: string }) => api.get('/loans', { params }),
  get: (id: string) => api.get(`/loans/${id}`),
  getSummary: (id: string) => api.get(`/loans/${id}/summary`),
  create: (data: any) => api.post('/loans', data),
  update: (id: string, data: any) => api.put(`/loans/${id}`, data),
  amortization: (id: string, amount: number) => api.post(`/loans/${id}/amortization`, { amount }),
  delete: (id: string) => api.delete(`/loans/${id}`),
};

export const interestApi = {
  list: (params?: { loanId?: string; status?: string; startDate?: string; endDate?: string }) => api.get('/interest', { params }),
  get: (id: string) => api.get(`/interest/${id}`),
  create: (data: any) => api.post('/interest', data),
  update: (id: string, data: any) => api.put(`/interest/${id}`, data),
  manualAmount: (id: string, amount: number) => api.put(`/interest/${id}/manual-amount`, { amount }),
  generateFuture: (loanId: string, periods?: number) => api.post(`/interest/generate-future/${loanId}`, null, { params: { periods } }),
};

export const installmentsApi = {
  list: (params?: { loanId?: string; status?: string }) => api.get('/installments', { params }),
  getLoanSummary: (loanId: string) => api.get(`/installments/loan/${loanId}/summary`),
  get: (id: string) => api.get(`/installments/${id}`),
  updateAmountReceived: (id: string, amountReceived: number) => api.put(`/installments/${id}/amount-received`, { amountReceived }),
};

export const paymentsApi = {
  list: (params?: { clientId?: string; loanId?: string; status?: string; startDate?: string; endDate?: string }) => api.get('/payments', { params }),
  getSummary: (params?: { startDate?: string; endDate?: string }) => api.get('/payments/summary', { params }),
  get: (id: string) => api.get(`/payments/${id}`),
  confirm: (data: any) => api.post('/payments', data),
  partial: (receivableId: string, data: any) => api.post(`/payments/partial/${receivableId}`, data),
  reverse: (id: string, reason: string) => api.put(`/payments/${id}/reverse`, { reason }),
};

export const receivablesApi = {
  list: (params?: { clientId?: string; loanId?: string; status?: string; sourceType?: string; startDate?: string; endDate?: string; overdueOnly?: boolean }) => api.get('/receivables', { params }),
  getDashboard: () => api.get('/receivables/dashboard'),
  getOverdue: () => api.get('/receivables/overdue'),
  getUpcoming: (days?: number) => api.get('/receivables/upcoming', { params: { days } }),
  get: (id: string) => api.get(`/receivables/${id}`),
  update: (id: string, data: any) => api.put(`/receivables/${id}`, data),
  updateDueDate: (id: string, newDueDate: string, reason: string) => api.put(`/receivables/${id}/due-date`, { newDueDate, reason }),
  addLateFee: (id: string, data: any) => api.post(`/receivables/${id}/late-fee`, data),
};

export const documentsApi = {
  list: (params?: { documentType?: string; clientId?: string; loanId?: string }) => api.get('/documents', { params }),
  get: (id: string) => api.get(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  generateContract: (loanId: string) => api.post(`/documents/generate/contract/${loanId}`),
  generateReceipt: (paymentId: string) => api.post(`/documents/generate/receipt/${paymentId}`),
  generateSettlement: (loanId: string) => api.post(`/documents/generate/settlement/${loanId}`),
  generateReport: (type: string, filters?: any) => api.post(`/documents/generate/report/${type}`, null, { params: filters }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const reportsApi = {
  financial: (params?: { startDate?: string; endDate?: string }) => api.get('/reports/financial', { params }),
  clients: () => api.get('/reports/clients'),
  loans: () => api.get('/reports/loans'),
  receivables: (params?: { status?: string; overdueOnly?: boolean }) => api.get('/reports/receivables', { params }),
  payments: (params?: { startDate?: string; endDate?: string }) => api.get('/reports/payments', { params }),
  aging: () => api.get('/reports/aging'),
  export: (type: string) => api.get(`/reports/export/${type}`, { responseType: 'blob' }),
};

export const notificationsApi = {
  list: (params?: { clientId?: string; status?: string; unreadOnly?: boolean }) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  generateDueSoon: () => api.post('/notifications/generate/due-soon'),
  generateOverdue: () => api.post('/notifications/generate/overdue'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const storageApi = {
  list: (params?: { documentType?: string; clientId?: string; loanId?: string }) => api.get('/storage', { params }),
  getStats: () => api.get('/storage/stats'),
  upload: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) formData.append(key, value as string);
    });
    return api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: metadata,
    });
  },
  download: (id: string) => api.get(`/storage/${id}/download`, { responseType: 'blob' }),
  cleanup: () => api.post('/storage/cleanup'),
  delete: (id: string) => api.delete(`/storage/${id}`),
};

export const auditApi = {
  list: (params?: { entityType?: string; entityId?: string; action?: string; actorUserId?: string; startDate?: string; endDate?: string }) => api.get('/audit', { params }),
  getStats: () => api.get('/audit/stats'),
  getByEntity: (entityType: string, entityId: string) => api.get(`/audit/entity/${entityType}/${entityId}`),
};

export const healthApi = {
  check: () => api.get('/health'),
  ready: () => api.get('/health/ready'),
};