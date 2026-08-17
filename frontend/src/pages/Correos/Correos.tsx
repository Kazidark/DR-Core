import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
    type GridRowId,
    type GridRowSelectionModel,
    type GridSortModel,
} from "@mui/x-data-grid";

import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";

import {
    DRCard,
    DRCardContent,
    DRContainer,
    DRPage,
    DRText,
} from "@/design-system";

import {
    authFetch,
} from "@/auth";

import styles from "./Correos.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type EstadoCorreo =
    | "Usado"
    | "Reserva";


type CorreoItem = {
    id: number;

    nombre:
        string | null;

    apellido:
        string | null;

    cuentaCorreo:
        string | null;

    estado:
        EstadoCorreo;

    fechaSolicitada:
        string | null;

    correoCreado:
        string | null;

    solicitante:
        string | null;

    fechaCreacion:
        string | null;

    observacion:
        string | null;

    usuarioAnterior:
        string | null;
};


type ExcelFeedbackType =
    | "success"
    | "warning"
    | "error";


type ExcelFeedback = {
    type:
        ExcelFeedbackType;

    message:
        string;

    details?:
        string[];
} | null;


/* =========================================================
   API
   ========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


/* =========================================================
   COLUMNAS EXCEL
   ========================================================= */

const excelColumns = [
    {
        key:
            "id",

        label:
            "ID",
    },
    {
        key:
            "nombre",

        label:
            "Nombre",
    },
    {
        key:
            "apellido",

        label:
            "Apellido",
    },
    {
        key:
            "cuentaCorreo",

        label:
            "Cuenta de correo",
    },
    {
        key:
            "estado",

        label:
            "Estado",
    },
    {
        key:
            "fechaSolicitada",

        label:
            "Fecha solicitada",
    },
    {
        key:
            "correoCreado",

        label:
            "Correo creado",
    },
    {
        key:
            "solicitante",

        label:
            "Solicitante",
    },
    {
        key:
            "fechaCreacion",

        label:
            "Fecha de creación",
    },
    {
        key:
            "observacion",

        label:
            "Observación",
    },
    {
        key:
            "usuarioAnterior",

        label:
            "Usuario Anterior",
    },
] as const;


/* =========================================================
   UTILIDADES
   ========================================================= */

const collator =
    new Intl.Collator(
        "es",
        {
            numeric:
                true,

            sensitivity:
                "base",
        },
    );


function compararValores(
    valueA:
        unknown,

    valueB:
        unknown,
): number {

    const textA =
        String(
            valueA ?? "",
        ).trim();


    const textB =
        String(
            valueB ?? "",
        ).trim();


    if (
        textA === "" &&
        textB === ""
    ) {

        return 0;

    }


    if (
        textA === ""
    ) {

        return 1;

    }


    if (
        textB === ""
    ) {

        return -1;

    }


    return collator.compare(
        textA,
        textB,
    );

}


function normalizar(
    value:
        unknown,
) {

    return String(
        value ?? "",
    )
        .trim()
        .toLocaleLowerCase(
            "es",
        );

}


function validarCorreo(
    value:
        string,
) {

    if (
        !value.trim()
    ) {

        return true;

    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            value.trim(),
        );

}


function formatearFecha(
    value:
        string | null,
) {

    if (
        !value
    ) {

        return "—";

    }


    const [
        year,
        month,
        day,
    ] =
        value.split(
            "-",
        );


    if (
        !year ||
        !month ||
        !day
    ) {

        return value;

    }


    return `${day}/${month}/${year}`;

}


async function obtenerMensajeError(
    response:
        Response,
): Promise<string> {

    try {

        const body =
            (await response.json()) as {
                message?:
                    string |
                    string[];

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
         * Respaldo para respuesta no JSON.
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

export default function Correos() {

    const [
        items,
        setItems,
    ] =
        useState<
            CorreoItem[]
        >([]);


    const [
        search,
        setSearch,
    ] =
        useState("");


    const [
        sortModel,
        setSortModel,
    ] =
        useState<
            GridSortModel
        >([]);


    const [
        loading,
        setLoading,
    ] =
        useState(
            false,
        );


    const [
        importing,
        setImporting,
    ] =
        useState(
            false,
        );


    const [
        changingStatusId,
        setChangingStatusId,
    ] =
        useState<
            number | null
        >(
            null,
        );


    const [
        error,
        setError,
    ] =
        useState("");


    const [
        excelFeedback,
        setExcelFeedback,
    ] =
        useState<
            ExcelFeedback
        >(
            null,
        );


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
        useState({
            nombre:
                "",

            apellido:
                "",

            cuentaCorreo:
                "",

            estado:
                "Reserva" as EstadoCorreo,

            fechaSolicitada:
                "",

            correoCreado:
                "",

            solicitante:
                "",

            fechaCreacion:
                "",

            observacion:
                "",

            usuarioAnterior:
                "",
        });


    const fileInputRef =
        useRef<
            HTMLInputElement |
            null
        >(
            null,
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
                    items.find(
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
                items,
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
       CAMBIAR ESTADO
       ===================================================== */

    const cambiarEstado =
        useCallback(
            async (
                item:
                    CorreoItem,
            ) => {

                if (
                    changingStatusId !==
                    null
                ) {

                    return;

                }


                const nuevoEstado:
                    EstadoCorreo =
                        item.estado ===
                        "Usado"
                            ? "Reserva"
                            : "Usado";


                setChangingStatusId(
                    item.id,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/correos/${item.id}/estado`,
                            {
                                method:
                                    "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify({
                                        estado:
                                            nuevoEstado,
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


                    setItems(
                        (
                            current,
                        ) =>
                            current.map(
                                (
                                    registro,
                                ) =>
                                    registro.id ===
                                    item.id
                                        ? {
                                            ...registro,

                                            estado:
                                                nuevoEstado,
                                        }
                                        : registro,
                            ),
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof
                            Error
                            ? err.message
                            : "No se pudo cambiar el estado.",
                    );

                } finally {

                    setChangingStatusId(
                        null,
                    );

                }

            },
            [
                changingStatusId,
            ],
        );


    /* =====================================================
       COLUMNAS DATAGRID
       ===================================================== */

    const gridColumns =
        useMemo<
            GridColDef[]
        >(
            () => [
                {
                    field:
                        "id",

                    headerName:
                        "ID",

                    width:
                        78,

                    minWidth:
                        78,

                    sortable:
                        true,
                },

                {
                    field:
                        "nombre",

                    headerName:
                        "Nombre",

                    minWidth:
                        150,

                    flex:
                        0.9,

                    sortable:
                        true,
                },

                {
                    field:
                        "apellido",

                    headerName:
                        "Apellido",

                    minWidth:
                        150,

                    flex:
                        0.9,

                    sortable:
                        true,
                },

                {
                    field:
                        "cuentaCorreo",

                    headerName:
                        "Cuenta de correo",

                    minWidth:
                        240,

                    flex:
                        1.4,

                    sortable:
                        true,
                },

                {
                    field:
                        "estado",

                    headerName:
                        "Estado",

                    minWidth:
                        145,

                    width:
                        145,

                    sortable:
                        true,

                    renderCell:
                        (
                            params:
                                GridRenderCellParams,
                        ) => {

                            const row =
                                params.row as
                                    CorreoItem;


                            const cambiando =
                                changingStatusId ===
                                row.id;


                            return (

                                <button
                                    type="button"

                                    className={
                                        row.estado ===
                                        "Usado"
                                            ? styles.statusUsed
                                            : styles.statusReserve
                                    }

                                    disabled={
                                        cambiando
                                    }

                                    title={
                                        row.estado ===
                                        "Usado"
                                            ? "Cambiar a Reserva"
                                            : "Cambiar a Usado"
                                    }

                                    onClick={(
                                        event,
                                    ) => {

                                        event.stopPropagation();

                                        void cambiarEstado(
                                            row,
                                        );

                                    }}
                                >
                                    {cambiando
                                        ? "..."
                                        : row.estado}
                                </button>

                            );

                        },
                },

                {
                    field:
                        "fechaSolicitada",

                    headerName:
                        "Fecha solicitada",

                    minWidth:
                        155,

                    width:
                        155,

                    sortable:
                        true,

                    renderCell:
                        (
                            params:
                                GridRenderCellParams,
                        ) => (

                            <span
                                className={
                                    styles.gridCellValue
                                }
                            >
                                {
                                    formatearFecha(
                                        params.value ??
                                        null,
                                    )
                                }
                            </span>

                        ),
                },

                {
                    field:
                        "correoCreado",

                    headerName:
                        "Correo creado",

                    minWidth:
                        240,

                    flex:
                        1.4,

                    sortable:
                        true,
                },

                {
                    field:
                        "solicitante",

                    headerName:
                        "Solicitante",

                    minWidth:
                        190,

                    flex:
                        1,

                    sortable:
                        true,
                },

                {
                    field:
                        "fechaCreacion",

                    headerName:
                        "Fecha de creación",

                    minWidth:
                        160,

                    width:
                        160,

                    sortable:
                        true,

                    renderCell:
                        (
                            params:
                                GridRenderCellParams,
                        ) => (

                            <span
                                className={
                                    styles.gridCellValue
                                }
                            >
                                {
                                    formatearFecha(
                                        params.value ??
                                        null,
                                    )
                                }
                            </span>

                        ),
                },

                {
                    field:
                        "observacion",

                    headerName:
                        "Observación",

                    minWidth:
                        260,

                    flex:
                        1.5,

                    sortable:
                        true,
                },

                {
                    field:
                        "usuarioAnterior",

                    headerName:
                        "Usuario Anterior",

                    minWidth:
                        210,

                    flex:
                        1.1,

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

                    sortComparator:
                        (
                            valueA,
                            valueB,
                        ) =>
                            compararValores(
                                valueA,
                                valueB,
                            ),

                    renderCell:
                        column.renderCell ??
                        (
                            (
                                params:
                                    GridRenderCellParams,
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
                                    {
                                        String(
                                            params.value ??
                                            "—",
                                        )
                                    }
                                </span>

                            )
                        ),
                }),
            ),
            [
                cambiarEstado,
                changingStatusId,
            ],
        );


    /* =====================================================
       CARGAR CORREOS
       ===================================================== */

    const cargarCorreos =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/correos`,
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
                            CorreoItem[];


                    setItems(
                        data,
                    );


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


                            return data.some(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    currentId,
                            )
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
                            : "No se pudieron cargar los correos.",
                    );

                } finally {

                    setLoading(
                        false,
                    );

                }

            },
            [],
        );


    useEffect(
        () => {

            void cargarCorreos();

        },
        [
            cargarCorreos,
        ],
    );


    /* =====================================================
       BUSCADOR
       ===================================================== */

    const filtrados =
        useMemo(
            () => {

                const texto =
                    normalizar(
                        search,
                    );


                if (
                    !texto
                ) {

                    return items;

                }


                return items.filter(
                    (
                        item,
                    ) =>
                        Object
                            .values(
                                item,
                            )
                            .some(
                                (
                                    value,
                                ) =>
                                    normalizar(
                                        value,
                                    ).includes(
                                        texto,
                                    ),
                            ),
                );

            },
            [
                items,
                search,
            ],
        );


    /* =====================================================
       REGISTROS PARA EXPORTACIÓN
       ===================================================== */

    const registrosParaExportar =
        useMemo(
            () => {

                if (
                    sortModel.length ===
                    0
                ) {

                    return filtrados;

                }


                const currentSort =
                    sortModel[
                        0
                    ];


                if (
                    !currentSort?.field ||
                    !currentSort.sort
                ) {

                    return filtrados;

                }


                const direction =
                    currentSort.sort ===
                    "desc"
                        ? -1
                        : 1;


                return [
                    ...filtrados,
                ].sort(
                    (
                        a,
                        b,
                    ) =>
                        compararValores(
                            (
                                a as unknown as
                                    Record<
                                        string,
                                        unknown
                                    >
                            )[
                                currentSort.field
                            ],

                            (
                                b as unknown as
                                    Record<
                                        string,
                                        unknown
                                    >
                            )[
                                currentSort.field
                            ],
                        ) *
                        direction,
                );

            },
            [
                filtrados,
                sortModel,
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
            nombre:
                "",

            apellido:
                "",

            cuentaCorreo:
                "",

            estado:
                "Reserva",

            fechaSolicitada:
                "",

            correoCreado:
                "",

            solicitante:
                "",

            fechaCreacion:
                "",

            observacion:
                "",

            usuarioAnterior:
                "",
        });


        setFormOpen(
            true,
        );

        setError("");

    }


    /* =====================================================
       EDITAR
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
            nombre:
                selectedItem.nombre ??
                "",

            apellido:
                selectedItem.apellido ??
                "",

            cuentaCorreo:
                selectedItem.cuentaCorreo ??
                "",

            estado:
                selectedItem.estado,

            fechaSolicitada:
                selectedItem.fechaSolicitada ??
                "",

            correoCreado:
                selectedItem.correoCreado ??
                "",

            solicitante:
                selectedItem.solicitante ??
                "",

            fechaCreacion:
                selectedItem.fechaCreacion ??
                "",

            observacion:
                selectedItem.observacion ??
                "",

            usuarioAnterior:
                selectedItem.usuarioAnterior ??
                "",
        });


        setFormOpen(
            true,
        );


        window.scrollTo({
            top:
                0,

            behavior:
                "smooth",
        });

    }


    /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        setFormOpen(
            false,
        );

        setEditingId(
            null,
        );

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


        setError("");


        const nombre =
            form.nombre
                .trim();


        const apellido =
            form.apellido
                .trim();


        const cuentaCorreo =
            form.cuentaCorreo
                .trim()
                .toLocaleLowerCase();


        const correoCreado =
            form.correoCreado
                .trim()
                .toLocaleLowerCase();


        /* =================================================
           CAMPOS OBLIGATORIOS
           ================================================= */

        if (
            !nombre
        ) {

            setError(
                "El nombre es obligatorio.",
            );

            return;

        }


        if (
            !apellido
        ) {

            setError(
                "El apellido es obligatorio.",
            );

            return;

        }


        if (
            !cuentaCorreo
        ) {

            setError(
                "La cuenta de correo es obligatoria.",
            );

            return;

        }


        if (
            !validarCorreo(
                cuentaCorreo,
            )
        ) {

            setError(
                "La cuenta de correo debe tener un formato de email válido.",
            );

            return;

        }


        /* =================================================
           CORREO CREADO
           ================================================= */

        if (
            correoCreado &&
            !validarCorreo(
                correoCreado,
            )
        ) {

            setError(
                "El correo creado debe tener un formato de email válido.",
            );

            return;

        }


        /* =================================================
           FECHA DE CREACIÓN CONDICIONAL
           ================================================= */

        if (
            correoCreado &&
            !form.fechaCreacion
        ) {

            setError(
                "La Fecha de creación es obligatoria cuando se registra un Correo creado.",
            );

            return;

        }


        setLoading(
            true,
        );


        try {

            /*
             * Los campos opcionales vacíos NO
             * se envían al backend.
             *
             * Esto evita enviar:
             *
             * fechaSolicitada: ""
             * fechaCreacion: ""
             */

            const payload:
                Record<
                    string,
                    string
                > = {

                nombre,

                apellido,

                cuentaCorreo,

                estado:
                    form.estado,

            };


            /* =================================================
               FECHA SOLICITADA
               OPCIONAL
               ================================================= */

            if (
                form.fechaSolicitada
            ) {

                payload.fechaSolicitada =
                    form.fechaSolicitada;

            }


            /* =================================================
               CORREO CREADO
               OPCIONAL
               ================================================= */

            if (
                correoCreado
            ) {

                payload.correoCreado =
                    correoCreado;

            }


            /* =================================================
               SOLICITANTE
               OPCIONAL
               ================================================= */

            const solicitante =
                form.solicitante
                    .trim();


            if (
                solicitante
            ) {

                payload.solicitante =
                    solicitante;

            }


            /* =================================================
               FECHA DE CREACIÓN
               ================================================= */

            if (
                form.fechaCreacion
            ) {

                payload.fechaCreacion =
                    form.fechaCreacion;

            }


            /* =================================================
               OBSERVACIÓN
               ================================================= */

            const observacion =
                form.observacion
                    .trim();


            if (
                observacion
            ) {

                payload.observacion =
                    observacion;

            }


            /* =================================================
               USUARIO ANTERIOR
               ================================================= */

            const usuarioAnterior =
                form.usuarioAnterior
                    .trim();


            if (
                usuarioAnterior
            ) {

                payload.usuarioAnterior =
                    usuarioAnterior;

            }


            const url =
                editingId ===
                null
                    ? `${API_URL}/correos`
                    : `${API_URL}/correos/${editingId}`;


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


            await cargarCorreos();

        } catch (
            err
        ) {

            setError(
                err instanceof
                    Error
                    ? err.message
                    : "No se pudo guardar el registro.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       EXPORTAR EXCEL
       ===================================================== */

    async function exportarExcel() {

        setExcelFeedback(
            null,
        );


        try {

            const workbook =
                new ExcelJS.Workbook();


            workbook.creator =
                "DR+ Core";


            const worksheet =
                workbook.addWorksheet(
                    "Correos",
                    {
                        views: [
                            {
                                state:
                                    "frozen",

                                ySplit:
                                    1,

                                activeCell:
                                    "A2",
                            },
                        ],

                        properties: {
                            defaultRowHeight:
                                21,
                        },

                        pageSetup: {
                            orientation:
                                "landscape",

                            fitToPage:
                                true,

                            fitToWidth:
                                1,

                            fitToHeight:
                                0,
                        },
                    },
                );


            const headerRow =
                worksheet.addRow(
                    excelColumns.map(
                        (
                            column,
                        ) =>
                            column.label,
                    ),
                );


            headerRow.height =
                30;


            headerRow.eachCell(
                {
                    includeEmpty:
                        true,
                },
                (
                    cell,
                ) => {

                    cell.font = {
                        name:
                            "Aptos",

                        size:
                            11,

                        bold:
                            true,

                        color: {
                            argb:
                                "FFFFFFFF",
                        },
                    };


                    cell.fill = {
                        type:
                            "pattern",

                        pattern:
                            "solid",

                        fgColor: {
                            argb:
                                "FF0F766E",
                        },
                    };


                    cell.alignment = {
                        vertical:
                            "middle",

                        horizontal:
                            "center",

                        wrapText:
                            true,
                    };


                    cell.border = {
                        top: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF115E59",
                            },
                        },

                        left: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF115E59",
                            },
                        },

                        bottom: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF115E59",
                            },
                        },

                        right: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF115E59",
                            },
                        },
                    };

                },
            );


            registrosParaExportar.forEach(
                (
                    item,
                    index,
                ) => {

                    const row =
                        worksheet.addRow([
                            item.id,
                            item.nombre ?? "",
                            item.apellido ?? "",
                            item.cuentaCorreo ?? "",
                            item.estado,
                            item.fechaSolicitada ?? "",
                            item.correoCreado ?? "",
                            item.solicitante ?? "",
                            item.fechaCreacion ?? "",
                            item.observacion ?? "",
                            item.usuarioAnterior ?? "",
                        ]);


                    row.height =
                        23;


                    row.eachCell(
                        {
                            includeEmpty:
                                true,
                        },
                        (
                            cell,
                        ) => {

                            cell.font = {
                                name:
                                    "Aptos",

                                size:
                                    10,

                                color: {
                                    argb:
                                        "FF334155",
                                },
                            };


                            cell.alignment = {
                                vertical:
                                    "top",

                                horizontal:
                                    "left",

                                wrapText:
                                    true,
                            };


                            if (
                                index %
                                2 ===
                                1
                            ) {

                                cell.fill = {
                                    type:
                                        "pattern",

                                    pattern:
                                        "solid",

                                    fgColor: {
                                        argb:
                                            "FFF0FDFA",
                                    },
                                };

                            }


                            cell.border = {
                                top: {
                                    style:
                                        "thin",

                                    color: {
                                        argb:
                                            "FFE2E8F0",
                                    },
                                },

                                left: {
                                    style:
                                        "thin",

                                    color: {
                                        argb:
                                            "FFE2E8F0",
                                    },
                                },

                                bottom: {
                                    style:
                                        "thin",

                                    color: {
                                        argb:
                                            "FFE2E8F0",
                                    },
                                },

                                right: {
                                    style:
                                        "thin",

                                    color: {
                                        argb:
                                            "FFE2E8F0",
                                    },
                                },
                            };

                        },
                    );

                },
            );


            const widths = [
                10,
                20,
                20,
                34,
                15,
                18,
                34,
                24,
                18,
                40,
                28,
            ];


            widths.forEach(
                (
                    width,
                    index,
                ) => {

                    worksheet
                        .getColumn(
                            index +
                            1,
                        )
                        .width =
                            width;

                },
            );


            worksheet.autoFilter = {
                from: {
                    row:
                        1,

                    column:
                        1,
                },

                to: {
                    row:
                        Math.max(
                            worksheet.rowCount,
                            1,
                        ),

                    column:
                        excelColumns.length,
                },
            };


            const buffer =
                await workbook
                    .xlsx
                    .writeBuffer();


            const blob =
                new Blob(
                    [
                        buffer,
                    ],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob,
                );


            const link =
                document.createElement(
                    "a",
                );


            link.href =
                downloadUrl;


            link.download =
                `Correos_${new Date()
                    .toISOString()
                    .slice(
                        0,
                        10,
                    )}.xlsx`;


            document.body
                .appendChild(
                    link,
                );


            link.click();

            link.remove();


            window.setTimeout(
                () =>
                    URL.revokeObjectURL(
                        downloadUrl,
                    ),
                1000,
            );


            setExcelFeedback({
                type:
                    "success",

                message:
                    `${registrosParaExportar.length} registros exportados correctamente.`,
            });

        } catch (
            err
        ) {

            setExcelFeedback({
                type:
                    "error",

                message:
                    err instanceof
                        Error
                        ? err.message
                        : "No se pudo exportar el archivo Excel.",
            });

        }

    }


    /* =====================================================
       ABRIR IMPORTACIÓN
       ===================================================== */

    function abrirImportacionExcel() {

        if (
            importing
        ) {

            return;

        }


        if (
            fileInputRef.current
        ) {

            fileInputRef.current.value =
                "";

            fileInputRef.current.click();

        }

    }


    /* =====================================================
       IMPORTAR EXCEL
       ===================================================== */

    async function importarExcel(
        event:
            React.ChangeEvent<
                HTMLInputElement
            >,
    ) {

        const file =
            event.target.files?.[
                0
            ];


        if (
            !file
        ) {

            return;

        }


        setExcelFeedback(
            null,
        );


        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLocaleLowerCase();


        if (
            extension !==
                "xlsx" &&
            extension !==
                "xls"
        ) {

            setExcelFeedback({
                type:
                    "error",

                message:
                    "Solo se permiten archivos Excel .xlsx o .xls.",
            });

            event.target.value =
                "";

            return;

        }


        setImporting(
            true,
        );


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                );


            const firstSheetName =
                workbook
                    .SheetNames[
                    0
                ];


            if (
                !firstSheetName
            ) {

                throw new Error(
                    "El archivo Excel no contiene hojas.",
                );

            }


            const worksheet =
                workbook.Sheets[
                    firstSheetName
                ];


            if (
                !worksheet
            ) {

                throw new Error(
                    "No se pudo leer la primera hoja.",
                );

            }


            const rawRows =
                XLSX.utils
                    .sheet_to_json<
                        unknown[]
                    >(
                        worksheet,
                        {
                            header:
                                1,

                            defval:
                                "",

                            raw:
                                false,
                        },
                    );


            const rows =
                rawRows.filter(
                    (
                        row,
                    ) =>
                        row.some(
                            (
                                value,
                            ) =>
                                String(
                                    value ??
                                    "",
                                ).trim() !==
                                "",
                        ),
                );


            if (
                rows.length ===
                0
            ) {

                throw new Error(
                    "El archivo Excel está vacío.",
                );

            }


            const expectedHeaders =
                excelColumns.map(
                    (
                        column,
                    ) =>
                        column.label,
                );


            const receivedHeaders =
                rows[
                    0
                ].map(
                    (
                        value,
                    ) =>
                        String(
                            value ??
                            "",
                        ).trim(),
                );


            const sameHeaders =
                receivedHeaders.length ===
                    expectedHeaders.length &&
                expectedHeaders.every(
                    (
                        header,
                        index,
                    ) =>
                        receivedHeaders[
                            index
                        ] ===
                        header,
                );


            if (
                !sameHeaders
            ) {

                throw new Error(
                    `La cabecera debe ser exactamente: ${expectedHeaders.join(" | ")}`,
                );

            }


            const dataRows =
                rows.slice(
                    1,
                );


            if (
                dataRows.length ===
                0
            ) {

                throw new Error(
                    "El archivo contiene la cabecera correcta, pero no tiene registros.",
                );

            }


            const itemsPorId =
                new Map(
                    items.map(
                        (
                            item,
                        ) => [
                            item.id,
                            item,
                        ],
                    ),
                );


            const cuentasExistentes =
                new Map<
                    string,
                    number
                >();


            const creadosExistentes =
                new Map<
                    string,
                    number
                >();


            for (
                const item of
                items
            ) {

                const cuenta =
                    normalizar(
                        item.cuentaCorreo,
                    );


                const creado =
                    normalizar(
                        item.correoCreado,
                    );


                if (
                    cuenta
                ) {

                    cuentasExistentes.set(
                        cuenta,
                        item.id,
                    );

                }


                if (
                    creado
                ) {

                    creadosExistentes.set(
                        creado,
                        item.id,
                    );

                }

            }


            const cuentasArchivo =
                new Set<
                    string
                >();


            const creadosArchivo =
                new Set<
                    string
                >();


            const idsProcesados =
                new Set<
                    number
                >();


            let nuevos =
                0;

            let actualizados =
                0;

            let sinCambios =
                0;

            let conError =
                0;


            const errores:
                string[] = [];


            for (
                let index =
                    0;
                index <
                dataRows.length;
                index +=
                    1
            ) {

                const row =
                    dataRows[
                        index
                    ];


                const fila =
                    index +
                    2;


                const idText =
                    String(
                        row[
                            0
                        ] ??
                        "",
                    ).trim();


                const nombre =
                    String(
                        row[
                            1
                        ] ??
                        "",
                    ).trim();


                const apellido =
                    String(
                        row[
                            2
                        ] ??
                        "",
                    ).trim();


                const cuentaCorreo =
                    String(
                        row[
                            3
                        ] ??
                        "",
                    )
                        .trim()
                        .toLocaleLowerCase();


                const estadoRaw =
                    String(
                        row[
                            4
                        ] ??
                        "",
                    ).trim();


                const fechaSolicitada =
                    String(
                        row[
                            5
                        ] ??
                        "",
                    ).trim();


                const correoCreado =
                    String(
                        row[
                            6
                        ] ??
                        "",
                    )
                        .trim()
                        .toLocaleLowerCase();


                const solicitante =
                    String(
                        row[
                            7
                        ] ??
                        "",
                    ).trim();


                const fechaCreacion =
                    String(
                        row[
                            8
                        ] ??
                        "",
                    ).trim();


                const observacion =
                    String(
                        row[
                            9
                        ] ??
                        "",
                    ).trim();


                const usuarioAnterior =
                    String(
                        row[
                            10
                        ] ??
                        "",
                    ).trim();


                const estado:
                    EstadoCorreo |
                    null =
                        normalizar(
                            estadoRaw,
                        ) ===
                        "usado"
                            ? "Usado"
                            : normalizar(
                                estadoRaw,
                            ) ===
                                "reserva"
                                ? "Reserva"
                                : null;


                /* =========================================
                   CAMPOS OBLIGATORIOS
                   ========================================= */

                if (
                    !nombre
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: Nombre es obligatorio.`,
                    );

                    continue;

                }


                if (
                    !apellido
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: Apellido es obligatorio.`,
                    );

                    continue;

                }


                if (
                    !cuentaCorreo
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: Cuenta de correo es obligatoria.`,
                    );

                    continue;

                }


                if (
                    !estado
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: Estado debe ser Usado o Reserva.`,
                    );

                    continue;

                }


                if (
                    !validarCorreo(
                        cuentaCorreo,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: la cuenta de correo "${cuentaCorreo}" no tiene formato válido.`,
                    );

                    continue;

                }


                if (
                    correoCreado &&
                    !validarCorreo(
                        correoCreado,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: el correo creado "${correoCreado}" no tiene formato válido.`,
                    );

                    continue;

                }


                /* =========================================
                   REGLA CORREO CREADO + FECHA
                   ========================================= */

                if (
                    correoCreado &&
                    !fechaCreacion
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: Fecha de creación es obligatoria cuando existe un Correo creado.`,
                    );

                    continue;

                }


                /* =========================================
                   ACTUALIZAR
                   ========================================= */

                if (
                    idText
                ) {

                    if (
                        !/^\d+$/.test(
                            idText,
                        )
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${fila}: ID inválido.`,
                        );

                        continue;

                    }


                    const id =
                        Number(
                            idText,
                        );


                    if (
                        idsProcesados.has(
                            id,
                        )
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${fila}: el ID ${id} está repetido dentro del archivo.`,
                        );

                        continue;

                    }


                    idsProcesados.add(
                        id,
                    );


                    const actual =
                        itemsPorId.get(
                            id,
                        );


                    if (
                        !actual
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${fila}: el ID ${id} no existe.`,
                        );

                        continue;

                    }


                    const cuentaNormalizada =
                        normalizar(
                            cuentaCorreo,
                        );


                    const creadoNormalizado =
                        normalizar(
                            correoCreado,
                        );


                    if (
                        cuentaNormalizada
                    ) {

                        const owner =
                            cuentasExistentes.get(
                                cuentaNormalizada,
                            );


                        if (
                            owner !==
                                undefined &&
                            owner !==
                                id
                        ) {

                            conError +=
                                1;

                            errores.push(
                                `Fila ${fila}: la cuenta de correo "${cuentaCorreo}" ya pertenece a otro registro.`,
                            );

                            continue;

                        }

                    }


                    if (
                        creadoNormalizado
                    ) {

                        const owner =
                            creadosExistentes.get(
                                creadoNormalizado,
                            );


                        if (
                            owner !==
                                undefined &&
                            owner !==
                                id
                        ) {

                            conError +=
                                1;

                            errores.push(
                                `Fila ${fila}: el correo creado "${correoCreado}" ya pertenece a otro registro.`,
                            );

                            continue;

                        }

                    }


                    const payload:
                        Record<
                            string,
                            string
                        > = {

                        nombre,

                        apellido,

                        cuentaCorreo,

                        estado,

                    };


                    if (
                        fechaSolicitada
                    ) {

                        payload.fechaSolicitada =
                            fechaSolicitada;

                    }


                    if (
                        correoCreado
                    ) {

                        payload.correoCreado =
                            correoCreado;

                    }


                    if (
                        solicitante
                    ) {

                        payload.solicitante =
                            solicitante;

                    }


                    if (
                        fechaCreacion
                    ) {

                        payload.fechaCreacion =
                            fechaCreacion;

                    }


                    if (
                        observacion
                    ) {

                        payload.observacion =
                            observacion;

                    }


                    if (
                        usuarioAnterior
                    ) {

                        payload.usuarioAnterior =
                            usuarioAnterior;

                    }


                    const sinCambio =
                        (actual.nombre ?? "") ===
                            nombre &&
                        (actual.apellido ?? "") ===
                            apellido &&
                        (actual.cuentaCorreo ?? "") ===
                            cuentaCorreo &&
                        actual.estado ===
                            estado &&
                        (actual.fechaSolicitada ?? "") ===
                            fechaSolicitada &&
                        (actual.correoCreado ?? "") ===
                            correoCreado &&
                        (actual.solicitante ?? "") ===
                            solicitante &&
                        (actual.fechaCreacion ?? "") ===
                            fechaCreacion &&
                        (actual.observacion ?? "") ===
                            observacion &&
                        (actual.usuarioAnterior ?? "") ===
                            usuarioAnterior;


                    if (
                        sinCambio
                    ) {

                        sinCambios +=
                            1;

                        continue;

                    }


                    try {

                        const response =
                            await authFetch(
                                `${API_URL}/correos/${id}`,
                                {
                                    method:
                                        "PATCH",

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


                        actualizados +=
                            1;


                        if (
                            cuentaNormalizada
                        ) {

                            cuentasExistentes.set(
                                cuentaNormalizada,
                                id,
                            );

                        }


                        if (
                            creadoNormalizado
                        ) {

                            creadosExistentes.set(
                                creadoNormalizado,
                                id,
                            );

                        }

                    } catch (
                        err
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${fila}: ${
                                err instanceof
                                    Error
                                    ? err.message
                                    : "No se pudo actualizar el registro."
                            }`,
                        );

                    }


                    continue;

                }


                /* =========================================
                   NUEVO
                   ========================================= */

                const cuentaNormalizada =
                    normalizar(
                        cuentaCorreo,
                    );


                const creadoNormalizado =
                    normalizar(
                        correoCreado,
                    );


                if (
                    cuentaNormalizada &&
                    (
                        cuentasExistentes.has(
                            cuentaNormalizada,
                        ) ||
                        cuentasArchivo.has(
                            cuentaNormalizada,
                        )
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: la cuenta de correo "${cuentaCorreo}" está duplicada.`,
                    );

                    continue;

                }


                if (
                    creadoNormalizado &&
                    (
                        creadosExistentes.has(
                            creadoNormalizado,
                        ) ||
                        creadosArchivo.has(
                            creadoNormalizado,
                        )
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: el correo creado "${correoCreado}" está duplicado.`,
                    );

                    continue;

                }


                const payload:
                    Record<
                        string,
                        string
                    > = {

                    nombre,

                    apellido,

                    cuentaCorreo,

                    estado,

                };


                if (
                    fechaSolicitada
                ) {

                    payload.fechaSolicitada =
                        fechaSolicitada;

                }


                if (
                    correoCreado
                ) {

                    payload.correoCreado =
                        correoCreado;

                }


                if (
                    solicitante
                ) {

                    payload.solicitante =
                        solicitante;

                }


                if (
                    fechaCreacion
                ) {

                    payload.fechaCreacion =
                        fechaCreacion;

                }


                if (
                    observacion
                ) {

                    payload.observacion =
                        observacion;

                }


                if (
                    usuarioAnterior
                ) {

                    payload.usuarioAnterior =
                        usuarioAnterior;

                }


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/correos`,
                            {
                                method:
                                    "POST",

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


                    nuevos +=
                        1;


                    if (
                        cuentaNormalizada
                    ) {

                        cuentasArchivo.add(
                            cuentaNormalizada,
                        );

                    }


                    if (
                        creadoNormalizado
                    ) {

                        creadosArchivo.add(
                            creadoNormalizado,
                        );

                    }

                } catch (
                    err
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${fila}: ${
                            err instanceof
                                Error
                                ? err.message
                                : "No se pudo crear el registro."
                        }`,
                    );

                }

            }


            if (
                nuevos >
                    0 ||
                actualizados >
                    0
            ) {

                await cargarCorreos();

            }


            let type:
                ExcelFeedbackType =
                    "success";


            if (
                conError >
                    0 &&
                (
                    nuevos >
                        0 ||
                    actualizados >
                        0 ||
                    sinCambios >
                        0
                )
            ) {

                type =
                    "warning";

            }

            else if (
                conError >
                    0
            ) {

                type =
                    "error";

            }


            setExcelFeedback({
                type,

                message:
                    `Importación finalizada. Nuevos: ${nuevos} | Actualizados: ${actualizados} | Sin cambios: ${sinCambios} | Con error: ${conError} | Total: ${dataRows.length}.`,

                details:
                    errores.length >
                    0
                        ? errores.slice(
                            0,
                            12,
                        )
                        : undefined,
            });

        } catch (
            err
        ) {

            setExcelFeedback({
                type:
                    "error",

                message:
                    err instanceof
                        Error
                        ? err.message
                        : "No se pudo procesar el archivo Excel.",
            });

        } finally {

            setImporting(
                false,
            );

            event.target.value =
                "";

        }

    }


    /* =====================================================
       SELECCIÓN
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


        const id =
            Number(
                ids[
                    0
                ],
            );


        setSelectedId(
            Number.isNaN(
                id,
            )
                ? null
                : id,
        );

    }


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <DRPage
            title="Correos"
            description="Gestión centralizada de cuentas de correo"
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

                    {/* TOOLBAR */}

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

                                placeholder="Buscar en todos los campos de Correos..."
                            />

                        </div>


                        <div
                            className={
                                styles.toolbarActions
                            }
                        >

                            <input
                                ref={
                                    fileInputRef
                                }

                                className={
                                    styles.fileInput
                                }

                                type="file"

                                accept=".xlsx,.xls"

                                onChange={
                                    importarExcel
                                }
                            />


                            <button
                                type="button"

                                className={
                                    styles.excelImportButton
                                }

                                disabled={
                                    importing
                                }

                                onClick={
                                    abrirImportacionExcel
                                }
                            >
                                {importing
                                    ? "Importando..."
                                    : "↑ Importar Excel"}
                            </button>


                            <button
                                type="button"

                                className={
                                    styles.excelExportButton
                                }

                                disabled={
                                    importing
                                }

                                onClick={
                                    exportarExcel
                                }
                            >
                                ↓ Exportar Excel
                            </button>


                            <button
                                type="button"

                                className={
                                    styles.editButton
                                }

                                disabled={
                                    selectedItem ===
                                    null
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

                                onClick={
                                    nuevo
                                }
                            >
                                + Nuevo registro
                            </button>

                        </div>

                    </div>


                    {/* FEEDBACK EXCEL */}

                    {excelFeedback && (

                        <div
                            className={[
                                styles.excelFeedback,

                                excelFeedback.type ===
                                    "success"
                                    ? styles.excelFeedbackSuccess
                                    : excelFeedback.type ===
                                        "warning"
                                        ? styles.excelFeedbackWarning
                                        : styles.excelFeedbackError,
                            ].join(
                                " ",
                            )}
                        >

                            <div
                                className={
                                    styles.excelFeedbackHeader
                                }
                            >

                                <strong>
                                    {
                                        excelFeedback.message
                                    }
                                </strong>


                                <button
                                    type="button"

                                    className={
                                        styles.excelFeedbackClose
                                    }

                                    onClick={() =>
                                        setExcelFeedback(
                                            null,
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {excelFeedback.details &&
                                excelFeedback.details.length >
                                0 && (

                                <ul
                                    className={
                                        styles.excelFeedbackDetails
                                    }
                                >

                                    {excelFeedback.details.map(
                                        (
                                            detail,
                                            index,
                                        ) => (

                                            <li
                                                key={
                                                    `${detail}-${index}`
                                                }
                                            >
                                                {
                                                    detail
                                                }
                                            </li>

                                        ),
                                    )}

                                </ul>

                            )}

                        </div>

                    )}


                    {/* ERROR */}

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


                    {/* FORMULARIO */}

                    {formOpen && (

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
                                            {editingId !==
                                            null
                                                ? "Editar correo"
                                                : "Nuevo registro - Correos"}
                                        </DRText>


                                        <p
                                            className={
                                                styles.formDescription
                                            }
                                        >
                                            Los campos marcados con * son obligatorios. La Fecha de creación será requerida únicamente cuando se registre un Correo creado.
                                        </p>

                                    </div>


                                    <button
                                        type="button"

                                        className={
                                            styles.secondaryButton
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

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Nombre *
                                        </span>

                                        <input
                                            required

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
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Apellido *
                                        </span>

                                        <input
                                            required

                                            value={
                                                form.apellido
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        apellido:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Cuenta de correo *

                                            <small
                                                className={
                                                    styles.uniqueBadge
                                                }
                                            >
                                                Único
                                            </small>
                                        </span>

                                        <input
                                            type="email"

                                            required

                                            value={
                                                form.cuentaCorreo
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        cuentaCorreo:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Estado *
                                        </span>

                                        <select
                                            required

                                            value={
                                                form.estado
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        estado:
                                                            event
                                                                .target
                                                                .value as
                                                                EstadoCorreo,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="Reserva">
                                                Reserva
                                            </option>

                                            <option value="Usado">
                                                Usado
                                            </option>

                                        </select>

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Fecha solicitada
                                        </span>

                                        <input
                                            type="date"

                                            value={
                                                form.fechaSolicitada
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        fechaSolicitada:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Correo creado

                                            <small
                                                className={
                                                    styles.uniqueBadge
                                                }
                                            >
                                                Único
                                            </small>
                                        </span>

                                        <input
                                            type="email"

                                            value={
                                                form.correoCreado
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        correoCreado:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Solicitante
                                        </span>

                                        <input
                                            value={
                                                form.solicitante
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        solicitante:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Fecha de creación

                                            {form.correoCreado
                                                .trim() && (

                                                <small
                                                    className={
                                                        styles.uniqueBadge
                                                    }
                                                >
                                                    Requerido
                                                </small>

                                            )}

                                        </span>

                                        <input
                                            type="date"

                                            required={
                                                Boolean(
                                                    form.correoCreado
                                                        .trim(),
                                                )
                                            }

                                            value={
                                                form.fechaCreacion
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        fechaCreacion:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Usuario Anterior
                                        </span>

                                        <input
                                            value={
                                                form.usuarioAnterior
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        usuarioAnterior:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    <label
                                        className={[
                                            styles.field,
                                            styles.fieldWide,
                                        ].join(
                                            " ",
                                        )}
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
                                        />

                                    </label>


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
                                                    : "Guardar registro"}
                                        </button>

                                    </div>

                                </form>

                            </DRCardContent>

                        </DRCard>

                    )}


                    {/* TABLA */}

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
                                    Correos
                                </DRText>


                                <DRText
                                    variant="bodySmall"
                                    color="secondary"
                                >
                                    {
                                        filtrados.length
                                    }{" "}
                                    registros encontrados
                                </DRText>

                            </div>


                            {sortModel.length >
                                0 && (

                                <button
                                    type="button"

                                    className={
                                        styles.clearSortButton
                                    }

                                    onClick={() =>
                                        setSortModel(
                                            [],
                                        )
                                    }
                                >
                                    Limpiar orden
                                </button>

                            )}

                        </div>


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
                                    gridColumns
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
                                            ? "No existen registros que coincidan con la búsqueda."
                                            : "No existen registros de correos.",
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