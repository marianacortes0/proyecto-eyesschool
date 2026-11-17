# DEF-WEB-15 · El padre sin hijos vinculados no ve «No hay estudiantes vinculados»; en /asistencia ve un error

| Campo | Valor |
|---|---|
| Componente | Web (vistas de notas, novedades, horario y asistencia del padre) |
| Severidad | **Baja** · prioridad propuesta P4 |
| Estado | **Corregido** el 17/11/2026 · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, al automatizar los casos de sistema (WC-05) |
| Caso que lo detectó | CP-SIS-061 |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Iniciar sesión con un padre sin estudiantes vinculados.
2. Abrir /notas, /asistencia y /novedades.

## Resultado esperado

Mensaje «No hay estudiantes vinculados» (CP-SIS-061).

## Resultado obtenido

Notas, novedades y horario decían «No encontramos un estudiante asociado a tu cuenta.»; /asistencia mostraba «No se pudo cargar la asistencia», como si fallara la API.

## Causa

`MSG_SIN_HIJOS` existía (y una unitaria fijaba su texto) pero ninguna pantalla lo usaba; /asistencia pedía la asistencia de todos con la cuenta del padre y la API lo rechazaba.

## Corrección (17/11/2026)

Las tres vistas muestran «No hay estudiantes vinculados.» seguido de la explicación; /asistencia, sin hijos, no consulta la API y muestra el mismo mensaje.

## Pruebas

E2E CP-SIS-061 (crea un padre sin vínculo por la API y lo borra).
