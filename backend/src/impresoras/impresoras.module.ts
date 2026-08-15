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
  ImpresorasController,
} from './impresoras.controller';

import {
  Impresora,
} from './impresoras.entity';

import {
  ImpresorasService,
} from './impresoras.service';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      Impresora,
    ]),

    AuthModule,
  ],

  controllers: [
    ImpresorasController,
  ],

  providers: [
    ImpresorasService,
  ],
})
export class ImpresorasModule {}