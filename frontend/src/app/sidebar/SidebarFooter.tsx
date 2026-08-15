import {
    useAuth,
} from "@/auth";

import styles from "./Sidebar.module.css";


type SidebarFooterProps = {
    collapsed:
        boolean;
};


export function SidebarFooter({
    collapsed,
}: SidebarFooterProps) {

    const {
        usuario,
    } =
        useAuth();


    const rol =
        usuario?.rol ??
        "Usuario";


    const rolCompacto =
        rol ===
        "Administrador"
            ? "ADM"
            : rol ===
              "Consultor"
            ? "CON"
            : "USR";


    return (

        <footer
            className={[
                styles.sidebarFooter,

                collapsed
                    ? styles.sidebarFooterCollapsed
                    : "",

            ].join(
                " ",
            )}

            title={
                collapsed
                    ? rol
                    : undefined
            }
        >

            {!collapsed ? (

                <>

                    <span
                        className={
                            styles.footerCaption
                        }
                    >
                        Perfil activo
                    </span>


                    <strong
                        className={
                            styles.footerRole
                        }
                    >
                        {
                            rol
                        }
                    </strong>

                </>

            ) : (

                <span
                    className={
                        styles.footerRoleCompact
                    }
                >
                    {
                        rolCompacto
                    }
                </span>

            )}

        </footer>

    );

}