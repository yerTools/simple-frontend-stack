import LoadingIcon from "~icons/svg-spinners/bouncing-ball";

import { JSX, Show, createSignal } from "solid-js";

import { RouteSectionProps } from "@solidjs/router";

import { createAdminUser } from "../../service/api/user";

const CreateAdminUser = (_: RouteSectionProps): JSX.Element => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordConfirm, setPasswordConfirm] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password() !== passwordConfirm()) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const [_, createError] = await createAdminUser(
      email(),
      password(),
      passwordConfirm(),
    );

    setIsLoading(false);

    if (createError) {
      setError(createError.message || "Failed to create admin user");
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <h2 class="text-center text-2xl font-bold">Create Admin User</h2>
      <p class="text-center text-sm opacity-75">
        Welcome! Please create the first admin user to get started.
      </p>
      <form
        onSubmit={handleSubmit}
        class="flex flex-col gap-4"
      >
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            class="input input-bordered w-full"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            disabled={isLoading()}
          />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter password"
            class="input input-bordered w-full"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            disabled={isLoading()}
            minlength="8"
          />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            placeholder="Confirm password"
            class="input input-bordered w-full"
            value={passwordConfirm()}
            onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
            required
            disabled={isLoading()}
            minlength="8"
          />
        </div>

        <Show when={error()}>
          <div
            role="alert"
            class="alert alert-error text-sm"
          >
            <span>{error()}</span>
          </div>
        </Show>

        <button
          type="submit"
          class="btn btn-primary mt-2 w-full"
          disabled={isLoading()}
        >
          {isLoading() ?
            <LoadingIcon />
          : "Create Admin"}
        </button>
      </form>
    </div>
  );
};

export default CreateAdminUser;
