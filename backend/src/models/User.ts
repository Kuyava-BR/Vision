import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(6)
  password!: string;

  @Column({ default: 'user' })
  role!: 'user' | 'premium' | 'admin';

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'json', nullable: true })
  permissions!: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceFingerprint?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
} 