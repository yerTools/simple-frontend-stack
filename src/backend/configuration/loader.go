package configuration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/joho/godotenv"
	"github.com/komkom/jsonc/jsonc"
	"github.com/yerTools/simple-frontend-stack/config"
)

var (
	loadedAppConfig AppConfig
	appConfigLoaded bool
	appConfigMutex  sync.Mutex
)

func ParseAppConfig(data []byte) (AppConfig, error) {
	var cfg AppConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return AppConfig{}, err
	}
	return cfg, nil
}

func sanitizeJSONC(data []byte) ([]byte, error) {
	appConfigJSONCReader := bytes.NewReader(data)

	jsoncFilter, err := jsonc.New(appConfigJSONCReader, true, "")
	if err != nil {
		return nil, fmt.Errorf("failed to create JSONC filter: %w", err)
	}

	sanitizedJSON, err := io.ReadAll(jsoncFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to read JSONC filter: %w", err)
	}

	return sanitizedJSON, nil
}

func Get() (AppConfig, error) {
	appConfigMutex.Lock()
	defer appConfigMutex.Unlock()
	if appConfigLoaded {
		return loadedAppConfig, nil
	}

	sanitizedAppConfigJSON, err := sanitizeJSONC(config.AppConfigJSONC)
	if err != nil {
		return AppConfig{}, fmt.Errorf("failed to sanitize embedded 'app.config.jsonc': %w", err)
	}

	_, err = ParseAppConfig(sanitizedAppConfigJSON)
	if err != nil {
		return AppConfig{}, fmt.Errorf("failed to parse embedded 'app.config.jsonc': %w", err)
	}

	pb_data, err := filepath.Abs("./pb_data")
	if err != nil {
		return AppConfig{}, fmt.Errorf("failed to determine absolute path for './pb_data': %w", err)
	}

	err = os.MkdirAll(pb_data, 0755)
	if err != nil {
		return AppConfig{}, fmt.Errorf("failed to create directory './pb_data': %w", err)
	}

	appConfigPath := filepath.Join(pb_data, "app.config.jsonc")
	_, err = os.Stat(appConfigPath)
	if err != nil && !os.IsNotExist(err) {
		return AppConfig{}, fmt.Errorf("failed to stat '%s': %w", appConfigPath, err)
	}

	var jsonReader io.Reader

	if err == nil {
		data, err := os.ReadFile(appConfigPath)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to read existing 'app.config.jsonc' from '%s': %w", appConfigPath, err)
		}

		sanitizedData, err := sanitizeJSONC(data)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to sanitize existing 'app.config.jsonc' from '%s': %w", appConfigPath, err)
		}

		_, err = ParseAppConfig(sanitizedData)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to parse existing 'app.config.jsonc' from '%s': %w", appConfigPath, err)
		}

		jsonReader = bytes.NewReader(sanitizedData)
	} else {
		err = os.WriteFile(appConfigPath, config.AppConfigJSONC, 0644)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to write default 'app.config.jsonc' to '%s': %w", appConfigPath, err)
		}
		jsonReader = bytes.NewReader(sanitizedAppConfigJSON)
	}

	dotEnv := filepath.Join(pb_data, ".env")
	_, err = os.Stat(dotEnv)
	if err != nil && !os.IsNotExist(err) {
		return AppConfig{}, fmt.Errorf("failed to stat '%s': %w", dotEnv, err)
	}

	if err == nil {
		err = godotenv.Load(dotEnv)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to load existing .env from '%s': %w", dotEnv, err)
		}
	} else {
		f, err := os.Create(dotEnv)
		if err != nil {
			return AppConfig{}, fmt.Errorf("failed to create new .env at '%s': %w", dotEnv, err)
		}
		f.Close()
	}

	err = cleanenv.ParseJSON(jsonReader, &loadedAppConfig)
	if err != nil {
		return AppConfig{}, fmt.Errorf("failed to parse JSON with environment variables: %w", err)
	}
	appConfigLoaded = true

	return loadedAppConfig, nil
}
