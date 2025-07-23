import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { PlaceOrderDto, PayOrderDto, CancelOrderDto } from '../dto/order.dto';
import { RabbitMQService } from './rabbitmq.service';
import { EventStoreService } from './event-store.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rabbitMQService: RabbitMQService,
    private eventStoreService: EventStoreService,
  ) {}

  async placeOrder(userId: number, placeOrderDto: PlaceOrderDto): Promise<Order> {
    const { product_id, quantity } = placeOrderDto;

    // Validate product exists and has sufficient stock
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Calculate total amount
    const total_amount = product.price * quantity;

    // Create order
    const order = this.orderRepository.create({
      product_id,
      user_id: userId,
      quantity,
      total_amount,
      status: 'pending',
    });

    const savedOrder = await this.orderRepository.save(order);

    // Update product stock (deduct the ordered quantity)
    // product.stock -= quantity;
    // await this.productRepository.save(product);

    // Publish event to RabbitMQ
    const eventData = {
      orderId: savedOrder.id,
      userId,
      productId: product_id,
      quantity,
      totalAmount: total_amount,
      status: 'pending',
    };

    await this.rabbitMQService.publishEvent('order.placed', eventData);

    // Save event to event store
    await this.eventStoreService.saveEvent(
      'order.placed',
      eventData,
      userId,
      product_id,
      savedOrder.id,
      `order-${savedOrder.id}`,
      'order'
    );

    return savedOrder;
  }

  async payOrder(userId: number, payOrderDto: PayOrderDto): Promise<Order> {
    const { order_id } = payOrderDto;

    // Find order
    const order = await this.orderRepository.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Order cannot be paid');
    }

    // Update order status
    order.status = 'paid';
    const updatedOrder = await this.orderRepository.save(order);

    // Publish event to RabbitMQ
    const eventData = {
      orderId: order_id,
      userId,
      productId: order.product_id,
      status: 'paid',
    };

    await this.rabbitMQService.publishEvent('order.paid', eventData);

    // Save event to event store
    await this.eventStoreService.saveEvent(
      'order.paid',
      eventData,
      userId,
      order.product_id,
      order_id,
      `order-${order_id}`,
      'order'
    );

    return updatedOrder;
  }

  async cancelOrder(userId: number, cancelOrderDto: CancelOrderDto): Promise<Order> {
    const { order_id } = cancelOrderDto;

    // Find order
    const order = await this.orderRepository.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed order');
    }

    // Find the product to restore stock
    const product = await this.productRepository.findOne({
      where: { id: order.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Update order status
    order.status = 'cancelled';
    const updatedOrder = await this.orderRepository.save(order);

    // Restore product stock (add back the cancelled quantity)
    // product.stock += order.quantity;
    // await this.productRepository.save(product);

    // Publish event to RabbitMQ
    const eventData = {
      orderId: order_id,
      userId,
      productId: order.product_id,
      quantity: order.quantity,
      status: 'cancelled',
    };

    await this.rabbitMQService.publishEvent('order.cancelled', eventData);

    // Save event to event store
    await this.eventStoreService.saveEvent(
      'order.cancelled',
      eventData,
      userId,
      order.product_id,
      order_id,
      `order-${order_id}`,
      'order'
    );

    return updatedOrder;
  }

  async getUserOrders(userId: number): Promise<any[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });

    // Transform the result to include product_name at the top level
    return orders.map(order => ({
      id: order.id,
      product_id: order.product_id,
      user_id: order.user_id,
      quantity: order.quantity,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      product_name: order.product?.name || 'Unknown Product'
    }));
  }

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      order: { id: 'ASC' }
    });
  }
}
