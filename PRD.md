**DOCUMENTO MAESTRO DE PRODUCTO (PRD)**

**[NOMBRE_APP]**

App de aprendizaje adaptativo de razonamiento crítico, lógica y resolución de problemas para niños hasta 12 años

*Parte del Universo de Fueguito · by lapso.at*

Documento de especificación para desarrollo con Claude Code

Versión 1.0 · Junio 2026

# Índice

# 0. Cómo usar este documento con Claude Code

Este documento es la fuente única de verdad (single source of truth) del producto. Está escrito para que puedas entregárselo a Claude Code y empezar a construir sin ambigüedades. Recomendación de uso:

- Guarda este documento como CONTEXT.md (o PRD.md) en la raíz del repositorio.

- Crea un archivo CLAUDE.md corto que apunte a este PRD y defina reglas de trabajo (stack, convenciones, no romper esquemas).

- Construye por fases. No pidas todo de una vez. Cada fase de la Sección 11 es un hito entregable y estable antes de pasar al siguiente — alineado con tu estrategia de build secuencial.

- Para cada sesión con Claude Code, copia la sección relevante del PRD al prompt y pide el alcance acotado de ESA fase.

*Convención de placeholders: [NOMBRE_APP] debe reemplazarse globalmente una vez elijas el nombre. Los textos entre [corchetes] son decisiones pendientes o variables.*

# 1. Resumen ejecutivo

[NOMBRE_APP] es una app de aprendizaje adaptativo —en el espíritu de Duolingo y Spotify— que desarrolla tres habilidades de pensamiento en niños de hasta 12 años: lógica, pensamiento crítico y resolución de problemas, las tres con igual peso. El diferenciador central es que el contenido se adapta al perfil de aprendizaje de cada niño (creativo/manual, digital/interactivo, auditivo, lector), detectado mediante un quiz inicial al estilo del onboarding de Duolingo/Spotify.

La metodología es lúdica y guiada por tres personajes del Universo de Fueguito —Fueguito, Desconocido y Acidito— que actúan como mentores dentro de la app. El producto cumple un doble rol: es un negocio educativo con suscripción accesible, y simultáneamente una herramienta de marketing y brand awareness para el Universo de Fueguito (canal de YouTube y futuros productos).

### Propuesta de valor

- Para padres que trabajan: refuerzo de habilidades blandas de sus hijos en casa, en sesiones cortas, sin requerir supervisión constante.

- Para el niño: un viaje de juego personalizado a su forma de aprender, no un curso genérico.

- Para maestros y escuelas: paquetes de PDFs descargables por tema, de pago único, para usar en aula.

### Modelo de negocio (resumen)

- Tier gratuito de enganche (freemium) con límites diarios.

- Suscripción mensual accesible (modelo Duolingo/Spotify) que desbloquea todo.

- Venta unitaria de paquetes de PDFs imprimibles por tema, orientada a maestros/escuelas.

# 2. Objetivo final y métricas de éxito

## 2.1 Objetivo de producto

Construir la app de referencia en español para desarrollar pensamiento crítico y lógica en la infancia, mediante un motor adaptativo que respete cómo aprende cada niño, sostenida por una experiencia lúdica con los personajes del Universo de Fueguito.

## 2.2 Objetivos de negocio

- Monetización recurrente vía suscripción accesible con baja fricción de entrada (freemium).

- Ingreso complementario por venta de paquetes PDF a maestros/escuelas.

- Crecimiento del Universo de Fueguito: la app alimenta el canal de YouTube y viceversa (cross-promotion).

## 2.3 Métricas de éxito (North Star y de soporte)

| **Métrica** | **Qué mide** | **Por qué importa** |
| --- | --- | --- |
| Lecciones completadas/semana por niño activo | Engagement real de aprendizaje | North Star: valor entregado, no solo apertura |
| Retención D1 / D7 / D30 | Vuelven al hábito | Predice suscripción y LTV |
| Conversión free → pago | Eficacia del enganche | Sostenibilidad del negocio |
| Precisión del perfilado | % padres/niños que sienten que el contenido 'les queda' | Diferenciador central del producto |
| Ventas de paquetes PDF | Ingreso B2B/educadores | Canal secundario y validación escolar |

# 3. Público objetivo y segmentación por edades

Mercado: hispanohablante global (Venezuela, Latinoamérica, hispanos en EE.UU., España). El contenido se escribe en español neutro. Dos tipos de comprador: el padre/madre (suscripción) y el maestro (paquetes PDF).

## 3.1 Rangos de edad sugeridos (paquetes)

Sugerencia basada en etapas de desarrollo cognitivo (Piaget) y en cómo cambian las capacidades de lectura y abstracción. Tres paquetes:

| **Paquete** | **Edad** | **Etapa cognitiva** | **Foco del contenido** | **Modo dominante** |
| --- | --- | --- | --- | --- |
| Chispas | 3–5 | Preoperacional | Clasificar, emparejar, causa-efecto simple, secuencias cortas | Audio + visual, manipulativo. Cero dependencia de lectura. |
| Brasas | 6–8 | Operaciones concretas (temprano) | Patrones, deducción simple, 'por qué', primeros acertijos | Mixto. Lectura emergente apoyada con audio. |
| Llamas | 9–12 | Operaciones concretas (avanzado) → abstracto | Argumentos, evidencia vs opinión, lógica condicional, problemas multi-paso | Lectura plena + retos interactivos complejos. |

*Nota de diseño: los nombres Chispas/Brasas/Llamas son una sugerencia temática coherente con **'**Fueguito**'** (fuego que crece con el aprendizaje). Reemplazables.*

# 4. El corazón del producto: motor adaptativo por perfil de aprendizaje

Este es el diferenciador y la parte más delicada. Principio rector: mismo objetivo de aprendizaje, distinta presentación. Una misma 'secuencia lógica' se enseña con un collage de papel para un perfil creativo-manual y con un audio-reto interactivo para un perfil auditivo-digital. El objetivo pedagógico no cambia; cambia el envoltorio.

## 4.1 Ejes de perfil de aprendizaje

Cuatro ejes (escalas continuas, no categorías rígidas). Cada niño tiene un valor 0–100 en cada eje. El contenido se pondera, no se encasilla.

| **Eje** | **Extremo A** | **Extremo B** | **Cómo afecta la lección** |
| --- | --- | --- | --- |
| Modalidad | Manual / creativo | Digital / interactivo | Tipo de actividad: recortar/dibujar vs arrastrar/tocar en pantalla |
| Entrada | Auditivo | Lector | Instrucción por voz primero vs texto primero |
| Dinámica | Narrativo / explorador | Reto / competitivo | Historia con Fueguito vs desafío con puntaje y tiempo |
| Ritmo | Reflexivo | Rápido | Más tiempo y pistas vs retos encadenados ágiles |

*Ejemplo real con tus hijos: tu hija puntúa alto en Manual/creativo y Narrativo → recibe la misma lección de lógica como manualidad guiada con historia. Tu hijo puntúa alto en Digital/interactivo y Auditivo → recibe la misma lección como audio-reto interactivo. Ambos cumplen el mismo objetivo pedagógico.*

## 4.2 Quiz de perfilado inicial (onboarding tipo Duolingo/Spotify)

Quien responde depende de la edad (decisión 'combinada'):

| **Edad** | **Quién responde** | **Formato del quiz** |
| --- | --- | --- |
| 3–5 | El padre, sobre el niño | 6–8 preguntas simples ('¿prefiere pintar o ver videos?'). El niño no lee aún. |
| 6–8 | Niño + padre (mixto) | El niño elige con imágenes/audio ('toca lo que más te gusta'); el padre ajusta 2–3 cosas. |
| 9–12 | El niño | Quiz interactivo gamificado que responde el niño solo, con dibujos y audio. |

Reglas del quiz inicial:

- Máximo 8 preguntas. Debe sentirse como un juego, no un formulario.

- Cada pregunta mapea a uno o más ejes. No se le muestra al usuario la mecánica.

- Produce un vector de perfil inicial: {modalidad, entrada, dinamica, ritmo}.

- El perfil inicial es una hipótesis, no una sentencia: el motor lo ajusta con el comportamiento real (Fase 2).

## 4.3 Cómo adapta el motor (MVP vs avanzado)

### MVP (Fase 1): adaptación por reglas

- Cada lección existe en 2–3 'modos' de presentación predefinidos (Manual, Interactivo, Audio-narrativo).

- El vector de perfil del quiz selecciona el modo dominante y un modo secundario.

- La lectura nunca desaparece: ver Sección 4.4.

### Avanzado (Fase 2+): adaptación que aprende

- El motor observa señales: aciertos/errores, tiempo por actividad, abandonos, qué modos completa más, pistas usadas.

- Ajusta el vector de perfil gradualmente (p. ej. si un niño 'lector' siempre salta al audio, sube su eje auditivo).

- Ajusta dificultad (modelo simple de maestría por habilidad: subir/bajar según racha de aciertos).

- Recomienda la siguiente lección (cola priorizada por habilidad menos reforzada + perfil).

**Importante para Claude Code: en Fase 1 NO se construye ML. La ****'****adaptación****'**** es un motor de reglas determinista y testeable. El aprendizaje estadístico llega en Fase 2 y puede empezar siendo heurístico (no requiere modelos entrenados).**

## 4.4 La lectura como eje transversal protegido

Decisión de producto: la lectura no se descuida nunca, aunque el niño prefiera audio. Regla:

- Todo contenido auditivo tiene su texto visible y sincronizado (karaoke/resaltado), de modo que el niño 'oye y ve' la palabra.

- Cada lección incluye al menos un micro-momento de lectura obligatorio, dosificado por edad (una palabra-clave en Chispas; una frase en Brasas; un párrafo corto en Llamas).

- La dosis de lectura sube gradualmente con la edad y con la maestría, nunca se elimina por preferencia.

# 5. Experiencia de usuario (UX) al detalle

## 5.1 Principios de diseño UX

- Mobile-first y táctil. Botones grandes, zonas de toque amplias (mínimo 48x48 px).

- Pre-lector friendly: todo lo crítico se puede entender sin saber leer (íconos + audio).

- Sesiones cortas: una lección = 5–10 min. Pensado para 'mientras los padres trabajan'.

- Refuerzo positivo, cero castigo: el error es parte del juego, nunca penaliza con tono negativo.

- Seguridad infantil primero: sin chat abierto, sin contenido externo no curado, sin datos del niño expuestos.

- Control parental visible: el padre ve progreso y administra tiempo.

## 5.2 Arquitectura de pantallas (mapa)

| **Zona** | **Pantallas** | **Quién la usa** |
| --- | --- | --- |
| Onboarding | Bienvenida con personajes → selección de edad → quiz de perfilado → resultado ('Tu mundo está listo') | Padre y/o niño según edad |
| Zona niño | Mapa de mundo (camino de lecciones) → lección → recompensa → colección de personajes/medallas | Niño |
| Zona padre (PIN) | Dashboard de progreso → reportes por habilidad → control de tiempo → suscripción | Padre |
| Tienda educadores | Catálogo de paquetes PDF → compra → descarga | Maestro/padre |

## 5.3 Flujo de onboarding (detallado)

- Splash con los tres personajes (Fueguito, Desconocido, Acidito) presentándose en audio.

- '¿Quién va a aprender?' → se crea perfil de niño (nombre o apodo, edad). Sin pedir datos sensibles del niño.

- Según edad, se decide quién responde el quiz (ver 4.2). Pantalla puente clara ('Ahora le toca a mamá/papá' o 'Ahora te toca a ti').

- Quiz de perfilado (máx. 8 preguntas, ilustradas, con audio).

- Pantalla de resultado lúdica: 'Fueguito preparó un mundo a tu medida' (no se muestran ejes técnicos al usuario).

- Primera lección gratuita inmediata (gratificación temprana, estilo Duolingo).

- Tras la primera lección: invitación suave a crear cuenta del padre (email) para guardar progreso.

## 5.4 Anatomía de una lección (el bloque fundamental)

Toda lección, sin importar el modo, sigue esta estructura de 5 momentos. Esto es clave para que el contenido sea producible en serie y el motor pueda intercambiar 'modos' sin romper la pedagogía:

| **Momento** | **Qué pasa** | **Varía por modo?** |
| --- | --- | --- |
| 1. Gancho | Un personaje plantea un problema/misión en 1 frase + audio | Tono varía; objetivo no |
| 2. Explicación | Se muestra el concepto (animación, audio o demostración manual) | Sí: animación vs audio vs paso manual |
| 3. Práctica | El niño resuelve 3–5 micro-retos | Sí: arrastrar vs recortar-fotografiar vs responder por voz |
| 4. Lectura | Micro-momento de lectura obligatorio dosificado | Dosis varía por edad, presencia es fija |
| 5. Recompensa | Medalla/pieza de colección + refuerzo del personaje | Cosmético varía; lógica no |

*Para el modo manual (creativo): la actividad puede pedir al niño hacer algo con papel/objetos y luego confirmar (con ayuda del padre) o tomar una foto que la app celebra. El reto manual no exige reconocimiento de imagen complejo en el MVP: basta con autoconfirmación guiada.*

## 5.5 Sistema de personajes (rol en UX)

| **Personaje** | **Rol propuesto en la app** | **Cuándo aparece** |
| --- | --- | --- |
| Fueguito | Mentor principal y guía cálido. Da la bienvenida y celebra logros. | Onboarding, recompensas, hilo conductor |
| Desconocido | El que plantea misterios y preguntas ('¿y por qué?'). Detona el pensamiento crítico. | Ganchos de lecciones de crítica/deducción |
| Acidito | El reto/competición, el pícaro que pone a prueba. Aporta humor y dificultad. | Retos cronometrados, modo competitivo |

*Assets ya creados con Kling AI para los tres. Diseñar un sistema de assets escalable: el catálogo de personajes crecerá (más personajes del Universo de Fueguito). Ver Sección 7.*

## 5.6 Zona del padre (control parental)

- Acceso protegido por PIN (no por contraseña larga; debe ser rápido para el padre y barrera para el niño).

- Dashboard: progreso por habilidad (lógica/crítica/resolución), racha, tiempo jugado, próximos objetivos.

- Reporte 'cómo aprende mi hijo': muestra el perfil en lenguaje humano, no técnico ('a tu hijo le funcionan los retos con audio').

- Control de tiempo: límite diario configurable; modo 'descanso'.

- Gestión de múltiples niños bajo una cuenta de padre.

- Gestión de suscripción.

# 6. Currículo y modelo de contenido

## 6.1 Las tres habilidades (igual peso)

| **Habilidad** | **Qué desarrolla** | **Ejemplos de temas por edad** |
| --- | --- | --- |
| Lógica | Patrones, secuencias, clasificación, deducción, condicionales | Chispas: emparejar. Brasas: completar patrón. Llamas: 'si... entonces'. |
| Pensamiento crítico | Preguntar, distinguir hecho/opinión, evaluar, detectar trampas | Chispas: '¿qué no encaja?'. Brasas: '¿es verdad o opinión?'. Llamas: evaluar un argumento. |
| Resolución de problemas | Descomponer, planificar, probar, iterar | Chispas: pasos de una rutina. Brasas: laberinto con plan. Llamas: problema multi-paso. |

## 6.2 Estructura del currículo

Jerarquía: Paquete de edad → Habilidad → Unidad temática → Lección → Actividades. El mapa de mundo del niño es una secuencia de lecciones que entrelaza las tres habilidades (no se agotan una por una, se intercalan para mantener variedad).

Volumen objetivo MVP: para validar, basta un paquete de edad completo (sugerido: Brasas 6–8) con ~3 unidades por habilidad y ~5 lecciones por unidad = ~45 lecciones, cada una en 2–3 modos.

## 6.3 Paquetes PDF para maestros (línea de pago único)

- Paquetes temáticos imprimibles (p. ej. 'Lógica para 1er grado: 20 fichas').

- Pago único por paquete, descarga directa. No requiere suscripción.

- Reutilizan el contenido del modo manual de la app (las fichas ya existen como actividades).

- Marca consistente con el Universo de Fueguito (los personajes en las fichas refuerzan brand awareness en aulas).

# 7. Producción de contenido (recomendación viable)

Pediste la opción más viable. Recomendación: contenido pregenerado y curado, NO generado en vivo con IA. Razones: producto infantil (riesgo de salida impredecible de un LLM en vivo), costo por sesión, offline/latencia, y control pedagógico. La IA es tu fábrica de producción, no un actor en tiempo de ejecución.

## 7.1 Pipeline de producción recomendado

| **Activo** | **Herramienta** | **Notas** |
| --- | --- | --- |
| Personajes y escenas | Kling AI (ya en uso) | Mantener biblia de personajes para consistencia visual |
| Animación / clips | Kling AI + CapCut | Clips cortos por momento de lección |
| Voz de personajes | ElevenLabs | Una voz consistente por personaje; guardar IDs de voz |
| Edición y subtítulos | CapCut | Subtítulos sincronizados = apoyo a la lectura (4.4) |
| Fichas PDF | Generación propia + plantilla de marca | Reutilizables como producto de pago único |

*Flujo: guion por lección (estructura 5 momentos) → generación de assets por modo → curado humano → empaquetado en formato de contenido (7.2) → carga a la app.*

## 7.2 Formato de contenido desacoplado del código (CRÍTICO)

El contenido NO se programa a mano dentro del código. Se define como datos (JSON) que la app interpreta. Así puedes crear cientos de lecciones sin tocar el código y el motor adaptativo solo lee datos. Esquema conceptual de una lección:

{

  "id": "brasas-logica-u1-l3",

  "paquete": "brasas", "habilidad": "logica",

  "objetivo": "Completar un patrón de 3 elementos",

  "lectura": { "dosis": "frase", "texto": "El patrón se repite." },

  "modos": {

    "interactivo": { "gancho": "...", "assets": ["clip01.mp4"], "retos": [...] },

    "audio_narrativo": { "gancho_audio": "voz01.mp3", "retos": [...] },

    "manual": { "instruccion": "...", "ficha_pdf": "u1l3.pdf", "retos": [...] }

  },

  "personaje": "desconocido", "recompensa": "medalla_patron"

}

**Esto permite que Claude Code construya un ****'****reproductor de lecciones****'**** genérico una sola vez, y que tú alimentes contenido como datos indefinidamente.**

# 8. Arquitectura técnica

Stack: Web primero (Next.js + Supabase), móvil después. Esto encaja con tu enfoque de vibe coding (Claude Code, Vercel, Supabase) y permite envolver la web en una app móvil más adelante (PWA o wrapper) sin reescribir.

## 8.1 Stack recomendado

| **Capa** | **Tecnología** | **Razón** |
| --- | --- | --- |
| Frontend | Next.js (App Router) + React | Tu stack actual; despliegue directo en Vercel |
| Estilos | Tailwind CSS | Rápido, consistente, mobile-first |
| Backend/DB | Supabase (Postgres + Auth + Storage) | Auth de padres, datos de progreso, almacenamiento de assets |
| Hosting | Vercel | Tu flujo actual |
| Media | Supabase Storage o CDN | Clips de Kling/CapCut y audios de ElevenLabs |
| Pagos | Stripe (suscripción) + checkout PDF | Suscripción global; ver 8.5 |
| Móvil (Fase 3) | PWA primero; wrapper nativo si hace falta | Reusar la web; mínima reescritura |

## 8.2 Modelo de datos (entidades núcleo)

- parents (cuenta de pago, email, suscripción)

- children (perfil de niño bajo un parent: apodo, edad, paquete)

- learner_profiles (vector de ejes por niño: modalidad, entrada, dinámica, ritmo)

- lessons (metadatos + referencia al JSON de contenido)

- progress (qué lección, modo usado, resultado, tiempo, pistas)

- skill_mastery (maestría por niño y por habilidad)

- subscriptions (estado, tier, fechas)

- pdf_orders (compras de paquetes PDF, descargas)

**Privacidad de menores: minimizar datos del niño (apodo, no nombre legal; no foto obligatoria; no ubicación). El titular de la cuenta y de pago es el adulto. Ver Sección 10.**

## 8.3 El motor adaptativo en código (Fase 1)

- Servicio puro y determinista: entrada = perfil + historial; salida = siguiente lección + modo + dificultad.

- Implementado como reglas explícitas y testeables (no caja negra). Cobertura de tests desde el inicio.

- Aislado tras una interfaz, para poder cambiar de 'reglas' (F1) a 'aprende' (F2) sin tocar la UI.

## 8.4 Reproductor de lecciones genérico

Un componente que recibe el JSON de una lección y el modo seleccionado, y renderiza los 5 momentos. Tipos de reto soportados en MVP: selección, arrastrar-soltar, ordenar secuencia, respuesta por voz (simple), y reto manual autoconfirmado.

## 8.5 Pagos y monetización (técnico)

- Suscripción: Stripe con tier gratuito (sin tarjeta) y mensual. Considerar precios locales por región más adelante.

- PDFs: checkout de pago único que entrega descarga firmada y temporal desde Storage.

*Nota: cualquier cobro real, alta de tarjetas o transacciones las gestiona el proveedor de pagos (Stripe) y el usuario; la app nunca maneja datos de tarjeta directamente.*

# 9. Modelo de monetización (detalle)

## 9.1 Freemium

| **Tier** | **Qué incluye** | **Límite** |
| --- | --- | --- |
| Gratis (enganche) | Acceso al onboarding, perfilado y un set de lecciones | Lecciones limitadas por día; 1 perfil de niño |
| Premium (mensual) | Todo el contenido, todos los modos, reportes para padres, múltiples niños | Sin límite diario |

Estrategia de enganche estilo Duolingo: gratificación temprana (primera lección sin registro), racha diaria, y muro suave al límite ('Fueguito quiere seguir, desbloquea más').

## 9.2 Paquetes PDF (pago único, maestros/escuelas)

- Catálogo navegable por edad/habilidad/tema.

- Precio único por paquete; sin suscripción requerida.

- Licencia de aula clara (uso en clase) en términos.

*Pricing: definir tras investigación de mercado por región. Mantener el mensual **'**accesible**'** como principio (entrada baja, volumen alto), coherente con tu visión de producto digital escalable de bajo ticket.*

# 10. Seguridad infantil, privacidad y cumplimiento

Producto dirigido a menores: la seguridad y privacidad no son opcionales. Requisitos mínimos a implementar desde el MVP:

- La cuenta y el consentimiento los da el adulto. El niño nunca crea cuenta ni introduce datos personales.

- Minimización de datos: apodo y edad bastan; sin nombre legal, sin ubicación, sin foto obligatoria del niño.

- Sin publicidad de terceros ni rastreadores en la experiencia del niño.

- Sin chat abierto ni contenido generado por usuarios visible para niños.

- Control parental con PIN y gestión de tiempo.

- Cumplimiento aplicable a menores según mercado (p. ej. marcos tipo COPPA en EE.UU. y equivalentes locales). Verificar con asesoría legal antes de lanzar; este documento no constituye asesoría legal.

- Borrado de datos a solicitud del padre.

# 11. Roadmap por fases (build secuencial)

Alineado con tu estrategia: estabilizar cada fase antes de avanzar. Cada fase es entregable y usable.

## Fase 0 — Fundaciones (1 sprint)

- Repo, CLAUDE.md, este PRD como contexto. Next.js + Tailwind + Supabase + Vercel funcionando.

- Esquema de datos base y autenticación de padres.

- Definir el esquema JSON de lección (7.2) y cargar 2–3 lecciones de prueba.

## Fase 1 — MVP jugable (núcleo)

- Onboarding + quiz de perfilado (combinado por edad).

- Reproductor de lecciones genérico con 2–3 modos.

- Motor adaptativo por reglas (determinista, testeado).

- Un paquete de edad completo (sugerido Brasas 6–8, ~45 lecciones).

- Mapa de mundo, recompensas, racha. Lectura transversal implementada.

- Zona del padre básica (PIN + progreso).

- Freemium con límite diario + suscripción Stripe.

## Fase 2 — Adaptación que aprende + crecimiento

- Motor que ajusta perfil y dificultad con el comportamiento real (heurístico).

- Reportes 'cómo aprende mi hijo' para el padre.

- Segundo y tercer paquete de edad (Chispas y Llamas).

- Tienda de PDFs para maestros (pago único).

## Fase 3 — Escala y plataforma

- Móvil (PWA o wrapper).

- Más personajes del Universo de Fueguito; cross-promotion con YouTube.

- Precios regionales; optimización de conversión y retención.

- Posible internacionalización (otros idiomas).

# 12. Riesgos y decisiones abiertas

| **Riesgo / decisión** | **Mitigación / nota** |
| --- | --- |
| Sobre-ingeniería del motor adaptativo | Empezar por reglas deterministas; ML solo si los datos lo justifican |
| Costo y tiempo de producir contenido en 2–3 modos | Estandarizar la estructura de 5 momentos; reutilizar fichas como PDFs vendibles |
| Cumplimiento legal con menores por país | Asesoría legal antes de lanzar; minimizar datos desde el día 1 |
| Validar que el perfilado 'se siente acertado' | Medir percepción del padre; iterar el quiz |
| Nombre de la app | Pendiente: reemplazar [NOMBRE_APP] globalmente |
| Pricing exacto (mensual y PDFs) | Pendiente: investigación de mercado por región |

# 13. Prompt inicial sugerido para Claude Code

Copia esto en tu primera sesión, junto con este PRD en el repo:

Lee PRD.md (documento maestro). Vamos a construir la Fase 0 únicamente.

Stack: Next.js (App Router) + Tailwind + Supabase + Vercel.

Objetivos de esta sesión:

1. Inicializar el proyecto y dependencias.

2. Crear el esquema de datos de la Sección 8.2 en Supabase.

3. Implementar auth de padres (email).

4. Definir el tipo/esquema JSON de leccion de la Seccion 7.2.

5. Cargar 2-3 lecciones de ejemplo y un endpoint para leerlas.

No construyas el motor adaptativo ni el reproductor todavia.

Respeta la minimizacion de datos de menores (Seccion 10).

Trabaja en incrementos pequenos y muestrame cada paso antes de avanzar.

*Fin del documento maestro · [NOMBRE_APP] · Universo de Fueguito*

Página  de
