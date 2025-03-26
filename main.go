package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/yerTools/simple-frontend-stack/src/backend"
)

//go:embed dist
var dist embed.FS

func main() {
	dist, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Panicf("failed to create sub fs: %v", err)
	}

	backend.Main(dist)
}
