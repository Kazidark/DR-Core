import React from "react";
import styles from "./DRText.module.css";
import type { DRTextProps } from "./DRText.types";

const DRText: React.FC<DRTextProps> = ({
  children,
  as = "span",
  variant = "body",
  weight = "regular",
  color = "primary",
  align = "left",
  className = "",
  style,
  id,
  truncate = false,
}) => {
  const Component = as;

  const classes = [
    styles.text,
    styles[variant],
    styles[weight],
    styles[color],
    styles[align],
    truncate ? styles.truncate : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      id={id}
      className={classes}
      style={style}
    >
      {children}
    </Component>
  );
};

export default DRText;