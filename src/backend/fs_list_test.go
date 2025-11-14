package backend

import (
	"errors"
	"io"
	"io/fs"
	"testing"
	"testing/fstest"

	"github.com/pocketbase/pocketbase/tools/router"
	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
)

type countingFS struct {
	fs    fs.FS
	opens *int
}

func (c *countingFS) Open(name string) (fs.File, error) {
	if c.opens != nil {
		*c.opens = *c.opens + 1
	}
	return c.fs.Open(name)
}

func TestFSListHTMLReplacementAndImmutableCache(t *testing.T) {
	htmlVars := map[string]string{"%APP_CONFIG_GENERAL_NAME%": "MyApp"}
	cfg := configuration.AppConfig{Server: configuration.ServerConfig{StaticFileServerImmutable: true}}
	counter := 0
	baseFS := fstest.MapFS{
		"index.html": &fstest.MapFile{Data: []byte("<title>%APP_CONFIG_GENERAL_NAME%</title>")},
	}

	fsList := NewFSList(false, cfg, htmlVars, FSItem{fs: &countingFS{fs: baseFS, opens: &counter}})
	file1, err := fsList.Open("index.html")
	if err != nil {
		t.Fatalf("unexpected error on first open: %v", err)
	}
	defer file1.Close()

	data1, err := io.ReadAll(file1)
	if err != nil {
		t.Fatalf("read first open: %v", err)
	}

	expected := "<title>MyApp</title>"
	if string(data1) != expected {
		t.Fatalf("unexpected content: got %q want %q", data1, expected)
	}

	if counter != 1 {
		t.Fatalf("expected underlying fs to be hit once after first open, got %d", counter)
	}

	baseFS["index.html"] = &fstest.MapFile{Data: []byte("<title>ignored</title>")}
	htmlVars["%APP_CONFIG_GENERAL_NAME%"] = "Other"

	file2, err := fsList.Open("index.html")
	if err != nil {
		t.Fatalf("unexpected error on second open: %v", err)
	}
	defer file2.Close()

	data2, err := io.ReadAll(file2)
	if err != nil {
		t.Fatalf("read second open: %v", err)
	}

	if string(data2) != expected {
		t.Fatalf("cached content mismatch: got %q want %q", data2, expected)
	}

	if counter != 1 {
		t.Fatalf("expected cache hit without reopening underlying fs, got %d", counter)
	}

	if _, ok := file2.(*memFile); !ok {
		t.Fatalf("expected cached response to return memFile")
	}
}

func TestFSListDevModeSkipsImmutableCache(t *testing.T) {
	htmlVars := map[string]string{"%APP_CONFIG_GENERAL_NAME%": "MyApp"}
	cfg := configuration.AppConfig{Server: configuration.ServerConfig{StaticFileServerImmutable: true}}
	counter := 0
	baseFS := fstest.MapFS{
		"index.html": &fstest.MapFile{Data: []byte("<title>%APP_CONFIG_GENERAL_NAME%</title>")},
	}

	fsList := NewFSList(true, cfg, htmlVars, FSItem{fs: &countingFS{fs: baseFS, opens: &counter}})
	file1, err := fsList.Open("index.html")
	if err != nil {
		t.Fatalf("unexpected error on first open: %v", err)
	}
	data1, err := io.ReadAll(file1)
	file1.Close()
	if err != nil {
		t.Fatalf("read first open: %v", err)
	}

	if counter != 1 {
		t.Fatalf("expected first open to hit underlying fs once, got %d", counter)
	}

	baseFS["index.html"] = &fstest.MapFile{Data: []byte("<title>Changed</title>")}

	file2, err := fsList.Open("index.html")
	if err != nil {
		t.Fatalf("unexpected error on second open: %v", err)
	}
	data2, err := io.ReadAll(file2)
	file2.Close()
	if err != nil {
		t.Fatalf("read second open: %v", err)
	}

	if string(data1) != "<title>MyApp</title>" {
		t.Fatalf("unexpected first response: %q", data1)
	}

	if string(data2) != "<title>Changed</title>" {
		t.Fatalf("expected second response to reflect updated file, got %q", data2)
	}

	if counter != 2 {
		t.Fatalf("expected dev mode to reopen underlying fs, got %d", counter)
	}
}

func TestFSListCachesErrorsWhenImmutable(t *testing.T) {
	cfg := configuration.AppConfig{Server: configuration.ServerConfig{StaticFileServerImmutable: true}}
	counter := 0
	fsList := NewFSList(false, cfg, nil, FSItem{fs: &countingFS{fs: fstest.MapFS{}, opens: &counter}})

	_, err := fsList.Open("missing.txt")
	if !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("expected not exist error, got %v", err)
	}

	if counter != 1 {
		t.Fatalf("expected underlying fs to be attempted once, got %d", counter)
	}

	_, err = fsList.Open("missing.txt")
	if !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("expected cached not exist error, got %v", err)
	}

	if counter != 1 {
		t.Fatalf("expected cached error to skip reopening fs, got %d", counter)
	}
}

func TestFSListIndexFallbackReturnsIndex(t *testing.T) {
	htmlVars := map[string]string{"%APP_CONFIG_GENERAL_DESCRIPTION%": "Desc"}
	cfg := configuration.AppConfig{Server: configuration.ServerConfig{StaticFileServerImmutable: true, IndexFallback: true}}
	counter := 0
	baseFS := fstest.MapFS{
		router.IndexPage: &fstest.MapFile{Data: []byte("<body>%APP_CONFIG_GENERAL_DESCRIPTION%</body>")},
	}

	fsList := NewFSList(false, cfg, htmlVars, FSItem{fs: &countingFS{fs: baseFS, opens: &counter}})
	file, err := fsList.Open("missing.html")
	if err != nil {
		t.Fatalf("unexpected error when falling back to index: %v", err)
	}
	data, err := io.ReadAll(file)
	file.Close()
	if err != nil {
		t.Fatalf("read fallback: %v", err)
	}

	if string(data) != "<body>Desc</body>" {
		t.Fatalf("unexpected fallback content: %q", data)
	}

	if counter != 2 {
		t.Fatalf("expected one miss and one index open, got %d", counter)
	}

	// Cached error should allow fallback without re-opening missing file or index data.
	file2, err := fsList.Open("missing.html")
	if err != nil {
		t.Fatalf("unexpected error on cached fallback: %v", err)
	}
	_, err = io.ReadAll(file2)
	file2.Close()
	if err != nil {
		t.Fatalf("read cached fallback: %v", err)
	}

	if counter != 2 {
		t.Fatalf("expected cached fallback to reuse cached data, got %d", counter)
	}
}
