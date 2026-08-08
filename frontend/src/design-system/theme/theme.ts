// DR Design System
// Theme
// Version 1.0

import {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  breakpoints,
  transitions,
  zIndex,
} from "../foundation";

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  breakpoints,
  transitions,
  zIndex,
} as const;

export type Theme = typeof theme;