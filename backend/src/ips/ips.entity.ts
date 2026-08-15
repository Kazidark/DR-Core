import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


export enum SegmentoIp {
  SEGMENTO_26 = '26',
  SEGMENTO_46 = '46',
  SEGMENTO_56 = '56',
  SEGMENTO_100 = '100',
}


@Entity('Ips')
export class IpRegistro {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  @Column({
    name: 'Segmento',
    type: 'varchar',
    length: 10,
  })
  segmento!: SegmentoIp;


  @Column({
    name: 'Ip',
    type: 'varchar',
    length: 45,
    unique: true,
  })
  ip!: string;


  @Column({
    name: 'HostName',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  hostName!: string | null;


  @Column({
    name: 'Usuario',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  usuario!: string | null;


  @Column({
    name: 'Area',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  area!: string | null;


  @Column({
    name: 'Ubicacion',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  ubicacion!: string | null;


  @Column({
    name: 'Oficina',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  oficina!: string | null;


  @Column({
    name: 'Observacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacion!: string | null;
}