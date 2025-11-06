package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/yerTools/simple-frontend-stack/src/backend"

	_ "github.com/yerTools/simple-frontend-stack/src/backend/migrations" // Import migrations for side effects
)

//go:embed dist
var dist embed.FS

func inContext(
	timeout time.Duration,
	panicTimeout time.Duration,
	callback func(
		ctx context.Context,
		cancelCtx context.CancelFunc,
		killCtx context.Context,
	),
) {
	killCtx, cancelKill := context.WithCancel(context.Background())
	defer cancelKill()

	ctx, cancelCtx := signal.NotifyContext(killCtx,
		os.Interrupt,
		os.Kill,
	)

	go func() {
		<-ctx.Done()

		timeoutTimer := time.After(timeout)

		select {
		case <-timeoutTimer:
		case <-killCtx.Done():
		}

		cancelKill()

		<-time.After(panicTimeout)
		log.Panicf("forced panic after timeout of %s", panicTimeout)
	}()

	callback(ctx, cancelCtx, killCtx)
}

func main() {
	dist, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Panicf("failed to create sub fs: %v", err)
	}

	// detect "go run" execution or allow explicit override
	isGoRun := os.Getenv("FORCE_GO_RUN") == "1" ||
		strings.Contains(os.Args[0], os.TempDir())

	log.Printf("Application is starting (is go run: %v)...\n", isGoRun)

	inContext(
		10*time.Second,
		10*time.Second,
		func(
			ctx context.Context,
			cancelCtx context.CancelFunc,
			killCtx context.Context,
		) {
			err = backend.Main(ctx, cancelCtx, killCtx, isGoRun, dist)
		})

	if err != nil {
		log.Panicf("Application error: %v", err)
	}

	log.Println("Application stopped gracefully")
}
