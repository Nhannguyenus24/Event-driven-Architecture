import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ShoppingCart, Add, Remove } from '@mui/icons-material';
import { userApi } from '../services/api';

interface Product {
  id: number;
  name: string;
  stock: number;
  price: string | number;
}

interface ProductListProps {
  onSuccess: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  onError: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ProductList: React.FC<ProductListProps> = ({ onSuccess, onError }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [ordering, setOrdering] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProducts();
      console.log(response);
      // Ensure response.data is an array and sort by id to maintain consistent order
      const productsData = Array.isArray(response.data) ? response.data : [];
      const sortedProducts = productsData.sort((a, b) => a.id - b.id);
      setProducts(sortedProducts);
      
      // Initialize quantities
      const initialQuantities: { [key: number]: number } = {};
      sortedProducts.forEach((product: Product) => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array on error
      onError(error.response?.data?.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, change: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handlePlaceOrder = async (productId: number) => {
    const quantity = quantities[productId] || 1;
    
    setOrdering(prev => ({ ...prev, [productId]: true }));
    
    try {
      await userApi.placeOrder(productId, quantity);
      onSuccess(`Order placed successfully for ${quantity} item(s)!`);
      
      // Update stock immediately without reloading and maintain order
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => 
          product.id === productId 
            ? { ...product, stock: product.stock - quantity }
            : product
        );
        // Ensure products remain sorted by id
        return updatedProducts.sort((a, b) => a.id - b.id);
      });
      
      // Reset quantity to 1 after successful order
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      
    } catch (error: any) {
      onError(
        error.response?.data?.message || 'Failed to place order',
        'error'
      );
    } finally {
      setOrdering(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="page-container">
      <Typography variant="h4" className="page-title">
        🛍️ Product Catalog
      </Typography>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: '#6b7280' }}>
            Loading products...
          </Typography>
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info" className="alert-message">
          No products available at the moment.
        </Alert>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <Card key={product.id} className="modern-card">
              <CardContent className="card-content">
                <Box className="product-header">
                  <Typography variant="h6" className="product-name">
                    {product.name}
                  </Typography>
                  {product.stock > 0 ? (
                    <Chip 
                      label={`${product.stock} left`} 
                      className="stock-chip-available"
                      size="small"
                    />
                  ) : (
                    <Chip 
                      label="Out of stock" 
                      className="stock-chip-unavailable"
                      size="small"
                    />
                  )}
                </Box>
                
                <Typography variant="h5" className="product-price">
                  ${typeof product.price === 'string' ? 
                    parseFloat(product.price).toFixed(2) : 
                    product.price.toFixed(2)
                  }
                </Typography>

                {product.stock > 0 && (
                  <Box className="quantity-selector">
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                      Quantity
                    </Typography>
                    <Box className="quantity-controls">
                      <Button
                        size="small"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={quantities[product.id] <= 1}
                        className="quantity-btn"
                      >
                        <Remove fontSize="small" />
                      </Button>
                      <TextField
                        size="small"
                        value={quantities[product.id] || 1}
                        className="quantity-input"
                        inputProps={{
                          min: 1,
                          max: product.stock,
                        }}
                        type="number"
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
                          setQuantities(prev => ({ ...prev, [product.id]: value }));
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={quantities[product.id] >= product.stock}
                        className="quantity-btn"
                      >
                        <Add fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ padding: '0 20px 20px 20px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={ordering[product.id] ? <CircularProgress size={16} /> : <ShoppingCart />}
                  onClick={() => handlePlaceOrder(product.id)}
                  disabled={product.stock === 0 || ordering[product.id]}
                  className={product.stock === 0 ? "btn-disabled" : "btn-primary"}
                >
                  {ordering[product.id] ? (
                    'Placing Order...'
                  ) : product.stock === 0 ? (
                    '❌ Out of Stock'
                  ) : (
                    '🛒 Add to Cart'
                  )}
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      )}
    </Box>
  );
};

export default ProductList;
