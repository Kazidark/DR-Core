import styles from "./DRGrid.module.css";

import type {
    DRGridProps,
} from "./DRGrid.types";


export default function DRGrid({

    children,

    gap = "lg",

    minItemWidth = 280,

    className = "",

    style,

    id,

}: DRGridProps) {

    return (

        <div

            id={
                id
            }

            className={[
                styles.grid,
                styles[
                    `gap-${gap}`
                ],
                className,
            ]
                .filter(
                    Boolean,
                )
                .join(
                    " ",
                )}

            style={{

                gridTemplateColumns:
                    `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,

                ...style,

            }}

        >

            {
                children
            }

        </div>

    );
}