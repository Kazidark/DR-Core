import {
    useMemo,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import styles from "@/pages/Auth/AuthPages.module.css";


const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


type ApiResponse = {
    message?:
        string | string[];

    error?:
        string;
};


async function obtenerMensajeError(
    response:
        Response,
) {

    try {

        const body =
            (await response.json()) as
                ApiResponse;


        if (
            Array.isArray(
                body.message,
            )
        ) {

            return body
                .message
                .join(
                    ", ",
                );

        }


        if (
            typeof body.message ===
                "string" &&
            body.message.trim()
        ) {

            return body.message;

        }


        if (
            typeof body.error ===
                "string" &&
            body.error.trim()
        ) {

            return body.error;

        }

    } catch {

        /*
         * Respuesta sin JSON.
         */

    }


    return (
        "No se pudo restablecer la contraseña."
    );

}


export default function RestablecerPassword() {

    const [
        searchParams,
    ] =
        useSearchParams();


    const token =
        useMemo(
            () =>
                searchParams
                    .get(
                        "token",
                    )
                    ?.trim() ??
                "",
            [
                searchParams,
            ],
        );


    const [
        password,
        setPassword,
    ] =
        useState("");


    const [
        confirmPassword,
        setConfirmPassword,
    ] =
        useState("");


    const [
        loading,
        setLoading,
    ] =
        useState(
            false,
        );


    const [
        error,
        setError,
    ] =
        useState("");


    const [
        success,
        setSuccess,
    ] =
        useState(
            false,
        );


    async function guardar(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {

        event.preventDefault();

        setError("");


        if (
            !token
        ) {

            setError(
                "El enlace de recuperación no contiene un token válido.",
            );

            return;

        }


        if (
            password.length <
            8
        ) {

            setError(
                "La contraseña debe tener al menos 8 caracteres.",
            );

            return;

        }


        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Las contraseñas no coinciden.",
            );

            return;

        }


        setLoading(
            true,
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/reset-password`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                token,

                                password,

                                confirmPassword,
                            }),
                    },
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    await obtenerMensajeError(
                        response,
                    ),
                );

            }


            setSuccess(
                true,
            );


            setPassword("");

            setConfirmPassword("");

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo restablecer la contraseña.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       PANEL VISUAL REUTILIZABLE
       ===================================================== */

    const visualPanel = (

        <aside
            className={
                styles.visualPanel
            }
        >

            <div
                className={
                    styles.visualBrand
                }
            >

                <div
                    className={
                        styles.visualLogo
                    }
                >
                    DR+
                </div>


                <div
                    className={
                        styles.visualBrandText
                    }
                >

                    <span
                        className={
                            styles.visualBrandName
                        }
                    >
                        DR+ Core
                    </span>

                    <span
                        className={
                            styles.visualBrandCaption
                        }
                    >
                        Infraestructura TI
                    </span>

                </div>

            </div>


            <div
                className={
                    styles.visualContent
                }
            >

                <span
                    className={
                        styles.visualEyebrow
                    }
                >
                    Seguridad de cuenta
                </span>


                <h2
                    className={
                        styles.visualTitle
                    }
                >
                    Protege el acceso a tu cuenta.
                </h2>


                <p
                    className={
                        styles.visualDescription
                    }
                >
                    Define una nueva contraseña para continuar
                    utilizando DR+ Core de forma segura.
                </p>

            </div>


            <div
                className={
                    styles.visualFooter
                }
            >

                <span>
                    Equipo de Infraestructura de TI
                </span>


                <span
                    className={
                        styles.statusOnline
                    }
                >

                    <span
                        className={
                            styles.statusDot
                        }
                    />

                    Proceso protegido

                </span>

            </div>

        </aside>

    );


    /* =====================================================
       TOKEN AUSENTE
       ===================================================== */

    if (
        !token
    ) {

        return (

            <main
                className={
                    styles.page
                }
            >

                <section
                    className={
                        styles.authShell
                    }
                >

                    {visualPanel}


                    <div
                        className={
                            styles.formPanel
                        }
                    >

                        <div
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.header
                                }
                            >

                                <div
                                    className={
                                        styles.brand
                                    }
                                >
                                    Enlace inválido
                                </div>


                                <h1
                                    className={
                                        styles.title
                                    }
                                >
                                    No podemos continuar
                                </h1>


                                <p
                                    className={
                                        styles.description
                                    }
                                >
                                    El enlace no contiene la información
                                    necesaria para restablecer tu contraseña.
                                </p>

                            </div>


                            <div
                                className={
                                    styles.error
                                }
                            >
                                Solicita un nuevo enlace de recuperación.
                            </div>


                            <div
                                className={
                                    styles.links
                                }
                            >

                                <Link
                                    className={
                                        styles.link
                                    }

                                    to="/recuperar-password"
                                >
                                    Solicitar nuevo enlace
                                </Link>


                                <Link
                                    className={
                                        styles.link
                                    }

                                    to="/login"
                                >
                                    ← Volver al inicio de sesión
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    /* =====================================================
       ÉXITO
       ===================================================== */

    if (
        success
    ) {

        return (

            <main
                className={
                    styles.page
                }
            >

                <section
                    className={
                        styles.authShell
                    }
                >

                    {visualPanel}


                    <div
                        className={
                            styles.formPanel
                        }
                    >

                        <div
                            className={
                                styles.card
                            }
                        >

                            <div
                                className={
                                    styles.successIcon
                                }
                            >
                                ✓
                            </div>


                            <div
                                className={[
                                    styles.header,
                                    styles.centerText,
                                ].join(
                                    " ",
                                )}
                            >

                                <div
                                    className={
                                        styles.brand
                                    }
                                >
                                    Cambio completado
                                </div>


                                <h1
                                    className={
                                        styles.title
                                    }
                                >
                                    Contraseña actualizada
                                </h1>


                                <p
                                    className={
                                        styles.description
                                    }
                                >
                                    Tus credenciales fueron actualizadas
                                    correctamente. Ya puedes volver a ingresar.
                                </p>

                            </div>


                            <Link
                                className={
                                    styles.primaryButton
                                }

                                style={{
                                    display:
                                        "grid",

                                    placeItems:
                                        "center",

                                    textDecoration:
                                        "none",
                                }}

                                to="/login"
                            >
                                Ir al inicio de sesión
                            </Link>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    /* =====================================================
       FORMULARIO
       ===================================================== */

    return (

        <main
            className={
                styles.page
            }
        >

            <section
                className={
                    styles.authShell
                }
            >

                {visualPanel}


                <div
                    className={
                        styles.formPanel
                    }
                >

                    <div
                        className={
                            styles.card
                        }
                    >

                        <div
                            className={
                                styles.header
                            }
                        >

                            <div
                                className={
                                    styles.brand
                                }
                            >
                                Nueva credencial
                            </div>


                            <h1
                                className={
                                    styles.title
                                }
                            >
                                Crea una nueva contraseña
                            </h1>


                            <p
                                className={
                                    styles.description
                                }
                            >
                                Ingresa y confirma la contraseña que utilizarás
                                en tus próximos accesos.
                            </p>

                        </div>


                        <form
                            onSubmit={
                                guardar
                            }
                        >

                            <label
                                className={
                                    styles.field
                                }
                            >

                                <span
                                    className={
                                        styles.fieldLabel
                                    }
                                >
                                    Nueva contraseña
                                </span>


                                <input
                                    className={
                                        styles.input
                                    }

                                    type="password"

                                    value={
                                        password
                                    }

                                    onChange={(
                                        event,
                                    ) =>
                                        setPassword(
                                            event
                                                .target
                                                .value,
                                        )
                                    }

                                    autoComplete="new-password"

                                    placeholder="Mínimo 8 caracteres"

                                    minLength={
                                        8
                                    }

                                    autoFocus

                                    required
                                />


                                <small
                                    className={
                                        styles.passwordHint
                                    }
                                >
                                    Debe contener al menos 8 caracteres.
                                </small>

                            </label>


                            <label
                                className={
                                    styles.field
                                }
                            >

                                <span
                                    className={
                                        styles.fieldLabel
                                    }
                                >
                                    Confirmar contraseña
                                </span>


                                <input
                                    className={
                                        styles.input
                                    }

                                    type="password"

                                    value={
                                        confirmPassword
                                    }

                                    onChange={(
                                        event,
                                    ) =>
                                        setConfirmPassword(
                                            event
                                                .target
                                                .value,
                                        )
                                    }

                                    autoComplete="new-password"

                                    placeholder="Repite la nueva contraseña"

                                    minLength={
                                        8
                                    }

                                    required
                                />

                            </label>


                            {error && (

                                <div
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        error
                                    }
                                </div>

                            )}


                            <button
                                type="submit"

                                className={
                                    styles.primaryButton
                                }

                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Actualizando credenciales..."
                                    : "Restablecer contraseña"}
                            </button>

                        </form>

                    </div>

                </div>

            </section>

        </main>

    );

}