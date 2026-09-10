# Actividad Full Stack Docker

Aplicación de tareas construida con Astro y React en el frontend, Express en el backend y MySQL como base de datos. Docker Compose inicia los tres servicios y Nginx dirige las llamadas `/api` hacia la API.

## Requisitos incluidos

- `GET /api/health`: confirma la conexión con MySQL.
- `GET /api/tasks`: lista las tareas desde la tabla `task`.
- `POST /api/tasks`: crea una tarea a partir de `{ "title": "..." }`.
- `PUT /api/tasks/:id`: actualiza el título y estado de una tarea.
- `DELETE /api/tasks/:id`: elimina una tarea existente.
- MySQL inicializa `app_db`, la tabla `task` y las tareas de ejemplo solicitadas.
- Frontend Astro/React que consulta y crea tareas mediante la API.
- Dockerfiles multi-etapa, proxy Nginx, healthchecks y flujo de integración continua.

## Ejecutar

1. Abre esta carpeta (`fullstack-docker`) en la terminal.
2. Copia `.env.example` como `.env` y cambia las contraseñas para cualquier uso distinto a desarrollo local.
3. Ejecuta `docker compose up --build`.
4. Abre [http://localhost:8080](http://localhost:8080).

Para detener los servicios usa `docker compose down`. Para eliminar también los datos locales de MySQL usa `docker compose down -v`.

## Puertos

| Servicio | Puerto | Uso |
| --- | --- | --- |
| Frontend | 8080 | Interfaz de tareas y proxy `/api` |
| Backend | 3000 | API Express |
| MySQL | Interno | Persistencia de tareas |

## Variables de entorno

La plantilla `.env.example` documenta las variables que Docker Compose utiliza. El archivo `.env` está ignorado por Git y no debe versionarse.
