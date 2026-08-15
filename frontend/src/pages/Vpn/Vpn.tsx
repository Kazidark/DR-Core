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

import styles from "./Vpn.module.css";


/* =========================================================
   TIPOS
   ========================================================= */

type TipoVpn =
    | "Forti"
    | "WEB";


type EstadoVpn =
    | "Asignado"
    | "Reserva";


type EstadoForti =
    | "Activo"
    | "Desactivado";


type VpnRegistro = {
    id: number;
    nombresCompletos: string;
    usuario: string;
    correo: string;
    area: string;
    jefeAutorizador: string;
    tipoVpn: TipoVpn;
    estado: EstadoVpn;
    forti: EstadoForti;
    lastUser: string | null;
};


type Area = {
    id: number;
    nombre: string;
    activo: boolean;
};


type VpnForm = {
    nombresCompletos: string;
    usuario: string;
    correo: string;
    area: string;
    jefeAutorizador: string;
    tipoVpn: TipoVpn;
    estado: EstadoVpn;
    forti: EstadoForti;
    lastUser: string;
};


type FilaExcel = {
    "Nombres completos"?: unknown;
    "Usuario"?: unknown;
    "Correo"?: unknown;
    "Área"?: unknown;
    "Area"?: unknown;
    "Jefe - Autorizador"?: unknown;
    "Tipo VPN"?: unknown;
    "Estado"?: unknown;
    "Forti"?: unknown;
    "Last User"?: unknown;
};


type ResultadoImportacion = {
    nuevos: number;
    actualizados: number;
    sinCambios: number;
    errores: string[];
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
   FORMULARIO INICIAL
   ========================================================= */

const initialForm:
    VpnForm = {

    nombresCompletos: "",
    usuario: "",
    correo: "",
    area: "",
    jefeAutorizador: "",
    tipoVpn: "Forti",
    estado: "Asignado",
    forti: "Activo",
    lastUser: "",
};


/* =========================================================
   COMPARADOR DE TABLA
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
   MENSAJE DEL BACKEND
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
   AUXILIARES EXCEL
   ========================================================= */

function textoExcel(
    value: unknown,
): string {

    if (
        value ===
        null ||
        value ===
        undefined
    ) {

        return "";

    }


    return String(
        value,
    ).trim();
}


function normalizarCorreo(
    correo: string,
): string {

    return correo
        .trim()
        .toLowerCase();
}


function correoValido(
    correo: string,
): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo,
    );
}


function normalizarTipoVpn(
    value: string,
): TipoVpn | null {

    const normalized =
        value
            .trim()
            .toLowerCase();


    if (
        normalized ===
        "forti"
    ) {

        return "Forti";

    }


    if (
        normalized ===
        "web"
    ) {

        return "WEB";

    }


    return null;
}


function normalizarEstadoVpn(
    value: string,
): EstadoVpn | null {

    const normalized =
        value
            .trim()
            .toLowerCase();


    if (
        normalized ===
        "asignado"
    ) {

        return "Asignado";

    }


    if (
        normalized ===
        "reserva"
    ) {

        return "Reserva";

    }


    return null;
}


function normalizarForti(
    value: string,
): EstadoForti | null {

    const normalized =
        value
            .trim()
            .toLowerCase();


    if (
        normalized ===
        "activo"
    ) {

        return "Activo";

    }


    if (
        normalized ===
        "desactivado"
    ) {

        return "Desactivado";

    }


    return null;
}


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function Vpn() {

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
        registros,
        setRegistros,
    ] =
        useState<VpnRegistro[]>(
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
        mensaje,
        setMensaje,
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
        useState<VpnForm>(
            initialForm,
        );


    const [
        sortModel,
        setSortModel,
    ] =
        useState<GridSortModel>(
            [],
        );


    const [
        importando,
        setImportando,
    ] =
        useState(
            false,
        );


    const [
        actualizandoFortiId,
        setActualizandoFortiId,
    ] =
        useState<
            number | null
        >(
            null,
        );


    const [
        excelFeedback,
        setExcelFeedback,
    ] =
        useState<ExcelFeedback>(
            null,
        );


    const fileInputRef =
        useRef<HTMLInputElement | null>(
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
       MODELO DE SELECCIÓN
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
       CAMBIAR FORTI DIRECTAMENTE
       ===================================================== */

    const cambiarEstadoForti =
        useCallback(
            async (
                registro: VpnRegistro,
            ) => {

                if (
                    !esAdministrador ||
                    actualizandoFortiId !==
                        null
                ) {

                    return;

                }


                const nuevoEstado:
                    EstadoForti =
                        registro.forti ===
                        "Activo"
                            ? "Desactivado"
                            : "Activo";


                setActualizandoFortiId(
                    registro.id,
                );

                setError("");

                setMensaje("");


                try {

                    const response =
                        await authFetch(
                            `${API_URL}/vpn/${registro.id}`,
                            {
                                method:
                                    "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify({
                                        forti:
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


                    /*
                     * Actualización local inmediata.
                     * Evitamos volver a descargar toda
                     * la tabla por un cambio tan pequeño.
                     */
                    setRegistros(
                        (
                            current,
                        ) =>
                            current.map(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    registro.id
                                        ? {
                                            ...item,

                                            forti:
                                                nuevoEstado,
                                        }
                                        : item,
                            ),
                    );


                    setMensaje(
                        `Forti de "${registro.usuario}" actualizado a ${nuevoEstado}.`,
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudo actualizar el estado de Forti.",
                    );

                } finally {

                    setActualizandoFortiId(
                        null,
                    );

                }

            },
            [
                esAdministrador,
                actualizandoFortiId,
            ],
        );


    /* =====================================================
       COLUMNAS
       ===================================================== */

    const columns =
        useMemo<
            GridColDef<VpnRegistro>[]
        >(
            () => [

                {
                    field:
                        "nombresCompletos",

                    headerName:
                        "Nombres completos",

                    minWidth:
                        220,

                    flex:
                        1.3,

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
                            {String(
                                params.value ??
                                "—",
                            )}
                        </span>

                    ),
                },


                {
                    field:
                        "usuario",

                    headerName:
                        "Usuario",

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
                        235,

                    flex:
                        1.35,

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
                            {String(
                                params.value ??
                                "—",
                            )}
                        </span>

                    ),
                },


                {
                    field:
                        "area",

                    headerName:
                        "Área",

                    minWidth:
                        170,

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
                            {String(
                                params.value ??
                                "—",
                            )}
                        </span>

                    ),
                },


                {
                    field:
                        "jefeAutorizador",

                    headerName:
                        "Jefe - Autorizador",

                    minWidth:
                        210,

                    flex:
                        1.2,

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
                            {String(
                                params.value ??
                                "—",
                            )}
                        </span>

                    ),
                },


                {
                    field:
                        "tipoVpn",

                    headerName:
                        "Tipo VPN",

                    minWidth:
                        125,

                    flex:
                        0.7,

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
                            className={[
                                styles.badge,

                                params.value ===
                                    "Forti"
                                    ? styles.badgeForti
                                    : styles.badgeWeb,
                            ].join(
                                " ",
                            )}
                        >
                            {
                                params.value
                            }
                        </span>

                    ),
                },


                {
                    field:
                        "estado",

                    headerName:
                        "Estado",

                    minWidth:
                        125,

                    flex:
                        0.7,

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
                            className={[
                                styles.badge,

                                params.value ===
                                    "Asignado"
                                    ? styles.badgeAssigned
                                    : styles.badgeReserve,
                            ].join(
                                " ",
                            )}
                        >
                            {
                                params.value
                            }
                        </span>

                    ),
                },


                {
                    field:
                        "forti",

                    headerName:
                        "Forti",

                    minWidth:
                        155,

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
                    ) => {

                        const registro =
                            params.row;


                        const actualizando =
                            actualizandoFortiId ===
                            registro.id;


                        /*
                         * Consultor:
                         * solamente visualiza.
                         */
                        if (
                            !esAdministrador
                        ) {

                            return (

                                <span
                                    className={[
                                        styles.badge,

                                        registro.forti ===
                                            "Activo"
                                            ? styles.badgeActive
                                            : styles.badgeInactive,
                                    ].join(
                                        " ",
                                    )}
                                >
                                    {
                                        registro.forti
                                    }
                                </span>

                            );

                        }


                        /*
                         * Administrador:
                         * control interactivo.
                         */
                        return (

                            <button
                                type="button"

                                className={[
                                    styles.fortiToggle,

                                    registro.forti ===
                                        "Activo"
                                        ? styles.fortiToggleActive
                                        : styles.fortiToggleInactive,

                                    actualizando
                                        ? styles.fortiToggleLoading
                                        : "",
                                ]
                                    .filter(
                                        Boolean,
                                    )
                                    .join(
                                        " ",
                                    )}

                                disabled={
                                    actualizandoFortiId !==
                                    null
                                }

                                onClick={(
                                    event,
                                ) => {

                                    /*
                                     * Evitamos que el clic
                                     * en el switch cambie la
                                     * selección de fila.
                                     */
                                    event.stopPropagation();


                                    void cambiarEstadoForti(
                                        registro,
                                    );

                                }}

                                title={
                                    actualizando
                                        ? "Actualizando..."
                                        : registro.forti ===
                                            "Activo"
                                            ? "Cambiar a Desactivado"
                                            : "Cambiar a Activo"
                                }
                            >

                                <span
                                    className={
                                        styles.fortiToggleTrack
                                    }
                                >

                                    <span
                                        className={
                                            styles.fortiToggleKnob
                                        }
                                    />

                                </span>


                                <span
                                    className={
                                        styles.fortiToggleText
                                    }
                                >
                                    {actualizando
                                        ? "Actualizando..."
                                        : registro.forti}
                                </span>

                            </button>

                        );

                    },
                },


                {
                    field:
                        "lastUser",

                    headerName:
                        "Last User",

                    minWidth:
                        155,

                    flex:
                        0.9,

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
                            {String(
                                params.value ??
                                "—",
                            )}
                        </span>

                    ),
                },

            ],
            [
                esAdministrador,
                actualizandoFortiId,
                cambiarEstadoForti,
            ],
        );


    /* =====================================================
       CARGAR VPN
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
                            `${API_URL}/vpn`,
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
                            VpnRegistro[];


                    setRegistros(
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
                        err instanceof Error
                            ? err.message
                            : "No se pudieron cargar los registros VPN.",
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
                            "No se pudieron cargar las áreas.",
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

                    console.error(
                        err,
                    );

                }

            },
            [],
        );


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

                const value =
                    search
                        .trim()
                        .toLocaleLowerCase(
                            "es",
                        );


                if (
                    !value
                ) {

                    return registros;

                }


                return registros.filter(
                    (
                        item,
                    ) => [

                        item.nombresCompletos,
                        item.usuario,
                        item.correo,
                        item.area,
                        item.jefeAutorizador,
                        item.tipoVpn,
                        item.estado,
                        item.forti,
                        item.lastUser,

                    ].some(
                        (
                            field,
                        ) =>
                            String(
                                field ??
                                "",
                            )
                                .toLocaleLowerCase(
                                    "es",
                                )
                                .includes(
                                    value,
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
       REGISTROS PARA EXPORTAR
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
                                    keyof VpnRegistro
                            ],
                            b[
                                currentSort.field as
                                    keyof VpnRegistro
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

        setMensaje("");

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
            nombresCompletos:
                selectedItem.nombresCompletos,

            usuario:
                selectedItem.usuario,

            correo:
                selectedItem.correo,

            area:
                selectedItem.area,

            jefeAutorizador:
                selectedItem.jefeAutorizador,

            tipoVpn:
                selectedItem.tipoVpn,

            estado:
                selectedItem.estado,

            forti:
                selectedItem.forti,

            lastUser:
                selectedItem.lastUser ??
                "",
        });


        setError("");

        setMensaje("");

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
            !correoValido(
                form.correo,
            )
        ) {

            setError(
                "El correo electrónico ingresado no es válido.",
            );

            return;

        }


        setLoading(
            true,
        );

        setError("");

        setMensaje("");


        try {

            const payload = {
                nombresCompletos:
                    form.nombresCompletos.trim(),

                usuario:
                    form.usuario.trim(),

                correo:
                    normalizarCorreo(
                        form.correo,
                    ),

                area:
                    form.area.trim(),

                jefeAutorizador:
                    form.jefeAutorizador.trim(),

                tipoVpn:
                    form.tipoVpn,

                estado:
                    form.estado,

                forti:
                    form.forti,

                lastUser:
                    form.lastUser.trim(),
            };


            const editando =
                editingId !==
                null;


            const response =
                await authFetch(
                    editando
                        ? `${API_URL}/vpn/${editingId}`
                        : `${API_URL}/vpn`,
                    {
                        method:
                            editando
                                ? "PATCH"
                                : "POST",

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


            await cargarRegistros();


            setMensaje(
                editando
                    ? "Registro VPN actualizado correctamente."
                    : "Registro VPN creado correctamente.",
            );

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el registro VPN.",
            );

        } finally {

            setLoading(
                false,
            );

        }

    }


    /* =====================================================
       ELIMINAR
       ===================================================== */

    async function eliminarSeleccionado() {

        if (
            !esAdministrador ||
            !selectedItem
        ) {

            return;

        }


        const confirmar =
            window.confirm(
                `¿Deseas eliminar el acceso VPN del usuario "${selectedItem.usuario}"?`,
            );


        if (
            !confirmar
        ) {

            return;

        }


        setLoading(
            true,
        );

        setError("");

        setMensaje("");


        try {

            const response =
                await authFetch(
                    `${API_URL}/vpn/${selectedItem.id}`,
                    {
                        method: "DELETE",
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


            setSelectedId(
                null,
            );


            await cargarRegistros();


            setMensaje(
                "Registro VPN eliminado correctamente.",
            );

        } catch (
            err
        ) {

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo eliminar el registro VPN.",
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
                    "VPN",
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
                                left:
                                    0.25,

                                right:
                                    0.25,

                                top:
                                    0.5,

                                bottom:
                                    0.5,

                                header:
                                    0.2,

                                footer:
                                    0.2,
                            },
                        },
                    },
                );


            const headers = [
                "Nombres completos",
                "Usuario",
                "Correo",
                "Área",
                "Jefe - Autorizador",
                "Tipo VPN",
                "Estado",
                "Forti",
                "Last User",
            ];


            const headerRow =
                worksheet.addRow(
                    headers,
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
                                "FF0D9488",
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
                                    "FF0F766E",
                            },
                        },

                        left: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF0F766E",
                            },
                        },

                        bottom: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF0F766E",
                            },
                        },

                        right: {
                            style:
                                "thin",

                            color: {
                                argb:
                                    "FF0F766E",
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
                            item.nombresCompletos,
                            item.usuario,
                            item.correo,
                            item.area,
                            item.jefeAutorizador,
                            item.tipoVpn,
                            item.estado,
                            item.forti,
                            item.lastUser ??
                                "",
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
                32,
                20,
                34,
                26,
                30,
                16,
                16,
                18,
                24,
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
                        headers.length,
                },
            };


            worksheet.headerFooter = {
                oddHeader:
                    "&L&BDR+ Core&RVPN",

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
                `VPN_DRCore_${new Date()
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
                    `${registrosParaExportar.length} registros VPN exportados correctamente.`,
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
       ABRIR IMPORTADOR
       ===================================================== */

    function abrirImportador() {

        if (
            !esAdministrador ||
            importando
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
                    "Solo se permiten archivos Excel con extensión .xlsx o .xls.",
            });


            event.target.value =
                "";

            return;

        }


        setImportando(
            true,
        );

        setExcelFeedback(
            null,
        );


        const resultado:
            ResultadoImportacion = {

            nuevos:
                0,

            actualizados:
                0,

            sinCambios:
                0,

            errores:
                [],
        };


        try {

            const buffer =
                await file.arrayBuffer();


            const workbook =
                XLSX.read(
                    buffer,
                    {
                        type:
                            "array",
                    },
                );


            const sheetName =
                workbook.SheetNames[0];


            if (
                !sheetName
            ) {

                throw new Error(
                    "El archivo Excel no contiene hojas.",
                );

            }


            const sheet =
                workbook.Sheets[
                    sheetName
                ];


            if (
                !sheet
            ) {

                throw new Error(
                    "No se pudo leer la hoja del archivo Excel.",
                );

            }


            const rows =
                XLSX.utils
                    .sheet_to_json<FilaExcel>(
                        sheet,
                        {
                            defval:
                                "",
                        },
                    );


            if (
                rows.length ===
                0
            ) {

                throw new Error(
                    "El archivo no contiene registros para importar.",
                );

            }


            const existentes =
                new Map<
                    string,
                    VpnRegistro
                >();


            registros.forEach(
                (
                    item,
                ) => {

                    existentes.set(
                        item.usuario
                            .trim()
                            .toLowerCase(),

                        item,
                    );

                },
            );


            const usuariosArchivo =
                new Set<string>();


            for (
                let index =
                    0;

                index <
                    rows.length;

                index +=
                    1
            ) {

                const excelRow =
                    rows[index];


                const fila =
                    index +
                    2;


                const nombresCompletos =
                    textoExcel(
                        excelRow[
                            "Nombres completos"
                        ],
                    );


                const usuario =
                    textoExcel(
                        excelRow.Usuario,
                    );


                const correo =
                    normalizarCorreo(
                        textoExcel(
                            excelRow.Correo,
                        ),
                    );


                const area =
                    textoExcel(
                        excelRow[
                            "Área"
                        ] ??
                        excelRow.Area,
                    );


                const jefeAutorizador =
                    textoExcel(
                        excelRow[
                            "Jefe - Autorizador"
                        ],
                    );


                const tipoVpn =
                    normalizarTipoVpn(
                        textoExcel(
                            excelRow[
                                "Tipo VPN"
                            ],
                        ),
                    );


                const estado =
                    normalizarEstadoVpn(
                        textoExcel(
                            excelRow.Estado,
                        ),
                    );


                const forti =
                    normalizarForti(
                        textoExcel(
                            excelRow.Forti,
                        ),
                    );


                const lastUser =
                    textoExcel(
                        excelRow[
                            "Last User"
                        ],
                    );


                if (
                    !nombresCompletos
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Nombres completos es obligatorio.`,
                    );

                    continue;

                }


                if (
                    !usuario
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Usuario es obligatorio.`,
                    );

                    continue;

                }


                const usuarioKey =
                    usuario
                        .trim()
                        .toLowerCase();


                if (
                    usuariosArchivo.has(
                        usuarioKey,
                    )
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: El usuario "${usuario}" está duplicado dentro del archivo.`,
                    );

                    continue;

                }


                usuariosArchivo.add(
                    usuarioKey,
                );


                if (
                    !correoValido(
                        correo,
                    )
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: El correo "${correo}" no es válido.`,
                    );

                    continue;

                }


                if (
                    !area
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Área es obligatoria.`,
                    );

                    continue;

                }


                if (
                    !jefeAutorizador
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Jefe - Autorizador es obligatorio.`,
                    );

                    continue;

                }


                if (
                    !tipoVpn
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Tipo VPN debe ser Forti o WEB.`,
                    );

                    continue;

                }


                if (
                    !estado
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Estado debe ser Asignado o Reserva.`,
                    );

                    continue;

                }


                if (
                    !forti
                ) {

                    resultado.errores.push(
                        `Fila ${fila}: Forti debe ser Activo o Desactivado.`,
                    );

                    continue;

                }


                const payload = {
                    nombresCompletos,
                    usuario,
                    correo,
                    area,
                    jefeAutorizador,
                    tipoVpn,
                    estado,
                    forti,
                    lastUser,
                };


                const existente =
                    existentes.get(
                        usuarioKey,
                    );


                if (
                    !existente
                ) {

                    const response =
                        await authFetch(
                            `${API_URL}/vpn`,
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

                        resultado.errores.push(
                            `Fila ${fila}: ${await obtenerMensajeError(response)}`,
                        );

                        continue;

                    }


                    resultado.nuevos +=
                        1;

                    continue;

                }


                const sinCambios =
                    existente.nombresCompletos ===
                        nombresCompletos &&
                    existente.usuario ===
                        usuario &&
                    normalizarCorreo(
                        existente.correo,
                    ) ===
                        correo &&
                    existente.area ===
                        area &&
                    existente.jefeAutorizador ===
                        jefeAutorizador &&
                    existente.tipoVpn ===
                        tipoVpn &&
                    existente.estado ===
                        estado &&
                    existente.forti ===
                        forti &&
                    (
                        existente.lastUser ??
                        ""
                    ) ===
                        lastUser;


                if (
                    sinCambios
                ) {

                    resultado.sinCambios +=
                        1;

                    continue;

                }


                const response =
                    await authFetch(
                        `${API_URL}/vpn/${existente.id}`,
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

                    resultado.errores.push(
                        `Fila ${fila}: ${await obtenerMensajeError(response)}`,
                    );

                    continue;

                }


                resultado.actualizados +=
                    1;

            }


            if (
                resultado.nuevos >
                    0 ||
                resultado.actualizados >
                    0
            ) {

                await cargarRegistros();

            }


            let feedbackType:
                ExcelFeedbackType =
                    "success";


            if (
                resultado.errores.length >
                    0 &&
                (
                    resultado.nuevos >
                        0 ||
                    resultado.actualizados >
                        0 ||
                    resultado.sinCambios >
                        0
                )
            ) {

                feedbackType =
                    "warning";

            }

            else if (
                resultado.errores.length >
                    0
            ) {

                feedbackType =
                    "error";

            }


            setExcelFeedback({
                type:
                    feedbackType,

                message:
                    `Importación finalizada. Nuevos: ${resultado.nuevos} | Actualizados: ${resultado.actualizados} | Sin cambios: ${resultado.sinCambios} | Con error: ${resultado.errores.length} | Total: ${rows.length}.`,

                details:
                    resultado.errores.length >
                        0
                        ? resultado.errores.slice(
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
                        : "No se pudo importar el archivo Excel.",
            });

        } finally {

            setImportando(
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
            title="VPN"
            description="Gestión y control de accesos VPN"
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

                                placeholder="Buscar en todos los campos de VPN..."
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
                                        importando
                                    }

                                    onClick={
                                        abrirImportador
                                    }
                                >
                                    {importando
                                        ? "Importando..."
                                        : "↑ Importar Excel"}
                                </button>


                                <button
                                    type="button"

                                    className={
                                        styles.excelExportButton
                                    }

                                    disabled={
                                        importando
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
                                        styles.dangerButton
                                    }

                                    disabled={
                                        selectedItem ===
                                            null ||
                                        loading
                                    }

                                    onClick={
                                        eliminarSeleccionado
                                    }
                                >
                                    Eliminar
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
                                    + Nuevo VPN
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        FEEDBACK EXCEL
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
                        MENSAJES
                        ===================================== */}

                    {mensaje && (

                        <div
                            className={
                                styles.success
                            }
                        >
                            {
                                mensaje
                            }
                        </div>

                    )}


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
                                                ? "Editar acceso VPN"
                                                : "Nuevo acceso VPN"}
                                        </DRText>


                                        {editingId !==
                                            null && (

                                            <p
                                                className={
                                                    styles.formDescription
                                                }
                                            >
                                                Modifica únicamente la información que necesites actualizar.
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
                                            Nombres completos *
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
                                                            event.target.value,
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
                                            Usuario *
                                        </span>


                                        <input
                                            required

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
                                                            event.target.value,
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
                                        </span>


                                        <input
                                            required

                                            type="email"

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
                                                            event.target.value,
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
                                            Área *
                                        </span>


                                        <select
                                            required

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
                                                            event.target.value,
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
                                            Jefe - Autorizador *
                                        </span>


                                        <input
                                            required

                                            value={
                                                form.jefeAutorizador
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        jefeAutorizador:
                                                            event.target.value,
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
                                            Tipo VPN
                                        </span>


                                        <select
                                            value={
                                                form.tipoVpn
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        tipoVpn:
                                                            event.target.value as TipoVpn,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="Forti">
                                                Forti
                                            </option>

                                            <option value="WEB">
                                                WEB
                                            </option>

                                        </select>

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Estado
                                        </span>


                                        <select
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
                                                            event.target.value as EstadoVpn,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="Asignado">
                                                Asignado
                                            </option>

                                            <option value="Reserva">
                                                Reserva
                                            </option>

                                        </select>

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Forti
                                        </span>


                                        <select
                                            value={
                                                form.forti
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        forti:
                                                            event.target.value as EstadoForti,
                                                    }),
                                                )
                                            }
                                        >

                                            <option value="Activo">
                                                Activo
                                            </option>

                                            <option value="Desactivado">
                                                Desactivado
                                            </option>

                                        </select>

                                    </label>


                                    <label
                                        className={
                                            styles.field
                                        }
                                    >

                                        <span>
                                            Last User
                                        </span>


                                        <input
                                            value={
                                                form.lastUser
                                            }

                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,

                                                        lastUser:
                                                            event.target.value,
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
                                    VPN
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
                                            ? "No existen registros que coincidan con la búsqueda."
                                            : "No existen accesos VPN registrados.",
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