import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001';

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    // Ensure response.data is properly formatted
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // If network error or server is down, return empty data
    if (!error.response) {
      return Promise.reject({
        response: {
          data: { message: 'Network error or server is unavailable' },
          status: 500
        }
      });
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User Service API calls
export const userApi = {
  login: (username: string, password: string) =>
    axios.post('/auth/login', { username, password }),
  
  register: (username: string, password: string) =>
    axios.post('/auth/register', { username, password }),
  
  getProducts: () =>
    axios.get('/products'),
  
  placeOrder: (product_id: number, quantity: number) =>
    axios.post('/orders/place', { product_id, quantity }),
  
  payOrder: (order_id: number) =>
    axios.post('/orders/pay', { order_id }),
  
  cancelOrder: (order_id: number) =>
    axios.post('/orders/cancel', { order_id }),
  
  getMyOrders: () =>
    axios.get('/orders/my-orders'),
};

// Log Service API calls
export const logApi = {
  getAllEvents: () =>
    axios.get('http://localhost:3003/events'),
  
  getEventStats: () =>
    axios.get('http://localhost:3003/events/stats'),
  
  getEventsByType: (type: string) =>
    axios.get(`http://localhost:3003/events/type/${type}`),
  
  getEventsByUser: (userId: number) =>
    axios.get(`http://localhost:3003/events/user/${userId}`),
};

// Order Service API calls
export const orderApi = {
  getStatus: () =>
    axios.get('http://localhost:3002/orders/status'),
  
  getProductStock: () =>
    axios.get('http://localhost:3002/orders/products/stock'),
};
