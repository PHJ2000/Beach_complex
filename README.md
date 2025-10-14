# Beach Complex Platform

A Spring Boot 3.3 service skeleton targeting JDK 21 that manages beach metadata, facilities, and telemetry snapshots backed by PostGIS and Redis.

## Prerequisites

* Docker & Docker Compose
* JDK 21 (for local development outside containers)
  * If JDK 21 is not already installed, the Gradle toolchain provisioning enabled in [`gradle.properties`](gradle.properties) automatically downloads a matching runtime the first time you run the build.
* Gradle wrapper scripts (the bootstrap JAR downloads automatically on first run)

## Local Setup

1. Build the application JAR:
   ```bash
   ./gradlew clean build
   ```
   The first invocation downloads `gradle-wrapper.jar` from the Gradle GitHub repository, then runs unit tests and creates `build/libs/beach-complex-0.0.1-SNAPSHOT.jar`. See [Verification](#verification).

2. Start infrastructure and the Spring Boot service:
   ```bash
   docker-compose up --build
   ```
   This launches:
   * `postgres` — PostGIS 16 with the `beach_complex` database
   * `redis` — Redis 7 in-memory cache
   * `app` — Spring Boot container built from this repository

3. Access the service endpoints:
   * Swagger UI: `http://localhost:8080/swagger-ui.html`
   * OpenAPI JSON: `http://localhost:8080/api/docs`
   * Actuator health: `http://localhost:8080/actuator/health`
   * Actuator info: `http://localhost:8080/actuator/info`

4. To stop all containers:
   ```bash
   docker-compose down -v
   ```

## Configuration

The application reads the following environment variables (defaults shown):

| Variable | Description | Default |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | JDBC URL for Postgres | `jdbc:postgresql://localhost:5432/beach_complex` |
| `SPRING_DATASOURCE_USERNAME` | Postgres user | `beach` |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password | `beach` |
| `SPRING_REDIS_HOST` | Redis host | `localhost` |
| `SPRING_REDIS_PORT` | Redis port | `6379` |
| `SERVER_PORT` | HTTP port | `8080` |
| `MANAGEMENT_SERVER_PORT` | Actuator management port | `8081` |

Additional cache and telemetry tuning knobs live under the `app.*` section in [`src/main/resources/application.yml`](src/main/resources/application.yml).

## Database Schema

Flyway migrations automatically enable PostGIS extensions and create domain tables for beaches, facilities, and condition snapshots (see [`V1__init.sql`](src/main/resources/db/migration/V1__init.sql)).

## Verification

The project skeleton was validated with:
```bash
./gradlew build
```

This compiles the code, runs checks, and produces the bootable jar.
