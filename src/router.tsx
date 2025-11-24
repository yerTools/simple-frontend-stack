import { Component, ComponentProps, For, JSX, lazy } from "solid-js";

import { Route, RouteSectionProps, Router } from "@solidjs/router";

import Layout from "./pages/well-known/Layout";
import { canCreateAdmin, isAuthenticated } from "./service/api/user";

export interface PageDefinition {
  title?: string;
  component: Component<RouteSectionProps<unknown>>;
  icon?: (props: ComponentProps<"svg">) => JSX.Element;
  authenticationRequired?: boolean;
}

export type WellKnownPages = {
  layout: PageDefinition;
  minimalLayout: PageDefinition;
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
  minimalLayout: {
    title: "Minimal Layout",
    component: lazy(() => import("./pages/well-known/MinimalLayout")),
  },
  notFound: {
    title: "Not Found",
    component: lazy(() => import("./pages/well-known/NotFound")),
  },
  login: {
    title: "Login",
    component: lazy(() => import("./pages/well-known/Login")),
  },
  createAdminUser: {
    title: "Create Admin User",
    component: lazy(() => import("./pages/well-known/CreateAdminUser")),
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

function AppLayout(
  wellKnown: WellKnownPages,
  pageList: PageList,
): (props: RouteSectionProps<unknown>) => JSX.Element {
  const authenticationRequired: Record<string, boolean> = {};
  for (const page of pageList) {
    authenticationRequired[page.path] = page.authenticationRequired === true;
  }

  return (props: RouteSectionProps<unknown>): JSX.Element => (
    <>
      {(
        authenticationRequired[props.location.pathname] === true &&
        !isAuthenticated()
      ) ?
        wellKnown.minimalLayout.component(props)
      : wellKnown.layout.component(props)}
    </>
  );
}

export function App(props: {
  wellKnown: WellKnownPages;
  pageList: PageList;
}): JSX.Element {
  return (
    <>
      {canCreateAdmin() === true ?
        <Router root={props.wellKnown.minimalLayout.component}>
          <Route
            path="*"
            component={props.wellKnown.createAdminUser.component}
          />
        </Router>
      : <Router root={AppLayout(props.wellKnown, props.pageList)}>
          <For
            each={props.pageList}
            children={(page) => (
              <Route
                path={page.path}
                component={
                  page.authenticationRequired === true && !isAuthenticated() ?
                    props.wellKnown.login.component
                  : page.component
                }
              />
            )}
          />
          <Route
            path="*404"
            component={props.wellKnown.notFound.component}
          />
        </Router>
      }
    </>
  );
}
