import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  Repository,
} from 'typeorm';

import type {
  JwtUsuario,
} from './auth.types';

import {
  UsuarioSistema,
} from '../usuarios/usuarios.entity';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(
    Strategy,
  )
{
  constructor(
    config:
      ConfigService,

    @InjectRepository(
      UsuarioSistema,
    )
    private readonly usuarioRepository:
      Repository<UsuarioSistema>,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        config
          .getOrThrow<string>(
            'JWT_SECRET',
          ),
    });
  }

  async validate(
    payload: JwtUsuario,
  ): Promise<JwtUsuario> {
    const usuario =
      await this.usuarioRepository
        .findOne({
          where: {
            id: payload.sub,
          },
        });

    if (
      !usuario ||
      !usuario.activo
    ) {
      throw new UnauthorizedException(
        'La sesión no es válida.',
      );
    }

    /*
     * Devolvemos los datos actuales
     * de la base de datos.
     *
     * De esta forma un cambio de rol
     * también se aplica inmediatamente.
     */
    return {
      sub:
        usuario.id,

      usuario:
        usuario.usuario,

      nombres:
        usuario.nombres,

      apellidos:
        usuario.apellidos,

      rol:
        usuario.rol,
    };
  }
}