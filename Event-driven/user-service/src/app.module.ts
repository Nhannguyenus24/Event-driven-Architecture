import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { OrderController, ProductController } from './controllers/order.controller';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { EventStoreService } from './services/event-store.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { Event } from './entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://admin:password@postgres:5432/eventstore',
      entities: [User, Product, Order, Event],
      synchronize: false, // We use init-db.sql instead
      logging: process.env.NODE_ENV !== 'production',
      retryAttempts: 5,
      retryDelay: 3000,
    }),
    TypeOrmModule.forFeature([User, Product, Order, Event]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, OrderController, ProductController],
  providers: [
    AuthService,
    OrderService,
    RabbitMQService,
    EventStoreService,
    JwtStrategy,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    try {
      await this.rabbitMQService.connect();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ on startup:', error);
    }
  }
}
