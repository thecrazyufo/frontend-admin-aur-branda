# Runtime stage only using pre-compiled jar from local host build
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache postgresql-client gzip bash
WORKDIR /app
COPY target/backend-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
