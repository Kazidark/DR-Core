import type { CSSProperties, ReactNode } from "react";

export type DRGridGap =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface DRGridProps {

  children: ReactNode;

  columns?: number;

  gap?: DRGridGap;

  minItemWidth?: number;

  className?: string;

  style?: CSSProperties;

  id?: string;

}