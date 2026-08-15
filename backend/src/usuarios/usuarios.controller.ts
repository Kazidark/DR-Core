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
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './usuarios.dto';

import {
  RolUsuario,
} from './usuarios.entity';

import {
  UsuariosService,
} from './usuarios.service';

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  RolUsuario.ADMINISTRADOR,
)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly service:
      UsuariosService,
  ) {}

  @Post()
  crear(
    @Body()
    dto: CreateUsuarioDto,
  ) {
    return this.service.crear(
      dto,
    );
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  obtener(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.obtener(
      id,
    );
  }

  @Patch(':id')
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateUsuarioDto,
  ) {
    return this.service.actualizar(
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
    return this.service.eliminar(
      id,
    );
  }
}