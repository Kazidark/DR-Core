import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    DataGrid,
    type GridColDef,
    type GridRowId,
    type GridRowSelectionModel,
    type GridSortModel,
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

import styles from "./Impresoras.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type Impresora = {
    id: number;

    ipCompleta: string;

    nombre:
        string | null;

    area:
        string | null;

    ubicacion:
        string | null;

    observacion:
        string | null;

    areaAnterior:
        string | null;
};


type Area = {
    id: number;
    nombre: string;
    activo: boolean;
};


type ImpresoraForm = {
    ipCompleta: string;
    nombre: string;
    area: string;
    ubicacion: string;
    observacion: string;
    areaAnterior: string;
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
    ImpresoraForm = {

    ipCompleta: "",

    nombre: "",

    area: "",

    ubicacion: "",

    observacion: "",

    areaAnterior: "",
};


/* =========================================================
   MENSAJE DE ERROR DEL BACKEND
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

            return body.message.join(
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
         * El backend no devolvió JSON.
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

export default function Impresoras() {

    const {
        usuario,
    } =
        useAuth();


    const esAdministrador =
        usuario?.rol ===
        "Administrador";


    /* =====================================================
       ESTADOS
       ===================================================== */

    const [
        impresoras,
        setImpresoras,
    ] =
        useState<Impresora[]>(
            [],
        );


    const [
        areas,
        setAreas,
    ] =
        useState<Area[]>(
            [],
        );


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
        useState<ImpresoraForm>(
            initialForm,
        );


    const [
        sortModel,
        setSortModel,
    ] =
        useState<GridSortModel>(
            [],
        );


    /* =====================================================
       REGISTRO SELECCIONADO
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
                    impresoras.find(
                        (
                            item,
                        ) =>
                            item.id ===
                            selectedId,
                    ) ??
                    null
                );

            },
            [
                impresoras,
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
                    new Set<GridRowId>(
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
       COLUMNAS
       ===================================================== */

    const columns =
        useMemo<
            GridColDef<Impresora>[]
        >(
            () => [

                {
                    field:
                        "ipCompleta",

                    headerName:
                        "IP completa",

                    minWidth:
                        150,

                    flex:
                        0.9,

                    sortable:
                        true,
                },

                {
                    field:
                        "nombre",

                    headerName:
                        "Nombre",

                    minWidth:
                        190,

                    flex:
                        1.2,

                    sortable:
                        true,
                },

                {
                    field:
                        "area",

                    headerName:
                        "Área",

                    minWidth:
                        160,

                    flex:
                        1,

                    sortable:
                        true,
                },

                {
                    field:
                        "ubicacion",

                    headerName:
                        "Ubicación",

                    minWidth:
                        180,

                    flex:
                        1,

                    sortable:
                        true,
                },

                {
                    field:
                        "observacion",

                    headerName:
                        "Observación",

                    minWidth:
                        240,

                    flex:
                        1.5,

                    sortable:
                        true,
                },

                {
                    field:
                        "areaAnterior",

                    headerName:
                        "Área anterior",

                    minWidth:
                        170,

                    flex:
                        1,

                    sortable:
                        true,
                },

            ].map(
                (
                    column,
                ) => ({
                    ...column,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    renderCell: (
                        params,
                    ) => {

                        const value =
                            params.value;


                        return (

                            <span
                                className={
                                    styles.gridCellValue
                                }

                                title={
                                    String(
                                        value ??
                                        "",
                                    )
                                }
                            >
                                {String(
                                    value ??
                                    "—",
                                )}
                            </span>

                        );

                    },
                }),
            ),
            [],
        );


    /* =====================================================
       CARGAR IMPRESORAS
       ===================================================== */

    const cargarImpresoras =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/impresoras`,
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
                            Impresora[];


                    setImpresoras(
                        data,
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar las impresoras.",
                    );

                } finally {

                    setLoading(
                        false,
                    );

                }

            },
            [],
        );


    /* =====================================================
       CARGAR ÁREAS
       ===================================================== */

    const cargarAreas =
        useCallback(
            async () => {

                try {

                    const response =
                        await authFetch(
                            `${API_URL}/areas/activas`,
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
                            Area[];


                    setAreas(
                        data,
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar las áreas.",
                    );

                }

            },
            [],
        );


    /* =====================================================
       CARGA INICIAL
       ===================================================== */

    useEffect(
        () => {

            void cargarImpresoras();

            void cargarAreas();

        },
        [
            cargarImpresoras,
            cargarAreas,
        ],
    );


    /* =====================================================
       BUSCADOR
       ===================================================== */

    const filtradas =
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

                    return impresoras;

                }


                return impresoras.filter(
                    (
                        impresora,
                    ) => {

                        const valores = [
                            impresora.ipCompleta,
                            impresora.nombre,
                            impresora.area,
                            impresora.ubicacion,
                            impresora.observacion,
                            impresora.areaAnterior,
                        ];


                        return valores.some(
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
                impresoras,
                search,
            ],
        );


    /* =====================================================
       NUEVO
       ===================================================== */

    function nuevo() {

        if (
            !esAdministrador
        ) {

            return;

        }


        setEditingId(
            null,
        );


        setSelectedId(
            null,
        );


        setForm({
            ...initialForm,
        });


        setError("");


        setFormOpen(
            true,
        );

    }


    /* =====================================================
       EDITAR
       ===================================================== */

    function editarSeleccionado() {

        if (
            !esAdministrador
        ) {

            return;

        }


        if (
            !selectedItem
        ) {

            return;

        }


        setEditingId(
            selectedItem.id,
        );


        setForm({
            ipCompleta:
                selectedItem.ipCompleta,

            nombre:
                selectedItem.nombre ??
                "",

            area:
                selectedItem.area ??
                "",

            ubicacion:
                selectedItem.ubicacion ??
                "",

            observacion:
                selectedItem.observacion ??
                "",

            areaAnterior:
                selectedItem.areaAnterior ??
                "",
        });


        setError("");


        setFormOpen(
            true,
        );

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
            !esAdministrador
        ) {

            setError(
                "No tienes permisos para modificar impresoras.",
            );

            return;

        }


        setLoading(
            true,
        );


        setError("");


        try {

            const payload:
                Record<
                    string,
                    string
                > = {

                nombre:
                    form.nombre.trim(),

                area:
                    form.area.trim(),

                ubicacion:
                    form.ubicacion.trim(),

                observacion:
                    form.observacion.trim(),

                areaAnterior:
                    form.areaAnterior.trim(),
            };


            /*
             * La IP solamente se envía
             * durante la creación.
             */
            if (
                editingId ===
                null
            ) {

                payload.ipCompleta =
                    form.ipCompleta.trim();

            }


            const url =
                editingId ===
                    null
                    ? `${API_URL}/impresoras`
                    : `${API_URL}/impresoras/${editingId}`;


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

                throw new Error(
                    await obtenerMensajeError(
                        response,
                    ),
                );

            }


            cancelar();


            setSelectedId(
                null,
            );


            await cargarImpresoras();

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar la impresora.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       CAMBIAR SELECCIÓN
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


        const firstId =
            ids[0];


        setSelectedId(
            typeof firstId ===
                "number"
                ? firstId
                : Number(
                    firstId,
                ),
        );

    }


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <DRPage
            title="Impresoras"
            description="Gestión y control de impresoras de la infraestructura TI"
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
                        TOOLBAR
                        ===================================== */}

                    <section
                        className={
                            styles.toolbar
                        }
                    >

                        <div
                            className={
                                styles.searchWrapper
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

                                placeholder="Buscar por IP, nombre, área, ubicación..."
                            />

                        </div>


                        {esAdministrador && (

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
                                        selectedItem ===
                                            null ||
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
                                        styles.primaryButton
                                    }

                                    disabled={
                                        loading
                                    }

                                    onClick={
                                        nuevo
                                    }
                                >
                                    + Nueva impresora
                                </button>

                            </div>

                        )}

                    </section>


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

                    {formOpen &&
                        esAdministrador && (

                        <DRCard>

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
                                            {editingId ===
                                            null
                                                ? "Nueva impresora"
                                                : "Editar impresora"}
                                        </DRText>


                                        <DRText
                                            variant="bodySmall"
                                            color="secondary"
                                        >
                                            {editingId ===
                                            null
                                                ? "Registra una nueva impresora en DR+ Core."
                                                : "Actualiza la información del equipo seleccionado."}
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
                                        Cerrar
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

                                    {/* =============================
                                        IP
                                        ============================= */}

                                    <label>

                                        <span>
                                            IP completa
                                            <strong>
                                                *
                                            </strong>
                                        </span>


                                        <input
                                            required

                                            disabled={
                                                editingId !==
                                                null
                                            }

                                            value={
                                                form.ipCompleta
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        ipCompleta:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder="Ej. 10.6.96.10"
                                        />


                                        {editingId !==
                                            null && (

                                            <small>
                                                La IP es única y no puede modificarse.
                                            </small>

                                        )}

                                    </label>


                                    {/* =============================
                                        NOMBRE
                                        ============================= */}

                                    <label>

                                        <span>
                                            Nombre
                                        </span>


                                        <input
                                            value={
                                                form.nombre
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        nombre:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder="Nombre de la impresora"
                                        />

                                    </label>


                                    {/* =============================
                                        ÁREA
                                        ============================= */}

                                    <label>

                                        <span>
                                            Área
                                        </span>


                                        <select
                                            value={
                                                form.area
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        area:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="">
                                                Seleccionar área
                                            </option>


                                            {areas.map(
                                                (
                                                    area,
                                                ) => (

                                                    <option
                                                        key={
                                                            area.id
                                                        }

                                                        value={
                                                            area.nombre
                                                        }
                                                    >
                                                        {
                                                            area.nombre
                                                        }
                                                    </option>

                                                ),
                                            )}

                                        </select>

                                    </label>


                                    {/* =============================
                                        UBICACIÓN
                                        ============================= */}

                                    <label>

                                        <span>
                                            Ubicación
                                        </span>


                                        <input
                                            value={
                                                form.ubicacion
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        ubicacion:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder="Ubicación actual"
                                        />

                                    </label>


                                    {/* =============================
                                        ÁREA ANTERIOR
                                        ============================= */}

                                    <label>

                                        <span>
                                            Área anterior
                                        </span>


                                        <input
                                            value={
                                                form.areaAnterior
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        areaAnterior:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder="Área anterior, si aplica"
                                        />

                                    </label>


                                    {/* =============================
                                        OBSERVACIÓN
                                        ============================= */}

                                    <label
                                        className={
                                            styles.observationField
                                        }
                                    >

                                        <span>
                                            Observación
                                        </span>


                                        <textarea
                                            value={
                                                form.observacion
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        observacion:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }

                                            placeholder="Información adicional de la impresora"

                                            maxLength={
                                                500
                                            }
                                        />

                                    </label>


                                    {/* =============================
                                        ACCIONES
                                        ============================= */}

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
                                                : editingId ===
                                                    null
                                                    ? "Registrar impresora"
                                                    : "Guardar cambios"}
                                        </button>

                                    </div>

                                </form>

                            </DRCardContent>

                        </DRCard>

                    )}


                    {/* =====================================
                        TABLA
                        ===================================== */}

                    <section
                        className={
                            styles.tableSection
                        }
                    >

                        <div
                            className={
                                styles.tableHeader
                            }
                        >

                            <div>

                                <DRText
                                    as="h2"
                                    variant="h2"
                                    weight="bold"
                                >
                                    Impresoras registradas
                                </DRText>


                                <DRText
                                    variant="bodySmall"
                                    color="secondary"
                                >
                                    {
                                        filtradas.length
                                    }{" "}
                                    {filtradas.length ===
                                    1
                                        ? "impresora"
                                        : "impresoras"}
                                </DRText>

                            </div>


                            {!esAdministrador && (

                                <span
                                    className={
                                        styles.readOnlyBadge
                                    }
                                >
                                    Modo consulta
                                </span>

                            )}

                        </div>


                        <div
                            className={
                                styles.dataGridWrapper
                            }
                        >

                            <DataGrid
                                className={
                                    styles.dataGrid
                                }

                                rows={
                                    filtradas
                                }

                                columns={
                                    columns
                                }

                                loading={
                                    loading
                                }

                                rowHeight={
                                    56
                                }

                                columnHeaderHeight={
                                    56
                                }

                                rowSelectionModel={
                                    rowSelectionModel
                                }

                                onRowSelectionModelChange={
                                    actualizarSeleccion
                                }

                                disableMultipleRowSelection

                                sortModel={
                                    sortModel
                                }

                                onSortModelChange={
                                    setSortModel
                                }

                                sortingOrder={[
                                    "asc",
                                    "desc",
                                ]}

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

                                localeText={{
                                    noRowsLabel:
                                        search.trim()
                                            ? "No existen impresoras que coincidan con la búsqueda."
                                            : "No existen impresoras registradas.",

                                    footerRowSelected: (
                                        count,
                                    ) =>
                                        `${count} fila seleccionada`,
                                }}

                                getRowId={(
                                    row,
                                ) =>
                                    row.id
                                }
                            />

                        </div>

                    </section>

                </div>

            </DRContainer>

        </DRPage>

    );

}