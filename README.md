# Simple Frontend Stack

## TL;DR ⚡️

A **simple, lightweight frontend stack** for quickly building web apps or SPAs.  
Powered by **SolidJS** 💎, **TailwindCSS** 🎨 & **DaisyUI** 🌼 for styling, with a rich ecosystem of libraries for everything from icon support to state management.  
Runs on **Bun** 🚀 and **Vite** ⚡️ for an ultra-fast development workflow.  
Want to see it in action? Check out the live demo at [simple-frontend-stack.ltl.re](https://simple-frontend-stack.ltl.re/).

## Table of Contents 📑

- [Overview](#overview-🌟)
- [Quick Start Guide](#quick-start-guide-🚀)
- [Included Frameworks & Libraries](#included-frameworks--libraries-📚)
- [Vite Plugins](#vite-plugins-🔌)
- [Summary](#summary-🎯)
- [License](#license-📝)

---

## Overview 🌟

This project serves as a starting point for small, static web applications or extensions to existing projects. Whether you're adding just a tiny JavaScript snippet or building a full Single Page Application (SPA), this stack is designed to be as simple as possible while providing robust functionality.

The stack shines when used together with [PocketBase](https://pocketbase.io/) — your "Open Source backend in 1 file" offering features such as:

- **Realtime Database** 🔄
- **Authentication** 🔐
- **File Storage** 📁
- **Admin Dashboard** 🖥️

With PocketBase, you can easily construct a full-stack application complete with user management, backups, job scheduling, and more. Alternatively, you can use this stack purely on the frontend.

The idea is to leverage **standardized languages, libraries, tools, and frameworks** to lower the entry barrier—even for developers with limited IT background.  
While languages like Elm or Gleam might offer superior type-safety for complex applications, PocketBase (written in Go) strikes a balance for a powerful yet simple backend solution.  
Combined with TypeScript, SolidJS, and a vibrant ecosystem of libraries, you'll have a practical and maintainable environment for rapid development.

---

## Quick Start Guide 🚀

### Prerequisites

- **Bun:** This stack requires [Bun](https://bun.sh/) for running and building the project.
- **Go (optional):** If you plan to use PocketBase as a backend, ensure [Go is installed](https://golang.org/doc/install).
- **Visual Studio Code:** Recommended IDE. The project includes basic configurations and extension suggestions in the `.vscode` folder.

### Getting Started

1. **Clone the Repository** 🌀

   ```bash
   git clone https://github.com/yerTools/simple-frontend-stack
   cd simple-frontend-stack
   ```

2. **Install Dependencies** 📦

   Run the following to install all required packages with Bun:

   ```bash
   bun install
   ```

3. **Start Development** 🎬

   Launch the development server with watch mode and live preview (default port 8161):

   ```bash
   bun run dev
   ```

   The app should now be available at [http://localhost:8161](http://localhost:8161).

4. **Code Quality Tools** 🔍

   - **Prettier:** Format code with:
     ```bash
     bun run format
     ```
   - **ESLint:** Check code for issues with:
     ```bash
     bun run lint-check
     ```

5. **Optional: CI/CD & Husky** 🤖

   Husky pre-push hooks ensure tests and linting run automatically. For more details, review the Husky configuration and GitHub CI/CD setup.

---

## Included Frameworks & Libraries 📚

- [SolidJS](https://www.solidjs.com/) 💎
- [TailwindCSS](https://tailwindcss.com/) 🎨
- [DaisyUI](https://daisyui.com/) 🌼
- [Rombo Tailwind](https://rombo.co/tailwind/) 💫
- [Swapy](https://swapy.tahazsh.com/) 🔄
- [Auto Animate](https://auto-animate.formkit.com/) ✨
- [PocketBase](https://pocketbase.io/) 🗄️
- [TailwindCSS Intersect](https://github.com/heidkaemper/tailwindcss-intersect) 🔗
- [Nanostores](https://github.com/nanostores/nanostores) 🗃️
- [Felte](https://github.com/pablo-abc/felte) 📝
- [Yup](https://github.com/jquense/yup) ✅
- [Kobalte](https://kobalte.dev) 💡
- [Lucide](https://lucide.dev/) ✏️
- [Solid Router](https://github.com/solidjs/solid-router) 🛣️
- [Solid AG Grid](https://github.com/solidjs-community/solid-ag-grid) 📊
- [XState Store](https://stately.ai/docs/xstate-store) 🔄
- [Unplugin Icons](https://github.com/unplugin/unplugin-icons) ([Iconify](https://iconify.design/)) 🌐
- [Solid Markdown](https://github.com/andi23rosca/solid-markdown) 📖
- [Solid Highlight](https://github.com/aidanaden/solid-highlight) 🌈

### Vite Plugins 🔌

Check out these useful Vite plugins:

- [vite-plugin-webfont-dl](https://github.com/feat-agency/vite-plugin-webfont-dl) 🌐
- [vite-plugin-lqip](https://github.com/drwpow/vite-plugin-lqip) 📸

---

## Summary 🎯

This project offers a practical, no-nonsense frontend stack that gets you up and running with a modern development workflow quickly. The combination of **Bun**, **Vite**, and a carefully curated set of libraries provides the speed, simplicity, and flexibility needed for both small enhancements and complete web applications.

Happy coding! 🎉

---

## License 📝

This project is licensed under the [MIT License](LICENSE.md).
