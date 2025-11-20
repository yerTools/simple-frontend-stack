import { Accessor, createSignal } from "solid-js";

import { ClientResponseError } from "pocketbase";

import pb, { ResponseError, Result, err, ok } from "../pocketBase/pocketBase";

/**
 * Reactive signal tracking the current authenticated status.
 * Initialized with PocketBase authStore validity and updated on store changes.
 */
const [getAuthenticated, setAuthenticated] = createSignal(pb.authStore.isValid);

const [canCreateAdmin, setCanCreateAdmin] = createSignal<boolean | undefined>(
  undefined,
);

export { canCreateAdmin };

// Subscribe to PocketBase authStore changes to keep signal in sync
pb.authStore.onChange(() => {
  setAuthenticated(pb.authStore.isValid);
});

/**
 * Returns whether the user is currently authenticated.
 * Reads from the reactive signal that reflects PocketBase authStore validity.
 * @returns {boolean} true if a valid auth token is present, false otherwise.
 */
export const isAuthenticated: Accessor<boolean> = () => {
  const current = getAuthenticated();
  const actual = pb.authStore.isValid;
  // If the signal is already correct, return it directly
  if (current === actual) {
    return current;
  }
  setAuthenticated(actual);
  return actual;
};

export type IsAuthenticatedApiError = ResponseError<"isAuthenticatedApi"> & {
  innerError?: unknown;
};

export type IsAuthenticatedApiResponse = {
  isAuthenticated: boolean;
  canCreateAdmin: boolean;
};

async function isAuthenticatedApi(): Promise<
  Result<IsAuthenticatedApiResponse, IsAuthenticatedApiError>
> {
  try {
    const headers: HeadersInit = {};
    if (pb.authStore.token) {
      headers.Authorization = pb.authStore.token;
    }

    const res = await fetch("/api/user/is-authenticated", {
      credentials: "include",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = (await res.json()) as IsAuthenticatedApiResponse;
    return ok(data);
  } catch (error) {
    return err({
      type: "isAuthenticatedApi",
      message: `Failed to fetch user authentication status: ${error}`,
      innerError: error,
    });
  }
}

/**
 * Error type for createUser API failures
 */
export type CreateUserError =
  | (ResponseError<"createUser"> & {
      innerError?: unknown;
    })
  | LoginError;

/**
 * Creates the first user account via POST /api/user/create
 * On success, logs the user in; on failure, returns an error.
 * @param email - email address for the new user
 * @param password - password for the new user
 * @param passwordConfirm - must match the password
 * @returns Promise that resolves to a Result containing true on success or an error
 */
export async function createUser(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<Result<boolean, CreateUserError>> {
  try {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    form.append("passwordConfirm", passwordConfirm);

    const res = await fetch("/api/user/create", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server returned ${res.status}: ${text}`);
    }
  } catch (error) {
    return err({
      type: "createUser",
      message: `Failed to create user: ${error}`,
      innerError: error,
    });
  }

  return loginUser(email, password);
}

/**
 * Error type for loginUser failures
 */
export type LoginError = ResponseError<"login"> & {
  innerError?: ClientResponseError | unknown;
};

/**
 * Authenticates as an existing user via PocketBase auth store.
 * @param email - email address of the user
 * @param password - password of the user
 * @returns Promise that resolves to a Result containing true on successful login or an error
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<Result<boolean, LoginError>> {
  try {
    await pb.collection("users").authWithPassword(email, password);
    return ok(true);
  } catch (error) {
    const inner = error instanceof ClientResponseError ? error : error;
    return err({
      type: "login",
      message: `Failed to login user: ${error}`,
      innerError: inner,
    });
  }
}

void isAuthenticatedApi().then((result) => {
  const [value, error] = result;
  if (error) {
    console.error("isAuthenticatedApi failed", error);
    return;
  }
  if (!value.isAuthenticated) {
    pb.authStore.clear();
  }
  setCanCreateAdmin(value.canCreateAdmin);
  setAuthenticated(value.isAuthenticated);
});
