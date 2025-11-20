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
	"github.com/yerTools/simple-frontend-stack/src/backend/api"
	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
)

func newPocketBase(
	isDev bool,
	dist fs.FS,
	cfg configuration.AppConfig,
) (*pocketbase.PocketBase, error) {
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

	var htmlVarMap map[string]string
	var err error

	if cfg.Server.ReplaceHTMLVars {
		htmlVarMap, err = configuration.HTMLMap()
		if err != nil {
			return nil, fmt.Errorf("failed to load HTML variable map: %w", err)
		}
	}

	var fsList FSList
	if isDev {
		fsList = NewFSList(
			isDev,
			cfg,
			htmlVarMap,
			FSItem{fs: os.DirFS("dist")},
			FSItem{fs: os.DirFS("pb_public")},
			FSItem{fs: dist, immutable: true},
		)
	} else {
		fsList = NewFSList(
			isDev,
			cfg,
			htmlVarMap,
			FSItem{fs: dist, immutable: true},
			FSItem{fs: os.DirFS("pb_public")},
		)
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(&fsList, cfg.Server.IndexFallback))

		return se.Next()
	})

	return app, nil
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
	cfg configuration.AppConfig,
) error {
	app, err := newPocketBase(isDev, dist, cfg)
	if err != nil {
		return fmt.Errorf("failed to create PocketBase instance: %w", err)
	}

	api.RegisterUserAPI(app, cfg)

	return startAndWait(ctx, cancelCtx, app)
}
