import styles from "./DRFlex.module.css";

import type { DRFlexProps } from "./DRFlex.types";

export default function DRFlex({

  children,

  direction = "row",

  justify = "start",

  align = "stretch",

  gap = "md",

  wrap = false,

  className = "",

  style,

  id,

}: DRFlexProps) {

  const classes = [

    styles.flex,

    styles[direction],

    styles[`justify-${justify}`],

    styles[`align-${align}`],

    styles[`gap-${gap}`],

    wrap ? styles.wrap : "",

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