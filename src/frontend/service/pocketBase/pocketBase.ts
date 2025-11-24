/**
 * PocketBase Client Configuration and Helper Functions
 *
 * This module configures and exports a singleton PocketBase client instance
 * along with utility functions for handling date formatting required by PocketBase.
 * It also provides Effect-based error handling patterns for PocketBase operations.
 */
import PocketBase from "pocketbase";

// Create a single PocketBase instance to be used throughout the app
// This ensures we have only one connection to the backend
const pb = new PocketBase();

export default pb;

/**
 * Generic Result type for Go-style error handling
 * Returns a tuple of [value, null] on success or [null, error] on failure
 */
export type Result<T, E> = [T, null] | [null, E];

/**
 * Helper to create a success result
 */
export function ok<T>(value: T): [T, null] {
  return [value, null];
}

/**
 * Helper to create an error result
 */
export function err<E>(error: E): [null, E] {
  return [null, error];
}

/**
 * Generic error type for consistent error handling throughout the application
 *
 * @template T - String literal type identifying the specific error
 * @property {T} type - Type of the error for exhaustive error handling
 * @property {string} message - Human readable error message for concatenation and error logging
 */
export type Error<T extends string> = {
  type: T; // Type of the error for exhaustive error handling.
  message: string; // Human readable error message for concatenation and error logging.
};

/**
 * Generic error type for common error cases
 * Provides a standardized way to represent general errors throughout the application
 *
 * @extends {Error<"generic">}
 * @property {unknown} [innerError] - Optional inner error for additional context
 */
export type GenericError = Error<"generic"> & {
  innerError?: unknown; // Optional inner error for additional context.
};

/**
 * Creates a new GenericError with the provided message and optional inner error
 * Useful for wrapping unknown errors or creating standardized error objects
 *
 * @param {string} message - Human readable error message
 * @param {unknown} [innerError] - Optional inner error for additional context
 * @returns {GenericError} A new generic error object
 * @example
 * // Returns { type: "generic", message: "Failed to connect to database", innerError: originalError }
 * newGenericError("Failed to connect to database", originalError)
 */
export function newGenericError(
  message: string,
  innerError?: unknown,
): GenericError {
  return {
    type: "generic",
    message,
    innerError,
  };
}

/**
 * Wraps an existing error with additional context by prepending and/or appending text to the error message
 * This function maintains the original error type while enriching the message with more context
 *
 * @template TErrorType - String literal type identifying the specific error
 * @template TError - The error type extending Error<TErrorType>
 * @param {string} [prependMessage=""] - Text to prepend to the error message
 * @param {TError} error - The original error object to wrap
 * @param {string} [appendMessage=""] - Text to append to the error message
 * @returns {TError} A new error object with the same type but modified message
 * @example
 * // Returns { type: "dateInvalid", message: "Failed to process date: The provided date is invalid. Please try again." }
 * wrapError(
 *   "Failed to process date:",
 *   { type: "dateInvalid", message: "The provided date is invalid." },
 *   "Please try again."
 * )
 */
export function wrapError<
  TErrorType extends string,
  TError extends Error<TErrorType>,
>(prependMessage = "", error: TError, appendMessage = ""): TError {
  const message = `${prependMessage ? prependMessage + " " : ""}${error.message}${appendMessage ? " " + appendMessage : ""}`;
  return {
    ...error,
    message,
  };
}

/**
 * Type guard to check if an unknown value is an Error type
 * Used for safe error handling and type narrowing in try/catch blocks
 *
 * @param {unknown} error - The value to check
 * @returns {boolean} True if the value conforms to the Error type structure
 * @example
 * try {
 *   // some operation that might throw
 * } catch (err) {
 *   if (isError(err)) {
 *     // err is now typed as Error<string>
 *     console.log(err.type, err.message);
 *   }
 * }
 */
export function isError(error: unknown): error is Error<string> {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error &&
    typeof error.type === "string" &&
    typeof error.message === "string"
  );
}

/**
 * Converts any error type to a human-readable string representation
 * Provides consistent error formatting for logging or displaying errors to users
 * Supports custom Error<T>, standard Error instances, and string errors
 *
 * @param {unknown} error - The error to stringify, which can be of any type
 * @returns {string | undefined} A formatted error string, or undefined if the error cannot be stringified
 * @example
 * // For an Error<"network"> returns "[network-error] Failed to connect to server"
 * // For a standard Error returns "Error: File not found"
 * // For a string error returns "Error: Something went wrong"
 * stringifyError(someError)
 */
export function stringifyError(error: unknown): string | undefined {
  if (isError(error)) {
    return `[${error.type}-error] ${error.message}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  if (typeof error === "string") {
    return `Error: ${error}`;
  }

  return undefined;
}

/**
 * Extended error type that wraps PocketBase ClientResponseError
 * Used for errors that occur during PocketBase API operations
 *
 * @template T - String literal type identifying the specific error
 * @extends {Error<T>}
 * @property {unknown} [innerError] - Original PocketBase error for additional context
 */
export type ResponseError<T extends string> = Error<T> & {
  innerError?: unknown;
};

/**
 * Error type for record deletion operations
 *
 * @extends {ResponseError<"deleteRecord">}
 */
export type DeleteRecordError = ResponseError<"deleteRecord">;

/**
 * Error type for record creation operations
 *
 * @extends {ResponseError<"createRecord">}
 */
export type CreateRecordError = ResponseError<"createRecord">;

/**
 * Error type for fetching a list of records
 *
 * @extends {ResponseError<"getFullRecordList">}
 */
export type GetFullRecordListError = ResponseError<"getFullRecordList">;

/**
 * Error type for invalid Date objects
 *
 * @extends {Error<"dateInvalid">}
 */
export type DateInvalidError = Error<"dateInvalid">;

/**
 * Error type for invalid date string formats
 *
 * @extends {Error<"dateInvalidFormat">}
 */
export type DateInvalidFormatError = Error<"dateInvalidFormat">;

/**
 * Splits a Date object into RFC3339 date and time parts
 * Used as a helper function for date formatting
 *
 * @param date - The JavaScript Date object to convert
 * @returns A Result containing a tuple of date and time parts, or an error
 */
export function dateToRFC3339Parts(
  date: Date,
): Result<[string, string], DateInvalidError | DateInvalidFormatError> {
  if (isNaN(date.getTime())) {
    return err({
      type: "dateInvalid",
      message: "The provided date is invalid.",
    });
  }

  // First try splitting with 'T' separator (ISO standard)
  let parts = date.toISOString().split("T");

  // Fallback to space separator if needed
  if (parts.length !== 2) {
    parts = date.toISOString().split(" ");
  }

  // If we still don't have two parts, the date format is unexpected
  if (parts.length !== 2) {
    return err({
      type: "dateInvalidFormat",
      message:
        "Unexpected date format: ISO string did not contain 'T' or ' ' separator.",
    });
  }

  return ok(parts as [string, string]);
}

/**
 * Formats a Date object to RFC3339 format with space separator
 * This format is expected by PocketBase when storing timestamps
 *
 * @param date - The JavaScript Date object to convert
 * @returns A Result containing the formatted string, or an error
 * @example
 * // Returns ["2025-03-28 12:30:45.000Z", null]
 * dateToRFC3339(new Date())
 */
export function dateToRFC3339(
  date: Date,
): Result<string, DateInvalidError | DateInvalidFormatError> {
  const [parts, error] = dateToRFC3339Parts(date);
  if (error) {
    return err(error);
  }
  return ok(parts.join(" "));
}

/**
 * Converts an RFC3339 string to a JavaScript Date object
 * Handles both space-separated and T-separated RFC3339 formats
 *
 * @param dateString - The RFC3339 formatted date string to convert
 * @returns A Result containing the Date object, or an error
 * @example
 * // Both formats are supported:
 * rfc3339ToDate("2025-03-28 12:30:45.000Z")
 * rfc3339ToDate("2025-03-28T12:30:45.000Z")
 */
export function rfc3339ToDate(
  dateString: string,
): Result<Date, DateInvalidFormatError> {
  if (!dateString) {
    return err({
      type: "dateInvalidFormat",
      message: "The provided date string is empty.",
    });
  }

  // Convert space-separated format to T-separated for JavaScript Date compatibility
  const formattedDate =
    dateString.indexOf(" ") !== -1 && dateString.indexOf("T") === -1 ?
      dateString.split(" ").join("T")
    : dateString;

  // Create and validate the date
  const date = new Date(formattedDate);
  if (isNaN(date.getTime())) {
    return err({
      type: "dateInvalidFormat",
      message: `The provided date string "${dateString}" is invalid.`,
    });
  }
  return ok(date);
}

/**
 * Validates and normalizes an RFC3339 date string
 * Parses a date string to ensure it's valid and then reformats it to the standard format
 *
 * @param dateString - The RFC3339 formatted date string to validate and normalize
 * @returns A Result containing the normalized date string, or an error
 * @example
 * // Returns ["2025-03-28 12:30:45.000Z", null] (normalized format)
 * assertRFC3339Date("2025-03-28T12:30:45.000Z")
 */
export function assertRFC3339Date(
  dateString: string,
): Result<string, DateInvalidFormatError | DateInvalidError> {
  const [date, error] = rfc3339ToDate(dateString);
  if (error) {
    return err(error);
  }
  return dateToRFC3339(date);
}
