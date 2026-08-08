import styles from "./DRContainer.module.css";

import type { DRContainerProps } from "./DRContainer.types";

export default function DRContainer({
  children,
  className = "",
  style,
  id,
  fluid = false,
  padding = "lg",
  maxWidth = "2xl",
}: DRContainerProps) {
  const classes = [
    styles.container,
    styles[`padding-${padding}`],
    fluid ? styles.fluid : styles[maxWidth],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={id}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
}