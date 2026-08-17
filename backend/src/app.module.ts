import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  AreasModule,
} from './areas/areas.module';

import {
  AuthModule,
} from './auth/auth.module';

import {
  CorreosModule,
} from './correos/correos.module';

import {
  ImpresorasModule,
} from './impresoras/impresoras.module';

import {
  InventarioModule,
} from './inventario/inventario.module';

import {
  IpsModule,
} from './ips/ips.module';

import {
  LicenciasOfficeModule,
} from './licencias-office/licencias-office.module';

import {
  UsuariosModule,
} from './usuarios/usuarios.module';

import {
  VpnModule,
} from './vpn/vpn.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal:
        true,
    }),


    TypeOrmModule.forRootAsync({
      inject: [
        ConfigService,
      ],

      useFactory: (
        config:
          ConfigService,
      ) => ({
        type:
          'mssql' as const,

        host:
          config.get<string>(
            'DB_SERVER',
          ),

        port:
          Number(
            config.get<string>(
              'DB_PORT',
              '1433',
            ),
          ),

        username:
          config.get<string>(
            'DB_USER',
          ),

        password:
          config.get<string>(
            'DB_PASSWORD',
          ),

        database:
          config.get<string>(
            'DB_DATABASE',
            'DRCore',
          ),

        autoLoadEntities:
          true,

        synchronize:
          false,

        options: {
          encrypt:
            config.get<string>(
              'DB_ENCRYPT',
              'false',
            ) ===
            'true',

          trustServerCertificate:
            true,
        },
      }),
    }),


    AuthModule,

    InventarioModule,

    UsuariosModule,

    VpnModule,

    AreasModule,

    ImpresorasModule,

    IpsModule,

    LicenciasOfficeModule,

    CorreosModule,

  ],
})
export class AppModule {}