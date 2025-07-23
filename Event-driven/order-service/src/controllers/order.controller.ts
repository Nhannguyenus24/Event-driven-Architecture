import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order.entity';

@ApiTags('Order Status')
@Controller('orders')
export class OrderController {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get order processing status' })
  @ApiResponse({ status: 200, description: 'Service status retrieved successfully' })
  async getStatus() {
    const orderCount = await this.orderRepository.count();
    return {
      service: 'Order Processing Service',
      status: 'running',
      ordersProcessed: orderCount,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('products/stock')
  @ApiOperation({ summary: 'Get current product stock levels' })
  @ApiResponse({ status: 200, description: 'Stock levels retrieved successfully' })
  async getProductStock() {
    const products = await this.productRepository.find();
    return products.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      price: product.price,
    }));
  }
}
