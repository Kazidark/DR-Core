import type {
    HTMLAttributes,
    ReactNode,
} from "react";


export type FlexDirection =
    | "row"
    | "column";


export type FlexJustify =
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly";


export type FlexAlign =
    | "start"
    | "center"
    | "end"
    | "stretch";


export interface FlexProps
    extends HTMLAttributes<HTMLDivElement> {

    children?: ReactNode;

    direction?: FlexDirection;

    justify?: FlexJustify;

    align?: FlexAlign;

    gap?: number;
}