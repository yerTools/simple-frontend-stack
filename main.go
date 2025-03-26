package main

import (
	"embed"
	"io/fs"
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed dist
var dist embed.FS

func main() {
	dist, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Panicf("failed to create sub fs: %v", err)
	}

	app := pocketbase.New()

	var fsList FSList
	if app.IsDev() {
		fsList = append(fsList, os.DirFS("dist"), os.DirFS("pb_public"), dist)
	} else {
		fsList = append(fsList, dist, os.DirFS("pb_public"))
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(fsList, true))

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type FSList []fs.FS

func (f FSList) Open(name string) (fs.File, error) {
	for _, fs := range f {
		file, err := fs.Open(name)
		if err == nil {
			return file, nil
		}
	}
	return nil, os.ErrNotExist
}
