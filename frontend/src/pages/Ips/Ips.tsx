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
    useAuth,
} from "@/auth";

import styles from "./Ips.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type Segmento =
    | "26"
    | "46"
    | "56"
    | "100";


type IpRegistro = {
    id: number;
    segmento: Segmento;
    ip: string;
    hostName: string | null;
    usuario: string | null;
    area: string | null;
    ubicacion: string | null;
    oficina: string | null;
    observacion: string | null;
};


type IpForm = {
    ip: string;
    hostName: string;
    usuario: string;
    area: string;
    ubicacion: string;
    oficina: string;
    observacion: string;
};


type Area = {
    id: number;
    nombre: string;
    activo: boolean;
};


type ResumenSegmento = {
    segmento: Segmento;
    cantidad: number;
};


type ExcelFeedbackType =
    | "success"
    | "warning"
    | "error";


type ExcelFeedback = {
    type: ExcelFeedbackType;
    message: string;
    details?: string[];
} | null;


/* =========================================================
   API
   ========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


/* =========================================================
   SEGMENTOS
   ========================================================= */

const segmentos: Array<{
    key: Segmento;
    label: string;
}> = [
    {
        key: "26",
        label: "Segmento 26",
    },
    {
        key: "46",
        label: "Segmento 46",
    },
    {
        key: "56",
        label: "Segmento 56",
    },
    {
        key: "100",
        label: "Segmento 100",
    },
];


/* =========================================================
   EXCEL
   ========================================================= */

const EXCEL_HEADERS = [
    "IP",
    "Host Name",
    "Usuario",
    "Área",
    "Ubicación",
    "Oficina",
    "Observación",
];


/* =========================================================
   FORMULARIO INICIAL
   ========================================================= */

const initialForm:
    IpForm = {

    ip: "",
    hostName: "",
    usuario: "",
    area: "",
    ubicacion: "",
    oficina: "",
    observacion: "",
};


/* =========================================================
   COMPARADOR
   ========================================================= */

const collator =
    new Intl.Collator(
        "es",
        {
            numeric: true,
            sensitivity: "base",
        },
    );


function compararValores(
    valueA: unknown,
    valueB: unknown,
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


/* =========================================================
   ERROR BACKEND
   ========================================================= */

async function obtenerMensajeError(
    response: Response,
): Promise<string> {

    try {

        const body =
            (await response.json()) as {
                message?:
                    | string
                    | string[];

                error?: string;
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
         * Respuesta no JSON.
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
   NORMALIZAR
   ========================================================= */

function normalizar(
    value: unknown,
): string {

    return String(
        value ?? "",
    ).trim();
}


function normalizarComparacion(
    value: unknown,
): string {

    return normalizar(
        value,
    ).toLocaleLowerCase(
        "es",
    );
}


/* =========================================================
   VALIDAR IP / SEGMENTO
   ========================================================= */

function ipPerteneceSegmento(
    ip: string,
    segmento: Segmento,
): boolean {

    const octetos =
        ip
            .trim()
            .split(".");


    if (
        octetos.length !==
        4
    ) {
        return false;
    }


    return octetos[2] ===
        segmento;
}


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function Ips() {

    const {
        usuario: usuarioSesion,
    } =
        useAuth();


    const esAdministrador =
        usuarioSesion?.rol ===
        "Administrador";


    /* =====================================================
       ESTADOS
       ===================================================== */

    const [
        segmento,
        setSegmento,
    ] =
        useState<Segmento>(
            "26",
        );


    const [
        registros,
        setRegistros,
    ] =
        useState<IpRegistro[]>(
            [],
        );


    const [
        resumen,
        setResumen,
    ] =
        useState<ResumenSegmento[]>(
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
        useState(false);


    const [
        importing,
        setImporting,
    ] =
        useState(false);


    const [
        error,
        setError,
    ] =
        useState("");


    const [
        excelFeedback,
        setExcelFeedback,
    ] =
        useState<ExcelFeedback>(
            null,
        );


    const [
        formOpen,
        setFormOpen,
    ] =
        useState(false);


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
        useState<IpForm>({
            ...initialForm,
        });


    const [
        sortModel,
        setSortModel,
    ] =
        useState<GridSortModel>(
            [],
        );


    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null,
        );


    /* =====================================================
       SELECCIONADO
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
                    registros.find(
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
                registros,
                selectedId,
            ],
        );


    /* =====================================================
       SELECCIÓN MUI
       ===================================================== */

    const rowSelectionModel =
        useMemo<
            GridRowSelectionModel
        >(
            () => ({
                type: "include",

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
            GridColDef<IpRegistro>[]
        >(
            () => [

                {
                    field:
                        "ip",

                    headerName:
                        "IP",

                    minWidth:
                        145,

                    flex:
                        0.85,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
                        params,
                    ) => (

                        <span
                            className={
                                styles.ipValue
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

                    ),
                },


                {
                    field:
                        "hostName",

                    headerName:
                        "Host Name",

                    minWidth:
                        190,

                    flex:
                        1.1,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
                                )
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
                        190,

                    flex:
                        1.1,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
                                )
                            }
                        </span>

                    ),
                },


                {
                    field:
                        "area",

                    headerName:
                        "Área",

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

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
                                )
                            }
                        </span>

                    ),
                },


                {
                    field:
                        "ubicacion",

                    headerName:
                        "Ubicación",

                    minWidth:
                        190,

                    flex:
                        1.1,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
                                )
                            }
                        </span>

                    ),
                },


                {
                    field:
                        "oficina",

                    headerName:
                        "Oficina",

                    minWidth:
                        170,

                    flex:
                        0.95,

                    sortable:
                        true,

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
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

                    filterable:
                        false,

                    disableColumnMenu:
                        true,

                    headerAlign:
                        "left",

                    align:
                        "left",

                    sortComparator:
                        compararValores,

                    renderCell: (
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
                            {
                                String(
                                    params.value ??
                                    "—",
                                )
                            }
                        </span>

                    ),
                },

            ],
            [],
        );


    /* =====================================================
       CARGAR SEGMENTO
       ===================================================== */

    const cargarRegistros =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/ips?segmento=${segmento}`,
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
                            IpRegistro[];


                    setRegistros(
                        data,
                    );


                    setSelectedId(
                        (
                            current,
                        ) => {

                            if (
                                current ===
                                null
                            ) {
                                return null;
                            }


                            return data.some(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    current,
                            )
                                ? current
                                : null;

                        },
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar las IP.",
                    );

                } finally {

                    setLoading(
                        false,
                    );

                }

            },
            [
                segmento,
            ],
        );


    /* =====================================================
       RESUMEN
       ===================================================== */

    const cargarResumen =
        useCallback(
            async () => {

                try {

                    const response =
                        await authFetch(
                            `${API_URL}/ips/resumen`,
                        );


                    if (
                        !response.ok
                    ) {
                        return;
                    }


                    const data =
                        (await response.json()) as
                            ResumenSegmento[];


                    setResumen(
                        data,
                    );

                } catch {

                    /*
                     * El módulo puede seguir funcionando
                     * aunque falle temporalmente el resumen.
                     */

                }

            },
            [],
        );


    /* =====================================================
       ÁREAS
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
                        return;
                    }


                    const data =
                        (await response.json()) as
                            Area[];


                    setAreas(
                        data,
                    );

                } catch {

                    /*
                     * Sin bloquear el resto del módulo.
                     */

                }

            },
            [],
        );


    /* =====================================================
       CARGAS INICIALES
       ===================================================== */

    useEffect(
        () => {

            void cargarRegistros();

        },
        [
            cargarRegistros,
        ],
    );


    useEffect(
        () => {

            void cargarResumen();

            void cargarAreas();

        },
        [
            cargarResumen,
            cargarAreas,
        ],
    );


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
                    return registros;
                }


                return registros.filter(
                    (
                        item,
                    ) => [

                        item.ip,
                        item.hostName,
                        item.usuario,
                        item.area,
                        item.ubicacion,
                        item.oficina,
                        item.observacion,

                    ].some(
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
                    ),
                );

            },
            [
                registros,
                search,
            ],
        );


    /* =====================================================
       EXPORTACIÓN ORDENADA
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
                    sortModel[0];


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
                            a[
                                currentSort.field as
                                    keyof IpRegistro
                            ],
                            b[
                                currentSort.field as
                                    keyof IpRegistro
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
       CONTADOR
       ===================================================== */

    function obtenerCantidad(
        key: Segmento,
    ): number {

        return (
            resumen.find(
                (
                    item,
                ) =>
                    item.segmento ===
                    key,
            )?.cantidad ??
            0
        );

    }


    /* =====================================================
       CAMBIAR SEGMENTO
       ===================================================== */

    function cambiarSegmento(
        nuevoSegmento:
            Segmento,
    ) {

        setSegmento(
            nuevoSegmento,
        );

        setSearch("");

        setSortModel([]);

        setSelectedId(
            null,
        );

        setFormOpen(
            false,
        );

        setEditingId(
            null,
        );

        setForm({
            ...initialForm,
        });

        setError("");

        setExcelFeedback(
            null,
        );

    }


    /* =====================================================
       NUEVO
       ===================================================== */

    function nuevo() {

        if (
            !esAdministrador
        ) {
            return;
        }


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

        setExcelFeedback(
            null,
        );

        setFormOpen(
            true,
        );

    }


    /* =====================================================
       EDITAR
       ===================================================== */

    function editarSeleccionado() {

        if (
            !esAdministrador ||
            !selectedItem
        ) {
            return;
        }


        setEditingId(
            selectedItem.id,
        );


        setForm({
            ip:
                selectedItem.ip,

            hostName:
                selectedItem.hostName ??
                "",

            usuario:
                selectedItem.usuario ??
                "",

            area:
                selectedItem.area ??
                "",

            ubicacion:
                selectedItem.ubicacion ??
                "",

            oficina:
                selectedItem.oficina ??
                "",

            observacion:
                selectedItem.observacion ??
                "",
        });


        setError("");

        setExcelFeedback(
            null,
        );

        setFormOpen(
            true,
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
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
            React.FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();


        if (
            !esAdministrador
        ) {
            return;
        }


        if (
            editingId ===
                null &&
            !ipPerteneceSegmento(
                form.ip,
                segmento,
            )
        ) {

            setError(
                `La IP "${form.ip}" no pertenece al segmento ${segmento}.`,
            );

            return;

        }


        setLoading(
            true,
        );

        setError("");


        try {

            const payload = {
                hostName:
                    form.hostName.trim(),

                usuario:
                    form.usuario.trim(),

                area:
                    form.area.trim(),

                ubicacion:
                    form.ubicacion.trim(),

                oficina:
                    form.oficina.trim(),

                observacion:
                    form.observacion.trim(),
            };


            const response =
                await authFetch(
                    editingId ===
                        null
                        ? `${API_URL}/ips`
                        : `${API_URL}/ips/${editingId}`,
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
                                editingId ===
                                    null
                                    ? {
                                        segmento,
                                        ip:
                                            form.ip.trim(),

                                        ...payload,
                                    }
                                    : payload,
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


            await Promise.all([
                cargarRegistros(),
                cargarResumen(),
            ]);

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar la IP.",
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
       EXPORTAR EXCEL
       ===================================================== */

    async function exportarExcel() {

        if (
            !esAdministrador
        ) {
            return;
        }


        setExcelFeedback(
            null,
        );


        try {

            const workbook =
                new ExcelJS.Workbook();


            workbook.creator =
                "DR+ Core";

            workbook.lastModifiedBy =
                "DR+ Core";

            workbook.created =
                new Date();

            workbook.modified =
                new Date();


            const worksheet =
                workbook.addWorksheet(
                    `Segmento ${segmento}`,
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

                            paperSize:
                                9,

                            margins: {
                                left: 0.25,
                                right: 0.25,
                                top: 0.5,
                                bottom: 0.5,
                                header: 0.2,
                                footer: 0.2,
                            },
                        },
                    },
                );


            const colores:
                Record<
                    Segmento,
                    {
                        header: string;
                        border: string;
                        stripe: string;
                    }
                > = {

                "26": {
                    header:
                        "FF2563EB",

                    border:
                        "FF1D4ED8",

                    stripe:
                        "FFEFF6FF",
                },

                "46": {
                    header:
                        "FF0891B2",

                    border:
                        "FF0E7490",

                    stripe:
                        "FFECFEFF",
                },

                "56": {
                    header:
                        "FF7C3AED",

                    border:
                        "FF6D28D9",

                    stripe:
                        "FFF5F3FF",
                },

                "100": {
                    header:
                        "FFEA580C",

                    border:
                        "FFC2410C",

                    stripe:
                        "FFFFF7ED",
                },
            };


            const color =
                colores[
                    segmento
                ];


            const headerRow =
                worksheet.addRow(
                    EXCEL_HEADERS,
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
                                color.header,
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
                                    color.border,
                            },
                        },

                        left: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    color.border,
                            },
                        },

                        bottom: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    color.border,
                            },
                        },

                        right: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    color.border,
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
                            item.ip,
                            item.hostName ?? "",
                            item.usuario ?? "",
                            item.area ?? "",
                            item.ubicacion ?? "",
                            item.oficina ?? "",
                            item.observacion ?? "",
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
                                            color.stripe,
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
                18,
                28,
                28,
                25,
                28,
                22,
                40,
            ];


            widths.forEach(
                (
                    width,
                    index,
                ) => {

                    worksheet.getColumn(
                        index +
                        1,
                    ).width =
                        width;

                },
            );


            worksheet.getColumn(
                1,
            ).numFmt =
                "@";


            worksheet.autoFilter = {
                from: {
                    row: 1,
                    column: 1,
                },

                to: {
                    row:
                        Math.max(
                            worksheet.rowCount,
                            1,
                        ),

                    column:
                        EXCEL_HEADERS.length,
                },
            };


            worksheet.headerFooter = {
                oddHeader:
                    `&L&BDR+ Core&RSegmento ${segmento}`,

                oddFooter:
                    "&LInfraestructura TI&C&P de &N&R&D",
            };


            worksheet.pageSetup
                .printTitlesRow =
                    "1:1";


            const buffer =
                await workbook.xlsx
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


            const url =
                URL.createObjectURL(
                    blob,
                );


            const link =
                document.createElement(
                    "a",
                );


            link.href =
                url;


            link.download =
                `IPs_Segmento_${segmento}_${new Date()
                    .toISOString()
                    .slice(
                        0,
                        10,
                    )}.xlsx`;


            document.body.appendChild(
                link,
            );

            link.click();

            link.remove();


            window.setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url,
                    );

                },
                1000,
            );


            setExcelFeedback({
                type:
                    "success",

                message:
                    `${registrosParaExportar.length} registros del Segmento ${segmento} exportados correctamente.`,
            });

        } catch (
            err
        ) {

            setExcelFeedback({
                type:
                    "error",

                message:
                    err instanceof Error
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
            !esAdministrador ||
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
            React.ChangeEvent<HTMLInputElement>,
    ) {

        const file =
            event.target.files?.[0];


        if (
            !file ||
            !esAdministrador
        ) {
            return;
        }


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

        setExcelFeedback(
            null,
        );


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                );


            const firstSheetName =
                workbook.SheetNames[
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
                                normalizar(
                                    value,
                                ) !==
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


            const receivedHeaders =
                rows[0].map(
                    (
                        value,
                    ) =>
                        normalizar(
                            value,
                        ),
                );


            const correctos =
                receivedHeaders.length ===
                    EXCEL_HEADERS.length &&
                EXCEL_HEADERS.every(
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
                !correctos
            ) {

                throw new Error(
                    `La cabecera debe ser exactamente: ${EXCEL_HEADERS.join(" | ")}`,
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
                    "El archivo tiene la cabecera correcta, pero no contiene registros.",
                );

            }


            const existentes =
                new Map<
                    string,
                    IpRegistro
                >(
                    registros.map(
                        (
                            item,
                        ) => [
                            normalizarComparacion(
                                item.ip,
                            ),

                            item,
                        ],
                    ),
                );


            const ipsProcesadas =
                new Set<string>();


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


                const numeroFila =
                    index +
                    2;


                const ip =
                    normalizar(
                        row[0],
                    );


                const hostName =
                    normalizar(
                        row[1],
                    );


                const usuario =
                    normalizar(
                        row[2],
                    );


                const area =
                    normalizar(
                        row[3],
                    );


                const ubicacion =
                    normalizar(
                        row[4],
                    );


                const oficina =
                    normalizar(
                        row[5],
                    );


                const observacion =
                    normalizar(
                        row[6],
                    );


                /* =============================
                   IP OBLIGATORIA
                   ============================= */

                if (
                    !ip
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${numeroFila}: la IP es obligatoria.`,
                    );

                    continue;

                }


                /* =============================
                   SEGMENTO
                   ============================= */

                if (
                    !ipPerteneceSegmento(
                        ip,
                        segmento,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${numeroFila}: la IP "${ip}" no pertenece al Segmento ${segmento}.`,
                    );

                    continue;

                }


                const ipKey =
                    normalizarComparacion(
                        ip,
                    );


                /* =============================
                   DUPLICADO EXCEL
                   ============================= */

                if (
                    ipsProcesadas.has(
                        ipKey,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${numeroFila}: la IP "${ip}" está repetida dentro del archivo.`,
                    );

                    continue;

                }


                ipsProcesadas.add(
                    ipKey,
                );


                const existente =
                    existentes.get(
                        ipKey,
                    );


                const payload = {
                    hostName,
                    usuario,
                    area,
                    ubicacion,
                    oficina,
                    observacion,
                };


                /* =============================
                   NUEVO
                   ============================= */

                if (
                    !existente
                ) {

                    try {

                        const response =
                            await authFetch(
                                `${API_URL}/ips`,
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },

                                    body:
                                        JSON.stringify({
                                            segmento,
                                            ip,
                                            ...payload,
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


                        nuevos +=
                            1;

                    } catch (
                        err
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${numeroFila}: ${
                                err instanceof Error
                                    ? err.message
                                    : "No se pudo crear el registro."
                            }`,
                        );

                    }


                    continue;

                }


                /* =============================
                   COMPARACIÓN
                   ============================= */

                const noCambios =
                    normalizar(
                        existente.hostName,
                    ) ===
                        hostName &&
                    normalizar(
                        existente.usuario,
                    ) ===
                        usuario &&
                    normalizar(
                        existente.area,
                    ) ===
                        area &&
                    normalizar(
                        existente.ubicacion,
                    ) ===
                        ubicacion &&
                    normalizar(
                        existente.oficina,
                    ) ===
                        oficina &&
                    normalizar(
                        existente.observacion,
                    ) ===
                        observacion;


                if (
                    noCambios
                ) {

                    sinCambios +=
                        1;

                    continue;

                }


                /* =============================
                   ACTUALIZAR
                   ============================= */

                try {

                    const response =
                        await authFetch(
                            `${API_URL}/ips/${existente.id}`,
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

                } catch (
                    err
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${numeroFila}: ${
                            err instanceof Error
                                ? err.message
                                : "No se pudo actualizar el registro."
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

                await Promise.all([
                    cargarRegistros(),
                    cargarResumen(),
                ]);

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
                    `Importación Segmento ${segmento} finalizada. Nuevos: ${nuevos} | Actualizados: ${actualizados} | Sin cambios: ${sinCambios} | Con error: ${conError} | Total: ${dataRows.length}.`,

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
                    err instanceof Error
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
       RENDER
       ===================================================== */

    return (

        <DRPage
            title="IP"
            description="Gestión de direccionamiento IP"
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

                    data-segment={
                        segmento
                    }
                >

                    {/* =====================================
                        SEGMENTOS
                        ===================================== */}

                    <div
                        className={
                            styles.tabs
                        }
                    >

                        {segmentos.map(
                            (
                                item,
                            ) => (

                                <button
                                    key={
                                        item.key
                                    }

                                    type="button"

                                    className={
                                        segmento ===
                                        item.key
                                            ? styles.tabActive
                                            : styles.tab
                                    }

                                    onClick={() =>
                                        cambiarSegmento(
                                            item.key,
                                        )
                                    }
                                >

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>


                                    <span
                                        className={
                                            styles.tabCount
                                        }
                                    >
                                        {
                                            obtenerCantidad(
                                                item.key,
                                            )
                                        }
                                    </span>

                                </button>

                            ),
                        )}

                    </div>


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

                                placeholder={
                                    `Buscar en todos los campos del Segmento ${segmento}...`
                                }
                            />

                        </div>


                        {esAdministrador && (

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
                                    + Nueva IP
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        EXCEL FEEDBACK
                        ===================================== */}

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
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(
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

                    {esAdministrador &&
                        formOpen && (

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
                                                ? `Editar IP - Segmento ${segmento}`
                                                : `Nueva IP - Segmento ${segmento}`}
                                        </DRText>


                                        {editingId !==
                                            null && (

                                            <p
                                                className={
                                                    styles.formDescription
                                                }
                                            >
                                                La IP y el segmento son valores únicos del registro y no pueden modificarse.
                                            </p>

                                        )}

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

                                    {/* IP */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>

                                            IP *

                                            {editingId !==
                                                null && (

                                                <small
                                                    className={
                                                        styles.uniqueBadge
                                                    }
                                                >
                                                    Único
                                                </small>

                                            )}

                                        </span>


                                        <input
                                            required

                                            disabled={
                                                editingId !==
                                                null
                                            }

                                            value={
                                                form.ip
                                            }

                                            placeholder={
                                                `Ej. 10.6.${segmento}.10`
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        ip:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    {/* HOST NAME */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Host Name
                                        </span>


                                        <input
                                            value={
                                                form.hostName
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        hostName:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    {/* USUARIO */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Usuario
                                        </span>


                                        <input
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


                                    {/* ÁREA */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

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
                                                Seleccionar
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


                                    {/* UBICACIÓN */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

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
                                        />

                                    </label>


                                    {/* OFICINA */}

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Oficina
                                        </span>


                                        <input
                                            value={
                                                form.oficina
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        oficina:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                        />

                                    </label>


                                    {/* OBSERVACIÓN */}

                                    <label
                                        className={[
                                            styles.field,
                                            styles.observationField,
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

                                            maxLength={
                                                500
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
                                                    : "Guardar IP"}
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
                                    Segmento {
                                        segmento
                                    }
                                </DRText>


                                <DRText
                                    variant="bodySmall"
                                    color="secondary"
                                >
                                    {
                                        filtrados.length
                                    }{" "}
                                    IP registradas
                                </DRText>

                            </div>


                            <div
                                className={
                                    styles.tableHeaderActions
                                }
                            >

                                {!esAdministrador && (

                                    <span
                                        className={
                                            styles.readOnlyBadge
                                        }
                                    >
                                        Modo consulta
                                    </span>

                                )}


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

                        </div>


                        <div
                            className={
                                styles.dataGridViewport
                            }
                        >

                            <DataGrid
                                key={
                                    segmento
                                }

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
                                            ? "No existen IP que coincidan con la búsqueda."
                                            : `No existen IP registradas en el Segmento ${segmento}.`,
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