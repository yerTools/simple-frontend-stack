package backend

import (
	"bytes"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/tools/router"
	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
)

type FSItem struct {
	fs        fs.FS
	immutable bool
}

type FSCacheItem struct {
	fs      fs.FS
	content []byte
	info    fs.FileInfo
	err     error
}

type FSList struct {
	devMode      bool
	cfg          configuration.AppConfig
	filesystems  []FSItem
	cache        map[string]FSCacheItem
	cacheMutex   sync.RWMutex
	htmlVarMap   map[string]string
	htmlReplacer *strings.Replacer
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
		devMode:      devMode,
		cfg:          cfg,
		filesystems:  fss,
		cache:        make(map[string]FSCacheItem),
		htmlVarMap:   htmlVarMap,
		htmlReplacer: newHTMLReplacer(htmlVarMap),
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
			if item.content != nil {
				return newMemFile(item.content, item.info), nil
			}
			return item.fs.Open(name)
		}
		if f.cfg.Server.IndexFallback && name != router.IndexPage {
			return f.Open(router.IndexPage)
		}
		return nil, item.err
	}

	lastErr := os.ErrNotExist

	for _, fsItem := range f.filesystems {
		file, err := fsItem.fs.Open(name)
		if err != nil {
			lastErr = err
			continue
		}

		if f.shouldApplyHTMLVars(name) {
			content, info, transformErr := f.transformHTMLFile(name, file)
			if transformErr != nil {
				lastErr = transformErr
				continue
			}

			returnContent := content
			if fsItem.immutable {
				f.cacheFS(name, FSCacheItem{content: content, info: info, err: nil})
			}

			return newMemFile(returnContent, info), nil
		}

		if fsItem.immutable {
			f.cacheFS(name, FSCacheItem{fs: fsItem.fs, err: nil})
		}

		return file, nil
	}

	if f.cfg.Server.StaticFileServerImmutable && !f.devMode {
		f.cacheFS(name, FSCacheItem{err: lastErr})
	}

	if f.cfg.Server.IndexFallback && name != router.IndexPage {
		return f.Open(router.IndexPage)
	}

	return nil, lastErr
}

func (f *FSList) shouldApplyHTMLVars(name string) bool {
	if f.htmlReplacer == nil {
		return false
	}
	return filepath.Ext(name) == ".html"
}

func (f *FSList) transformHTMLFile(name string, file fs.File) ([]byte, fs.FileInfo, error) {
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		stat = nil
	}

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, nil, err
	}

	if bytes.IndexByte(data, '%') != -1 {
		transformed := f.htmlReplacer.Replace(string(data))
		data = []byte(transformed)
	}

	info := cloneFileInfo(name, stat, int64(len(data)))
	return data, info, nil
}

func newHTMLReplacer(vars map[string]string) *strings.Replacer {
	if len(vars) == 0 {
		return nil
	}

	pairs := make([]string, 0, len(vars)*2)
	for key, val := range vars {
		if key == "" {
			continue
		}
		pairs = append(pairs, key, val)
	}

	if len(pairs) == 0 {
		return nil
	}

	return strings.NewReplacer(pairs...)
}

func newMemFile(data []byte, info fs.FileInfo) fs.File {
	return &memFile{
		reader: bytes.NewReader(data),
		info:   info,
	}
}

type memFile struct {
	reader *bytes.Reader
	info   fs.FileInfo
}

func (m *memFile) Read(p []byte) (int, error) {
	return m.reader.Read(p)
}

func (m *memFile) Seek(offset int64, whence int) (int64, error) {
	return m.reader.Seek(offset, whence)
}

func (m *memFile) Stat() (fs.FileInfo, error) {
	return m.info, nil
}

func (m *memFile) Close() error {
	return nil
}

type memFileInfo struct {
	name    string
	size    int64
	mode    fs.FileMode
	modTime time.Time
	isDir   bool
}

func (m *memFileInfo) Name() string {
	return m.name
}

func (m *memFileInfo) Size() int64 {
	return m.size
}

func (m *memFileInfo) Mode() fs.FileMode {
	return m.mode
}

func (m *memFileInfo) ModTime() time.Time {
	return m.modTime
}

func (m *memFileInfo) IsDir() bool {
	return m.isDir
}

func (m *memFileInfo) Sys() any {
	return nil
}

func cloneFileInfo(name string, src fs.FileInfo, size int64) fs.FileInfo {
	info := &memFileInfo{
		name:    filepath.Base(name),
		size:    size,
		modTime: time.Now(),
		mode:    0,
		isDir:   false,
	}

	if src != nil {
		info.mode = src.Mode()
		info.modTime = src.ModTime()
		info.isDir = src.IsDir()
	}

	return info
}
