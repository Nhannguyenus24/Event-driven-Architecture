-- Create the database schema for the event-driven microservice architecture

-- Drop existing tables if they exist (for clean restart)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (event store)
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    user_id INTEGER,
    product_id INTEGER,
    order_id INTEGER,
    data JSONB,
    aggregate_id VARCHAR(100),
    aggregate_type VARCHAR(50)
);

-- Insert sample products (FORCE INSERT)
DELETE FROM products WHERE id IN (1,2,3,4,5,6,7,8,9,10);

INSERT INTO products (id, name, stock, price) VALUES
    (1, 'Laptop Pro 15"', 50, 1299.99),
    (2, 'Wireless Mouse', 100, 29.99),
    (3, 'Mechanical Keyboard', 75, 149.99),
    (4, 'USB-C Hub', 200, 79.99),
    (5, 'Bluetooth Headphones', 80, 199.99),
    (6, '4K Monitor', 30, 399.99),
    (7, 'Webcam HD', 120, 89.99),
    (8, 'Gaming Chair', 25, 299.99),
    (9, 'Desk Lamp LED', 150, 49.99),
    (10, 'Power Bank 20000mAh', 90, 39.99);

-- Reset sequence to ensure proper ID generation
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_aggregate ON events(aggregate_id, aggregate_type);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show current products count for verification
DO $$
BEGIN
    RAISE NOTICE 'Total products inserted: %', (SELECT COUNT(*) FROM products);
END $$;
