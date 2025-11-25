package configuration

import (
	"reflect"
	"testing"
)

func TestCLIArgs(t *testing.T) {
	tests := []struct {
		name     string
		cfg      AppConfig
		expected []string
	}{
		{
			name: "basic HTTP config",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "0.0.0.0",
						Port:    8080,
						Enabled: true,
					},
					AllowedOrigins: []string{"*"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 30,
					},
				},
			},
			expected: []string{"--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30"},
		},
		{
			name: "HTTP and HTTPS enabled",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "0.0.0.0",
						Port:    80,
						Enabled: true,
					},
					HTTPS: HTTPSConfig{
						Address: "0.0.0.0",
						Port:    443,
						Enabled: true,
					},
					AllowedOrigins: []string{"https://example.com"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 60,
					},
				},
			},
			expected: []string{"--http", "0.0.0.0:80", "--https", "0.0.0.0:443", "--origins", "https://example.com", "--queryTimeout", "60"},
		},
		{
			name: "with dev mode",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "127.0.0.1",
						Port:    8161,
						Enabled: true,
					},
					ForceDevMode:   true,
					AllowedOrigins: []string{"*"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 30,
					},
				},
			},
			expected: []string{"--http", "127.0.0.1:8161", "--origins", "*", "--dev", "--queryTimeout", "30"},
		},
		{
			name: "with domains for Let's Encrypt",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "0.0.0.0",
						Port:    80,
						Enabled: true,
					},
					HTTPS: HTTPSConfig{
						Address: "0.0.0.0",
						Port:    443,
						Enabled: true,
					},
					Domains:        []string{"example.com", "www.example.com"},
					AllowedOrigins: []string{"*"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 30,
					},
				},
			},
			expected: []string{"--http", "0.0.0.0:80", "--https", "0.0.0.0:443", "--origins", "*", "--queryTimeout", "30", "example.com", "www.example.com"},
		},
		{
			name: "with encryption key",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "0.0.0.0",
						Port:    8080,
						Enabled: true,
					},
					EncryptionKey:  strPtr("12345678901234567890123456789012"),
					AllowedOrigins: []string{"*"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 30,
					},
				},
			},
			expected: []string{"--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30", "--encryptionEnv", "POCKET_BASE_SERVER_ENCRYPTION_KEY"},
		},
		{
			name: "HTTP disabled",
			cfg: AppConfig{
				Server: ServerConfig{
					HTTP: HTTPConfig{
						Address: "0.0.0.0",
						Port:    8080,
						Enabled: false,
					},
					AllowedOrigins: []string{"*"},
					Database: DatabaseConfig{
						QueryTimeoutSeconds: 30,
					},
				},
			},
			expected: []string{"--origins", "*", "--queryTimeout", "30"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CLIArgs(tt.cfg)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("CLIArgs() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestInjectCLIArgs(t *testing.T) {
	cfg := AppConfig{
		Server: ServerConfig{
			HTTP: HTTPConfig{
				Address: "0.0.0.0",
				Port:    8080,
				Enabled: true,
			},
			AllowedOrigins: []string{"*"},
			Database: DatabaseConfig{
				QueryTimeoutSeconds: 30,
			},
		},
	}

	tests := []struct {
		name     string
		osArgs   []string
		expected []string
	}{
		{
			name:     "empty args",
			osArgs:   []string{},
			expected: []string{"app", "serve", "--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30"},
		},
		{
			name:     "only program name",
			osArgs:   []string{"myapp"},
			expected: []string{"myapp", "serve", "--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30"},
		},
		{
			name:     "with serve command",
			osArgs:   []string{"myapp", "serve"},
			expected: []string{"myapp", "serve", "--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30"},
		},
		{
			name:     "with serve and existing args",
			osArgs:   []string{"myapp", "serve", "--dev"},
			expected: []string{"myapp", "serve", "--http", "0.0.0.0:8080", "--origins", "*", "--queryTimeout", "30", "--dev"},
		},
		{
			name:     "with migrate command - should not inject",
			osArgs:   []string{"myapp", "migrate"},
			expected: []string{"myapp", "migrate"},
		},
		{
			name:     "with help flag - should not inject",
			osArgs:   []string{"myapp", "--help"},
			expected: []string{"myapp", "--help"},
		},
		{
			name:     "with superuser command - should not inject",
			osArgs:   []string{"myapp", "superuser", "create"},
			expected: []string{"myapp", "superuser", "create"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := InjectCLIArgs(tt.osArgs, cfg)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("InjectCLIArgs() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func strPtr(s string) *string {
	return &s
}
