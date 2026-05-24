import api from './api';

export const userService = {
  getUsers: async () => {
    const { data } = await api.get('/users/');
    return data;
  },
  deleteUser: async (userId) => {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  }
};
