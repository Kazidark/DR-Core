import React from "react";
import styles from "./DRCard.module.css";
import type { DRCardProps } from "./DRCard.types";

const DRCard: React.FC<DRCardProps> = ({
  children,
  className = "",
  style,
  id,
  variant = "default",
  padding = "md",
  shadow = "sm",
  hover = false,
}) => {
  const classes = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    hover ? styles.hover : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
console.log(styles);
  return (
    <div
      id={id}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
};

export default DRCard;