/* @refresh reload */
import "./styles/general.css";

import WorldIcon from "~icons/bx/world";
import SolidIcon from "~icons/devicon/solidjs";
import TailwindIcon from "~icons/devicon/tailwindcss";
import IconifyIcon from "~icons/line-md/iconify2-static";
import DaisyUiIcon from "~icons/logos/daisyui-icon";
import LucideIcon from "~icons/simple-icons/lucide";
import CodeIcon from "~icons/tabler/code";

import { lazy } from "solid-js";

import { render } from "solid-js/web";

import { App, transformPageTree } from "./router";

export const [pageList, wellKnownPages, pageTree] = transformPageTree({
  "": {
    title: "Hello World!",
    component: lazy(() => import("./pages/Index")),
    icon: WorldIcon,
  },
  solid: {
    title: "SolidJS",
    component: () => <span>SolidJS Page</span>,
    icon: SolidIcon,
  },
  tailwind: {
    title: "TailwindCSS",
    component: () => <span>TailwindCSS Page</span>,
    icon: TailwindIcon,
  },
  daisyui: {
    title: "DaisyUI",
    component: () => <span>DaisyUI Page</span>,
    icon: DaisyUiIcon,
  },
  kobalte: {
    title: "Kobalte",
    component: () => <span>Kobalte Page</span>,
    icon: CodeIcon,
  },
  lucide: {
    title: "Lucide Icons",
    component: () => <span>Lucide Icons Page</span>,
    icon: LucideIcon,
  },
  iconify: {
    title: "Iconify",
    component: () => <span>Iconify Page</span>,
    icon: IconifyIcon,
  },
  router: {
    title: "Solid Router",
    component: () => <span>Solid Router Page</span>,
    icon: SolidIcon,
  },
} as const);

render(
  () => (
    <App
      wellKnown={wellKnownPages}
      pageList={pageList}
    />
  ),
  document.body,
);
