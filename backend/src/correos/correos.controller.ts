import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  CambiarEstadoCorreoDto,
  CreateCorreoDto,
  UpdateCorreoDto,
} from './correos.dto';

import {
  CorreosService,
} from './correos.service';


@Controller('correos')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  RolUsuario.ADMINISTRADOR,
)
export class CorreosController {

  constructor(
    private readonly service:
      CorreosService,
  ) {}


  /* =====================================================
     RESUMEN DASHBOARD

     ADMINISTRADOR + CONSULTOR

     IMPORTANTE:
     Esta ruta debe declararse antes de @Get(':id')
     para evitar que "resumen" pueda interpretarse
     como un parámetro dinámico.
     ===================================================== */

  @Get('resumen')
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  resumen() {

    return this.service
      .resumen();

  }


  /* =====================================================
     LISTAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get()
  listar() {

    return this.service
      .listar();

  }


  /* =====================================================
     OBTENER POR ID

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get(':id')
  obtener(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,
  ) {

    return this.service
      .obtener(
        id,
      );

  }


  /* =====================================================
     CREAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Post()
  crear(
    @Body()
    dto:
      CreateCorreoDto,
  ) {

    return this.service
      .crear(
        dto,
      );

  }


  /* =====================================================
     CAMBIAR ESTADO

     SOLO ADMINISTRADOR

     Usado ↔ Reserva
     ===================================================== */

  @Patch(':id/estado')
  cambiarEstado(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      CambiarEstadoCorreoDto,
  ) {

    return this.service
      .cambiarEstado(
        id,
        dto,
      );

  }


  /* =====================================================
     ACTUALIZAR

     SOLO ADMINISTRADOR
     ===================================================== */

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
      UpdateCorreoDto,
  ) {

    return this.service
      .actualizar(
        id,
        dto,
      );

  }

}