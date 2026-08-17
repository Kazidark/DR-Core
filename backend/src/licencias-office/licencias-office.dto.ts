import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  EstadoLicenciaOffice,
} from './licencias-office.entity';


export class CreateLicenciaOfficeDto {

  @IsString()
  @IsNotEmpty({
    message:
      'Los nombres completos son obligatorios.',
  })
  @MaxLength(
    200,
    {
      message:
        'Los nombres completos no pueden superar los 200 caracteres.',
    },
  )
  nombresCompletos!:
    string;


  @IsString()
  @IsNotEmpty({
    message:
      'El correo es obligatorio.',
  })
  @IsEmail(
    {},
    {
      message:
        'El correo debe tener un formato de email válido.',
    },
  )
  @MaxLength(
    250,
    {
      message:
        'El correo no puede superar los 250 caracteres.',
    },
  )
  correo!:
    string;


  @IsOptional()
  @IsString()
  @MaxLength(
    150,
    {
      message:
        'El área no puede superar los 150 caracteres.',
    },
  )
  area?:
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


  @IsEnum(
    EstadoLicenciaOffice,
    {
      message:
        'El estado debe ser Activado o Desactivado.',
    },
  )
  estado!:
    EstadoLicenciaOffice;

}


export class UpdateLicenciaOfficeDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message:
      'Los nombres completos no pueden quedar vacíos.',
  })
  @MaxLength(
    200,
    {
      message:
        'Los nombres completos no pueden superar los 200 caracteres.',
    },
  )
  nombresCompletos?:
    string;


  /*
   * El correo no se incluye.
   *
   * Al igual que los campos únicos
   * del Inventario, no permitiremos
   * cambiarlo durante una edición.
   */


  @IsOptional()
  @IsString()
  @MaxLength(
    150,
    {
      message:
        'El área no puede superar los 150 caracteres.',
    },
  )
  area?:
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


  @IsOptional()
  @IsEnum(
    EstadoLicenciaOffice,
    {
      message:
        'El estado debe ser Activado o Desactivado.',
    },
  )
  estado?:
    EstadoLicenciaOffice;

}