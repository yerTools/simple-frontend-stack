import { JSX } from "solid-js";

import { RouteSectionProps } from "@solidjs/router";

const NotFound = (_: RouteSectionProps): JSX.Element => {
  return <span>404 Not Found</span>;
};

export default NotFound;
