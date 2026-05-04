# ===========================
# Stage 1 — Dependencies
# ===========================
FROM node:18-alpine AS deps

RUN apk add --no-cache \
    bash \
    wget \
    curl

WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and PM2 globally //
RUN npm install -g pnpm pm2 && \
    pnpm install --frozen-lockfile

# ===========================
# Stage 2 — Build Stage
# ===========================
FROM deps AS builder

COPY . .

# Disable Next.js target cache for fully immutable build
ENV NEXT_DISABLE_TARGET_CACHE=true

# Build-time frontend env args (non-sensitive)
ARG NEXT_PUBLIC_ENV_NAME
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WEBSOCKET_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_HUBSPOT_PORTAL_ID
ARG NEXT_PUBLIC_CACHE_MAX_AGE
ARG NEXT_PUBLIC_PROFILE_COMPLETION_THRESHOLD
ARG NEXT_PUBLIC_INTERNET_SPEED_THRESHOLD
ARG NEXT_PUBLIC_VIDEO_CHUNK_INTERVAL
ARG NEXT_PUBLIC_VIDEO_WIDTH
ARG NEXT_PUBLIC_VIDEO_HEIGHT
ARG NEXT_PUBLIC_VIDEO_FRAME_RATE
ARG NEXT_PUBLIC_ASSESSMENT_TIME_WARNING_THRESHOLD
ARG NEXT_PUBLIC_ASSESSMENT_HEARTBEAT_INTERVAL
ARG NEXT_PUBLIC_MIN_TEXT_ANSWER_LENGTH

# Build Next.js standalone output
RUN pnpm build

# ===========================
# Stage 3 — Production Runtime
# ===========================
FROM node:18-alpine AS runner

WORKDIR /app

# Install PM2 globally in the final stage
RUN npm install -g pm2

# Install wget and curl for health checks
RUN apk add --no-cache wget curl

# Install FFmpeg and wget for healthcheck
RUN apk add --no-cache \
    gcc \
    g++ \
    make \
    libffi-dev \
    musl-dev \
    geos-dev \
    python3-dev \
    ffmpeg \
    dos2unix  # For converting Windows-style line endings to Unix

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Copy fully built standalone application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Copy PM2 ecosystem files and startup scripts
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/ecosystem.k8s.config.js ./
COPY --from=builder /app/start.sh ./
COPY --from=builder /app/start-k8s.sh ./

# Convert line endings and set proper permissions
RUN dos2unix start.sh start-k8s.sh && \
    chmod +x start.sh start-k8s.sh

# Create logs and PM2 directories and set permissions
RUN mkdir -p logs .pm2 && \
    chown -R appuser:appuser logs .pm2 && \
    chown -R appuser:appuser . && \
    chmod +x start.sh start-k8s.sh

# Expose port
EXPOSE 3000

# Healthcheck with better configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Non-root user enforced
USER appuser

# Start with PM2 using the startup script
CMD ["sh", "./start-k8s.sh"]
