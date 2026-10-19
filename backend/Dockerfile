# Multi-stage Dockerfile for StayKart Backend

# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace/backend

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and seed assets
COPY src ./src
COPY seed-images ./seed-images

# Build application package
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Non-root user for security
RUN groupadd -r staykart && useradd -r -g staykart staykart

# Storage and logs directory setup
RUN mkdir -p /app/data/images /app/seed-images && chown -R staykart:staykart /app

COPY --from=builder /workspace/backend/target/staykart-backend-1.0.0.jar /app/app.jar
COPY --from=builder /workspace/backend/seed-images /app/seed-images

USER staykart

EXPOSE 8080

ENV TZ=Asia/Kolkata \
    IMAGE_STORAGE_PATH=/app/data/images \
    SEED_IMAGES_PATH=/app/seed-images

ENTRYPOINT ["java", "-Duser.timezone=Asia/Kolkata", "-jar", "/app/app.jar"]
