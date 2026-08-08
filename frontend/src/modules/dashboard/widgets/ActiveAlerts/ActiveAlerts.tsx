import styles from "./ActiveAlerts.module.css";

import {

    DRCard,

    DRCardContent,

    DRText,

} from "@/design-system";

import type {

    ActiveAlertsProps,

} from "./ActiveAlerts.types";

export default function ActiveAlerts({

    alerts,

}: ActiveAlertsProps){

    return(

        <DRCard className={styles.card}>

            <DRCardContent>

                <DRText

                    as="h3"

                    variant="title"

                    weight="bold"

                >

                    Alertas Activas

                </DRText>

                <div className={styles.list}>

                    {

                        alerts.map((alert)=>(

                            <div

                                key={alert.id}

                                className={styles.item}

                            >

                                <span

                                    className={`${styles.dot} ${styles[alert.priority]}`}

                                />

                                <div>

                                    <DRText

                                        variant="bodySmall"

                                        weight="semibold"

                                    >

                                        {alert.title}

                                    </DRText>

                                    <DRText

                                        variant="caption"

                                        color="secondary"

                                    >

                                        {alert.description}

                                    </DRText>

                                </div>

                                <DRText

                                    variant="caption"

                                    color="secondary"

                                >

                                    {alert.time}

                                </DRText>

                            </div>

                        ))

                    }

                </div>

            </DRCardContent>

        </DRCard>

    );

}