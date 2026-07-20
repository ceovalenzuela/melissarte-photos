# Decisiones

## 2026-07-20

Se eliminó el botón Editar.

Toda la edición del evento ocurrirá dentro de:

/admin/events/[id]

Motivo:

Evitar duplicidad de interfaces.

## 2026-07-20

Los slugs se generan mediante:

lib/slug.ts

No dentro de useEvents().

Motivo:

Separación de responsabilidades.

## 2026-07-20

La administración utiliza el id.

La página pública utiliza el slug.

Motivo:

El slug puede cambiar.