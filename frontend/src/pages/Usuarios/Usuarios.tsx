import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Navigate,
} from "react-router-dom";

import {
    DataGrid,
    type GridColDef,
    type GridRowId,
    type GridRowSelectionModel,
} from "@mui/x-data-grid";

import {
    DRCard,
    DRCardContent,
    DRContainer,
    DRPage,
    DRText,
} from "@/design-system";

import {
    authFetch,
    useAuth,
} from "@/auth";

import styles from "./Usuarios.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type RolUsuario =
    | "Administrador"
    | "Consultor";


type Usuario = {
    id: number;

    nombres: string;

    apellidos: string;

    usuario: string;

    correo: string;

    rol:
        RolUsuario;

    activo: boolean;
};


type UsuarioForm = {
    nombres: string;

    apellidos: string;

    usuario: string;

    correo: string;

    rol:
        | RolUsuario
        | "";

    password: string;

    activo: boolean;
};


/* =========================================================
   API
   ========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


/* =========================================================
   FORMULARIO INICIAL
   ========================================================= */

const initialForm:
    UsuarioForm = {

    nombres: "",

    apellidos: "",

    usuario: "",

    correo: "",

    rol: "",

    password: "",

    activo: true,
};


/* =========================================================
   ERROR BACKEND
   ========================================================= */

async function obtenerMensajeError(
    response:
        Response,
): Promise<string> {

    try {

        const body =
            (await response.json()) as {
                message?:
                    | string
                    | string[];

                error?:
                    string;
            };


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
         * Si el backend no devuelve JSON,
         * usamos la información HTTP.
         */

    }


    return (
        `Error ${response.status}: ` +
        (
            response.statusText ||
            "No se pudo procesar la solicitud."
        )
    );
}


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function Usuarios() {

    const {
        usuario:
            usuarioSesion,
    } =
        useAuth();


    /* =====================================================
       ESTADOS
       ===================================================== */

    const [
        usuarios,
        setUsuarios,
    ] =
        useState<
            Usuario[]
        >([]);


    const [
        search,
        setSearch,
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
        formOpen,
        setFormOpen,
    ] =
        useState(
            false,
        );


    const [
        editingId,
        setEditingId,
    ] =
        useState<
            number | null
        >(
            null,
        );


    const [
        selectedId,
        setSelectedId,
    ] =
        useState<
            number | null
        >(
            null,
        );


    const [
        form,
        setForm,
    ] =
        useState<
            UsuarioForm
        >(
            initialForm,
        );


    /* =====================================================
       USUARIO SELECCIONADO
       ===================================================== */

    const selectedItem =
        useMemo(
            () => {

                if (
                    selectedId ===
                    null
                ) {

                    return null;

                }


                return (
                    usuarios.find(
                        (
                            usuario,
                        ) =>
                            usuario.id ===
                            selectedId,
                    ) ??
                    null
                );

            },
            [
                usuarios,
                selectedId,
            ],
        );


    /* =====================================================
       MODELO DE SELECCIÓN
       ===================================================== */

    const rowSelectionModel =
        useMemo<
            GridRowSelectionModel
        >(
            () => ({
                type:
                    "include",

                ids:
                    new Set<
                        GridRowId
                    >(
                        selectedId ===
                            null
                            ? []
                            : [
                                  selectedId,
                              ],
                    ),
            }),
            [
                selectedId,
            ],
        );


    /* =====================================================
       CARGAR USUARIOS
       ===================================================== */

    const cargarUsuarios =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/usuarios`,
                        );


                    if (
                        !response.ok
                    ) {

                        const message =
                            await obtenerMensajeError(
                                response,
                            );


                        throw new Error(
                            message ||
                                "No se pudieron cargar los usuarios.",
                        );

                    }


                    const data =
                        (await response.json()) as
                            Usuario[];


                    setUsuarios(
                        data,
                    );


                    /*
                     * Si había una fila seleccionada
                     * validamos que siga existiendo.
                     */
                    setSelectedId(
                        (
                            currentId,
                        ) => {

                            if (
                                currentId ===
                                null
                            ) {

                                return null;

                            }


                            const existe =
                                data.some(
                                    (
                                        usuario,
                                    ) =>
                                        usuario.id ===
                                        currentId,
                                );


                            return existe
                                ? currentId
                                : null;

                        },
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof
                            Error
                            ? err.message
                            : "Error inesperado.",
                    );

                } finally {

                    setLoading(
                        false,
                    );

                }

            },
            [],
        );


    useEffect(() => {

        if (
            usuarioSesion?.rol ===
            "Administrador"
        ) {

            void cargarUsuarios();

        }

    }, [
        cargarUsuarios,
        usuarioSesion?.rol,
    ]);


    /* =====================================================
       BUSCADOR
       ===================================================== */

    const filtrados =
        useMemo(
            () => {

                const texto =
                    search
                        .trim()
                        .toLocaleLowerCase(
                            "es",
                        );


                if (
                    !texto
                ) {

                    return usuarios;

                }


                return usuarios.filter(
                    (
                        usuario,
                    ) => {

                        return Object
                            .values(
                                usuario,
                            )
                            .some(
                                (
                                    value,
                                ) =>
                                    String(
                                        value ??
                                            "",
                                    )
                                        .toLocaleLowerCase(
                                            "es",
                                        )
                                        .includes(
                                            texto,
                                        ),
                            );

                    },
                );

            },
            [
                usuarios,
                search,
            ],
        );


    /* =====================================================
       MÉTRICAS
       ===================================================== */

    const metricas =
        useMemo(
            () => {

                const administradores =
                    usuarios.filter(
                        (
                            usuario,
                        ) =>
                            usuario.rol ===
                            "Administrador",
                    ).length;


                const consultores =
                    usuarios.filter(
                        (
                            usuario,
                        ) =>
                            usuario.rol ===
                            "Consultor",
                    ).length;


                const activos =
                    usuarios.filter(
                        (
                            usuario,
                        ) =>
                            usuario.activo,
                    ).length;


                return {
                    total:
                        usuarios.length,

                    administradores,

                    consultores,

                    activos,
                };

            },
            [
                usuarios,
            ],
        );


    /* =====================================================
       NUEVO
       ===================================================== */

    function nuevo() {

        setSelectedId(
            null,
        );


        setEditingId(
            null,
        );


        setForm({
            ...initialForm,
        });


        setError("");


        setFormOpen(
            true,
        );


        window.scrollTo({
            top: 0,
            behavior:
                "smooth",
        });

    }


    /* =====================================================
       EDITAR SELECCIONADO
       ===================================================== */

    function editarSeleccionado() {

        if (
            !selectedItem
        ) {

            return;

        }


        setEditingId(
            selectedItem.id,
        );


        setForm({
            nombres:
                selectedItem.nombres,

            apellidos:
                selectedItem.apellidos,

            usuario:
                selectedItem.usuario,

            correo:
                selectedItem.correo,

            rol:
                selectedItem.rol,

            password:
                "",

            activo:
                selectedItem.activo,
        });


        setError("");


        setFormOpen(
            true,
        );


        window.scrollTo({
            top: 0,
            behavior:
                "smooth",
        });

    }


    /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        setEditingId(
            null,
        );


        setFormOpen(
            false,
        );


        setForm({
            ...initialForm,
        });

    }


    /* =====================================================
       GUARDAR
       ===================================================== */

    async function guardar(
        event:
            React.FormEvent<
                HTMLFormElement
            >,
    ) {

        event.preventDefault();


        if (
            usuarioSesion?.rol !==
            "Administrador"
        ) {

            setError(
                "No tienes permisos para administrar usuarios.",
            );

            return;

        }


        setLoading(
            true,
        );


        setError("");


        try {

            if (
                !form.rol
            ) {

                throw new Error(
                    "Debes seleccionar un rol.",
                );

            }


            const payload:
                Record<
                    string,
                    unknown
                > = {

                nombres:
                    form.nombres.trim(),

                apellidos:
                    form.apellidos.trim(),

                usuario:
                    form.usuario.trim(),

                correo:
                    form.correo.trim(),

                rol:
                    form.rol,

                activo:
                    form.activo,
            };


            /*
             * Al editar, la contraseña puede
             * quedar vacía para conservar
             * la contraseña actual.
             */
            if (
                form.password.trim()
            ) {

                payload.password =
                    form.password;

            }


            /*
             * La contraseña sí es obligatoria
             * cuando se crea una cuenta.
             */
            if (
                editingId ===
                    null &&
                !form.password.trim()
            ) {

                throw new Error(
                    "La contraseña es obligatoria para crear un usuario.",
                );

            }


            /*
             * Los usuarios nuevos nacen
             * activos en el backend.
             */
            if (
                editingId ===
                null
            ) {

                delete payload.activo;

            }


            const url =
                editingId ===
                    null
                    ? `${API_URL}/usuarios`
                    : `${API_URL}/usuarios/${editingId}`;


            const response =
                await authFetch(
                    url,
                    {
                        method:
                            editingId ===
                            null
                                ? "POST"
                                : "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                payload,
                            ),
                    },
                );


            if (
                !response.ok
            ) {

                const message =
                    await obtenerMensajeError(
                        response,
                    );


                throw new Error(
                    message ||
                        "No se pudo guardar el usuario.",
                );

            }


            cancelar();


            await cargarUsuarios();

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Error inesperado.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       ELIMINAR SELECCIONADO
       ===================================================== */

    async function eliminarSeleccionado() {

        if (
            !selectedItem
        ) {

            return;

        }


        if (
            usuarioSesion?.rol !==
            "Administrador"
        ) {

            setError(
                "No tienes permisos para eliminar usuarios.",
            );

            return;

        }


        const confirmed =
            window.confirm(
                `¿Deseas eliminar al usuario "${selectedItem.usuario}"?`,
            );


        if (
            !confirmed
        ) {

            return;

        }


        setLoading(
            true,
        );


        setError("");


        try {

            const response =
                await authFetch(
                    `${API_URL}/usuarios/${selectedItem.id}`,
                    {
                        method:
                            "DELETE",
                    },
                );


            if (
                !response.ok
            ) {

                const message =
                    await obtenerMensajeError(
                        response,
                    );


                throw new Error(
                    message ||
                        "No se pudo eliminar el usuario.",
                );

            }


            setSelectedId(
                null,
            );


            if (
                editingId ===
                selectedItem.id
            ) {

                cancelar();

            }


            await cargarUsuarios();

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Error inesperado.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       SELECCIÓN DATAGRID
       ===================================================== */

    function actualizarSeleccion(
        model:
            GridRowSelectionModel,
    ) {

        const ids =
            Array.from(
                model.ids,
            );


        if (
            ids.length ===
            0
        ) {

            setSelectedId(
                null,
            );

            return;

        }


        const rawId =
            ids[0];


        const numericId =
            typeof rawId ===
            "number"
                ? rawId
                : Number(
                      rawId,
                  );


        if (
            Number.isNaN(
                numericId,
            )
        ) {

            setSelectedId(
                null,
            );

            return;

        }


        setSelectedId(
            numericId,
        );

    }


    /* =====================================================
       COLUMNAS DATAGRID
       ===================================================== */

    const columns =
        useMemo<
            GridColDef<Usuario>[]
        >(
            () => [

                {
                    field:
                        "id",

                    headerName:
                        "ID",

                    minWidth:
                        80,

                    width:
                        80,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,
                },


                {
                    field:
                        "nombres",

                    headerName:
                        "Nombres",

                    minWidth:
                        180,

                    flex:
                        1,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                                className={
                                    styles.gridCellValue
                                }

                                title={
                                    params.value
                                }
                            >
                                {
                                    params.value
                                }
                            </span>

                        ),
                },


                {
                    field:
                        "apellidos",

                    headerName:
                        "Apellidos",

                    minWidth:
                        180,

                    flex:
                        1,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                                className={
                                    styles.gridCellValue
                                }

                                title={
                                    params.value
                                }
                            >
                                {
                                    params.value
                                }
                            </span>

                        ),
                },


                {
                    field:
                        "usuario",

                    headerName:
                        "Usuario",

                    minWidth:
                        150,

                    flex:
                        0.9,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                className={
                    styles.gridCellValue
                }

                title={
                    String(
                        params.value ??
                            "",
                    )
                }
            >
                {String(
                    params.value ??
                        "—",
                )}
            </span>

                        ),
                },


                {
                    field:
                        "correo",

                    headerName:
                        "Correo",

                    minWidth:
                        240,

                    flex:
                        1.4,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                                className={
                                    styles.gridCellValue
                                }

                                title={
                                    params.value
                                }
                            >
                                {
                                    params.value
                                }
                            </span>

                        ),
                },


                {
                    field:
                        "rol",

                    headerName:
                        "Rol",

                    minWidth:
                        165,

                    flex:
                        0.9,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                                className={
                                    params.value ===
                                    "Administrador"
                                        ? styles.roleAdmin
                                        : styles.roleConsultant
                                }
                            >
                                {
                                    params.value
                                }
                            </span>

                        ),
                },


                {
                    field:
                        "activo",

                    headerName:
                        "Estado",

                    minWidth:
                        135,

                    flex:
                        0.7,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    renderCell:
                        (
                            params,
                        ) => (

                            <span
                                className={
                                    params.value
                                        ? styles.statusActive
                                        : styles.statusInactive
                                }
                            >

                                <span
                                    className={
                                        styles.statusDot
                                    }
                                />

                                {params.value
                                    ? "Activo"
                                    : "Inactivo"}

                            </span>

                        ),
                },

            ],
            [],
        );


    /* =====================================================
       PROTECCIÓN DEL MÓDULO
       ===================================================== */

    if (
        usuarioSesion?.rol !==
        "Administrador"
    ) {

        return (

            <Navigate
                to="/inventario"
                replace
            />

        );

    }


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <DRPage
            title="Usuarios"
            description="Administración de usuarios del sistema"
            hideHeader
        >

            <DRContainer
                fluid
                padding="none"
            >

                <div
                    className={
                        styles.page
                    }
                >

                    {/* =====================================
                        RESUMEN
                        ===================================== */}

                    <section
                        className={
                            styles.summaryGrid
                        }
                    >

                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryTotal,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Total de usuarios
                            </span>

                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {
                                    metricas.total
                                }
                            </strong>

                            <span
                                className={
                                    styles.summaryDescription
                                }
                            >
                                Cuentas registradas
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryAdmin,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Administradores
                            </span>

                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {
                                    metricas.administradores
                                }
                            </strong>

                            <span
                                className={
                                    styles.summaryDescription
                                }
                            >
                                Acceso completo al Core
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryConsultant,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Consultores
                            </span>

                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {
                                    metricas.consultores
                                }
                            </strong>

                            <span
                                className={
                                    styles.summaryDescription
                                }
                            >
                                Acceso de consulta
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryActive,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Usuarios activos
                            </span>

                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {
                                    metricas.activos
                                }
                            </strong>

                            <span
                                className={
                                    styles.summaryDescription
                                }
                            >
                                Cuentas habilitadas
                            </span>

                        </article>

                    </section>


                    {/* =====================================
                        TOOLBAR
                        ===================================== */}

                    <div
                        className={
                            styles.toolbar
                        }
                    >

                        <div
                            className={
                                styles.searchContainer
                            }
                        >

                            <input
                                className={
                                    styles.search
                                }

                                value={
                                    search
                                }

                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }

                                placeholder="Buscar en todos los campos de usuarios..."
                            />

                        </div>


                        <div
                            className={
                                styles.toolbarActions
                            }
                        >

                            <button
                                type="button"

                                className={
                                    styles.secondaryButton
                                }

                                disabled={
                                    !selectedItem ||
                                    loading
                                }

                                onClick={
                                    editarSeleccionado
                                }
                            >
                                Editar seleccionado
                            </button>


                            <button
                                type="button"

                                className={
                                    styles.deleteButton
                                }

                                disabled={
                                    !selectedItem ||
                                    loading
                                }

                                onClick={() =>
                                    void eliminarSeleccionado()
                                }
                            >
                                Eliminar
                            </button>


                            <button
                                type="button"

                                className={
                                    styles.primaryButton
                                }

                                disabled={
                                    loading
                                }

                                onClick={
                                    nuevo
                                }
                            >
                                + Nuevo usuario
                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        ERROR
                        ===================================== */}

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


                    {/* =====================================
                        FORMULARIO
                        ===================================== */}

                    {formOpen && (

                        <DRCard
                            className={
                                styles.formCard
                            }
                        >

                            <DRCardContent>

                                <div
                                    className={
                                        styles.formHeader
                                    }
                                >

                                    <div>

                                        <DRText
                                            as="h2"
                                            variant="h2"
                                            weight="bold"
                                        >
                                            {editingId !==
                                            null
                                                ? "Editar usuario"
                                                : "Nuevo usuario"}
                                        </DRText>


                                        <DRText
                                            variant="bodySmall"
                                            color="secondary"
                                        >
                                            {editingId !==
                                            null
                                                ? "Actualiza los datos y permisos de la cuenta seleccionada."
                                                : "Registra una nueva cuenta de acceso a DR+ Core."}
                                        </DRText>

                                    </div>


                                    <button
                                        type="button"

                                        className={
                                            styles.closeButton
                                        }

                                        onClick={
                                            cancelar
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>


                                <form
                                    className={
                                        styles.form
                                    }

                                    onSubmit={
                                        guardar
                                    }
                                >

                                    <label>

                                        <span>
                                            Nombres
                                        </span>

                                        <input
                                            required

                                            autoComplete="given-name"

                                            value={
                                                form.nombres
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        nombres:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Apellidos
                                        </span>

                                        <input
                                            required

                                            autoComplete="family-name"

                                            value={
                                                form.apellidos
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        apellidos:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Usuario
                                        </span>

                                        <input
                                            required

                                            autoComplete="username"

                                            value={
                                                form.usuario
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        usuario:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Correo
                                        </span>

                                        <input
                                            type="email"

                                            required

                                            autoComplete="email"

                                            value={
                                                form.correo
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        correo:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Rol
                                        </span>

                                        <select
                                            required

                                            value={
                                                form.rol
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        rol:
                                                            event
                                                                .target
                                                                .value as
                                                                | "Administrador"
                                                                | "Consultor"
                                                                | "",
                                                    }),
                                                )
                                            }
                                        >

                                            <option
                                                value=""
                                            >
                                                Seleccionar
                                            </option>

                                            <option
                                                value="Administrador"
                                            >
                                                Administrador
                                            </option>

                                            <option
                                                value="Consultor"
                                            >
                                                Consultor
                                            </option>

                                        </select>

                                    </label>


                                    <label>

                                        <span>
                                            {editingId !==
                                            null
                                                ? "Nueva contraseña"
                                                : "Contraseña"}
                                        </span>

                                        <input
                                            type="password"

                                            required={
                                                editingId ===
                                                null
                                            }

                                            minLength={
                                                8
                                            }

                                            autoComplete={
                                                editingId ===
                                                null
                                                    ? "new-password"
                                                    : "off"
                                            }

                                            value={
                                                form.password
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        password:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder={
                                                editingId !==
                                                null
                                                    ? "Dejar vacío para mantener la contraseña actual"
                                                    : "Mínimo 8 caracteres"
                                            }
                                        />

                                        {editingId !==
                                            null && (

                                            <small
                                                className={
                                                    styles.fieldHelp
                                                }
                                            >
                                                Déjalo vacío si no deseas cambiar la contraseña.
                                            </small>

                                        )}

                                    </label>


                                    {editingId !==
                                        null && (

                                        <label>

                                            <span>
                                                Estado
                                            </span>

                                            <select
                                                value={
                                                    form.activo
                                                        ? "true"
                                                        : "false"
                                                }

                                                onChange={(
                                                    event,
                                                ) =>
                                                    setForm(
                                                        (
                                                            current,
                                                        ) => ({
                                                            ...current,

                                                            activo:
                                                                event
                                                                    .target
                                                                    .value ===
                                                                "true",
                                                        }),
                                                    )
                                                }
                                            >

                                                <option
                                                    value="true"
                                                >
                                                    Activo
                                                </option>

                                                <option
                                                    value="false"
                                                >
                                                    Inactivo
                                                </option>

                                            </select>

                                        </label>

                                    )}


                                    <div
                                        className={
                                            styles.formActions
                                        }
                                    >

                                        <button
                                            type="button"

                                            className={
                                                styles.secondaryButton
                                            }

                                            onClick={
                                                cancelar
                                            }
                                        >
                                            Cancelar
                                        </button>


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
                                                ? "Guardando..."
                                                : editingId !==
                                                  null
                                                ? "Guardar cambios"
                                                : "Crear usuario"}
                                        </button>

                                    </div>

                                </form>

                            </DRCardContent>

                        </DRCard>

                    )}


                    {/* =====================================
                        DATAGRID
                        ===================================== */}

                    {/* =====================================
    DATAGRID
    ===================================== */}

<section
    className={
        styles.tableSection
    }
>

    {/* =================================
        CABECERA DE TABLA
        ================================= */}

    <div
        className={
            styles.tableHeader
        }
    >

        <div
            className={
                styles.tableTitleGroup
            }
        >

            <DRText
                as="h2"
                variant="h2"
                weight="bold"
            >
                Usuarios registrados
            </DRText>


            <DRText
                variant="bodySmall"
                color="secondary"
            >
                {
                    filtrados.length
                }{" "}
                {filtrados.length ===
                1
                    ? "usuario"
                    : "usuarios"}
            </DRText>

        </div>


        {selectedItem && (

            <div
                className={
                    styles.selectedInfo
                }
            >

                <span>
                    Seleccionado
                </span>

                <strong>
                    {
                        selectedItem.nombres
                    }{" "}
                    {
                        selectedItem.apellidos
                    }
                </strong>

            </div>

        )}

    </div>


    {/* =================================
        VIEWPORT DEL GRID
        ================================= */}

    <div
        className={
            styles.dataGridViewport
        }
    >

        <DataGrid
            className={
                styles.dataGrid
            }

            rows={
                filtrados
            }

            columns={
                columns
            }

            loading={
                loading
            }

            rowSelectionModel={
                rowSelectionModel
            }

            onRowSelectionModelChange={
                actualizarSeleccion
            }

            disableMultipleRowSelection

            pageSizeOptions={[
                25,
                50,
                100,
            ]}

            initialState={{
                pagination: {
                    paginationModel: {
                        page:
                            0,

                        pageSize:
                            25,
                    },
                },
            }}

            rowHeight={
                52
            }

            columnHeaderHeight={
                48
            }

            disableColumnFilter

            disableColumnSelector

            disableDensitySelector

            getRowClassName={(
                params,
            ) =>
                params.id ===
                selectedId
                    ? styles.selectedRow
                    : ""
            }

            localeText={{
                noRowsLabel:
                    "No existen usuarios.",

                noResultsOverlayLabel:
                    "No se encontraron usuarios.",

                footerRowSelected:
                    (
                        count,
                    ) =>
                        `${count} seleccionado`,

                paginationRowsPerPage:
                    "Filas por página:",
            }}
        />

    </div>

</section>

                </div>

            </DRContainer>

        </DRPage>

    );

}