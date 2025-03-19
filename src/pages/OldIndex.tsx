import {
  Component,
  FlowComponent,
  For,
  JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";

import PocketBase from "pocketbase";

import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { SolidMarkdown } from "solid-markdown";
import { createSwapy } from "swapy";
import { Observer } from "tailwindcss-intersect";

import waspOnFlower from "../images/wasp_on_flower.jpeg?lqip";

const ObserverProvider: FlowComponent = (props: { children: JSX.Element }) => {
  createEffect(() => {
    Observer.start();
  });

  return <>{props.children}</>;
};

const pb = new PocketBase();
pb.health
  .check()
  .then((res) => {
    console.log("[PocketBase] Health Check:", res);
  })
  .catch((err) => {
    console.error("[PocketBase] Health Check Error:", err);
  });

const Index: Component = () => {
  const [count, setCount] = createSignal(0);
  let containerRef!: HTMLDivElement;

  onMount(() => {
    createSwapy(containerRef);
  });

  const [parent] = createAutoAnimate(/* optional config */);

  const menuItems = ["Home", "Settings", "Logout"];
  const [isExpanded, setIsExpanded] = createSignal(true);
  const scroll = new Array(100);

  return (
    <div>
      <p class="py-20 text-center text-4xl text-green-700">Hello tailwind!</p>
      <button
        class="btn motion-preset-shake"
        onClick={() => setCount(count() + 1)}
      >
        Click Me!
      </button>
      <span class="countdown font-mono text-6xl">
        <span
          {...{ style: `--value:${count()};` }}
          aria-live="polite"
          aria-label={count() + ""}
        >
          {count()}
        </span>
      </span>
      <SolidMarkdown>{`Hallo **Welt**!`}</SolidMarkdown>
      <div
        class="parent"
        ref={parent}
      >
        <Show
          when={isExpanded()}
          keyed
        >
          <ul class="drawer">
            <For each={menuItems}>{(item) => <li class="item">{item}</li>}</For>
          </ul>
        </Show>
        <div class="content">
          <button
            class="button button--alt"
            type="button"
            onClick={() => setIsExpanded((isExpanded) => !isExpanded)}
          >
            Toggle Drawer
          </button>
        </div>
      </div>
      <img
        src={waspOnFlower.src}
        width={waspOnFlower.width}
        height={waspOnFlower.height}
        style={{
          "background-image": `url("${waspOnFlower.lqip}")`,
          "background-size": "cover",
        }}
      />
      <div
        class="container"
        ref={containerRef}
      >
        <div data-swapy-slot="a">
          <div data-swapy-item="a">
            <div>A</div>
          </div>
        </div>

        <div data-swapy-slot="b">
          <div data-swapy-item="b">
            <div>B</div>
          </div>
        </div>

        <div data-swapy-slot="c">
          <div data-swapy-item="c">
            <div>C</div>
          </div>
        </div>
      </div>
      <ObserverProvider>
        <For each={scroll}>
          {() => (
            <div class="intersect:motion-opacity-in-0 intersect:motion-translate-y-in-100 intersect:motion-rotate-in-180 intersect-once bg-error p-10">
              Complex scroll animation
            </div>
          )}
        </For>
      </ObserverProvider>
    </div>
  );
};

export default Index;
