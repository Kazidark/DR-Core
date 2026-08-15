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
  VpnController,
} from './vpn.controller';

import {
  Vpn,
} from './vpn.entity';

import {
  VpnService,
} from './vpn.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vpn,
    ]),

    AuthModule,
  ],

  controllers: [
    VpnController,
  ],

  providers: [
    VpnService,
  ],

  exports: [
    VpnService,
  ],
})
export class VpnModule {}