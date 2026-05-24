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
  },

  getProductById: async (productId) => {
    const { data } = await api.get(`/products/${productId}`);
    return data;
  },

  deleteProduct: async (productId) => {
    const { data } = await api.delete(`/products/${productId}`);
    return data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};
