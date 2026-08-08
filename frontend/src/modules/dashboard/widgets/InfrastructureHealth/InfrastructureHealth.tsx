import styles from "./InfrastructureHealth.module.css";

import type {

    InfrastructureHealthProps,

} from "./InfrastructureHealth.types";

import {

    DRCard,

    DRCardContent,

    DRText,

} from "@/design-system";

export default function InfrastructureHealth({

    percentage,

    items,

}: InfrastructureHealthProps){

    return(

        <DRCard className={styles.card}>

            <DRCardContent>

                <DRText

                    as="h3"

                    variant="title"

                    weight="bold"

                >

                    Estado General

                </DRText>

                <div className={styles.score}>

                    <div className={styles.circle}>

                        <span>

                            {percentage}%

                        </span>

                    </div>

                    <DRText

                        variant="caption"

                        color="secondary"

                    >

                        Salud General

                    </DRText>

                </div>

                <div className={styles.list}>

                    {

                        items.map((item)=>(

                            <div

                                key={item.label}

                                className={styles.row}

                            >

                                <div className={styles.label}>

                                    <span

                                        className={`${styles.dot} ${styles[item.color]}`}

                                    />

                                    <DRText variant="bodySmall">

                                        {item.label}

                                    </DRText>

                                </div>

                                <DRText

                                    variant="bodySmall"

                                    weight="bold"

                                >

                                    {item.value}%

                                </DRText>

                            </div>

                        ))

                    }

                </div>

            </DRCardContent>

        </DRCard>

    );

}