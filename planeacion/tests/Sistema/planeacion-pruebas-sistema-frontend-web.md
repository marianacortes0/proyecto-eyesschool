# Planeación de pruebas de sistema — Frontend web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA para el PR-06 (Informe de pruebas de sistema). Describe qué casos de sistema del panel web se ejecutan, en qué navegadores, con qué herramientas y dónde queda cada resultado. No contiene resultados: se llenan al ejecutar.
> **Pensado para:** cualquier integrante del equipo o una IA que no conoce el proyecto. Los casos y sus ID son los del PR-02 v0.2.
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** montaje de Playwright en S7–S8 (WEB-INF-3) y ejecución en S9 (15 – 21 nov 2026), según el PR-01. Regresión en S10.

---

## 1. Objetivo y alcance

Verificar el panel web completo contra la API y la base de QA: flujos de punta a punta por rol y características no funcionales (seguridad de la web, accesibilidad, rendimiento de las páginas y compatibilidad de navegadores).

| Entra | No entra |
|---|---|
| 62 casos de sistema de la web (CP-SIS «Web») y los 3 que cruzan web y app | Casos de la app: planeación de la app del PR-06 |
| No funcionales de la web: CP-NF-003 (parte web), 005, 008, 013 y la parte web de 015, 017, 018 y 019 | Carga de la API: planeación del backend del PR-06 |

## 2. Entorno y navegadores

| Elemento | Valor |
|---|---|
| Web | Vista previa de Vercel de la rama `develop` apuntando a la API de QA (WEB-INF-4) |
| API y base | QA (URL pendiente de definir en el PR-01) |
| Navegadores (PR-01) | Chrome, Brave y Firefox, en su versión estable del día de la ejecución (se anota la versión) |
| Resolución | 1920 × 1080 en escritorio; 390 × 844 para revisar el diseño adaptable en el inicio de cada rol |
| Usuarios | DS-01 y DS-03; contraseña `QA_PASSWORD` por canal privado; variables `E2E_*` para Playwright |
| Cámara para el escaneo | Cámara web del equipo con los QR de DS-05 en otra pantalla o impresos |

## 3. Herramientas

| Herramienta | Uso |
|---|---|
| Playwright (`@playwright/test`) | Flujos automatizados (sección 4.2) en Chromium y Firefox; Brave se prueba a mano |
| Lighthouse (DevTools de Chrome) y axe DevTools | Accesibilidad y rendimiento de las páginas (CP-NF-005) |
| OWASP ZAP (Docker) | Escaneo baseline de la web (CP-NF-003, parte web) |
| DevTools → Application → Cookies | Revisión de cookies (CP-NF-013) |
| VS Code con la extensión Playwright Test for VS Code | Grabar, ejecutar y depurar los escenarios |

## 4. Casos

### 4.1 Casos de sistema de la web

| ID | Escenario | Pasos clave | Resultado esperado | Automatización | Hoy |
|---|---|---|---|---|---|
| CP-SIS-001 | Inicio de sesión por rol | Iniciar sesión con DS-01 (admin, docente, estudiante, padre) | Cada rol llega a su inicio y los datos cargan | Playwright e2e (WEB-INF-3) | Falla esperada (BE-03) |
| CP-SIS-002 | Credenciales incorrectas | Contraseña errada; luego correo inexistente | Mismo mensaje genérico en los dos casos | Playwright | Sin ejecutar |
| CP-SIS-003 | Campos vacíos | Enviar con correo o contraseña vacíos | El formulario no se envía e indica el campo | Playwright | Sin ejecutar |
| CP-SIS-004 | Sesión vencida | Iniciar sesión, dejar el panel sin actividad 30 min y navegar | Borra las cookies y redirige a /?login=1 | tests/routeGuard.test.ts + Playwright | Falla esperada (WEB-01) |
| CP-SIS-005 | Sin conexión con la API | API de QA detenida o URL errada; iniciar sesión | Mensaje de error y opción de reintentar | Manual | Sin ejecutar |
| CP-SIS-006 | Inicio con módulos por rol | Entrar con cada rol y revisar el menú lateral | Solo aparecen los módulos del rol (mapa routeRoles) | Playwright | Falla esperada (BE-03) |
| CP-SIS-007 | Acceso por URL a módulo de otro rol | Como padre, escribir /usuarios, /reportes y /qr/escanear | Acceso bloqueado y redirección a /general | tests/routeGuard.test.ts | Sin ejecutar |
| CP-SIS-008 | Error al cargar el inicio | API caída al abrir /general | Mensaje de error y opción de reintentar | Manual | Sin ejecutar |
| CP-SIS-009 | Consultar perfil | Abrir /perfil con cada rol | Nombre, correo, rol y curso o asignaturas del usuario autenticado | Playwright | Sin ejecutar |
| CP-SIS-010 | Cerrar sesión | Cerrar sesión; usar «atrás» del navegador hacia una página protegida | Vuelve al inicio de sesión y la página protegida pide iniciar sesión | Playwright | Sin ejecutar |
| CP-SIS-011 | Auto-registro | Registrarse como estudiante con todos los datos | Confirmación visual de cuenta creada; puede iniciar sesión | Playwright | Sin ejecutar |
| CP-SIS-012 | Registro con correo existente | Registrar un correo existente, también con mayúsculas | Mensaje de error; no se crea la cuenta | Playwright | Falla esperada (BE-12) |
| CP-SIS-013 | Registro con campo vacío | Dejar un campo obligatorio vacío | Mensaje de error; no se registra | Playwright | Sin ejecutar |
| CP-SIS-014 | Registro de padre vinculado | Registrarse como padre indicando el documento de un estudiante de DS-02 | Inicia sesión y ve notas, asistencia y novedades de ese hijo (por diseño) | Playwright (WEB-INF-3) | Sin ejecutar |
| CP-SIS-015 | Recuperar contraseña | Pedir recuperación con correo registrado y con no registrado | Mismo mensaje neutral y confirmación de solicitud enviada | Playwright | Sin ejecutar |
| CP-SIS-016 | Restablecer contraseña | Abrir el enlace (*) y definir «Colegio#2026» | Contraseña actualizada; inicia sesión con la nueva | Manual | Sin ejecutar |
| CP-SIS-017 | Restablecer con contraseña débil | Definir «Colegio2026» | Mensaje con la regla incumplida antes de enviar | tests/resetPassword.test.ts | Falla esperada (WEB-05) |
| CP-SIS-018 | Enlace de recuperación usado | Usar dos veces el mismo enlace | El segundo uso muestra error de enlace inválido | Manual | Falla esperada (BE-13) |
| CP-SIS-019 | Crear usuario | Admin crea un docente de prueba con nombre, correo y rol | «Usuario creado exitosamente»; el usuario entra con los permisos del rol | Playwright | Sin ejecutar |
| CP-SIS-020 | Crear usuario con correo existente | Admin usa un correo ya registrado | Mensaje de error; no se guarda | Playwright | Sin ejecutar |
| CP-SIS-021 | Crear usuario con campo vacío | Dejar nombre, correo o rol vacíos | No guarda e indica el campo | Playwright | Sin ejecutar |
| CP-SIS-022 | Editar usuario | Admin cambia nombre, correo y rol | «Usuario editado exitosamente» y datos actualizados | Playwright | Sin ejecutar |
| CP-SIS-023 | Editar con correo existente | Admin pone el correo de otro usuario | Mensaje de error; no guarda | Playwright | Sin ejecutar |
| CP-SIS-024 | Editar dejando campo vacío | Borrar el nombre y guardar | Mensaje de error; no guarda | Playwright | Sin ejecutar |
| CP-SIS-025 | Eliminar usuario | Admin elimina un usuario de prueba; primero cancela y luego confirma | Pide confirmación; al cancelar no elimina; al confirmar «Usuario eliminado exitosamente» | Playwright | Sin ejecutar |
| CP-SIS-026 | Eliminar sin éxito | Eliminar con la API caída | Mensaje de que no fue posible completar la acción | Manual | Sin ejecutar |
| CP-SIS-027 | Consultar usuarios con filtros | Filtrar por rol, nombre y estado | Lista solo con los usuarios que cumplen los filtros | Playwright | Sin ejecutar |
| CP-SIS-028 | Consulta sin resultados o con error | Filtro sin coincidencias; luego API caída | Mensaje informativo; con error, mensaje y reintento | Playwright + manual | Sin ejecutar |
| CP-SIS-029 | Ver mi código QR | Estudiante abre /qr | QR del codigo_estudiante con nombre y datos básicos | Playwright | Sin ejecutar |
| CP-SIS-031 | Ver el QR de otro estudiante | Como padre o docente intentar ver el QR de un estudiante | Acceso bloqueado | Playwright | Sin ejecutar |
| CP-SIS-032 | Escaneo QR: entrada | Docente en /qr/escanear lee un QR válido sin registros hoy | Entrada registrada con fecha y hora | Manual (cámara) | Sin ejecutar |
| CP-SIS-033 | Escaneo QR inválido | Leer un QR que no es de un estudiante | Mensaje claro de error; no registra | Manual (cámara) | Sin ejecutar |
| CP-SIS-034 | Doble entrada en el mismo equipo | Leer dos veces el mismo QR como entrada | Bloqueo con «El estudiante ya tiene registro de entrada hoy» | Manual | Sin ejecutar |
| CP-SIS-035 | Escaneo QR: salida | Leer el mismo QR como salida después de la entrada | Salida registrada con fecha y hora | Manual | Sin ejecutar |
| CP-SIS-036 | Doble salida en el mismo equipo | Leer dos veces el QR como salida | Bloqueo con advertencia | Manual | Sin ejecutar |
| CP-SIS-037 | Registro masivo por curso | Admin elige jornada, curso, fecha y tipo; marca 2 excepciones; envía | Todos inician en «Presente»; se guardan con fecha, hora y tipo | Playwright | Sin ejecutar |
| CP-SIS-038 | Registro masivo con fallo de red | Cortar la red durante el envío | Lo enviado se conserva; se listan los fallidos por nombre con Reintentar y Descartar | registroMasivo.test.ts + Playwright | Falla esperada (WEB-06) |
| CP-SIS-039 | Registro masivo repetido | Enviar dos veces el mismo curso, fecha y tipo | La segunda vez todos salen «ya registrado» | e2e/registro-masivo.spec.ts | Falla esperada (WEB-06, BE-08) |
| CP-SIS-040 | Registro del día | Filtrar por curso y jornada; filtro sin datos; API caída | Registros del día; mensaje informativo; mensaje y reintento | Playwright | Sin ejecutar |
| CP-SIS-041 | Registros no guardados | Provocar fallos en un registro masivo y abrir el registro del día | Se ven los no guardados con Reintentar y Descartar | Playwright | Falla esperada (WEB-06) |
| CP-SIS-042 | Registrar nota | Docente registra 4.5 para estudiante, materia y periodo | Se guarda por estudiante, asignatura y periodo | Playwright | Sin ejecutar |
| CP-SIS-043 | Nota fuera de rango | Ingresar 5.1, −0.1 y «abc» | Mensaje de error; no se guarda | Playwright | Sin ejecutar |
| CP-SIS-044 | Nota con datos faltantes | Guardar sin periodo o sin materia | Mensaje de error; no se guarda | Playwright | Sin ejecutar |
| CP-SIS-045 | Promedio automático | Registrar 4.0 y 3.0; luego cambiar 3.0 por 5.0 | Promedio 3.50 y luego 4.50 sin recargar | Playwright | Sin ejecutar |
| CP-SIS-046 | Error al guardar o calcular | API caída al guardar una nota | Mensaje con pasos para solucionarlo y opción de reintentar | Manual | Sin ejecutar |
| CP-SIS-047 | Registrar novedad | Docente registra novedad con estudiante, tipo, fecha y descripción | Se guarda; la gravedad corresponde al tipo | Playwright | Sin ejecutar |
| CP-SIS-048 | Novedad con datos faltantes | Guardar sin descripción | Mensaje de error; no se guarda | Playwright | Sin ejecutar |
| CP-SIS-049 | Historial de novedades por estudiante | Docente o admin filtra por estudiante | Historial del estudiante ordenado por fecha | Playwright | Sin ejecutar |
| CP-SIS-050 | Estudiante consulta notas | Estudiante abre /notas y filtra por periodo; elige un periodo sin notas | Notas por asignatura y periodo; mensaje informativo sin notas | Playwright | Sin ejecutar |
| CP-SIS-051 | Padre consulta notas del hijo | Padre abre /notas; elige un periodo sin notas | Notas del hijo por materia y periodo; «No hay notas registradas para este periodo.» | Playwright | Falla esperada (WEB-09) |
| CP-SIS-052 | Padre consulta asistencia | Padre abre /asistencia; hijo sin registros; API caída | Registros por fecha y tipo; mensaje informativo; mensaje y reintento | Playwright + pytest (API) | Falla esperada (BE-04) |
| CP-SIS-053 | Padre consulta novedades | Padre abre /novedades; hijo sin novedades | Historial por fecha y tipo; mensaje claro si no hay | Playwright | Sin ejecutar |
| CP-SIS-054 | Padre descarga el boletín | Padre busca la opción de boletín en /notas | Descarga un PDF legible con la información académica | Playwright | Falla esperada (WEB-09) |
| CP-SIS-055 | Boletín sin datos | Pedir el boletín de un estudiante sin notas | «No hay datos disponibles para generar el boletín.» | Manual | Falla esperada (BE-19, WEB-09) |
| CP-SIS-056 | Registrar reporte de asistencia | Admin crea un reporte tipo «Asistencia» con fechas y adjunta un PDF; luego lo descarga | Aparece en la lista con su estado y el archivo se descarga | Playwright | Sin ejecutar |
| CP-SIS-057 | Reporte con error | API caída al consultar reportes; filtro sin datos | Mensaje claro y reintento; mensaje informativo | Manual | Sin ejecutar |
| CP-SIS-058 | Horario del estudiante | Estudiante abre /horarios; curso sin horario; API caída | Clases por día y franja de su curso; mensaje informativo; reintento | Playwright | Sin ejecutar |
| CP-SIS-059 | Clases del docente | Docente consulta sus clases; docente sin asignaciones; API caída | Solo sus cursos y materias; mensaje informativo; reintento | Playwright | Sin ejecutar |
| CP-SIS-060 | Padre con dos hijos | DS-03: listar hijos y cambiar de hijo | Ve solo sus dos hijos; al cambiar, notas, asistencia y novedades cambian | e2e/padre-dos-hijos.spec.ts | Falla esperada (BE-07, WEB-03) |
| CP-SIS-061 | Padre sin hijos vinculados | Padre registrado sin vínculo | Mensaje «No hay estudiantes vinculados» | hijoActivo.test.ts | Sin ejecutar |
| CP-SIS-064 | Docente sin acción de borrar asistencia | Docente abre /asistencia | No ve el botón de borrar | tests/permissions.test.ts | Falla esperada (WEB-04) |
| CP-SIS-065 | Sesión larga | Usar el panel durante 40 min | Las llamadas siguen funcionando (renovación del token) | Playwright | Falla esperada (WEB-01) |
### 4.2 Casos que cruzan la web y la app

| ID | Escenario | Pasos clave | Resultado esperado | Automatización | Hoy |
|---|---|---|---|---|---|
| CP-SIS-030 | QR web leído en la app | Mostrar el QR de la web y escanearlo desde la app (docente) | La app reconoce al estudiante y registra | Manual | Sin ejecutar |
| CP-SIS-062 | Notificación push de novedad | POCO X7 con sesión del padre de DS-03 y permiso concedido; docente registra una novedad en la web; un segundo teléfono o emulador con otro padre | Llega al padre vinculado, no al otro; al tocarla abre las novedades del hijo | integration_test (APP-INF-2) + manual | Falla esperada (BE-18, APP-08) |
| CP-SIS-096 | Entrada desde dos equipos | Registrar la entrada de un estudiante en la app y luego en la web | El segundo registro se rechaza (409) y se informa | Manual + pytest (API) | Falla esperada (BE-08) |
### 4.3 Automatización con Playwright (WEB-INF-3)

| Escenario automatizado | Casos que cubre | Archivo propuesto |
|---|---|---|
| Inicio de sesión de cada rol con su inicio cargado | Inicio de sesión por rol, inicio con módulos por rol | `e2e/login-roles.spec.ts` |
| Sesión de 40 min sin perderse e inactividad de 30 min | Sesión larga, sesión vencida | `e2e/sesion.spec.ts` |
| Padre con dos hijos | Padre con dos hijos | `e2e/padre-dos-hijos.spec.ts` |
| Registro masivo duplicado | Registro masivo repetido | `e2e/registro-masivo.spec.ts` |
| Registro de padre que ve a su hijo vinculado | Registro de padre vinculado (comportamiento por diseño) | `e2e/registro-padre.spec.ts` |
| Boletín del padre | Padre descarga el boletín | `e2e/boletin-padre.spec.ts` |
| Gestión de usuarios (crear, editar, eliminar, filtrar) | Casos de US001 a US004 | `e2e/usuarios.spec.ts` |

Los casos con cámara (escaneo QR), API caída y bloqueo de notificaciones se ejecutan a mano con grabación de pantalla.

### 4.4 No funcionales de la web

| ID | Prueba | Cómo | Meta | Hoy |
|---|---|---|---|---|
| CP-NF-003 (web) | Escaneo DAST | `zap-baseline.py` contra la URL de QA | 0 alertas altas | Sin ejecutar |
| CP-NF-005 | Accesibilidad y rendimiento | Lighthouse (modo navegación, escritorio) y axe en: inicio de sesión, inicio de cada rol, usuarios, notas, asistencia y novedades | Accesibilidad ≥ 90 (MC-01); rendimiento se registra | Sin ejecutar |
| CP-NF-008 | Compatibilidad | Login, crear usuario, escaneo y notas del padre en Chrome, Brave y Firefox | Mismo resultado en los tres | Sin ejecutar |
| CP-NF-013 | Cookies de sesión | DevTools después de iniciar sesión en QA (HTTPS) | `eys_access` y `eys_refresh` con HttpOnly; todas con Secure | Falla esperada (WEB-02) |
| CP-NF-015 (web) | Dependencias | `npm audit --omit=dev` | 0 críticas o altas | Sin ejecutar |
| CP-NF-017 (web) | Usabilidad | Evaluación heurística de Nielsen durante la UAT | Sin problemas de severidad 3 o 4 abiertos | Sin ejecutar |
| CP-NF-018 (web) | Fallo de la API | Detener la API de QA y recorrer los módulos | Ninguna página queda en blanco; todas muestran mensaje y reintento | Sin ejecutar |
| CP-NF-019 (web) | Usuario desactivado | El admin desactiva una cuenta con sesión abierta en la web | Pierde el acceso al vencer el token y vuelve al login | Falla esperada (BE-13) |

## 5. Ejecución

| Corrida | Fecha | Qué mide |
|---|---|---|
| S1 | 17 – 19 nov 2026 (S9) | Primera ejecución completa en los tres navegadores |
| S2 (regresión) | 24 – 26 nov 2026 (S10) | Casos fallidos de S1 después de corregir, más toda la suite de Playwright |

```bash
# Playwright contra QA (las variables E2E_* y la contraseña vienen de un archivo local o de secretos)
E2E_BASE_URL=$QA_WEB npx playwright test --project=chromium --project=firefox \
     --reporter=html,junit
cp -r playwright-report evidencias/PR-06/web/S1_playwright

# ZAP baseline de la web
docker run --rm -v $(pwd)/evidencias/PR-06/web:/zap/wrk ghcr.io/zaproxy/zaproxy:stable \
     zap-baseline.py -t "$QA_WEB" -r S1_zap_web.html -J S1_zap_web.json

# Lighthouse por línea de comandos (opcional; también se puede desde DevTools)
npx lighthouse "$QA_WEB" --preset=desktop --output=html --output-path=evidencias/PR-06/web/S1_lighthouse_login.html
```

- Las páginas con sesión se auditan desde DevTools con la sesión iniciada; Lighthouse por línea de comandos solo llega a la página de inicio de sesión.
- Playwright guarda video y traza de los casos fallidos (`use: { video: 'retain-on-failure', trace: 'retain-on-failure' }`).

## 6. Criterios

| Indicador | Meta | Origen |
|---|---|---|
| Casos ejecutados | 100 % | PR-01 |
| Casos aprobados | ≥ 95 % al cierre de la regresión | PR-01 / MC-01 |
| Lighthouse accesibilidad | ≥ 90 en las páginas principales | MC-01 |
| Alertas altas de ZAP | 0 | PR-02 |
| Defectos críticos o altos abiertos | 0 | PR-01 |

## 7. Registro en el PR-06 y defectos

- Evidencia por caso (reporte de Playwright, video o captura) con el nombre `CP-SIS-xxx_<navegador>` en `evidencias/PR-06/web/`.
- Caso fallido → issue de defecto en GitHub con la plantilla «Defecto» (ficha del PR-07), el ID del caso y el navegador. Si tenía falla esperada, se enlaza al defecto de su corrección.
- Resultados: Tabla 2 (detalle), sección 6 (Lighthouse por pantalla), sección 7 (compatibilidad) y recuadro de DAST del PR-06.

## 8. Responsables y calendario

| Actividad | Fecha | Responsable |
|---|---|---|
| WEB-INF-3 (Playwright y los siete escenarios) | 3 – 14 nov (S7–S8) | Samuel Sierra |
| S1 | 17 – 19 nov | Samuel Sierra · Mariana Cortés |
| S2 (regresión) | 24 – 26 nov | Samuel Sierra |
| Parte web del PR-06 | 21 nov (S1) y 26 nov (S2) | Samuel Sierra · revisa Mariana Cortés |

## 9. Definición de terminado

- [ ] Los 65 casos de sistema de la web ejecutados en los navegadores indicados, con evidencia.
- [ ] Lighthouse y axe en las páginas principales; ZAP baseline guardado.
- [ ] Defectos registrados en GitHub Issues y enlazados a su corrección (`Corrige #<n>`) cuando existe.
- [ ] Parte web del PR-06 diligenciada y revisada.
