import React from "react";
import styles from "./DRCard.module.css";
import type { DRCardFooterProps } from "./DRCard.types";

const DRCardFooter: React.FC<DRCardFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
};

export default DRCardFooter;