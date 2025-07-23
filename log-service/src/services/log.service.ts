import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getAllEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      order: { timestamp: 'DESC' },
      take: 1000, // Limit to last 1000 events for performance
    });
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { type },
      order: { timestamp: 'DESC' },
      take: 500,
    });
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
      take: 500,
    });
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.timestamp >= :startDate', { startDate })
      .andWhere('event.timestamp <= :endDate', { endDate })
      .orderBy('event.timestamp', 'DESC')
      .take(1000)
      .getMany();
  }

  async getEventsStats(): Promise<any> {
    const totalEvents = await this.eventRepository.count();
    
    const eventTypeStats = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.type')
      .orderBy('count', 'DESC')
      .getRawMany();

    const recentEvents = await this.eventRepository.find({
      order: { timestamp: 'DESC' },
      take: 10,
    });

    return {
      totalEvents,
      eventTypeStats,
      recentEvents,
    };
  }
}
