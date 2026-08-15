import {
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


export class CreateImpresoraDto {
  @IsString()
  @IsNotEmpty({
    message:
      'La IP completa es obligatoria.',
  })
  @IsIP(
    4,
    {
      message:
        'La IP completa debe ser una dirección IPv4 válida.',
    },
  )
  ipCompleta!: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;


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
  @MaxLength(500)
  observacion?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  areaAnterior?: string;
}


export class UpdateImpresoraDto {
  /*
   * No permitimos modificar IpCompleta
   * porque es el identificador único
   * del registro.
   */


  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;


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
  @MaxLength(500)
  observacion?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  areaAnterior?: string;
}