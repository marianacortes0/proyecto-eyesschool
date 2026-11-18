# DEF-WEB-09 · El correo de un usuario no se puede editar, y la planeación lo pide

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/components/usuarios/UsuarioModal.tsx`, `updateUsuarioAction`) · **requisito** |
| Severidad | **Baja** · prioridad propuesta P4 |
| Estado | **Nuevo** · **necesita decisión del PO**: corregir la web o la planeación |
| Detectado el | 17/11/2026, al automatizar CP-SIS-023 (WC-05) |
| Caso que lo detectó | CP-SIS-022 («Admin cambia nombre, correo y rol») y CP-SIS-023 («Admin pone el correo de otro usuario») |
| Origen | Pruebas de sistema |
| Evidencia | `e2e/usuarios.spec.ts` › CP-SIS-023: en edición, el campo de correo está deshabilitado con el texto «El documento y el correo no se pueden modificar por seguridad» |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Resultado esperado (planeación de sistema)

CP-SIS-022: el admin cambia nombre, **correo** y rol. CP-SIS-023: si pone el correo de otro usuario, la app avisa y no guarda.

## Resultado obtenido

El formulario de edición muestra el correo deshabilitado y `updateUsuarioAction` no lo envía. La API sí lo permite (`UsuarioUpdate` incluye `correo` y responde 409 si está repetido).

## Por qué no se corrigió sin consultar

Es una decisión explícita de la app («por seguridad»), no un descuido: el correo es el usuario de inicio de sesión. Cambiarla es del PO. Opciones:

1. **Permitir editar el correo** (como pide la planeación): campo editable y `correo` en `updateUsuarioAction`; el 409 ya llega con su motivo desde DEF-WEB-10.
2. **Mantenerlo bloqueado** y ajustar la planeación: CP-SIS-022 sin «correo», CP-SIS-023 «No aplica». Queda «Aceptado con riesgo» con la firma del PO.

Mientras tanto, el E2E de CP-SIS-023 comprueba lo que la app hace hoy (el correo está bloqueado: no se puede poner el de otro usuario), y CP-SIS-022 cubre nombre y rol.
