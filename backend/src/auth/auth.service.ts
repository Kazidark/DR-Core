import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import {
  MoreThan,
  Repository,
} from 'typeorm';

import {
  MailService,
} from '../mail/mail.service';

import {
  UsuarioCredencial,
  UsuarioSistema,
} from '../usuarios/usuarios.entity';

import {
  generarPasswordHash,
  validarPassword,
} from '../usuarios/password.util';

import type {
  JwtUsuario,
} from './auth.types';

import {
  ForgotPasswordDto,
} from './forgot-password.dto';

import {
  LoginDto,
} from './login.dto';

import {
  PasswordResetToken,
} from './password-reset-token.entity';

import {
  ResetPasswordDto,
} from './reset-password.dto';


@Injectable()
export class AuthService {
  constructor(

    @InjectRepository(
      UsuarioSistema,
    )
    private readonly usuarioRepository:
      Repository<UsuarioSistema>,


    @InjectRepository(
      UsuarioCredencial,
    )
    private readonly credencialRepository:
      Repository<UsuarioCredencial>,


    @InjectRepository(
      PasswordResetToken,
    )
    private readonly resetTokenRepository:
      Repository<PasswordResetToken>,


    private readonly jwtService:
      JwtService,


    private readonly configService:
      ConfigService,


    private readonly mailService:
      MailService,

  ) {}


  /* =====================================================
     LOGIN
     ===================================================== */

  async login(
    dto:
      LoginDto,
  ) {

    const nombreUsuario =
      dto.usuario
        .trim();


    const usuario =
      await this.usuarioRepository
        .findOne({
          where: {
            usuario:
              nombreUsuario,
          },
        });


    if (
      !usuario ||
      !usuario.activo
    ) {

      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos.',
      );

    }


    const credencial =
      await this.credencialRepository
        .findOne({
          where: {
            usuario: {
              id:
                usuario.id,
            },
          },

          relations: {
            usuario:
              true,
          },
        });


    if (
      !credencial
    ) {

      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos.',
      );

    }


    const passwordValido =
      await validarPassword(
        dto.password,
        credencial.passwordHash,
        credencial.salt,
      );


    if (
      !passwordValido
    ) {

      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos.',
      );

    }


    const payload:
      JwtUsuario = {

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


    const accessToken =
      await this.jwtService
        .signAsync(
          payload,
        );


    return {

      accessToken,


      usuario: {

        id:
          usuario.id,

        nombres:
          usuario.nombres,

        apellidos:
          usuario.apellidos,

        usuario:
          usuario.usuario,

        correo:
          usuario.correo,

        rol:
          usuario.rol,
      },
    };

  }


  /* =====================================================
     SOLICITAR RECUPERACIÓN DE CONTRASEÑA
     ===================================================== */

  async forgotPassword(
    dto:
      ForgotPasswordDto,
  ) {

    const respuestaGenerica = {
      message:
        'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
    };


    const correo =
      dto.correo
        .trim()
        .toLocaleLowerCase(
          'es',
        );


    /*
     * Buscamos el correo sin revelar al frontend
     * si realmente existe o no.
     */
    const usuario =
      await this.usuarioRepository
        .createQueryBuilder(
          'usuario',
        )
        .where(
          'LOWER(usuario.Correo) = LOWER(:correo)',
          {
            correo,
          },
        )
        .getOne();


    /*
     * Respuesta idéntica si la cuenta no existe
     * o está inactiva.
     */
    if (
      !usuario ||
      !usuario.activo
    ) {

      return respuestaGenerica;

    }


    /*
     * Invalidamos cualquier token pendiente
     * emitido previamente para este usuario.
     */
    await this.resetTokenRepository
      .createQueryBuilder()
      .update(
        PasswordResetToken,
      )
      .set({
        utilizado:
          true,

        utilizadoEn:
          new Date(),
      })
      .where(
        'UsuarioId = :usuarioId',
        {
          usuarioId:
            usuario.id,
        },
      )
      .andWhere(
        'Utilizado = :utilizado',
        {
          utilizado:
            false,
        },
      )
      .execute();


    /*
     * Token aleatorio de 32 bytes.
     *
     * El token real solo se envía por correo.
     * En SQL almacenamos SHA-256(token).
     */
    const token =
      randomBytes(
        32,
      )
        .toString(
          'hex',
        );


    const tokenHash =
      this.hashToken(
        token,
      );


    const ahora =
      new Date();


    const expiraEn =
      new Date(
        ahora.getTime() +
        15 * 60 * 1000,
      );


    const resetToken =
      this.resetTokenRepository
        .create({
          usuario,

          tokenHash,

          expiraEn,

          utilizado:
            false,

          creadoEn:
            ahora,

          utilizadoEn:
            null,
        });


    await this.resetTokenRepository
      .save(
        resetToken,
      );


    const frontendUrl =
      this.configService
        .getOrThrow<string>(
          'FRONTEND_URL',
        )
        .replace(
          /\/+$/,
          '',
        );


    const resetUrl =
      `${frontendUrl}/restablecer-password` +
      `?token=${encodeURIComponent(
        token,
      )}`;


    try {

      await this.mailService
        .enviarRecuperacionPassword(
          usuario.correo,

          this.obtenerPrimerNombre(
            usuario.nombres,
          ),

          resetUrl,
        );

    } catch (
      error
    ) {

      /*
       * Si el SMTP falla, eliminamos el token
       * recién generado para no dejar solicitudes
       * inválidas en la base.
       */
      await this.resetTokenRepository
        .delete(
          resetToken.id,
        );


      throw error;

    }


    return respuestaGenerica;

  }


  /* =====================================================
     RESTABLECER CONTRASEÑA
     ===================================================== */

  async resetPassword(
    dto:
      ResetPasswordDto,
  ) {

    if (
      dto.password !==
      dto.confirmPassword
    ) {

      throw new BadRequestException(
        'Las contraseñas no coinciden.',
      );

    }


    const token =
      dto.token
        .trim();


    if (
      !token
    ) {

      throw new BadRequestException(
        'El enlace de recuperación no es válido.',
      );

    }


    const tokenHash =
      this.hashToken(
        token,
      );


    const ahora =
      new Date();


    /*
     * Solo aceptamos tokens:
     *
     * - existentes;
     * - no utilizados;
     * - no vencidos.
     */
    const resetToken =
      await this.resetTokenRepository
        .findOne({
          where: {
            tokenHash,

            utilizado:
              false,

            expiraEn:
              MoreThan(
                ahora,
              ),
          },

          relations: {
            usuario:
              true,
          },
        });


    if (
      !resetToken ||
      !resetToken.usuario ||
      !resetToken.usuario.activo
    ) {

      throw new BadRequestException(
        'El enlace de recuperación no es válido o ha expirado.',
      );

    }


    const credencial =
      await this.credencialRepository
        .findOne({
          where: {
            usuario: {
              id:
                resetToken
                  .usuario
                  .id,
            },
          },

          relations: {
            usuario:
              true,
          },
        });


    if (
      !credencial
    ) {

      throw new BadRequestException(
        'No se pudieron actualizar las credenciales.',
      );

    }


    const {
      passwordHash,
      salt,
    } =
      await generarPasswordHash(
        dto.password,
      );


    /*
     * Actualizamos exactamente la misma
     * estructura utilizada actualmente por
     * UsuarioCredenciales.
     */
    credencial.passwordHash =
      passwordHash;

    credencial.salt =
      salt;

    credencial.actualizadoEn =
      ahora;


    await this.credencialRepository
      .save(
        credencial,
      );


    /*
     * Marcamos como usados todos los tokens
     * pendientes de esta cuenta.
     */
    await this.resetTokenRepository
      .createQueryBuilder()
      .update(
        PasswordResetToken,
      )
      .set({
        utilizado:
          true,

        utilizadoEn:
          ahora,
      })
      .where(
        'UsuarioId = :usuarioId',
        {
          usuarioId:
            resetToken
              .usuario
              .id,
        },
      )
      .andWhere(
        'Utilizado = :utilizado',
        {
          utilizado:
            false,
        },
      )
      .execute();


    return {
      message:
        'Contraseña restablecida correctamente.',
    };

  }


  /* =====================================================
     HASH DEL TOKEN
     ===================================================== */

  private hashToken(
    token:
      string,
  ) {

    return createHash(
      'sha256',
    )
      .update(
        token,
      )
      .digest(
        'hex',
      );

  }


  /* =====================================================
     PRIMER NOMBRE
     ===================================================== */

  private obtenerPrimerNombre(
    nombres:
      string,
  ) {

    return (
      nombres
        .trim()
        .split(
          /\s+/,
        )[0] ||
      'Usuario'
    );

  }
}