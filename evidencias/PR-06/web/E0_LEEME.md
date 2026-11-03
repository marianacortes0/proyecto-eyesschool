# PR-06 · estado al 03/11/2026

`E0_listado-specs.xml` **no es una corrida**: es la salida de
`npx playwright test --list`, que confirma que los 7 specs compilan y enumeran
48 casos (Chromium y Firefox). Todos figuran como «skipped» porque no hay
entorno: la web de QA responde 404 (sin despliegue) y la API de QA devuelve 500
en toda ruta que consulta la base (`../../PR-05/web/I1_preflight-qa.txt`).

Los navegadores ya están instalados (`npx playwright install chromium firefox`).
Cuando el entorno esté en pie, la corrida real reemplaza este archivo con
`reporte-html/` y su propio junit.
