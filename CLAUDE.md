# CLAUDE.md — Reglas de trabajo del proyecto

> Este archivo lo lee Claude Code automáticamente en cada sesión.
> El documento maestro completo del producto está en **PRD.md**. Léelo siempre antes de trabajar.

## Qué es este proyecto

App de aprendizaje adaptativo de lógica, pensamiento crítico y resolución de
problemas para niños hasta 12 años. Parte del Universo de Fueguito. El detalle
completo (objetivo, motor adaptativo, UX, currículo, arquitectura) está en `PRD.md`.

## Cómo quiero que trabajes (IMPORTANTE)

- **Construye por fases.** Nunca el MVP completo de una vez. Las fases están en la
  Sección 11 del PRD (Fase 0, 1, 2, 3). Trabaja solo en la fase que yo te indique.
- **Pasos pequeños.** Avanza en incrementos chicos y muéstrame cada paso antes de
  continuar. Pídeme confirmación antes de cambios grandes.
- **Explícame en palabras simples.** Soy nuevo programando. Antes de hacer algo,
  dime en lenguaje claro qué vas a hacer y por qué. Evita la jerga o explícala.
- **No rompas lo que ya funciona.** Si algo de una fase anterior está estable, no lo
  modifiques sin avisarme.

## Stack (no cambiar sin consultarme)

- Frontend: Next.js (App Router) + React
- Estilos: Tailwind CSS
- Backend y base de datos: Supabase (Postgres + Auth + Storage)
- Hosting: Vercel
- Pagos: Stripe (suscripción) — la app NUNCA maneja datos de tarjeta directamente

## Reglas de producto que no se negocian

- **Privacidad de menores primero.** La cuenta y el pago son del adulto. El niño
  nunca crea cuenta ni introduce datos personales. Minimiza datos del niño: apodo y
  edad bastan. Sin nombre legal, sin ubicación, sin foto obligatoria. Ver Sección 10
  del PRD.
- **Sin publicidad de terceros ni rastreadores** en la experiencia del niño.
- **Sin chat abierto** ni contenido generado por usuarios visible para niños.
- **El contenido vive como datos (JSON), no programado a mano.** Sigue el esquema de
  lección de la Sección 7.2 del PRD. El reproductor de lecciones se construye una vez
  y es genérico.
- **El motor adaptativo de la Fase 1 es por reglas deterministas y testeable**, no IA.

## Convenciones

- Nombres de archivos y carpetas en minúsculas, sin espacios ni acentos.
- Reemplazar el placeholder `[NOMBRE_APP]` cuando se defina el nombre final.
- Los assets de personajes están en `assets/personajes/`
  (`fueguito.png`, `acidito.png`, `desconocido.png`).

## Estado actual

- [x] Fase 0 — Fundaciones (COMPLETA: Next.js + Tailwind, Supabase conectado,
      8 tablas con RLS, login de padres por enlace mágico, esquema JSON de lección
      + 3 lecciones de ejemplo + endpoints de lectura).
- [ ] Fase 1 — MVP jugable
- [ ] Fase 2 — Adaptación que aprende + PDFs
- [ ] Fase 3 — Escala y móvil

> Actualiza estas casillas a medida que avancemos.

---

> Nota técnica: Next.js 16 mantiene sus propias reglas para agentes en `AGENTS.md`.
> Se incluyen aquí por referencia.
@AGENTS.md
