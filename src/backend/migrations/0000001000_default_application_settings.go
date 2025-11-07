/**
 * Default Application Settings Migration
 *
 * This migration configures the default application settings for the ResMon application.
 * It is assigned a high priority number (1000) to ensure it runs after core system
 * migrations but before application-specific data migrations.
 *
 * The migration sets various PocketBase configuration parameters, including:
 * 1. Meta settings: Application name, URL, email sender information
 * 2. Log settings: Retention period and privacy options
 * 3. Backup settings: Scheduled backups and retention policy
 * 4. Security settings: Rate limiting for API endpoints
 *
 * Note: The migration does not include a "down" function (second parameter is nil)
 * which means these settings cannot be automatically reverted.
 */
package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/yerTools/simple-frontend-stack/config"
	"github.com/yerTools/simple-frontend-stack/src/backend/configuration"
)

func init() {
	m.Register(func(app core.App) error {
		appConfig, err := configuration.ParseAppConfig(config.AppConfigJSON)
		if err != nil {
			return fmt.Errorf("failed to parse embedded 'app.config.json': %w", err)
		}

		settings := app.Settings()

		// Configure application meta information
		settings.Meta.AppName = appConfig.Name
		settings.Meta.AppURL = appConfig.Website
		settings.Meta.HideControls = true
		settings.Meta.SenderName = appConfig.PocketBase.Email.SenderName
		settings.Meta.SenderAddress = appConfig.PocketBase.Email.SenderAddress

		// Configure log settings
		settings.Logs.MaxDays = 14  // Keep logs for two weeks
		settings.Logs.LogIP = false // Don't log user IP addresses for privacy

		// Configure backup settings
		settings.Backups.CronMaxKeep = 180   // Keep backups for ~6 months
		settings.Backups.Cron = "12 1 * * *" // Run backup at 1:12 AM daily

		// Configure security settings
		settings.RateLimits.Enabled = true // Enable rate limiting for API protection

		if err := app.Save(settings); err != nil {
			return fmt.Errorf("failed to save application settings: %w", err)
		}
		return nil
	}, nil)
}
