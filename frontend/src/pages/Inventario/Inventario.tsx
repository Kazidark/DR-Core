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

import styles from "./Inventario.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type InventarioItem = {
    id: number;
    [key: string]: unknown;
};

type Area = {
    id: number;
    nombre: string;
    activo: boolean;
};

type FieldOption = {
    label: string;
    value: string;
};

type FieldConfig = {
    key: string;
    label: string;

    type?:
        | "text"
        | "select"
        | "password";

    required?: boolean;

    options?: FieldOption[];

    source?: "areas";

    /**
     * Si es true:
     * - se puede ingresar al crear
     * - queda bloqueado al editar
     */
    unique?: boolean;
};

type ColumnConfig = {
    key: string;
    label: string;
};

type CategoriaConfig = {
    label: string;
    endpoint: string;

    columns: ColumnConfig[];

    fields: FieldConfig[];
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
   CATÁLOGOS
   ========================================================= */

const estadosEquipo: FieldOption[] = [
    {
        label: "Operativo",
        value: "Operativo",
    },
    {
        label: "Inoperativo",
        value: "Inoperativo",
    },
    {
        label: "Donado",
        value: "Donado",
    },
    {
        label: "Vendido",
        value: "Vendido",
    },
    {
        label: "Stock",
        value: "Stock",
    },
];


/* =========================================================
   CONFIGURACIÓN DE CATEGORÍAS
   ========================================================= */

const categorias: Record<
    string,
    CategoriaConfig
> = {

    /* =====================================================
       PC / LAPTOPS
       ===================================================== */

    pclaptops: {
        label: "PC / Laptops",
        endpoint: "pclaptops",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "tipo",
                label: "Tipo",
            },
            {
                key: "serial",
                label: "Serial",
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "anexo",
                label: "Anexo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "ultimoUsuario",
                label: "Último usuario",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "oficina",
                label: "Oficina",
            },
            {
                key: "ubicacion",
                label: "Ubicación",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
            {
                key: "posicion",
                label: "Posición",
            },
        ],

        fields: [
            {
                key: "tipo",
                label: "Tipo",
                type: "select",
                required: true,

                options: [
                    {
                        label: "Laptop",
                        value: "Laptop",
                    },
                    {
                        label: "Desktop",
                        value: "Desktop",
                    },
                ],
            },
            {
                key: "serial",
                label: "Serial",
                required: true,
                unique: true,
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "anexo",
                label: "Anexo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
                type: "select",
                options: estadosEquipo,
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "ultimoUsuario",
                label: "Último usuario",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "oficina",
                label: "Oficina",
            },
            {
                key: "ubicacion",
                label: "Ubicación",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
            {
                key: "posicion",
                label: "Posición",
            },
        ],
    },


    /* =====================================================
       MONITORES
       ===================================================== */

    monitores: {
        label: "Monitores",
        endpoint: "monitores",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "serial",
                label: "Serial",
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "anexo",
                label: "Anexo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "ultimoUsuario",
                label: "Último usuario",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "oficina",
                label: "Oficina",
            },
            {
                key: "ubicacion",
                label: "Ubicación",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
            {
                key: "posicion",
                label: "Posición",
            },
        ],

        fields: [
            {
                key: "serial",
                label: "Serial",
                required: true,
                unique: true,
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "anexo",
                label: "Anexo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
                type: "select",
                options: estadosEquipo,
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "ultimoUsuario",
                label: "Último usuario",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "oficina",
                label: "Oficina",
            },
            {
                key: "ubicacion",
                label: "Ubicación",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
            {
                key: "posicion",
                label: "Posición",
            },
        ],
    },


    /* =====================================================
       TABLETS
       ===================================================== */

    tablets: {
        label: "Tablets",
        endpoint: "tablets",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "imei",
                label: "IMEI",
            },
            {
                key: "serie",
                label: "Serie",
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "idTablet",
                label: "ID Tablet",
            },
            {
                key: "kiosko",
                label: "Kiosko",
            },
            {
                key: "tabletReposicion",
                label: "Tablet reposición",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
        ],

        fields: [
            {
                key: "imei",
                label: "IMEI",
                required: true,
                unique: true,
            },
            {
                key: "serie",
                label: "Serie",
                required: true,
                unique: true,
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
                type: "select",
                options: estadosEquipo,
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "idTablet",
                label: "ID Tablet",
                required: true,
                unique: true,
            },
            {
                key: "kiosko",
                label: "Kiosko",
            },
            {
                key: "tabletReposicion",
                label: "Tablet reposición",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
        ],
    },


    /* =====================================================
       MÓDEMS
       ===================================================== */

    modems: {
        label: "Módems",
        endpoint: "modems",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "imei",
                label: "IMEI",
            },
            {
                key: "serie",
                label: "Serie",
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "observacion",
                label: "Observación",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "nombreRed",
                label: "Nombre de Red",
            },
            {
                key: "contrasenaRed",
                label: "Contraseña de Red",
            },
        ],

        fields: [
            {
                key: "imei",
                label: "IMEI",
                required: true,
                unique: true,
            },
            {
                key: "serie",
                label: "Serie",
                required: true,
                unique: true,
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
                type: "select",
                options: estadosEquipo,
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "observacion",
                label: "Observación",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "nombreRed",
                label: "Nombre de Red",
            },
            {
                key: "contrasenaRed",
                label: "Contraseña de Red",
            },
        ],
    },


    /* =====================================================
       CELULARES
       ===================================================== */

    celulares: {
        label: "Celulares",
        endpoint: "celulares",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "imei",
                label: "IMEI",
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "serie",
                label: "Serie",
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "observacion",
                label: "Observación",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
        ],

        fields: [
            {
                key: "imei",
                label: "IMEI",
                required: true,
                unique: true,
            },
            {
                key: "marca",
                label: "Marca",
            },
            {
                key: "modelo",
                label: "Modelo",
            },
            {
                key: "caracteristicas",
                label: "Características",
            },
            {
                key: "serie",
                label: "Serie",
                required: true,
                unique: true,
            },
            {
                key: "estadoEquipo",
                label: "Estado de equipo",
                type: "select",
                options: estadosEquipo,
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "observacion",
                label: "Observación",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
        ],
    },


    /* =====================================================
       CHIPS
       ===================================================== */

    chips: {
        label: "Chips",
        endpoint: "chips",

        columns: [
            {
                key: "id",
                label: "ID",
            },
            {
                key: "numero",
                label: "Número",
            },
            {
                key: "iccid",
                label: "ICCID",
            },
            {
                key: "operador",
                label: "Operador",
            },
            {
                key: "uso",
                label: "Uso",
            },
            {
                key: "estado",
                label: "Estado",
            },
            {
                key: "area",
                label: "Área",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "lote",
                label: "Lote",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
        ],

        fields: [
            {
                key: "numero",
                label: "Número",
                required: true,
                unique: true,
            },
            {
                key: "iccid",
                label: "ICCID",
                required: true,
                unique: true,
            },
            {
                key: "operador",
                label: "Operador",
            },
            {
                key: "uso",
                label: "Uso",
                type: "select",
                required: true,

                options: [
                    {
                        label: "Datos",
                        value: "Datos",
                    },
                    {
                        label: "Voz",
                        value: "Voz",
                    },
                ],
            },
            {
                key: "estado",
                label: "Estado",
                type: "select",
                required: true,

                options: [
                    {
                        label: "Activa",
                        value: "Activa",
                    },
                    {
                        label: "Baja",
                        value: "Baja",
                    },
                ],
            },
            {
                key: "area",
                label: "Área",
                type: "select",
                source: "areas",
            },
            {
                key: "usuario",
                label: "Usuario",
            },
            {
                key: "lote",
                label: "Lote",
            },
            {
                key: "ticket",
                label: "Ticket",
            },
            {
                key: "correo",
                label: "Correo",
            },
            {
                key: "observaciones",
                label: "Observaciones",
            },
        ],
    },
};


/* =========================================================
   UTILIDADES DE TABLA
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


    if (textA === "") {
        return 1;
    }


    if (textB === "") {
        return -1;
    }


    /*
     * Para valores que contienen únicamente
     * dígitos evitamos Number(), ya que IMEI
     * e ICCID pueden ser demasiado largos.
     */
    if (
        /^\d+$/.test(textA) &&
        /^\d+$/.test(textB)
    ) {

        const normalizedA =
            textA.replace(
                /^0+(?=\d)/,
                "",
            );

        const normalizedB =
            textB.replace(
                /^0+(?=\d)/,
                "",
            );


        if (
            normalizedA.length !==
            normalizedB.length
        ) {

            return (
                normalizedA.length -
                normalizedB.length
            );

        }


        const numericComparison =
            normalizedA.localeCompare(
                normalizedB,
            );


        if (
            numericComparison !== 0
        ) {
            return numericComparison;
        }


        return textA.localeCompare(
            textB,
        );
    }


    return collator.compare(
        textA,
        textB,
    );
}


function obtenerAnchoColumna(
    key: string,
): {
    minWidth: number;
    flex?: number;
    width?: number;
} {

    if (key === "id") {

        return {
            minWidth: 78,
            width: 78,
        };

    }


    if (
        key === "correo"
    ) {

        return {
            minWidth: 235,
            flex: 1.4,
        };

    }


    if (
        key === "caracteristicas" ||
        key === "observaciones" ||
        key === "observacion"
    ) {

        return {
            minWidth: 220,
            flex: 1.4,
        };

    }


    if (
        key === "usuario" ||
        key === "ultimoUsuario" ||
        key === "ubicacion" ||
        key === "nombreRed"
    ) {

        return {
            minWidth: 180,
            flex: 1.1,
        };

    }


    if (
        key === "imei" ||
        key === "iccid" ||
        key === "serie" ||
        key === "serial"
    ) {

        return {
            minWidth: 170,
            flex: 1,
        };

    }


    if (
        key === "estadoEquipo"
    ) {

        return {
            minWidth: 170,
            flex: 1,
        };

    }


    return {
        minWidth: 140,
        flex: 1,
    };
}


/* =========================================================
   OBTENER MENSAJE DE ERROR DEL BACKEND
   ========================================================= */

async function obtenerMensajeError(
    response: Response,
): Promise<string> {

    try {

        const body =
            (await response.json()) as {
                message?: string | string[];
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
         * Si el backend no devuelve JSON,
         * utilizamos el estado HTTP como respaldo.
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

export default function Inventario() {

    const {
        usuario,
    } = useAuth();


    const puedeAdministrar =
        usuario?.rol ===
        "Administrador";


    const [
        categoria,
        setCategoria,
    ] = useState(
        "pclaptops",
    );


    const [
        items,
        setItems,
    ] = useState<
        InventarioItem[]
    >([]);


    const [
        areas,
        setAreas,
    ] = useState<
        Area[]
    >([]);


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        sortModel,
        setSortModel,
    ] = useState<
        GridSortModel
    >([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        formOpen,
        setFormOpen,
    ] = useState(false);


    const [
        editingId,
        setEditingId,
    ] = useState<
        number | null
    >(null);


    const [
        selectedId,
        setSelectedId,
    ] = useState<
        number | null
    >(null);


    const [
        form,
        setForm,
    ] = useState<
        Record<
            string,
            string
        >
    >({});


    const [
        importing,
        setImporting,
    ] = useState(false);


    const [
        excelFeedback,
        setExcelFeedback,
    ] = useState<ExcelFeedback>(null);


    const fileInputRef =
        useRef<HTMLInputElement | null>(null);


    const config =
        categorias[
            categoria
        ];


    /* =====================================================
       REGISTRO SELECCIONADO
       ===================================================== */

    const selectedItem =
        useMemo(() => {

            if (
                selectedId ===
                null
            ) {
                return null;
            }


            return (
                items.find(
                    (item) =>
                        item.id ===
                        selectedId,
                ) ?? null
            );

        }, [
            items,
            selectedId,
        ]);


    /* =====================================================
       MODELO DE SELECCIÓN MUI
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
       COLUMNAS DEL DATAGRID
       ===================================================== */

    const gridColumns =
        useMemo<
            GridColDef[]
        >(
            () =>
                config.columns.map(
                    (
                        column,
                    ) => {

                        const sizing =
                            obtenerAnchoColumna(
                                column.key,
                            );


                        return {
                            field:
                                column.key,

                            headerName:
                                column.label,

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

                            ...sizing,

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
                                (
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
                        };

                    },
                ),
            [
                config.columns,
            ],
        );


    /* =====================================================
       CARGAR INVENTARIO
       ===================================================== */

    const cargarInventario =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/inventario/${config.endpoint}`,
                        );


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar el inventario.",
                        );

                    }


                    const data =
                        (await response.json()) as InventarioItem[];


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


                            const existe =
                                data.some(
                                    (
                                        item,
                                    ) =>
                                        item.id ===
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

                        throw new Error(
                            "No se pudieron cargar las áreas.",
                        );

                    }


                    const data =
                        (await response.json()) as Area[];


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


    useEffect(() => {

        void cargarInventario();

    }, [
        cargarInventario,
    ]);


    useEffect(() => {

        void cargarAreas();

    }, [
        cargarAreas,
    ]);


    /* =====================================================
       BUSCADOR GENERAL
       ===================================================== */

    const filtrados =
        useMemo(() => {

            const texto =
                search
                    .trim()
                    .toLocaleLowerCase();


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
                                String(
                                    value ??
                                        "",
                                )
                                    .toLocaleLowerCase()
                                    .includes(
                                        texto,
                                    ),
                        ),
            );

        }, [
            items,
            search,
        ]);


    /* =====================================================
       REGISTROS VISIBLES PARA EXPORTACIÓN
       ===================================================== */

    const registrosParaExportar =
        useMemo(() => {

            if (
                sortModel.length === 0
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
                (a, b) =>
                    compararValores(
                        a[
                            currentSort.field
                        ],
                        b[
                            currentSort.field
                        ],
                    ) *
                    direction,
            );

        }, [
            filtrados,
            sortModel,
        ]);


    /* =====================================================
       CAMBIO DE CATEGORÍA
       ===================================================== */

    function cambiarCategoria(
        key: string,
    ) {

        setCategoria(
            key,
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

        setForm({});

        setError("");

        setExcelFeedback(
            null,
        );

        if (
            fileInputRef.current
        ) {
            fileInputRef.current.value =
                "";
        }

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


        const inicial:
            Record<
                string,
                string
            > = {};


        config.fields.forEach(
            (
                field,
            ) => {

                inicial[
                    field.key
                ] = "";

            },
        );


        setForm(
            inicial,
        );

        setFormOpen(
            true,
        );

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


        const valores:
            Record<
                string,
                string
            > = {};


        config.fields.forEach(
            (
                field,
            ) => {

                valores[
                    field.key
                ] =
                    String(
                        selectedItem[
                            field.key
                        ] ?? "",
                    );

            },
        );


        setForm(
            valores,
        );

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

        setFormOpen(
            false,
        );

        setEditingId(
            null,
        );

        setForm({});

    }


    /* =====================================================
       GUARDAR
       ===================================================== */

    async function guardar(
        event:
            React.FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();


        setLoading(
            true,
        );

        setError("");


        const payload:
            Record<
                string,
                string
            > = {};


        config.fields.forEach(
            (
                field,
            ) => {

                /*
                 * Los campos únicos no
                 * se envían durante edición.
                 */
                if (
                    editingId !==
                        null &&
                    field.unique
                ) {
                    return;
                }


                const value =
                    form[
                        field.key
                    ]?.trim();


                if (
                    value
                ) {

                    payload[
                        field.key
                    ] =
                        value;

                }

            },
        );


        try {

            const url =
                editingId ===
                null
                    ? `${API_URL}/inventario/${config.endpoint}`
                    : `${API_URL}/inventario/${config.endpoint}/${editingId}`;


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

                const body =
                    await response.json();


                const message =
                    Array.isArray(
                        body.message,
                    )
                        ? body.message.join(
                              ", ",
                          )
                        : body.message;


                throw new Error(
                    message ??
                        "No se pudo guardar el registro.",
                );

            }


            cancelar();


            await cargarInventario();

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

    }


    /* =====================================================
       OPCIONES DINÁMICAS
       ===================================================== */

    function obtenerOpciones(
        field:
            FieldConfig,
    ): FieldOption[] {

        if (
            field.source ===
            "areas"
        ) {

            return areas.map(
                (
                    area,
                ) => ({
                    label:
                        area.nombre,

                    value:
                        area.nombre,
                }),
            );

        }


        return (
            field.options ??
            []
        );

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

            workbook.lastModifiedBy =
                "DR+ Core";

            workbook.created =
                new Date();

            workbook.modified =
                new Date();


            const sheetName =
                config.label
                    .replace(
                        /[\\/?*\[\]:]/g,
                        "-",
                    )
                    .slice(
                        0,
                        31,
                    );


            const worksheet =
                workbook.addWorksheet(
                    sheetName,
                    {
                        views: [
                            {
                                state: "frozen",
                                ySplit: 1,
                                activeCell: "A2",
                            },
                        ],

                        properties: {
                            defaultRowHeight: 21,
                        },

                        pageSetup: {
                            orientation: "landscape",
                            fitToPage: true,
                            fitToWidth: 1,
                            fitToHeight: 0,
                            paperSize: 9,
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


            /*
             * Evitamos worksheet.addTable().
             *
             * ExcelJS genera correctamente tablas de Excel, pero
             * combinar la definición de una tabla estructurada con
             * estilos y autofiltros adicionales puede producir avisos
             * de reparación en determinadas versiones de Office.
             *
             * Para máxima compatibilidad generamos una tabla VISUAL:
             * encabezado, autofiltro, bordes y filas alternadas, sin
             * crear XML de tabla estructurada adicional.
             */

            const coloresCategoria:
                Record<
                    string,
                    {
                        header: string;
                        headerBorder: string;
                        stripe: string;
                    }
                > = {
                    pclaptops: {
                        header: "FF2563EB",
                        headerBorder: "FF1D4ED8",
                        stripe: "FFEFF6FF",
                    },
                    monitores: {
                        header: "FF0891B2",
                        headerBorder: "FF0E7490",
                        stripe: "FFECFEFF",
                    },
                    tablets: {
                        header: "FF7C3AED",
                        headerBorder: "FF6D28D9",
                        stripe: "FFF5F3FF",
                    },
                    modems: {
                        header: "FFEA580C",
                        headerBorder: "FFC2410C",
                        stripe: "FFFFF7ED",
                    },
                    celulares: {
                        header: "FFE11D48",
                        headerBorder: "FFBE123C",
                        stripe: "FFFFF1F2",
                    },
                    chips: {
                        header: "FF059669",
                        headerBorder: "FF047857",
                        stripe: "FFECFDF5",
                    },
                };


            const colores =
                coloresCategoria[
                    categoria
                ] ??
                coloresCategoria.pclaptops;


            const columnasTexto =
                new Set([
                    "serial",
                    "serie",
                    "imei",
                    "iccid",
                    "numero",
                    "idTablet",
                    "anexo",
                    "ticket",
                    "posicion",
                ]);


            /* =================================================
               ENCABEZADOS
               ================================================= */

            const headerRow =
                worksheet.addRow(
                    config.columns.map(
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
                    includeEmpty: true,
                },
                (
                    cell,
                ) => {

                    cell.font = {
                        name: "Aptos",
                        size: 11,
                        bold: true,
                        color: {
                            argb: "FFFFFFFF",
                        },
                    };

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb:
                                colores.header,
                        },
                    };

                    cell.alignment = {
                        vertical: "middle",
                        horizontal: "center",
                        wrapText: true,
                    };

                    cell.border = {
                        top: {
                            style: "thin",
                            color: {
                                argb:
                                    colores.headerBorder,
                            },
                        },
                        left: {
                            style: "thin",
                            color: {
                                argb:
                                    colores.headerBorder,
                            },
                        },
                        bottom: {
                            style: "thin",
                            color: {
                                argb:
                                    colores.headerBorder,
                            },
                        },
                        right: {
                            style: "thin",
                            color: {
                                argb:
                                    colores.headerBorder,
                            },
                        },
                    };

                },
            );


            /* =================================================
               DATOS
               ================================================= */

            registrosParaExportar.forEach(
                (
                    item,
                    itemIndex,
                ) => {

                    const row =
                        worksheet.addRow(
                            config.columns.map(
                                (
                                    column,
                                ) => {

                                    const value =
                                        item[
                                            column.key
                                        ];


                                    if (
                                        value === null ||
                                        value === undefined
                                    ) {
                                        return "";
                                    }


                                    if (
                                        columnasTexto.has(
                                            column.key,
                                        )
                                    ) {
                                        return String(
                                            value,
                                        );
                                    }


                                    return value as
                                        | string
                                        | number
                                        | boolean
                                        | Date;

                                },
                            ),
                        );


                    row.height =
                        23;


                    const esFilaAlterna =
                        itemIndex % 2 === 1;


                    row.eachCell(
                        {
                            includeEmpty: true,
                        },
                        (
                            cell,
                        ) => {

                            cell.font = {
                                name: "Aptos",
                                size: 10,
                                color: {
                                    argb: "FF334155",
                                },
                            };

                            cell.alignment = {
                                vertical: "top",
                                horizontal: "left",
                                wrapText: true,
                            };

                            if (
                                esFilaAlterna
                            ) {
                                cell.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: {
                                        argb:
                                            colores.stripe,
                                    },
                                };
                            }

                            cell.border = {
                                top: {
                                    style: "thin",
                                    color: {
                                        argb: "FFE2E8F0",
                                    },
                                },
                                left: {
                                    style: "thin",
                                    color: {
                                        argb: "FFE2E8F0",
                                    },
                                },
                                bottom: {
                                    style: "thin",
                                    color: {
                                        argb: "FFE2E8F0",
                                    },
                                },
                                right: {
                                    style: "thin",
                                    color: {
                                        argb: "FFE2E8F0",
                                    },
                                },
                            };

                        },
                    );

                },
            );


            /* =================================================
               COLUMNAS
               ================================================= */

            config.columns.forEach(
                (
                    column,
                    columnIndex,
                ) => {

                    const excelColumn =
                        worksheet.getColumn(
                            columnIndex + 1,
                        );


                    const longestValue =
                        registrosParaExportar.reduce(
                            (
                                currentMax,
                                item,
                            ) => {

                                const value =
                                    String(
                                        item[
                                            column.key
                                        ] ?? "",
                                    );


                                return Math.max(
                                    currentMax,
                                    value.length,
                                );

                            },
                            column.label.length,
                        );


                    let width =
                        Math.min(
                            Math.max(
                                longestValue +
                                    3,
                                12,
                            ),
                            38,
                        );


                    if (
                        column.key ===
                            "correo" ||
                        column.key ===
                            "caracteristicas" ||
                        column.key ===
                            "observaciones" ||
                        column.key ===
                            "observacion"
                    ) {
                        width =
                            Math.min(
                                Math.max(
                                    width,
                                    24,
                                ),
                                45,
                            );
                    }


                    if (
                        column.key ===
                        "id"
                    ) {
                        width = 10;
                    }


                    excelColumn.width =
                        width;


                    if (
                        columnasTexto.has(
                            column.key,
                        )
                    ) {
                        excelColumn.numFmt =
                            "@";
                    }

                },
            );


            /* =================================================
               AUTOFILTRO
               ================================================= */

            if (
                config.columns.length > 0
            ) {

                worksheet.autoFilter = {
                    from: {
                        row: 1,
                        column: 1,
                    },
                    to: {
                        row: Math.max(
                            worksheet.rowCount,
                            1,
                        ),
                        column:
                            config.columns.length,
                    },
                };

            }


            /* =================================================
               CONFIGURACIÓN DE IMPRESIÓN
               ================================================= */

            worksheet.headerFooter = {
                oddHeader:
                    `&L&BDR+ Core&R${config.label}`,
                oddFooter:
                    "&LInventario TI&C&P de &N&R&D",
            };


            worksheet.pageSetup.printTitlesRow =
                "1:1";


            /* =================================================
               GENERAR ARCHIVO
               ================================================= */

            const buffer =
                await workbook.xlsx.writeBuffer();


            const blob =
                new Blob(
                    [
                        buffer,
                    ],
                    {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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


            const fileName =
                `Inventario_${config.endpoint}_${new Date()
                    .toISOString()
                    .slice(0, 10)}.xlsx`;


            link.href =
                downloadUrl;

            link.download =
                fileName;


            document.body.appendChild(
                link,
            );

            link.click();

            link.remove();


            window.setTimeout(
                () => {
                    URL.revokeObjectURL(
                        downloadUrl,
                    );
                },
                1000,
            );


            setExcelFeedback({
                type: "success",
                message:
                    `${registrosParaExportar.length} registros de ${config.label} exportados correctamente con formato compatible de Excel.`,
            });

        } catch (
            err
        ) {

            setExcelFeedback({
                type: "error",
                message:
                    err instanceof Error
                        ? err.message
                        : "No se pudo exportar el archivo Excel.",
            });

        }

    }


    /* =====================================================
       ABRIR SELECTOR DE ARCHIVO EXCEL
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

            /*
             * Limpiamos el valor para permitir que el usuario
             * vuelva a seleccionar el mismo archivo si lo desea.
             */
            fileInputRef.current.value = "";

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
            extension !== "xlsx" &&
            extension !== "xls"
        ) {

            setExcelFeedback({
                type: "error",
                message:
                    "Solo se permiten archivos Excel con extensión .xlsx o .xls.",
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
                workbook.SheetNames[0];


            if (
                !firstSheetName
            ) {

                throw new Error(
                    "El archivo Excel no contiene hojas para procesar.",
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
                    "No se pudo leer la primera hoja del archivo Excel.",
                );

            }


            const rawRows =
                XLSX.utils.sheet_to_json<
                    unknown[]
                >(
                    worksheet,
                    {
                        header: 1,
                        defval: "",
                        raw: false,
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
                rows.length === 0
            ) {

                throw new Error(
                    "El archivo Excel está vacío.",
                );

            }


            const expectedHeaders =
                config.columns.map(
                    (
                        column,
                    ) =>
                        column.label,
                );


            const receivedHeaders =
                rows[0].map(
                    (
                        value,
                    ) =>
                        String(
                            value ??
                                "",
                        ).trim(),
                );


            const sameLength =
                receivedHeaders.length ===
                expectedHeaders.length;


            const sameHeaders =
                sameLength &&
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
                    `La cabecera del archivo no corresponde a ${config.label}. Debe ser exactamente: ${expectedHeaders.join(" | ")}`,
                );

            }


            const dataRows =
                rows.slice(1);


            if (
                dataRows.length === 0
            ) {

                throw new Error(
                    "El archivo contiene la cabecera correcta, pero no tiene registros para importar.",
                );

            }


            const idColumnIndex =
                config.columns.findIndex(
                    (
                        column,
                    ) =>
                        column.key ===
                        "id",
                );


            const normalizarValor =
                (
                    value: unknown,
                ) =>
                    String(
                        value ??
                            "",
                    )
                        .trim()
                        .toLocaleLowerCase(
                            "es",
                        );


            const obtenerItemPorId =
                new Map<
                    number,
                    InventarioItem
                >(
                    items.map(
                        (
                            item,
                        ) => [
                            item.id,
                            item,
                        ],
                    ),
                );


            /*
             * Catálogo de valores únicos existentes.
             * Se usa para proteger altas nuevas y evitar duplicados.
             */
            const valoresUnicosExistentes =
                new Map<
                    string,
                    Set<string>
                >();


            for (
                const field of
                config.fields
            ) {

                if (
                    !field.unique
                ) {
                    continue;
                }


                const values =
                    new Set<string>();


                for (
                    const item of
                    items
                ) {

                    const normalized =
                        normalizarValor(
                            item[
                                field.key
                            ],
                        );


                    if (
                        normalized
                    ) {
                        values.add(
                            normalized,
                        );
                    }

                }


                valoresUnicosExistentes.set(
                    field.key,
                    values,
                );

            }


            /*
             * Duplicados de campos únicos entre filas nuevas
             * del mismo archivo.
             */
            const valoresUnicosImportados =
                new Map<
                    string,
                    Set<string>
                >();


            for (
                const field of
                config.fields
            ) {

                if (
                    field.unique
                ) {
                    valoresUnicosImportados.set(
                        field.key,
                        new Set<string>(),
                    );
                }

            }


            const idsProcesados =
                new Set<number>();


            let nuevos = 0;
            let actualizados = 0;
            let sinCambios = 0;
            let conError = 0;

            const errores:
                string[] = [];


            for (
                let index = 0;
                index <
                dataRows.length;
                index += 1
            ) {

                const row =
                    dataRows[index];

                const excelRowNumber =
                    index + 2;


                const idValue =
                    idColumnIndex === -1
                        ? ""
                        : String(
                              row[
                                  idColumnIndex
                              ] ??
                                  "",
                          ).trim();


                /* =================================================
                   ACTUALIZAR REGISTRO EXISTENTE
                   ================================================= */

                if (
                    idValue
                ) {

                    if (
                        !/^\d+$/.test(
                            idValue,
                        )
                    ) {

                        conError += 1;

                        errores.push(
                            `Fila ${excelRowNumber}: el ID "${idValue}" no es válido. Debe ser un número entero existente.`,
                        );

                        continue;
                    }


                    const id =
                        Number(
                            idValue,
                        );


                    if (
                        idsProcesados.has(
                            id,
                        )
                    ) {

                        conError += 1;

                        errores.push(
                            `Fila ${excelRowNumber}: el ID ${id} está repetido dentro del archivo.`,
                        );

                        continue;
                    }


                    idsProcesados.add(
                        id,
                    );


                    const itemActual =
                        obtenerItemPorId.get(
                            id,
                        );


                    if (
                        !itemActual
                    ) {

                        conError += 1;

                        errores.push(
                            `Fila ${excelRowNumber}: el ID ${id} no existe actualmente en ${config.label}.`,
                        );

                        continue;
                    }


                    const payloadActualizacion:
                        Record<
                            string,
                            string
                        > = {};


                    let validationError =
                        "";


                    for (
                        const field of
                        config.fields
                    ) {

                        const columnIndex =
                            config.columns.findIndex(
                                (
                                    column,
                                ) =>
                                    column.key ===
                                    field.key,
                            );


                        if (
                            columnIndex === -1
                        ) {
                            continue;
                        }


                        let excelValue =
                            String(
                                row[
                                    columnIndex
                                ] ??
                                    "",
                            ).trim();


                        const currentValue =
                            String(
                                itemActual[
                                    field.key
                                ] ??
                                    "",
                            ).trim();


                        if (
                            field.required &&
                            !excelValue
                        ) {

                            validationError =
                                `Fila ${excelRowNumber}: el campo "${field.label}" es obligatorio.`;

                            break;
                        }


                        if (
                            field.type ===
                                "select" &&
                            excelValue
                        ) {

                            const opciones =
                                obtenerOpciones(
                                    field,
                                );


                            if (
                                opciones.length >
                                0
                            ) {

                                const normalizedValue =
                                    normalizarValor(
                                        excelValue,
                                    );


                                const matchedOption =
                                    opciones.find(
                                        (
                                            option,
                                        ) =>
                                            normalizarValor(
                                                option.value,
                                            ) ===
                                            normalizedValue,
                                    );


                                if (
                                    !matchedOption
                                ) {

                                    validationError =
                                        `Fila ${excelRowNumber}: el valor "${excelValue}" no es válido para "${field.label}". Valores permitidos: ${opciones.map((option) => option.label).join(", ")}.`;

                                    break;
                                }


                                excelValue =
                                    matchedOption.value;

                            }

                        }


                        /*
                         * Los identificadores únicos no se pueden
                         * modificar mediante importación masiva.
                         */
                        if (
                            field.unique
                        ) {

                            if (
                                normalizarValor(
                                    excelValue,
                                ) !==
                                normalizarValor(
                                    currentValue,
                                )
                            ) {

                                validationError =
                                    `Fila ${excelRowNumber}: no se puede modificar el campo único "${field.label}". Valor actual: "${currentValue}".`;

                                break;
                            }


                            continue;
                        }


                        /*
                         * La importación es de mantenimiento total:
                         * si una celda opcional queda vacía y antes tenía
                         * información, se envía "" para limpiar el dato.
                         */
                        if (
                            excelValue !==
                            currentValue
                        ) {

                            payloadActualizacion[
                                field.key
                            ] = excelValue;

                        }

                    }


                    if (
                        validationError
                    ) {

                        conError += 1;

                        errores.push(
                            validationError,
                        );

                        continue;
                    }


                    if (
                        Object.keys(
                            payloadActualizacion,
                        ).length ===
                        0
                    ) {

                        sinCambios += 1;

                        continue;
                    }


                    try {

                        const response =
                            await authFetch(
                                `${API_URL}/inventario/${config.endpoint}/${id}`,
                                {
                                    method:
                                        "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },

                                    body:
                                        JSON.stringify(
                                            payloadActualizacion,
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
                                message,
                            );

                        }


                        actualizados += 1;


                        /*
                         * Actualizamos la copia de trabajo para que,
                         * si luego otra validación depende de estos datos,
                         * ya vea el estado resultante de la importación.
                         */
                        const actualizado:
                            InventarioItem = {
                                ...itemActual,
                                ...payloadActualizacion,
                            };


                        obtenerItemPorId.set(
                            id,
                            actualizado,
                        );

                    } catch (
                        err
                    ) {

                        conError += 1;

                        errores.push(
                            `Fila ${excelRowNumber}: ${
                                err instanceof Error
                                    ? err.message
                                    : "No se pudo actualizar el registro."
                            }`,
                        );

                    }


                    continue;
                }


                /* =================================================
                   CREAR REGISTRO NUEVO
                   ================================================= */

                const payload:
                    Record<
                        string,
                        string
                    > = {};


                const valoresUnicosFila:
                    Array<{
                        key: string;
                        value: string;
                    }> = [];


                let validationError =
                    "";


                for (
                    const field of
                    config.fields
                ) {

                    const columnIndex =
                        config.columns.findIndex(
                            (
                                column,
                            ) =>
                                column.key ===
                                field.key,
                        );


                    if (
                        columnIndex === -1
                    ) {
                        continue;
                    }


                    let value =
                        String(
                            row[
                                columnIndex
                            ] ??
                                "",
                        ).trim();


                    if (
                        field.required &&
                        !value
                    ) {

                        validationError =
                            `Fila ${excelRowNumber}: el campo "${field.label}" es obligatorio.`;

                        break;
                    }


                    if (
                        !value
                    ) {
                        continue;
                    }


                    if (
                        field.type ===
                        "select"
                    ) {

                        const opciones =
                            obtenerOpciones(
                                field,
                            );


                        if (
                            opciones.length >
                            0
                        ) {

                            const normalizedValue =
                                normalizarValor(
                                    value,
                                );


                            const matchedOption =
                                opciones.find(
                                    (
                                        option,
                                    ) =>
                                        normalizarValor(
                                            option.value,
                                        ) ===
                                        normalizedValue,
                                );


                            if (
                                !matchedOption
                            ) {

                                validationError =
                                    `Fila ${excelRowNumber}: el valor "${value}" no es válido para "${field.label}". Valores permitidos: ${opciones.map((option) => option.label).join(", ")}.`;

                                break;
                            }


                            value =
                                matchedOption.value;

                        }

                    }


                    if (
                        field.unique
                    ) {

                        const normalizedUnique =
                            normalizarValor(
                                value,
                            );


                        const existentes =
                            valoresUnicosExistentes.get(
                                field.key,
                            );


                        if (
                            existentes?.has(
                                normalizedUnique,
                            )
                        ) {

                            validationError =
                                `Fila ${excelRowNumber}: el valor "${value}" del campo único "${field.label}" ya existe en el sistema.`;

                            break;
                        }


                        const importados =
                            valoresUnicosImportados.get(
                                field.key,
                            );


                        if (
                            importados?.has(
                                normalizedUnique,
                            )
                        ) {

                            validationError =
                                `Fila ${excelRowNumber}: el valor "${value}" del campo único "${field.label}" está repetido dentro del archivo.`;

                            break;
                        }


                        valoresUnicosFila.push({
                            key:
                                field.key,
                            value:
                                normalizedUnique,
                        });

                    }


                    payload[
                        field.key
                    ] = value;

                }


                if (
                    validationError
                ) {

                    conError += 1;

                    errores.push(
                        validationError,
                    );

                    continue;
                }


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/inventario/${config.endpoint}`,
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

                        const message =
                            await obtenerMensajeError(
                                response,
                            );


                        throw new Error(
                            message,
                        );

                    }


                    nuevos += 1;


                    for (
                        const uniqueValue of
                        valoresUnicosFila
                    ) {

                        valoresUnicosImportados
                            .get(
                                uniqueValue.key,
                            )
                            ?.add(
                                uniqueValue.value,
                            );

                        valoresUnicosExistentes
                            .get(
                                uniqueValue.key,
                            )
                            ?.add(
                                uniqueValue.value,
                            );

                    }

                } catch (
                    err
                ) {

                    conError += 1;

                    errores.push(
                        `Fila ${excelRowNumber}: ${
                            err instanceof Error
                                ? err.message
                                : "No se pudo importar el registro."
                        }`,
                    );

                }

            }


            if (
                nuevos > 0 ||
                actualizados > 0
            ) {

                await cargarInventario();

            }


            const totalFilas =
                dataRows.length;


            let feedbackType:
                ExcelFeedbackType =
                    "success";


            if (
                conError > 0 &&
                (
                    nuevos > 0 ||
                    actualizados > 0 ||
                    sinCambios > 0
                )
            ) {
                feedbackType =
                    "warning";
            }

            else if (
                conError > 0 &&
                nuevos === 0 &&
                actualizados === 0 &&
                sinCambios === 0
            ) {
                feedbackType =
                    "error";
            }


            setExcelFeedback({
                type:
                    feedbackType,

                message:
                    `Importación finalizada. Nuevos: ${nuevos} | Actualizados: ${actualizados} | Sin cambios: ${sinCambios} | Con error: ${conError} | Total de filas: ${totalFilas}.`,

                details:
                    errores.length > 0
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
                type: "error",
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
       RENDER
       ===================================================== */

    return (
        <DRPage
            title="Inventario"
            description="Gestión centralizada de activos tecnológicos"
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


                        {puedeAdministrar && (

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

                        )}

                    </div>


                    

                    {/* =====================================
                        RESULTADO EXCEL
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
                                .filter(Boolean)
                                .join(" ")}
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

                                    aria-label="Cerrar mensaje"
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

                    {puedeAdministrar && formOpen && (

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
                                                Los campos únicos del registro no pueden ser modificados.
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

                                    {config.fields.map(
                                        (
                                            field,
                                        ) => {

                                            const opciones =
                                                obtenerOpciones(
                                                    field,
                                                );


                                            const bloqueado =
                                                editingId !==
                                                    null &&
                                                field.unique ===
                                                    true;


                                            return (

                                                <label
                                                    key={
                                                        field.key
                                                    }

                                                    className={
                                                        styles.field
                                                    }
                                                >

                                                    <span>

                                                        {
                                                            field.label
                                                        }

                                                        {field.required &&
                                                            " *"}


                                                        {bloqueado && (

                                                            <small
                                                                className={
                                                                    styles.uniqueBadge
                                                                }
                                                            >
                                                                Único
                                                            </small>

                                                        )}

                                                    </span>


                                                    {field.type ===
                                                    "select" ? (

                                                        <select
                                                            required={
                                                                field.required
                                                            }

                                                            disabled={
                                                                bloqueado
                                                            }

                                                            value={
                                                                form[
                                                                    field
                                                                        .key
                                                                ] ??
                                                                ""
                                                            }

                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                setForm(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,

                                                                        [field.key]:
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


                                                            {opciones.map(
                                                                (
                                                                    option,
                                                                ) => (

                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }

                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>

                                                                ),
                                                            )}

                                                        </select>

                                                    ) : (

                                                        <input
                                                            type={
                                                                field.type ??
                                                                "text"
                                                            }

                                                            required={
                                                                field.required
                                                            }

                                                            disabled={
                                                                bloqueado
                                                            }

                                                            value={
                                                                form[
                                                                    field
                                                                        .key
                                                                ] ??
                                                                ""
                                                            }

                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                setForm(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,

                                                                        [field.key]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                        />

                                                    )}

                                                </label>

                                            );

                                        },
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
                                                  : "Guardar registro"}
                                        </button>

                                    </div>

                                </form>

                            </DRCardContent>

                        </DRCard>

                    )}


                    {/* =====================================
                        DATA GRID
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
                                            page: 0,
                                            pageSize: 25,
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