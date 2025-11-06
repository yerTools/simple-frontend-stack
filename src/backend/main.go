package backend

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"syscall"

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

func newPocketBase(isGoRun bool, dist fs.FS) *pocketbase.PocketBase {
	app := pocketbase.NewWithConfig(
		pocketbase.Config{
			DefaultDev: isGoRun,
		},
	)

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,

		Dir: "pb_data/../src/backend/migrations",
	})

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

	return app
}

func startAndWait(ctx context.Context, cancelCtx context.CancelFunc, app *pocketbase.PocketBase) error {
	errChan := make(chan error, 1)

	go func() {
		if err := app.Start(); err != nil {
			errChan <- err
		}
		cancelCtx()
		close(errChan)
	}()

	<-ctx.Done()

	killErr := syscall.Kill(syscall.Getpid(), syscall.SIGINT)
	if killErr != nil {
		return fmt.Errorf("failed to send interrupt signal to PocketBase: %w", killErr)
	}

	pbErr, ok := <-errChan
	if ok {
		return fmt.Errorf("failed to start PocketBase: %w", pbErr)
	}
	return killErr
}

func Main(
	ctx context.Context,
	cancelCtx context.CancelFunc,
	killCtx context.Context,
	isGoRun bool,
	dist fs.FS,
) error {
	app := newPocketBase(isGoRun, dist)

	return startAndWait(ctx, cancelCtx, app)
}
