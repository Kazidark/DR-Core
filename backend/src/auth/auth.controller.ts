import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AuthService,
} from './auth.service';

import type {
  JwtUsuario,
} from './auth.types';

import {
  ForgotPasswordDto,
} from './forgot-password.dto';

import {
  JwtAuthGuard,
} from './jwt-auth.guard';

import {
  LoginDto,
} from './login.dto';

import {
  ResetPasswordDto,
} from './reset-password.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly service:
      AuthService,
  ) {}


  /* =====================================================
     LOGIN
     ===================================================== */

  @Post('login')
  login(
    @Body()
    dto:
      LoginDto,
  ) {

    return this.service.login(
      dto,
    );

  }


  /* =====================================================
     SOLICITAR RECUPERACIÓN
     ===================================================== */

  @Post(
    'forgot-password',
  )
  forgotPassword(
    @Body()
    dto:
      ForgotPasswordDto,
  ) {

    return this.service
      .forgotPassword(
        dto,
      );

  }


  /* =====================================================
     RESTABLECER CONTRASEÑA
     ===================================================== */

  @Post(
    'reset-password',
  )
  resetPassword(
    @Body()
    dto:
      ResetPasswordDto,
  ) {

    return this.service
      .resetPassword(
        dto,
      );

  }


  /* =====================================================
     SESIÓN ACTUAL
     ===================================================== */

  @UseGuards(
    JwtAuthGuard,
  )
  @Get('me')
  me(
    @Req()
    request: {
      user:
        JwtUsuario;
    },
  ) {

    return request.user;

  }
}