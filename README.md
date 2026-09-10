# Administrador de tareas en contenedores

Este proyecto presenta una lista de tareas lista para ejecutarse de forma local. La interfaz se sirve con Nginx, el servidor Express resuelve la lógica y MySQL conserva los registros. Docker Compose se encarga de que los tres componentes se inicien en el orden correcto.

## Recorrido de la aplicación

```text
Navegador (8080) → Nginx → API Express (3000) → MySQL 8
```

El navegador trabaja siempre con la ruta `/api`. Nginx recibe esa llamada y la reenvía internamente al backend, sin exponer detalles de la base de datos al cliente.

## Qué se puede hacer

| Acción | Ruta | Resultado |
| --- | --- | --- |
| Revisar disponibilidad | `GET /api/health` | Indica si la API puede consultar MySQL. |
| Ver el tablero | `GET /api/tasks` | Devuelve las tareas ordenadas por su identificador. |
| Registrar una tarea | `POST /api/tasks` | Guarda un título nuevo. |
| Modificar una tarea | `PUT /api/tasks/:id` | Cambia el texto y su estado de terminación. |
| Retirar una tarea | `DELETE /api/tasks/:id` | Elimina el registro seleccionado. |

La base de datos crea `app_db` y la tabla `task` al iniciar por primera vez. También carga algunas tareas iniciales para poder comprobar la interfaz desde el primer arranque.

## Puesta en marcha

Desde la carpeta del proyecto, prepara el archivo de variables y levanta los servicios:

```bash
cp .env.example .env
docker compose up --build
```

Cuando Docker termine, visita [http://localhost:8080](http://localhost:8080). El puerto 3000 queda disponible para revisar la API durante el desarrollo, mientras que MySQL se mantiene dentro de la red de Docker.

## Comprobaciones rápidas

La respuesta de salud permite verificar que los contenedores están conectados:

```bash
curl http://localhost:8080/api/health
docker compose ps
```

El proyecto incluye pruebas de validación del backend y una construcción estática del frontend en el flujo de integración continua.

## Cuidado de los datos locales

`.env` no se versiona y debe contener claves distintas a las de ejemplo si se utiliza fuera de un entorno local. Para detener el conjunto se usa `docker compose down`; añadir `-v` también borra el volumen local de MySQL y sus tareas almacenadas.
