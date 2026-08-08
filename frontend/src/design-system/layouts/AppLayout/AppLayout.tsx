import styles from "./AppLayout.module.css";

import type { AppLayoutProps } from "./AppLayout.types";

import { Box } from "../../primitives";

export default function AppLayout({
    sidebar,
    header,
    footer,
    children
}: AppLayoutProps) {

    return (

        <Box className={styles.layout}>

            <Box className={styles.sidebar}>
                {sidebar}
            </Box>

            <Box className={styles.header}>
                {header}
            </Box>

            <Box className={styles.content}>
                {children}
            </Box>

            <Box className={styles.footer}>
                {footer}
            </Box>

        </Box>

    );

}