import { CSSProperties, ReactNode } from "react";

export type DRTextElement =
  | "span"
  | "p"
  | "label"
  | "strong"
  | "small"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

export type DRTextVariant =
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

export type DRTextWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold";

export type DRTextAlign =
  | "left"
  | "center"
  | "right"
  | "justify";

export type DRTextColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface DRTextProps {
  children: ReactNode;

  /**
   * Etiqueta HTML que renderizará el componente.
   * Por defecto utiliza <span>.
   */
  as?: DRTextElement;

  /**
   * Variante tipográfica.
   */
  variant?: DRTextVariant;

  /**
   * Peso de la fuente.
   */
  weight?: DRTextWeight;

  /**
   * Color del texto.
   */
  color?: DRTextColor;

  /**
   * Alineación.
   */
  align?: DRTextAlign;

  /**
   * Clase adicional.
   */
  className?: string;

  /**
   * Estilos inline.
   */
  style?: CSSProperties;

  /**
   * Identificador HTML.
   */
  id?: string;

  /**
   * Recorta el texto cuando no entra.
   */
  truncate?: boolean;
}