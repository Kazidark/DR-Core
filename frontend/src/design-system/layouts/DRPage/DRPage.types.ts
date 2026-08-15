import type {
    ReactNode,
} from "react";

export interface DRPageProps {
    title: string;

    description?: string;

    actions?: ReactNode;

    children: ReactNode;

    /**
     * Permite ocultar el encabezado interno
     * cuando el título ya está siendo mostrado
     * por el TopBar principal.
     */
    hideHeader?: boolean;
}