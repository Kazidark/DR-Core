import { ButtonHTMLAttributes, ReactNode } from "react";

export type DRButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "ghost";

export type DRButtonSize =
  | "sm"
  | "md"
  | "lg";

export interface DRButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {

  variant?: DRButtonVariant;

  size?: DRButtonSize;

  loading?: boolean;

  fullWidth?: boolean;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  children: ReactNode;
}