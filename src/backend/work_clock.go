// Work Clock Module for PocketBase
//
// This module provides comprehensive functionality to track work hours by implementing clock-in and clock-out
// operations. It exposes API endpoints to manage the clock state, including clocking in,
// clocking out, toggling the current state, modifying timestamps, deleting entries,
// adding manual clock in/out pairs, and bulk importing multiple clock in/out records.
//
// The module ensures thread-safety when modifying clock status and prevents invalid state
// transitions (such as clocking in when already clocked in). All operations validate the
// clock state to maintain data integrity across the work time tracking system.
package backend

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// workClockMutex provides thread-safety for clock operations to prevent race conditions
// when multiple requests attempt to modify the clock state simultaneously.
var workClockMutex = sync.Mutex{}

// callSucceeded returns a success response to the client.
// It sets HTTP status code 200 and returns a JSON response with success: true
//
// Parameters:
// - e: The RequestEvent from the HTTP handler
//
// Returns:
// - An error if encoding or writing the response fails
func callSucceeded(e *core.RequestEvent) error {
	e.Response.Header().Set("Content-Type", "application/json")
	e.Response.WriteHeader(http.StatusOK)
	return json.NewEncoder(e.Response).Encode(map[string]bool{"success": true})
}

// parseBoolParam parses a boolean parameter from form data with validation.
//
// Parameters:
// - paramValue: The string value from the form
// - paramName: The name of the parameter (used in error messages)
//
// Returns:
// - A boolean representing the parsed value
// - An error if the value is missing or not a valid boolean
func parseBoolParam(paramValue string, paramName string) (bool, error) {
	if paramValue == "" {
		return false, fmt.Errorf("missing '%s' (bool) parameter", paramName)
	}

	boolValue, err := strconv.ParseBool(paramValue)
	if err != nil {
		return false, fmt.Errorf("invalid '%s' value. Expected 'true' or 'false'", paramName)
	}

	return boolValue, nil
}

// parseTimeParam parses a time parameter from form data with validation.
//
// Parameters:
// - paramValue: The string value from the form
// - paramName: The name of the parameter (used in error messages)
//
// Returns:
// - A time.Time representing the parsed timestamp
// - An error if the value is missing or not in RFC3339 format
func parseTimeParam(paramValue string, paramName string) (time.Time, error) {
	if paramValue == "" {
		return time.Time{}, fmt.Errorf("missing '%s' parameter: please provide an RFC3339 formatted timestamp", paramName)
	}

	// Try standard RFC3339 and fallback formats
	layouts := []string{time.RFC3339, time.RFC3339Nano, "2006-01-02 15:04:05.999Z", "2006-01-02 15:04:05Z"}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, paramValue); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid '%s' format: expected an RFC3339 compatible timestamp, got '%s'", paramName, paramValue)
}

// RegisterWorkClockAPI registers the work clock API endpoints with the PocketBase server.
// It creates multiple routes for managing clock state:
// - POST /api/work_clock - Accepts form data to clock in or out
// - GET /api/work_clock/clock_in - Clocks in the user
// - GET /api/work_clock/clock_out - Clocks out the user
// - GET /api/work_clock/toggle - Toggles between clock in and clock out states
// - POST /api/work_clock/delete - Deletes a clock in/out pair by the clock in ID
// - POST /api/work_clock/modify - Modifies the timestamp of an existing work clock record
// - POST /api/work_clock/clock_in_out_at - Clocks in or out at a specific timestamp
// - POST /api/work_clock/add_clock_in_out_pair - Adds a clock in/out pair with specified timestamps
//
// All endpoints return a success response on success or an appropriate error response on failure.
//
// Parameters:
// - app: The PocketBase application instance
func RegisterWorkClockAPI(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Handler: POST /api/work_clock
		// Purpose: Clocks in or out based on the 'clock_in' boolean form field.
		// Parameters:
		//   - clock_in (bool) Required. true = clock in, false = clock out.
		// Responses:
		//   200 OK    - {"success":true} on successful operation.
		//   400 Bad Request - Missing or invalid 'clock_in' parameter.
		//   500 Internal Server Error - On processing failures.
		se.Router.POST("/api/work_clock", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			clockInBool, err := parseBoolParam(e.Request.FormValue("clock_in"), "clock_in")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			if err := clockInOut(app, clockInBool); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to clock in/out: %v", err), err)
			}
			return callSucceeded(e)
		})

		// Handler: GET /api/work_clock/clock_in
		// Purpose: Records a clock in event at the current timestamp.
		// Responses:
		//   200 OK    - {"success":true}
		//   500 Internal Server Error - On operation failure.
		se.Router.GET("/api/work_clock/clock_in", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			if err := clockInOut(app, true); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to clock in: %v", err), err)
			}
			return callSucceeded(e)
		})

		// Handler: GET /api/work_clock/clock_out
		// Purpose: Records a clock out event at the current timestamp.
		// Responses:
		//   200 OK    - {"success":true}
		//   500 Internal Server Error - On operation failure.
		se.Router.GET("/api/work_clock/clock_out", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			if err := clockInOut(app, false); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to clock out: %v", err), err)
			}
			return callSucceeded(e)
		})

		// Handler: GET /api/work_clock/toggle
		// Purpose: Toggles between clock in and clock out states.
		// Responses:
		//   200 OK    - {"success":true}
		//   500 Internal Server Error - On operation failure.
		se.Router.GET("/api/work_clock/toggle", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			clockedIn, err := isCurrentlyClockedIn(app)
			if err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to check current clock status: %v", err), err)
			}

			if err := clockInOut(app, !clockedIn); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to toggle clock status: %v", err), err)
			}
			return callSucceeded(e)
		})

		// Handler: POST /api/work_clock/delete
		// Purpose: Deletes a clock-in/out pair given the 'clock_in_id' form field.
		// Parameters:
		//   - clock_in_id (string) Required. ID of the clock-in record to delete.
		// Responses:
		//   200 OK    - {"success":true}
		//   400 Bad Request - Missing 'clock_in_id' parameter.
		//   500 Internal Server Error - On deletion failure.
		se.Router.POST("/api/work_clock/delete", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			clockInID := e.Request.FormValue("clock_in_id")
			if clockInID == "" {
				return e.Error(http.StatusBadRequest, "Missing 'clock_in_id' (string) parameter", nil)
			}

			if err := deleteClockInOutPair(app, clockInID); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to delete clock in/out pair: %v", err), err)
			}

			return callSucceeded(e)
		})

		// Handler: POST /api/work_clock/modify
		// Purpose: Modifies the timestamp of an existing work clock record.
		// Parameters:
		//   - work_clock_id (string) Required: ID of the record to modify.
		//   - new_timestamp (string) Required: RFC3339 formatted timestamp for the update.
		// Responses:
		//   200 OK    - {"success":true}
		//   400 Bad Request - Missing/invalid parameters.
		//   500 Internal Server Error - On modification failure.
		se.Router.POST("/api/work_clock/modify", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			workClockID := e.Request.FormValue("work_clock_id")
			if workClockID == "" {
				return e.Error(http.StatusBadRequest, "Missing 'work_clock_id' (string) parameter", nil)
			}

			newTimestamp, err := parseTimeParam(e.Request.FormValue("new_timestamp"), "new_timestamp")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			if err := modifyWorkClockTimestamp(app, workClockID, newTimestamp); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to modify work clock timestamp: %v", err), err)
			}
			return callSucceeded(e)
		})

		// Handler: POST /api/work_clock/clock_in_out_at
		// Purpose: Records a clock in or out event at a specified timestamp.
		// Parameters:
		//   - clock_in (bool) Required: true for clock in, false for clock out.
		//   - timestamp (string) Required: RFC3339 formatted timestamp for the event.
		// Responses:
		//   200 OK    - {"success":true}
		//   400 Bad Request - Missing/invalid parameters.
		//   500 Internal Server Error - On operation failure.
		se.Router.POST("/api/work_clock/clock_in_out_at", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			clockInBool, err := parseBoolParam(e.Request.FormValue("clock_in"), "clock_in")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			timestamp, err := parseTimeParam(e.Request.FormValue("timestamp"), "timestamp")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			if err := clockInOutAt(app, clockInBool, timestamp); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to clock %s at %s: %v", map[bool]string{true: "in", false: "out"}[clockInBool], timestamp.Format(time.RFC3339), err), err)
			}
			return callSucceeded(e)
		})

		// Handler: POST /api/work_clock/add_clock_in_out_pair
		// Purpose: Adds a manual clock-in and clock-out record pair with specified timestamps.
		// Parameters:
		//   - clock_in_timestamp (string)  Required: RFC3339 formatted timestamp for clock in.
		//   - clock_out_timestamp (string) Required: RFC3339 formatted timestamp for clock out.
		// Responses:
		//   200 OK    - {"success":true}
		//   400 Bad Request - Missing/invalid parameters.
		//   500 Internal Server Error - On operation failure.
		se.Router.POST("/api/work_clock/add_clock_in_out_pair", func(e *core.RequestEvent) error {
			if e.Auth == nil {
				return e.Error(http.StatusUnauthorized, "Unauthorized", nil)
			}
			clockInTimestamp, err := parseTimeParam(e.Request.FormValue("clock_in_timestamp"), "clock_in_timestamp")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			clockOutTimestamp, err := parseTimeParam(e.Request.FormValue("clock_out_timestamp"), "clock_out_timestamp")
			if err != nil {
				return e.Error(http.StatusBadRequest, err.Error(), nil)
			}

			if err := addClockInOutPair(app, clockInTimestamp, clockOutTimestamp); err != nil {
				return e.Error(http.StatusInternalServerError, fmt.Sprintf("Failed to add clock in/out pair: %v", err), err)
			}
			return callSucceeded(e)
		})

		return se.Next()
	})

}

// isCurrentlyClockedIn checks if the user is currently clocked in by retrieving
// the most recent record from the work_clock collection.
//
// Parameters:
// - app: The PocketBase application instance
//
// Returns:
// - A boolean indicating whether the user is clocked in (true) or out (false)
// - An error if the database query fails
//
// If no records exist, the function returns false, indicating the user is not clocked in.
func isCurrentlyClockedIn(app *pocketbase.PocketBase) (bool, error) {
	records, err := app.FindRecordsByFilter("work_clock", "", "-timestamp", 1, 0)
	if err != nil {
		return false, fmt.Errorf("failed to find latest work clock record: %w", err)
	}

	if len(records) == 0 {
		return false, nil
	}

	return records[0].GetBool("clock_in"), nil
}

// clockInOut performs the clock in or clock out operation based on the provided flag.
// This function ensures thread-safety using a mutex and prevents invalid state transitions
// (such as clocking in when already clocked in).
//
// Parameters:
// - app: The PocketBase application instance
// - clockIn: A boolean flag indicating the desired clock state (true = clock in, false = clock out)
//
// Returns:
// - An error if the operation fails or if the requested state matches the current state
//
// The function creates a new record in the work_clock collection with the current timestamp
// and the requested clock state.
func clockInOut(app *pocketbase.PocketBase, clockIn bool) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	isClockedIn, err := isCurrentlyClockedIn(app)
	if err != nil {
		return fmt.Errorf("failed to check current clock status: %w", err)
	}

	if isClockedIn == clockIn {
		return fmt.Errorf("already clocked %s", map[bool]string{true: "in", false: "out"}[isClockedIn])
	}

	_, err = createWorkClockRecord(app, nil, time.Now(), clockIn)
	if err != nil {
		return fmt.Errorf("failed to create work clock record: %w", err)
	}

	return nil
}

// deleteClockInOutPair deletes a clock in record and its corresponding clock out record.
// It requires the ID of the clock in record and will automatically find and delete the matching
// clock out record if it exists.
//
// Parameters:
// - app: The PocketBase application instance
// - clockInID: The ID of the clock in record to delete
//
// Returns:
// - An error if the operation fails, the record doesn't exist, or if it's not a clock in record
//
// The operation is performed within a transaction to ensure data consistency.
func deleteClockInOutPair(app *pocketbase.PocketBase, clockInID string) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	record, err := app.FindRecordById("work_clock", clockInID)
	if err != nil {
		return fmt.Errorf("failed to find work clock record with id '%s': %w", clockInID, err)
	}
	if !record.GetBool("clock_in") {
		return fmt.Errorf("record with id '%s' is not a clock in record", clockInID)
	}

	succeedingRecords, err := app.FindRecordsByFilter("work_clock", "timestamp > {:clockIn}", "+timestamp", 1, 0, dbx.Params{
		"clockIn": record.GetDateTime("timestamp"),
	})
	if err != nil {
		return fmt.Errorf("failed to find succeeding work clock record: %w", err)
	}

	if len(succeedingRecords) > 0 && succeedingRecords[0].GetBool("clock_in") {
		return fmt.Errorf("succeeding record with id '%s' is not a clock out record", succeedingRecords[0].Id)
	}

	err = app.RunInTransaction(func(txApp core.App) error {
		if err := txApp.Delete(record); err != nil {
			return fmt.Errorf("failed to delete clock in record: %w", err)
		}

		if len(succeedingRecords) > 0 {
			if err := txApp.Delete(succeedingRecords[0]); err != nil {
				return fmt.Errorf("failed to delete clock out record: %w", err)
			}
		}

		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to delete work clock records: %w", err)
	}

	return nil
}

// checkValidity verifies that a work clock record maintains logical sequence with adjacent records.
// It ensures that:
// - Clock in records are followed by clock out records
// - Clock out records are followed by clock in records
// - Clock in records are preceded by clock out records
// - Clock out records are preceded by clock in records
// - The first work clock record cannot be a clock out record
//
// This function is crucial for maintaining data integrity when adding, modifying, or deleting records.
//
// Parameters:
// - app: The core.App interface (typically a PocketBase transaction)
// - workClockID: The ID of the work clock record to validate
//
// Returns:
// - An error if the validation fails, with a detailed message explaining the issue
func checkValidity(app core.App, workClockID string) error {
	// Check if the work clock ID is valid
	if workClockID == "" {
		return fmt.Errorf("work clock ID cannot be empty")
	}

	// Check if the work clock record exists
	record, err := app.FindRecordById("work_clock", workClockID)
	if err != nil {
		return fmt.Errorf("failed to find work clock record with id '%s': %w", workClockID, err)
	}

	succeedingRecords, err := app.FindRecordsByFilter("work_clock", "timestamp > {:clockIn}", "+timestamp", 1, 0, dbx.Params{
		"clockIn": record.GetDateTime("timestamp"),
	})
	if err != nil {
		return fmt.Errorf("failed to find succeeding work clock record: %w", err)
	}

	if len(succeedingRecords) > 0 && succeedingRecords[0].GetBool("clock_in") == record.GetBool("clock_in") {
		if record.GetBool("clock_in") {
			return fmt.Errorf("expected the succeeding work clock record with id '%s' to be a clock out record", succeedingRecords[0].Id)
		} else {
			return fmt.Errorf("expected the succeeding work clock record with id '%s' to be a clock in record", succeedingRecords[0].Id)
		}
	}

	precedingRecords, err := app.FindRecordsByFilter("work_clock", "timestamp < {:clockIn}", "-timestamp", 1, 0, dbx.Params{
		"clockIn": record.GetDateTime("timestamp"),
	})
	if err != nil {
		return fmt.Errorf("failed to find preceding work clock record: %w", err)
	}

	if len(precedingRecords) > 0 && precedingRecords[0].GetBool("clock_in") == record.GetBool("clock_in") {
		if record.GetBool("clock_in") {
			return fmt.Errorf("expected the preceding work clock record with id '%s' to be a clock out record", precedingRecords[0].Id)
		} else {
			return fmt.Errorf("expected the preceding work clock record with id '%s' to be a clock in record", precedingRecords[0].Id)
		}
	}

	if len(precedingRecords) == 0 && !record.GetBool("clock_in") {
		return fmt.Errorf("expected the work clock record with id '%s' to be a clock in record since the first work clock record cannot be a clock out record", workClockID)
	}

	return nil
}

// modifyWorkClockTimestamp updates the timestamp of an existing work clock record.
// After modifying the timestamp, it validates that the record maintains proper sequence
// with adjacent records to ensure data integrity.
//
// Parameters:
// - app: The PocketBase application instance
// - workClockID: The ID of the work clock record to modify
// - newTimestamp: The new timestamp to set for the record
//
// Returns:
// - An error if the update fails or if the modified record violates sequence constraints
//
// The operation is performed within a transaction to ensure data consistency.
func modifyWorkClockTimestamp(app *pocketbase.PocketBase, workClockID string, newTimestamp time.Time) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	record, err := app.FindRecordById("work_clock", workClockID)
	if err != nil {
		return fmt.Errorf("failed to find work clock record with id '%s': %w", workClockID, err)
	}

	err = app.RunInTransaction(func(txApp core.App) error {
		record.Set("timestamp", newTimestamp)
		if err := txApp.Save(record); err != nil {
			return fmt.Errorf("failed to save work clock record with new timestamp: %w", err)
		}

		if err := checkValidity(txApp, workClockID); err != nil {
			return fmt.Errorf("modified work clock record with id '%s' is not valid anymore: %w", workClockID, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to modify work clock record with id '%s': %w", workClockID, err)
	}

	return nil
}

// clockInOutAt creates a new clock in or clock out record with a specific timestamp.
// This allows for manual time entries when the actual clock in/out didn't occur in real-time.
// The function validates that the new record maintains proper sequence with existing records.
//
// Parameters:
// - app: The PocketBase application instance
// - clockIn: Boolean flag indicating whether this is a clock in (true) or clock out (false) record
// - timestamp: The specific timestamp to use for the record
//
// Returns:
// - An error if the operation fails or if adding the record would violate sequence constraints
//
// The operation is performed within a transaction to ensure data consistency.
func clockInOutAt(app *pocketbase.PocketBase, clockIn bool, timestamp time.Time) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	err := app.RunInTransaction(func(txApp core.App) error {
		record, err := createWorkClockRecord(txApp, nil, timestamp, clockIn)
		if err != nil {
			return fmt.Errorf("failed to create work clock record: %w", err)
		}

		if err := checkValidity(txApp, record.Id); err != nil {
			return fmt.Errorf("modified work clock record with id '%s' is not valid: %w", record.Id, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to clock %s at %s: %w", map[bool]string{true: "in", false: "out"}[clockIn], timestamp.Format(time.RFC3339), err)
	}

	return nil
}

// addClockInOutPair creates a pair of clock in and clock out records with specified timestamps.
// This is useful for entering historical or pre-planned work periods.
// Both records are validated to ensure they maintain proper sequence with existing records.
//
// Parameters:
// - app: The PocketBase application instance
// - clockInTimestamp: The timestamp for the clock in record
// - clockOutTimestamp: The timestamp for the clock out record
//
// Returns:
// - An error if the operation fails or if adding the records would violate sequence constraints
//
// The operation is performed within a transaction to ensure data consistency. There is no
// requirement that clockInTimestamp must be before clockOutTimestamp, allowing for flexibility
// in special cases like splitting an existing time period.
func addClockInOutPair(app *pocketbase.PocketBase, clockInTimestamp, clockOutTimestamp time.Time) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	err := app.RunInTransaction(func(txApp core.App) error {
		collection, err := txApp.FindCollectionByNameOrId("work_clock")
		if err != nil {
			return fmt.Errorf("failed to find work clock collection: %w", err)
		}

		clockInRecord, err := createWorkClockRecord(txApp, collection, clockInTimestamp, true)
		if err != nil {
			return fmt.Errorf("failed to create clock in record: %w", err)
		}

		clockOutRecord, err := createWorkClockRecord(txApp, collection, clockOutTimestamp, false)
		if err != nil {
			return fmt.Errorf("failed to create clock out record: %w", err)
		}

		if err := checkValidity(txApp, clockInRecord.Id); err != nil {
			return fmt.Errorf("modified clock in record with id '%s' is not valid: %w", clockInRecord.Id, err)
		}

		if err := checkValidity(txApp, clockOutRecord.Id); err != nil {
			return fmt.Errorf("modified clock out record with id '%s' is not valid: %w", clockOutRecord.Id, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to add clock in/out pair: %w", err)
	}

	return nil
}

// createWorkClockRecord creates a new work_clock record with the specified parameters.
// This function centralizes the creation of work_clock records to eliminate code duplication.
// If a record with the same timestamp and clock_in value already exists, it returns the existing
// record instead of creating a duplicate.
//
// Parameters:
// - app: The App interface (typically a PocketBase instance or transaction)
// - collection: The work_clock collection (optional, can be nil)
// - timestamp: The timestamp for the record
// - clockIn: Boolean flag indicating whether this is a clock in (true) or clock out (false) record
//
// Returns:
// - The newly created record or the existing record if a duplicate is found
// - An error if the operation fails
func createWorkClockRecord(app core.App, collection *core.Collection, timestamp time.Time, clockIn bool) (*core.Record, error) {
	var err error
	if collection == nil {
		collection, err = app.FindCollectionByNameOrId("work_clock")
		if err != nil {
			return nil, fmt.Errorf("failed to find work clock collection: %w", err)
		}
	}

	record := core.NewRecord(collection)
	record.Set("timestamp", timestamp)
	record.Set("clock_in", clockIn)

	if err := app.Save(record); err != nil {
		existingRecord, existingErr := app.FindFirstRecordByFilter(collection, "timestamp = {:timestamp} && clock_in = {:clockIn}", dbx.Params{
			"timestamp": record.GetDateTime("timestamp"),
			"clockIn":   record.GetBool("clock_in"),
		})
		if existingErr == nil && existingRecord != nil {
			return existingRecord, nil
		}

		return nil, fmt.Errorf("failed to save work clock record: %w", err)
	}

	return record, nil
}

// addManyWorkClockRecords creates multiple clock in and clock out records with the specified timestamps.
// This is useful for bulk importing or migrating historical work time data from another system.
// All records are validated to ensure they maintain proper sequence with existing records.
//
// Parameters:
// - app: The PocketBase application instance
// - clockInTimestamps: A slice of timestamps for the clock in records
// - clockOutTimestamps: A slice of timestamps for the clock out records
//
// Returns:
// - An error if the operation fails or if adding any of the records would violate sequence constraints
//
// The operation is performed within a single transaction to ensure data consistency and atomicity.
// All records are created in the order provided in the slices, and each record is validated against
// the existing records to ensure proper alternation of clock in/out states.
// If any validation fails, the entire transaction is rolled back and no records are added.
func addManyWorkClockRecords(app *pocketbase.PocketBase, clockInTimestamps, clockOutTimestamps []time.Time) error {
	workClockMutex.Lock()
	defer workClockMutex.Unlock()

	err := app.RunInTransaction(func(txApp core.App) error {
		collection, err := txApp.FindCollectionByNameOrId("work_clock")
		if err != nil {
			return fmt.Errorf("failed to find work clock collection: %w", err)
		}

		clockInRecordIDs := make([]string, len(clockInTimestamps))

		for i, clockInTimestamp := range clockInTimestamps {
			record, err := createWorkClockRecord(txApp, collection, clockInTimestamp, true)
			if err != nil {
				return fmt.Errorf("failed to create clock in record at time '%s': %w", clockInTimestamp.Format(time.RFC3339), err)
			}

			clockInRecordIDs[i] = record.Id
		}

		clockOutRecordIDs := make([]string, len(clockOutTimestamps))

		for i, clockOutTimestamp := range clockOutTimestamps {
			record, err := createWorkClockRecord(txApp, collection, clockOutTimestamp, false)
			if err != nil {
				return fmt.Errorf("failed to create clock out record at time '%s': %w", clockOutTimestamp.Format(time.RFC3339), err)
			}

			clockOutRecordIDs[i] = record.Id
		}

		for i, recordID := range clockInRecordIDs {
			if err := checkValidity(txApp, recordID); err != nil {
				return fmt.Errorf("added clock in record at time '%s' is not valid: %w", clockInTimestamps[i].Format(time.RFC3339), err)
			}
		}

		for i, recordID := range clockOutRecordIDs {
			if err := checkValidity(txApp, recordID); err != nil {
				return fmt.Errorf("added clock out record at time '%s' is not valid: %w", clockOutTimestamps[i].Format(time.RFC3339), err)
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to add multiple work clock records: %w", err)
	}

	return nil
}
