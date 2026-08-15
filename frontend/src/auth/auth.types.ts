export type RolUsuario =
    | "Administrador"
    | "Consultor";


export type UsuarioSesion = {
    id: number;
    nombres: string;
    apellidos: string;
    usuario: string;
    correo: string;
    rol: RolUsuario;
};


export type LoginResponse = {
    accessToken: string;
    usuario: UsuarioSesion;
};