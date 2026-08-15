import {
  BadRequestException,
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
  CreateIpDto,
  UpdateIpDto,
} from './ips.dto';

import {
  IpRegistro,
  SegmentoIp,
} from './ips.entity';


@Injectable()
export class IpsService {
  constructor(
    @InjectRepository(
      IpRegistro,
    )
    private readonly ipRepository:
      Repository<IpRegistro>,
  ) {}


  /* =====================================================
     CREAR
     ===================================================== */

  async crear(
    dto:
      CreateIpDto,
  ): Promise<IpRegistro> {

    const ip =
      dto.ip.trim();


    this.validarIpContraSegmento(
      ip,
      dto.segmento,
    );


    const existente =
      await this.ipRepository.findOne({
        where: {
          ip,
        },
      });


    if (
      existente
    ) {

      throw new ConflictException(
        `La IP "${ip}" ya se encuentra registrada.`,
      );

    }


    const registro =
      this.ipRepository.create({
        segmento:
          dto.segmento,

        ip,

        hostName:
          this.normalizarTexto(
            dto.hostName,
          ),

        usuario:
          this.normalizarTexto(
            dto.usuario,
          ),

        area:
          this.normalizarTexto(
            dto.area,
          ),

        ubicacion:
          this.normalizarTexto(
            dto.ubicacion,
          ),

        oficina:
          this.normalizarTexto(
            dto.oficina,
          ),

        observacion:
          this.normalizarTexto(
            dto.observacion,
          ),
      });


    return this.ipRepository.save(
      registro,
    );

  }


  /* =====================================================
     LISTAR TODOS
     ===================================================== */

  listar(): Promise<IpRegistro[]> {

    return this.ipRepository
      .createQueryBuilder(
        'ip',
      )
      .orderBy(
        'ip.Segmento',
        'ASC',
      )
      .addOrderBy(
        'ip.Ip',
        'ASC',
      )
      .getMany();

  }


  /* =====================================================
     LISTAR POR SEGMENTO
     ===================================================== */

  listarPorSegmento(
    segmento:
      SegmentoIp,
  ): Promise<IpRegistro[]> {

    return this.ipRepository
      .createQueryBuilder(
        'ip',
      )
      .where(
        'ip.Segmento = :segmento',
        {
          segmento,
        },
      )
      .orderBy(
        'ip.Ip',
        'ASC',
      )
      .getMany();

  }


  /* =====================================================
     RESUMEN
     ===================================================== */

  async resumen() {

    const segmentos:
      SegmentoIp[] = [

      SegmentoIp.SEGMENTO_26,

      SegmentoIp.SEGMENTO_46,

      SegmentoIp.SEGMENTO_56,

      SegmentoIp.SEGMENTO_100,
    ];


    const resultados =
      await Promise.all(
        segmentos.map(
          async (
            segmento,
          ) => {

            const cantidad =
              await this.ipRepository.count({
                where: {
                  segmento,
                },
              });


            return {
              segmento,
              cantidad,
            };

          },
        ),
      );


    return resultados;

  }


  /* =====================================================
     OBTENER
     ===================================================== */

  async obtener(
    id:
      number,
  ): Promise<IpRegistro> {

    const registro =
      await this.ipRepository.findOne({
        where: {
          id,
        },
      });


    if (
      !registro
    ) {

      throw new NotFoundException(
        `Registro IP con ID ${id} no encontrado.`,
      );

    }


    return registro;

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  async actualizar(
    id:
      number,

    dto:
      UpdateIpDto,
  ): Promise<IpRegistro> {

    const registro =
      await this.obtener(
        id,
      );


    if (
      dto.hostName !==
      undefined
    ) {

      registro.hostName =
        this.normalizarTexto(
          dto.hostName,
        );

    }


    if (
      dto.usuario !==
      undefined
    ) {

      registro.usuario =
        this.normalizarTexto(
          dto.usuario,
        );

    }


    if (
      dto.area !==
      undefined
    ) {

      registro.area =
        this.normalizarTexto(
          dto.area,
        );

    }


    if (
      dto.ubicacion !==
      undefined
    ) {

      registro.ubicacion =
        this.normalizarTexto(
          dto.ubicacion,
        );

    }


    if (
      dto.oficina !==
      undefined
    ) {

      registro.oficina =
        this.normalizarTexto(
          dto.oficina,
        );

    }


    if (
      dto.observacion !==
      undefined
    ) {

      registro.observacion =
        this.normalizarTexto(
          dto.observacion,
        );

    }


    return this.ipRepository.save(
      registro,
    );

  }


  /* =====================================================
     VALIDAR IP VS SEGMENTO
     ===================================================== */

  private validarIpContraSegmento(
    ip:
      string,

    segmento:
      SegmentoIp,
  ) {

    const octetos =
      ip.split(
        '.',
      );


    if (
      octetos.length !==
      4
    ) {

      throw new BadRequestException(
        'La IP ingresada no es válida.',
      );

    }


    /*
     * Ejemplo:
     *
     * 10.6.26.15
     *       ^^
     *
     * El tercer octeto debe coincidir
     * con el segmento seleccionado.
     */

    if (
      octetos[2] !==
      segmento
    ) {

      throw new BadRequestException(
        `La IP "${ip}" no pertenece al segmento ${segmento}.`,
      );

    }

  }


  /* =====================================================
     NORMALIZAR TEXTO
     ===================================================== */

  private normalizarTexto(
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