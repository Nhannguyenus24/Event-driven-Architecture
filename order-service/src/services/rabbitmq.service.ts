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
      
      if (!this.connection) {
        throw new Error('Failed to establish RabbitMQ connection');
      }
      
      this.channel = await this.connection.createChannel();
      
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

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

  async startConsuming(callback: (message: any) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Failed to establish RabbitMQ channel');
      }

      await this.channel.consume('order.events', async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            this.logger.log('Received event:', content);
            
            await callback(content);
            
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing message:', error);
            this.channel.nack(msg, false, false); // Dead letter the message
          }
        }
      });

      this.logger.log('Started consuming messages from order.events queue');
    } catch (error) {
      this.logger.error('Error starting message consumption:', error);
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
