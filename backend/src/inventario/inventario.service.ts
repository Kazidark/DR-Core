import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import {
  CreateCelularDto,
  CreateChipDto,
  CreateModemDto,
  CreateMonitorDto,
  CreatePCLaptopDto,
  CreateTabletDto,
  UpdateCelularDto,
  UpdateChipDto,
  UpdateModemDto,
  UpdateMonitorDto,
  UpdatePCLaptopDto,
  UpdateTabletDto,
} from './inventario.dto';

import {
  Celular,
  Chip,
  Modem,
  Monitor,
  PCLaptop,
  Tablet,
} from './inventario.entities';


type RegistroDashboard = {
  area?: string | null;
  estadoEquipo?: string | null;
};


type ChipDashboard = {
  area?: string | null;
  estado?: string | null;
  uso?: string | null;
};


@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(PCLaptop)
    private readonly pcRepository:
      Repository<PCLaptop>,

    @InjectRepository(Monitor)
    private readonly monitorRepository:
      Repository<Monitor>,

    @InjectRepository(Tablet)
    private readonly tabletRepository:
      Repository<Tablet>,

    @InjectRepository(Modem)
    private readonly modemRepository:
      Repository<Modem>,

    @InjectRepository(Celular)
    private readonly celularRepository:
      Repository<Celular>,

    @InjectRepository(Chip)
    private readonly chipRepository:
      Repository<Chip>,
  ) {}


  /* =========================================================
     MÉTODOS COMUNES
     ========================================================= */

  private async crear<
    T extends ObjectLiteral
  >(
    repository: Repository<T>,
    data: DeepPartial<T>,
  ): Promise<T> {
    try {
      const entity =
        repository.create(
          data,
        );

      return await repository.save(
        entity,
      );
    } catch (
      error: unknown
    ) {
      this.procesarErrorBD(
        error,
      );
    }
  }


  private async listar<
    T extends ObjectLiteral
  >(
    repository: Repository<T>,
  ): Promise<T[]> {
    return repository
      .createQueryBuilder(
        'registro',
      )
      .orderBy(
        'registro.id',
        'DESC',
      )
      .getMany();
  }


  private async obtener<
    T extends ObjectLiteral
  >(
    repository: Repository<T>,
    id: number,
    nombre: string,
  ): Promise<T> {
    const entity =
      await repository.findOne({
        where: {
          id,
        } as unknown as
          FindOptionsWhere<T>,
      });


    if (!entity) {
      throw new NotFoundException(
        `${nombre} con ID ${id} no encontrado.`,
      );
    }


    return entity;
  }


  private async actualizar<
    T extends ObjectLiteral
  >(
    repository: Repository<T>,
    id: number,
    data: DeepPartial<T>,
    nombre: string,
  ): Promise<T> {
    const entity =
      await this.obtener(
        repository,
        id,
        nombre,
      );


    Object.assign(
      entity,
      data,
    );


    try {
      return await repository.save(
        entity,
      );
    } catch (
      error: unknown
    ) {
      this.procesarErrorBD(
        error,
      );
    }
  }


  private async eliminar<
    T extends ObjectLiteral
  >(
    repository: Repository<T>,
    id: number,
    nombre: string,
  ): Promise<{
    message: string;
  }> {
    const entity =
      await this.obtener(
        repository,
        id,
        nombre,
      );


    await repository.remove(
      entity,
    );


    return {
      message:
        `${nombre} eliminado correctamente.`,
    };
  }


  private procesarErrorBD(
    error: unknown,
  ): never {
    const databaseError =
      error as {
        number?: number;

        driverError?: {
          number?: number;
        };
      };


    const errorNumber =
      databaseError.number ??
      databaseError
        .driverError
        ?.number;


    if (
      errorNumber === 2601 ||
      errorNumber === 2627
    ) {
      throw new ConflictException(
        'Ya existe un registro con uno de los valores definidos como únicos.',
      );
    }


    throw error;
  }


  /* =========================================================
     DASHBOARD INVENTARIO
     ========================================================= */

  async obtenerDashboard() {

    /*
     * Obtenemos los seis grupos del Inventario
     * en paralelo.
     *
     * Más adelante, si el volumen de información
     * crece considerablemente, podremos migrar
     * estas métricas a consultas COUNT/GROUP BY
     * directamente en SQL Server.
     */
    const [
      pclaptops,
      monitores,
      tablets,
      modems,
      celulares,
      chips,
    ] =
      await Promise.all([
        this.pcRepository.find(),
        this.monitorRepository.find(),
        this.tabletRepository.find(),
        this.modemRepository.find(),
        this.celularRepository.find(),
        this.chipRepository.find(),
      ]);


    /* =====================================================
       TOTALES POR CATEGORÍA
       ===================================================== */

    const totales = {
      pclaptops:
        pclaptops.length,

      monitores:
        monitores.length,

      tablets:
        tablets.length,

      modems:
        modems.length,

      celulares:
        celulares.length,

      chips:
        chips.length,
    };


    const totalActivos =
      Object.values(
        totales,
      ).reduce(
        (
          total,
          cantidad,
        ) =>
          total +
          cantidad,
        0,
      );


    /* =====================================================
       EQUIPOS CON ESTADO DE EQUIPO
       ===================================================== */

    const equipos =
      [
        ...pclaptops,
        ...monitores,
        ...tablets,
        ...modems,
        ...celulares,
      ] as RegistroDashboard[];


    const estadosEquipo = {
      Operativo: 0,
      Inoperativo: 0,
      Stock: 0,
      Donado: 0,
      Vendido: 0,
      SinEstado: 0,
    };


    for (
      const equipo of
      equipos
    ) {

      const estado =
        String(
          equipo.estadoEquipo ??
            '',
        ).trim();


      switch (
        estado
      ) {

        case 'Operativo':
          estadosEquipo
            .Operativo += 1;
          break;


        case 'Inoperativo':
          estadosEquipo
            .Inoperativo += 1;
          break;


        case 'Stock':
          estadosEquipo
            .Stock += 1;
          break;


        case 'Donado':
          estadosEquipo
            .Donado += 1;
          break;


        case 'Vendido':
          estadosEquipo
            .Vendido += 1;
          break;


        default:
          estadosEquipo
            .SinEstado += 1;
          break;

      }

    }


    const totalEquipos =
      equipos.length;


    const porcentajeOperativo =
      totalEquipos > 0
        ? Number(
            (
              (
                estadosEquipo
                  .Operativo /
                totalEquipos
              ) *
              100
            ).toFixed(
              1,
            ),
          )
        : 0;


    const porcentajeStock =
      totalEquipos > 0
        ? Number(
            (
              (
                estadosEquipo
                  .Stock /
                totalEquipos
              ) *
              100
            ).toFixed(
              1,
            ),
          )
        : 0;


    const porcentajeInoperativo =
      totalEquipos > 0
        ? Number(
            (
              (
                estadosEquipo
                  .Inoperativo /
                totalEquipos
              ) *
              100
            ).toFixed(
              1,
            ),
          )
        : 0;


    /* =====================================================
       CHIPS
       ===================================================== */

    const resumenChips = {
      activas: 0,
      baja: 0,
      datos: 0,
      voz: 0,
      stock: 0,
      asignados: 0,
    };


    for (
      const chipRaw of
      chips
    ) {

      const chip =
        chipRaw as
          ChipDashboard;


      /* =================================================
         DISPONIBILIDAD DEL CHIP SEGÚN ÁREA
         ================================================= */

      const area =
        String(
          chip.area ??
            '',
        )
          .trim()
          .toLocaleLowerCase(
            'es',
          );


      if (
        area ===
        'stock'
      ) {

        resumenChips
          .stock += 1;

      }

      else if (
        area
      ) {

        /*
         * Todo chip que tiene un área informada
         * diferente de Stock se considera asignado.
         */
        resumenChips
          .asignados += 1;

      }


      /* =================================================
         ESTADO DEL CHIP
         ================================================= */

      const estado =
        String(
          chip.estado ??
            '',
        )
          .trim()
          .toLocaleLowerCase(
            'es',
          );


      if (
        estado ===
        'activa'
      ) {

        resumenChips
          .activas += 1;

      }

      else if (
        estado ===
        'baja'
      ) {

        resumenChips
          .baja += 1;

      }


      /* =================================================
         TIPO DE USO DEL CHIP
         ================================================= */

      const uso =
        String(
          chip.uso ??
            '',
        )
          .trim()
          .toLocaleLowerCase(
            'es',
          );


      if (
        uso ===
        'datos'
      ) {

        resumenChips
          .datos += 1;

      }

      else if (
        uso ===
        'voz'
      ) {

        resumenChips
          .voz += 1;

      }

    }


    /* =====================================================
       DISTRIBUCIÓN POR ÁREA
       ===================================================== */

    const porAreaMap =
      new Map<
        string,
        number
      >();


    const registrarArea =
      (
        areaRaw:
          unknown,
      ) => {

        const area =
          String(
            areaRaw ??
              '',
          ).trim() ||
          'Sin área';


        porAreaMap.set(
          area,
          (
            porAreaMap.get(
              area,
            ) ??
            0
          ) +
            1,
        );

      };


    for (
      const registro of
      equipos
    ) {

      registrarArea(
        registro.area,
      );

    }


    for (
      const chipRaw of
      chips
    ) {

      const chip =
        chipRaw as
          ChipDashboard;


      registrarArea(
        chip.area,
      );

    }


    const porArea =
      Array.from(
        porAreaMap.entries(),
      )
        .map(
          ([
            area,
            cantidad,
          ]) => ({
            area,
            cantidad,
          }),
        )
        .sort(
          (
            a,
            b,
          ) =>
            b.cantidad -
            a.cantidad,
        );


    /* =====================================================
       DISTRIBUCIÓN POR CATEGORÍA
       ===================================================== */

    const porCategoria =
      [
        {
          key:
            'pclaptops',

          label:
            'PC / Laptops',

          cantidad:
            totales.pclaptops,
        },

        {
          key:
            'monitores',

          label:
            'Monitores',

          cantidad:
            totales.monitores,
        },

        {
          key:
            'tablets',

          label:
            'Tablets',

          cantidad:
            totales.tablets,
        },

        {
          key:
            'modems',

          label:
            'Módems',

          cantidad:
            totales.modems,
        },

        {
          key:
            'celulares',

          label:
            'Celulares',

          cantidad:
            totales.celulares,
        },

        {
          key:
            'chips',

          label:
            'Chips',

          cantidad:
            totales.chips,
        },
      ];


    return {
      totalActivos,

      totalEquipos,

      totales,

      porCategoria,

      estadosEquipo,

      indicadores: {
        porcentajeOperativo,
        porcentajeStock,
        porcentajeInoperativo,
      },

      chips:
        resumenChips,

      porArea,
    };

  }


  /* =========================================================
     PC / LAPTOPS
     ========================================================= */

  crearPC(
    dto:
      CreatePCLaptopDto,
  ) {
    return this.crear(
      this.pcRepository,
      dto,
    );
  }


  listarPC() {
    return this.listar(
      this.pcRepository,
    );
  }


  obtenerPC(
    id: number,
  ) {
    return this.obtener(
      this.pcRepository,
      id,
      'PC/Laptop',
    );
  }


  actualizarPC(
    id: number,
    dto:
      UpdatePCLaptopDto,
  ) {
    return this.actualizar(
      this.pcRepository,
      id,
      dto,
      'PC/Laptop',
    );
  }


  eliminarPC(
    id: number,
  ) {
    return this.eliminar(
      this.pcRepository,
      id,
      'PC/Laptop',
    );
  }


  /* =========================================================
     MONITORES
     ========================================================= */

  crearMonitor(
    dto:
      CreateMonitorDto,
  ) {
    return this.crear(
      this.monitorRepository,
      dto,
    );
  }


  listarMonitores() {
    return this.listar(
      this.monitorRepository,
    );
  }


  obtenerMonitor(
    id: number,
  ) {
    return this.obtener(
      this.monitorRepository,
      id,
      'Monitor',
    );
  }


  actualizarMonitor(
    id: number,
    dto:
      UpdateMonitorDto,
  ) {
    return this.actualizar(
      this.monitorRepository,
      id,
      dto,
      'Monitor',
    );
  }


  eliminarMonitor(
    id: number,
  ) {
    return this.eliminar(
      this.monitorRepository,
      id,
      'Monitor',
    );
  }


  /* =========================================================
     TABLETS
     ========================================================= */

  crearTablet(
    dto:
      CreateTabletDto,
  ) {
    return this.crear(
      this.tabletRepository,
      dto,
    );
  }


  listarTablets() {
    return this.listar(
      this.tabletRepository,
    );
  }


  obtenerTablet(
    id: number,
  ) {
    return this.obtener(
      this.tabletRepository,
      id,
      'Tablet',
    );
  }


  actualizarTablet(
    id: number,
    dto:
      UpdateTabletDto,
  ) {
    return this.actualizar(
      this.tabletRepository,
      id,
      dto,
      'Tablet',
    );
  }


  eliminarTablet(
    id: number,
  ) {
    return this.eliminar(
      this.tabletRepository,
      id,
      'Tablet',
    );
  }


  /* =========================================================
     MÓDEMS
     ========================================================= */

  crearModem(
    dto:
      CreateModemDto,
  ) {
    return this.crear(
      this.modemRepository,
      dto,
    );
  }


  listarModems() {
    return this.listar(
      this.modemRepository,
    );
  }


  obtenerModem(
    id: number,
  ) {
    return this.obtener(
      this.modemRepository,
      id,
      'Módem',
    );
  }


  actualizarModem(
    id: number,
    dto:
      UpdateModemDto,
  ) {
    return this.actualizar(
      this.modemRepository,
      id,
      dto,
      'Módem',
    );
  }


  eliminarModem(
    id: number,
  ) {
    return this.eliminar(
      this.modemRepository,
      id,
      'Módem',
    );
  }


  /* =========================================================
     CELULARES
     ========================================================= */

  crearCelular(
    dto:
      CreateCelularDto,
  ) {
    return this.crear(
      this.celularRepository,
      dto,
    );
  }


  listarCelulares() {
    return this.listar(
      this.celularRepository,
    );
  }


  obtenerCelular(
    id: number,
  ) {
    return this.obtener(
      this.celularRepository,
      id,
      'Celular',
    );
  }


  actualizarCelular(
    id: number,
    dto:
      UpdateCelularDto,
  ) {
    return this.actualizar(
      this.celularRepository,
      id,
      dto,
      'Celular',
    );
  }


  eliminarCelular(
    id: number,
  ) {
    return this.eliminar(
      this.celularRepository,
      id,
      'Celular',
    );
  }


  /* =========================================================
     CHIPS
     ========================================================= */

  crearChip(
    dto:
      CreateChipDto,
  ) {
    return this.crear(
      this.chipRepository,
      dto,
    );
  }


  listarChips() {
    return this.listar(
      this.chipRepository,
    );
  }


  obtenerChip(
    id: number,
  ) {
    return this.obtener(
      this.chipRepository,
      id,
      'Chip',
    );
  }


  actualizarChip(
    id: number,
    dto:
      UpdateChipDto,
  ) {
    return this.actualizar(
      this.chipRepository,
      id,
      dto,
      'Chip',
    );
  }


  eliminarChip(
    id: number,
  ) {
    return this.eliminar(
      this.chipRepository,
      id,
      'Chip',
    );
  }
}