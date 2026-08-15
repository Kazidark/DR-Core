import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  UsuarioSistema,
} from '../usuarios/usuarios.entity';


@Entity('PasswordResetTokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  @ManyToOne(
    () => UsuarioSistema,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'UsuarioId',
  })
  usuario!: UsuarioSistema;


  @Column({
    name: 'TokenHash',
    type: 'varchar',
    length: 64,
    unique: true,
  })
  tokenHash!: string;


  @Column({
    name: 'ExpiraEn',
    type: 'datetime2',
  })
  expiraEn!: Date;


  @Column({
    name: 'Utilizado',
    type: 'bit',
    default: false,
  })
  utilizado!: boolean;


  @Column({
    name: 'CreadoEn',
    type: 'datetime2',
  })
  creadoEn!: Date;


  @Column({
    name: 'UtilizadoEn',
    type: 'datetime2',
    nullable: true,
  })
  utilizadoEn!: Date | null;
}