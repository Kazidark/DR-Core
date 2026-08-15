import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  Repository,
} from 'typeorm';

import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './usuarios.dto';

import {
  UsuarioCredencial,
  UsuarioSistema,
} from './usuarios.entity';

import {
  generarPasswordHash,
} from './password.util';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioSistema)
    private readonly usuarioRepository:
      Repository<UsuarioSistema>,

    @InjectRepository(UsuarioCredencial)
    private readonly credencialRepository:
      Repository<UsuarioCredencial>,

    private readonly dataSource: DataSource,
  ) {}

  async crear(dto: CreateUsuarioDto) {
    const existente =
      await this.usuarioRepository.findOne({
        where: [
          {
            usuario: dto.usuario,
          },
          {
            correo: dto.correo,
          },
        ],
      });

    if (existente) {
      throw new ConflictException(
        'El usuario o correo ya se encuentra registrado.',
      );
    }

    const password =
      await generarPasswordHash(dto.password);

    return this.dataSource.transaction(
      async (manager) => {
        const usuarios =
          manager.getRepository(UsuarioSistema);

        const credenciales =
          manager.getRepository(UsuarioCredencial);

        const nuevoUsuario =
          usuarios.create({
            nombres: dto.nombres.trim(),
            apellidos: dto.apellidos.trim(),
            usuario: dto.usuario.trim(),
            correo: dto.correo.trim(),
            rol: dto.rol,
            activo: true,
          });

        const usuarioGuardado =
          await usuarios.save(nuevoUsuario);

        const credencial =
          credenciales.create({
            usuario: usuarioGuardado,
            passwordHash:
              password.passwordHash,
            salt: password.salt,
            actualizadoEn: new Date(),
          });

        await credenciales.save(credencial);

        return usuarioGuardado;
      },
    );
  }

  listar() {
    return this.usuarioRepository.find({
      order: {
        nombres: 'ASC',
      },
    });
  }

  async obtener(id: number) {
    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado.`,
      );
    }

    return usuario;
  }

  async actualizar(
    id: number,
    dto: UpdateUsuarioDto,
  ) {
    const usuario = await this.obtener(id);

    const {
      password,
      ...datosUsuario
    } = dto;

    Object.assign(
      usuario,
      datosUsuario,
    );

    await this.usuarioRepository.save(
      usuario,
    );

    if (password) {
      const passwordSeguro =
        await generarPasswordHash(password);

      let credencial =
        await this.credencialRepository.findOne({
          where: {
            usuario: {
              id,
            },
          },
          relations: {
            usuario: true,
          },
        });

      if (!credencial) {
        credencial =
          this.credencialRepository.create({
            usuario,
            passwordHash:
              passwordSeguro.passwordHash,
            salt: passwordSeguro.salt,
            actualizadoEn: new Date(),
          });
      } else {
        credencial.passwordHash =
          passwordSeguro.passwordHash;

        credencial.salt =
          passwordSeguro.salt;

        credencial.actualizadoEn =
          new Date();
      }

      await this.credencialRepository.save(
        credencial,
      );
    }

    return usuario;
  }

  async eliminar(id: number) {
    const usuario = await this.obtener(id);

    await this.usuarioRepository.remove(
      usuario,
    );

    return {
      message:
        'Usuario eliminado correctamente.',
    };
  }
}