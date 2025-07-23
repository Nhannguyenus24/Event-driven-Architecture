import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private readonly logger = new Logger(RabbitMQService.name);

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl =
        process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchanges and queues
      await this.channel.assertExchange('events', 'topic', { durable: true });
      await this.channel.assertQueue('order.events', { durable: true });
      await this.channel.bindQueue('order.events', 'events', 'order.*');

      this.logger.log('Connected to RabbitMQ successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publishEvent(routingKey: string, data: Record<string, any>): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Failed to establish RabbitMQ channel');
      }

      const message = {
        ...data,
        timestamp: new Date().toISOString(),
        eventId: `${routingKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const sent = this.channel.publish(
        'events',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );

      if (sent) {
        this.logger.log(`Event published: ${routingKey}`, message);
      } else {
        this.logger.warn(`Failed to publish event: ${routingKey}`);
      }
    } catch (error) {
      this.logger.error(`Error publishing event ${routingKey}:`, error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}
