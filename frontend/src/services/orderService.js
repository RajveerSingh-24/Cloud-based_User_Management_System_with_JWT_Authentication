import api from './api';

export const orderService = {
  getOrders: async (skip = 0, limit = 100) => {
    const { data } = await api.get('/orders/', {
      params: { skip, limit }
    });
    return data;
  },

  createOrder: async (productId) => {
    const { data } = await api.post('/orders/', { product_id: productId });
    return data;
  },

  updateOrderStatus: async (orderId, status) => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    return data;
  }
};
