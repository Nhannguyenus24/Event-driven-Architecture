import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Assessment,
  ExitToApp,
} from '@mui/icons-material';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import MyOrders from './pages/MyOrders';
import EventLogs from './pages/EventLogs';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user && (location.pathname === '/login' || location.pathname === '/register')) {
    return null;
  }

  return (
    <AppBar position="static" className="modern-nav" elevation={0}>
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '1.25rem'
          }}
        >
          🛒 EcoCom Store
        </Typography>
        
        {user ? (
          <>
            <Button
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/products')}
              className={`nav-button ${location.pathname === '/products' ? 'active' : ''}`}
            >
              Products
            </Button>
            <Button
              startIcon={<Person />}
              onClick={() => navigate('/my-orders')}
              className={`nav-button ${location.pathname === '/my-orders' ? 'active' : ''}`}
            >
              My Orders
            </Button>
            <Button
              startIcon={<Assessment />}
              onClick={() => navigate('/events')}
              className={`nav-button ${location.pathname === '/events' ? 'active' : ''}`}
            >
              Event Logs
            </Button>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2,
                fontWeight: 500,
                color: '#6b7280',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Hi, {user.username}
            </Typography>
            <Button
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              className="nav-button-primary"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => navigate('/login')}
              className="nav-button"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="nav-button-primary"
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
      navigate('/products');
    } else if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ message, severity });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <Navigation />
      <Box className="page-container">
        <Container maxWidth="lg" className="main-content">
          <Routes>
            <Route path="/login" element={<Login onSuccess={showNotification} />} />
            <Route path="/register" element={<Register onSuccess={showNotification} />} />
            <Route path="/products" element={<ProductList onSuccess={showNotification} onError={showNotification} />} />
            <Route path="/my-orders" element={<MyOrders onSuccess={showNotification} onError={showNotification} />} />
            <Route path="/events" element={<EventLogs />} />
            <Route path="/" element={<div className="loading-container"><div className="loading-text">Loading...</div></div>} />
          </Routes>
        </Container>
      </Box>
      
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification ? (
          <Alert 
            onClose={hideNotification} 
            severity={notification.severity} 
            sx={{ 
              width: '100%',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
