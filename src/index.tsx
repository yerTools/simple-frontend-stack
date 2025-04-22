/* @refresh reload */
import "./styles/general.css";

import ClockIcon from "~icons/tabler/clock";
import DatabaseIcon from "~icons/tabler/database";
import InfoCircleIcon from "~icons/tabler/info-circle";

import { Component, ComponentProps, For, JSX, lazy } from "solid-js";

import { render } from "solid-js/web";

import { Navigate, Route, RouteSectionProps, Router } from "@solidjs/router";

import Login from "./pages/Login";
import ProtectedLayout from "./pages/ProtectedLayout";

const root = document.body;

interface PageDefinition {
  title: string;
  component?: Component<RouteSectionProps<unknown>>;
  icon?: (props: ComponentProps<"svg">) => JSX.Element;
}

export type PageTree = {
  [key: string]: PageDefinition & {
    children?: PageTree;
  };
};

export const pageTree = {
  info: {
    title: "Info",
    component: lazy(() => import("./pages/Info")),
    icon: InfoCircleIcon,
  },
  "work-clock": {
    title: "Stempeluhr",
    component: lazy(() => import("./pages/WorkClock")),
    icon: ClockIcon,
  },
  "legacy-import": {
    title: "Legacy-Import",
    component: lazy(() => import("./pages/LegacyImport")),
    icon: DatabaseIcon,
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

render(
  () => (
    <Router>
      <Route
        path="/login"
        component={Login}
      />
      <Route component={ProtectedLayout}>
        <Route
          path="/"
          component={() => <Navigate href="/work-clock" />}
        />
        <For each={pageList}>
          {(page) => (
            <Route
              path={page.path}
              component={page.component}
            />
          )}
        </For>
        <Route
          path="*404"
          component={() => <span>404 LOL</span>}
        />
      </Route>
    </Router>
  ),
  root,
);
