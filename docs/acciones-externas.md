# Acciones fuera del repositorio

> Las hace el equipo; el asistente no las puede hacer. Marcar la casilla y poner la fecha cuando se cumplan. No pegar contraseñas ni tokens en este archivo.

| ✔ | # | Acción | Responsable sugerido | Fecha límite | Hecho el |
|---|---|---|---|---|---|
| ☐ | 1 | Supabase ya no se usa (el código se borró en WEB-08). Confirmar que el proyecto de Supabase esté eliminado o pausado, para que la clave `service_role` que quedó en el historial no sirva | Andrés Acero | Una vez | |
| ☐ | 3 | Crear `SONAR_TOKEN` en GitHub Secrets e importar el proyecto en SonarQube Cloud (`sonar.projectKey` en `sonar-project.properties`) | Samuel Sierra | Esta semana | |
| ☐ | 4 | La web de producción está en **Vercel** (https://proyecto-eyesschool.vercel.app). La Web App de Azure `EyesSchool` es un despliegue viejo: revisar en *Metrics* que no recibe tráfico real y detenerla. Si recibe tráfico real, restaurar `.github/workflows/main_eyesschool.yml` (`git restore`) y anotarlo en `docs/decisiones-qa.md` (D-WEB-08) | Andrés Acero | Esta semana | |
| ☐ | 5 | Variables en Vercel (producción): quitar las de Supabase y cualquier `NEXT_PUBLIC_*` con secretos; dejar `NEXT_PUBLIC_API_URL` (API de producción) | Andrés Acero | Antes de fusionar | |
| ☐ | 5b | Variables en Netlify (QA): `NEXT_PUBLIC_API_URL` = API de QA con `/api/v1` y `NODE_VERSION=20`. Nunca la API de producción. Opcional para CP-SIS-065: `SESSION_IDLE_MINUTES=1` | Mariana Cortés | Mañana (03/11) | |
| ☐ | 6 | Terminar QA: base Postgres de QA con los tres SQL del seed; en `apieyeschool-q`: `DATABASE_URL` y `SECRET_KEY` nuevas, `ENVIRONMENT=qa`, `CORS_ORIGINS=https://qaeyesschool.netlify.app` y Startup Command; arreglar el login del workflow (rol en IAM o publish profile); probar `/api/v1/cursos` | Mariana Cortés | **Mañana (03/11): bloquea PR-05 y PR-06** | |
| ☐ | 7 | Entregar `QA_PASSWORD` por canal privado a quien corre E2E | Samuel Sierra | Con la URL | |
| ☐ | 8 | Crear en Azure Boards la tarea «Quitar respaldo de /padres/me (WEB-03)» (se quita cuando `/padres/me/hijos` exista en producción) | Mariana Cortés | Esta semana | |
| ☐ | 9 | Fusionar y desplegar BE-07 en la API (WEB-03 con varios hijos); entonces poner `E2E_BE07=true`. Igual con BE-08 (`E2E_BE08=true`) | Equipo backend | Antes del PR-06 | |
