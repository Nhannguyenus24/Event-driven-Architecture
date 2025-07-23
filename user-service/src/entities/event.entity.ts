import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  event_id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ length: 50 })
  type: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  product_id: number;

  @Column({ nullable: true })
  order_id: number;

  @Column('jsonb', { nullable: true })
  data: any;

  @Column({ length: 100, nullable: true })
  aggregate_id: string;

  @Column({ length: 50, nullable: true })
  aggregate_type: string;
}
