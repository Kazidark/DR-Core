import styles from "./Flex.module.css";

import type { FlexProps } from "./Flex.types";

import { cn } from "../../utils";

export function Flex({
  children,
  className = "",
  direction = "row",
  justify = "start",
  align = "stretch",
  gap = 0,
  style,
  ...props
}: FlexProps) {

  return (
    <div
      className={cn(styles.flex, className)}
      style={{
        display: "flex",

        flexDirection: direction,

        justifyContent:
          justify === "between"
            ? "space-between"
            : justify === "around"
            ? "space-around"
            : justify === "evenly"
            ? "space-evenly"
            : justify === "start"
            ? "flex-start"
            : justify === "end"
            ? "flex-end"
            : justify,

        alignItems:
          align === "start"
            ? "flex-start"
            : align === "end"
            ? "flex-end"
            : align,

        gap,

        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}