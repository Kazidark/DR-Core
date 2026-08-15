import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import {
    Box,
    Flex,
    Text,
} from "@/design-system";

import styles from "./TopBar.module.css";

type PageHeaderConfig = {
    title: string;
    description: string;
};

const routeHeaders: Record<
    string,
    PageHeaderConfig
> = {
    "/dashboard": {
        title: "Dashboard",
        description:
            "Resumen general de la infraestructura tecnológica",
    },

    "/inventario": {
        title: "Inventario",
        description:
            "Gestión y administración de activos tecnológicos",
    },

    "/usuarios": {
        title: "Usuarios",
        description:
            "Administración de usuarios y accesos del sistema",
    },
};

export function TopBar() {
    const location = useLocation();

    const header = useMemo(
        () =>
            routeHeaders[
                location.pathname
            ] ?? {
                title: "DR+ Core",
                description:
                    "Plataforma Integral de Gestión para Infraestructura TI",
            },
        [location.pathname],
    );

    return (
        <Box
            className={
                styles.topbar
            }
        >
            <Flex
                className={
                    styles.content
                }
                justify="between"
                align="center"
            >
                <div
                    className={
                        styles.pageInfo
                    }
                >
                    <Text
                        variant="h2"
                        className={
                            styles.title
                        }
                    >
                        {header.title}
                    </Text>

                    <Text
                        variant="bodySmall"
                        className={
                            styles.description
                        }
                    >
                        {
                            header.description
                        }
                    </Text>
                </div>

                <div
                    className={
                        styles.version
                    }
                >
                    <span
                        className={
                            styles.statusDot
                        }
                    />

                    <Text
                        variant="bodySmall"
                    >
                        DR+ Core v1.0
                    </Text>
                </div>
            </Flex>
        </Box>
    );
}