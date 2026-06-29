# Análisis de contenido (ejercicios de referencia) y competencia (UX/UI)

> Documento de trabajo generado a partir de: los PDFs en `ejercicios-referencia/`,
> el esquema de lección del proyecto (`src/lib/lessons/schema.ts`), el PRD, el
> análisis de competencia provisto por el equipo, e investigación UX/UI 2025.
> Objetivo: tener contexto del **tipo de ejercicios** que esperamos crear para las
> lecciones y aplicar **mejores prácticas de UX/UI** de la competencia.

---

## 1. Taxonomía de ejercicios observados en los PDFs

Los cuadernillos vienen de *cuadernillosdemate.com / divertilandia / patitos felices*.
Estructura típica de cada cuadernillo: **portada → créditos → "Sabías qué" → instrucciones → fichas**.
Todas las fichas son **imprimibles (modo manual)**, pero casi todas se pueden **digitalizar**
a uno de los 5 tipos de reto que ya soporta el reproductor.

| Categoría (carpeta) | Ejercicio observado | Qué entrena | Habilidad app | Tipo de reto digital | Modo |
|---|---|---|---|---|---|
| Lógica | **Hitori** (ocultar casillas para que no se repitan números en fila/columna, con reglas) | Deducción con restricciones, razonamiento por reglas | `logica` | `seleccion` (tocar casillas a ocultar) | interactivo + manual |
| Estimulación cognitiva | **Secuencias** (completar patrón de colores coloreando) | Patrones, anticipación | `logica` | `ordenar_secuencia` / `seleccion` / `arrastrar_soltar` | interactivo + manual |
| Estimulación cognitiva | **Laberintos** (encontrar el camino) | Planificación, prueba-error, resolución | `resolucion` | (trazo táctil) → `manual_autoconfirmado` o mini-juego | interactivo + manual |
| Estimulación cognitiva | **Comecocos** (papiroflexia para multiplicar) | Cálculo + manualidad | `resolucion` | `manual_autoconfirmado` | manual puro |
| Estimulación cognitiva | **Crea-monstruos** (recortar partes según instrucciones: "pelo azul, dos ojos, tres brazos…") | Comprensión lectora + seguir instrucciones multi-paso | `resolucion` | `manual_autoconfirmado` / `arrastrar_soltar` (armar el monstruo) | manual + interactivo |
| Estimulación cognitiva | **Pizza** (relacionar decimal ↔ fracción ↔ porcentaje ↔ segmentos) | Representaciones equivalentes | `logica` | `arrastrar_soltar` (emparejar) | interactivo + manual |
| Estimulación cognitiva | **Juegos de mesa** ("Si esta es la respuesta, ¿cuál es la pregunta?") | Razonamiento inverso, pensamiento crítico | `critica` | `seleccion` / `respuesta_voz` | interactivo + audio |
| Estimulación cognitiva | **Juegos con palabras** (adivinanzas "¿Qué soy?" con pistas) | Inferencia, deducción por pistas | `critica` / `logica` | `seleccion` / `respuesta_voz` | audio + interactivo |
| Gimnasia cerebral | **Buscar infiltrados** (marcar los 6 entre puros 9; las 7 palabras TUNA entre LUNA) | Atención sostenida, discriminación visual | `logica` (atención) | `seleccion` (tocar los infiltrados) | interactivo |
| Gimnasia cerebral | **Transcribir al revés** (copiar letras en orden inverso) | Memoria de trabajo, control inhibitorio | `resolucion` | `ordenar_secuencia` | interactivo + manual |
| Geometría | **Definir/identificar figuras** (círculo, polígonos, rombo, elipse…) | Vocabulario geométrico, clasificación | `logica` | `seleccion` / `arrastrar_soltar` | interactivo |
| Geometría | **Simetría** (dibujar la otra mitad usando la cuadrícula) | Visión espacial, simetría | `resolucion` | `manual_autoconfirmado` / (espejo táctil) | manual + interactivo |
| Matemática (Suma) | **Spinner / Recta numérica / con dibujos / llevadas / decimales** | Sumar con apoyo visual | `resolucion` | `seleccion` / `arrastrar_soltar` | interactivo + manual |
| Matemática (Resta) | **Recta numérica / con dibujos / crucigrama de restas** | Restar con apoyo visual | `resolucion` | `seleccion` / `arrastrar_soltar` | interactivo + manual |
| Matemática (Mult./Div./Fracc.) | **Tablas, divisiones, colorear 1/2 de cada figura** | Operaciones, fracciones | `resolucion` / `logica` | `seleccion` / `arrastrar_soltar` | interactivo + manual |

### Conclusión de la taxonomía
- **No hay que inventar tipos de reto nuevos**: los 5 actuales (`seleccion`, `arrastrar_soltar`,
  `ordenar_secuencia`, `respuesta_voz`, `manual_autoconfirmado`) cubren prácticamente todo.
- **Cada PDF es directamente una ficha del modo `manual`** (campo `ficha_pdf`) → además son el
  producto de venta de "paquetes PDF para maestros" del PRD. Doble uso confirmado.
- Hay un sesgo fuerte a **matemática**; para equilibrar las 3 habilidades del PRD
  (lógica / crítica / resolución) las joyas son: **Hitori, Secuencias, Buscar-infiltrados,
  Juegos de mesa (pregunta inversa), Adivinanzas "¿Qué soy?"**.

---

## 2. Patrones pedagógicos reutilizables (plantillas de lección)

De los PDFs salen ~8 "plantillas" que podemos producir en serie como JSON:

1. **Completar patrón** (secuencias de color/figura) → `ordenar_secuencia` / `seleccion`.
2. **Encontrar el intruso / infiltrado** (gimnasia cerebral) → `seleccion` múltiple.
3. **Emparejar representaciones** (pizza: fracción/decimal/%) → `arrastrar_soltar`.
4. **Adivinanza por pistas** ("¿Qué soy? tengo 4 patas…") → `seleccion` / `respuesta_voz`.
5. **Pregunta inversa** ("si la respuesta es X, ¿cuál es la pregunta?") → `critica`.
6. **Camino/plan** (laberinto) → mini-reto de planificación.
7. **Construir siguiendo instrucciones** (crea-monstruos) → multi-paso, `resolucion`.
8. **Deducción con reglas** (Hitori) → reto lógico avanzado (paquete `llamas`).

Cada plantilla se instancia muchas veces solo cambiando los `datos` del reto → escala sin tocar código
(coherente con la Sección 7.2 del PRD: "contenido como datos").

---

## 3. Competencia: buenas prácticas UX/UI y cómo aplicarlas

### 3.1 Resumen del mapa competitivo (provisto por el equipo)
- **Smartick / Smartick Thinking**: el rival serio en español. Adapta **dificultad** (no modalidad),
  sesiones de 15 min, personaje guía (Socra-Tick). Premium (~20–28 €/mes).
- **Think!Think!**, **Lumosity**, **DragonBox**, **Brainzy**: fuertes en su nicho, sin universo de marca.
- **Duolingo / Duolingo ABC**: referencia de **onboarding, hábito y gamificación**.
- **Hueco real (diferenciador de Fueguito)**: adaptar **modalidad de presentación** (manual/digital/
  auditivo/lector), universo narrativo propio con audiencia en YouTube, español nativo, y modelo dual
  suscripción + PDFs.

### 3.2 Buenas prácticas a adoptar (con fuente) → acción concreta en Fueguito

| Práctica (competencia / research) | Evidencia | Cómo aplicarla en Fueguito |
|---|---|---|
| **"Jugar primero, registrarse después"** | Duolingo posterga el signup hasta que el usuario ya recibió valor | Primera lección gratis ANTES de pedir email del padre (ya está en PRD 5.3 — priorizarlo en Fase 1) |
| **Aprender haciendo, no tutoriales** | Duolingo usa modales contextuales, tooltips, no tutorial inicial largo | Que el personaje (Fueguito) explique en el momento, dentro del reto, no en pantallas previas |
| **Racha + protección de racha** | Streak Freeze redujo churn 21%; 7 días de racha = 3.6x retención | Implementar racha diaria con un "escudo de Fueguito" (1 día de gracia) para no castigar |
| **Botones grandes / touch 44–48px** | Apps infantiles top mejoran 15% el éxito de tarea con botones grandes | Ya en PRD (48×48). Auditar que TODA la UI lo cumpla, sobre todo en `jugar/` |
| **Una tarea por pantalla** | Evita sobrecarga cognitiva (atención 8–10 min a los 4–6 años) | Cada "momento" de la lección = una pantalla; nada de scroll con varios retos juntos |
| **Audio + visual + texto sincronizado** | Pre-lectores responden mejor a audio/visual que a texto | El "karaoke" de lectura del PRD 4.4: resaltar palabra mientras suena el audio |
| **Refuerzo inmediato (sparkles, sonido, mascota)** | Feedback visual/sonoro sube engagement | Animación de Fueguito + sonido al acertar; error sin castigo, "casi, intenta de nuevo" |
| **Evaluación inicial adaptativa** | Smartick abre con assessment y ajusta dificultad | Nuestro quiz de perfilado (8 preguntas ilustradas) + ajuste por reglas (Fase 1) |
| **Manipulables sin palabras** | DragonBox enseña con manipulación visual, casi sin texto | Para `chispas` (3–5): retos `arrastrar_soltar` puramente visuales, instrucción por audio |
| **Personaje con personalidad** | Duo (Duolingo), Socra-Tick (Smartick) generan apego | Usar los 3 personajes con roles claros (Fueguito=guía, Desconocido=misterio, Acidito=reto) |

### 3.3 Dónde superamos a la competencia (reforzar en UX)
- **Adaptación por modalidad** (lo que nadie hace): la MISMA lección como manualidad, como
  audio-reto o como juego táctil. La UI debe dejar **cambiar de modo** visible y fácil.
- **Cross-promotion con YouTube**: recompensas que desbloquean clips del Universo de Fueguito.
- **Doble producto**: cada ficha digital es también PDF vendible para maestros.

---

## 4. Riesgos / cosas a cuidar al digitalizar los PDFs
- **Origen de terceros**: los cuadernillos llevan marcas (cuadernillosdemate, divertilandia,
  patitos felices). Sirven como **referencia de TIPO de ejercicio**, pero el arte y las fichas
  finales deben ser **propios** (Universo de Fueguito) para poder venderlos sin problemas de licencia.
- **Sesgo a matemática**: equilibrar produciendo más `critica` y `logica` pura.
- **Lectura protegida** (PRD 4.4): toda ficha digital debe incluir su micro-momento de lectura.

---

## 5. Próximos pasos propuestos (por fases, para confirmar)

> Respetando CLAUDE.md: pasos pequeños, sin romper lo estable, confirmar antes de cambios grandes.

1. **(Contenido)** Convertir 3–5 plantillas en lecciones JSON nuevas equilibrando las 3 habilidades
   (p. ej. una de "encontrar el intruso", una "adivinanza ¿qué soy?", una "pregunta inversa").
2. **(UX rápida, alto impacto)** Auditar la zona `jugar/` contra el checklist 3.2 (botones grandes,
   una tarea por pantalla, feedback inmediato).
3. **(Gamificación)** Diseñar la racha diaria con "escudo de Fueguito".
4. **(Onboarding)** Asegurar "primera lección gratis antes del registro".
5. **(Negocio)** Definir plantilla de marca para exportar las fichas como PDFs vendibles.

---

### Fuentes (investigación UX/UI)
- Duolingo onboarding/gamificación: userguiding.com, appcues, strivecloud, orizon.co
- UX para niños: ramotion.com, aufaitux.com, lollypop.design, zigpoll.com
- Smartick / DragonBox: commonsensemedia.org, dragonbox.com, modulo.app
