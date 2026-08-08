import React from "react";
import styles from "./DRCard.module.css";
import type { DRCardHeaderProps } from "./DRCard.types";

const DRCardHeader: React.FC<DRCardHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      {children}
    </div>
  );
};

export default DRCardHeader;