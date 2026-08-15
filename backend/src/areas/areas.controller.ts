import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  CreateAreaDto,
  UpdateAreaDto,
} from './areas.dto';

import { AreasService } from './areas.service';

@Controller('areas')
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
  ) {}

  @Post()
  crear(
    @Body()
    dto: CreateAreaDto,
  ) {
    return this.areasService.crear(dto);
  }

  @Get()
  listar() {
    return this.areasService.listar();
  }

  @Get('activas')
  listarActivas() {
    return this.areasService.listarActivas();
  }

  @Get(':id')
  obtener(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.areasService.obtener(id);
  }

  @Patch(':id')
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateAreaDto,
  ) {
    return this.areasService.actualizar(
      id,
      dto,
    );
  }

  @Delete(':id')
  eliminar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.areasService.eliminar(
      id,
    );
  }
}