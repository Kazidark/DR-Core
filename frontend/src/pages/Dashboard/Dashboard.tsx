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
    useAuth,
} from "@/auth";

import {
    DashboardHero,
} from "@/modules/dashboard/widgets/DashboardHero";

import styles from "./Dashboard.module.css";


/* =========================================================
   TIPOS INVENTARIO
   ========================================================= */

type CategoriaDashboard = {
    key:
        string;

    label:
        string;

    cantidad:
        number;
};


type AreaDashboard = {
    area:
        string;

    cantidad:
        number;
};


type DashboardInventario = {
    totalActivos:
        number;

    totalEquipos:
        number;

    totales: {
        pclaptops:
            number;

        monitores:
            number;

        tablets:
            number;

        modems:
            number;

        celulares:
            number;

        chips:
            number;
    };

    porCategoria:
        CategoriaDashboard[];

    estadosEquipo: {
        Operativo:
            number;

        Inoperativo:
            number;

        Stock:
            number;

        Donado:
            number;

        Vendido:
            number;

        SinEstado:
            number;
    };

    indicadores: {
        porcentajeOperativo:
            number;

        porcentajeStock:
            number;

        porcentajeInoperativo:
            number;
    };

    chips: {
        activas:
            number;

        baja:
            number;

        datos:
            number;

        voz:
            number;

        stock:
            number;

        asignados:
            number;

        porArea:
            AreaDashboard[];
    };

    porArea:
        AreaDashboard[];
};


/* =========================================================
   TIPOS VPN
   ========================================================= */

type DashboardVpn = {
    total:
        number;

    asignados:
        number;

    reserva:
        number;

    fortiActivos:
        number;

    fortiDesactivados:
        number;

    tipoForti:
        number;

    tipoWeb:
        number;
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
    total:
        number;

    segmentos: {
        "26":
            number;

        "46":
            number;

        "56":
            number;

        "100":
            number;
    };
};


/* =========================================================
   TIPOS CORREOS
   ========================================================= */

type DashboardCorreos = {
    total:
        number;

    usados:
        number;

    reserva:
        number;

    conCorreoCreado:
        number;

    pendientesCreacion:
        number;

    porcentajeCreados:
        number;
};


/* =========================================================
   TIPOS LICENCIAS OFFICE
   ========================================================= */

type DashboardLicenciasOffice = {
    total:
        number;

    officeBasico:
        number;

    officeEmpresarial:
        number;

    powerBi:
        number;

    activadas:
        number;

    desactivadas:
        number;

    porcentajeActivadas:
        number;
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

    totalActivos:
        0,

    totalEquipos:
        0,

    totales: {
        pclaptops:
            0,

        monitores:
            0,

        tablets:
            0,

        modems:
            0,

        celulares:
            0,

        chips:
            0,
    },

    porCategoria:
        [],

    estadosEquipo: {
        Operativo:
            0,

        Inoperativo:
            0,

        Stock:
            0,

        Donado:
            0,

        Vendido:
            0,

        SinEstado:
            0,
    },

    indicadores: {
        porcentajeOperativo:
            0,

        porcentajeStock:
            0,

        porcentajeInoperativo:
            0,
    },

    chips: {
        activas:
            0,

        baja:
            0,

        datos:
            0,

        voz:
            0,

        stock:
            0,

        asignados:
            0,

        porArea:
            [],
    },

    porArea:
        [],
};


const initialVpnDashboard:
    DashboardVpn = {

    total:
        0,

    asignados:
        0,

    reserva:
        0,

    fortiActivos:
        0,

    fortiDesactivados:
        0,

    tipoForti:
        0,

    tipoWeb:
        0,
};


const initialIpDashboard:
    DashboardIp = {

    total:
        0,

    segmentos: {
        "26":
            0,

        "46":
            0,

        "56":
            0,

        "100":
            0,
    },
};


const initialCorreosDashboard:
    DashboardCorreos = {

    total:
        0,

    usados:
        0,

    reserva:
        0,

    conCorreoCreado:
        0,

    pendientesCreacion:
        0,

    porcentajeCreados:
        0,
};


const initialLicenciasDashboard:
    DashboardLicenciasOffice = {

    total:
        0,

    officeBasico:
        0,

    officeEmpresarial:
        0,

    powerBi:
        0,

    activadas:
        0,

    desactivadas:
        0,

    porcentajeActivadas:
        0,
};


/* =========================================================
   COMPONENTE
   ========================================================= */

export default function Dashboard() {

    /* =====================================================
       USUARIO / PERMISOS
       ===================================================== */

    const {
        usuario:
            usuarioSesion,
    } =
        useAuth();


    const esAdministrador =
        usuarioSesion?.rol ===
        "Administrador";


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
        correosDashboard,
        setCorreosDashboard,
    ] =
        useState<
            DashboardCorreos
        >(
            initialCorreosDashboard,
        );


    const [
        licenciasDashboard,
        setLicenciasDashboard,
    ] =
        useState<
            DashboardLicenciasOffice
        >(
            initialLicenciasDashboard,
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

                    const [
                        inventarioResponse,
                        vpnResponse,
                        ipsResponse,
                        correosResponse,
                        licenciasResponse,
                    ] =
                        await Promise.all([

                            authFetch(
                                `${API_URL}/inventario/dashboard`,
                            ),

                            authFetch(
                                `${API_URL}/vpn/resumen`,
                            ),

                            authFetch(
                                `${API_URL}/ips/resumen`,
                            ),

                            authFetch(
                                `${API_URL}/correos/resumen`,
                            ),

                            authFetch(
                                `${API_URL}/licencias-office/resumen`,
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


                    const vpnResumen =
                        (await vpnResponse.json()) as
                            DashboardVpn;


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

                        "26":
                            0,

                        "46":
                            0,

                        "56":
                            0,

                        "100":
                            0,
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


                    /* =====================================
                       CORREOS
                       ===================================== */

                    if (
                        !correosResponse.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar la información de Correos.",
                        );

                    }


                    const correosData =
                        (await correosResponse.json()) as
                            DashboardCorreos;


                    setCorreosDashboard(
                        correosData,
                    );


                    /* =====================================
                       LICENCIAS OFFICE
                       ===================================== */

                    if (
                        !licenciasResponse.ok
                    ) {

                        throw new Error(
                            "No se pudo cargar la información de Licencias Office.",
                        );

                    }


                    const licenciasData =
                        (await licenciasResponse.json()) as
                            DashboardLicenciasOffice;


                    setLicenciasDashboard(
                        licenciasData,
                    );

                } catch (
                    err
                ) {

                    setError(
                        err instanceof
                            Error
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
       TOP ÁREAS INVENTARIO
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
       TOP ÁREAS CHIPS
       ===================================================== */

    const topChipAreas =
        useMemo(
            () =>
                dashboard
                    .chips
                    .porArea
                    .slice(
                        0,
                        10,
                    ),
            [
                dashboard
                    .chips
                    .porArea,
            ],
        );


    /* =====================================================
       MÁXIMO CATEGORÍA
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


    /* =====================================================
       MÁXIMO ESTADO EQUIPOS
       ===================================================== */

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


    /* =====================================================
       MÁXIMO ÁREAS INVENTARIO
       ===================================================== */

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


    /* =====================================================
       MÁXIMO ÁREAS CHIPS
       ===================================================== */

    const maxChipArea =
        useMemo(
            () =>
                Math.max(
                    ...topChipAreas.map(
                        (
                            item,
                        ) =>
                            item.cantidad,
                    ),
                    1,
                ),
            [
                topChipAreas,
            ],
        );


    /* =====================================================
       MÁXIMO USO CHIPS
       ===================================================== */

    const maxChipUso =
        useMemo(
            () =>
                Math.max(
                    dashboard
                        .chips
                        .datos,

                    dashboard
                        .chips
                        .voz,

                    1,
                ),
            [
                dashboard
                    .chips
                    .datos,

                dashboard
                    .chips
                    .voz,
            ],
        );


    /* =====================================================
       MÁXIMO SEGMENTO IP
       ===================================================== */

    const maxSegmentoIp =
        useMemo(
            () =>
                Math.max(
                    ipDashboard.segmentos[
                        "26"
                    ],

                    ipDashboard.segmentos[
                        "46"
                    ],

                    ipDashboard.segmentos[
                        "56"
                    ],

                    ipDashboard.segmentos[
                        "100"
                    ],

                    1,
                ),
            [
                ipDashboard,
            ],
        );


    /* =====================================================
       ESTADOS EQUIPOS
       ===================================================== */

    const estados = [
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


                    <a
                        href="#correos"
                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="orange"
                            title="Correos"

                            value={
                                loading
                                    ? "..."
                                    : String(
                                        correosDashboard
                                            .total,
                                    )
                            }

                            trendType="up"

                            icon={
                                <DRIcon
                                    name="mail"
                                />
                            }
                        />

                    </a>


                    <a
                        href="#licencias-office"
                        className={
                            styles.metricLink
                        }
                    >

                        <DRMetricCard
                            variant="purple"
                            title="Licencias"

                            value={
                                loading
                                    ? "..."
                                    : String(
                                        licenciasDashboard
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

                        {/* ACTIVO POR ÁREA */}

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


                        {/* =================================
                            NUEVO RESUMEN DE CHIPS
                            ================================= */}

                        <article
                            className={[
                                styles.chartCard,
                                styles.chipDashboardCard,
                            ].join(
                                " ",
                            )}
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >

                                <div>

                                    <h3>
                                        Resumen de chips
                                    </h3>

                                    <p>
                                        Estado, disponibilidad y tipo de uso de las líneas registradas.
                                    </p>

                                </div>

                            </div>


                            {/* =============================
                                TOTAL / ASIGNADOS / STOCK
                                ============================= */}

                            <div
                                className={
                                    styles.chipMainMetrics
                                }
                            >

                                <div
                                    className={[
                                        styles.chipMainMetric,
                                        styles.chipMetricTotal,
                                    ].join(
                                        " ",
                                    )}
                                >

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {
                                            dashboard
                                                .totales
                                                .chips
                                        }
                                    </strong>

                                    <small>
                                        Chips registrados
                                    </small>

                                </div>


                                <div
                                    className={[
                                        styles.chipMainMetric,
                                        styles.chipMetricAssigned,
                                    ].join(
                                        " ",
                                    )}
                                >

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

                                    <small>
                                        Con área asignada
                                    </small>

                                </div>


                                <div
                                    className={[
                                        styles.chipMainMetric,
                                        styles.chipMetricStock,
                                    ].join(
                                        " ",
                                    )}
                                >

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

                                    <small>
                                        Disponibles
                                    </small>

                                </div>

                            </div>


                            {/* =============================
                                ESTADO
                                ============================= */}

                            <div
                                className={
                                    styles.chipSubsection
                                }
                            >

                                <div
                                    className={
                                        styles.chipSubsectionTitle
                                    }
                                >
                                    Estado de líneas
                                </div>


                                <div
                                    className={
                                        styles.chipStatusGrid
                                    }
                                >

                                    <div
                                        className={[
                                            styles.chipStatusIndicator,
                                            styles.chipStatusActive,
                                        ].join(
                                            " ",
                                        )}
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
                                        className={[
                                            styles.chipStatusIndicator,
                                            styles.chipStatusLow,
                                        ].join(
                                            " ",
                                        )}
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

                                </div>

                            </div>


                            {/* =============================
                                TIPO DE USO
                                ============================= */}

                            <div
                                className={
                                    styles.chipSubsection
                                }
                            >

                                <div
                                    className={
                                        styles.chipSubsectionTitle
                                    }
                                >
                                    Tipo de uso
                                </div>


                                <div
                                    className={
                                        styles.barList
                                    }
                                >

                                    <div
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
                                                styles.barTrack
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.chipDataBar
                                                }

                                                style={{
                                                    width:
                                                        `${(
                                                            dashboard
                                                                .chips
                                                                .datos /
                                                            maxChipUso
                                                        ) *
                                                        100}%`,
                                                }}
                                            />

                                        </div>

                                    </div>


                                    <div
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


                                        <div
                                            className={
                                                styles.barTrack
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.chipVoiceBar
                                                }

                                                style={{
                                                    width:
                                                        `${(
                                                            dashboard
                                                                .chips
                                                                .voz /
                                                            maxChipUso
                                                        ) *
                                                        100}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </article>

                    </div>


                    {/* =================================
                        CHIPS ASIGNADOS POR ÁREA
                        ================================= */}

                    <div
                        className={
                            styles.chipAreaContainer
                        }
                    >

                        <article
                            className={[
                                styles.chartCard,
                                styles.chipAreaCard,
                            ].join(
                                " ",
                            )}
                        >

                            <div
                                className={
                                    styles.chartHeader
                                }
                            >

                                <div>

                                    <h3>
                                        Chips asignados por área
                                    </h3>


                                    <p>
                                        Top 10 áreas con mayor cantidad de chips asignados. No incluye chips en Stock ni registros sin área.
                                    </p>

                                </div>


                                <div
                                    className={
                                        styles.chipAreaTotal
                                    }
                                >

                                    <span>
                                        Total asignados
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


                            <div
                                className={
                                    styles.barList
                                }
                            >

                                {topChipAreas.map(
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
                                                        styles.chipAreaBar
                                                    }

                                                    style={{
                                                        width:
                                                            `${(
                                                                item.cantidad /
                                                                maxChipArea
                                                            ) *
                                                            100}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    ),
                                )}


                                {topChipAreas.length ===
                                    0 && (

                                    <div
                                        className={
                                            styles.emptyState
                                        }
                                    >
                                        No existen chips asignados a áreas.
                                    </div>

                                )}

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


                        {esAdministrador && (

                            <a
                                href="/vpn"
                                className={
                                    styles.moduleLink
                                }
                            >
                                Ir al módulo
                            </a>

                        )}

                    </div>


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


                        {esAdministrador && (

                            <a
                                href="/ip"
                                className={
                                    styles.moduleLink
                                }
                            >
                                Ir al módulo
                            </a>

                        )}

                    </div>


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


                {/* =====================================
                    CORREOS
                    ===================================== */}

                <section
                    id="correos"

                    className={[
                        styles.moduleSection,
                        styles.correosSection,
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
                                Correos
                            </DRText>


                            <DRText
                                variant="bodySmall"
                                color="secondary"
                            >
                                Estado general de las cuentas de correo registradas y su proceso de creación.
                            </DRText>

                        </div>


                        {esAdministrador && (

                            <a
                                href="/correos"
                                className={
                                    styles.moduleLink
                                }
                            >
                                Ir al módulo
                            </a>

                        )}

                    </div>


                    <div
                        className={
                            styles.moduleSummaryGrid
                        }
                    >

                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.correosTotal,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Total de cuentas
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : correosDashboard
                                        .total}
                            </strong>

                            <small>
                                Registros de correo
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.correosUsed,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Usados
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : correosDashboard
                                        .usados}
                            </strong>

                            <small>
                                Cuentas actualmente utilizadas
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.correosReserve,
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
                                    : correosDashboard
                                        .reserva}
                            </strong>

                            <small>
                                Cuentas disponibles en reserva
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.correosPending,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Pendientes de creación
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : correosDashboard
                                        .pendientesCreacion}
                            </strong>

                            <small>
                                Sin correo creado
                            </small>

                        </article>

                    </div>


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
                                        Proceso de creación
                                    </h3>

                                    <p>
                                        Seguimiento de las cuentas que ya cuentan con correo creado.
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
                                        Correos creados
                                    </span>

                                    <strong>
                                        {
                                            correosDashboard
                                                .conCorreoCreado
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.simpleIndicator
                                    }
                                >

                                    <span>
                                        Pendientes
                                    </span>

                                    <strong>
                                        {
                                            correosDashboard
                                                .pendientesCreacion
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.progressBlock
                                }
                            >

                                <div
                                    className={
                                        styles.progressInfo
                                    }
                                >

                                    <span>
                                        Avance de creación
                                    </span>

                                    <strong>
                                        {
                                            correosDashboard
                                                .porcentajeCreados
                                        }
                                        %
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.barTrack
                                    }
                                >

                                    <div
                                        className={
                                            styles.correosProgressBar
                                        }

                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        correosDashboard
                                                            .porcentajeCreados,
                                                        0,
                                                    ),
                                                    100,
                                                )}%`,
                                        }}
                                    />

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
                                        Estado de cuentas
                                    </h3>

                                    <p>
                                        Distribución entre cuentas utilizadas y cuentas de reserva.
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
                                        Usados
                                    </span>

                                    <strong>
                                        {
                                            correosDashboard
                                                .usados
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.simpleIndicator
                                    }
                                >

                                    <span>
                                        Reserva
                                    </span>

                                    <strong>
                                        {
                                            correosDashboard
                                                .reserva
                                        }
                                    </strong>

                                </div>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =====================================
                    LICENCIAS OFFICE
                    ===================================== */}

                <section
                    id="licencias-office"

                    className={[
                        styles.moduleSection,
                        styles.licenciasSection,
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
                                Licencias Office
                            </DRText>


                            <DRText
                                variant="bodySmall"
                                color="secondary"
                            >
                                Distribución y estado de las licencias Office y Power BI registradas.
                            </DRText>

                        </div>


                        {esAdministrador && (

                            <a
                                href="/licencias-office"
                                className={
                                    styles.moduleLink
                                }
                            >
                                Ir al módulo
                            </a>

                        )}

                    </div>


                    <div
                        className={
                            styles.moduleSummaryGrid
                        }
                    >

                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.licenciasTotal,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Total de licencias
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : licenciasDashboard
                                        .total}
                            </strong>

                            <small>
                                Licencias registradas
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.licenciasActive,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Activadas
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : licenciasDashboard
                                        .activadas}
                            </strong>

                            <small>
                                Licencias en uso
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.licenciasInactive,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Desactivadas
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : licenciasDashboard
                                        .desactivadas}
                            </strong>

                            <small>
                                Licencias desactivadas
                            </small>

                        </article>


                        <article
                            className={[
                                styles.moduleSummaryCard,
                                styles.licenciasPercent,
                            ].join(
                                " ",
                            )}
                        >

                            <span>
                                Porcentaje activadas
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : `${licenciasDashboard
                                        .porcentajeActivadas}%`}
                            </strong>

                            <small>
                                Respecto al total registrado
                            </small>

                        </article>

                    </div>


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
                                        Distribución por licencia
                                    </h3>

                                    <p>
                                        Cantidad registrada en cada categoría.
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.licenseIndicators
                                }
                            >

                                <div
                                    className={[
                                        styles.licenseIndicator,
                                        styles.licenseBasic,
                                    ].join(
                                        " ",
                                    )}
                                >

                                    <span>
                                        Office Básico
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .officeBasico
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={[
                                        styles.licenseIndicator,
                                        styles.licenseEnterprise,
                                    ].join(
                                        " ",
                                    )}
                                >

                                    <span>
                                        Office Empresarial
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .officeEmpresarial
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={[
                                        styles.licenseIndicator,
                                        styles.licensePowerBi,
                                    ].join(
                                        " ",
                                    )}
                                >

                                    <span>
                                        Power BI
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .powerBi
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
                                        Estado de licencias
                                    </h3>

                                    <p>
                                        Comparativo entre licencias activadas y desactivadas.
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
                                        Activadas
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .activadas
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
                                        Desactivadas
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .desactivadas
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.progressBlock
                                }
                            >

                                <div
                                    className={
                                        styles.progressInfo
                                    }
                                >

                                    <span>
                                        Nivel de activación
                                    </span>

                                    <strong>
                                        {
                                            licenciasDashboard
                                                .porcentajeActivadas
                                        }
                                        %
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.barTrack
                                    }
                                >

                                    <div
                                        className={
                                            styles.licenciasProgressBar
                                        }

                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        licenciasDashboard
                                                            .porcentajeActivadas,
                                                        0,
                                                    ),
                                                    100,
                                                )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </article>

                    </div>

                </section>

            </DRContainer>

        </DRPage>

    );

}