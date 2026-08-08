import styles from "./DRButton.module.css";

import type { DRButtonProps } from "./DRButton.types";

import { cn } from "../../utils";

export function DRButton({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: DRButtonProps) {

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon}

      {loading ? "Cargando..." : children}

      {rightIcon}
    </button>
  );
}