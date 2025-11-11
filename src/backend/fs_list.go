package backend

import (
	"io/fs"
	"os"
	"sync"

	"github.com/pocketbase/pocketbase/tools/router"
	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
)

type FSItem struct {
	fs        fs.FS
	immutable bool
}

type FSCacheItem struct {
	fs  fs.FS
	err error
}

type FSList struct {
	devMode     bool
	cfg         configuration.AppConfig
	filesystems []FSItem
	cache       map[string]FSCacheItem
	cacheMutex  sync.RWMutex
	htmlVarMap  map[string]string
}

func NewFSList(
	devMode bool,
	cfg configuration.AppConfig,
	htmlVarMap map[string]string,
	fss ...FSItem,
) FSList {
	if cfg.Server.StaticFileServerImmutable && !devMode {
		for i := range fss {
			fss[i].immutable = true
		}
	}

	return FSList{
		devMode:     devMode,
		cfg:         cfg,
		filesystems: fss,
		cache:       make(map[string]FSCacheItem),
		htmlVarMap:  htmlVarMap,
	}
}

func (f *FSList) cached(name string) (FSCacheItem, bool) {
	f.cacheMutex.RLock()
	defer f.cacheMutex.RUnlock()

	cachedFs, ok := f.cache[name]
	return cachedFs, ok
}

func (f *FSList) cacheFS(name string, item FSCacheItem) {
	f.cacheMutex.Lock()
	defer f.cacheMutex.Unlock()

	f.cache[name] = item
}

func (f *FSList) Open(name string) (fs.File, error) {
	item, ok := f.cached(name)
	if ok {
		if item.err == nil {
			return item.fs.Open(name)
		}
		if f.cfg.Server.IndexFallback && name != router.IndexPage {
			return f.Open(router.IndexPage)
		}
		return nil, item.err
	}

	lastErr := os.ErrNotExist

	for _, fs := range f.filesystems {
		file, err := fs.fs.Open(name)
		if err == nil {
			if fs.immutable {
				f.cacheFS(name, FSCacheItem{fs: fs.fs, err: nil})
			}
			return file, nil
		}
		lastErr = err
	}

	if f.cfg.Server.StaticFileServerImmutable && !f.devMode {
		f.cacheFS(name, FSCacheItem{fs: nil, err: lastErr})
	}

	if f.cfg.Server.IndexFallback && name != router.IndexPage {
		return f.Open(router.IndexPage)
	}

	return nil, lastErr
}
