import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

import type {
  JwtUsuario,
} from './auth.types';

import {
  ROLES_KEY,
} from './roles.decorator';

import {
  RolUsuario,
} from '../usuarios/usuarios.entity';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector:
      Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const roles =
      this.reflector
        .getAllAndOverride<
          RolUsuario[]
        >(
          ROLES_KEY,
          [
            context.getHandler(),
            context.getClass(),
          ],
        );

    if (
      !roles ||
      roles.length === 0
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<{
          user?: JwtUsuario;
        }>();

    if (!request.user) {
      return false;
    }

    return roles.includes(
      request.user.rol,
    );
  }
}