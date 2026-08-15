import {
  Body,
  Controller,
  Delete,
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
  CreateVpnDto,
  UpdateVpnDto,
} from './vpn.dto';

import {
  VpnService,
} from './vpn.service';


@Controller('vpn')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class VpnController {
  constructor(
    private readonly service:
      VpnService,
  ) {}


  /* =====================================================
     CONSULTA
     ADMINISTRADOR + CONSULTOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get()
  listar() {

    return this.service.listar();

  }


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
     SOLO ADMINISTRADOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post()
  crear(
    @Body()
    dto:
      CreateVpnDto,
  ) {

    return this.service.crear(
      dto,
    );

  }


  /* =====================================================
     EDITAR
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
      UpdateVpnDto,
  ) {

    return this.service.actualizar(
      id,
      dto,
    );

  }


  /* =====================================================
     ELIMINAR
     SOLO ADMINISTRADOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete(':id')
  eliminar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,
  ) {

    return this.service.eliminar(
      id,
    );

  }
}