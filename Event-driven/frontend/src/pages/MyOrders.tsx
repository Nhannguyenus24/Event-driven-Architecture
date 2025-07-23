import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Payment, Cancel, Refresh } from '@mui/icons-material';
import { userApi } from '../services/api';

interface Order {
  id: number;
  product_id: number;
  user_id: number;
  status: string;
  quantity: number;
  total_amount: number | string;
  created_at: string;
  updated_at: string;
  product_name: string;
}

interface MyOrdersProps {
  onSuccess: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  onError: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ onSuccess, onError }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await userApi.getMyOrders();
      
      // Ensure response.data is an array
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
      onError(error.response?.data?.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOrder = async (orderId: number) => {
    setProcessing(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await userApi.payOrder(orderId);
      onSuccess('Order paid successfully!');
      await fetchOrders(); // Refresh orders
    } catch (error: any) {
      onError(
        error.response?.data?.message || 'Failed to pay order',
        'error'
      );
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setProcessing(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await userApi.cancelOrder(orderId);
      onSuccess('Order cancelled successfully!');
      await fetchOrders(); // Refresh orders
    } catch (error: any) {
      onError(
        error.response?.data?.message || 'Failed to cancel order',
        'error'
      );
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" className="page-title" sx={{ margin: 0 }}>
          📦 My Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
          disabled={loading}
          sx={{ borderRadius: '12px' }}
        >
          Refresh
        </Button>
      </Box>
      
      {orders.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          No orders found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order, index) => (
            <Grid item xs={12} md={6} lg={4} key={order.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                      Order #{order.id}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea', mb: 1 }}>
                    🛍️ {order.product_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    🆔 Product ID: {order.product_id}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    📊 Quantity: {order.quantity}
                  </Typography>
                  
                  <Typography variant="h6" className="price-display" gutterBottom>
                    💰 Total: ${parseFloat(String(order.total_amount || 0)).toFixed(2)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    🕒 Ordered: {formatDate(order.created_at)}
                  </Typography>
                  
                  {order.updated_at !== order.created_at && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      🔄 Updated: {formatDate(order.updated_at)}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  {order.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Payment />}
                        onClick={() => handlePayOrder(order.id)}
                        disabled={processing[order.id]}
                        size="small"
                      >
                        {processing[order.id] ? <CircularProgress size={16} /> : 'Pay'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={processing[order.id]}
                        size="small"
                      >
                        {processing[order.id] ? <CircularProgress size={16} /> : 'Cancel'}
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'paid' && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={processing[order.id]}
                      size="small"
                    >
                      {processing[order.id] ? <CircularProgress size={16} /> : 'Cancel'}
                    </Button>
                  )}
                  
                  {(order.status === 'cancelled' || order.status === 'completed') && (
                    <Typography variant="body2" color="text.secondary">
                      No actions available
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyOrders;
