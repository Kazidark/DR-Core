import {
    useState,
} from "react";

import {
    SidebarHeader,
} from "./SidebarHeader";

import {
    SidebarContent,
} from "./SidebarContent";

import {
    SidebarFooter,
} from "./SidebarFooter";

import styles from "./Sidebar.module.css";


const STORAGE_KEY =
    "dr-core-sidebar-collapsed";


export function Sidebar() {

    const [
        collapsed,
        setCollapsed,
    ] =
        useState<boolean>(
            () =>
                localStorage.getItem(
                    STORAGE_KEY,
                ) ===
                "true",
        );


    function toggleSidebar() {

        setCollapsed(
            (
                current,
            ) => {

                const next =
                    !current;


                localStorage.setItem(
                    STORAGE_KEY,
                    String(
                        next,
                    ),
                );


                return next;

            },
        );

    }


    return (

        <aside
            className={[
                styles.sidebar,

                collapsed
                    ? styles.sidebarCollapsed
                    : styles.sidebarExpanded,

            ].join(
                " ",
            )}
        >

            <SidebarHeader
                collapsed={
                    collapsed
                }

                onToggle={
                    toggleSidebar
                }
            />


            <div
                className={
                    styles.contentArea
                }
            >

                <SidebarContent
                    collapsed={
                        collapsed
                    }
                />

            </div>


            <SidebarFooter
                collapsed={
                    collapsed
                }
            />

        </aside>

    );

}