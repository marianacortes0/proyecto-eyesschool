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
| `reporte-html/` | Reporte HTML de la última corrida. **No se versiona** (`.gitignore`) porque sus trazas guardan lo que se escribe en el campo de contraseña |

## Resultado (E7, con E8 y E9 para los casos repetidos)

48 ejecuciones: **35 APROBADO · 0 FALLA · 6 BLOQUEADO · 7 INESTABLE**. Antes de las correcciones (E4) eran 22 APROBADO y 14 FALLA (DEF-WEB-02, 03 y 04). Detalle caso por caso en `../../INFORME-WEB-para-QA.md`, sección 5.3.

## Cómo repetirlo

```powershell
# Desde C:\ con la C en mayúscula: si la carpeta abre como c:\…, Vitest falla al cargar.
npm run qa:datos          # llena E2E_ESTUDIANTE_VINCULADO_ID y _NOMBRE en .env.test.local
npx playwright test       # Chromium y Firefox, en serie (workers: 1); 36–55 min
```

`usuarios`, `registro-masivo` y `registro-padre` **escriben en la base de QA** y borran lo que crean. Si una prueba se corta a mitad, puede dejar una cuenta `docente.e2e.<n>@example.com` o `padre.e2e.<n>@example.com`: hay que borrarla.

Después de cada corrida, borra `test-results/` y `reporte-html/`: las trazas contienen la clave.
