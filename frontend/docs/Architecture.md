# DR+ Core
## Plataforma Integral de Gestión para Infraestructura TI

Versión del documento: 1.0

---

# Objetivo

DR+ Core es una plataforma empresarial desarrollada para centralizar la gestión de la infraestructura tecnológica de la organización.

El sistema busca reemplazar múltiples herramientas independientes por una plataforma única, moderna, escalable y mantenible.

---

# Principios de Arquitectura

Todo el desarrollo del sistema debe respetar los siguientes principios.

## 1. Simplicidad

Cada componente debe resolver un único problema.

Evitar componentes que intenten hacer demasiadas tareas.

---

## 2. Reutilización

Si una funcionalidad puede utilizarse en dos o más módulos, debe convertirse en un componente reutilizable del Design System.

---

## 3. Escalabilidad

La estructura del proyecto debe permitir incorporar nuevos módulos sin modificar los existentes.

---

## 4. Consistencia

Toda la interfaz debe mantener la misma identidad visual.

No deben existir estilos aislados para un módulo específico.

---

## 5. Tipado fuerte

Todo componente debe estar completamente tipado mediante TypeScript.

No se utilizará `any`, salvo que exista una justificación técnica documentada.

---

# Arquitectura del Frontend

El frontend está dividido en cinco grandes capas.

## Foundation

Contiene los tokens del sistema.

- Colores
- Espaciados
- Tipografía
- Bordes
- Sombras

---

## Theme

Convierte los tokens en variables CSS reutilizables.

---

## Components

Componentes reutilizables.

Ejemplos:

- DRCard
- DRText
- DRButton
- DRInput

---

## Layouts

Define la estructura general de la aplicación.

Ejemplos:

- Sidebar
- Topbar
- AppLayout

---

## Features

Contiene los módulos funcionales.

Ejemplos:

- Inventario
- Correos
- VPN
- Switches
- Servidores

---

# Filosofía del Design System

Los componentes deben cumplir las siguientes reglas:

- Una única responsabilidad.
- API pequeña y clara.
- Tipado fuerte.
- Reutilización.
- Bajo acoplamiento.
- Alto nivel de consistencia.

---

# Convenciones

## Componentes

Todos los componentes comienzan con el prefijo DR.

Ejemplos:

DRCard

DRButton

DRText

DRBadge

---

## CSS

Cada componente utiliza CSS Modules.

No se utilizarán estilos globales para componentes.

---

## Imports

Siempre que sea posible se utilizarán exportaciones centralizadas.

Ejemplo:

import { DRCard, DRText } from "@/design-system/components";

---

# Objetivo del Dashboard

El Dashboard será la pantalla principal del sistema.

Su propósito será mostrar el estado general de toda la infraestructura tecnológica mediante indicadores, gráficos y actividad reciente.

El Dashboard servirá como laboratorio del Design System y será la referencia visual para el resto de módulos.

---

# Evolución

El sistema está diseñado para crecer mediante componentes reutilizables.

Antes de crear un nuevo componente se evaluará si realmente resuelve una necesidad del producto.

No se desarrollarán componentes únicamente por anticipación.