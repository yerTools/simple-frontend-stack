import AnarchyIcon from "~icons/game-icons/anarchy";
import FistIcon from "~icons/game-icons/fist";
import HammerSickleIcon from "~icons/game-icons/hammer-sickle";
import MenuIcon from "~icons/line-md/close-to-menu-alt-transition";
import GitHubIcon from "~icons/line-md/github-loop";
import XIcon from "~icons/line-md/menu-to-close-transition";
import SunIcon from "~icons/line-md/moon-filled-to-sunny-filled-loop-transition";
import MoonIcon from "~icons/line-md/sunny-filled-loop-to-moon-filled-loop-transition";
import FlagIcon from "~icons/solar/flag-bold-duotone";

import { FlowComponent, For, JSX, createEffect, createSignal } from "solid-js";

import { Collapsible } from "@kobalte/core";
import { A, RouteSectionProps, useLocation } from "@solidjs/router";
import { Observer } from "tailwindcss-intersect";

import { pageList } from "..";

export const ObserverProvider: FlowComponent = (props: {
  children: JSX.Element;
}) => {
  createEffect(() => {
    Observer.start();
  });

  return <>{props.children}</>;
};

const NavigationLinks = (props: {
  kind: "desktop" | "mobile" | "footer";
  onClick?: JSX.EventHandlerUnion<
    HTMLAnchorElement,
    MouseEvent,
    JSX.EventHandler<HTMLAnchorElement, MouseEvent>
  >;
}): JSX.Element => {
  const location = useLocation();

  return (
    <For each={pageList}>
      {(page) => {
        switch (props.kind) {
          case "desktop":
            return (
              <li>
                <A
                  href={page.path}
                  activeClass="bg-base-200 font-medium"
                  class="rounded-lg transition-colors duration-200"
                  end={true}
                  onClick={props.onClick}
                >
                  {page.icon && <page.icon class="mr-1 inline h-5 w-5" />}
                  {page.title}
                </A>
              </li>
            );
          case "mobile":
            return (
              <A
                href={page.path}
                class={`btn btn-ghost my-1 justify-start ${
                  location.pathname === page.path ?
                    "bg-base-300 font-medium"
                  : ""
                }`}
                onClick={props.onClick}
              >
                {page.icon && <page.icon class="mr-1 inline h-5 w-5" />}
                {page.title}
              </A>
            );
          case "footer":
            return (
              <A
                href={page.path}
                class="link link-hover"
              >
                {page.icon && <page.icon class="mr-1 inline h-5 w-5" />}
                {page.title}
              </A>
            );
          default:
            const _: never = props.kind;
        }
      }}
    </For>
  );
};

const Layout = (props: RouteSectionProps): JSX.Element => {
  const [isDarkMode, setIsDarkMode] = createSignal(
    localStorage.getItem("theme") === "dark",
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

  (() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const [lastPrefersDark, setPrefersDark] = (() => {
      switch (localStorage.getItem("prefers-dark")) {
        case "true":
          return [true, false];
        case "false":
          return [false, false];
        default:
          return [prefersDark, true];
      }
    })();

    if (lastPrefersDark !== prefersDark || setPrefersDark) {
      localStorage.setItem("prefers-dark", `${prefersDark}`);
      localStorage.removeItem("theme");
    }

    const savedTheme = localStorage.getItem("theme") ?? "";

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
    } else {
      setIsDarkMode(false);
      document.body.setAttribute("data-theme", "light");
    }
  })();

  const toggleTheme = () => {
    const newMode = !isDarkMode();
    setIsDarkMode(newMode);
    const theme = newMode ? "dark" : "light";
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Schließe das mobile Menü, wenn sich die Route ändert
  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation-Links für Desktop und Mobile

  return (
    <div class="bg-base-100 flex min-h-screen flex-col transition-colors duration-200">
      {/* Navbar */}
      <div class="navbar bg-base-100 sticky top-0 z-10 shadow-md">
        <div class="navbar-start">
          <A
            href="/"
            class="btn btn-ghost text-xl font-bold"
            activeClass="text-primary"
            end={true}
          >
            Simple Frontend Stack
          </A>
        </div>

        {/* Desktop Navigation */}
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal gap-1 px-1">
            <NavigationLinks kind="desktop" />
          </ul>
        </div>

        <div class="navbar-end">
          {/* Theme Toggle */}
          <button
            class="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label={
              isDarkMode() ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode() ?
              <SunIcon class="h-5 w-5" />
            : <MoonIcon class="h-5 w-5" />}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/yerTools/simple-frontend-stack"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-circle"
            aria-label="GitHub repository"
          >
            <GitHubIcon class="h-5 w-5" />
          </a>

          {/* Mobile Menu Button */}
          <button
            class="btn btn-ghost btn-circle lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())}
            aria-label={isMobileMenuOpen() ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen() ?
              <XIcon class="h-5 w-5" />
            : <MenuIcon class="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <Collapsible.Root
        open={isMobileMenuOpen()}
        onOpenChange={setIsMobileMenuOpen}
        class="lg:hidden"
      >
        <Collapsible.Content>
          <div class="menu bg-base-200 rounded-b-box w-full p-2 shadow-md">
            <NavigationLinks
              kind="mobile"
              onClick={handleNavigation}
            />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      <main class="container mx-auto max-w-5xl flex-grow px-4 py-8">
        {props.children}
      </main>

      {/* Footer */}
      <footer class="footer footer-center bg-base-300 text-base-content p-6">
        <div class="mt-4">
          <p class="text-lg">
            <span class="font-bold">
              <AnarchyIcon class="inline" /> {new Date().getFullYear()}{" "}
              <HammerSickleIcon class="inline" />
            </span>{" "}
            - Free and open-source software - with free as in freedom!{" "}
            <FlagIcon class="inline text-[#ff0000]" />
            <FistIcon class="inline" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
