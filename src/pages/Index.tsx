import GoIcon from "~icons/devicon/go";
import SolidIcon from "~icons/devicon/solidjs";
import TailwindIcon from "~icons/devicon/tailwindcss";
import IconifyIcon from "~icons/line-md/iconify2-static-twotone";
import BunIcon from "~icons/logos/bun";
import DaisyUiIcon from "~icons/logos/daisyui-icon";
import ViteIcon from "~icons/logos/vitejs";
import PocketBaseIcon from "~icons/simple-icons/pocketbase";
import TerminalIcon from "~icons/tabler/terminal";

import { Component, For, JSX } from "solid-js";

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

const Index: Component = (): JSX.Element => {
  return (
    <div class="space-y-12">
      <section class="hero bg-gradient-to-r from-purple-500 to-indigo-500 py-8 text-center text-white">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">
            Welcome to the Ultimate Frontend Stack
          </h1>
          <p class="py-4">
            A modern, powerful, and lightweight stack built for speed and
            simplicity.
          </p>
        </div>
      </section>

      <section class="container mx-auto px-4">
        <h2 class="mb-8 text-center text-3xl font-bold">Core Features</h2>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ObserverProvider>
            <For each={features}>
              {(feature) => (
                <div class="card bg-base-300 intersect:motion-preset-expand intersect-once w-64 justify-self-center shadow-sm transition-transform hover:-translate-y-1">
                  <figure class="p-4">
                    <feature.icon class="mx-auto mb-4 h-12 w-12" />
                  </figure>
                  <div class="card-body">
                    <h3 class="card-title">{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              )}
            </For>
          </ObserverProvider>
        </div>
      </section>

      <section class="container mx-auto px-4 text-center">
        <h2 class="mb-4 text-3xl font-bold">What Is This Stack?</h2>
        <p class="mx-auto max-w-2xl text-lg">
          This stack offers a fully integrated setup - from a blazing-fast
          development environment using Bun and Vite to an ecosystem of
          handpicked libraries. Whether you're building a small snippet or a
          complete SPA, every component is chosen to give you rapid feedback and
          seamless functionality.
        </p>
      </section>
    </div>
  );
};

export default Index;
