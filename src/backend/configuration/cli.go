package configuration

import (
	"fmt"
	"os"
	"strings"
)

// CLIArgs generates CLI arguments for PocketBase based on the loaded configuration.
// It returns a slice of arguments that can be appended to os.Args.
func CLIArgs(cfg AppConfig) []string {
	var args []string

	// Determine the command - default to "serve" if no command is provided
	// This will be handled by the caller

	// --http flag: address:port for HTTP server
	if cfg.Server.HTTP.Enabled {
		httpAddr := fmt.Sprintf("%s:%d", cfg.Server.HTTP.Address, cfg.Server.HTTP.Port)
		args = append(args, "--http", httpAddr)
	}

	// --https flag: address:port for HTTPS server
	if cfg.Server.HTTPS.Enabled {
		httpsAddr := fmt.Sprintf("%s:%d", cfg.Server.HTTPS.Address, cfg.Server.HTTPS.Port)
		args = append(args, "--https", httpsAddr)
	}

	// --origins flag: CORS allowed origins
	if len(cfg.Server.AllowedOrigins) > 0 {
		args = append(args, "--origins", strings.Join(cfg.Server.AllowedOrigins, ","))
	}

	// --dev flag: force dev mode
	if cfg.Server.ForceDevMode {
		args = append(args, "--dev")
	}

	// --queryTimeout flag: database query timeout
	if cfg.Server.Database.QueryTimeoutSeconds > 0 {
		args = append(args, "--queryTimeout", fmt.Sprintf("%d", cfg.Server.Database.QueryTimeoutSeconds))
	}

	// --encryptionEnv flag: encryption key environment variable
	// Note: PocketBase expects the NAME of an env var, not the value directly
	if cfg.Server.EncryptionKey != nil && *cfg.Server.EncryptionKey != "" {
		if os.Getenv("POCKET_BASE_SERVER_ENCRYPTION_KEY") == "" {
			os.Setenv("POCKET_BASE_SERVER_ENCRYPTION_KEY", *cfg.Server.EncryptionKey)
		}
		args = append(args, "--encryptionEnv", "POCKET_BASE_SERVER_ENCRYPTION_KEY")
	}

	// Domain arguments for Let's Encrypt certificates
	// These are positional arguments, not flags
	if len(cfg.Server.Domains) > 0 {
		args = append(args, cfg.Server.Domains...)
	}

	return args
}

// InjectCLIArgs modifies os.Args to include the configuration-based CLI arguments.
// It intelligently merges with existing arguments, ensuring the "serve" command is present.
// Returns the modified args slice (also modifies os.Args in place).
func InjectCLIArgs(osArgs []string, cfg AppConfig) []string {
	configArgs := CLIArgs(cfg)

	if len(osArgs) == 0 {
		return append([]string{"app", "serve"}, configArgs...)
	}

	// Check if "serve" command is already present
	hasServeCommand := false
	serveIndex := -1
	for i, arg := range osArgs {
		if arg == "serve" {
			hasServeCommand = true
			serveIndex = i
			break
		}
	}

	// Also check for other commands that shouldn't have serve injected
	hasOtherCommand := false
	otherCommands := []string{"migrate", "superuser", "help", "--help", "-h", "--version", "-v"}
	for _, arg := range osArgs {
		for _, cmd := range otherCommands {
			if arg == cmd {
				hasOtherCommand = true
				break
			}
		}
		if hasOtherCommand {
			break
		}
	}

	// If another command is present, don't inject anything
	if hasOtherCommand {
		return osArgs
	}

	// Build the new args
	var newArgs []string

	if hasServeCommand {
		// Insert config args after "serve"
		newArgs = append(newArgs, osArgs[:serveIndex+1]...)
		newArgs = append(newArgs, configArgs...)
		if serveIndex+1 < len(osArgs) {
			newArgs = append(newArgs, osArgs[serveIndex+1:]...)
		}
	} else {
		// No serve command, add it with config args
		newArgs = append(newArgs, osArgs[0], "serve")
		newArgs = append(newArgs, configArgs...)
		// Add any remaining original args (skip the program name)
		if len(osArgs) > 1 {
			newArgs = append(newArgs, osArgs[1:]...)
		}
	}

	return newArgs
}
