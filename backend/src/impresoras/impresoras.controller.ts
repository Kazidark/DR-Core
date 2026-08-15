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
  CreateImpresoraDto,
  UpdateImpresoraDto,
} from './impresoras.dto';

import {
  ImpresorasService,
} from './impresoras.service';


@Controller('impresoras')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ImpresorasController {
  constructor(
    private readonly service:
      ImpresorasService,
  ) {}


  /* =====================================================
     LISTAR
     ADMINISTRADOR + CONSULTOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get()
  listar() {

    return this.service
      .listar();

  }


  /* =====================================================
     OBTENER
     ADMINISTRADOR + CONSULTOR
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

    return this.service
      .obtener(
        id,
      );

  }


  /* =====================================================
     CREAR
     SOLO ADMINISTRADOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post()
  crear(
    @Body()
    dto:
      CreateImpresoraDto,
  ) {

    return this.service
      .crear(
        dto,
      );

  }


  /* =====================================================
     ACTUALIZAR
     SOLO ADMINISTRADOR
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
      UpdateImpresoraDto,
  ) {

    return this.service
      .actualizar(
        id,
        dto,
      );

  }
}