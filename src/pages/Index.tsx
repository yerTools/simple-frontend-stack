import "prismjs/themes/prism-okaidia.min.css";

import FontColorIcon from "~icons/bx/font-color";
import GoIcon from "~icons/devicon/go";
import SolidIcon from "~icons/devicon/solidjs";
import TailwindIcon from "~icons/devicon/tailwindcss";
import CloseSmallIcon from "~icons/line-md/close-small";
import ConfirmCircleFilledIcon from "~icons/line-md/confirm-circle-filled";
import GithubIcon from "~icons/line-md/github-loop";
import IconifyIcon from "~icons/line-md/iconify2-static";
import BunIcon from "~icons/logos/bun";
import DaisyUiIcon from "~icons/logos/daisyui-icon";
import ViteIcon from "~icons/logos/vitejs";
import PocketBaseIcon from "~icons/simple-icons/pocketbase";
import BrushIcon from "~icons/tabler/brush";
import PuzzleIcon from "~icons/tabler/puzzle";
import RocketIcon from "~icons/tabler/rocket";
import SpeedIcon from "~icons/tabler/speedboat";
import TerminalIcon from "~icons/tabler/terminal";

import { Component, For, JSX, Show, createSignal } from "solid-js";

import { createAutoAnimate } from "@formkit/auto-animate/solid";
import "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import { Highlight, Language } from "solid-highlight";

import { ObserverProvider } from "./Layout";

const features = [
  {
    title: "SolidJS",
    description: "Lightning-fast UI rendering.",
    icon: SolidIcon,
  },
  {
    title: "TailwindCSS",
    description: "Utility-first styling at your fingertips.",
    icon: TailwindIcon,
  },
  {
    title: "DaisyUI",
    description: "Beautiful UI components out-of-the-box.",
    icon: DaisyUiIcon,
  },
  {
    title: "PocketBase",
    description: "All-in-one backend for your app (optional).",
    icon: PocketBaseIcon,
  },
  {
    title: "Auto Animate",
    description: "Smooth transitions and interactive animations.",
    icon: TerminalIcon,
  },
  {
    title: "Bun",
    description:
      "Next-generation JavaScript runtime for blazing fast performance.",
    icon: BunIcon,
  },
  {
    title: "Vite",
    description:
      "Lightning-fast bundler and dev server for modern web projects.",
    icon: ViteIcon,
  },
  {
    title: "Go",
    description: "Robust language powering PocketBase on the backend.",
    icon: GoIcon,
  },
  {
    title: "Iconify",
    description:
      "Access thousands of icons from multiple icon packs effortlessly.",
    icon: IconifyIcon,
  },
] as const;

// Example code snippets to showcase ease of use
const codeExamples = [
  {
    title: "Reactive UI with SolidJS",
    description: "Create reactive UIs with minimal code",
    codeComponent: () => {
      return (
        <Highlight language={Language.REACT_TSX}>
          {`import { createSignal } from "solid-js";

  function Counter() {
    const [count, setCount] = createSignal(0);
    
    return (
      <button 
        class="btn btn-primary" 
        onClick={() => setCount(count() + 1)}
      >
        Clicks: {count()}
      </button>
    );
  }`}
        </Highlight>
      );
    },
    component: () => {
      const [count, setCount] = createSignal(0);
      return (
        <button
          class="btn btn-primary"
          onClick={() => setCount(count() + 1)}
        >
          Clicks: {count()}
        </button>
      );
    },
  },
  {
    title: "Stylish Components with DaisyUI",
    description: "Beautiful UI components without custom CSS",
    codeComponent: () => {
      return (
        <Highlight language={Language.HTML}>
          {`<div class="stats shadow">
    <div class="stat">
      <div class="stat-title">Downloads</div>
      <div class="stat-value">31K</div>
      <div class="stat-desc">Jan 1st - Feb 1st</div>
    </div>
    
    <div class="stat">
      <div class="stat-title">Users</div>
      <div class="stat-value text-primary">4,200</div>
      <div class="stat-desc">↗︎ 40 (2%)</div>
    </div>
  </div>`}
        </Highlight>
      );
    },
    component: () => (
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Downloads</div>
          <div class="stat-value">31K</div>
          <div class="stat-desc">Jan 1st - Feb 1st</div>
        </div>
        <div class="stat">
          <div class="stat-title">Users</div>
          <div class="stat-value text-primary">4,200</div>
          <div class="stat-desc">↗︎ 40 (2%)</div>
        </div>
      </div>
    ),
  },
  {
    title: "Auto Animations",
    description: "Add animations with minimal effort",
    codeComponent: () => {
      return (
        <Highlight language={Language.REACT_TSX}>
          {`import { For, JSX, createSignal } from "solid-js";

  import { createAutoAnimate } from "@formkit/auto-animate/solid";

  const AutoAnimateExample: Comment = (): JSX.Element => {
    const [items, setItems] = createSignal(["Item 1", "Item 2"]);

    const [autoAnimateParent] = createAutoAnimate(/* optional config */);

    return (
      <div class="space-y-4">
        <ul
          class="menu bg-base-200 rounded-box w-full"
          ref={autoAnimateParent}
        >
          <For each={items()}>
            {(item) => (
              <li>
                <a>{item}</a>
              </li>
            )}
          </For>
        </ul>
        <button
          class="btn btn-secondary"
          onClick={() => setItems([...items(), \`Item \${items().length + 1}\`])}
        >
          Add Item
        </button>
      </div>
    );
  };`}
        </Highlight>
      );
    },
    component: () => {
      const [items, setItems] = createSignal(["Item 1", "Item 2"]);

      const [autoAnimateParent] = createAutoAnimate(/* optional config */);

      return (
        <div class="space-y-4">
          <ul
            class="menu bg-base-200 rounded-box w-full"
            ref={autoAnimateParent}
          >
            <For each={items()}>
              {(item) => (
                <li>
                  <a>{item}</a>
                </li>
              )}
            </For>
          </ul>
          <button
            class="btn btn-secondary"
            onClick={() => setItems([...items(), `Item ${items().length + 1}`])}
          >
            Add Item
          </button>
        </div>
      );
    },
  },
];

// Workflow steps to highlight developer experience
const workflowSteps = [
  {
    title: "Quick Setup",
    icon: RocketIcon,
    description:
      "Clone the repo and run `bun install` to get started in seconds.",
  },
  {
    title: "Fast Development",
    icon: SpeedIcon,
    description:
      "Enjoy hot module reloading and lightning-fast build times with Bun and Vite.",
  },
  {
    title: "Easy Styling",
    icon: BrushIcon,
    description:
      "Combine TailwindCSS utility classes with DaisyUI components for rapid styling.",
  },
  {
    title: "Simple State Management",
    icon: PuzzleIcon,
    description:
      "Use SolidJS reactive primitives for clean, efficient state management.",
  },
];

const ThemeShowcase: Component = (): JSX.Element => {
  const themes = (
    [
      "light",
      "dark",
      "solidarity-light",
      "solidarity-dark",
      "cupcake",
      "synthwave",
      "retro",
      "cyberpunk",
      "nord",
      "pastel",
      "forest",
    ] as const
  ).toSorted();

  const randomPercentage = (interval = 250): (() => number) => {
    const [get, set] = createSignal(101 * Math.random());

    setInterval(
      () => set((get() + Math.pow(Math.random(), 2) * 6) % 101),
      interval,
    );

    const value: () => number = () => Math.floor(get());

    return value;
  };

  const percentageBar = randomPercentage();
  const percentageCircle = randomPercentage();
  const percentageCountdown = randomPercentage(500);

  const [previewTheme, setPreviewTheme] =
    createSignal<(typeof themes)[number]>("cupcake");

  // Add a state for modal visibility
  const [modalOpen, setModalOpen] = createSignal(false);

  // Add a state for alert display
  const [showAlert, setShowAlert] = createSignal(false);

  const colorSquareClass =
    "border-base-300 card card-border card-xs h-12 w-12 items-center justify-center p-4 text-2xl";

  return (
    <section class="container mx-auto px-4">
      <div class="mb-12 text-center">
        <h2 class="mb-2 text-4xl font-bold">Theme Support</h2>
        <p class="mx-auto max-w-2xl text-lg">
          Thanks to DaisyUI, your app works with multiple themes out of the box.
          Try them out:
        </p>
      </div>

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <For each={themes}>
          {(theme) => (
            <button
              class={`btn ${previewTheme() === theme ? "btn-primary" : "btn-outline"}`}
              onClick={() => setPreviewTheme(theme)}
              data-theme={theme}
            >
              {theme[0].toUpperCase() + theme.slice(1)}
            </button>
          )}
        </For>
      </div>

      <div
        class={`card bg-base-100 text-base-content mx-auto max-w-4xl shadow-xl transition-all duration-300`}
        data-theme={previewTheme()}
      >
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <h3 class="card-title text-2xl">
              Theme: {previewTheme()[0].toUpperCase() + previewTheme().slice(1)}
            </h3>
          </div>

          {/* Alert that can be dismissed */}
          <Show when={showAlert()}>
            <div class="alert alert-success mb-4">
              <ConfirmCircleFilledIcon class="h-6 w-6 shrink-0 stroke-current" />
              <span>Theme changed successfully!</span>
              <button
                class="btn btn-sm"
                onClick={() => setShowAlert(false)}
              >
                Dismiss
              </button>
            </div>
          </Show>

          {/* Button Showcase */}
          <div class="divider">Buttons & Controls</div>
          <div class="my-4 flex flex-wrap gap-2">
            <button class="btn btn-primary">Primary</button>
            <button class="btn btn-secondary">Secondary</button>
            <button class="btn btn-accent">Accent</button>
            <button class="btn btn-info">Info</button>
            <button class="btn btn-success">Success</button>
            <button class="btn btn-warning">Warning</button>
            <button class="btn btn-error">Error</button>
            <button class="btn btn-ghost">Ghost</button>
            <button class="btn btn-link">Link</button>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Button Variants */}
            <div class="space-y-2">
              <h4 class="font-bold">Button Variants</h4>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-primary btn-sm">Small</button>
                <button class="btn btn-primary">Normal</button>
                <button class="btn btn-primary btn-lg">Large</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-outline btn-primary">Outline</button>
                <button class="btn btn-primary btn-circle">
                  <CloseSmallIcon class="h-6 w-6" />
                </button>
                <button
                  class="btn btn-primary"
                  onClick={() => {
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                  }}
                >
                  Show Alert
                </button>
              </div>

              <div class="flex flex-wrap gap-2">
                <div class="join">
                  <button class="btn join-item">Left</button>
                  <button class="btn join-item btn-active">Center</button>
                  <button class="btn join-item">Right</button>
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div class="space-y-2">
              <h4 class="font-bold">Form Elements</h4>
              <div class="form-control w-full max-w-xs">
                <label class="label">
                  <span class="label-text">Example Input</span>
                </label>
                <input
                  type="text"
                  placeholder="Type here"
                  class="input input-bordered w-full max-w-xs"
                />
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary"
                  checked
                />
                <input
                  type="checkbox"
                  class="checkbox checkbox-secondary"
                />
                <input
                  type="radio"
                  name="radio-1"
                  class="radio radio-primary"
                  checked
                />
                <input
                  type="radio"
                  name="radio-1"
                  class="radio radio-secondary"
                />
              </div>

              <div class="rating">
                <input
                  type="radio"
                  name="rating-2"
                  class="mask mask-star-2 bg-orange-400"
                />
                <input
                  type="radio"
                  name="rating-2"
                  class="mask mask-star-2 bg-orange-400"
                  checked
                />
                <input
                  type="radio"
                  name="rating-2"
                  class="mask mask-star-2 bg-orange-400"
                />
                <input
                  type="radio"
                  name="rating-2"
                  class="mask mask-star-2 bg-orange-400"
                />
                <input
                  type="radio"
                  name="rating-2"
                  class="mask mask-star-2 bg-orange-400"
                />
              </div>

              <div class="flex items-center gap-4">
                <span>Range</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  class="range range-primary range-sm w-1/2"
                />
              </div>
            </div>
          </div>

          {/* Data Display */}
          <div class="divider">Data Display</div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div class="stats shadow">
                <div class="stat">
                  <div class="stat-title">Downloads</div>
                  <div class="stat-value">31K</div>
                  <div class="stat-desc">Jan 1st - Feb 1st</div>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <div class="badge">Default</div>
                <div class="badge badge-primary">Primary</div>
                <div class="badge badge-secondary">Secondary</div>
                <div class="badge badge-accent">Accent</div>
              </div>

              <progress
                class="progress progress-primary mt-4 w-full"
                value={percentageBar()}
                max="100"
              />

              <div class="stats bg-base-100 w-full overflow-hidden">
                <div class="stat">
                  <div class="stat-figure" />
                  <div class="stat-title">Loading</div>{" "}
                  <div class="stat-value">
                    <span class="countdown countdown-500 font-mono text-6xl">
                      <span
                        aria-live="polite"
                        aria-label={`${percentageCountdown()}`}
                        {...{
                          style: `--value:${percentageCountdown()};`,
                        }}
                      >
                        {percentageCountdown()}
                      </span>
                    </span>
                    <span class="text-sm">/100</span>
                  </div>{" "}
                  <div class="stat-desc flex items-center gap-1" />
                </div>
              </div>
            </div>

            <div>
              <div
                class="radial-progress"
                {...{ style: `--value:${percentageCircle()};` }}
              >
                {percentageCircle()}%
              </div>

              <div class="mt-4 flex gap-2">
                <div class="skeleton h-32 w-full" />
              </div>

              <button
                class="btn btn-primary mt-4"
                onClick={() => setModalOpen(true)}
              >
                Open Modal
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div class="divider">Color Palette</div>
          <div class="grid w-full grid-cols-4 gap-2 md:grid-cols-8">
            <h4 class="col-span-2">Base:</h4>
            <h4 class="col-span-2">Primary/Secondary:</h4>
            <h4 class="col-span-2">Accent/Neutral:</h4>
            <h4 class="col-span-2">State Colors:</h4>

            <div class={`bg-base-100 text-base-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-base-200 text-base-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-primary text-primary-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div
              class={`bg-secondary text-secondary-content ${colorSquareClass}`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-accent text-accent-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-neutral text-neutral-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-info text-info-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-success text-success-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>

            <div class={`bg-base-300 text-base-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-base-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div
              class={`bg-primary-focus text-primary-content ${colorSquareClass}`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div
              class={`bg-secondary-focus text-secondary-content ${colorSquareClass}`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div
              class={`bg-accent-focus text-accent-content ${colorSquareClass}`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div
              class={`bg-neutral-focus text-neutral-content ${colorSquareClass}`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-warning text-warning-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-error text-error-content ${colorSquareClass}`}>
              <span>
                <FontColorIcon />
              </span>
            </div>
          </div>

          {/* Interactive Components Section */}
          <div class="divider">Interactive Components</div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <h4 class="font-bold">Dropdown Menu</h4>
              <div class="dropdown">
                <label
                  tabindex="0"
                  class="btn m-1"
                >
                  Click for dropdown
                </label>
                <ul
                  tabindex="0"
                  class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow"
                >
                  <li>
                    <a>Item 1</a>
                  </li>
                  <li>
                    <a>Item 2</a>
                  </li>
                  <li>
                    <a>Item 3</a>
                  </li>
                </ul>
              </div>

              <h4 class="mt-4 font-bold">Collapse</h4>
              <div
                tabindex="0"
                class="collapse-arrow border-base-300 bg-base-200 collapse border"
              >
                <div class="collapse-title text-xl font-medium">
                  Click to open
                </div>
                <div class="collapse-content">
                  <p>This content is hidden until clicked</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="font-bold">Card with Actions</h4>
              <div class="card bg-base-100 w-full border shadow-xl">
                <figure>
                  <div class="bg-primary/20 flex h-32 w-full items-center justify-center">
                    Image placeholder
                  </div>
                </figure>
                <div class="card-body">
                  <h2 class="card-title">Card Title</h2>
                  <p>Cards can contain any content and actions</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary btn-sm">Action</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Code */}
          <div class="divider">Customize Your Themes</div>
          <div class="mockup-code mt-4">
            <Highlight language={Language.CSS}>
              {`/* https://daisyui.com/theme-generator/ */
  @plugin "daisyui/theme" {
    name: "light";
    default: true;
    prefersdark: false;
    color-scheme: "light";
    --color-base-100: oklch(100% 0 0);
    --color-base-200: oklch(98% 0 0);
    --color-base-300: oklch(95% 0 0);
    --color-base-content: oklch(21% 0.006 285.885);
    --color-primary: oklch(45% 0.24 277.023);
    --color-primary-content: oklch(93% 0.034 272.788);
    --color-secondary: oklch(65% 0.241 354.308);
    --color-secondary-content: oklch(94% 0.028 342.258);
    --color-accent: oklch(77% 0.152 181.912);
    --color-accent-content: oklch(38% 0.063 188.416);
    --color-neutral: oklch(14% 0.005 285.823);
    --color-neutral-content: oklch(92% 0.004 286.32);
    --color-info: oklch(74% 0.16 232.661);
    --color-info-content: oklch(29% 0.066 243.157);
    --color-success: oklch(76% 0.177 163.223);
    --color-success-content: oklch(37% 0.077 168.94);
    --color-warning: oklch(82% 0.189 84.429);
    --color-warning-content: oklch(41% 0.112 45.904);
    --color-error: oklch(71% 0.194 13.428);
    --color-error-content: oklch(27% 0.105 12.094);
    --radius-selector: 0.5rem;
    --radius-field: 0.25rem;
    --radius-box: 0.5rem;
    --size-selector: 0.25rem;
    --size-field: 0.25rem;
    --border: 1px;
    --depth: 1;
    --noise: 0;
  }`}
            </Highlight>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <div
        class={`modal modal-bottom sm:modal-middle ${modalOpen() ? "modal-open" : ""}`}
        data-theme={previewTheme()}
      >
        <div class="modal-box">
          <h3 class="text-lg font-bold">Modal Dialog Example</h3>
          <p class="py-4">
            This is a modal dialog using the current theme: {previewTheme()}
          </p>
          <div class="modal-action">
            <button
              class="btn"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
        <div
          class="modal-backdrop"
          onClick={() => setModalOpen(false)}
        />
      </div>
    </section>
  );
};

const Index: Component = (): JSX.Element => {
  const [activeTab, setActiveTab] = createSignal(0);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = createSignal<number | null>(null);

  return (
    <div class="space-y-16 pb-16">
      {/* Hero Section */}
      <section class="hero from-primary to-secondary text-primary-content bg-gradient-to-r py-10 sm:py-20">
        <div class="hero-content text-center">
          <div class="max-w-3xl px-2">
            <h1 class="intersect:motion-preset-slide-in-from-left intersect-once mb-4 text-3xl font-bold sm:mb-8 sm:text-5xl">
              The Ultimate Frontend Stack
            </h1>
            <p class="intersect:motion-preset-slide-in-from-right intersect-once mb-4 text-base sm:mb-8 sm:text-xl">
              Build beautiful, reactive web applications with lightning speed
              using our curated stack of modern technologies.
            </p>
            <div class="intersect:motion-preset-slide-in-from-bottom intersect-once flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/yerTools/simple-frontend-stack"
                target="_blank"
                class="btn btn-outline btn-sm sm:btn-md backdrop-blur-sm"
              >
                <GithubIcon class="mr-2" /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Visual Overview */}
      <section
        id="features"
        class="container mx-auto px-4"
      >
        <h2 class="mb-2 text-center text-4xl font-bold">
          Powerful Technologies
        </h2>
        <p class="mx-auto mb-12 max-w-2xl text-center text-lg">
          A carefully selected stack combining performance, developer
          experience, and beautiful UIs
        </p>

        <div class="xs:gap-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ObserverProvider>
            <For each={features}>
              {(feature) => (
                <div class="card bg-base-200 intersect:motion-preset-expand intersect-once transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <figure class="pt-4 sm:pt-6">
                    <feature.icon class="h-12 w-12 sm:h-16 sm:w-16" />
                  </figure>
                  <div class="card-body p-4 sm:p-6">
                    <h3 class="card-title justify-center text-sm sm:text-base md:text-lg">
                      {feature.title}
                    </h3>
                    <p class="text-center text-xs sm:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )}
            </For>
          </ObserverProvider>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-2 text-4xl font-bold">See It In Action</h2>
          <p class="mx-auto max-w-2xl text-lg">
            The best way to understand our stack is to see what it can do. Here
            are some live examples:
          </p>
        </div>

        <div class="tabs tabs-boxed mb-8 justify-center">
          <For each={codeExamples}>
            {(example, index) => (
              <a
                class={`tab ${activeTab() === index() ? "tab-active" : ""}`}
                onClick={() => setActiveTab(index())}
              >
                {example.title}
              </a>
            )}
          </For>
        </div>

        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div class="mockup-code overflow-x-auto">
            {codeExamples[activeTab()].codeComponent()}
          </div>

          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">{codeExamples[activeTab()].title}</h3>
              <p>{codeExamples[activeTab()].description}</p>
              <div class="divider">Result</div>
              <div class="flex min-h-20 items-center justify-center p-4">
                {codeExamples[activeTab()].component()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <ThemeShowcase />

      {/* Developer Experience */}
      <section class="bg-base-200 rounded-box container mx-auto px-4 py-12">
        <div class="mb-12 text-center">
          <h2 class="mb-2 text-4xl font-bold">Effortless Development</h2>
          <p class="mx-auto max-w-2xl text-lg">
            Our stack is designed to make development smooth and enjoyable
          </p>
        </div>

        <div class="steps steps-vertical lg:steps-horizontal w-full">
          <For each={workflowSteps}>
            {(step) => (
              <div class="step step-primary">
                <div class="intersect:motion-preset-slide-in-from-bottom intersect-once">
                  <div class="mb-2 flex justify-center">
                    <step.icon class="h-8 w-8" />
                  </div>
                  <h3 class="text-lg font-bold">{step.title}</h3>
                  <p class="max-w-xs">{step.description}</p>
                </div>
              </div>
            )}
          </For>
        </div>
      </section>

      {/* FAQ Section */}
      <section class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-2 text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div class="mx-auto max-w-2xl">
          <div class="collapse-plus bg-base-200 collapse mb-4">
            <input
              type="radio"
              name="faq-accordion"
              checked={openFaq() === 0}
              onChange={() => setOpenFaq(openFaq() === 0 ? null : 0)}
            />
            <div class="collapse-title text-xl font-medium">
              Do I need to know all these technologies?
            </div>
            <div class="collapse-content">
              <p>
                Not at all! The stack is designed to be approachable and
                well-documented. You can start with basic knowledge of
                JavaScript and HTML, then gradually explore more advanced
                features as needed.
              </p>
            </div>
          </div>

          <div class="collapse-plus bg-base-200 collapse mb-4">
            <input
              type="radio"
              name="faq-accordion"
              checked={openFaq() === 1}
              onChange={() => setOpenFaq(openFaq() === 1 ? null : 1)}
            />
            <div class="collapse-title text-xl font-medium">
              Can I use this for production applications?
            </div>
            <div class="collapse-content">
              <p>
                Absolutely! All the technologies included are production-ready
                and used by many companies in real-world applications. The stack
                is optimized for both development speed and production
                performance.
              </p>
            </div>
          </div>

          <div class="collapse-plus bg-base-200 collapse mb-4">
            <input
              type="radio"
              name="faq-accordion"
              checked={openFaq() === 2}
              onChange={() => setOpenFaq(openFaq() === 2 ? null : 2)}
            />
            <div class="collapse-title text-xl font-medium">
              How do I get started with this stack?
            </div>
            <div class="collapse-content">
              <p>
                Getting started is easy! Just clone the repository, run{" "}
                <code>bun install</code>, and then <code>bun run dev</code>. The
                README has detailed instructions for all setup steps and
                configuration options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="container mx-auto px-4 text-center">
        <div class="card bg-primary text-primary-content mx-auto max-w-3xl">
          <div class="card-body">
            <h2 class="card-title mb-4 justify-center text-3xl">
              Ready to Build Something Amazing?
            </h2>
            <p class="mb-6">
              Start creating with our modern, efficient frontend stack today.
            </p>
            <div class="card-actions justify-center">
              <a
                href="https://github.com/yerTools/simple-frontend-stack"
                target="_blank"
                class="btn btn-outline"
              >
                <GithubIcon class="mr-2" /> Get Started on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
