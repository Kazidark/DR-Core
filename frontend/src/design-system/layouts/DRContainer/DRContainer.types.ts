import type {
    CSSProperties,
    ReactNode,
} from "react";


export interface DRContainerProps {

    children: ReactNode;

    className?: string;

    style?: CSSProperties;

    id?: string;

    fluid?: boolean;

    padding?:
        | "none"
        | "sm"
        | "md"
        | "lg";

    maxWidth?:
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "full";
}