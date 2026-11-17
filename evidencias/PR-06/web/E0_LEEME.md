# PR-06 · evidencias E2E (estado al 11/11/2026, tras corregir DEF-WEB-02, 03 y 04)

| Archivo | Qué es |
|---|---|
| `E0_listado-specs.xml` | Salida de `playwright test --list` del 02/11: **no es una corrida**. Enumera los 48 casos (24 por navegador) |
| `E1_humo-login.xml` | 03/11 · humo de `login-roles` en Chromium, bloqueado por DEF-WEB-01 (histórico) |
| `E2_guardia-rutas.xml` | 05/11 · guardia de rutas, aprobado en Chromium y Firefox (histórico) |
| `E3_e2e-consola.txt` | 10/11 · primera corrida completa con la base de QA en pie. Sirvió para descubrir los defectos DEF-WEB-02 a 05 y los de las propias pruebas (D-WEB-17). **Solo la consola**: su JUnit se sobrescribió por error con un `--list` |
| `E4_e2e.xml` · `E4_e2e-consola.txt` | 11/11 · corrida completa **antes** de corregir la app (14 fallos), sobre `360b599` |
| `E5_reintento.xml` · `E5_reintento-consola.txt` | 11/11 · repetición de los casos que cambiaron de resultado entre E3 y E4 |
| `E6_registro-padre.xml` · `E6_registro-padre-consola.txt` | 11/11 · `registro-padre` con el oráculo del aviso, sobre `c3e491f` |
| `E7_e2e.xml` · `E7_e2e-consola.txt` | 11/11 · **corrida de referencia** con DEF-WEB-02, 03 y 04 corregidos, 48 casos sobre `e886144` |
| `E8_reintento.xml` · `E8_reintento-consola.txt` | 11/11 · repetición de los 8 fallos de E7 (1 oráculo, 7 tiempos de Firefox) |
| `E9_inactividad.xml` · `E9_inactividad-consola.txt` | 11/11 · cierre por inactividad y acceso vencido con la espera de 20 s |
| `E10_sesion-a-escala.xml` | 11/11 · CP-SIS-065 a escala (`SESSION_IDLE_MINUTES=1`), 4 de 4 |
| `E11_e2e.xml` | 11/11 · completa sin los casos a escala: 3 fallos (registro masivo e inactividad) |
| `E12_reintento.xml` · `E13_reintento.xml` | 11/11 · repeticiones de esos dos casos; siguen fallando a veces (causas en D-WEB-19) |
| `E14_sincronizacion.xml` · `E14_sincronizacion-consola.txt` | 16/11 · inactividad y registro masivo ×3 en los dos navegadores tras sincronizar con eventos (`a9383e1`): inactividad 6/6; registro masivo 0/6 por el curso «Sexto A» inactivo en QA |
| `E15_registro-masivo-consola.txt` | 16/11 · registro masivo con «Séptimo A», ×3 en los dos navegadores: 6/6. **Solo consola**: corrió con `--reporter=list`, que no escribe JUnit |
| `E16_e2e.xml` · `E16_e2e-consola.txt` | 17/11 · **completa con los casos a escala** (48), sobre `74bcf7e`: 44 pasan, 4 fallan (orden de los hijos, menú leído antes de tiempo, `NS_ERROR_ABORT`) |
| `E17_e2e.xml` · `E17_e2e-consola.txt` | 17/11 · completa (50, con el E2E nuevo de DEF-WEB-05), sobre `48d3b1c`: 47 pasan, 3 fallan (2 de DEF-WEB-07 y la URL de la sesión a escala) |
| `E18_reintento-consola.txt` | 17/11 · repetición ×2 de los 3 fallos de E17, sobre `48d3b1c` + la sesión a escala con `waitForURL`: 19/20 (el fallo, DEF-WEB-07). **Solo consola** (`--reporter=list`) |
| `E19_e2e.xml` · `E19_e2e-consola.txt` · `E19_netlify-pausado.txt` | 17/11 05:10–05:54 UTC · completa sobre `2cb81d2` contra el deploy preview: **2 pasan y 48 fallan porque Netlify pausó el sitio** por límite de uso a partir del tercer caso (503 `usage_exceeded`). **No mide la app** |
| `E20_e2e-local.xml` · `E20_e2e-local-consola.txt` | 17/11 06:00–06:28 UTC · completa sobre `2cb81d2` contra **`next start` local** (build de producción con la API de QA y `SESSION_IDLE_MINUTES=1`): 49/50; el fallo, una carrera de la prueba de usuarios |
| `E21_usuarios-local.xml` · `E21_usuarios-local-consola.txt` | 17/11 · CRUD de usuarios ×3 en los dos navegadores con la espera de la recarga: 6/6 |
| `E22_e2e-local.xml` · `E22_e2e-local-consola.txt` | 17/11 · **corrida de cierre** completa, local, sobre `5c7dc8b` (la app igual que `2cb81d2`; solo cambia `e2e/usuarios.spec.ts`): **50/50**, sin reintentos |
| `reporte-html/` | Reporte HTML de la última corrida. **No se versiona** (`.gitignore`) porque sus trazas guardan lo que se escribe en el campo de contraseña |

## Resultado vigente (E22, 17/11/2026)

50 ejecuciones (25 casos × Chromium y Firefox): **50 APROBADO · 0 FALLA · 0 BLOQUEADO · 0 INESTABLE**, contra el build de producción local con la API de QA. **No es Netlify**: el sitio de QA quedó pausado por límite de uso durante E19; falta repetir la corrida completa allí. Detalle en `../../INFORME-WEB-para-QA.md`, secciones 0 y 5.6.

Para repetir E22 en local: `next build` con `NEXT_PUBLIC_API_URL` = la API de QA, `SESSION_IDLE_MINUTES=1 next start -p 3100` y `E2E_BASE_URL=http://localhost:3100 E2E_SESSION_IDLE_MINUTES=1 npx playwright test`. **No pases `--reporter`**: reemplaza los de la configuración y no se escribe el JUnit (pasó en E15 y E18).

## Resultado histórico (E7, con E8 y E9 para los casos repetidos)

48 ejecuciones: **35 APROBADO · 0 FALLA · 6 BLOQUEADO · 7 INESTABLE**. Antes de las correcciones (E4) eran 22 APROBADO y 14 FALLA (DEF-WEB-02, 03 y 04). Detalle caso por caso en `../../INFORME-WEB-para-QA.md`, sección 5.3.

## Cómo repetirlo

```powershell
# Desde C:\ con la C en mayúscula: si la carpeta abre como c:\…, Vitest falla al cargar.
npm run qa:datos          # llena E2E_ESTUDIANTE_VINCULADO_ID y _NOMBRE en .env.test.local
npx playwright test       # Chromium y Firefox, en serie (workers: 1); 36–55 min
```

`usuarios`, `registro-masivo` y `registro-padre` **escriben en la base de QA** y borran lo que crean. Si una prueba se corta a mitad, puede dejar una cuenta `docente.e2e.<n>@example.com` o `padre.e2e.<n>@example.com`: hay que borrarla.

Después de cada corrida, borra `test-results/` y `reporte-html/`: las trazas contienen la clave.
