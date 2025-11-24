import LoadingIcon from "~icons/svg-spinners/bouncing-ball";

import { JSX, Show, createSignal } from "solid-js";

import { RouteSectionProps } from "@solidjs/router";

import { loginUser } from "../../service/api/user";

const Login = (_: RouteSectionProps): JSX.Element => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const [_, loginError] = await loginUser(email(), password());

    setIsLoading(false);

    if (loginError) {
      setError(loginError.message || "Login failed");
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <h2 class="text-center text-2xl font-bold">Login</h2>
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
          : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
