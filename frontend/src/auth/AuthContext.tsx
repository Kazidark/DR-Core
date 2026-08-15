import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import type {
    LoginResponse,
    UsuarioSesion,
} from "./auth.types";

import {
    guardarSesion,
    limpiarSesion,
    obtenerToken,
    obtenerUsuarioGuardado,
} from "./auth.storage";


const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


type AuthContextValue = {

    usuario:
        UsuarioSesion | null;

    cargando:
        boolean;

    login: (
        usuario: string,
        password: string,
    ) => Promise<void>;

    logout:
        () => void;
};


const AuthContext =
    createContext<
        AuthContextValue | undefined
    >(undefined);


type AuthProviderProps = {
    children: ReactNode;
};


export function AuthProvider({
    children,
}: AuthProviderProps) {

    const [
        usuario,
        setUsuario,
    ] = useState<
        UsuarioSesion | null
    >(
        obtenerUsuarioGuardado,
    );


    const [
        cargando,
        setCargando,
    ] = useState(
        true,
    );


    /* =====================================================
       VALIDAR SESIÓN AL INICIAR
       ===================================================== */

    useEffect(() => {

        const validarSesion =
            async () => {

                const token =
                    obtenerToken();


                const usuarioGuardado =
                    obtenerUsuarioGuardado();


                if (
                    !token ||
                    !usuarioGuardado
                ) {

                    limpiarSesion();

                    setUsuario(
                        null,
                    );

                    setCargando(
                        false,
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/auth/me`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            },
                        );


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            "Sesión inválida.",
                        );

                    }


                    const actual =
                        (await response.json()) as {
                            sub: number;
                            usuario: string;
                            nombres: string;
                            apellidos: string;

                            rol:
                                | "Administrador"
                                | "Consultor";
                        };


                    const actualizado:
                        UsuarioSesion = {

                        ...usuarioGuardado,

                        id:
                            actual.sub,

                        usuario:
                            actual.usuario,

                        nombres:
                            actual.nombres,

                        apellidos:
                            actual.apellidos,

                        rol:
                            actual.rol,
                    };


                    guardarSesion(
                        token,
                        actualizado,
                    );


                    setUsuario(
                        actualizado,
                    );

                } catch {

                    limpiarSesion();

                    setUsuario(
                        null,
                    );

                } finally {

                    setCargando(
                        false,
                    );

                }

            };


        void validarSesion();

    }, []);


    /* =====================================================
       LOGIN
       ===================================================== */

    async function login(
        nombreUsuario: string,
        password: string,
    ) {

        const response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            usuario:
                                nombreUsuario.trim(),

                            password,
                        }),
                },
            );


        if (
            !response.ok
        ) {

            let message =
                "No se pudo iniciar sesión.";


            try {

                const body =
                    (await response.json()) as {
                        message?:
                            | string
                            | string[];
                    };


                if (
                    Array.isArray(
                        body.message,
                    )
                ) {

                    message =
                        body.message.join(
                            ", ",
                        );

                }

                else if (
                    typeof body.message ===
                    "string"
                ) {

                    message =
                        body.message;

                }

            } catch {

                /*
                 * Se mantiene el
                 * mensaje genérico.
                 */

            }


            throw new Error(
                message,
            );

        }


        const data =
            (await response.json()) as LoginResponse;


        guardarSesion(
            data.accessToken,
            data.usuario,
        );


        setUsuario(
            data.usuario,
        );

    }


    /* =====================================================
       CERRAR SESIÓN
       ===================================================== */

    function logout() {

        limpiarSesion();


        setUsuario(
            null,
        );

    }


    return (

        <AuthContext.Provider
            value={{
                usuario,
                cargando,
                login,
                logout,
            }}
        >

            {
                children
            }

        </AuthContext.Provider>

    );

}


export function useAuth() {

    const context =
        useContext(
            AuthContext,
        );


    if (!context) {

        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider.",
        );

    }


    return context;

}