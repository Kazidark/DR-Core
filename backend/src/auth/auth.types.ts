import {
  RolUsuario,
} from '../usuarios/usuarios.entity';


export type JwtUsuario = {
  sub: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
};