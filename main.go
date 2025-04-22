package main

import (
	"embed"
	"io/fs"
	"log"
	"os"
	"strings"

	"github.com/yerTools/simple-frontend-stack/src/backend"

	_ "github.com/yerTools/simple-frontend-stack/src/backend/migrations" // Import migrations for side effects
)

//go:embed dist
var dist embed.FS

func main() {
	dist, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Panicf("failed to create sub fs: %v", err)
	}

	// detect "go run" execution or allow explicit override
	isGoRun := os.Getenv("FORCE_GO_RUN") == "1" ||
		strings.Contains(os.Args[0], os.TempDir())

	backend.Main(isGoRun, dist)
}
