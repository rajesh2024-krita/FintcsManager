import { apiRequest } from './queryClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    name: string;
    email?: string;
    isActive: boolean;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest('POST', '/api/auth/logout');
    localStorage.removeItem('fintcs_token');
    localStorage.removeItem('fintcs_user');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem('fintcs_token');
  },

  getStoredUser: (): AuthResponse['user'] | null => {
    const userStr = localStorage.getItem('fintcs_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setStoredAuth: (token: string, user: AuthResponse['user']): void => {
    localStorage.setItem('fintcs_token', token);
    localStorage.setItem('fintcs_user', JSON.stringify(user));
  },

  clearStoredAuth: (): void => {
    localStorage.removeItem('fintcs_token');
    localStorage.removeItem('fintcs_user');
  }
};

// Add token to requests
const originalApiRequest = apiRequest;
export const authenticatedApiRequest = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const token = authApi.getStoredToken();
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return response;
};
