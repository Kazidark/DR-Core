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
  CreateLicenciaOfficeDto,
  UpdateLicenciaOfficeDto,
} from './licencias-office.dto';

import {
  EstadoLicenciaOffice,
  LicenciaOffice,
  TipoLicenciaOffice,
} from './licencias-office.entity';


@Injectable()
export class LicenciasOfficeService {

  constructor(
    @InjectRepository(
      LicenciaOffice,
    )
    private readonly repository:
      Repository<LicenciaOffice>,
  ) {}


  /* =====================================================
     CREAR
     ===================================================== */

  async crear(
    tipoLicencia:
      TipoLicenciaOffice,

    dto:
      CreateLicenciaOfficeDto,
  ) {

    const correo =
      this.normalizarCorreo(
        dto.correo,
      );


    /* ===================================================
       VALIDAR CORREO ÚNICO POR CATEGORÍA

       El mismo correo puede existir en otra categoría,
       pero no puede repetirse dentro de la misma.
       =================================================== */

    const existente =
      await this.repository
        .findOne({
          where: {
            correo,
            tipoLicencia,
          },
        });


    if (
      existente
    ) {

      throw new ConflictException(
        `El correo "${correo}" ya se encuentra registrado en esta categoría de Licencias Office.`,
      );

    }


    /* ===================================================
       CREAR REGISTRO
       =================================================== */

    const licencia =
      this.repository
        .create({

          tipoLicencia,

          nombresCompletos:
            dto.nombresCompletos
              .trim(),

          correo,

          area:
            this.normalizarTexto(
              dto.area,
            ),

          usuarioAnterior:
            this.normalizarTexto(
              dto.usuarioAnterior,
            ),

          estado:
            dto.estado,

        });


    return this.repository
      .save(
        licencia,
      );

  }


  /* =====================================================
     LISTAR POR TIPO DE LICENCIA

     SOLO UTILIZADO POR EL MÓDULO ADMINISTRATIVO.
     ===================================================== */

  listar(
    tipoLicencia:
      TipoLicenciaOffice,
  ) {

    return this.repository
      .createQueryBuilder(
        'licencia',
      )
      .where(
        'licencia.tipoLicencia = :tipoLicencia',
        {
          tipoLicencia,
        },
      )
      .orderBy(
        'licencia.nombresCompletos',
        'ASC',
      )
      .addOrderBy(
        'licencia.correo',
        'ASC',
      )
      .getMany();

  }


  /* =====================================================
     RESUMEN DASHBOARD

     ESTE MÉTODO DEVUELVE ÚNICAMENTE INFORMACIÓN
     AGREGADA Y NO EXPONE REGISTROS INDIVIDUALES.

     SERÁ UTILIZADO POR:
     - Administrador
     - Consultor
     ===================================================== */

  async resumen() {

    /* ===================================================
       TOTAL GENERAL
       =================================================== */

    const total =
      await this.repository
        .count();


    /* ===================================================
       OFFICE BÁSICO
       =================================================== */

    const officeBasico =
      await this.repository
        .count({
          where: {
            tipoLicencia:
              TipoLicenciaOffice
                .OFFICE_BASICO,
          },
        });


    /* ===================================================
       OFFICE EMPRESARIAL
       =================================================== */

    const officeEmpresarial =
      await this.repository
        .count({
          where: {
            tipoLicencia:
              TipoLicenciaOffice
                .OFFICE_EMPRESARIAL,
          },
        });


    /* ===================================================
       POWER BI
       =================================================== */

    const powerBi =
      await this.repository
        .count({
          where: {
            tipoLicencia:
              TipoLicenciaOffice
                .POWER_BI,
          },
        });


    /* ===================================================
       LICENCIAS ACTIVADAS
       =================================================== */

    const activadas =
      await this.repository
        .count({
          where: {
            estado:
              EstadoLicenciaOffice
                .ACTIVADO,
          },
        });


    /* ===================================================
       LICENCIAS DESACTIVADAS
       =================================================== */

    const desactivadas =
      await this.repository
        .count({
          where: {
            estado:
              EstadoLicenciaOffice
                .DESACTIVADO,
          },
        });


    /* ===================================================
       PORCENTAJE ACTIVADAS
       =================================================== */

    const porcentajeActivadas =
      total >
      0
        ? Number(
            (
              (
                activadas /
                total
              ) *
              100
            ).toFixed(
              2,
            ),
          )
        : 0;


    /* ===================================================
       RESPUESTA PARA DASHBOARD
       =================================================== */

    return {

      total,

      officeBasico,

      officeEmpresarial,

      powerBi,

      activadas,

      desactivadas,

      porcentajeActivadas,

    };

  }


  /* =====================================================
     OBTENER POR ID Y TIPO
     ===================================================== */

  async obtener(
    id:
      number,

    tipoLicencia:
      TipoLicenciaOffice,
  ) {

    const licencia =
      await this.repository
        .findOne({
          where: {
            id,
            tipoLicencia,
          },
        });


    if (
      !licencia
    ) {

      throw new NotFoundException(
        `Licencia con ID ${id} no encontrada.`,
      );

    }


    return licencia;

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  async actualizar(
    id:
      number,

    tipoLicencia:
      TipoLicenciaOffice,

    dto:
      UpdateLicenciaOfficeDto,
  ) {

    const licencia =
      await this.obtener(
        id,
        tipoLicencia,
      );


    /* ===================================================
       NOMBRES COMPLETOS
       =================================================== */

    if (
      dto.nombresCompletos !==
      undefined
    ) {

      licencia.nombresCompletos =
        dto.nombresCompletos
          .trim();

    }


    /* ===================================================
       ÁREA
       =================================================== */

    if (
      dto.area !==
      undefined
    ) {

      licencia.area =
        this.normalizarTexto(
          dto.area,
        );

    }


    /* ===================================================
       USUARIO ANTERIOR
       =================================================== */

    if (
      dto.usuarioAnterior !==
      undefined
    ) {

      licencia.usuarioAnterior =
        this.normalizarTexto(
          dto.usuarioAnterior,
        );

    }


    /* ===================================================
       ESTADO
       =================================================== */

    if (
      dto.estado !==
      undefined
    ) {

      licencia.estado =
        dto.estado;

    }


    return this.repository
      .save(
        licencia,
      );

  }


  /* =====================================================
     NORMALIZAR CORREO
     ===================================================== */

  private normalizarCorreo(
    value:
      string,
  ) {

    return value
      .trim()
      .toLocaleLowerCase();

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