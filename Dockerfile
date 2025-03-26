FROM --platform=$BUILDPLATFORM oven/bun:latest AS frontend_builder

WORKDIR /app

COPY bun.lock package.json tsconfig.json vite.config.ts ./
COPY src/ ./src/

RUN bun install

RUN bun run frontend:build


FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend_builder

RUN apk add --no-cache \
  unzip \
  ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY main.go .
COPY src/backend/ ./src/backend/
COPY --from=frontend_builder /app/dist/ ./dist/

ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags="-s -w" -o simple_frontend_stack ./main.go


FROM alpine:latest

RUN apk add --no-cache \
  unzip \
  ca-certificates

WORKDIR /app

COPY --from=backend_builder /app/simple_frontend_stack /app/simple_frontend_stack

EXPOSE 8161

CMD ["/app/simple_frontend_stack", "serve", "--http=0.0.0.0:8161"]
