import axios from 'axios';

// Base URL of the backend API (adjust the port if needed)
const API_URL = 'https://localhost:7181/api';

// Axios instance shared by all services
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every outgoing request when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear session and redirect to login on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authService = {
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, fullName }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Chat endpoints
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),

  getConversation: (id: number) => api.get(`/chat/conversations/${id}`),

  createConversation: () => api.post('/chat/conversations'),

  sendMessage: (conversationId: number, content: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content }),
  
  deleteConversation: (id: number) => api.delete(`/chat/conversations/${id}`),
};