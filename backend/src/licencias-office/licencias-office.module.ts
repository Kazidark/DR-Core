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
  LicenciasOfficeController,
} from './licencias-office.controller';

import {
  LicenciaOffice,
} from './licencias-office.entity';

import {
  LicenciasOfficeService,
} from './licencias-office.service';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      LicenciaOffice,
    ]),

    AuthModule,

  ],

  controllers: [
    LicenciasOfficeController,
  ],

  providers: [
    LicenciasOfficeService,
  ],
})
export class LicenciasOfficeModule {}