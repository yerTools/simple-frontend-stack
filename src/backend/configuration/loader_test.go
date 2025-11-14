package configuration

import (
	"testing"

	"github.com/yerTools/simple-frontend-stack/config"
)

func TestAppConfigJSONC(t *testing.T) {
	sanitizedAppConfigJSON, err := sanitizeJSONC(config.AppConfigJSONC)
	if err != nil {
		t.Fatalf("failed to sanitize embedded 'app.config.jsonc': %v", err)
	}

	_, err = ParseAppConfig(sanitizedAppConfigJSON)
	if err != nil {
		t.Fatalf("failed to parse embedded 'app.config.jsonc': %v", err)
	}
}
