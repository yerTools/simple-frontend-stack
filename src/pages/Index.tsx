import "prismjs/themes/prism-okaidia.min.css";

import FontColorIcon from "~icons/bx/font-color";
import GoIcon from "~icons/devicon/go";
import SolidIcon from "~icons/devicon/solidjs";
import TailwindIcon from "~icons/devicon/tailwindcss";
import GithubIcon from "~icons/line-md/github-loop";
import IconifyIcon from "~icons/line-md/iconify2-static-twotone";
import BunIcon from "~icons/logos/bun";
import DaisyUiIcon from "~icons/logos/daisyui-icon";
import ViteIcon from "~icons/logos/vitejs";
import PocketBaseIcon from "~icons/simple-icons/pocketbase";
import BrushIcon from "~icons/tabler/brush";
import PuzzleIcon from "~icons/tabler/puzzle";
import RocketIcon from "~icons/tabler/rocket";
import SpeedIcon from "~icons/tabler/speedboat";
import TerminalIcon from "~icons/tabler/terminal";

import { Component, For, JSX, createSignal } from "solid-js";

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
        <Highlight language={Language.HTML}>
          {`<div class="intersect:motion-preset-slide-in-from-right">
    This content slides in from the right when visible
  </div>

  <div class="intersect:motion-preset-expand intersect-once">
    This content expands when visible (once)
  </div>`}
        </Highlight>
      );
    },
    component: () => {
      const [items, setItems] = createSignal(["Item 1", "Item 2"]);

      return (
        <div class="space-y-4">
          <ul class="menu bg-base-200 rounded-box w-full">
            <For each={items()}>
              {(item) => (
                <li class="intersect:motion-preset-slide-in-from-right intersect-once">
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
      "cupcake",
      "synthwave",
      "retro",
      "cyberpunk",
      "nord",
      "pastel",
      "forest",
    ] as const
  ).toSorted();

  const [previewTheme, setPreviewTheme] =
    createSignal<(typeof themes)[number]>("cupcake");

  const colorSquareClass =
    "border-base-300 card card-border card-xs h-12 w-12 items-center justify-center p-4";

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
        class="card bg-base-100 text-base-content mx-auto max-w-2xl shadow-xl"
        data-theme={previewTheme()}
      >
        <div class="card-body">
          <h3 class="card-title">
            Theme: {previewTheme()[0].toUpperCase() + previewTheme().slice(1)}
          </h3>
          <div class="my-4 flex flex-wrap gap-2">
            <button class="btn btn-primary">Primary</button>
            <button class="btn btn-secondary">Secondary</button>
            <button class="btn btn-accent">Accent</button>
            <button class="btn btn-info">Info</button>
            <button class="btn btn-success">Success</button>
            <button class="btn btn-warning">Warning</button>
            <button class="btn btn-error">Error</button>
          </div>
          <div class="form-control">
            <label class="label me-4">
              <span class="label-text">Example Input</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              class="input input-bordered"
            />
          </div>
          <div class="mt-4 flex justify-between">
            <div class="badge">Badge</div>
            <progress
              class="progress progress-primary w-56"
              value="70"
              max="100"
            />
          </div>
          <div class="grid w-64 grid-cols-4">
            <h4 class="col-span-2">Base:</h4>
            <h4 class="col-span-2" />
            <div
              class={`bg-base-100 text-base-content ${colorSquareClass} text-lg`}
            >
              100
            </div>
            <div
              class={`bg-base-200 text-base-content ${colorSquareClass} text-lg`}
            >
              200
            </div>
            <div
              class={`bg-base-300 text-base-content ${colorSquareClass} text-lg`}
            >
              300
            </div>
            <div
              class={`bg-base-100 text-base-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <h4 class="col-span-2">Primary:</h4>
            <h4 class="col-span-2">Secondary:</h4>
            <div class={`bg-primary ${colorSquareClass}`} />
            <div
              class={`bg-primary text-primary-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-secondary ${colorSquareClass}`} />
            <div
              class={`bg-secondary text-secondary-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <h4 class="col-span-2">Accent:</h4>
            <h4 class="col-span-2">Neutral:</h4>
            <div class={`bg-accent ${colorSquareClass}`} />
            <div
              class={`bg-accent text-accent-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-neutral ${colorSquareClass}`} />
            <div
              class={`bg-neutral text-neutral-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <h4 class="col-span-2">Info:</h4>
            <h4 class="col-span-2">Success:</h4>
            <div class={`bg-info ${colorSquareClass}`} />
            <div
              class={`bg-info text-info-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-success ${colorSquareClass}`} />
            <div
              class={`bg-success text-success-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <h4 class="col-span-2">Warning:</h4>
            <h4 class="col-span-2">Error:</h4>
            <div class={`bg-warning ${colorSquareClass}`} />
            <div
              class={`bg-warning text-warning-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
            <div class={`bg-error ${colorSquareClass}`} />
            <div
              class={`bg-error text-error-content ${colorSquareClass} text-3xl`}
            >
              <span>
                <FontColorIcon />
              </span>
            </div>
          </div>
        </div>
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
      <section class="hero from-primary to-secondary text-primary-content bg-gradient-to-r py-20">
        <div class="hero-content text-center">
          <div class="max-w-3xl">
            <h1 class="intersect:motion-preset-slide-in-from-left intersect-once mb-8 text-5xl font-bold">
              The Ultimate Frontend Stack
            </h1>
            <p class="intersect:motion-preset-slide-in-from-right intersect-once mb-8 text-xl">
              Build beautiful, reactive web applications with lightning speed
              using our curated stack of modern technologies.
            </p>
            <div class="intersect:motion-preset-slide-in-from-bottom intersect-once flex flex-wrap justify-center gap-4">
              <a
                href="#features"
                class="btn btn-primary"
              >
                Explore Features
              </a>
              <a
                href="https://github.com/yerTools/simple-frontend-stack"
                target="_blank"
                class="btn btn-outline backdrop-blur-sm"
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

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ObserverProvider>
            <For each={features}>
              {(feature) => (
                <div class="card bg-base-200 intersect:motion-preset-expand intersect-once transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <figure class="pt-6">
                    <feature.icon class="h-16 w-16" />
                  </figure>
                  <div class="card-body">
                    <h3 class="card-title justify-center">{feature.title}</h3>
                    <p class="text-center">{feature.description}</p>
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
              <a
                href="https://simple-frontend-stack.ltl.re"
                target="_blank"
                class="btn"
              >
                View Demo Site
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
