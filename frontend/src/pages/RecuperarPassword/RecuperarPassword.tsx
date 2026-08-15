import {
    useState,
} from "react";

import {
    Link,
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
         * Respuesta no JSON.
         */

    }


    return (
        "No se pudo procesar la solicitud."
    );

}


export default function RecuperarPassword() {

    const [
        correo,
        setCorreo,
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
        mensaje,
        setMensaje,
    ] =
        useState("");


    async function enviar(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {

        event.preventDefault();

        setError("");

        setMensaje("");

        setLoading(
            true,
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/forgot-password`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                correo:
                                    correo.trim(),
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


            const data =
                (await response.json()) as
                    ApiResponse;


            setMensaje(
                typeof data.message ===
                    "string"
                    ? data.message
                    : "Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.",
            );


            setCorreo("");

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo enviar la solicitud.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


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
                            Recuperación segura
                        </span>


                        <h2
                            className={
                                styles.visualTitle
                            }
                        >
                            Recupera el acceso de forma segura.
                        </h2>


                        <p
                            className={
                                styles.visualDescription
                            }
                        >
                            DR+ Core enviará un enlace temporal al
                            correo asociado a tu cuenta para validar
                            tu identidad antes de permitir el cambio.
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

                            Canal seguro

                        </span>

                    </div>

                </aside>


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

                        {mensaje ? (

                            <>

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
                                        Solicitud enviada
                                    </div>


                                    <h1
                                        className={
                                            styles.title
                                        }
                                    >
                                        Revisa tu correo
                                    </h1>


                                    <p
                                        className={
                                            styles.description
                                        }
                                    >
                                        Hemos procesado tu solicitud
                                        de recuperación.
                                    </p>

                                </div>


                                <div
                                    className={
                                        styles.success
                                    }
                                >
                                    {
                                        mensaje
                                    }
                                </div>


                                <div
                                    className={
                                        styles.info
                                    }
                                >
                                    El enlace estará disponible durante
                                    15 minutos y solo podrá utilizarse
                                    una vez.
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

                                        to="/login"
                                    >
                                        ← Volver al inicio de sesión
                                    </Link>

                                </div>

                            </>

                        ) : (

                            <>

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
                                        Recuperar acceso
                                    </div>


                                    <h1
                                        className={
                                            styles.title
                                        }
                                    >
                                        Recuperar contraseña
                                    </h1>


                                    <p
                                        className={
                                            styles.description
                                        }
                                    >
                                        Ingresa el correo asociado a tu
                                        cuenta y te enviaremos las instrucciones.
                                    </p>

                                </div>


                                <form
                                    onSubmit={
                                        enviar
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
                                            Correo registrado
                                        </span>


                                        <input
                                            className={
                                                styles.input
                                            }

                                            type="email"

                                            value={
                                                correo
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setCorreo(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }

                                            autoComplete="email"

                                            placeholder="usuario@empresa.com"

                                            autoFocus

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
                                            ? "Enviando instrucciones..."
                                            : "Enviar enlace de recuperación"}
                                    </button>


                                    <div
                                        className={
                                            styles.links
                                        }
                                    >

                                        <Link
                                            className={
                                                styles.link
                                            }

                                            to="/login"
                                        >
                                            ← Volver al inicio de sesión
                                        </Link>

                                    </div>

                                </form>

                            </>

                        )}

                    </div>

                </div>

            </section>

        </main>

    );

}