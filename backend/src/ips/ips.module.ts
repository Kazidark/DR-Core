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
  IpsController,
} from './ips.controller';

import {
  IpRegistro,
} from './ips.entity';

import {
  IpsService,
} from './ips.service';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      IpRegistro,
    ]),

    AuthModule,
  ],

  controllers: [
    IpsController,
  ],

  providers: [
    IpsService,
  ],
})
export class IpsModule {}