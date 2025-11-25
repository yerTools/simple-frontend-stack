package configuration

import (
	"fmt"
	"io"
	"os"
	"strings"
)

// DebugPrint prints the current configuration and environment variables to the given writer.
// If w is nil, it prints to os.Stdout.
func DebugPrint(w io.Writer) error {
	if w == nil {
		w = os.Stdout
	}

	cfg, err := Get()
	if err != nil {
		return fmt.Errorf("failed to load config for debug: %w", err)
	}

	meta, err := Meta()
	if err != nil {
		return fmt.Errorf("failed to load meta for debug: %w", err)
	}

	fmt.Fprintln(w, "")
	fmt.Fprintln(w, strings.Repeat("=", 80))
	fmt.Fprintln(w, "DEBUG: Configuration and Environment Variables")
	fmt.Fprintln(w, strings.Repeat("=", 80))

	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "--- Loaded Configuration ---")
	fmt.Fprintln(w, "")

	err = meta.Walk(func(node MetaNode) error {
		indent := strings.Repeat("  ", len(node.AbsolutePath))

		if len(node.Children) > 0 {
			// This is a section/struct
			if node.Name != "" {
				fmt.Fprintf(w, "%s[%s]\n", indent, node.Name)
			}
		} else {
			// This is a leaf value
			fmt.Fprintf(w, "%s%s: %v\n", indent, node.Name, node.Value)
		}

		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to walk config for debug: %w", err)
	}

	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "--- Environment Variable Mappings ---")
	fmt.Fprintln(w, "")

	envMap, err := EnvironmentMap()
	if err != nil {
		return fmt.Errorf("failed to load environment map for debug: %w", err)
	}

	// Print in a more organized way
	for envVar, node := range envMap {
		envValue := os.Getenv(envVar)
		path := strings.Join(node.AbsolutePath, ".")

		fmt.Fprintf(w, "  %s\n", envVar)
		fmt.Fprintf(w, "    Path:        %s\n", path)
		fmt.Fprintf(w, "    Description: %s\n", node.Description)
		if node.EnvDefault != "" {
			fmt.Fprintf(w, "    Default:     %s\n", node.EnvDefault)
		}
		if node.EnvSeparator != "" {
			fmt.Fprintf(w, "    Separator:   %q\n", node.EnvSeparator)
		}
		fmt.Fprintf(w, "    Config Value: %v\n", node.Value)
		if envValue != "" {
			fmt.Fprintf(w, "    Env Value:   %s\n", envValue)
		} else {
			fmt.Fprintf(w, "    Env Value:   (not set)\n")
		}
		fmt.Fprintln(w, "")
	}

	fmt.Fprintln(w, "--- Summary ---")
	fmt.Fprintln(w, "")
	fmt.Fprintf(w, "  Application:  %s v%s\n", cfg.General.Name, cfg.General.Version)
	fmt.Fprintf(w, "  URL:          %s\n", cfg.General.URL)
	fmt.Fprintf(w, "  HTTP Server:  %s:%d (enabled: %v)\n",
		cfg.Server.HTTP.Address, cfg.Server.HTTP.Port, cfg.Server.HTTP.Enabled)
	fmt.Fprintf(w, "  HTTPS Server: %s:%d (enabled: %v)\n",
		cfg.Server.HTTPS.Address, cfg.Server.HTTPS.Port, cfg.Server.HTTPS.Enabled)
	fmt.Fprintf(w, "  Force Dev:    %v\n", cfg.Server.ForceDevMode)
	fmt.Fprintln(w, "")

	fmt.Fprintln(w, "--- Generated CLI Arguments ---")
	fmt.Fprintln(w, "")
	cliArgs := CLIArgs(cfg)
	if len(cliArgs) > 0 {
		fmt.Fprintf(w, "  %s\n", strings.Join(cliArgs, " "))
	} else {
		fmt.Fprintln(w, "  (none)")
	}
	fmt.Fprintln(w, "")

	fmt.Fprintln(w, "--- Effective os.Args ---")
	fmt.Fprintln(w, "")
	fmt.Fprintf(w, "  %s\n", strings.Join(os.Args, " "))
	fmt.Fprintln(w, "")

	fmt.Fprintln(w, strings.Repeat("=", 80))
	fmt.Fprintln(w, "")

	return nil
}

// DebugPrintIfEnabled prints debug information only if debug mode is enabled in the config.
// Returns true if debug output was printed.
func DebugPrintIfEnabled(w io.Writer) (bool, error) {
	cfg, err := Get()
	if err != nil {
		return false, fmt.Errorf("failed to load config for debug check: %w", err)
	}

	if !cfg.General.Debug {
		return false, nil
	}

	err = DebugPrint(w)
	if err != nil {
		return false, err
	}

	return true, nil
}
