# Ejercicio Full Stack con Docker

Implementación independiente del ejercicio: frontend estático, API en Express y MySQL, todo coordinado por Docker Compose.

## Servicios

| Servicio | Puerto | Función |
| --- | --- | --- |
| Frontend | 8080 | Interfaz para crear, listar, editar y eliminar usuarios |
| Backend | 3000 | API REST (`GET`, `POST`, `PUT`, `DELETE /api/users`; `/api/health`) |
| MySQL | interno | Persistencia de usuarios |

## Ejecutar en VS Code

1. Abre la carpeta `fullstack-docker` en VS Code.
2. Copia `.env.example` a `.env` y cambia las claves antes de una entrega real.
3. Ejecuta `docker compose up --build`.
4. Abre `http://localhost:8080`.

Para detenerlo: `docker compose down`. Para eliminar también los datos locales: `docker compose down -v`.

## Entregables incluidos

- Backend Express con CORS, variables de entorno, pool MySQL y CRUD completo de usuarios.
- Frontend HTML/CSS/JavaScript conectado a la API por el proxy de Nginx.
- Inicialización de tabla y registros de ejemplo en MySQL.
- Dockerfiles para frontend y backend, y `docker-compose.yml` para los tres servicios.
- Flujo de GitHub Actions que prueba el backend, construye los servicios y verifica la API en cada push y pull request.

## Endpoints adicionales

- `GET /api/users/:id`: consulta un usuario por identificador.
- `GET /api/users/stats`: entrega el total actual de usuarios.
