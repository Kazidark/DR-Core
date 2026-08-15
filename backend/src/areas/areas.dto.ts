import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

export class CreateAreaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateAreaDto extends PartialType(
  CreateAreaDto,
) {}