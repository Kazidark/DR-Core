import styles from "./DashboardHero.module.css";
import type { DashboardHeroProps } from "./DashboardHero.types";

import {
  DRCard,
  DRCardContent,
  DRText,
  DRIcon,
} from "@/design-system";

export default function DashboardHero({
  userName = "Jean",
  greeting = "Buenos días",
  lastSync = "Hace 5 minutos",
  className = "",
  style,
  id,
}: DashboardHeroProps) {
  return (
    <DRCard
      id={id}
      style={style}
      className={`${styles.hero} ${className}`}
      variant="elevated"
    >
      <DRCardContent>

        <div className={styles.container}>

          {/* IZQUIERDA */}

          <div className={styles.left}>

            <DRText
              as="h1"
              variant="h1"
              weight="bold"
            >
              👋 {greeting}, {userName}
            </DRText>

            <DRText
              variant="body"
              color="secondary"
            >
              Aquí tienes el estado general de tu infraestructura.
            </DRText>

          </div>

          {/* CENTRO */}

          <div className={styles.center}>

            <div className={styles.circle}></div>

            <div className={styles.illustration}>

              <div className={styles.server}>

                <DRIcon
                  name="server"
                  size={80}
                />

              </div>

              <div className={styles.shield}>

                <DRIcon
                  name="shield"
                  size={42}
                />

              </div>

            </div>

          </div>

          {/* DERECHA */}

          <div className={styles.right}>

            <DRText
              variant="caption"
              color="secondary"
            >
              Última sincronización
            </DRText>

            <DRText
              variant="bodySmall"
              weight="semibold"
            >
              {lastSync}
            </DRText>

          </div>

        </div>

      </DRCardContent>
    </DRCard>
  );
}