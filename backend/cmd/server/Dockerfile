# syntax=docker/dockerfile:1
# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./

RUN go mod download

COPY . .

WORKDIR /app/backend/cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/main .

# Final stage
FROM scratch

COPY --from=builder /app/main .

CMD ["./main"]
