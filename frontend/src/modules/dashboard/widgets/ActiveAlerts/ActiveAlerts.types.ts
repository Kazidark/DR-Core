export type AlertPriority =
    | "critical"
    | "warning"
    | "info";

export interface AlertItem {

    id: number;

    title: string;

    description: string;

    priority: AlertPriority;

    time: string;

}

export interface ActiveAlertsProps {

    alerts: AlertItem[];

}