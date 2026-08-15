import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  CreateAreaDto,
  UpdateAreaDto,
} from './areas.dto';

import { Area } from './areas.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async crear(
    dto: CreateAreaDto,
  ): Promise<Area> {
    const nombre = dto.nombre.trim();

    const existente =
      await this.areaRepository.findOne({
        where: {
          nombre,
        },
      });

    if (existente) {
      throw new ConflictException(
        `El área "${nombre}" ya existe.`,
      );
    }

    const area =
      this.areaRepository.create({
        nombre,

        activo:
          dto.activo ?? true,
      });

    return this.areaRepository.save(area);
  }

  listar(): Promise<Area[]> {
    return this.areaRepository
      .createQueryBuilder('area')
      .orderBy('area.nombre', 'ASC')
      .getMany();
  }

  listarActivas(): Promise<Area[]> {
    return this.areaRepository
      .createQueryBuilder('area')
      .where('area.activo = :activo', {
        activo: true,
      })
      .orderBy('area.nombre', 'ASC')
      .getMany();
  }

  async obtener(
    id: number,
  ): Promise<Area> {
    const area =
      await this.areaRepository.findOne({
        where: {
          id,
        },
      });

    if (!area) {
      throw new NotFoundException(
        `Área con ID ${id} no encontrada.`,
      );
    }

    return area;
  }

  async actualizar(
    id: number,
    dto: UpdateAreaDto,
  ): Promise<Area> {
    const area =
      await this.obtener(id);

    if (dto.nombre !== undefined) {
      const nombre =
        dto.nombre.trim();

      const existente =
        await this.areaRepository
          .createQueryBuilder('area')
          .where('area.nombre = :nombre', {
            nombre,
          })
          .andWhere('area.id <> :id', {
            id,
          })
          .getOne();

      if (existente) {
        throw new ConflictException(
          `El área "${nombre}" ya existe.`,
        );
      }

      area.nombre = nombre;
    }

    if (dto.activo !== undefined) {
      area.activo = dto.activo;
    }

    return this.areaRepository.save(area);
  }

  async eliminar(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const area =
      await this.obtener(id);

    /*
     * Para catálogos es preferible no borrar físicamente.
     * La desactivamos.
     */
    area.activo = false;

    await this.areaRepository.save(area);

    return {
      message:
        'Área desactivada correctamente.',
    };
  }
}