import type { CSSProperties, ReactNode } from "react";

export type DRFlexJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export type DRFlexAlign =
  | "start"
  | "center"
  | "end"
  | "stretch";

export type DRFlexDirection =
  | "row"
  | "column";

export type DRFlexGap =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface DRFlexProps {

  children: ReactNode;

  direction?: DRFlexDirection;

  justify?: DRFlexJustify;

  align?: DRFlexAlign;

  gap?: DRFlexGap;

  wrap?: boolean;

  className?: string;

  style?: CSSProperties;

  id?: string;

}