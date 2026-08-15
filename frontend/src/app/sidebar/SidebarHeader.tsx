import styles from "./Sidebar.module.css";


type SidebarHeaderProps = {
    collapsed:
        boolean;

    onToggle:
        () => void;
};


export function SidebarHeader({
    collapsed,
    onToggle,
}: SidebarHeaderProps) {

    return (

        <header
            className={
                styles.sidebarHeader
            }
        >

            <div
                className={
                    styles.brandArea
                }
            >

                <div
                    className={
                        styles.brandLogo
                    }
                >
                    DR+
                </div>


                {!collapsed && (

                    <div
                        className={
                            styles.brandText
                        }
                    >

                        <strong>
                            DR+ Core
                        </strong>


                        <span>
                            Plataforma Integral TI
                        </span>

                    </div>

                )}

            </div>


            <button
                type="button"

                className={
                    styles.collapseButton
                }

                onClick={
                    onToggle
                }

                title={
                    collapsed
                        ? "Expandir menú"
                        : "Contraer menú"
                }

                aria-label={
                    collapsed
                        ? "Expandir menú lateral"
                        : "Contraer menú lateral"
                }
            >
                {collapsed
                    ? "›"
                    : "‹"}
            </button>

        </header>

    );

}