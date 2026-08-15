import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  EstadoChip,
  EstadoEquipo,
  TipoPC,
  UsoChip,
} from './inventario.enums';

@Entity('PCLaptops')
export class PCLaptop {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Column({ name: 'Tipo', type: 'varchar', length: 20 })
  tipo!: TipoPC;

  @Index({ unique: true })
  @Column({ name: 'Serial', type: 'varchar', length: 100 })
  serial!: string;

  @Column({ name: 'Marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ name: 'Modelo', type: 'varchar', length: 150, nullable: true })
  modelo!: string | null;

  @Column({
    name: 'Caracteristicas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  caracteristicas!: string | null;

  @Column({ name: 'Anexo', type: 'varchar', length: 100, nullable: true })
  anexo!: string | null;

  @Column({
    name: 'EstadoEquipo',
    type: 'varchar',
    length: 20,
    default: EstadoEquipo.STOCK,
  })
  estadoEquipo!: EstadoEquipo;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Column({
    name: 'UltimoUsuario',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  ultimoUsuario!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;

  @Column({ name: 'Oficina', type: 'varchar', length: 150, nullable: true })
  oficina!: string | null;

  @Column({ name: 'Ubicacion', type: 'varchar', length: 200, nullable: true })
  ubicacion!: string | null;

  @Column({
    name: 'Observaciones',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  observaciones!: string | null;

  @Column({ name: 'Posicion', type: 'varchar', length: 100, nullable: true })
  posicion!: string | null;
}

@Entity('Monitores')
export class Monitor {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'Serial', type: 'varchar', length: 100 })
  serial!: string;

  @Column({ name: 'Marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ name: 'Modelo', type: 'varchar', length: 150, nullable: true })
  modelo!: string | null;

  @Column({
    name: 'Caracteristicas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  caracteristicas!: string | null;

  @Column({ name: 'Anexo', type: 'varchar', length: 100, nullable: true })
  anexo!: string | null;

  @Column({
    name: 'EstadoEquipo',
    type: 'varchar',
    length: 20,
    default: EstadoEquipo.STOCK,
  })
  estadoEquipo!: EstadoEquipo;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Column({
    name: 'UltimoUsuario',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  ultimoUsuario!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;

  @Column({ name: 'Oficina', type: 'varchar', length: 150, nullable: true })
  oficina!: string | null;

  @Column({ name: 'Ubicacion', type: 'varchar', length: 200, nullable: true })
  ubicacion!: string | null;

  @Column({
    name: 'Observaciones',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  observaciones!: string | null;

  @Column({ name: 'Posicion', type: 'varchar', length: 100, nullable: true })
  posicion!: string | null;
}

@Entity('Tablets')
export class Tablet {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'IMEI', type: 'varchar', length: 15 })
  imei!: string;

  @Index({ unique: true })
  @Column({ name: 'Serie', type: 'varchar', length: 100 })
  serie!: string;

  @Column({ name: 'Marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ name: 'Modelo', type: 'varchar', length: 150, nullable: true })
  modelo!: string | null;

  @Column({
    name: 'Caracteristicas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  caracteristicas!: string | null;

  @Column({
    name: 'EstadoEquipo',
    type: 'varchar',
    length: 20,
    default: EstadoEquipo.STOCK,
  })
  estadoEquipo!: EstadoEquipo;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Index({ unique: true })
  @Column({ name: 'IDTablet', type: 'varchar', length: 100 })
  idTablet!: string;

  @Column({ name: 'Kiosko', type: 'varchar', length: 100, nullable: true })
  kiosko!: string | null;

  @Column({
    name: 'TabletReposicion',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tabletReposicion!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;
}

@Entity('Modems')
export class Modem {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'IMEI', type: 'varchar', length: 20 })
  imei!: string;

  @Index({ unique: true })
  @Column({ name: 'Serie', type: 'varchar', length: 100 })
  serie!: string;

  @Column({ name: 'Marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ name: 'Modelo', type: 'varchar', length: 150, nullable: true })
  modelo!: string | null;

  @Column({
    name: 'EstadoEquipo',
    type: 'varchar',
    length: 20,
    default: EstadoEquipo.STOCK,
  })
  estadoEquipo!: EstadoEquipo;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Column({
    name: 'Observacion',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  observacion!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;

  @Column({
    name: 'NombreRed',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  nombreRed!: string | null;

  @Column({
    name: 'ContrasenaRed',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  contrasenaRed!: string | null;
}

@Entity('Celulares')
export class Celular {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'IMEI', type: 'varchar', length: 20 })
  imei!: string;

  @Column({ name: 'Marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ name: 'Modelo', type: 'varchar', length: 150, nullable: true })
  modelo!: string | null;

  @Column({
    name: 'Caracteristicas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  caracteristicas!: string | null;

  @Index({ unique: true })
  @Column({ name: 'Serie', type: 'varchar', length: 100 })
  serie!: string;

  @Column({
    name: 'EstadoEquipo',
    type: 'varchar',
    length: 20,
    default: EstadoEquipo.STOCK,
  })
  estadoEquipo!: EstadoEquipo;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Column({
    name: 'Observacion',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  observacion!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;
}

@Entity('Chips')
export class Chip {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'Numero', type: 'varchar', length: 9 })
  numero!: string;

  @Index({ unique: true })
  @Column({ name: 'ICCID', type: 'varchar', length: 22 })
  iccid!: string;

  @Column({ name: 'Operador', type: 'varchar', length: 100, nullable: true })
  operador!: string | null;

  @Column({ name: 'Uso', type: 'varchar', length: 20 })
  uso!: UsoChip;

  @Column({ name: 'Estado', type: 'varchar', length: 20 })
  estado!: EstadoChip;

  @Column({ name: 'Area', type: 'varchar', length: 150, nullable: true })
  area!: string | null;

  @Column({ name: 'Usuario', type: 'varchar', length: 200, nullable: true })
  usuario!: string | null;

  @Column({ name: 'Lote', type: 'varchar', length: 100, nullable: true })
  lote!: string | null;

  @Column({ name: 'Ticket', type: 'varchar', length: 100, nullable: true })
  ticket!: string | null;

  @Column({ name: 'Correo', type: 'varchar', length: 200, nullable: true })
  correo!: string | null;

  @Column({
    name: 'Observaciones',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  observaciones!: string | null;
}