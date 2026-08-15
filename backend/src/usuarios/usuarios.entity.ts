import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/* =========================================================
   ROLES
   ========================================================= */

export enum RolUsuario {
  ADMINISTRADOR = 'Administrador',
  CONSULTOR = 'Consultor',
}

/* =========================================================
   USUARIOS DEL SISTEMA
   ========================================================= */

@Entity('Usuarios')
export class UsuarioSistema {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;

  @Column({
    name: 'Nombres',
    type: 'varchar',
    length: 150,
  })
  nombres!: string;

  @Column({
    name: 'Apellidos',
    type: 'varchar',
    length: 150,
  })
  apellidos!: string;

  @Column({
    name: 'Usuario',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  usuario!: string;

  @Column({
    name: 'Correo',
    type: 'varchar',
    length: 200,
    unique: true,
  })
  correo!: string;

  @Column({
    name: 'Rol',
    type: 'varchar',
    length: 30,
  })
  rol!: RolUsuario;

  @Column({
    name: 'Activo',
    type: 'bit',
    default: true,
  })
  activo!: boolean;
}

/* =========================================================
   CREDENCIALES
   ========================================================= */

@Entity('UsuarioCredenciales')
export class UsuarioCredencial {
  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;

  @OneToOne(
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
    name: 'PasswordHash',
    type: 'varchar',
    length: 255,
  })
  passwordHash!: string;

  @Column({
    name: 'Salt',
    type: 'varchar',
    length: 255,
  })
  salt!: string;

  @Column({
    name: 'ActualizadoEn',
    type: 'datetime2',
  })
  actualizadoEn!: Date;
}