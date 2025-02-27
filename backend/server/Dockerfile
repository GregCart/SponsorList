# Stage 1: Build the application
FROM gradle:jdk21 AS builder

WORKDIR /app

COPY . .
#COPY ./gradle ./gradle
#COPY ./src/main ./src/main
#COPY ./build.gradle.kts ./build.gradle.kts
#COPY ./Dockerfile ./Dockerfile
#COPY ./gradle.properties ./gradle.properties
#COPY ./gradlew ./gradlew
#COPY ./gradlew.bat ./gradlew.bat
#COPY ./README.md ./README.md
#COPY ./settings.gradle.kts ./settings.gradle.kts

RUN gradle build --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]