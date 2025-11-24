import { JSX, createEffect, createSignal } from "solid-js";

import { RouteSectionProps } from "@solidjs/router";

const MinimalLayout = (props: RouteSectionProps): JSX.Element => {
  const [isDarkMode] = createSignal(
    localStorage.getItem("theme") === "solidarity-dark" ||
      (localStorage.getItem("theme") !== "solidarity-light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  createEffect(() => {
    if (typeof document !== "undefined") {
      const theme = isDarkMode() ? "solidarity-dark" : "solidarity-light";
      document.body.setAttribute("data-theme", theme);
    }
  });

  return (
    <div class="bg-base-200 flex min-h-screen w-full items-center justify-center p-4 transition-colors duration-200">
      <div class="bg-base-100 w-full max-w-sm overflow-hidden rounded-2xl shadow-xl sm:max-w-md">
        <div class="p-6 sm:p-8">{props.children}</div>
      </div>
    </div>
  );
};

export default MinimalLayout;
