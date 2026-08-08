import styles from "./Box.module.css";
import type { BoxProps } from "./Box.types";

import { cn } from "../../utils";

export function Box({
  children,
  className = "",
  ...props
}: BoxProps) {
  return (
    <div
      className={cn(
        styles.box,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}