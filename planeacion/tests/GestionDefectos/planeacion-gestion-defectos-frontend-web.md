# Planeación del registro y gestión de defectos — Frontend web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA para el PR-07 (Registro y gestión de defectos). Describe cómo se registran, clasifican, corrigen, verifican y cierran los defectos de este componente en **GitHub Issues**, automatizado con **GitHub Actions**, y lista los defectos que ya se conocen. No contiene resultados de ejecución.
> **Pensado para:** cualquier integrante del equipo o una IA que no conoce el proyecto. Los defectos conocidos salen de la revisión de código (prueba estática) del 28 al 30/10/2026 y del 02/11/2026, documentada en las planeaciones de correcciones, el PR-02 y el PR-03.
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** registro de los defectos conocidos en cuanto la plantilla y el workflow estén en `develop` (al fusionar el PR #34); gestión continua en S8 a S10; corte del PR-07 el 21 nov (S9) y cierre el 28 nov (S10), según el PR-01.
> **Cambio del 10/11/2026 (D-WEB-15):** la herramienta pasa de Azure Boards a GitHub Issues + GitHub Actions. El proceso (estados, severidad, prioridad, verificación) no cambia; cambian el lugar y la forma de enlazar el código.

---

## 1. Dónde viven los defectos

| Elemento | Valor |
|---|---|
| Herramienta | **GitHub Issues** del repositorio `marianacortes0/proyecto-eyesschool`, con la plantilla **Defecto** (`.github/ISSUE_TEMPLATE/defecto.yml`) |
| Automatización | Workflow **Defectos** (`.github/workflows/defectos.yml`), que ejecuta `scripts/defectos/gestion.mjs`. Las reglas están en `scripts/defectos/reglas.mjs` y las prueba `tests/defectos.test.ts` |
| Etiquetas | `defecto` (la pone la plantilla), el componente (`web`, `backend` o `app`), el origen (`revision-codigo`, `analisis-estatico`, `pruebas-unitarias`, `pruebas-integracion`, `pruebas-sistema` o `uat`), la severidad (`severidad:critica`…`severidad:baja`), la prioridad (`P1`…`P4`) y el estado (`estado:…`). El workflow las crea y las pone solo |
| Enlace con el código | Cada PR de corrección hacia `develop` dice **`Corrige #<n>`** en la descripción (la plantilla del PR ya trae la línea). **No** se usa `Closes #<n>` ni `Fixes #<n>`: cerrarían el defecto al fusionar, antes de que QA lo verifique. Si alguien los usa, el workflow lo reabre |
| Relación con el caso | Campos «Caso que lo detectó» (CP-INT, CP-SIS, CP-NF, CP-ACE, UT-WEB o IT-WEB) y «Corrección planeada» (BE, WEB o APP) de la plantilla |
| Ficha larga | Los defectos que necesitan análisis (por ejemplo DEF-WEB-01) además tienen su ficha en `docs/defectos/DEF-WEB-xx.md`; el issue lleva ese ID en «ID del registro» y la ficha anota el número `#<n>` |

## 2. Ciclo de vida

Se conservan los estados del proceso Scrum que se usaba en Azure Boards. En GitHub, los estados abiertos son etiquetas `estado:…` y los cerrados son el motivo de cierre del issue.

| Estado (Scrum) | En GitHub | Quién lo mueve | Cuándo |
|---|---|---|---|
| New | Abierto · `estado:nuevo` | QA (el workflow la pone al crear el issue) | Al registrar el defecto con la plantilla |
| Approved | Abierto · `estado:aprobado` | PO (Sergio Gómez), a mano | Al confirmar la prioridad en el refinamiento |
| Committed | Abierto · `estado:en-curso` | El workflow, cuando se abre un PR hacia `develop` con `Corrige #<n>` | Al tomarlo en el sprint |
| *(nuevo)* | Abierto · `estado:en-verificacion` | El workflow, cuando ese PR se fusiona en `develop` | La corrección espera la verificación de QA |
| Done | **Cerrado como completado** (*Close as completed*) | QA (Mariana Cortés o Samuel Sierra), a mano | Solo después de verificar la corrección en QA (sección 6) |
| Removed | **Cerrado como no planeado** (*Close as not planned*) | PO, a mano | Falso positivo o decisión de diseño, con la justificación escrita en un comentario |

Un defecto que falla la verificación se **reabre** (*Reopen*): el workflow lo devuelve a `estado:en-curso` y le pone la etiqueta `reabierto`, que alimenta la métrica de reabiertos del PR-07.

## 3. Clasificación

- **Severidad (la define QA)** con los cuatro niveles del PR-07: Crítica, Alta, Media y Baja. Se elige en la plantilla y el workflow pone `severidad:critica`, `severidad:alta`, `severidad:media` o `severidad:baja`. Para cambiarla después, se edita el campo del issue: el workflow cambia la etiqueta.
- **Prioridad (la define el PO)** de P1 a P4. QA propone en la plantilla; si la deja vacía, el workflow propone la que corresponde a la severidad (Crítica → P1, Alta → P2, Media → P3, Baja → P4). El PO la confirma o la cambia **con la etiqueta** (`P1`…`P4`); editar el issue después ya no la toca.
- **Tiempo objetivo de corrección:** Crítica ≤ 24 h; Alta ≤ 3 días; Media dentro del mismo sprint; Baja al backlog. Las críticas conocidas tienen acción el primer día de S7.

## 4. Defectos ya conocidos de este componente

Se registran como issues con la plantilla **Defecto**, origen «Revisión de código», con el ID del PR-07 en «ID del registro» y la fecha en que se identificaron en el cuerpo (GitHub pone como fecha de apertura la del registro). El número `#<n>` que asigne GitHub se anota en el PR-07.

| ID PR-07 | Corrección | Título | Severidad | Prioridad propuesta | Caso que lo verifica | Asignado | Identificado | Sprint |
|---|---|---|---|---|---|---|---|---|
| DEF-020 | WEB-01 | La sesión no se renueva, no se cierra por inactividad y el middleware solo protege /admin y /general | Alta | P2 | CP-SIS-004, 065 | Mariana Cortés | 28/10/2026 | S7 |
| DEF-021 | WEB-02 | El token de acceso se lee desde JavaScript, las cookies no son secure y el rol sale de una cookie sin firma | Alta | P2 | CP-NF-013 | Mariana Cortés | 28/10/2026 | S8 |
| DEF-022 | WEB-03 | La web solo conoce un hijo por padre | Alta | P2 | CP-SIS-060 | Mariana Cortés | 28/10/2026 | S8 |
| DEF-023 | WEB-04 | El docente ve la acción de borrar asistencia, que la API le niega | Media | P3 | CP-INT-076, CP-SIS-064 | Mariana Cortés | 28/10/2026 | S7 |
| DEF-024 | WEB-05 | Restablecer la contraseña solo exige 8 caracteres | Alta | P2 | CP-SIS-017 | Mariana Cortés | 28/10/2026 | S7 |
| DEF-025 | WEB-06 | El registro masivo no dice qué estudiantes fallaron ni deja reintentar | Media | P3 | CP-SIS-038, 039, 041 | Mariana Cortés | 28/10/2026 | S8 |
| DEF-026 | WEB-08 | Código heredado de Supabase y 28 advertencias de ESLint | Baja | P4 | PR-03 | Mariana Cortés | 28/10/2026 | S8 |
| DEF-027 | WEB-09 | El padre no puede descargar el boletín y los mensajes de notas no coinciden con los CA | Media | P3 | CP-SIS-051, 054, 055 | Mariana Cortés | 30/10/2026 | S8 |
| DEF-028 | WEB-SA-3 | El historial de git conserva una clave service_role de Supabase (commit b7e20f5) | Crítica | P1 | CP-NF-012 | Mariana Cortés | 02/11/2026 | S7 (inmediato) |

Los que ya tienen la corrección fusionada se registran y se pasan a `estado:en-verificacion` a mano, con el commit de la corrección en un comentario; QA los cierra cuando el caso que los verifica pasa en QA.

## 5. Ficha del defecto (plantilla «Defecto»)

| Campo de la plantilla | Contenido |
|---|---|
| Título | Verbo + qué falla + dónde (como los títulos de la sección 4). Empieza por `[DEF]` |
| ID del registro | DEF-0xx o DEF-WEB-xx, si ya existe |
| Componente · Origen | Desplegables → etiquetas `web`/`backend`/`app` y de origen |
| Severidad · Prioridad propuesta | Sección 3 → etiquetas `severidad:…` y `P1`…`P4` |
| Caso que lo detectó · Corrección planeada | ID del caso y de la corrección (BE, WEB o APP) |
| Pasos · Resultado esperado · Resultado obtenido | Pasos numerados y los dos resultados |
| Navegador y versión · URL de QA y commit probado | Lo que antes iba en «System Info» |
| Evidencia | Ruta en `evidencias/` o adjunto (captura, video, log) **sin tokens, contraseñas, cookies ni URLs con credenciales**: la plantilla exige confirmarlo |
| Asignado | *Assignees* del issue: responsable de la corrección en la planeación |
| Al cerrar | Comentario con la causa raíz (Requisitos, Diseño, Codificación, Datos o Entorno) y el commit de la corrección. El workflow deja la lista de comprobación en el issue al fusionarse la corrección |

## 6. Verificación y regresión

1. El desarrollador abre el PR hacia `develop` con `Corrige #<n>` y la prueba que demuestra el defecto (fallaba antes y pasa después). El workflow pasa el defecto a **En curso**.
2. Al fusionarse, el workflow lo pasa a **En verificación** y comenta el commit y la lista de comprobación.
3. Se despliega en QA y QA repite el caso que lo detectó.
4. Se corre la regresión del módulo: las pruebas automatizadas del componente y los casos de sistema del mismo módulo.
5. Si todo pasa, QA lo cierra como **completado** con la causa raíz; si no, lo **reabre** y cuenta como reabierto.

## 7. Registro en el PR-07

| Dato | Dónde va |
|---|---|
| Cada defecto con su `#<n>`, estado y fechas | Tabla 2 (registro consolidado) |
| Conteos por severidad, reabiertos y tiempos | Tabla 3 (métricas) y Figura 2 |
| Causa raíz al cerrar | Sección 7 (análisis de causa raíz) |

Corte del registro: 21 nov 2026 (fin de S9) y 28 nov 2026 (fin de S10). En cada corte se ejecuta el workflow **Defectos** a mano (*Actions → Defectos → Run workflow → exportar*). Genera el artefacto `defectos-web-<n>` con `defectos-web.csv` (issue, ID, título, severidad, prioridad, componente, origen, estado, reabierto, caso, corrección, fechas de apertura y cierre, y días abierto), que se anexa al PR-07.

## 8. Responsables y calendario

| Actividad | Fecha | Responsable |
|---|---|---|
| Fusionar la plantilla y el workflow en `develop`; ejecutar *Defectos → etiquetas* si las etiquetas no aparecen | Con el PR #34 | Mariana Cortés |
| Registrar los 9 defectos conocidos y DEF-WEB-01 como issues | Al quedar el workflow en `develop` | Mariana Cortés |
| Confirmar prioridades (`estado:aprobado` y etiqueta `P1`…`P4`) | Refinamiento del sprint | Sergio Gómez (PO) |
| Registrar los defectos nuevos de PR-03 a PR-06 | Durante cada corrida | Quien ejecuta la corrida |
| Verificar correcciones y cerrar | S8 a S10 | Mariana Cortés · Samuel Sierra |
| Cortes del PR-07 (exportar CSV) | 21 y 28 nov | Samuel Sierra (líder de pruebas) |

## 9. Definición de terminado

- [ ] La plantilla **Defecto** y el workflow **Defectos** están en `develop` y las etiquetas existen en el repositorio.
- [ ] Los 9 defectos conocidos de este componente están en GitHub Issues con su `#<n>` anotado en el PR-07.
- [ ] Cada defecto cerrado tiene la verificación en QA, la causa raíz y el commit.
- [ ] 0 defectos críticos o altos abiertos al cierre de S10 (criterio de salida del PR-01).
