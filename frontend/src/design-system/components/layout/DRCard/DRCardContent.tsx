import React from "react";
import styles from "./DRCard.module.css";
import type { DRCardContentProps } from "./DRCard.types";

const DRCardContent: React.FC<DRCardContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`${styles.content} ${className}`}>
      {children}
    </div>
  );
};

export default DRCardContent;