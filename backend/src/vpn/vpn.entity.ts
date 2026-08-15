import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


export enum TipoVPN {
  FORTI = 'Forti',
  WEB = 'WEB',
}


export enum EstadoVPN {
  ASIGNADO = 'Asignado',
  RESERVA = 'Reserva',
}


export enum EstadoForti {
  ACTIVO = 'Activo',
  DESACTIVADO = 'Desactivado',
}


@Entity('VPN')
export class Vpn {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  @Column({
    name: 'NombresCompletos',
    type: 'varchar',
    length: 200,
  })
  nombresCompletos!: string;


  @Column({
    name: 'Usuario',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  usuario!: string;


  @Column({
    name: 'Correo',
    type: 'varchar',
    length: 200,
  })
  correo!: string;


  @Column({
    name: 'Area',
    type: 'varchar',
    length: 150,
  })
  area!: string;


  @Column({
    name: 'JefeAutorizador',
    type: 'varchar',
    length: 200,
  })
  jefeAutorizador!: string;


  @Column({
    name: 'TipoVPN',
    type: 'varchar',
    length: 20,
  })
  tipoVpn!: TipoVPN;


  @Column({
    name: 'Estado',
    type: 'varchar',
    length: 20,
  })
  estado!: EstadoVPN;


  @Column({
    name: 'Forti',
    type: 'varchar',
    length: 20,
  })
  forti!: EstadoForti;


  @Column({
    name: 'LastUser',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  lastUser!: string | null;
}