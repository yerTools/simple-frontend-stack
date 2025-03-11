import { Component, createSignal } from "solid-js";

const App: Component = () => {
  const [count, setCount] = createSignal(0);

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
    </div>
  );
};

export default App;
