# Event-Driven Microservice E-Commerce Platform

A complete MVP application demonstrating modern event-driven microservice architecture with NestJS, React, PostgreSQL, and RabbitMQ.

## 🏗️ Architecture Overview

This platform consists of:

### Backend Services
- **User Service** (Port 3001) - Authentication, orders management, and product catalog
- **Order Service** (Port 3002) - Event-driven order processing and stock management  
- **Log Service** (Port 3003) - Event store and logging

### Frontend
- **React Application** (Port 80) - Modern UI with Material-UI

### Infrastructure  
- **PostgreSQL** (Port 5432) - Shared database
- **RabbitMQ** (Port 5672/15672) - Message broker for event streaming
- **NGINX** - Reverse proxy and static file serving

## 🚀 Features

### User Service (Publisher)
- ✅ User registration and authentication (JWT)
- ✅ Product catalog browsing
- ✅ Place orders (publishes events)
- ✅ Pay for orders (publishes events)
- ✅ Cancel orders (publishes events)
- ✅ View order history
- ✅ Swagger API documentation

### Order Service (Subscriber)
- ✅ Listens to order events via RabbitMQ
- ✅ Automatic stock reduction on order placement
- ✅ Order status updates on payment
- ✅ Stock restoration on order cancellation
- ✅ Real-time inventory management

### Log Service
- ✅ Complete event store for all system events
- ✅ Event analytics and statistics
- ✅ Searchable event history
- ✅ REST API for event querying

### Frontend Features
- ✅ Modern React UI with Material-UI
- ✅ User authentication (login/register)
- ✅ Product catalog with real-time stock
- ✅ Shopping cart functionality
- ✅ Order management (place, pay, cancel)
- ✅ Order history tracking
- ✅ Event logs visualization
- ✅ Responsive design

## 🛠️ Technology Stack

- **Backend**: NestJS, TypeScript, TypeORM
- **Frontend**: React, TypeScript, Material-UI
- **Database**: PostgreSQL
- **Message Broker**: RabbitMQ
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Web Server**: NGINX

## 📦 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone and Start
```bash
git clone <repository-url>
cd Event-driven
docker-compose up --build
```

### 2. Wait for Services
The startup process will:
- Initialize PostgreSQL with sample data (10 products)
- Set up RabbitMQ exchanges and queues
- Start all microservices
- Launch the React frontend

### 3. Access the Application
- **Frontend**: http://localhost
- **User Service API**: http://localhost:3001/api
- **Order Service API**: http://localhost:3002/api  
- **Log Service API**: http://localhost:3003/api
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)

## 🎯 Usage Guide

### 1. Register/Login
- Navigate to http://localhost
- Create a new account or login
- JWT tokens handle authentication

### 2. Browse Products
- View the product catalog
- See real-time stock levels
- Select quantities for purchase

### 3. Place Orders
- Add products to cart
- Orders are immediately processed
- Stock is automatically reduced

### 4. Manage Orders
- View your order history
- Pay for pending orders
- Cancel orders (restores stock)

### 5. Monitor Events
- Check the Event Logs page
- View real-time system events
- Analyze event statistics

## 🔄 Event Flow

```
User Action → User Service → RabbitMQ → Order Service → Database
                    ↓
              Event Store ← Log Service
```

### Event Types
- `order.placed` - New order created
- `order.paid` - Payment processed
- `order.cancelled` - Order cancelled

## 🗄️ Database Schema

```sql
-- Core entities
users (id, username, password, created_at)
products (id, name, stock, price, created_at)  
orders (id, product_id, user_id, status, quantity, total_amount, created_at, updated_at)
events (event_id, timestamp, type, user_id, product_id, order_id, data, aggregate_id, aggregate_type)
```

## 🐳 Docker Services

```yaml
services:
  postgres:5432     # Database
  rabbitmq:5672     # Message broker  
  user-service:3001 # Authentication & orders
  order-service:3002 # Event processing
  log-service:3003  # Event store
  frontend:80       # React app + NGINX
```

## 🧪 API Testing

### User Service Endpoints
```bash
# Register
POST /auth/register
Body: {"username": "john", "password": "password123"}

# Login  
POST /auth/login
Body: {"username": "john", "password": "password123"}

# Get products
GET /products

# Place order
POST /orders/place
Headers: Authorization: Bearer <token>
Body: {"product_id": 1, "quantity": 2}

# Pay order
POST /orders/pay  
Headers: Authorization: Bearer <token>
Body: {"order_id": 1}

# Cancel order
POST /orders/cancel
Headers: Authorization: Bearer <token>
Body: {"order_id": 1}

# Get my orders
GET /orders/my-orders
Headers: Authorization: Bearer <token>
```

### Log Service Endpoints
```bash
# Get all events
GET /events

# Get event statistics
GET /events/stats

# Get events by type
GET /events/type/order.placed

# Get events by user
GET /events/user/1
```

## 🚀 **Ready to Run!**

Your complete event-driven microservice e-commerce platform is now ready! 

To start the application:

```bash
cd "d:\Intellij Project\Event-driven"
docker-compose up --build
```

Then visit **http://localhost** to see your application in action!


This is a production-ready MVP that demonstrates modern microservice patterns and can be easily extended for real-world use cases!
