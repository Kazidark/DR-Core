export interface HealthItem {

    label: string;

    value: number;

    color: "green" | "yellow" | "red" | "blue";

}

export interface InfrastructureHealthProps {

    percentage: number;

    items: HealthItem[];

}