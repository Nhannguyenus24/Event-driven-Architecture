import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LogService } from '../services/log.service';

@ApiTags('Event Logs')
@Controller('events')
export class LogController {
  constructor(private logService: LogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events from the event store' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getAllEvents() {
    const events = await this.logService.getAllEvents();
    return {
      total: events.length,
      events,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getEventsStats() {
    return await this.logService.getEventsStats();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get events by type' })
  @ApiParam({ name: 'type', description: 'Event type to filter by' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEventsByType(@Param('type') type: string) {
    const events = await this.logService.getEventsByType(type);
    return {
      type,
      total: events.length,
      events,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get events by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID to filter by' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEventsByUser(@Param('userId') userId: number) {
    const events = await this.logService.getEventsByUser(userId);
    return {
      userId,
      total: events.length,
      events,
    };
  }

  @Get('range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const events = await this.logService.getEventsByDateRange(start, end);
    return {
      dateRange: { start, end },
      total: events.length,
      events,
    };
  }
}
