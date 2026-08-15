import type {
    HTMLAttributes,
    ReactNode,
} from "react";


export type TextVariant =
    | "display"
    | "h1"
    | "h2"
    | "h3"
    | "title"
    | "subtitle"
    | "body"
    | "bodySmall"
    | "caption"
    | "label";


export type TextElement =
    | "span"
    | "p"
    | "label"
    | "strong"
    | "small"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";


export interface TextProps
    extends HTMLAttributes<HTMLElement> {

    variant?: TextVariant;

    as?: TextElement;

    children: ReactNode;
}