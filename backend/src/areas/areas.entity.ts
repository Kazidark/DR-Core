import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Areas')
export class Area {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;

  @Column({
    name: 'Nombre',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nombre!: string;

  @Column({
    name: 'Activo',
    type: 'bit',
    default: true,
  })
  activo!: boolean;
}