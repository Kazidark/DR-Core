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
  CreateCelularDto,
  CreateChipDto,
  CreateModemDto,
  CreateMonitorDto,
  CreatePCLaptopDto,
  CreateTabletDto,
  UpdateCelularDto,
  UpdateChipDto,
  UpdateModemDto,
  UpdateMonitorDto,
  UpdatePCLaptopDto,
  UpdateTabletDto,
} from './inventario.dto';

import {
  InventarioService,
} from './inventario.service';

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  RolUsuario.ADMINISTRADOR,
  RolUsuario.CONSULTOR,
)
@Controller('inventario')
export class InventarioController {
  constructor(
    private readonly service:
      InventarioService,
  ) {}
    /* =======================================================
     DASHBOARD
     ======================================================= */

  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.CONSULTOR,
  )
  @Get('dashboard')
  obtenerDashboard() {
    return this.service.obtenerDashboard();
  }

  /* =====================================================
     PC / LAPTOPS
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('pclaptops')
  crearPC(
    @Body()
    dto: CreatePCLaptopDto,
  ) {
    return this.service.crearPC(
      dto,
    );
  }

  @Get('pclaptops')
  listarPC() {
    return this.service.listarPC();
  }

  @Get('pclaptops/:id')
  obtenerPC(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerPC(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('pclaptops/:id')
  actualizarPC(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdatePCLaptopDto,
  ) {
    return this.service.actualizarPC(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('pclaptops/:id')
  eliminarPC(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarPC(
      id,
    );
  }

  /* =====================================================
     MONITORES
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('monitores')
  crearMonitor(
    @Body()
    dto: CreateMonitorDto,
  ) {
    return this.service.crearMonitor(
      dto,
    );
  }

  @Get('monitores')
  listarMonitores() {
    return this.service.listarMonitores();
  }

  @Get('monitores/:id')
  obtenerMonitor(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerMonitor(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('monitores/:id')
  actualizarMonitor(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateMonitorDto,
  ) {
    return this.service.actualizarMonitor(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('monitores/:id')
  eliminarMonitor(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarMonitor(
      id,
    );
  }

  /* =====================================================
     TABLETS
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('tablets')
  crearTablet(
    @Body()
    dto: CreateTabletDto,
  ) {
    return this.service.crearTablet(
      dto,
    );
  }

  @Get('tablets')
  listarTablets() {
    return this.service.listarTablets();
  }

  @Get('tablets/:id')
  obtenerTablet(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerTablet(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('tablets/:id')
  actualizarTablet(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateTabletDto,
  ) {
    return this.service.actualizarTablet(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('tablets/:id')
  eliminarTablet(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarTablet(
      id,
    );
  }

  /* =====================================================
     MÓDEMS
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('modems')
  crearModem(
    @Body()
    dto: CreateModemDto,
  ) {
    return this.service.crearModem(
      dto,
    );
  }

  @Get('modems')
  listarModems() {
    return this.service.listarModems();
  }

  @Get('modems/:id')
  obtenerModem(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerModem(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('modems/:id')
  actualizarModem(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateModemDto,
  ) {
    return this.service.actualizarModem(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('modems/:id')
  eliminarModem(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarModem(
      id,
    );
  }

  /* =====================================================
     CELULARES
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('celulares')
  crearCelular(
    @Body()
    dto: CreateCelularDto,
  ) {
    return this.service.crearCelular(
      dto,
    );
  }

  @Get('celulares')
  listarCelulares() {
    return this.service.listarCelulares();
  }

  @Get('celulares/:id')
  obtenerCelular(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerCelular(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('celulares/:id')
  actualizarCelular(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateCelularDto,
  ) {
    return this.service.actualizarCelular(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('celulares/:id')
  eliminarCelular(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarCelular(
      id,
    );
  }

  /* =====================================================
     CHIPS
     ===================================================== */

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Post('chips')
  crearChip(
    @Body()
    dto: CreateChipDto,
  ) {
    return this.service.crearChip(
      dto,
    );
  }

  @Get('chips')
  listarChips() {
    return this.service.listarChips();
  }

  @Get('chips/:id')
  obtenerChip(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtenerChip(
      id,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Patch('chips/:id')
  actualizarChip(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateChipDto,
  ) {
    return this.service.actualizarChip(
      id,
      dto,
    );
  }

  @Roles(
    RolUsuario.ADMINISTRADOR,
  )
  @Delete('chips/:id')
  eliminarChip(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.eliminarChip(
      id,
    );
  }
}