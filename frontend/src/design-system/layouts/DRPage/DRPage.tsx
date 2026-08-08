import styles from "./DRPage.module.css";

import {
  DRText,
} from "@/design-system";

import type {
  DRPageProps,
} from "./DRPage.types";

export default function DRPage({
  title,
  description,
  actions,
  children,
}: DRPageProps) {

  return (

    <div className={styles.page}>

      <div className={styles.header}>

        <div>

          <DRText
            as="h1"
            variant="h1"
            weight="bold"
          >
            {title}
          </DRText>

          {description && (

            <DRText
              variant="body"
              color="secondary"
            >
              {description}
            </DRText>

          )}

        </div>

        {actions && (

          <div>

            {actions}

          </div>

        )}

      </div>

      <div className={styles.content}>

        {children}

      </div>

    </div>

  );

}