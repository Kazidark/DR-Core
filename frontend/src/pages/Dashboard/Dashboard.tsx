import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    DRContainer,
    DRIcon,
    DRMetricCard,
    DRPage,
    DRText,
} from "@/design-system";

import {
    authFetch,
} from "@/auth";

import {
    DashboardHero,
} from "@/modules/dashboard/widgets/DashboardHero";

import styles from "./Dashboard.module.css";


/* =========================================================
   TIPOS INVENTARIO
   ========================================================= */

type CategoriaDashboard = {
    key: string;
    label: string;
    cantidad: number;
};


type AreaDashboard = {
    area: string;
    cantidad: number;
};


type DashboardInventario = {
    totalActivos: number;

    totalEquipos: number;

    totales: {
        pclaptops: number;
        monitores: number;
        tablets: number;
        modems: number;
        celulares: number;
        chips: number;
    };

    porCategoria:
        CategoriaDashboard[];

    estadosEquipo: {
        Operativo: number;
        Inoperativo: number;
        Stock: number;
        Donado: number;
        Vendido: number;
        SinEstado: number;
    };

    indicadores: {
        porcentajeOperativo: number;
        porcentajeStock: number;
        porcentajeInoperativo: number;
    };

    chips: {
        activas: number;
        baja: number;
        datos: number;
        voz: number;
        stock: number;
        asignados: number;
    };

    porArea:
        AreaDashboard[];
};


/* =========================================================
   TIPOS VPN
   ========================================================= */

type VpnDashboardRegistro = {
    id: number;

    nombresCompletos:
        string;

    usuario:
        string;

    correo:
        string;

    area:
        string;

    jefeAutorizador:
        string;

    tipoVpn:
        | "Forti"
        | "WEB";

    estado:
        | "Asignado"
        | "Reserva";

    forti:
        | "Activo"
        | "Desactivado";

    lastUser:
        string | null;
};


type DashboardVpn = {
    total: number;
    asignados: number;
    reserva: number;
    fortiActivos: number;
    fortiDesactivados: number;
    tipoForti: number;
    tipoWeb: number;
};


/* =========================================================
   TIPOS IP
   ========================================================= */

type SegmentoIp =
    | "26"
    | "46"
    | "56"
    | "100";


type ResumenIp = {
    segmento:
        SegmentoIp;

    cantidad:
        number;
};


type DashboardIp = {
    total: number;

    segmentos: {
        "26": number;
        "46": number;
        "56": number;
        "100": number;
    };
};


/* =========================================================
   API
   ========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8520/api";


/* =========================================================
   ESTADOS INICIALES
   ========================================================= */

const initialDashboard:
    DashboardInventario = {

    totalActivos: 0,

    totalEquipos: 0,

    totales: {
        pclaptops: 0,
        monitores: 0,
        tablets: 0,
        modems: 0,
        celulares: 0,
        chips: 0,
    },

    porCategoria:
        [],

    estadosEquipo: {
        Operativo: 0,
        Inoperativo: 0,
        Stock: 0,
        Donado: 0,
        Vendido: 0,
        SinEstado: 0,
    },

    indicadores: {
        porcentajeOperativo: 0,
        porcentajeStock: 0,
        porcentajeInoperativo: 0,
    },

    chips: {
        activas: 0,
        baja: 0,
        datos: 0,
        voz: 0,
        stock: 0,
        asignados: 0,
    },

    porArea:
        [],
};


const initialVpnDashboard:
    DashboardVpn = {

    total: 0,

    asignados: 0,

    reserva: 0,

    fortiActivos: 0,

    fortiDesactivados: 0,

    tipoForti: 0,

    tipoWeb: 0,
};


const initialIpDashboard:
    DashboardIp = {

    total: 0,

    segmentos: {
        "26": 0,
        "46": 0,
        "56": 0,
        "100": 0,
    },
};


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function Dashboard() {

    /* =====================================================
       ESTADOS
       ===================================================== */

    const [
        dashboard,
        setDashboard,
    ] =
        useState<
            DashboardInventario
        >(
            initialDashboard,
        );


    const [
        vpnDashboard,
        setVpnDashboard,
    ] =
        useState<
            DashboardVpn
        >(
            initialVpnDashboard,
        );


    const [
        ipDashboard,
        setIpDashboard,
    ] =
        useState<
            DashboardIp
        >(
            initialIpDashboard,
        );


    const [
        loading,
        setLoading,
    ] =
        useState(
            true,
        );


    const [
        error,
        setError,
    ] =
        useState("");


    /* =====================================================
       CARGAR DASHBOARD COMPLETO
       ===================================================== */

    const cargarDashboard =
        useCallback(
            async () => {

                setLoading(
                    true,
                );

                setError("");


                try {

                    /*
                     * Cargamos los tres módulos
                     * simultáneamente.
                     */
                    const [
                        inventarioResponse,
                        vpnResponse,
                        ipsResponse,
                    ] =
                        await Promise.all([
                            authFetch(
                                `${API_URL}/inventario/dashboard`,
                            ),

                            authFetch(
                                `${API_URL}/vpn`,
                            ),

                            authFetch(
                                `${API_URL}/ips/resumen`,
                            ),
                        ]);


                    /* =====================================
                       INVENTARIO
                       ===================================== */

                    if (
                        !inventarioResponse.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar la información de Inventario.",
                        );

                    }


                    const inventarioData =
                        (await inventarioResponse.json()) as
                            DashboardInventario;


                    setDashboard(
                        inventarioData,
                    );


                    /* =====================================
                       VPN
                       ===================================== */

                    if (
                        !vpnResponse.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar la información de VPN.",
                        );

                    }


                    const vpnData =
                        (await vpnResponse.json()) as
                            VpnDashboardRegistro[];


                    const vpnResumen:
                        DashboardVpn = {

                        total:
                            vpnData.length,

                        asignados:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.estado ===
                                    "Asignado",
                            ).length,

                        reserva:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.estado ===
                                    "Reserva",
                            ).length,

                        fortiActivos:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.forti ===
                                    "Activo",
                            ).length,

                        fortiDesactivados:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.forti ===
                                    "Desactivado",
                            ).length,

                        tipoForti:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.tipoVpn ===
                                    "Forti",
                            ).length,

                        tipoWeb:
                            vpnData.filter(
                                (
                                    item,
                                ) =>
                                    item.tipoVpn ===
                                    "WEB",
                            ).length,
                    };


                    setVpnDashboard(
                        vpnResumen,
                    );


                    /* =====================================
                       IP
                       ===================================== */

                    if (
                        !ipsResponse.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar la información de IP.",
                        );

                    }


                    const ipsData =
                        (await ipsResponse.json()) as
                            ResumenIp[];


                    const segmentos:
                        DashboardIp["segmentos"] = {

                        "26": 0,

                        "46": 0,

                        "56": 0,

                        "100": 0,
                    };


                    ipsData.forEach(
                        (
                            item,
                        ) => {

                            segmentos[
                                item.segmento
                            ] =
                                item.cantidad;

                        },
                    );


                    const totalIps =
                        Object
                            .values(
                                segmentos,
                            )
                            .reduce(
                                (
                                    total,
                                    cantidad,
                                ) =>
                                    total +
                                    cantidad,
                                0,
                            );


                    setIpDashboard({
                        total:
                            totalIps,

                        segmentos,
                    });

                } catch (
                    err
                ) {

                    setError(
                        err instanceof Error
                            ? err.message
                            : "Error inesperado al cargar el Dashboard.",
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
       CARGA INICIAL
       ===================================================== */

    useEffect(
        () => {

            void cargarDashboard();

        },
        [
            cargarDashboard,
        ],
    );


    /* =====================================================
       TOP ÁREAS
       ===================================================== */

    const topAreas =
        useMemo(
            () =>
                dashboard
                    .porArea
                    .slice(
                        0,
                        10,
                    ),
            [
                dashboard.porArea,
            ],
        );


    /* =====================================================
       MÁXIMOS PARA GRÁFICOS
       ===================================================== */

    const maxCategoria =
        useMemo(
            () =>
                Math.max(
                    ...dashboard
                        .porCategoria
                        .map(
                            (
                                item,
                            ) =>
                                item.cantidad,
                        ),
                    1,
                ),
            [
                dashboard.porCategoria,
            ],
        );


    const maxEstado =
        useMemo(
            () =>
                Math.max(
                    dashboard
                        .estadosEquipo
                        .Operativo,

                    dashboard
                        .estadosEquipo
                        .Inoperativo,

                    dashboard
                        .estadosEquipo
                        .Stock,

                    dashboard
                        .estadosEquipo
                        .Donado,

                    dashboard
                        .estadosEquipo
                        .Vendido,

                    1,
                ),
            [
                dashboard.estadosEquipo,
            ],
        );


    const maxArea =
        useMemo(
            () =>
                Math.max(
                    ...topAreas.map(
                        (
                            item,
                        ) =>
                            item.cantidad,
                    ),
                    1,
                ),
            [
                topAreas,
            ],
        );


    const maxSegmentoIp =
        useMemo(
            () =>
                Math.max(
                    ipDashboard.segmentos["26"],
                    ipDashboard.segmentos["46"],
                    ipDashboard.segmentos["56"],
                    ipDashboard.segmentos["100"],
                    1,
                ),
            [
                ipDashboard,
            ],
        );


    /* =====================================================
       ESTADOS EQUIPOS
       ===================================================== */

    const estados =
        [
            {
                label:
                    "Operativo",

                value:
                    dashboard
                        .estadosEquipo
                        .Operativo,

                className:
                    styles.stateOperational,
            },

            {
                label:
                    "Stock",

                value:
                    dashboard
                        .estadosEquipo
                        .Stock,

                className:
                    styles.stateStock,
            },

            {
                label:
                    "Inoperativo",

                value:
                    dashboard
                        .estadosEquipo
                        .Inoperativo,

                className:
                    styles.stateInactive,
            },

            {
                label:
                    "Donado",

                value:
                    dashboard
                        .estadosEquipo
                        .Donado,

                className:
                    styles.stateDonated,
            },

            {
                label:
                    "Vendido",

                value:
                    dashboard
                        .estadosEquipo
                        .Vendido,

                className:
                    styles.stateSold,
            },
        ];


    /* =====================================================
       SEGMENTOS IP
       ===================================================== */

    const segmentosIp = [
        {
            label:
                "Segmento 26",

            value:
                ipDashboard
                    .segmentos[
                        "26"
                    ],

            className:
                styles.ipBar26,
        },

        {
            label:
                "Segmento 46",

            value:
                ipDashboard
                    .segmentos[
                        "46"
                    ],

            className:
                styles.ipBar46,
        },

        {
            label:
                "Segmento 56",

            value:
                ipDashboard
                    .segmentos[
                        "56"
                    ],

            className:
                styles.ipBar56,
        },

        {
            label:
                "Segmento 100",

            value:
                ipDashboard
                    .segmentos[
                        "100"
                    ],

            className:
                styles.ipBar100,
        },
    ];


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <DRPage
            title="Dashboard"
            description=""
        >

            <DRContainer
                fluid
                padding="none"
            >

                {/* =====================================
                    HERO
                    ===================================== */}

                <DashboardHero />


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
                    MÉTRICAS GENERALES
                    ===================================== */}

                <section
                    className={
                        styles.coreMetricsSection
                    }
                >

                    {/* EQUIPOS */}

                    <a
                        href="#inventario"

                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="blue"

                            title="Equipos"

                            value={
                                loading
                                    ? "..."
                                    : String(
                                        dashboard
                                            .totalActivos,
                                    )
                            }

                            trendType="up"

                            icon={
                                <DRIcon
                                    name="laptop"
                                />
                            }
                        />

                    </a>


                    {/* VPN */}

                    <a
                        href="#vpn"

                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="purple"

                            title="VPN"

                            value={
                                loading
                                    ? "..."
                                    : String(
                                        vpnDashboard
                                            .total,
                                    )
                            }

                            trendType="up"

                            icon={
                                <DRIcon
                                    name="shield"
                                />
                            }
                        />

                    </a>


                    {/* IP */}

                    <a
                        href="#ips"

                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="green"

                            title="IP"

                            value={
                                loading
                                    ? "..."
                                    : String(
                                        ipDashboard
                                            .total,
                                    )
                            }

                            trendType="up"

                            icon={
                                <DRIcon
                                    name="server"
                                />
                            }
                        />

                    </a>


                    {/* CORREOS */}

                    <a
                        href="#correos"

                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="orange"

                            title="Correos"

                            value="0"

                            trendType="up"

                            icon={
                                <DRIcon
                                    name="mail"
                                />
                            }
                        />

                    </a>

                </section>


                {/* =====================================
                    INVENTARIO
                    ===================================== */}

                <section
                    id="inventario"

                    className={
                        styles.inventorySection
                    }
                >

                    <div
                        className={
                            styles.sectionHeader
                        }
                    >

                        <div>

                            <DRText
                                as="h2"
                                variant="h2"
                                weight="bold"
                            >
                                Inventario
                            </DRText>


                            <DRText
                                variant="bodySmall"
                                color="secondary"
                            >
                                Distribución general de los activos tecnológicos registrados.
                            </DRText>

                        </div>


                        <button
                            type="button"

                            className={
                                styles.refreshButton
                            }

                            disabled={
                                loading
                            }

                            onClick={() =>
                                void cargarDashboard()
                            }
                        >
                            {loading
                                ? "Actualizando..."
                                : "Actualizar"}
                        </button>

                    </div>


                    {/* =================================
                        INDICADORES PRINCIPALES
                        ================================= */}

                    <div
                        className={
                            styles.summaryGrid
                        }
                    >

                        <article
                            className={
                                styles.summaryCard
                            }
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Total de activos
                            </span>


                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {loading
                                    ? "..."
                                    : dashboard
                                        .totalActivos}
                            </strong>


                            <span
                                className={
                                    styles.summaryMeta
                                }
                            >
                                Incluye equipos y chips
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryOperational,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Operativos
                            </span>


                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {loading
                                    ? "..."
                                    : dashboard
                                        .estadosEquipo
                                        .Operativo}
                            </strong>


                            <span
                                className={
                                    styles.summaryMeta
                                }
                            >
                                {
                                    dashboard
                                        .indicadores
                                        .porcentajeOperativo
                                }
                                % de los equipos
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryStock,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                En stock
                            </span>


                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {loading
                                    ? "..."
                                    : dashboard
                                        .estadosEquipo
                                        .Stock}
                            </strong>


                            <span
                                className={
                                    styles.summaryMeta
                                }
                            >
                                {
                                    dashboard
                                        .indicadores
                                        .porcentajeStock
                                }
                                % de los equipos
                            </span>

                        </article>


                        <article
                            className={[
                                styles.summaryCard,
                                styles.summaryInactive,
                            ].join(
                                " ",
                            )}
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >
                                Inoperativos
                            </span>


                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >
                                {loading
                                    ? "..."
                                    : dashboard
                                        .estadosEquipo
                                        .Inoperativo}
                            </strong>


                            <span
                                className={
                                    styles.summaryMeta
                                }
                            >
                                {
                                    dashboard
                                        .indicadores
                                        .porcentajeInoperativo
                                }
                                % de los equipos
                            </span>

                        </article>

                    </div>


                    {/* =================================
                        CATEGORÍAS
                        ================================= */}

                    <div
                        className={
                            styles.categoryGrid
                        }
                    >

                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryPc,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                PC / Laptops
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .pclaptops
                                }
                            </strong>
                        </article>


                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryMonitor,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Monitores
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .monitores
                                }
                            </strong>
                        </article>


                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryTablet,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Tablets
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .tablets
                                }
                            </strong>
                        </article>


                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryModem,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Módems
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .modems
                                }
                            </strong>
                        </article>


                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryPhone,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Celulares
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .celulares
                                }
                            </strong>
                        </article>


                        <article
                            className={[
                                styles.categoryCard,
                                styles.categoryChip,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Chips
                            </span>

                            <strong>
                                {
                                    dashboard
                                        .totales
                                        .chips
                                }
                            </strong>
                        </article>

                    </div>


                    {/* =================================
                        GRÁFICOS INVENTARIO FILA 1
                        ================================= */}

                    <div
                        className={
                            styles.chartGrid
                        }
                    >

                        <article
                            className={
                                styles.chartCard
                            }
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Activos por categoría
                                    </h3>

                                    <p>
                                        Cantidad registrada en cada grupo del Inventario.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.barList
                                }
                            >

                                {dashboard
                                    .porCategoria
                                    .map(
                                        (
                                            item,
                                        ) => (

                                            <div
                                                key={
                                                    item.key
                                                }

                                                className={
                                                    styles.barItem
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.barInfo
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            item.label
                                                        }
                                                    </span>

                                                    <strong>
                                                        {
                                                            item.cantidad
                                                        }
                                                    </strong>
                                                </div>


                                                <div
                                                    className={
                                                        styles.barTrack
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.categoryBar
                                                        }

                                                        style={{
                                                            width:
                                                                `${(
                                                                    item.cantidad /
                                                                    maxCategoria
                                                                ) *
                                                                100}%`,
                                                        }}
                                                    />
                                                </div>

                                            </div>

                                        ),
                                    )}

                            </div>

                        </article>


                        <article
                            className={
                                styles.chartCard
                            }
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Estado de equipos
                                    </h3>

                                    <p>
                                        No incluye chips, ya que utilizan un estado independiente.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.barList
                                }
                            >

                                {estados.map(
                                    (
                                        item,
                                    ) => (

                                        <div
                                            key={
                                                item.label
                                            }

                                            className={
                                                styles.barItem
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.barInfo
                                                }
                                            >
                                                <span>
                                                    {
                                                        item.label
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        item.value
                                                    }
                                                </strong>
                                            </div>


                                            <div
                                                className={
                                                    styles.barTrack
                                                }
                                            >
                                                <div
                                                    className={[
                                                        styles.stateBar,
                                                        item.className,
                                                    ].join(
                                                        " ",
                                                    )}

                                                    style={{
                                                        width:
                                                            `${(
                                                                item.value /
                                                                maxEstado
                                                            ) *
                                                            100}%`,
                                                    }}
                                                />
                                            </div>

                                        </div>

                                    ),
                                )}

                            </div>

                        </article>

                    </div>


                    {/* =================================
                        GRÁFICOS INVENTARIO FILA 2
                        ================================= */}

                    <div
                        className={
                            styles.chartGrid
                        }
                    >

                        <article
                            className={
                                styles.chartCard
                            }
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Activos por área
                                    </h3>

                                    <p>
                                        Top 10 áreas con mayor cantidad de registros.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.barList
                                }
                            >

                                {topAreas.map(
                                    (
                                        item,
                                    ) => (

                                        <div
                                            key={
                                                item.area
                                            }

                                            className={
                                                styles.barItem
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.barInfo
                                                }
                                            >
                                                <span
                                                    title={
                                                        item.area
                                                    }
                                                >
                                                    {
                                                        item.area
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        item.cantidad
                                                    }
                                                </strong>
                                            </div>


                                            <div
                                                className={
                                                    styles.barTrack
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.areaBar
                                                    }

                                                    style={{
                                                        width:
                                                            `${(
                                                                item.cantidad /
                                                                maxArea
                                                            ) *
                                                            100}%`,
                                                    }}
                                                />
                                            </div>

                                        </div>

                                    ),
                                )}


                                {topAreas.length ===
                                    0 && (

                                    <div
                                        className={
                                            styles.emptyState
                                        }
                                    >
                                        No existen áreas registradas.
                                    </div>

                                )}

                            </div>

                        </article>


                        <article
                            className={
                                styles.chartCard
                            }
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Chips
                                    </h3>

                                    <p>
                                        Estado, tipo de uso y disponibilidad de las líneas registradas.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.chipGrid
                                }
                            >

                                <div
                                    className={
                                        styles.chipIndicator
                                    }
                                >
                                    <span>
                                        Activas
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .activas
                                        }
                                    </strong>
                                </div>


                                <div
                                    className={
                                        styles.chipIndicator
                                    }
                                >
                                    <span>
                                        Baja
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .baja
                                        }
                                    </strong>
                                </div>


                                <div
                                    className={
                                        styles.chipIndicator
                                    }
                                >
                                    <span>
                                        Datos
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .datos
                                        }
                                    </strong>
                                </div>


                                <div
                                    className={
                                        styles.chipIndicator
                                    }
                                >
                                    <span>
                                        Voz
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .voz
                                        }
                                    </strong>
                                </div>

                            </div>


                            <div
                                className={
                                    styles.chipSummary
                                }
                            >

                                <div>
                                    <span>
                                        Total de chips
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .totales
                                                .chips
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Stock
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .stock
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Asignados
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .chips
                                                .asignados
                                        }
                                    </strong>
                                </div>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =====================================
                    VPN
                    ===================================== */}

                <section
                    id="vpn"

                    className={[
                        styles.moduleSection,
                        styles.vpnSection,
                    ].join(
                        " ",
                    )}
                >

                    <div
                        className={
                            styles.sectionHeader
                        }
                    >

                        <div>

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
                                Indicadores generales de accesos VPN registrados.
                            </DRText>

                        </div>


                        <a
                            href="/vpn"

                            className={
                                styles.moduleLink
                            }
                        >
                            Ir al módulo
                        </a>

                    </div>


                    {/* =================================
                        RESUMEN VPN
                        ================================= */}

                    <div
                        className={
                            styles.moduleSummaryGrid
                        }
                    >

                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.vpnTotal,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Total VPN
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : vpnDashboard
                                        .total}
                            </strong>

                            <small>
                                Accesos registrados
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.vpnAssigned,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Asignados
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : vpnDashboard
                                        .asignados}
                            </strong>

                            <small>
                                Accesos asignados
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.vpnReserve,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Reserva
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : vpnDashboard
                                        .reserva}
                            </strong>

                            <small>
                                Accesos en reserva
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.vpnActive,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Forti activos
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : vpnDashboard
                                        .fortiActivos}
                            </strong>

                            <small>
                                Estado activo
                            </small>
                        </article>

                    </div>


                    {/* =================================
                        DETALLE VPN
                        ================================= */}

                    <div
                        className={
                            styles.moduleDetailGrid
                        }
                    >

                        <article
                            className={
                                styles.moduleDetailCard
                            }
                        >

                            <div
                                className={
                                    styles.moduleDetailHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Distribución por tipo
                                    </h3>

                                    <p>
                                        Cantidad de accesos Forti y WEB.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.simpleIndicators
                                }
                            >

                                <div
                                    className={
                                        styles.simpleIndicator
                                    }
                                >
                                    <span>
                                        Forti
                                    </span>

                                    <strong>
                                        {
                                            vpnDashboard
                                                .tipoForti
                                        }
                                    </strong>
                                </div>


                                <div
                                    className={
                                        styles.simpleIndicator
                                    }
                                >
                                    <span>
                                        WEB
                                    </span>

                                    <strong>
                                        {
                                            vpnDashboard
                                                .tipoWeb
                                        }
                                    </strong>
                                </div>

                            </div>

                        </article>


                        <article
                            className={
                                styles.moduleDetailCard
                            }
                        >

                            <div
                                className={
                                    styles.moduleDetailHeader
                                }
                            >
                                <div>
                                    <h3>
                                        Estado Forti
                                    </h3>

                                    <p>
                                        Estado actual de los accesos Forti.
                                    </p>
                                </div>
                            </div>


                            <div
                                className={
                                    styles.simpleIndicators
                                }
                            >

                                <div
                                    className={[
                                        styles.simpleIndicator,
                                        styles.simpleIndicatorSuccess,
                                    ].join(
                                        " ",
                                    )}
                                >
                                    <span>
                                        Activos
                                    </span>

                                    <strong>
                                        {
                                            vpnDashboard
                                                .fortiActivos
                                        }
                                    </strong>
                                </div>


                                <div
                                    className={[
                                        styles.simpleIndicator,
                                        styles.simpleIndicatorDanger,
                                    ].join(
                                        " ",
                                    )}
                                >
                                    <span>
                                        Desactivados
                                    </span>

                                    <strong>
                                        {
                                            vpnDashboard
                                                .fortiDesactivados
                                        }
                                    </strong>
                                </div>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =====================================
                    DIRECCIONAMIENTO IP
                    ===================================== */}

                <section
                    id="ips"

                    className={[
                        styles.moduleSection,
                        styles.ipSection,
                    ].join(
                        " ",
                    )}
                >

                    <div
                        className={
                            styles.sectionHeader
                        }
                    >

                        <div>

                            <DRText
                                as="h2"
                                variant="h2"
                                weight="bold"
                            >
                                Direccionamiento IP
                            </DRText>


                            <DRText
                                variant="bodySmall"
                                color="secondary"
                            >
                                Distribución de direcciones registradas por segmento de red.
                            </DRText>

                        </div>


                        <a
                            href="/ip"

                            className={
                                styles.moduleLink
                            }
                        >
                            Ir al módulo
                        </a>

                    </div>


                    {/* =================================
                        RESUMEN IP
                        ================================= */}

                    <div
                        className={
                            styles.ipSummaryGrid
                        }
                    >

                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.ipTotal,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Total IP
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : ipDashboard
                                        .total}
                            </strong>

                            <small>
                                Direcciones registradas
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.ip26,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Segmento 26
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : ipDashboard
                                        .segmentos[
                                            "26"
                                        ]}
                            </strong>

                            <small>
                                IP registradas
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.ip46,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Segmento 46
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : ipDashboard
                                        .segmentos[
                                            "46"
                                        ]}
                            </strong>

                            <small>
                                IP registradas
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.ip56,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Segmento 56
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : ipDashboard
                                        .segmentos[
                                            "56"
                                        ]}
                            </strong>

                            <small>
                                IP registradas
                            </small>
                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.ip100,
                            ].join(
                                " ",
                            )}
                        >
                            <span>
                                Segmento 100
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : ipDashboard
                                        .segmentos[
                                            "100"
                                        ]}
                            </strong>

                            <small>
                                IP registradas
                            </small>
                        </article>

                    </div>


                    {/* =================================
                        GRÁFICO IP
                        ================================= */}

                    <div
                        className={
                            styles.ipChartContainer
                        }
                    >

                        <article
                            className={
                                styles.moduleDetailCard
                            }
                        >

                            <div
                                className={
                                    styles.moduleDetailHeader
                                }
                            >

                                <div>

                                    <h3>
                                        IP por segmento
                                    </h3>


                                    <p>
                                        Comparativo de direcciones registradas en cada red.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.barList
                                }
                            >

                                {segmentosIp.map(
                                    (
                                        item,
                                    ) => (

                                        <div
                                            key={
                                                item.label
                                            }

                                            className={
                                                styles.barItem
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.barInfo
                                                }
                                            >

                                                <span>
                                                    {
                                                        item.label
                                                    }
                                                </span>


                                                <strong>
                                                    {
                                                        item.value
                                                    }
                                                </strong>

                                            </div>


                                            <div
                                                className={
                                                    styles.barTrack
                                                }
                                            >

                                                <div
                                                    className={[
                                                        styles.ipBar,
                                                        item.className,
                                                    ].join(
                                                        " ",
                                                    )}

                                                    style={{
                                                        width:
                                                            `${(
                                                                item.value /
                                                                maxSegmentoIp
                                                            ) *
                                                            100}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    ),
                                )}

                            </div>

                        </article>

                    </div>

                </section>

            </DRContainer>

        </DRPage>

    );

}