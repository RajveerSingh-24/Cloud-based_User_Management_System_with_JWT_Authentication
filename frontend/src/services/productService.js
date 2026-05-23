import api from './api';

export const productService = {
  getProducts: async (skip = 0, limit = 100) => {
    const { data } = await api.get('/products/', {
      params: { skip, limit }
    });
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await api.post('/products/', productData);
    return data;
  }
};
