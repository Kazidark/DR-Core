import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  EstadoForti,
  EstadoVPN,
  TipoVPN,
} from './vpn.entity';


export class CreateVpnDto {
  @IsString()
  @IsNotEmpty({
    message:
      'Los nombres completos son obligatorios.',
  })
  @MaxLength(200)
  nombresCompletos!: string;


  @IsString()
  @IsNotEmpty({
    message:
      'El usuario es obligatorio.',
  })
  @MaxLength(150)
  usuario!: string;


  @IsEmail(
    {},
    {
      message:
        'El correo ingresado no es válido.',
    },
  )
  @IsNotEmpty({
    message:
      'El correo es obligatorio.',
  })
  @MaxLength(200)
  correo!: string;


  @IsString()
  @IsNotEmpty({
    message:
      'El área es obligatoria.',
  })
  @MaxLength(150)
  area!: string;


  @IsString()
  @IsNotEmpty({
    message:
      'El Jefe - Autorizador es obligatorio.',
  })
  @MaxLength(200)
  jefeAutorizador!: string;


  @IsEnum(
    TipoVPN,
    {
      message:
        'Tipo VPN debe ser Forti o WEB.',
    },
  )
  tipoVpn!: TipoVPN;


  @IsEnum(
    EstadoVPN,
    {
      message:
        'Estado debe ser Asignado o Reserva.',
    },
  )
  estado!: EstadoVPN;


  @IsEnum(
    EstadoForti,
    {
      message:
        'Forti debe ser Activo o Desactivado.',
    },
  )
  forti!: EstadoForti;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  lastUser?: string;
}


export class UpdateVpnDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombresCompletos?: string;


  /*
   * Permitimos cambiar el usuario,
   * pero continuará teniendo validación
   * de unicidad.
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  usuario?: string;


  @IsOptional()
  @IsEmail(
    {},
    {
      message:
        'El correo ingresado no es válido.',
    },
  )
  @MaxLength(200)
  correo?: string;


  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  area?: string;


  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  jefeAutorizador?: string;


  @IsOptional()
  @IsEnum(
    TipoVPN,
    {
      message:
        'Tipo VPN debe ser Forti o WEB.',
    },
  )
  tipoVpn?: TipoVPN;


  @IsOptional()
  @IsEnum(
    EstadoVPN,
    {
      message:
        'Estado debe ser Asignado o Reserva.',
    },
  )
  estado?: EstadoVPN;


  @IsOptional()
  @IsEnum(
    EstadoForti,
    {
      message:
        'Forti debe ser Activo o Desactivado.',
    },
  )
  forti?: EstadoForti;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  lastUser?: string;
}