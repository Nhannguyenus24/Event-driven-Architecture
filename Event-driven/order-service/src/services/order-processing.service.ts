import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class OrderProcessingService {
  private readonly logger = new Logger(OrderProcessingService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async processOrderEvent(eventData: any): Promise<void> {
    const { eventId, timestamp, ...data } = eventData;
    switch (data.status) {
      case 'pending':
        await this.handleOrderPlaced(data);
        break;
      case 'paid':
        await this.handleOrderPaid(data);
        break;
      case 'cancelled':
        await this.handleOrderCancelled(data);
        break;
      default:
        this.logger.warn('Unknown event type received:', eventData);
    }
  }

  private async handleOrderPlaced(data: any): Promise<void> {
    try {
      this.logger.log('Processing order placement:', data);
      
      const { orderId, productId, quantity } = data;
      
      // Find the product
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        this.logger.error(`Product not found: ${productId}`);
        return;
      }

      // Check stock availability
      if (product.stock < quantity) {
        this.logger.error(`Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`);
        return;
      }

      // Reduce stock
      product.stock -= quantity;
      await this.productRepository.save(product);

      this.logger.log(`Stock reduced for product ${productId}. New stock: ${product.stock}`);
    } catch (error) {
      this.logger.error('Error handling order placement:', error);
    }
  }

  private async handleOrderPaid(data: any): Promise<void> {
    try {
      this.logger.log('Processing order payment:', data);
      
      const { orderId } = data;
      
      // Find the order and update status to completed
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (order) {
        order.status = 'completed';
        await this.orderRepository.save(order);
        this.logger.log(`Order ${orderId} marked as completed`);
      } else {
        this.logger.error(`Order not found: ${orderId}`);
      }
    } catch (error) {
      this.logger.error('Error handling order payment:', error);
    }
  }

  private async handleOrderCancelled(data: any): Promise<void> {
    try {
      this.logger.log('Processing order cancellation:', data);
      
      const { orderId, productId, quantity } = data;
      
      // Find the order
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.error(`Order not found: ${orderId}`);
        return;
      }

      // Restore stock only if order was pending (stock was already reduced)
      if (order) {
        const product = await this.productRepository.findOne({
          where: { id: productId },
        });

        if (product) {
          product.stock += quantity;
          await this.productRepository.save(product);
          this.logger.log(`Stock restored for product ${productId}. New stock: ${product.stock}`);
        }
      }

      // Update order status
      order.status = 'cancelled';
      await this.orderRepository.save(order);
      
      this.logger.log(`Order ${orderId} cancelled and stock restored`);
    } catch (error) {
      this.logger.error('Error handling order cancellation:', error);
    }
  }
}
