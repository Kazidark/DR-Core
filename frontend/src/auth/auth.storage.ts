import type {
    UsuarioSesion,
} from "./auth.types";


const TOKEN_KEY =
    "drcore_access_token";


const USER_KEY =
    "drcore_usuario";


export function guardarSesion(
    token: string,
    usuario: UsuarioSesion,
) {

    localStorage.setItem(
        TOKEN_KEY,
        token,
    );


    localStorage.setItem(
        USER_KEY,
        JSON.stringify(
            usuario,
        ),
    );

}


export function obtenerToken():
    string | null {

    return localStorage.getItem(
        TOKEN_KEY,
    );

}


export function obtenerUsuarioGuardado():
    UsuarioSesion | null {

    const raw =
        localStorage.getItem(
            USER_KEY,
        );


    if (!raw) {
        return null;
    }


    try {

        return JSON.parse(
            raw,
        ) as UsuarioSesion;

    } catch {

        limpiarSesion();

        return null;

    }

}


export function limpiarSesion() {

    localStorage.removeItem(
        TOKEN_KEY,
    );


    localStorage.removeItem(
        USER_KEY,
    );

}