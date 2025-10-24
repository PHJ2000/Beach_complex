# ✅ build 단계: 확실한 JDK 이미지 사용
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

# gradle wrapper와 설정
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle

# 소스
COPY src src

# 빌드
RUN ./gradlew clean bootJar --no-daemon -x test

# ✅ run 단계: JRE로 가볍게
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
