import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  Roles,
} from '../auth/roles.decorator';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  RolUsuario,
} from '../usuarios/usuarios.entity';

import {
  CreateIpDto,
  UpdateIpDto,
} from './ips.dto';

import {
  SegmentoIp,
} from './ips.entity';

import {
  IpsService,
} from './ips.service';


@Controller('ips')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class IpsController {
  constructor(
    private readonly service:
      IpsService,
  ) {}


  /* =====================================================
     RESUMEN
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get('resumen')
  resumen() {

    return this.service.resumen();

  }


  /* =====================================================
     LISTAR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get()
  listar(
    @Query(
      'segmento',
    )
    segmento?:
      SegmentoIp,
  ) {

    if (
      segmento
    ) {

      return this.service.listarPorSegmento(
        segmento,
      );

    }


    return this.service.listar();

  }


  /* =====================================================
     OBTENER
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get(':id')
  obtener(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,
  ) {

    return this.service.obtener(
      id,
    );

  }


  /* =====================================================
     CREAR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post()
  crear(
    @Body()
    dto:
      CreateIpDto,
  ) {

    return this.service.crear(
      dto,
    );

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch(':id')
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      UpdateIpDto,
  ) {

    return this.service.actualizar(
      id,
      dto,
    );

  }
}