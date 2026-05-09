# Build stage
FROM denoland/deno:latest as builder

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Cache dependencies
RUN deno cache main.ts

# Runtime stage
FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder /app /app
COPY --from=builder /deno-dir /deno-dir

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the server
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "main.ts"]
