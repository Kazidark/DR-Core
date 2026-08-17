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
  CorreosController,
} from './correos.controller';

import {
  Correo,
} from './correos.entity';

import {
  CorreosService,
} from './correos.service';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      Correo,
    ]),

    AuthModule,

  ],

  controllers: [
    CorreosController,
  ],

  providers: [
    CorreosService,
  ],
})
export class CorreosModule {}