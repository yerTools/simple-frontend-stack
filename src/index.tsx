/* @refresh reload */
import "./styles/general.css";

import { Component, For } from "solid-js";

import { render } from "solid-js/web";

import { Route, RouteSectionProps, Router } from "@solidjs/router";

import Index from "./pages/Index";
import Layout from "./pages/Layout";

const root = document.body;

interface PageDefinition {
  title: string;
  component?: Component<RouteSectionProps<unknown>>;
}

export type PageTree = {
  [key: string]: PageDefinition & {
    children?: PageTree;
  };
};

export const pageTree = {
  "": {
    title: "Hello World!",
    component: Index,
  },
  solid: {
    title: "SolidJS",
  },
  tailwind: {
    title: "TailwindCSS",
  },
  daisyui: {
    title: "DaisyUI",
  },
  kobalte: {
    title: "Kobalte",
  },
  lucide: {
    title: "Lucide Icons",
  },
  router: {
    title: "Solid Router",
  },
} as const;

function flattenPageTree(
  pageTree: PageTree,
): ({ path: string } & PageDefinition)[] {
  const result: ({ path: string } & PageDefinition)[] = [];
  for (const [key, value] of Object.entries(pageTree)) {
    result.push({ path: `/${key}`, ...value });
    if (value.children) {
      result.push(
        ...flattenPageTree(value.children).map((child) => ({
          ...child,
          path: key === "" ? child.path : `/${key}${child.path}`,
        })),
      );
    }
  }
  return result;
}

export const pageList = flattenPageTree(pageTree);

render(() => {
  return (
    <Router root={Layout}>
      <For
        each={pageList}
        children={(page) => (
          <Route
            path={page.path}
            component={page.component}
          />
        )}
      />
      <Route
        path="*404"
        component={() => <span>404 LOL</span>}
      />
    </Router>
  );
}, root);
