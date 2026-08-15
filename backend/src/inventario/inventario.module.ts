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
  InventarioController,
} from './inventario.controller';

import {
  InventarioService,
} from './inventario.service';

import {
  Celular,
  Chip,
  Modem,
  Monitor,
  PCLaptop,
  Tablet,
} from './inventario.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PCLaptop,
      Monitor,
      Tablet,
      Modem,
      Celular,
      Chip,
    ]),

    AuthModule,
  ],

  controllers: [
    InventarioController,
  ],

  providers: [
    InventarioService,
  ],

  exports: [
    InventarioService,
  ],
})
export class InventarioModule {}