import type { CSSProperties, ReactNode } from "react";

export type DRMetricVariant =
    | "blue"
    | "green"
    | "purple"
    | "orange";

export type DRMetricTrendType =
    | "up"
    | "down"
    | "neutral";

export interface DRMetricCardProps {

    title: string;

    value: string;

    subtitle?: string;

    icon?: ReactNode;

    variant?: DRMetricVariant;

    trend?: string;

    trendType?: DRMetricTrendType;

    className?: string;

    style?: CSSProperties;

    id?: string;

}