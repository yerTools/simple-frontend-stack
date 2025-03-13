/* @refresh reload */
import "./styles/general.css";

import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";

import Index from "./pages/Index";

const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Route
        path="*"
        component={() => <Index />}
      />
      <Route
        path="/hello"
        component={() => <span>Hello World!</span>}
      />
    </Router>
  ),
  root!,
);
