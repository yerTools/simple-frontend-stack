# Change me

**You can configure this app within [`app.config.jsonc`](./config/app.config.jsonc).**

## Delete

- [`CHANGE_ME.md`](./CHANGE_ME.md)
- [`README.md`](./README.md)
- [`index.tsx`](./src/index.tsx)

## Rename

- [`package.json`](./package.json)
  - `"name": "simple-frontend-stack",`
  - `"version": "0.0.0",`
  - `"description": "",`
- [`LICENSE.md`](./LICENSE.md)
  - `Copyright (c) 2025 Felix Mayer`
- [`go.mod`](./go.mod)
  - `module github.com/yerTools/simple-frontend-stack`
- [`Dockerfile`](./Dockerfile)
  - `RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags="-s -w" -o simple_frontend_stack ./main.go`
  - `LABEL org.opencontainers.image.source=https://github.com/yerTools/simple-frontend-stack`
  - `LABEL org.opencontainers.image.description="A lightweight frontend stack for rapid web app development powered by SolidJS, TailwindCSS, and DaisyUI. Includes optional PocketBase backend with Bun and Vite for blazing-fast development workflow."`
  - `COPY --from=backend_builder /app/simple_frontend_stack /app/simple_frontend_stack`
  - `RUN chmod +x /app/simple_frontend_stack`
  - `CMD ["/app/simple_frontend_stack", "serve", "--http=0.0.0.0:8161"]`
- [`.gitignore`](./.gitignore)
  - `/simple-frontend-stack`
  - `/simple-frontend-stack.exe`
- [`cicd.yml`](./.github/workflows/cicd.yml)
  - `simple-frontend-stack`
  - `tags: ghcr.io/yertools/simple-frontend-stack:${{ steps.version.outputs.TAG }}`
  - `BIN_NAME=simple-frontend-stack_${{ matrix.os }}_${{ matrix.arch }}`
  - `path: build/simple-frontend-stack_${{ matrix.os }}_${{ matrix.arch }}*`
  - `find release-artifacts -type f -name "simple-frontend-stack_*" | while read file; do`
