# Beach Complex Platform

A Spring Boot 3.3 service skeleton targeting JDK 21 that manages beach metadata, facilities, and telemetry snapshots backed by PostGIS and Redis.

## Prerequisites

* Docker & Docker Compose
* JDK 21 (for local development outside containers)

* Gradle wrapper scripts (the bootstrap JAR downloads automatically on first run)

## Quickstart

To spin up both the backend and the web client locally:

1. Install Node.js 18+ (for the frontend) and ensure Docker, Docker Compose, and JDK 21 are available as noted below.
2. In one terminal, start the Spring Boot stack with Docker Compose as described in [Local Setup](#local-setup).
   * The compose file provisions all runtime dependencies (PostGIS and Redis) alongside the application container, so no extra services need to be installed manually.
3. In another terminal, change into [`front/`](front/) and run `npm install` followed by `npm run dev` to launch the Vite development server on port 5173.
   * Running the frontend this way gives you hot module reload and faster feedback while coding; the Docker Compose stack only
     builds and runs the backend and its databases.

The following sections provide additional detail for each layer.

## Data Flow Overview

The React frontend does not embed static beach telemetry. Components such as
[`BeachDetailView`](front/src/components/BeachDetailView.tsx) call
[`fetchRecentConditions`](front/src/api/conditions.ts) to hit the Spring Boot
API (`/api/beaches/{beachId}/conditions/recent`). That controller delegates to
[`BeachConditionService`](src/main/java/com/beachcheck/service/BeachConditionService.java),
which in turn loads the latest rows from the `beach_conditions` table via the
[`BeachConditionRepository`](src/main/java/com/beachcheck/repository/BeachConditionRepository.java).
Because the repository is a Spring Data JPA adapter backed by PostGIS, running
the Docker Compose stack is required to provide the database records the UI
renders.

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
   * The frontend is not bundled into the compose stack, so continue using `npm run dev` (described above) for local UI work.

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

### Wireframe & Test Case Validation

Follow the steps below to confirm the shipped UI matches the shared wireframe and that the
main product scenarios behave as expected:

1. Start the backend stack with `docker-compose up --build` so the API and databases are
   available.
2. In a second terminal, run the frontend from [`front/`](front/) with `npm install` (first
   run only) and `npm run dev`. The Vite dev server exposes the app on
   [`http://localhost:5173`](http://localhost:5173).
3. Open the Figma wireframe referenced in [`front/README.md`](front/README.md) and keep it
   side-by-side with the running application. Inspect the following areas for visual parity:
   * 상단 해수욕장 정보 카드(아이콘, 혼잡도 배지, 최신 관측 정보)
   * 하단 시트의 탭 구성(홈, 통계, 시설 등)과 개별 섹션의 타이포그래피/간격
   * 지도의 확대/축소, 즐겨찾기 토글과 같은 인터랙션 요소
4. Execute the primary user flows and note whether each passes or fails the expected result:
   * **해수욕장 전환** — 지도 마커 또는 드롭다운을 이용해 다른 해수욕장을 선택했을 때 상세 카드, 그래프, 최신 관측 데이터가 해당 해수욕장으로 즉시 갱신되는지 확인합니다.
   * **날짜 변경** — 달력 팝오버에서 날짜를 이동하면 월별 히트맵과 시간대별 혼잡도 그래프가 선택한 날짜에 맞게 업데이트되는지 확인합니다.
   * **기상 정보 모달** — 상단의 날씨 버튼을 눌렀을 때 모달이 열리고, API에서 받아온 온도·파고가 정상적으로 노출되는지 확인합니다.
   * **즐겨찾기** — 하트 아이콘을 눌러 즐겨찾기 상태를 토글하면 즉시 UI에 반영되고, 다른 화면으로 이동 후에도 유지되는지 확인합니다.
5. Record the outcome of each scenario alongside 스크린샷이나 메모를 남겨 QA 로그를 유지합니다.

Automated unit and integration tests can be re-run at any time with `./gradlew build`. The
frontend currently ships without a dedicated test runner, so the manual checklist above
covers the acceptance criteria tied to the wireframe.
