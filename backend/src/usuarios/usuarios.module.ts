import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  UsuarioCredencial,
  UsuarioSistema,
} from './usuarios.entity';

import {
  UsuariosController,
} from './usuarios.controller';

import {
  UsuariosService,
} from './usuarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioSistema,
      UsuarioCredencial,
    ]),

    AuthModule,
  ],

  controllers: [
    UsuariosController,
  ],

  providers: [
    UsuariosService,
  ],
})
export class UsuariosModule {}