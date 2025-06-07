import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export enum BrokerageName {
  BINANCE = 'Binance',
}

@Entity()
export class BrokerageConnection {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column({
    type: 'enum',
    enum: BrokerageName,
  })
  brokerage!: BrokerageName;

  @Column()
  apiKey!: string; // Criptografada

  @Column()
  apiSecret!: string; // Criptografada

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 