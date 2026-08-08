import styles from "./DRMetricCard.module.css";

import {

    DRCard,

    DRCardContent,

    DRText,

} from "../../components";

import type {

    DRMetricCardProps,

} from "./DRMetricCard.types";

export default function DRMetricCard({

    title,

    value,

    subtitle,

    icon,

    variant = "blue",

    trend = "",

    trendType = "up",

    className = "",

    style,

    id,

}: DRMetricCardProps) {

    const trendClass = {

        up: styles.up,

        down: styles.down,

        neutral: styles.neutral,

    }[trendType];

    return (

        <DRCard

            hover

            id={id}

            style={style}

            className={`${styles.card} ${className}`}

        >

            <DRCardContent>

                <div className={styles.header}>

                    <div>

                        <DRText

                            variant="label"

                            color="secondary"

                        >

                            {title}

                        </DRText>

                    </div>

                    <div

                        className={`${styles.icon} ${styles[variant]}`}

                    >

                        {icon}

                    </div>

                </div>

                <DRText

                    as="h2"

                    variant="display"

                    weight="bold"

                >

                    {value}

                </DRText>

                {subtitle && (

                    <DRText

                        variant="caption"

                        color="secondary"

                    >

                        {subtitle}

                    </DRText>

                )}

                {trend && (

                    <div

                        className={`${styles.trend} ${trendClass}`}

                    >

                        {trend}

                    </div>

                )}

            </DRCardContent>

        </DRCard>

    );

}