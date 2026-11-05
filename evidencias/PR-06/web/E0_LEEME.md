# PR-06 · estado al 03/11/2026

| Archivo | Qué es |
|---|---|
| `E0_listado-specs.xml` | Salida de `npx playwright test --list`: **no es una corrida**. Confirma que los 7 specs compilan y enumeran 48 casos (Chromium y Firefox) |
| `E1_humo-login.xml` | Corrida real de humo: `e2e/login-roles.spec.ts` en Chromium, 8 casos, los 8 **bloqueados** por DEF-WEB-01 |
| `reporte-html/` | Reporte HTML de la corrida de humo (no se versiona: está en `.gitignore`) |

## Qué dice el humo

El navegador llega al deploy preview, abre el modal de inicio de sesión, llena el formulario y envía. La web se queda en `/?login=1` porque `POST /api/v1/auth/login` responde **500**: la API de QA no puede consultar su base (`../../../docs/defectos/DEF-WEB-01.md`).

Es decir: el despliegue, los selectores y el manejo de error de la web funcionan; lo que falta es el backend.

## Qué falta

Los 48 casos en Chromium y Firefox no se corrieron: fallarían todos por la misma causa, y `registro-masivo` y `registro-padre` necesitan escribir en la base. Los navegadores ya están instalados y `.env.test.local` está completo, así que en cuanto el login devuelva 200 basta con:

```powershell
npm run qa:datos          # llena E2E_ESTUDIANTE_VINCULADO_ID y _NOMBRE
npx playwright test --project=chromium --project=firefox
```

`padre-dos-hijos` seguirá como falla esperada mientras `E2E_BE07` esté vacío (BE-07 no está en QA), y CP-SIS-065 sigue bloqueado hasta confirmar `SESSION_IDLE_MINUTES=1` en el contexto *Deploy Previews* de Netlify.
