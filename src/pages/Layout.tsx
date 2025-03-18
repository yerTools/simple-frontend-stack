import { For, JSX, createSignal, onMount } from "solid-js";

import { Collapsible } from "@kobalte/core";
import { A, RouteSectionProps, useLocation } from "@solidjs/router";
import { Code, Menu, Moon, Sun, X } from "lucide-solid";

import { pageList } from "..";

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
                {page.title}
              </A>
            );
          case "footer":
            return (
              <A
                href={page.path}
                class="link link-hover"
              >
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

  onMount(() => {
    const savedTheme = localStorage.getItem("theme") ?? "";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
    }
  });

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
              <Sun class="h-5 w-5" />
            : <Moon class="h-5 w-5" />}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/yerTools/simple-frontend-stack"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-circle"
            aria-label="GitHub repository"
          >
            <Code class="h-5 w-5" />
          </a>

          {/* Mobile Menu Button */}
          <button
            class="btn btn-ghost btn-circle lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())}
            aria-label={isMobileMenuOpen() ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen() ?
              <X class="h-5 w-5" />
            : <Menu class="h-5 w-5" />}
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
          <p>
            <span class="font-bold">Ⓐ {new Date().getFullYear()}</span> - Free
            and open-source software - with free as in freedom! 🚩✊
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
