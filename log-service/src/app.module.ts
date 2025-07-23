import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './controllers/log.controller';
import { LogService } from './services/log.service';
import { Event } from './entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/event_driven_db',
      entities: [Event],
      synchronize: false, // We use init-db.sql instead
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [LogController],
  providers: [LogService],
})
export class AppModule {}
