import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';


export enum TipoLicenciaOffice {
  OFFICE_BASICO =
    'OfficeBasico',

  OFFICE_EMPRESARIAL =
    'OfficeEmpresarial',

  POWER_BI =
    'PowerBI',
}


export enum EstadoLicenciaOffice {
  ACTIVADO =
    'Activado',

  DESACTIVADO =
    'Desactivado',
}


@Entity('LicenciasOffice')
@Index(
  'UX_LicenciasOffice_Correo_TipoLicencia',
  [
    'correo',
    'tipoLicencia',
  ],
  {
    unique: true,
  },
)
export class LicenciaOffice {

  @PrimaryGeneratedColumn({
    name: 'Id',
  })
  id!: number;


  @Column({
    name: 'TipoLicencia',
    type: 'varchar',
    length: 30,
  })
  tipoLicencia!:
    TipoLicenciaOffice;


  @Column({
    name: 'NombresCompletos',
    type: 'varchar',
    length: 200,
  })
  nombresCompletos!:
    string;


  @Column({
    name: 'Correo',
    type: 'varchar',
    length: 250,
  })
  correo!:
    string;


  @Column({
    name: 'Area',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  area!:
    string | null;


  @Column({
    name: 'UsuarioAnterior',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  usuarioAnterior!:
    string | null;


  @Column({
    name: 'Estado',
    type: 'varchar',
    length: 20,
    default:
      EstadoLicenciaOffice.ACTIVADO,
  })
  estado!:
    EstadoLicenciaOffice;

}