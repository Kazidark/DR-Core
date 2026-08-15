import type {
    CSSProperties,
    ReactNode,
} from "react";


export type DRCardVariant =
    | "default"
    | "outlined"
    | "elevated"
    | "flat";


export type DRCardPadding =
    | "none"
    | "sm"
    | "md"
    | "lg";


export type DRCardShadow =
    | "none"
    | "sm"
    | "md"
    | "lg";


export interface DRCardProps {

    children: ReactNode;

    className?: string;

    style?: CSSProperties;

    id?: string;

    variant?: DRCardVariant;

    padding?: DRCardPadding;

    shadow?: DRCardShadow;

    hover?: boolean;
}


export interface DRCardHeaderProps {

    children: ReactNode;

    className?: string;
}


export interface DRCardContentProps {

    children: ReactNode;

    className?: string;
}


export interface DRCardFooterProps {

    children: ReactNode;

    className?: string;
}