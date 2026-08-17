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
  Not,
  Repository,
} from 'typeorm';

import {
  CambiarEstadoCorreoDto,
  CreateCorreoDto,
  UpdateCorreoDto,
} from './correos.dto';

import {
  Correo,
  EstadoCorreo,
} from './correos.entity';


@Injectable()
export class CorreosService {

  constructor(
    @InjectRepository(
      Correo,
    )
    private readonly repository:
      Repository<Correo>,
  ) {}


  /* =====================================================
     CREAR
     ===================================================== */

  async crear(
    dto:
      CreateCorreoDto,
  ) {

    /* ===================================================
       NORMALIZAR DATOS
       =================================================== */

    const nombre =
      this.normalizarTexto(
        dto.nombre,
      );


    const apellido =
      this.normalizarTexto(
        dto.apellido,
      );


    const cuentaCorreo =
      this.normalizarCorreo(
        dto.cuentaCorreo,
      );


    const correoCreado =
      this.normalizarCorreo(
        dto.correoCreado,
      );


    const fechaSolicitada =
      this.normalizarFecha(
        dto.fechaSolicitada,
      );


    const fechaCreacion =
      this.normalizarFecha(
        dto.fechaCreacion,
      );


    /* ===================================================
       CAMPOS OBLIGATORIOS
       =================================================== */

    if (
      !nombre
    ) {

      throw new BadRequestException(
        'El nombre es obligatorio.',
      );

    }


    if (
      !apellido
    ) {

      throw new BadRequestException(
        'El apellido es obligatorio.',
      );

    }


    if (
      !cuentaCorreo
    ) {

      throw new BadRequestException(
        'La cuenta de correo es obligatoria.',
      );

    }


    /* ===================================================
       REGLA DE CORREO CREADO

       Si se registra CorreoCreado,
       FechaCreacion pasa a ser obligatoria.

       FechaSolicitada continúa siendo opcional.
       =================================================== */

    if (
      correoCreado &&
      !fechaCreacion
    ) {

      throw new BadRequestException(
        'La fecha de creación es obligatoria cuando se registra un correo creado.',
      );

    }


    /* ===================================================
       VALIDAR UNICIDAD
       =================================================== */

    await this.validarCuentaCorreo(
      cuentaCorreo,
    );


    await this.validarCorreoCreado(
      correoCreado,
    );


    /*
     * IMPORTANTE:
     *
     * CuentaCorreo y CorreoCreado
     * son únicos de manera INDEPENDIENTE.
     *
     * Ejemplo permitido:
     *
     * CuentaCorreo:
     * usuario@empresa.com
     *
     * CorreoCreado:
     * usuario@empresa.com
     *
     * No se realiza validación cruzada
     * entre ambas columnas.
     */


    const correo =
      this.repository.create({

        nombre,

        apellido,

        cuentaCorreo,

        estado:
          dto.estado ??
          EstadoCorreo.RESERVA,

        fechaSolicitada,

        correoCreado,

        solicitante:
          this.normalizarTexto(
            dto.solicitante,
          ),

        fechaCreacion,

        observacion:
          this.normalizarTexto(
            dto.observacion,
          ),

        usuarioAnterior:
          this.normalizarTexto(
            dto.usuarioAnterior,
          ),
      });


    return this.repository.save(
      correo,
    );

  }


  /* =====================================================
     LISTAR

     UTILIZADO POR EL MÓDULO DE CORREOS.
     EL CONTROLLER LO MANTIENE SOLO PARA ADMINISTRADOR.
     ===================================================== */

  listar() {

    return this.repository
      .createQueryBuilder(
        'correo',
      )
      .orderBy(
        'correo.id',
        'DESC',
      )
      .getMany();

  }


  /* =====================================================
     RESUMEN DASHBOARD

     ESTE MÉTODO NO DEVUELVE REGISTROS INDIVIDUALES.
     SOLO INFORMACIÓN AGREGADA.

     SERÁ UTILIZADO POR:
     - Administrador
     - Consultor
     ===================================================== */

  async resumen() {

    /* ===================================================
       TOTAL
       =================================================== */

    const total =
      await this.repository
        .count();


    /* ===================================================
       ESTADO USADO
       =================================================== */

    const usados =
      await this.repository
        .count({
          where: {
            estado:
              EstadoCorreo.USADO,
          },
        });


    /* ===================================================
       ESTADO RESERVA
       =================================================== */

    const reserva =
      await this.repository
        .count({
          where: {
            estado:
              EstadoCorreo.RESERVA,
          },
        });


    /* ===================================================
       REGISTROS CON CORREO CREADO

       Aunque actualmente normalizamos los valores
       vacíos a NULL, también comprobamos que no
       exista una cadena vacía por seguridad ante
       datos antiguos o ingresados directamente
       en SQL Server.
       =================================================== */

    const conCorreoCreado =
      await this.repository
        .createQueryBuilder(
          'correo',
        )
        .where(
          'correo.correoCreado IS NOT NULL',
        )
        .andWhere(
          "LTRIM(RTRIM(correo.correoCreado)) <> ''",
        )
        .getCount();


    /* ===================================================
       PENDIENTES DE CREACIÓN
       =================================================== */

    const pendientesCreacion =
      Math.max(
        total -
        conCorreoCreado,
        0,
      );


    /* ===================================================
       PORCENTAJE DE CORREOS CREADOS
       =================================================== */

    const porcentajeCreados =
      total >
      0
        ? Number(
            (
              (
                conCorreoCreado /
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

      usados,

      reserva,

      conCorreoCreado,

      pendientesCreacion,

      porcentajeCreados,

    };

  }


  /* =====================================================
     OBTENER POR ID

     SOLO ADMINISTRADOR DESDE EL CONTROLLER.
     ===================================================== */

  async obtener(
    id:
      number,
  ) {

    const correo =
      await this.repository
        .findOne({
          where: {
            id,
          },
        });


    if (
      !correo
    ) {

      throw new NotFoundException(
        `Registro de correo con ID ${id} no encontrado.`,
      );

    }


    return correo;

  }


  /* =====================================================
     ACTUALIZAR
     ===================================================== */

  async actualizar(
    id:
      number,

    dto:
      UpdateCorreoDto,
  ) {

    const correo =
      await this.obtener(
        id,
      );


    /* ===================================================
       NOMBRE
       =================================================== */

    if (
      dto.nombre !==
      undefined
    ) {

      const nombre =
        this.normalizarTexto(
          dto.nombre,
        );


      if (
        !nombre
      ) {

        throw new BadRequestException(
          'El nombre no puede quedar vacío.',
        );

      }


      correo.nombre =
        nombre;

    }


    /* ===================================================
       APELLIDO
       =================================================== */

    if (
      dto.apellido !==
      undefined
    ) {

      const apellido =
        this.normalizarTexto(
          dto.apellido,
        );


      if (
        !apellido
      ) {

        throw new BadRequestException(
          'El apellido no puede quedar vacío.',
        );

      }


      correo.apellido =
        apellido;

    }


    /* ===================================================
       CUENTA DE CORREO
       =================================================== */

    if (
      dto.cuentaCorreo !==
      undefined
    ) {

      const cuentaCorreo =
        this.normalizarCorreo(
          dto.cuentaCorreo,
        );


      if (
        !cuentaCorreo
      ) {

        throw new BadRequestException(
          'La cuenta de correo no puede quedar vacía.',
        );

      }


      await this.validarCuentaCorreo(
        cuentaCorreo,
        id,
      );


      correo.cuentaCorreo =
        cuentaCorreo;

    }


    /* ===================================================
       ESTADO
       =================================================== */

    if (
      dto.estado !==
      undefined
    ) {

      correo.estado =
        dto.estado;

    }


    /* ===================================================
       FECHA SOLICITADA

       OPCIONAL.
       =================================================== */

    if (
      dto.fechaSolicitada !==
      undefined
    ) {

      correo.fechaSolicitada =
        this.normalizarFecha(
          dto.fechaSolicitada,
        );

    }


    /* ===================================================
       CORREO CREADO
       =================================================== */

    if (
      dto.correoCreado !==
      undefined
    ) {

      const correoCreado =
        this.normalizarCorreo(
          dto.correoCreado,
        );


      await this.validarCorreoCreado(
        correoCreado,
        id,
      );


      correo.correoCreado =
        correoCreado;

    }


    /* ===================================================
       SOLICITANTE
       =================================================== */

    if (
      dto.solicitante !==
      undefined
    ) {

      correo.solicitante =
        this.normalizarTexto(
          dto.solicitante,
        );

    }


    /* ===================================================
       FECHA DE CREACIÓN
       =================================================== */

    if (
      dto.fechaCreacion !==
      undefined
    ) {

      correo.fechaCreacion =
        this.normalizarFecha(
          dto.fechaCreacion,
        );

    }


    /* ===================================================
       OBSERVACIÓN
       =================================================== */

    if (
      dto.observacion !==
      undefined
    ) {

      correo.observacion =
        this.normalizarTexto(
          dto.observacion,
        );

    }


    /* ===================================================
       USUARIO ANTERIOR
       =================================================== */

    if (
      dto.usuarioAnterior !==
      undefined
    ) {

      correo.usuarioAnterior =
        this.normalizarTexto(
          dto.usuarioAnterior,
        );

    }


    /* ===================================================
       VALIDAR ESTADO FINAL DEL REGISTRO

       Si después de aplicar la actualización
       existe CorreoCreado, entonces también
       debe existir FechaCreacion.
       =================================================== */

    if (
      correo.correoCreado &&
      !correo.fechaCreacion
    ) {

      throw new BadRequestException(
        'La fecha de creación es obligatoria cuando se registra un correo creado.',
      );

    }


    return this.repository.save(
      correo,
    );

  }


  /* =====================================================
     CAMBIAR ESTADO

     UTILIZADO POR EL BOTÓN:
     Usado ↔ Reserva
     ===================================================== */

  async cambiarEstado(
    id:
      number,

    dto:
      CambiarEstadoCorreoDto,
  ) {

    const correo =
      await this.obtener(
        id,
      );


    correo.estado =
      dto.estado;


    return this.repository.save(
      correo,
    );

  }


  /* =====================================================
     VALIDAR CUENTA DE CORREO

     CuentaCorreo debe ser única dentro
     de su propia columna.
     ===================================================== */

  private async validarCuentaCorreo(
    cuentaCorreo:
      string | null,

    ignorarId?:
      number,
  ) {

    if (
      !cuentaCorreo
    ) {

      return;

    }


    const existente =
      await this.repository
        .findOne({
          where:
            ignorarId ===
            undefined
              ? {
                  cuentaCorreo,
                }
              : {
                  cuentaCorreo,

                  id:
                    Not(
                      ignorarId,
                    ),
                },
        });


    if (
      existente
    ) {

      throw new ConflictException(
        `La cuenta de correo "${cuentaCorreo}" ya se encuentra registrada.`,
      );

    }

  }


  /* =====================================================
     VALIDAR CORREO CREADO

     CorreoCreado debe ser único dentro
     de su propia columna.
     ===================================================== */

  private async validarCorreoCreado(
    correoCreado:
      string | null,

    ignorarId?:
      number,
  ) {

    if (
      !correoCreado
    ) {

      return;

    }


    const existente =
      await this.repository
        .findOne({
          where:
            ignorarId ===
            undefined
              ? {
                  correoCreado,
                }
              : {
                  correoCreado,

                  id:
                    Not(
                      ignorarId,
                    ),
                },
        });


    if (
      existente
    ) {

      throw new ConflictException(
        `El correo creado "${correoCreado}" ya se encuentra registrado.`,
      );

    }

  }


  /* =====================================================
     NORMALIZAR CORREO
     ===================================================== */

  private normalizarCorreo(
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
      value
        .trim()
        .toLocaleLowerCase();


    return texto
      ? texto
      : null;

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


  /* =====================================================
     NORMALIZAR FECHA
     ===================================================== */

  private normalizarFecha(
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