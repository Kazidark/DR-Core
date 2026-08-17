import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


/* =========================================================
   ESTADO
   ========================================================= */

export enum EstadoCorreo {
  USADO =
    'Usado',

  RESERVA =
    'Reserva',
}


/* =========================================================
   ENTIDAD
   ========================================================= */

@Entity('Correos')
export class Correo {

  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  /* =====================================================
     NOMBRE
     ===================================================== */

  @Column({
    name: 'Nombre',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombre!:
    string | null;


  /* =====================================================
     APELLIDO
     ===================================================== */

  @Column({
    name: 'Apellido',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  apellido!:
    string | null;


  /* =====================================================
     CUENTA DE CORREO
     ===================================================== */

  @Column({
    name: 'CuentaCorreo',
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  cuentaCorreo!:
    string | null;


  /* =====================================================
     ESTADO
     ===================================================== */

  @Column({
    name: 'Estado',
    type: 'varchar',
    length: 20,
    default:
      EstadoCorreo.RESERVA,
  })
  estado!:
    EstadoCorreo;


  /* =====================================================
     FECHA SOLICITADA
     ===================================================== */

  @Column({
    name: 'FechaSolicitada',
    type: 'date',
    nullable: true,
  })
  fechaSolicitada!:
    string | null;


  /* =====================================================
     CORREO CREADO
     ===================================================== */

  @Column({
    name: 'CorreoCreado',
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  correoCreado!:
    string | null;


  /* =====================================================
     SOLICITANTE
     ===================================================== */

  @Column({
    name: 'Solicitante',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  solicitante!:
    string | null;


  /* =====================================================
     FECHA DE CREACIÓN
     ===================================================== */

  @Column({
    name: 'FechaCreacion',
    type: 'date',
    nullable: true,
  })
  fechaCreacion!:
    string | null;


  /* =====================================================
     OBSERVACIÓN
     ===================================================== */

  @Column({
    name: 'Observacion',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  observacion!:
    string | null;


  /* =====================================================
     USUARIO ANTERIOR
     ===================================================== */

  @Column({
    name: 'UsuarioAnterior',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  usuarioAnterior!:
    string | null;

}