/**
 * Work Clock Service Module
 *
 * This module provides Effect-based functions for managing work clock entries.
 * It handles the conversion between PocketBase's string-based dates and JavaScript Date objects,
 * as well as providing a clean API for creating, retrieving, and deleting time entries.
 * All operations use Effect for predictable error handling.
 */
import { Accessor, createSignal } from "solid-js";

import {
  ClientResponseError,
  RecordSubscription,
  UnsubscribeFunc,
} from "pocketbase";

import { Cause, Effect, Exit, pipe } from "effect";

import {
  ParseError,
  WorkClockRecord,
  validateWorkClock,
  workClock,
} from "./pocketBase/collections";
import pb, {
  DateInvalidError,
  DateInvalidFormatError,
  type Error,
  GetFullRecordListError,
  assertRFC3339Date,
  dateToRFC3339,
  rfc3339ToDate,
  wrapError,
} from "./pocketBase/pocketBase";

/**
 * TimeStampEntry interface
 * Represents the type-hardened data structure for work clock entries with proper Date objects
 * Used for external API communication with the application
 *
 * @interface TimeStampEntry
 * @property {string} [id] - Optional unique identifier (may not be present for new entries)
 * @property {Date} timestamp - JavaScript Date object representing the timestamp
 * @property {boolean} clock_in - Flag to indicate type of entry (true=clock-in, false=clock-out)
 */
export interface TimeStampEntry {
  id?: string;
  timestamp: Date;
  clock_in: boolean; // true for clock-in, false for clock-out
}

/**
 * Parses and validates raw PocketBase record data into a type-safe TimeStampEntry
 *
 * This function performs two important validations:
 * 1. Schema validation against the workClockSchema
 * 2. Conversion of string timestamp to a JavaScript Date object
 *
 * @param {WorkClockRecord} value - Value to be parsed, typically a raw record from PocketBase
 * @returns An Effect that yields a validated TimeStampEntry with proper Date object,
 *          or fails with ParseError or DateInvalidFormatError
 * @private
 */
function parseTimeStampEntry(
  value: WorkClockRecord,
): Effect.Effect<TimeStampEntry, ParseError | DateInvalidFormatError, never> {
  return pipe(
    validateWorkClock(value),
    Effect.flatMap((record) =>
      pipe(
        rfc3339ToDate(record.timestamp),
        Effect.mapError((error) => ({
          ...error,
          message: `Invalid date format from PocketBase for record ${record.id}: ${error.message}`,
        })),
        Effect.map(
          (timestampDate) =>
            ({
              id: record.id,
              timestamp: timestampDate,
              clock_in: record.clock_in,
            }) as TimeStampEntry,
        ),
      ),
    ),
  );
}

/**
 * Error type for failures when deleting time entries
 *
 * @typedef {Error<"deleteTimeEntry">} DeleteTimeEntryError
 * @property {string} type - Always "deleteTimeEntry" to identify this error type
 * @property {string} message - Human-readable error message describing the failure
 * @property {Error} [innerError] - Optional underlying system error for debugging
 */
type DeleteTimeEntryError = Error<"deleteTimeEntry"> & {
  innerError?: globalThis.Error;
};

/**
 * Deletes a time entry (pair) by its clock in ID
 *
 * This function deletes both a clock-in entry and its associated clock-out entry
 * by sending a request to the server's `/api/work_clock/delete` endpoint.
 *
 * @param {string} clockInId - The unique identifier of the clock in time entry to delete
 * @returns {Effect.Effect<boolean, DeleteTimeEntryError>} An Effect that yields true if successful, or fails with DeleteTimeEntryError
 * @example
 * // Delete a time entry (pair)
 * const result = await Effect.runPromise(deleteTimeEntry("record123"));
 * if (Effect.isSuccess(result)) {
 *   console.log("Time entry deleted successfully");
 * }
 */
export function deleteTimeEntry(
  clockInId: string,
): Effect.Effect<boolean, DeleteTimeEntryError> {
  return Effect.tryPromise({
    try: async () => {
      // Create FormData with the clock_in_id parameter
      const formData = new FormData();
      formData.append("clock_in_id", clockInId);

      // Use the validated API endpoint
      const response = await fetch("/api/work_clock/delete", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${pb.authStore.token}` },
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      return true;
    },
    catch: (error) => {
      console.error(
        "Unexpected error occurred while deleting time entry (pair):",
        error,
      );
      return {
        type: "deleteTimeEntry",
        message: `Failed to delete the time entry with clock in id: "${clockInId}".`,
        innerError: error instanceof Error ? error : undefined,
      } as DeleteTimeEntryError;
    },
  });
}

/**
 * Creates a filter string for date range queries
 * Helper function to build PocketBase filter expressions for time ranges
 *
 * @param from - Optional start Date or RFC3339 string (inclusive)
 * @param until - Optional end Date or RFC3339 string (exclusive)
 * @returns An Effect that yields a filter string for PocketBase queries, or fails with date-related errors
 * @private
 */
function betweenFilter(
  from: Date | undefined | string,
  until: Date | undefined | string,
): Effect.Effect<string, DateInvalidError | DateInvalidFormatError> {
  const fromStr =
    from != null ?
      typeof from === "string" ?
        assertRFC3339Date(from)
      : dateToRFC3339(from)
    : undefined;
  const untilStr =
    until != null ?
      typeof until === "string" ?
        assertRFC3339Date(until)
      : dateToRFC3339(until)
    : undefined;

  if (fromStr != null && untilStr != null) {
    return pipe(
      Effect.all([fromStr, untilStr]),
      Effect.map(([from, until]) => {
        return `timestamp >= '${from}' && timestamp < '${until}'`;
      }),
    );
  } else if (fromStr != null) {
    return pipe(
      fromStr,
      Effect.map((from) => `timestamp >= '${from}'`),
    );
  } else if (untilStr != null) {
    return pipe(
      untilStr,
      Effect.map((until) => `timestamp < '${until}'`),
    );
  }

  return Effect.succeed("");
}

/**
 * Union of possible error types returned by getTimeEntries function
 */
export type GetTimeEntriesError =
  | DateInvalidFormatError
  | DateInvalidError
  | GetFullRecordListError
  | ParseError;

/**
 * Get time entries within a specific date range using proper Date objects
 * Fetches all records that fall within the provided date range, sorted by timestamp descending
 *
 * @param from - Optional start Date (inclusive)
 * @param until - Optional end Date (exclusive)
 * @returns An Effect that yields an array of TimeStampEntry objects with proper Date timestamps,
 *          or fails with GetTimeEntriesError
 * @example
 * // Get all entries
 * const allEntries = await Effect.runPromise(getTimeEntries());
 *
 * // Get entries from a specific date
 * const fromDate = new Date('2025-03-01');
 * const specificEntries = await Effect.runPromise(getTimeEntries(fromDate));
 *
 * // Get entries within a date range
 * const startDate = new Date('2025-03-01');
 * const endDate = new Date('2025-03-31');
 * const rangeEntries = await Effect.runPromise(getTimeEntries(startDate, endDate));
 */
export function getTimeEntries(
  from?: Date,
  until?: Date,
): Effect.Effect<TimeStampEntry[], GetTimeEntriesError> {
  return pipe(
    betweenFilter(from, until),
    Effect.flatMap((filter: string) =>
      Effect.tryPromise({
        try: () =>
          workClock().getFullList({
            sort: "-timestamp", // Sort by timestamp descending (newest first)
            batch: 1000, // Batch 1000 records per request
            ...(filter ? { filter } : {}), // Only add the filter if it's not empty
          }),
        catch: (error) => {
          const innerError =
            error instanceof ClientResponseError ? error : undefined;
          if (error != null && !innerError) {
            console.error(
              "Unexpected error occurred while fetching time entries:",
              error,
            );
          }
          return {
            type: "getFullRecordList",
            message: `Failed to fetch time entries with filter: "${filter}".`,
            innerError,
          } as GetFullRecordListError;
        },
      }),
    ),
    Effect.flatMap((records) => Effect.all(records.map(parseTimeStampEntry))),
  );
}

/**
 * Union of possible error types returned by addClockEntry function
 *
 * @typedef {Error<"addClockEntry">} AddClockEntryError
 * @property {string} type - Error type identifier ("addClockEntry")
 * @property {string} message - Human-readable error message
 * @property {Error} [innerError] - Optional underlying system error for debugging
 * @typedef {DateInvalidError} AddClockEntryError - Error when a date is invalid
 * @typedef {DateInvalidFormatError} AddClockEntryError - Error when a date has invalid format
 * @typedef {ParseError} AddClockEntryError - Error when parsing record data fails
 */
export type AddClockEntryError =
  | (Error<"addClockEntry"> & {
      innerError?: globalThis.Error;
    })
  | DateInvalidError
  | DateInvalidFormatError
  | ParseError;

/**
 * Add a new clock-in or clock-out entry with proper Date handling
 * Creates a new record in the database with the provided timestamp or current time
 *
 * @param clockIn - Boolean indicating whether this is a clock-in (true) or clock-out (false) entry
 * @param timestamp - Optional Date object for the timestamp (defaults to current time)
 * @returns An Effect that yields the created TimeStampEntry with Date object,
 *          or fails with AddClockEntryError
 * @example
 * // Add a clock-in entry with the current time
 * const clockInEntry = await Effect.runPromise(addClockEntry(true));
 *
 * // Add a clock-out entry with a specific time
 * const specificTime = new Date('2025-03-28T17:30:00');
 * const clockOutEntry = await Effect.runPromise(addClockEntry(false, specificTime));
 */
export function addClockEntry(
  clockIn: boolean,
  timestamp: Date = new Date(),
): Effect.Effect<TimeStampEntry, AddClockEntryError> {
  return pipe(
    dateToRFC3339(timestamp),
    Effect.flatMap((timestampStr) => {
      return Effect.tryPromise({
        try: async () => {
          let response;

          // Use the appropriate API endpoint based on whether this is a regular clock in/out
          // or one with a specific timestamp
          if (
            timestamp === new Date() ||
            Math.abs(timestamp.getTime() - new Date().getTime()) < 1000
          ) {
            // For current time, use the simpler API endpoints
            if (clockIn) {
              response = await fetch("/api/work_clock/clock_in", {
                method: "GET",
                headers: { Authorization: `Bearer ${pb.authStore.token}` },
              });
            } else {
              response = await fetch("/api/work_clock/clock_out", {
                method: "GET",
                headers: { Authorization: `Bearer ${pb.authStore.token}` },
              });
            }
          } else {
            // For specific timestamps, use the clock_in_out_at endpoint
            const formData = new FormData();
            formData.append("clock_in", clockIn.toString());
            formData.append("timestamp", timestampStr);

            response = await fetch("/api/work_clock/clock_in_out_at", {
              method: "POST",
              body: formData,
              headers: { Authorization: `Bearer ${pb.authStore.token}` },
            });
          }

          if (!response.ok) {
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`,
            );
          }

          // Since our API endpoint doesn't return the created record,
          // we need to fetch the latest record that matches our criteria
          const latestRecordsResponse = await workClock().getFullList({
            sort: "-timestamp",
            filter: `clock_in=${clockIn}`,
            limit: 1,
          });

          if (latestRecordsResponse.length === 0) {
            throw new Error("Could not find the newly created record");
          }

          return latestRecordsResponse[0];
        },
        catch: (error) => {
          console.error(
            `Unexpected error occurred while adding ${clockIn ? "clock-in" : "clock-out"} entry:`,
            error,
          );
          return {
            type: "addClockEntry",
            message: `Failed to add ${clockIn ? "clock-in" : "clock-out"} entry.`,
            innerError: error instanceof Error ? error : undefined,
          } as AddClockEntryError;
        },
      });
    }),
    Effect.flatMap((record) => parseTimeStampEntry(record)),
  );
}

/**
 * Type definition for modify timestamp error
 *
 * @typedef {Error<"modifyTimestamp">} ModifyTimestampError
 * @property {string} type - Error type identifier ("modifyTimestamp")
 * @property {string} message - Human-readable error message about the timestamp modification failure
 * @property {Error} [innerError] - Optional underlying system error for debugging
 * @typedef {DateInvalidError} ModifyTimestampError - Error when the provided date is invalid
 * @typedef {DateInvalidFormatError} ModifyTimestampError - Error when the date format is invalid
 */
export type ModifyTimestampError =
  | (Error<"modifyTimestamp"> & {
      innerError?: globalThis.Error;
    })
  | DateInvalidFormatError
  | DateInvalidError;

/**
 * Modifies the timestamp of an existing work clock record
 *
 * This function updates the timestamp of a specific work clock record identified by its ID.
 * It ensures data integrity by using the server-side validation to prevent creating invalid
 * sequences of clock in/out records.
 *
 * @param workClockId - The unique identifier of the work clock record to modify
 * @param newTimestamp - The new Date object to set as the timestamp
 * @returns An Effect that yields true on success, or fails with ModifyTimestampError
 * @example
 * // Modify a work clock record timestamp
 * const recordId = "record123";
 * const newTime = new Date('2025-03-28T17:30:00');
 * const result = await Effect.runPromise(modifyWorkClockTimestamp(recordId, newTime));
 */
export function modifyWorkClockTimestamp(
  workClockId: string,
  newTimestamp: Date,
): Effect.Effect<boolean, ModifyTimestampError> {
  return pipe(
    dateToRFC3339(newTimestamp),
    Effect.flatMap((timestampStr) => {
      return Effect.tryPromise({
        try: async () => {
          // Create FormData with the required parameters
          const formData = new FormData();
          formData.append("work_clock_id", workClockId);
          formData.append("new_timestamp", timestampStr);

          const response = await fetch("/api/work_clock/modify", {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${pb.authStore.token}` },
          });

          if (!response.ok) {
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`,
            );
          }

          return true;
        },
        catch: (error) => {
          console.error(
            "Unexpected error occurred while modifying work clock timestamp:",
            error,
          );
          return {
            type: "modifyTimestamp",
            message: `Failed to modify timestamp for work clock record: "${workClockId}".`,
            innerError: error instanceof Error ? error : undefined,
          } as ModifyTimestampError;
        },
      });
    }),
  );
}

/**
 * Type definition for adding clock in/out pair error
 *
 * @typedef {Error<"addClockInOutPair">} AddClockInOutPairError
 * @property {string} type - Error type identifier ("addClockInOutPair")
 * @property {string} message - Human-readable error message about the clock in/out pair addition failure
 * @property {Error} [innerError] - Optional underlying system error for debugging
 * @typedef {DateInvalidFormatError} AddClockInOutPairError - Error when one of the dates has invalid format
 * @typedef {DateInvalidError} AddClockInOutPairError - Error when one of the dates is invalid
 */
export type AddClockInOutPairError =
  | (Error<"addClockInOutPair"> & {
      innerError?: globalThis.Error;
    })
  | DateInvalidFormatError
  | DateInvalidError;

/**
 * Adds a complete clock in/out pair with specified timestamps
 *
 * This function creates a pair of records: one for clock in and one for clock out,
 * with the specified timestamps. This is useful for entering historical work periods
 * or for manual corrections.
 *
 * @param clockInTimestamp - The Date object for the clock in record
 * @param clockOutTimestamp - The Date object for the clock out record
 * @returns An Effect that yields true on success, or fails with AddClockInOutPairError
 * @example
 * // Add a complete clock in/out pair
 * const clockIn = new Date('2025-03-28T09:00:00');
 * const clockOut = new Date('2025-03-28T17:00:00');
 * const result = await Effect.runPromise(addClockInOutPair(clockIn, clockOut));
 */
export function addClockInOutPair(
  clockInTimestamp: Date,
  clockOutTimestamp: Date,
): Effect.Effect<boolean, AddClockInOutPairError> {
  return pipe(
    Effect.all([
      dateToRFC3339(clockInTimestamp),
      dateToRFC3339(clockOutTimestamp),
    ]),
    Effect.flatMap(([clockInStr, clockOutStr]) => {
      return Effect.tryPromise({
        try: async () => {
          // Create FormData with the required parameters
          const formData = new FormData();
          formData.append("clock_in_timestamp", clockInStr);
          formData.append("clock_out_timestamp", clockOutStr);

          const response = await fetch(
            "/api/work_clock/add_clock_in_out_pair",
            {
              method: "POST",
              body: formData,
              headers: { Authorization: `Bearer ${pb.authStore.token}` },
            },
          );

          if (!response.ok) {
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`,
            );
          }

          return true;
        },
        catch: (error) => {
          console.error(
            "Unexpected error occurred while adding clock in/out pair:",
            error,
          );
          return {
            type: "addClockInOutPair",
            message: "Failed to add clock in/out pair.",
            innerError: error instanceof Error ? error : undefined,
          } as AddClockInOutPairError;
        },
      });
    }),
  );
}

/**
 * Type definition for Legacy Import-related errors
 *
 * @typedef {Error<"legacyImport">} LegacyImportError
 * @property {string} type - Error type identifier ("legacyImport")
 * @property {string} message - Human-readable error message about the import failure
 * @property {Error} [innerError] - Optional underlying system error for debugging
 */
export type LegacyImportError = Error<"legacyImport"> & {
  innerError?: globalThis.Error;
};

/**
 * Type definition for Legacy Import response
 */
export interface LegacyImportResponse {
  success: boolean;
  message: string;
}

/**
 * Uploads a legacy database file for import into the work_clock collection
 *
 * This function takes a database file (usually .db SQLite file), uploads it to the
 * backend's /api/legacy_import endpoint, which extracts activity logs and imports
 * them into the PocketBase work_clock collection.
 *
 * @param file - The database file to upload (File or Blob)
 * @returns An Effect that yields the server response on success, or fails with LegacyImportError
 * @example
 * // Upload a database file from a file input
 * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
 * const file = fileInput.files?.[0];
 * if (file) {
 *   const result = await Effect.runPromise(uploadLegacyDatabase(file));
 *   console.log(result.message);
 * }
 */
export function uploadLegacyDatabase(
  file: File | Blob,
): Effect.Effect<LegacyImportResponse, LegacyImportError> {
  return Effect.tryPromise({
    try: async () => {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append(
        "database",
        file,
        file instanceof File ? file.name : "database.db",
      );

      // Send the request to the server
      const response = await fetch("/api/legacy_import", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${pb.authStore.token}` },
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;

        try {
          // Try to extract a more detailed error message from the response
          const errorData = (await response.json()) as unknown;
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (
            typeof errorData === "object" &&
            errorData != null &&
            "message" in errorData &&
            typeof errorData.message === "string"
          ) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse the JSON, just use the status text
          errorMessage = response.statusText;
        }

        throw new Error(errorMessage);
      }

      // Parse the successful response
      return (await response.json()) as LegacyImportResponse;
    },
    catch: (error) => {
      console.error("Error uploading legacy database:", error);
      return {
        type: "legacyImport",
        message:
          error instanceof Error ?
            error.message
          : "Failed to upload legacy database file",
        innerError: error instanceof Error ? error : undefined,
      };
    },
  });
}

/**
 * TimeEntriesStream interface
 * Represents a reactive stream of time entries with loading state and error handling
 * Used for real-time updates of time entries from PocketBase
 *
 * @interface TimeEntriesStream
 * @property {Accessor<boolean>} loading - Reactive signal indicating if data is being loaded
 * @property {Accessor<TimeStampEntry[]>} entries - Reactive signal containing the current entries sorted by oldest first
 * @property {Accessor<GetTimeEntriesStreamError | undefined>} error - Reactive signal containing any error that occurred
 * @property {() => undefined | GetTimeEntriesStreamError} subscribe - Function to subscribe to real-time updates
 * @property {() => void} unsubscribe - Function to unsubscribe from real-time updates
 */
type TimeEntriesStream = {
  loading: Accessor<boolean>;
  entries: Accessor<TimeStampEntry[]>;
  error: Accessor<GetTimeEntriesStreamError | undefined>;
  subscribe: () => undefined | GetTimeEntriesStreamError;
  unsubscribe: () => void;
};

/**
 * Error type for when an attempt is made to subscribe to a stream that was already subscribed
 *
 * @typedef {Error<"entriesStreamWasSubscribed">} EntriesStreamWasSubscribedError
 * @property {string} type - Error type identifier ("entriesStreamWasSubscribed")
 * @property {string} message - Human-readable error message explaining the subscription conflict
 */
type EntriesStreamWasSubscribedError = Error<"entriesStreamWasSubscribed">;

/**
 * Error type for invalid date filter parameters used in stream creation
 *
 * @typedef {Error<"filterNotValid">} FilterNotValidError
 * @property {string} type - Error type identifier ("filterNotValid")
 * @property {string} message - Human-readable error message explaining the filter validation failure
 */
type FilterNotValidError = Error<"filterNotValid">;

/**
 * Union of possible error types returned by getTimeEntriesStream function
 * Combines errors from getTimeEntries with stream-specific errors
 */
type GetTimeEntriesStreamError =
  | GetTimeEntriesError
  | EntriesStreamWasSubscribedError
  | FilterNotValidError;

/**
 * Creates a reactive stream of time entries with real-time updates from PocketBase
 *
 * This function provides a reactive interface for time entries that:
 * 1. Loads initial data from the specified date range
 * 2. Automatically subscribes to real-time updates (if autoSubscribe is true)
 * 3. Maintains a sorted array of entries as changes occur
 * 4. Provides reactive signals for loading state, entries, and errors
 *
 * @param {Date} [from] - Optional start date for filtering entries (inclusive)
 * @param {Date} [until] - Optional end date for filtering entries (exclusive)
 * @param {boolean} [autoSubscribe=true] - Whether to automatically subscribe to real-time updates
 * @returns {TimeEntriesStream} A stream object with reactive signals and subscription control methods
 * @example
 * // Create a stream for all entries with auto-subscription
 * const stream = getTimeEntriesStream();
 *
 * // Create a stream for a specific date range without auto-subscription
 * const startDate = new Date('2025-03-01');
 * const endDate = new Date('2025-03-31');
 * const stream = getTimeEntriesStream(startDate, endDate, false);
 *
 * // Manually subscribe later
 * stream.subscribe();
 *
 * // Access the reactive entries
 * const entries = stream.entries();
 *
 * // Clean up when done
 * stream.unsubscribe();
 */
export function getTimeEntriesStream(
  from?: Date,
  until?: Date,
  autoSubscribe = true,
): TimeEntriesStream {
  const timeStampEntryArray: TimeStampEntry[] = [];
  const subscriptionEvents: RecordSubscription<WorkClockRecord>[] = [];

  let subscription: Promise<UnsubscribeFunc> | undefined;
  let isSubscribed = false;
  let isLoading = false;

  const [loadingSignal, setLoadingSignal] = createSignal(isLoading);
  const [entries, setEntries] = createSignal<TimeStampEntry[]>([]);
  const [error, setError] = createSignal<GetTimeEntriesStreamError | undefined>(
    undefined,
  );

  const setLoading = (loading: boolean) => {
    isLoading = loading;
    setLoadingSignal(loading);
  };

  // Sort by date (oldest first)
  const sortTimeStampEntries = () => {
    timeStampEntryArray.sort((a, b) => {
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  };

  const updateTimeStampEntries = (
    method: "create" | "update" | "delete",
    entry: TimeStampEntry,
  ) => {
    switch (method) {
      case "create": {
        if (
          timeStampEntryArray.length === 0 ||
          entry.timestamp.getTime() >
            timeStampEntryArray[
              timeStampEntryArray.length - 1
            ].timestamp.getTime()
        ) {
          // If the new entry is the most recent, add it to the end
          timeStampEntryArray.push(entry);
        } else if (
          entry.timestamp.getTime() < timeStampEntryArray[0].timestamp.getTime()
        ) {
          // If the new entry is the oldest, add it to the beginning
          timeStampEntryArray.unshift(entry);
        } else {
          // Otherwise, find the correct position to insert it
          const index = timeStampEntryArray.findIndex(
            (e) => e.timestamp.getTime() > entry.timestamp.getTime(),
          );
          if (index === -1) {
            // If no larger entry is found, push it to the end
            timeStampEntryArray.push(entry);
          } else {
            timeStampEntryArray.splice(index, 0, entry);
          }
        }
        break;
      }
      case "update": {
        // Find the entry to update
        const index = timeStampEntryArray.findIndex((e) => e.id === entry.id);
        if (index !== -1) {
          // Update the entry in the array
          timeStampEntryArray[index] = entry;
        } else {
          // If the entry is not found, add it to the array
          timeStampEntryArray.push(entry);
        }
        // Sort the array after updating
        sortTimeStampEntries();
        break;
      }
      case "delete": {
        // Remove the entry from the array
        const index = timeStampEntryArray.findIndex((e) => e.id === entry.id);
        if (index !== -1) {
          timeStampEntryArray.splice(index, 1);
        }
        break;
      }
      default:
        const _missing: never = method;
    }
  };

  const processSubscriptionEvent = (
    event: RecordSubscription<WorkClockRecord>,
    update = true,
  ) => {
    const parseResult = Effect.runSyncExit(parseTimeStampEntry(event.record));
    Exit.match(parseResult, {
      onFailure: (cause) => {
        const errorMessage = "Could not parse the subscription event record:";
        if (Cause.isFailType(cause)) {
          setError(wrapError(errorMessage, cause.error));
        } else {
          setError({
            type: "parseError",
            message: errorMessage + " " + Cause.pretty(cause),
          } as ParseError);
        }
      },
      onSuccess: (entry) => {
        updateTimeStampEntries(
          event.action as "create" | "update" | "delete",
          entry,
        );

        if (update) {
          setEntries([...timeStampEntryArray]);
        }
      },
    });
  };

  const subscribe = (): undefined | GetTimeEntriesStreamError => {
    if (isSubscribed) {
      return undefined;
    }
    if (subscription != null) {
      const error = {
        type: "entriesStreamWasSubscribed",
        message: "Entries stream was already subscribed.",
      } as EntriesStreamWasSubscribedError;

      setError(error);
      return error;
    }

    const filterExit = Effect.runSyncExit(betweenFilter(from, until));

    let filterValue = "";
    let error: GetTimeEntriesStreamError | undefined;

    Exit.match(filterExit, {
      onFailure: (cause) => {
        const errorMessage =
          "The provided filter parameters (from and until) are not valid:";

        if (Cause.isFailType(cause)) {
          error = wrapError(errorMessage, cause.error);
        } else {
          error = {
            type: "filterNotValid",
            message: errorMessage + " " + Cause.pretty(cause),
          } as FilterNotValidError;
        }

        setError(error);
      },
      onSuccess: (value) => {
        filterValue = value;
      },
    });

    // If we had an error, return early
    if (error != null) {
      return error;
    }

    isSubscribed = true;

    subscription = workClock().subscribe(
      "*",
      (e) => {
        if (isLoading) {
          subscriptionEvents.push(e);
        } else {
          processSubscriptionEvent(e);
        }
      },
      {
        filter: filterValue,
      },
    );

    return undefined;
  };

  const unsubscribe = (): void => {
    if (!isSubscribed || subscription == null) {
      return;
    }
    isSubscribed = false;

    setLoading(false);

    void subscription.then((unsubscribe) => unsubscribe());
  };

  Effect.runPromise(
    Effect.gen(function* () {
      setError(undefined);
      setLoading(true);
      setEntries([]);

      if (autoSubscribe) {
        const err = subscribe();
        if (err) {
          setError(err);
          return;
        }
      }

      const currentEntries = yield* getTimeEntries(from, until);
      timeStampEntryArray.push(...currentEntries);
      sortTimeStampEntries();

      for (const entry of subscriptionEvents) {
        processSubscriptionEvent(entry, false);
      }

      setEntries([...timeStampEntryArray]);
      setLoading(false);
    }) as Effect.Effect<TimeEntriesStream, GetTimeEntriesStreamError>,
  ).catch((err) => {
    setLoading(false);
    setError(err as GetTimeEntriesStreamError);
  });

  return {
    loading: loadingSignal,
    entries,
    error,
    subscribe,
    unsubscribe,
  };
}
