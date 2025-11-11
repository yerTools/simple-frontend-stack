package configuration

// AppConfig mirrors the structure of app.config.jsonc at the project root.
type AppConfig struct {
	General GeneralConfig `json:"general"`
	Server  ServerConfig  `json:"server"`
}

// GeneralConfig holds general application metadata.
type GeneralConfig struct {
	Name        string `json:"name" env:"APP_GENERAL_NAME" env-description:"The application name."`
	Description string `json:"description" env:"APP_GENERAL_DESCRIPTION" env-description:"A brief description of the application."`
	Version     string `json:"version" env:"APP_GENERAL_VERSION" env-description:"The current version of the application."`
	URL         string `json:"url" env:"APP_GENERAL_URL" env-description:"The URL this application is hosted at."`
}

// ServerConfig groups server-specific settings.
type ServerConfig struct {
	HTTP     HTTPConfig     `json:"http"`
	HTTPS    HTTPSConfig    `json:"https"`
	Email    EmailConfig    `json:"email"`
	Database DatabaseConfig `json:"database"`

	EncryptionKey             *string  `json:"encryptionKey" env:"APP_SERVER_ENCRYPTION_KEY" env-description:"An encryption key with a length of 32 characters used to encrypt app settings."`
	Domains                   []string `json:"domains" env:"APP_SERVER_DOMAINS" env-description:"Comma-separated list of domains for issuing Let's Encrypt certificates." env-separator:","`
	AllowedOrigins            []string `json:"allowedOrigins" env:"APP_SERVER_ALLOWED_ORIGINS" env-default:"*" env-description:"Comma-separated list of CORS allowed domain origins." env-separator:","`
	ForceDevMode              bool     `json:"forceDevMode" env:"APP_SERVER_FORCE_DEV_MODE" env-default:"false" env-description:"Force the application to run in development mode."`
	IndexFallback             bool     `json:"indexFallback" env:"APP_SERVER_INDEX_FALLBACK" env-default:"true" env-description:"Enable SPA index fallback for unknown routes."`
	StaticFileServerImmutable bool     `json:"staticFileServerImmutable" env:"APP_SERVER_STATIC_FILE_SERVER_IMMUTABLE" env-default:"true" env-description:"Enable immutable caching for static file server."`
	ReplaceHTMLVars           bool     `json:"replaceHTMLVars" env:"APP_SERVER_REPLACE_HTML_VARS" env-default:"true" env-description:"Enable replacing HTML variables in served HTML files."`
}

// HTTPConfig holds HTTP server settings.
type HTTPConfig struct {
	Address string `json:"address" env:"APP_SERVER_HTTP_ADDRESS" env-default:"0.0.0.0" env-description:"TCP address to listen for the HTTP server."`
	Port    int    `json:"port" env:"APP_SERVER_HTTP_PORT" env-default:"8161" env-description:"TCP port to listen for the HTTP server."`
	Enabled bool   `json:"enabled" env:"APP_SERVER_HTTP_ENABLED" env-default:"true" env-description:"Enable or disable the HTTP server."`
}

// HTTPSConfig holds HTTPS server settings.
type HTTPSConfig struct {
	Address string `json:"address" env:"APP_SERVER_HTTPS_ADDRESS" env-default:"0.0.0.0" env-description:"TCP address to listen for the HTTPS server."`
	Port    int    `json:"port" env:"APP_SERVER_HTTPS_PORT" env-default:"8443" env-description:"TCP port to listen for the HTTPS server."`
	Enabled bool   `json:"enabled" env:"APP_SERVER_HTTPS_ENABLED" env-default:"false" env-description:"Enable or disable the HTTPS server."`
}

// EmailConfig holds email sender settings.
type EmailConfig struct {
	SenderName    string `json:"senderName" env:"APP_SERVER_EMAIL_SENDER_NAME" env-default:"Simple Frontend Stack" env-description:"The sender name used in the 'From' field of emails."`
	SenderAddress string `json:"senderAddress" env:"APP_SERVER_EMAIL_SENDER_ADDRESS" env-default:"sfs@ltl.re" env-description:"The sender email address used in the 'From' field of emails."`
}

// DatabaseConfig holds database-specific settings.
type DatabaseConfig struct {
	QueryTimeoutSeconds int `json:"queryTimeoutSeconds" env:"APP_SERVER_DATABASE_QUERY_TIMEOUT_SECONDS" env-default:"30" env-description:"The default SELECT queries timeout in seconds."`
}
