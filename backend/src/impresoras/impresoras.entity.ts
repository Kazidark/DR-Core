import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('Impresoras')
export class Impresora {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  @Column({
    name: 'IpCompleta',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  ipCompleta!: string;


  @Column({
    name: 'Nombre',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombre!: string | null;


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
    name: 'Observacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacion!: string | null;


  @Column({
    name: 'AreaAnterior',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  areaAnterior!: string | null;
}