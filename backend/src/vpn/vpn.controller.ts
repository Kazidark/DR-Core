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
     RESUMEN DASHBOARD
     ADMINISTRADOR + CONSULTOR

     Devuelve únicamente indicadores agregados.
     No expone registros individuales VPN.
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get('resumen')
  async resumen() {

    const registros =
      await this.service.listar();


    return {

      total:
        registros.length,


      asignados:
        registros.filter(
          (
            item,
          ) =>
            item.estado ===
            'Asignado',
        ).length,


      reserva:
        registros.filter(
          (
            item,
          ) =>
            item.estado ===
            'Reserva',
        ).length,


      fortiActivos:
        registros.filter(
          (
            item,
          ) =>
            item.forti ===
            'Activo',
        ).length,


      fortiDesactivados:
        registros.filter(
          (
            item,
          ) =>
            item.forti ===
            'Desactivado',
        ).length,


      tipoForti:
        registros.filter(
          (
            item,
          ) =>
            item.tipoVpn ===
            'Forti',
        ).length,


      tipoWeb:
        registros.filter(
          (
            item,
          ) =>
            item.tipoVpn ===
            'WEB',
        ).length,

    };

  }


  /* =====================================================
     LISTAR VPN
     SOLO ADMINISTRADOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Get()
  listar() {

    return this.service.listar();

  }


  /* =====================================================
     OBTENER VPN
     SOLO ADMINISTRADOR
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
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