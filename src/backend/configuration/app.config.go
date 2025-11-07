package configuration

import "encoding/json"

// AppConfig mirrors the structure of app.config.json at the project root.
type AppConfig struct {
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Author      string           `json:"author"`
	Version     string           `json:"version"`
	Website     string           `json:"website"`
	PocketBase  PocketBaseConfig `json:"pocketBase"`
}

// PocketBaseConfig groups PocketBase-specific settings.
type PocketBaseConfig struct {
	Email EmailConfig `json:"email"`
}

// EmailConfig holds email sender settings for PocketBase.
type EmailConfig struct {
	SenderName    string `json:"senderName"`
	SenderAddress string `json:"senderAddress"`
}

// ParseAppConfig parses the provided JSON bytes into an AppConfig instance.
// It returns the parsed config or an error if the JSON is invalid.
func ParseAppConfig(data []byte) (AppConfig, error) {
	var cfg AppConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return AppConfig{}, err
	}
	return cfg, nil
}
