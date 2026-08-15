import {
    useState,
} from "react";

import {
    Link,
    Navigate,
} from "react-router-dom";

import {
    useAuth,
} from "@/auth";

import styles from "@/pages/Auth/AuthPages.module.css";


export default function Login() {

    const {
        usuario,
        login,
    } =
        useAuth();


    const [
        nombreUsuario,
        setNombreUsuario,
    ] =
        useState("");


    const [
        password,
        setPassword,
    ] =
        useState("");


    const [
        error,
        setError,
    ] =
        useState("");


    const [
        loading,
        setLoading,
    ] =
        useState(
            false,
        );


    if (
        usuario
    ) {

        return (

            <Navigate
                to="/dashboard"
                replace
            />

        );

    }


    async function enviar(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {

        event.preventDefault();

        setError("");

        setLoading(
            true,
        );


        try {

            await login(
                nombreUsuario,
                password,
            );

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo iniciar sesión.",
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

                {/* =====================================
                    PANEL VISUAL
                    ===================================== */}

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
                            Plataforma interna
                        </span>


                        <h2
                            className={
                                styles.visualTitle
                            }
                        >
                            Gestión integral para de infraestructura tecnológica.
                        </h2>


                        <p
                            className={
                                styles.visualDescription
                            }
                        >
                            Centraliza el control de activos, accesos,
                            servicios y recursos tecnológicos desde
                            una única plataforma.
                        </p>


                        <div
                            className={
                                styles.featureGrid
                            }
                        >

                            <div
                                className={
                                    styles.featureItem
                                }
                            >

                                <span
                                    className={
                                        styles.featureIcon
                                    }
                                >
                                    ◫
                                </span>

                                <span
                                    className={
                                        styles.featureTitle
                                    }
                                >
                                    Inventario
                                </span>

                                <span
                                    className={
                                        styles.featureDescription
                                    }
                                >
                                    Control de activos
                                </span>

                            </div>


                            <div
                                className={
                                    styles.featureItem
                                }
                            >

                                <span
                                    className={
                                        styles.featureIcon
                                    }
                                >
                                    ◆
                                </span>

                                <span
                                    className={
                                        styles.featureTitle
                                    }
                                >
                                    Seguridad
                                </span>

                                <span
                                    className={
                                        styles.featureDescription
                                    }
                                >
                                    Acceso por roles
                                </span>

                            </div>


                            <div
                                className={
                                    styles.featureItem
                                }
                            >

                                <span
                                    className={
                                        styles.featureIcon
                                    }
                                >
                                    ◎
                                </span>

                                <span
                                    className={
                                        styles.featureTitle
                                    }
                                >
                                    Operaciones
                                </span>

                                <span
                                    className={
                                        styles.featureDescription
                                    }
                                >
                                    Gestión centralizada
                                </span>

                            </div>

                        </div>

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

                            Sistema disponible

                        </span>

                    </div>

                </aside>


                {/* =====================================
                    PANEL LOGIN
                    ===================================== */}

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
                                Acceso seguro
                            </div>


                            <h1
                                className={
                                    styles.title
                                }
                            >
                                Bienvenido
                            </h1>


                            <p
                                className={
                                    styles.description
                                }
                            >
                                Ingresa tus credenciales para continuar
                                a DR+ Core.
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
                                    Usuario
                                </span>


                                <input
                                    className={
                                        styles.input
                                    }

                                    value={
                                        nombreUsuario
                                    }

                                    onChange={(
                                        event,
                                    ) =>
                                        setNombreUsuario(
                                            event
                                                .target
                                                .value,
                                        )
                                    }

                                    placeholder="Ingresa tu usuario"

                                    autoComplete="username"

                                    autoFocus

                                    required
                                />

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
                                    Contraseña
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

                                    placeholder="Ingresa tu contraseña"

                                    autoComplete="current-password"

                                    required

                                    minLength={
                                        8
                                    }
                                />

                            </label>


                            <div
                                className={
                                    styles.forgotContainer
                                }
                            >

                                <Link
                                    className={
                                        styles.forgotLink
                                    }

                                    to="/recuperar-password"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>

                            </div>


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
                                    ? "Validando credenciales..."
                                    : "Ingresar a DR+ Core"}
                            </button>

                        </form>


                        <div
                            className={
                                styles.formFooter
                            }
                        >
                            Acceso exclusivo para usuarios autorizados.
                        </div>

                    </div>

                </div>

            </section>

        </main>

    );

}