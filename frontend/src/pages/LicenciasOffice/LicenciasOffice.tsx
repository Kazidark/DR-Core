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

import styles from "./LicenciasOffice.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type EstadoLicencia =
    | "Activado"
    | "Desactivado";


type LicenciaOffice = {
    id: number;

    tipoLicencia:
        string;

    nombresCompletos:
        string;

    correo:
        string;

    area:
        string | null;

    usuarioAnterior:
        string | null;

    estado:
        EstadoLicencia;
};


type Area = {
    id: number;
    nombre: string;
    activo: boolean;
};


type CategoriaConfig = {
    label:
        string;

    endpoint:
        string;
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
   CATEGORÍAS
   ========================================================= */

const categorias:
    Record<
        string,
        CategoriaConfig
    > = {

    basico: {
        label:
            "Office Básico",

        endpoint:
            "basico",
    },


    empresarial: {
        label:
            "Office Empresarial",

        endpoint:
            "empresarial",
    },


    powerbi: {
        label:
            "Power BI",

        endpoint:
            "powerbi",
    },

};


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
            "nombresCompletos",

        label:
            "Nombres Completos",
    },
    {
        key:
            "correo",

        label:
            "Correo",
    },
    {
        key:
            "area",

        label:
            "Área",
    },
    {
        key:
            "usuarioAnterior",

        label:
            "Usuario Anterior",
    },
    {
        key:
            "estado",

        label:
            "Estado",
    },
] as const;


/* =========================================================
   UTILIDADES
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


function validarCorreo(
    value:
        string,
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            value,
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
         * Respaldo para respuestas
         * no JSON.
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

export default function LicenciasOffice() {

    const [
        categoria,
        setCategoria,
    ] =
        useState(
            "basico",
        );


    const [
        items,
        setItems,
    ] =
        useState<
            LicenciaOffice[]
        >([]);


    const [
        areas,
        setAreas,
    ] =
        useState<
            Area[]
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
            nombresCompletos:
                "",

            correo:
                "",

            area:
                "",

            usuarioAnterior:
                "",

            estado:
                "Activado" as EstadoLicencia,
        });


    const fileInputRef =
        useRef<
            HTMLInputElement |
            null
        >(
            null,
        );


    const config =
        categorias[
            categoria
        ];


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
                        80,

                    minWidth:
                        80,

                    sortable:
                        true,
                },

                {
                    field:
                        "nombresCompletos",

                    headerName:
                        "Nombres Completos",

                    minWidth:
                        230,

                    flex:
                        1.3,

                    sortable:
                        true,
                },

                {
                    field:
                        "correo",

                    headerName:
                        "Correo",

                    minWidth:
                        250,

                    flex:
                        1.4,

                    sortable:
                        true,
                },

                {
                    field:
                        "area",

                    headerName:
                        "Área",

                    minWidth:
                        190,

                    flex:
                        1,

                    sortable:
                        true,
                },

                {
                    field:
                        "usuarioAnterior",

                    headerName:
                        "Usuario Anterior",

                    minWidth:
                        220,

                    flex:
                        1.1,

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

                    flex:
                        0.7,

                    sortable:
                        true,

                    renderCell:
                        (
                            params:
                                GridRenderCellParams,
                        ) => (

                            <span
                                className={
                                    params.value ===
                                    "Activado"
                                        ? styles.statusActive
                                        : styles.statusInactive
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
            [],
        );


    /* =====================================================
       CARGAR LICENCIAS
       ===================================================== */

    const cargarLicencias =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/licencias-office/${config.endpoint}`,
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
                            LicenciaOffice[];


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
                            : "No se pudieron cargar las licencias.",
                    );

                } finally {

                    setLoading(
                        false,
                    );

                }

            },
            [
                config.endpoint,
            ],
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

                        return;

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

                    console.error(
                        err,
                    );

                }

            },
            [],
        );


    useEffect(
        () => {

            void cargarLicencias();

        },
        [
            cargarLicencias,
        ],
    );


    useEffect(
        () => {

            void cargarAreas();

        },
        [
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
                        [
                            item.id,
                            item.nombresCompletos,
                            item.correo,
                            item.area,
                            item.usuarioAnterior,
                            item.estado,
                        ].some(
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
       REGISTROS EXPORTACIÓN
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


                const sort =
                    sortModel[
                        0
                    ];


                if (
                    !sort?.field ||
                    !sort.sort
                ) {

                    return filtrados;

                }


                const direction =
                    sort.sort ===
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
                                sort.field
                            ],

                            (
                                b as unknown as
                                    Record<
                                        string,
                                        unknown
                                    >
                            )[
                                sort.field
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
       CAMBIAR CATEGORÍA
       ===================================================== */

    function cambiarCategoria(
        key:
            string,
    ) {

        setCategoria(
            key,
        );

        setSearch("");

        setSortModel([]);

        setSelectedId(
            null,
        );

        setEditingId(
            null,
        );

        setFormOpen(
            false,
        );

        setError("");

        setExcelFeedback(
            null,
        );

    }


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
            nombresCompletos:
                "",

            correo:
                "",

            area:
                "",

            usuarioAnterior:
                "",

            estado:
                "Activado",
        });


        setFormOpen(
            true,
        );

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
            nombresCompletos:
                selectedItem
                    .nombresCompletos ??
                "",

            correo:
                selectedItem
                    .correo ??
                "",

            area:
                selectedItem
                    .area ??
                "",

            usuarioAnterior:
                selectedItem
                    .usuarioAnterior ??
                "",

            estado:
                selectedItem
                    .estado,
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


        const correo =
            form.correo
                .trim()
                .toLocaleLowerCase();


        if (
            editingId ===
                null &&
            !validarCorreo(
                correo,
            )
        ) {

            setError(
                "El correo debe tener un formato válido.",
            );

            return;

        }


        setLoading(
            true,
        );


        try {

            const payload =
                editingId ===
                null
                    ? {
                        nombresCompletos:
                            form
                                .nombresCompletos
                                .trim(),

                        correo,

                        area:
                            form.area
                                .trim(),

                        usuarioAnterior:
                            form
                                .usuarioAnterior
                                .trim(),

                        estado:
                            form.estado,
                    }
                    : {
                        nombresCompletos:
                            form
                                .nombresCompletos
                                .trim(),

                        area:
                            form.area
                                .trim(),

                        usuarioAnterior:
                            form
                                .usuarioAnterior
                                .trim(),

                        estado:
                            form.estado,
                    };


            const url =
                editingId ===
                null
                    ? `${API_URL}/licencias-office/${config.endpoint}`
                    : `${API_URL}/licencias-office/${config.endpoint}/${editingId}`;


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


            await cargarLicencias();

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
                    config.label,
                    {
                        views: [
                            {
                                state:
                                    "frozen",

                                ySplit:
                                    1,
                            },
                        ],
                    },
                );


            const colores:
                Record<
                    string,
                    {
                        header:
                            string;

                        border:
                            string;

                        stripe:
                            string;
                    }
                > = {

                basico: {
                    header:
                        "FF2563EB",

                    border:
                        "FF1D4ED8",

                    stripe:
                        "FFEFF6FF",
                },

                empresarial: {
                    header:
                        "FF7C3AED",

                    border:
                        "FF6D28D9",

                    stripe:
                        "FFF5F3FF",
                },

                powerbi: {
                    header:
                        "FFD97706",

                    border:
                        "FFB45309",

                    stripe:
                        "FFFFFBEB",
                },

            };


            const color =
                colores[
                    categoria
                ];


            const header =
                worksheet.addRow(
                    excelColumns.map(
                        (
                            column,
                        ) =>
                            column.label,
                    ),
                );


            header.height =
                30;


            header.eachCell(
                (
                    cell,
                ) => {

                    cell.font = {
                        name:
                            "Aptos",

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

                        bottom: {
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
                            item.id,
                            item.nombresCompletos,
                            item.correo,
                            item.area ?? "",
                            item.usuarioAnterior ?? "",
                            item.estado,
                        ]);


                    row.height =
                        23;


                    row.eachCell(
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


                            if (
                                index % 2 ===
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

                                bottom: {
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


            worksheet.getColumn(
                1,
            ).width =
                10;

            worksheet.getColumn(
                2,
            ).width =
                32;

            worksheet.getColumn(
                3,
            ).width =
                38;

            worksheet.getColumn(
                4,
            ).width =
                25;

            worksheet.getColumn(
                5,
            ).width =
                30;

            worksheet.getColumn(
                6,
            ).width =
                18;


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
                `LicenciasOffice_${config.endpoint}_${new Date()
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
                        url,
                    ),
                1000,
            );


            setExcelFeedback({
                type:
                    "success",

                message:
                    `${registrosParaExportar.length} registros de ${config.label} exportados correctamente.`,
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
                    "Solo se permiten archivos .xlsx o .xls.",
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


            const sheetName =
                workbook
                    .SheetNames[
                    0
                ];


            if (
                !sheetName
            ) {

                throw new Error(
                    "El archivo no contiene hojas.",
                );

            }


            const worksheet =
                workbook.Sheets[
                    sheetName
                ];


            if (
                !worksheet
            ) {

                throw new Error(
                    "No se pudo leer la hoja del archivo Excel.",
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
                rows.length <
                2
            ) {

                throw new Error(
                    "El archivo no contiene registros para importar.",
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


            const headersCorrectos =
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
                !headersCorrectos
            ) {

                throw new Error(
                    `La cabecera debe ser exactamente: ${expectedHeaders.join(" | ")}`,
                );

            }


            const existentesPorId =
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


            const correosExistentes =
                new Set(
                    items.map(
                        (
                            item,
                        ) =>
                            normalizar(
                                item.correo,
                            ),
                    ),
                );


            const correosArchivo =
                new Set<
                    string
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


            const dataRows =
                rows.slice(
                    1,
                );


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


                const filaExcel =
                    index +
                    2;


                const idText =
                    String(
                        row[
                            0
                        ] ??
                        "",
                    ).trim();


                const nombresCompletos =
                    String(
                        row[
                            1
                        ] ??
                        "",
                    ).trim();


                const correo =
                    String(
                        row[
                            2
                        ] ??
                        "",
                    )
                        .trim()
                        .toLocaleLowerCase();


                const area =
                    String(
                        row[
                            3
                        ] ??
                        "",
                    ).trim();


                const usuarioAnterior =
                    String(
                        row[
                            4
                        ] ??
                        "",
                    ).trim();


                const estadoRaw =
                    String(
                        row[
                            5
                        ] ??
                        "",
                    ).trim();


                const estado =
                    estadoRaw
                        .toLocaleLowerCase() ===
                        "activado"
                        ? "Activado"
                        : estadoRaw
                            .toLocaleLowerCase() ===
                            "desactivado"
                            ? "Desactivado"
                            : null;


                if (
                    !nombresCompletos
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${filaExcel}: Nombres Completos es obligatorio.`,
                    );

                    continue;

                }


                if (
                    !correo ||
                    !validarCorreo(
                        correo,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${filaExcel}: el correo "${correo}" no es válido.`,
                    );

                    continue;

                }


                if (
                    !estado
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${filaExcel}: Estado debe ser Activado o Desactivado.`,
                    );

                    continue;

                }


                /* =========================================
                   ACTUALIZACIÓN
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
                            `Fila ${filaExcel}: ID inválido.`,
                        );

                        continue;

                    }


                    const id =
                        Number(
                            idText,
                        );


                    const actual =
                        existentesPorId.get(
                            id,
                        );


                    if (
                        !actual
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${filaExcel}: el ID ${id} no existe en ${config.label}.`,
                        );

                        continue;

                    }


                    if (
                        normalizar(
                            actual.correo,
                        ) !==
                        normalizar(
                            correo,
                        )
                    ) {

                        conError +=
                            1;

                        errores.push(
                            `Fila ${filaExcel}: el correo es único y no puede modificarse durante una actualización.`,
                        );

                        continue;

                    }


                    const payload:
                        Record<
                            string,
                            string
                        > = {};


                    if (
                        actual.nombresCompletos !==
                        nombresCompletos
                    ) {

                        payload.nombresCompletos =
                            nombresCompletos;

                    }


                    if (
                        (
                            actual.area ??
                            ""
                        ) !==
                        area
                    ) {

                        payload.area =
                            area;

                    }


                    if (
                        (
                            actual.usuarioAnterior ??
                            ""
                        ) !==
                        usuarioAnterior
                    ) {

                        payload.usuarioAnterior =
                            usuarioAnterior;

                    }


                    if (
                        actual.estado !==
                        estado
                    ) {

                        payload.estado =
                            estado;

                    }


                    if (
                        Object.keys(
                            payload,
                        ).length ===
                        0
                    ) {

                        sinCambios +=
                            1;

                        continue;

                    }


                    try {

                        const response =
                            await authFetch(
                                `${API_URL}/licencias-office/${config.endpoint}/${id}`,
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
                            `Fila ${filaExcel}: ${
                                err instanceof
                                    Error
                                    ? err.message
                                    : "No se pudo actualizar."
                            }`,
                        );

                    }


                    continue;

                }


                /* =========================================
                   NUEVO
                   ========================================= */

                const correoNormalizado =
                    normalizar(
                        correo,
                    );


                if (
                    correosExistentes.has(
                        correoNormalizado,
                    ) ||
                    correosArchivo.has(
                        correoNormalizado,
                    )
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${filaExcel}: el correo "${correo}" ya existe en ${config.label}.`,
                    );

                    continue;

                }


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/licencias-office/${config.endpoint}`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify({
                                        nombresCompletos,
                                        correo,
                                        area,
                                        usuarioAnterior,
                                        estado,
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


                    correosArchivo.add(
                        correoNormalizado,
                    );


                    correosExistentes.add(
                        correoNormalizado,
                    );


                    nuevos +=
                        1;

                } catch (
                    err
                ) {

                    conError +=
                        1;

                    errores.push(
                        `Fila ${filaExcel}: ${
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

                await cargarLicencias();

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
                        : "No se pudo importar el archivo.",
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
            title="Licencias Office"
            description="Gestión centralizada de licencias Microsoft"
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

                    data-category={
                        categoria
                    }
                >

                    {/* =====================================
                        CATEGORÍAS
                        ===================================== */}

                    <div
                        className={
                            styles.tabs
                        }
                    >

                        {Object
                            .entries(
                                categorias,
                            )
                            .map(
                                ([
                                    key,
                                    category,
                                ]) => (

                                    <button
                                        key={
                                            key
                                        }

                                        type="button"

                                        className={
                                            categoria ===
                                            key
                                                ? styles.tabActive
                                                : styles.tab
                                        }

                                        onClick={() =>
                                            cambiarCategoria(
                                                key,
                                            )
                                        }
                                    >
                                        {
                                            category.label
                                        }
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
                                    `Buscar en todos los campos de ${config.label}...`
                                }
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
                                                ? `Editar ${config.label}`
                                                : `Nuevo registro - ${config.label}`}
                                        </DRText>


                                        {editingId !==
                                            null && (

                                            <p
                                                className={
                                                    styles.formDescription
                                                }
                                            >
                                                El correo es un valor único y no puede modificarse.
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

                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Nombres Completos *
                                        </span>

                                        <input
                                            required

                                            value={
                                                form.nombresCompletos
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        nombresCompletos:
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

                                            Correo *

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
                                            type="email"

                                            required

                                            disabled={
                                                editingId !==
                                                null
                                            }

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
                                                                EstadoLicencia,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="Activado">
                                                Activado
                                            </option>

                                            <option value="Desactivado">
                                                Desactivado
                                            </option>

                                        </select>

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
                                    {
                                        config.label
                                    }
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
                                key={
                                    categoria
                                }

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
                                            : "No existen registros para esta categoría.",
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