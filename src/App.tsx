import { Component, createSignal, onMount } from "solid-js";
import { createSwapy } from "swapy";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  let containerRef!: HTMLDivElement;

  onMount(() => {
    createSwapy(containerRef);
  });

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
    </div>
  );
};

export default App;
