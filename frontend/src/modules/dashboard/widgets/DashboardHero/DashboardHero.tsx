import styles from "./DashboardHero.module.css";

import type {
  DashboardHeroProps,
} from "./DashboardHero.types";

import {
  DRCard,
  DRCardContent,
  DRText,
  DRIcon,
} from "@/design-system";

import {
  useAuth,
} from "@/auth";


export default function DashboardHero({
  userName,
  greeting = "Bienvenido(a)",
  lastSync = "Hace 5 minutos",
  className = "",
  style,
  id,
}: DashboardHeroProps) {

  const {
    usuario,
  } = useAuth();


  /* =========================================================
     NOMBRE DEL USUARIO AUTENTICADO
     ========================================================= */

  const primerNombre =
    usuario?.nombres
      ?.trim()
      .split(/\s+/)[0] ??
    "Usuario";


  /*
   * Si en algún momento DashboardHero recibe
   * explícitamente la propiedad userName,
   * respetamos ese valor.
   *
   * En caso contrario usamos automáticamente
   * el primer nombre del usuario autenticado.
   */
  const nombreMostrar =
    userName?.trim() ||
    primerNombre;


  return (

    <DRCard
      id={id}
      style={style}
      className={`${styles.hero} ${className}`}
      variant="elevated"
    >

      <DRCardContent>

        <div
          className={
            styles.container
          }
        >

          {/* =================================================
              IZQUIERDA
              ================================================= */}

          <div
            className={
              styles.left
            }
          >

            <DRText
              as="h1"
              variant="h1"
              weight="bold"
            >
              👋 {greeting}, {nombreMostrar}
            </DRText>


            <DRText
              variant="body"
              color="secondary"
            >
              Aquí tienes el estado general de tu infraestructura.
            </DRText>

          </div>


          {/* =================================================
              CENTRO
              ================================================= */}

          <div
            className={
              styles.center
            }
          >

            <div
              className={
                styles.circle
              }
            />


            <div
              className={
                styles.illustration
              }
            >

              <div
                className={
                  styles.server
                }
              >

                <DRIcon
                  name="server"
                  size={80}
                />

              </div>


              <div
                className={
                  styles.shield
                }
              >

                <DRIcon
                  name="shield"
                  size={42}
                />

              </div>

            </div>

          </div>


          {/* =================================================
              DERECHA
              ================================================= */}

          <div
            className={
              styles.right
            }
          >

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