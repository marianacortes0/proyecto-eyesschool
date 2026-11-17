# DEF-WEB-10 · Los errores de las Server Actions llegan al usuario como «Minified React error #441»

| Campo | Valor |
|---|---|
| Componente | **Web**, transversal (todas las pantallas que muestran el mensaje de un error de una Server Action) |
| Severidad | **Media** · prioridad propuesta P2 (afecta a todos los avisos de error en producción) |
| Estado | **Corregido** el 17/11/2026 · verificado con los E2E de CP-SIS-020, 026 y 028 contra el build de producción local |
| Detectado el | 17/11/2026, al automatizar CP-SIS-028 (lista de usuarios con la API caída) y revisar CP-SIS-020 |
| Caso que lo detectó | CP-SIS-020, CP-SIS-028 · `e2e/usuarios.spec.ts` |
| Origen | Pruebas de sistema |
| Evidencia | Aviso real al crear un usuario con un correo repetido: «❌ Minified React error #441; visit https://react.dev/errors/441 for the full message…». En la lista con la API caída, el mismo texto y «0 usuarios registrados · Sin pendientes · No se encontraron usuarios» |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. En un build de producción (Netlify, Vercel o `next start`), entrar como admin a `/usuarios`.
2. Crear un usuario con el correo de otro que ya existe.

## Resultado esperado

CP-SIS-020: «Mensaje de error; no se guarda». El mensaje debe servirle al admin («El correo ya está registrado»).

## Resultado obtenido

La cuenta no se crea (bien), pero el aviso dice «❌ Minified React error #441; visit https://react.dev/errors/441…». Con la API caída, `/usuarios` además afirmaba «0 usuarios registrados» y «Sin pendientes», y no ofrecía reintentar.

## Causa

En producción, React no envía al navegador el mensaje de un error lanzado dentro de una Server Action: lo reemplaza por el error #441. La app mostraba `err.message` en 24 sitios (hooks y modales). En desarrollo (`next dev`) el mensaje sí llega, por eso no se vio antes; las unitarias simulan las acciones y tampoco lo ven.

Una prueba E2E mía también lo dejó pasar al principio: esperaba `/…|error/i` y el texto técnico coincide con «error». Los oráculos se cambiaron para exigir el mensaje concreto y se agregó `sinTextoTecnico()` en `e2e/qa.ts`.

## Corrección (17/11/2026)

1. **`getErrorMessage`** (`src/lib/errors.ts`): nunca devuelve un mensaje enmascarado o técnico (#441, «Server Components render», «fetch failed», «Failed to fetch»…); en su lugar, el mensaje de la pantalla. Los 24 sitios que mostraban `err.message` pasan a usarlo.
2. **Crear y editar usuario** devuelven el motivo de la API como valor (`{ error }`) ante un 4xx, porque un valor sí llega en producción. La `apiFetch` de esas acciones lanza `ApiError` con el motivo limpio; método y ruta quedan en el log del servidor.
3. **Lista de usuarios con error:** aviso con «Reintentar», «— usuarios registrados» y sin «Sin pendientes» ni «No se encontraron usuarios».
4. Mensajes de la pantalla más útiles: «No fue posible eliminar el usuario. Intenta de nuevo.», «No se pudo cargar la lista de usuarios. Revisa tu conexión e intenta de nuevo.».

## Lo que no cubre

Las demás Server Actions (notas, novedades, reportes, asistencia, horarios, perfil) siguen lanzando: ya no muestran texto técnico, pero muestran el mensaje genérico de su pantalla, no el motivo de la API. Llevarles el motivo exige que devuelvan el error como valor, igual que crear y editar usuario.

## Pruebas

| Prueba | Antes | Después |
|---|---|---|
| `tests/errors.test.ts` (4 casos; escritos antes del cambio de `getErrorMessage`) | — | Pasa |
| `tests/usuariosActions.test.ts`: 409 y 422 devuelven el motivo; 5xx se lanza; sin error devuelve `{}` (5 casos) | 4 fallan | Pasa |
| E2E CP-SIS-020: «El correo ya está registrado» y ningún texto técnico | Pasaba por un oráculo flojo | Pasa con el oráculo estricto |
| E2E CP-SIS-026 y 028 con la API caída | Fallaba (028) | Pasa |
