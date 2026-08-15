import {
    NavLink,
} from "react-router-dom";

import {
    useAuth,
} from "@/auth";

import type {
    RolUsuario,
} from "@/auth";

import styles from "./Sidebar.module.css";


type SidebarContentProps = {
    collapsed:
        boolean;
};


type MenuItem = {
    label:
        string;

    shortLabel:
        string;

    path:
        string;

    roles:
        RolUsuario[];
};


const menuItems:
    MenuItem[] = [

    {
        label:
            "Dashboard",

        shortLabel:
            "DB",

        path:
            "/dashboard",

        roles: [
            "Administrador",
            "Consultor",
        ],
    },

    {
        label:
            "Inventario",

        shortLabel:
            "IN",

        path:
            "/inventario",

        roles: [
            "Administrador",
            "Consultor",
        ],
    },

    {
        label:
            "VPN",

        shortLabel:
            "VP",

        path:
            "/vpn",

        roles: [
            "Administrador",
        ],
    },

    {
        label:
            "Correos",

        shortLabel:
            "CO",

        path:
            "/correos",

        roles: [
            "Administrador",
        ],
    },

    {
        label:
            "IP",

        shortLabel:
            "IP",

        path:
            "/ip",

        roles: [
            "Administrador",
        ],
    },

    {
        label:
            "Impresoras",

        shortLabel:
            "IM",

        path:
            "/impresoras",

        roles: [
            "Administrador",
            "Consultor",
        ],
    },

    {
        label:
            "Servidores",

        shortLabel:
            "SV",

        path:
            "/servidores",

        roles: [
            "Administrador",
        ],
    },

    {
        label:
            "Switch",

        shortLabel:
            "SW",

        path:
            "/switch",

        roles: [
            "Administrador",
        ],
    },

    {
        label:
            "Usuarios",

        shortLabel:
            "US",

        path:
            "/usuarios",

        roles: [
            "Administrador",
        ],
    },

];


export function SidebarContent({
    collapsed,
}: SidebarContentProps) {

    const {
        usuario,
        logout,
    } =
        useAuth();


    const visibles =
        menuItems.filter(
            (
                item,
            ) =>
                usuario !==
                    null &&
                item.roles.includes(
                    usuario.rol,
                ),
        );


    return (

        <nav
            className={[
                styles.menu,

                collapsed
                    ? styles.menuCollapsed
                    : "",

            ].join(
                " ",
            )}
        >

            <div
                className={
                    styles.menuItems
                }
            >

                {visibles.map(
                    (
                        item,
                    ) => (

                        <NavLink
                            key={
                                item.path
                            }

                            to={
                                item.path
                            }

                            end

                            title={
                                collapsed
                                    ? item.label
                                    : undefined
                            }

                            className={({
                                isActive,
                            }) =>
                                [
                                    styles.menuLink,

                                    isActive
                                        ? styles.menuLinkActive
                                        : "",

                                    collapsed
                                        ? styles.menuLinkCollapsed
                                        : "",

                                ].join(
                                    " ",
                                )
                            }
                        >

                            <span
                                className={
                                    styles.menuIcon
                                }
                            >
                                {
                                    item.shortLabel
                                }
                            </span>


                            {!collapsed && (

                                <span
                                    className={
                                        styles.menuLabel
                                    }
                                >
                                    {
                                        item.label
                                    }
                                </span>

                            )}

                        </NavLink>

                    ),
                )}

            </div>


            <button
                type="button"

                className={[
                    styles.logoutButton,

                    collapsed
                        ? styles.logoutButtonCollapsed
                        : "",

                ].join(
                    " ",
                )}

                onClick={
                    logout
                }

                title={
                    collapsed
                        ? "Cerrar sesión"
                        : undefined
                }
            >

                <span
                    className={
                        styles.logoutIcon
                    }
                >
                    ↪
                </span>


                {!collapsed && (
                    <span>
                        Cerrar sesión
                    </span>
                )}

            </button>

        </nav>

    );

}