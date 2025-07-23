import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async saveEvent(
    type: string,
    data: any,
    userId?: number,
    productId?: number,
    orderId?: number,
    aggregateId?: string,
    aggregateType?: string
  ): Promise<Event> {
    const event = this.eventRepository.create({
      type,
      data,
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      aggregate_id: aggregateId,
      aggregate_type: aggregateType,
    });

    return await this.eventRepository.save(event);
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { type },
      order: { timestamp: 'DESC' },
    });
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
    });
  }

  async getAllEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      order: { timestamp: 'DESC' },
    });
  }
}
