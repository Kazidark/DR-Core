import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  EstadoCorreo,
} from './correos.entity';


/* =========================================================
   CREAR
   ========================================================= */

export class CreateCorreoDto {

  @IsOptional()
  @IsString()
  @MaxLength(
    150,
    {
      message:
        'El nombre no puede superar los 150 caracteres.',
    },
  )
  nombre?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(
    150,
    {
      message:
        'El apellido no puede superar los 150 caracteres.',
    },
  )
  apellido?:
    string;


  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'La cuenta de correo debe tener un formato de email válido.',
    },
  )
  @MaxLength(
    250,
    {
      message:
        'La cuenta de correo no puede superar los 250 caracteres.',
    },
  )
  cuentaCorreo?:
    string;


  @IsOptional()
  @IsEnum(
    EstadoCorreo,
    {
      message:
        'El estado debe ser Usado o Reserva.',
    },
  )
  estado?:
    EstadoCorreo;


  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha solicitada debe tener un formato válido.',
    },
  )
  fechaSolicitada?:
    string;


  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'El correo creado debe tener un formato de email válido.',
    },
  )
  @MaxLength(
    250,
    {
      message:
        'El correo creado no puede superar los 250 caracteres.',
    },
  )
  correoCreado?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(
    200,
    {
      message:
        'El solicitante no puede superar los 200 caracteres.',
    },
  )
  solicitante?:
    string;


  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de creación debe tener un formato válido.',
    },
  )
  fechaCreacion?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(
    1000,
    {
      message:
        'La observación no puede superar los 1000 caracteres.',
    },
  )
  observacion?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(
    200,
    {
      message:
        'El usuario anterior no puede superar los 200 caracteres.',
    },
  )
  usuarioAnterior?:
    string;

}


/* =========================================================
   ACTUALIZAR
   ========================================================= */

export class UpdateCorreoDto {

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  apellido?:
    string;


  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'La cuenta de correo debe tener un formato de email válido.',
    },
  )
  @MaxLength(250)
  cuentaCorreo?:
    string;


  @IsOptional()
  @IsEnum(
    EstadoCorreo,
    {
      message:
        'El estado debe ser Usado o Reserva.',
    },
  )
  estado?:
    EstadoCorreo;


  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha solicitada debe tener un formato válido.',
    },
  )
  fechaSolicitada?:
    string;


  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'El correo creado debe tener un formato de email válido.',
    },
  )
  @MaxLength(250)
  correoCreado?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  solicitante?:
    string;


  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de creación debe tener un formato válido.',
    },
  )
  fechaCreacion?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacion?:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuarioAnterior?:
    string;

}


/* =========================================================
   CAMBIO RÁPIDO DE ESTADO
   ========================================================= */

export class CambiarEstadoCorreoDto {

  @IsEnum(
    EstadoCorreo,
    {
      message:
        'El estado debe ser Usado o Reserva.',
    },
  )
  estado!:
    EstadoCorreo;

}