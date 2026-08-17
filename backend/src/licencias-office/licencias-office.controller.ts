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
  CreateLicenciaOfficeDto,
  UpdateLicenciaOfficeDto,
} from './licencias-office.dto';

import {
  TipoLicenciaOffice,
} from './licencias-office.entity';

import {
  LicenciasOfficeService,
} from './licencias-office.service';


@Controller('licencias-office')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  RolUsuario.ADMINISTRADOR,
)
export class LicenciasOfficeController {

  constructor(
    private readonly service:
      LicenciasOfficeService,
  ) {}


  /* =====================================================
     RESUMEN DASHBOARD

     ADMINISTRADOR + CONSULTOR

     IMPORTANTE:
     Este endpoint devuelve únicamente
     información agregada.

     No expone:
     - nombres
     - correos
     - áreas
     - usuarios anteriores
     - registros individuales
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
     OFFICE BÁSICO
     LISTAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('basico')
  listarBasico() {

    return this.service
      .listar(
        TipoLicenciaOffice
          .OFFICE_BASICO,
      );

  }


  /* =====================================================
     OFFICE BÁSICO
     OBTENER

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('basico/:id')
  obtenerBasico(
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
        TipoLicenciaOffice
          .OFFICE_BASICO,
      );

  }


  /* =====================================================
     OFFICE BÁSICO
     CREAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Post('basico')
  crearBasico(
    @Body()
    dto:
      CreateLicenciaOfficeDto,
  ) {

    return this.service
      .crear(
        TipoLicenciaOffice
          .OFFICE_BASICO,
        dto,
      );

  }


  /* =====================================================
     OFFICE BÁSICO
     ACTUALIZAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Patch('basico/:id')
  actualizarBasico(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      UpdateLicenciaOfficeDto,
  ) {

    return this.service
      .actualizar(
        id,
        TipoLicenciaOffice
          .OFFICE_BASICO,
        dto,
      );

  }


  /* =====================================================
     OFFICE EMPRESARIAL
     LISTAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('empresarial')
  listarEmpresarial() {

    return this.service
      .listar(
        TipoLicenciaOffice
          .OFFICE_EMPRESARIAL,
      );

  }


  /* =====================================================
     OFFICE EMPRESARIAL
     OBTENER

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('empresarial/:id')
  obtenerEmpresarial(
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
        TipoLicenciaOffice
          .OFFICE_EMPRESARIAL,
      );

  }


  /* =====================================================
     OFFICE EMPRESARIAL
     CREAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Post('empresarial')
  crearEmpresarial(
    @Body()
    dto:
      CreateLicenciaOfficeDto,
  ) {

    return this.service
      .crear(
        TipoLicenciaOffice
          .OFFICE_EMPRESARIAL,
        dto,
      );

  }


  /* =====================================================
     OFFICE EMPRESARIAL
     ACTUALIZAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Patch('empresarial/:id')
  actualizarEmpresarial(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      UpdateLicenciaOfficeDto,
  ) {

    return this.service
      .actualizar(
        id,
        TipoLicenciaOffice
          .OFFICE_EMPRESARIAL,
        dto,
      );

  }


  /* =====================================================
     POWER BI
     LISTAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('powerbi')
  listarPowerBi() {

    return this.service
      .listar(
        TipoLicenciaOffice
          .POWER_BI,
      );

  }


  /* =====================================================
     POWER BI
     OBTENER

     SOLO ADMINISTRADOR
     ===================================================== */

  @Get('powerbi/:id')
  obtenerPowerBi(
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
        TipoLicenciaOffice
          .POWER_BI,
      );

  }


  /* =====================================================
     POWER BI
     CREAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Post('powerbi')
  crearPowerBi(
    @Body()
    dto:
      CreateLicenciaOfficeDto,
  ) {

    return this.service
      .crear(
        TipoLicenciaOffice
          .POWER_BI,
        dto,
      );

  }


  /* =====================================================
     POWER BI
     ACTUALIZAR

     SOLO ADMINISTRADOR
     ===================================================== */

  @Patch('powerbi/:id')
  actualizarPowerBi(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      UpdateLicenciaOfficeDto,
  ) {

    return this.service
      .actualizar(
        id,
        TipoLicenciaOffice
          .POWER_BI,
        dto,
      );

  }

}