import { HTMLAttributes, ReactNode } from "react";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "subtitle"
  | "body"
  | "bodySmall"
  | "caption"
  | "label";

export interface TextProps
  extends HTMLAttributes<HTMLElement> {

  variant?: TextVariant;

  as?: keyof JSX.IntrinsicElements;

  children: ReactNode;
}