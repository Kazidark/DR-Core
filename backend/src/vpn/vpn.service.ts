import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  CreateVpnDto,
  UpdateVpnDto,
} from './vpn.dto';

import {
  Vpn,
} from './vpn.entity';


@Injectable()
export class VpnService {
  constructor(
    @InjectRepository(
      Vpn,
    )
    private readonly vpnRepository:
      Repository<Vpn>,
  ) {}


  /* =====================================================
     CREAR
     ===================================================== */

  async crear(
    dto:
      CreateVpnDto,
  ): Promise<Vpn> {

    const usuario =
      dto.usuario.trim();


    await this.validarUsuarioUnico(
      usuario,
    );


    const vpn =
      this.vpnRepository.create({
        nombresCompletos:
          dto.nombresCompletos.trim(),

        usuario,

        correo:
          dto.correo
            .trim()
            .toLowerCase(),

        area:
          dto.area.trim(),

        jefeAutorizador:
          dto.jefeAutorizador.trim(),

        tipoVpn:
          dto.tipoVpn,

        estado:
          dto.estado,

        forti:
          dto.forti,

        lastUser:
          this.normalizarOpcional(
            dto.lastUser,
          ),
      });


    return this.vpnRepository.save(
      vpn,
    );

  }


  /* =====================================================
     LISTAR
     ===================================================== */

  listar(): Promise<Vpn[]> {

    return this.vpnRepository
      .createQueryBuilder(
        'vpn',
      )
      .orderBy(
        'vpn.NombresCompletos',
        'ASC',
      )
      .getMany();

  }


  /* =====================================================
     OBTENER POR ID
     ===================================================== */

  async obtener(
    id:
      number,
  ): Promise<Vpn> {

    const vpn =
      await this.vpnRepository.findOne({
        where: {
          id,
        },
      });


    if (
      !vpn
    ) {

      throw new NotFoundException(
        `Registro VPN con ID ${id} no encontrado.`,
      );

    }


    return vpn;

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  async actualizar(
    id:
      number,

    dto:
      UpdateVpnDto,
  ): Promise<Vpn> {

    const vpn =
      await this.obtener(
        id,
      );


    if (
      dto.usuario !==
      undefined
    ) {

      const usuario =
        dto.usuario.trim();


      await this.validarUsuarioUnico(
        usuario,
        id,
      );


      vpn.usuario =
        usuario;

    }


    if (
      dto.nombresCompletos !==
      undefined
    ) {

      vpn.nombresCompletos =
        dto.nombresCompletos.trim();

    }


    if (
      dto.correo !==
      undefined
    ) {

      vpn.correo =
        dto.correo
          .trim()
          .toLowerCase();

    }


    if (
      dto.area !==
      undefined
    ) {

      vpn.area =
        dto.area.trim();

    }


    if (
      dto.jefeAutorizador !==
      undefined
    ) {

      vpn.jefeAutorizador =
        dto.jefeAutorizador.trim();

    }


    if (
      dto.tipoVpn !==
      undefined
    ) {

      vpn.tipoVpn =
        dto.tipoVpn;

    }


    if (
      dto.estado !==
      undefined
    ) {

      vpn.estado =
        dto.estado;

    }


    if (
      dto.forti !==
      undefined
    ) {

      vpn.forti =
        dto.forti;

    }


    if (
      dto.lastUser !==
      undefined
    ) {

      vpn.lastUser =
        this.normalizarOpcional(
          dto.lastUser,
        );

    }


    return this.vpnRepository.save(
      vpn,
    );

  }


  /* =====================================================
     ELIMINAR
     ===================================================== */

  async eliminar(
    id:
      number,
  ) {

    const vpn =
      await this.obtener(
        id,
      );


    await this.vpnRepository.remove(
      vpn,
    );


    return {
      message:
        'Registro VPN eliminado correctamente.',
    };

  }


  /* =====================================================
     VALIDAR USUARIO ÚNICO
     ===================================================== */

  private async validarUsuarioUnico(
    usuario:
      string,

    excluirId?:
      number,
  ) {

    const query =
      this.vpnRepository
        .createQueryBuilder(
          'vpn',
        )
        .where(
          'LOWER(vpn.Usuario) = LOWER(:usuario)',
          {
            usuario,
          },
        );


    if (
      excluirId !==
      undefined
    ) {

      query.andWhere(
        'vpn.Id <> :excluirId',
        {
          excluirId,
        },
      );

    }


    const existente =
      await query.getOne();


    if (
      existente
    ) {

      throw new ConflictException(
        `El usuario "${usuario}" ya se encuentra registrado en VPN.`,
      );

    }

  }


  /* =====================================================
     TEXTO OPCIONAL
     ===================================================== */

  private normalizarOpcional(
    value:
      string | undefined,
  ): string | null {

    if (
      value ===
      undefined
    ) {

      return null;

    }


    const texto =
      value.trim();


    return texto
      ? texto
      : null;

  }
}