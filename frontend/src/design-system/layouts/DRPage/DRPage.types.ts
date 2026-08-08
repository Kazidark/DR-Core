import type { ReactNode } from "react";

export interface DRPageProps {
  title: string;

  description?: string;

  actions?: ReactNode;

  children: ReactNode;
}