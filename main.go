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

	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
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
		shutdownCtx context.Context,
	),
) {
	shutdownCtx, cancelShutdown := context.WithCancel(context.Background())
	defer cancelShutdown()

	ctx, cancelCtx := signal.NotifyContext(shutdownCtx,
		os.Interrupt,
		os.Kill,
	)

	go func() {
		<-ctx.Done()
		log.Printf("Application context canceled. Waiting up to %s for graceful shutdown...\n", timeout)

		timeoutTimer := time.After(timeout)

		select {
		case <-timeoutTimer:
			log.Printf("Graceful shutdown timeout of %s reached. Forcing panic in %s...\n", timeout, panicTimeout)
		case <-shutdownCtx.Done():
		}

		cancelShutdown()

		<-time.After(panicTimeout)
		log.Panicf("Forced panic after timeout of %s", panicTimeout)
	}()

	callback(ctx, cancelCtx, shutdownCtx)
}

func main() {
	dist, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Panicf("failed to create sub fs: %v", err)
	}

	appConfig, err := configuration.Get()
	if err != nil {
		log.Panicf("failed to load app config: %v", err)
	}

	// Inject CLI arguments from configuration
	os.Args = configuration.InjectCLIArgs(os.Args, appConfig)

	// Print debug information if enabled
	if _, err := configuration.DebugPrintIfEnabled(nil); err != nil {
		log.Printf("Warning: failed to print debug info: %v", err)
	}

	// detect "go run" execution or allow explicit override
	isDev := appConfig.Server.ForceDevMode ||
		strings.Contains(os.Args[0], os.TempDir())

	log.Printf("Application is starting (is dev: %v)...\n", isDev)

	inContext(
		10*time.Second,
		10*time.Second,
		func(
			ctx context.Context,
			cancelCtx context.CancelFunc,
			shutdownCtx context.Context,
		) {
			err = backend.Main(ctx, cancelCtx, shutdownCtx, isDev, dist, appConfig)
		})

	if err != nil {
		log.Panicf("Application error: %v", err)
	}

	log.Println("Application stopped gracefully")
}
