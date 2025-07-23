import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './controllers/order.controller';
import { OrderProcessingService } from './services/order-processing.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/event_driven_db',
      entities: [Product, Order],
      synchronize: false, // We use init-db.sql instead
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([Product, Order]),
  ],
  controllers: [OrderController],
  providers: [
    OrderProcessingService,
    RabbitMQService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private rabbitMQService: RabbitMQService,
    private orderProcessingService: OrderProcessingService,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitMQService.connect();
      
      // Start consuming order events
      await this.rabbitMQService.startConsuming(
        this.orderProcessingService.processOrderEvent.bind(this.orderProcessingService)
      );
      
      console.log('Order service started and listening for events');
    } catch (error) {
      console.error('Failed to initialize order service:', error);
    }
  }
}
