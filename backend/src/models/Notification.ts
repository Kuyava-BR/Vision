import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NotificationSignal {
  BUY = 'buy',
  SELL = 'sell',
  NEUTRAL = 'neutral',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  asset!: string; // Ex: 'BTCUSDT'

  @Column({
    type: 'enum',
    enum: NotificationSignal,
  })
  signal!: NotificationSignal; // 'buy' ou 'sell'

  @Column('decimal', { precision: 18, scale: 8 })
  priceAtSignal!: number; // Preço do ativo no momento do sinal

  @Column()
  indicator!: string; // Indicador que gerou o sinal. Ex: "Cruzamento de Médias Móveis (9, 21)"

  @Column('text')
  reason!: string; // Descrição do motivo. Ex: "Média móvel curta cruzou para cima da longa."

  @CreateDateColumn()
  createdAt!: Date;
} 