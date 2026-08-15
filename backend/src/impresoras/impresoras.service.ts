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
  CreateImpresoraDto,
  UpdateImpresoraDto,
} from './impresoras.dto';

import {
  Impresora,
} from './impresoras.entity';


@Injectable()
export class ImpresorasService {
  constructor(
    @InjectRepository(
      Impresora,
    )
    private readonly impresoraRepository:
      Repository<Impresora>,
  ) {}


  /* =====================================================
     CREAR
     ===================================================== */

  async crear(
    dto:
      CreateImpresoraDto,
  ) {

    const ipCompleta =
      dto.ipCompleta
        .trim();


    const existente =
      await this.impresoraRepository
        .findOne({
          where: {
            ipCompleta,
          },
        });


    if (
      existente
    ) {

      throw new ConflictException(
        `La IP "${ipCompleta}" ya se encuentra registrada.`,
      );

    }


    const impresora =
      this.impresoraRepository
        .create({
          ipCompleta,

          nombre:
            this.normalizarTexto(
              dto.nombre,
            ),

          area:
            this.normalizarTexto(
              dto.area,
            ),

          ubicacion:
            this.normalizarTexto(
              dto.ubicacion,
            ),

          observacion:
            this.normalizarTexto(
              dto.observacion,
            ),

          areaAnterior:
            this.normalizarTexto(
              dto.areaAnterior,
            ),
        });


    return this.impresoraRepository
      .save(
        impresora,
      );

  }


  /* =====================================================
     LISTAR
     ===================================================== */

  listar() {

    return this.impresoraRepository
      .createQueryBuilder(
        'impresora',
      )
      .orderBy(
        'impresora.IpCompleta',
        'ASC',
      )
      .getMany();

  }


  /* =====================================================
     OBTENER
     ===================================================== */

  async obtener(
    id:
      number,
  ) {

    const impresora =
      await this.impresoraRepository
        .findOne({
          where: {
            id,
          },
        });


    if (
      !impresora
    ) {

      throw new NotFoundException(
        `Impresora con ID ${id} no encontrada.`,
      );

    }


    return impresora;

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  async actualizar(
    id:
      number,

    dto:
      UpdateImpresoraDto,
  ) {

    const impresora =
      await this.obtener(
        id,
      );


    if (
      dto.nombre !==
      undefined
    ) {

      impresora.nombre =
        this.normalizarTexto(
          dto.nombre,
        );

    }


    if (
      dto.area !==
      undefined
    ) {

      impresora.area =
        this.normalizarTexto(
          dto.area,
        );

    }


    if (
      dto.ubicacion !==
      undefined
    ) {

      impresora.ubicacion =
        this.normalizarTexto(
          dto.ubicacion,
        );

    }


    if (
      dto.observacion !==
      undefined
    ) {

      impresora.observacion =
        this.normalizarTexto(
          dto.observacion,
        );

    }


    if (
      dto.areaAnterior !==
      undefined
    ) {

      impresora.areaAnterior =
        this.normalizarTexto(
          dto.areaAnterior,
        );

    }


    return this.impresoraRepository
      .save(
        impresora,
      );

  }


  /* =====================================================
     NORMALIZAR TEXTO
     ===================================================== */

  private normalizarTexto(
    value:
      string | undefined,
  ) {

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