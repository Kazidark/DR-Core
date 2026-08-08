import {
    DRPage,
    DRContainer,
    DRGrid,
    DRMetricCard,
    DRIcon,
} from "@/design-system";

import { DashboardHero } from "@/modules/dashboard/widgets/DashboardHero";
import { InfrastructureHealth } from "@/modules/dashboard/widgets/InfrastructureHealth";
import { ActiveAlerts } from "@/modules/dashboard/widgets/ActiveAlerts";

export default function Dashboard() {

    return (

        <DRPage
            title="Dashboard"
            description=""
        >

            <DRContainer
                fluid
                padding="none"
            >

                {/* HERO */}

                <DashboardHero />

                {/* MÉTRICAS */}

                <section
                    style={{
                        marginTop: "32px",
                    }}
                >

                    <DRGrid>

                        <DRMetricCard
                            variant="blue"
                            title="Equipos"
                            value="0"
                            subtitle="Inventario registrado"
                            trend="+0 % este mes"
                            trendType="up"
                            icon={<DRIcon name="laptop" />}
                        />

                        <DRMetricCard
                            variant="green"
                            title="Servidores"
                            value="0"
                            subtitle="Infraestructura"
                            trend="+0 % este mes"
                            trendType="up"
                            icon={<DRIcon name="server" />}
                        />

                        <DRMetricCard
                            variant="purple"
                            title="VPN"
                            value="0"
                            subtitle="Usuarios activos"
                            trend="+0 % este mes"
                            trendType="up"
                            icon={<DRIcon name="shield" />}
                        />

                        <DRMetricCard
                            variant="orange"
                            title="Correos"
                            value="0"
                            subtitle="Licencias activas"
                            trend="+0 % este mes"
                            trendType="down"
                            icon={<DRIcon name="mail" />}
                        />

                    </DRGrid>

                </section>

                {/* PRIMERA FILA */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "24px",
                        marginTop: "40px",
                        alignItems: "start",
                    }}
                >

                    <InfrastructureHealth
                        percentage={98}
                        items={[
                            {
                                label: "Operativo",
                                value: 98,
                                color: "green",
                            },
                            {
                                label: "Advertencia",
                                value: 1,
                                color: "yellow",
                            },
                            {
                                label: "Crítico",
                                value: 0,
                                color: "red",
                            },
                            {
                                label: "Mantenimiento",
                                value: 1,
                                color: "blue",
                            },
                        ]}
                    />

                    <ActiveAlerts
                        alerts={[
                            {
                                id: 1,
                                title: "Servidor APP-01",
                                description: "Uso elevado de CPU",
                                priority: "critical",
                                time: "Hace 2 min",
                            },
                            {
                                id: 2,
                                title: "VPN",
                                description: "5 usuarios pendientes",
                                priority: "warning",
                                time: "Hace 10 min",
                            },
                            {
                                id: 3,
                                title: "Backup",
                                description: "Respaldo completado",
                                priority: "info",
                                time: "Hace 35 min",
                            },
                        ]}
                    />

                </div>

                {/* SEGUNDA FILA (Reservada para próximos widgets) */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginTop: "40px",
                    }}
                >

                    {/* SegmentOverview */}

                    {/* RecentActivity */}

                </div>

            </DRContainer>

        </DRPage>

    );

}