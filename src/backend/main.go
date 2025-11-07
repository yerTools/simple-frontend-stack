package backend

import (
	"context"
	"fmt"
	"io/fs"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

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

func newPocketBase(isDev bool, dist fs.FS) *pocketbase.PocketBase {
	app := pocketbase.NewWithConfig(
		pocketbase.Config{
			DefaultDev: isDev,
		},
	)

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the is dev check is to enable it only during development)
		Automigrate: isDev,

		Dir: "pb_data/../src/backend/migrations",
	})

	var fsList FSList
	if isDev {
		fsList = append(fsList, os.DirFS("dist"), os.DirFS("pb_public"), dist)
	} else {
		fsList = append(fsList, dist, os.DirFS("pb_public"))
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(fsList, true))

		return se.Next()
	})

	return app
}

func startAndWait(ctx context.Context, cancelCtx context.CancelFunc, app *pocketbase.PocketBase) error {
	errChan := make(chan error, 1)

	go func() {
		errChan <- app.Start()
		cancelCtx()
		close(errChan)
	}()

	<-ctx.Done()

	terminationErr := app.OnTerminate().Trigger(&core.TerminateEvent{App: app})
	if terminationErr != nil {
		terminationErr = fmt.Errorf("failed to terminate PocketBase: %w", terminationErr)
	}

	pbErr := <-errChan
	if pbErr != nil {
		return fmt.Errorf("failed to start PocketBase: %w", pbErr)
	}
	return terminationErr
}

func Main(
	ctx context.Context,
	cancelCtx context.CancelFunc,
	shutdownCtx context.Context,
	isDev bool,
	dist fs.FS,
) error {
	app := newPocketBase(isDev, dist)

	return startAndWait(ctx, cancelCtx, app)
}
