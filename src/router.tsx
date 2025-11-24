import { Component, ComponentProps, For, JSX } from "solid-js";

import { Route, RouteSectionProps, Router } from "@solidjs/router";

import Layout from "./pages/well-known/Layout";

export interface PageDefinition {
  title?: string;
  component: Component<RouteSectionProps<unknown>>;
  icon?: (props: ComponentProps<"svg">) => JSX.Element;
}

export type WellKnownPages = {
  layout: PageDefinition;
  notFound: PageDefinition;
  login: PageDefinition;
  createAdminUser: PageDefinition;
};

export type AppPages = {
  [key: string]: PageDefinition & {
    children?: PageTree;
  };
};

export type PageTree = Partial<{
  "well-known": Partial<WellKnownPages>;
}> &
  AppPages;

export type PageList = ({ path: string } & PageDefinition)[];

export const DefaultWellKnownPages: WellKnownPages = {
  layout: {
    title: "Layout",
    component: Layout,
  },
  notFound: {
    title: "Not Found",
    component: () => <span>404 Not Found</span>,
  },
  login: {
    title: "Login",
    component: () => <span>Login Page</span>,
  },
  createAdminUser: {
    title: "Create Admin User",
    component: () => <span>Create Admin User Page</span>,
  },
};

function normalizePath(path: string): string {
  return (
    "/" +
    path
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .join("/")
  );
}

function flattenAppPages(appPages: AppPages, depth: number): PageList {
  const result: ({ path: string } & PageDefinition)[] = [];
  for (const [key, value] of Object.entries(appPages)) {
    if (depth === 0 && key === "well-known") {
      continue;
    }

    const path = normalizePath(key);

    result.push({ path, ...value });
    if (value.children) {
      result.push(
        ...flattenAppPages(value.children, depth + 1).map((child) => ({
          ...child,
          path: normalizePath(`${path}/${child.path}`),
        })),
      );
    }
  }
  return result;
}

export function transformPageTree<T extends PageTree>(
  pageTree: T,
): [PageList, WellKnownPages, T] {
  const wellKnown = (pageTree["well-known"] || {}) as WellKnownPages;
  for (const [key, value] of Object.entries(DefaultWellKnownPages)) {
    if (!(key in wellKnown)) {
      wellKnown[key as keyof WellKnownPages] = value;
    }
  }

  const pageList = flattenAppPages(pageTree, 0);
  return [pageList, wellKnown, pageTree];
}

export function App(props: {
  wellKnown: WellKnownPages;
  pageList: PageList;
}): JSX.Element {
  return (
    <Router root={props.wellKnown.layout.component}>
      <For
        each={props.pageList}
        children={(page) => (
          <Route
            path={page.path}
            component={page.component}
          />
        )}
      />
      <Route
        path="*404"
        component={props.wellKnown.notFound.component}
      />
    </Router>
  );
}
