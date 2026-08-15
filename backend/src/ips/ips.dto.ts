import {
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  SegmentoIp,
} from './ips.entity';


export class CreateIpDto {
  @IsEnum(
    SegmentoIp,
    {
      message:
        'El segmento debe ser 26, 46, 56 o 100.',
    },
  )
  segmento!: SegmentoIp;


  @IsIP(
    4,
    {
      message:
        'La IP ingresada no es una dirección IPv4 válida.',
    },
  )
  @IsNotEmpty({
    message:
      'La IP es obligatoria.',
  })
  ip!: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  hostName?: string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  oficina?: string;


  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}


export class UpdateIpDto {
  /*
   * IP y Segmento quedan bloqueados
   * durante la edición.
   */


  @IsOptional()
  @IsString()
  @MaxLength(150)
  hostName?: string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string;


  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  oficina?: string;


  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}