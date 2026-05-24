import api from './api';

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return data;
  },

  register: async (email, password, role, name) => {
    const { data } = await api.post('/auth/register', {
      email,
      name,
      password,
      role
    });
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/users/me');
    return data;
  }
};
