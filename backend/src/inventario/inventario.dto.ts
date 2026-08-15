import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

import {
  EstadoChip,
  EstadoEquipo,
  TipoPC,
  UsoChip,
} from './inventario.enums';


class EquipoComunDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  modelo?: string;

  @IsOptional()
  @IsEnum(EstadoEquipo)
  estadoEquipo?: EstadoEquipo;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ticket?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  correo?: string;
}


export class CreatePCLaptopDto extends EquipoComunDto {
  @IsEnum(TipoPC)
  tipo!: TipoPC;

  @IsString()
  @Matches(/^[a-zA-Z0-9._\-]+$/)
  @MaxLength(100)
  serial!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caracteristicas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  anexo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ultimoUsuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  oficina?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  posicion?: string;
}


export class UpdatePCLaptopDto extends PartialType(
  CreatePCLaptopDto,
) {}


export class CreateMonitorDto extends EquipoComunDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9._\-]+$/)
  @MaxLength(100)
  serial!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caracteristicas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  anexo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ultimoUsuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  oficina?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  posicion?: string;
}


export class UpdateMonitorDto extends PartialType(
  CreateMonitorDto,
) {}


export class CreateTabletDto extends EquipoComunDto {
  @IsString()
  @Matches(/^\d{15}$/)
  imei!: string;

  @IsString()
  @MaxLength(100)
  serie!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caracteristicas?: string;

  @IsString()
  @MaxLength(100)
  idTablet!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  kiosko?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tabletReposicion?: string;
}


export class UpdateTabletDto extends PartialType(
  CreateTabletDto,
) {}


export class CreateModemDto extends EquipoComunDto {
  @IsString()
  @Matches(/^\d+$/)
  @MaxLength(20)
  imei!: string;

  @IsString()
  @MaxLength(100)
  serie!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreRed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contrasenaRed?: string;
}


export class UpdateModemDto extends PartialType(
  CreateModemDto,
) {}


export class CreateCelularDto extends EquipoComunDto {
  @IsString()
  @Matches(/^\d+$/)
  @MaxLength(20)
  imei!: string;

  @IsString()
  @MaxLength(100)
  serie!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caracteristicas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacion?: string;
}


export class UpdateCelularDto extends PartialType(
  CreateCelularDto,
) {}


export class CreateChipDto {
  @IsString()
  @Matches(/^\d{9}$/)
  numero!: string;

  @IsString()
  @Matches(/^\d+$/)
  @MaxLength(22)
  iccid!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  operador?: string;

  @IsEnum(UsoChip)
  uso!: UsoChip;

  @IsEnum(EstadoChip)
  estado!: EstadoChip;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ticket?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}


export class UpdateChipDto extends PartialType(
  CreateChipDto,
) {}