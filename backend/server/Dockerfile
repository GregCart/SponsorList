# Stage 1: Build the application
FROM gradle:jdk21 AS builder

WORKDIR /app

COPY . .

RUN gradle build --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]