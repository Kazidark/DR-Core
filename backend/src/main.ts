import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
   * Todas las rutas del backend comenzarán con /api
   *
   * Ejemplo:
   * http://localhost:8520/api/inventario/pclaptops
   */
  app.setGlobalPrefix('api');

  /*
   * Permitimos que el frontend de DR+ Core
   * pueda consumir el backend.
   */
  app.enableCors({
    origin:
      process.env.FRONTEND_URL ??
      'http://localhost:8521',

    credentials: true,
  });

  /*
   * Validación global de los DTO.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /*
   * Puerto del backend.
   *
   * Si PORT existe en .env, se utiliza.
   * Si no existe, se utiliza 8520.
   */
  const port = Number(
    process.env.PORT ?? 8520,
  );

  await app.listen(port);

  console.log('');
  console.log('====================================');
  console.log(' DR+ CORE - BACKEND INICIADO');
  console.log('====================================');
  console.log(
    ` API: http://localhost:${port}/api`,
  );
  console.log(
    ` Inventario: http://localhost:${port}/api/inventario`,
  );
  console.log('====================================');
  console.log('');
}

void bootstrap();