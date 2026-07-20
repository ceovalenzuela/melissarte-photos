# MelissArte Photos

## Descripción

MelissArte Photos es una plataforma para compartir fotografías de eventos mediante un código QR.

No es un SaaS.

Es una herramienta interna para MelissArte.

Los invitados escanean un QR, suben sus fotografías y pueden ver la galería del evento.

El administrador crea y configura eventos desde un panel privado.

---

# Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Base UI (no Radix)

---

# Objetivo principal

La prioridad del proyecto es la experiencia del invitado.

El panel administrativo debe ser simple.

La página pública debe sentirse como una aplicación premium.

---

# Estado del proyecto

## Sprint 01 ✅

CRUD básico de eventos.

Implementado:

- Crear evento
- Listar eventos
- Eliminar evento
- Navegación a detalles

Pendiente:

- Editar evento

---

## Sprint 02 🚧

Página de administración del evento.

Actualmente existe:

/admin/events/[id]

Ya carga el evento desde Supabase.

Pendiente:

- Información del evento
- Imagen de portada
- Mensaje de bienvenida
- Tipo de evento
- Estado
- Configuración

---

# Arquitectura

```
app/
    admin/
        page.tsx
        events/
            [id]/

components/
    dashboard/
    events/
    layout/
    ui/

hooks/
    useEvents.ts

lib/
    supabase.ts
    slug.ts
    events.ts

types/
    event.ts
```

---

# Convenciones

## Hooks

Los hooks únicamente administran estado del cliente.

Ejemplo:

useEvents()

No deben contener lógica visual.

---

## lib/

Toda consulta reutilizable a Supabase vive aquí.

Ejemplos:

events.ts

slug.ts

supabase.ts

---

## Pages

Las páginas del App Router cargan datos mediante funciones de lib/.

No llaman directamente a Supabase si la lógica puede reutilizarse.

---

## Componentes

Los componentes solo renderizan UI.

No deben contener consultas a la base de datos.

---

# Rutas

## Administración

/admin

Lista de eventos.

---

/admin/events/[id]

Configuración del evento.

---

## Pública

/e/[slug]

Experiencia del invitado.

---

# Roadmap

## Panel

- Editar evento
- Configuración
- Portada
- QR
- Estadísticas

---

## Invitados

Pantalla de bienvenida

Subida de fotografías

Galería

Álbum

Descargas

---

# Git

Una funcionalidad importante = un commit.

Al terminar un sprint = git push.

---

# Filosofía

Antes de agregar una nueva funcionalidad preguntarnos:

"¿Esto mejora la experiencia del invitado?"

Si la respuesta es no, probablemente no pertenece a la primera versión.

---

# Estado actual

Último sprint terminado:

✅ CRUD de eventos

Siguiente tarea:

Implementar el formulario de configuración del evento.