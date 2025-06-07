import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export enum AlertStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  INACTIVE = 'inactive',
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  asset!: string; // Ex: 'BTCUSDT'

  @Column({ type: 'text' })
  description!: string; // Descrição legível do alerta. Ex: "RSI acima de 70"

  @Column({ type: 'jsonb' })
  conditions!: object; // Ex: { "indicator": "RSI", "operator": ">", "value": 70 }

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status!: AlertStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 