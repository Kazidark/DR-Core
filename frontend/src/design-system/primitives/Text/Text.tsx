import type {
    ElementType,
} from "react";

import styles from "./Text.module.css";

import type {
    TextProps,
} from "./Text.types";

import {
    cn,
} from "../../utils";


export function Text({

    as,

    variant = "body",

    className = "",

    children,

    ...props

}: TextProps) {

    const Component:
        ElementType =
            as ?? "p";


    return (

        <Component

            className={
                cn(
                    styles.text,
                    styles[
                        variant
                    ],
                    className,
                )
            }

            {...props}

        >

            {
                children
            }

        </Component>

    );
}