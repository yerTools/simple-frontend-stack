# Simple Frontend Stack 🌱⚡💻

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE.md)
![CI/CD](https://github.com/yerTools/simple-frontend-stack/actions/workflows/cicd.yml/badge.svg)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/yerTools/simple-frontend-stack?utm_source=oss&utm_medium=github&utm_campaign=yerTools%2Fsimple-frontend-stack&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## TL;DR ⚡️

A **simple, lightweight frontend stack** for quickly building web apps or SPAs.  
Powered by **SolidJS** 💎, **TailwindCSS** 🎨 & **DaisyUI** 🌼 for styling, with a rich ecosystem of libraries for everything from icon support to state management.  
Runs on **Bun** 🚀 and **Vite** ⚡️ for an ultra-fast development workflow.  
Want to see it in action? Check out the live demo at [simple-frontend-stack.ltl.re](https://simple-frontend-stack.ltl.re/).

## Table of Contents 📑

- [Core Stack ⚙️](#core-stack-️)
- [Overview 🌟](#overview-)
- [Key Features ✨](#key-features-)
- [Quick Start Guide 🚀](#quick-start-guide-)
- [Included Frameworks & Libraries 📚](#included-frameworks--libraries-)
- [Vite Plugins 🔌](#vite-plugins-)
- [Development Workflow 🛠️](#development-workflow-️)
- [Project Structure 📂](#project-structure-)
- [Deployment Options 🌐](#deployment-options-)
- [Contributing 👥](#contributing-)
- [Summary 🎯](#summary-)
- [License 📝](#license-)

---

### Core Stack ⚙️

- **Frontend**: [SolidJS](https://www.solidjs.com/) 💎 - React-like simplicity, unmatched performance
- **Styling**: [TailwindCSS](https://tailwindcss.com/) 🎨 + [DaisyUI](https://daisyui.com/) 🌼 - Utility-first beauty
- **Backend**: [PocketBase](https://pocketbase.io/) 🗄️ - Open source backend in a single file
- **Bundler**: [Vite](https://vitejs.dev/) ⚡ - Next generation frontend tooling
- **Runtime**: [Bun](https://bun.sh/) 🚀 - All-in-one JavaScript runtime & toolkit

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

## Key Features ✨

- **Modern JavaScript/TypeScript Support** - Full TypeScript integration with strict type checking
- **Responsive Design Framework** - Tailwind CSS with custom utility classes for responsive layouts
- **Component Library** - DaisyUI components with custom "solidarity" themes in light and dark modes
- **Blazing Fast Development** - Hot Module Reloading (HMR) with Vite and lightning-fast bundle times with Bun
- **Advanced Animation Support** - Built-in animations with Auto Animate, Swapy, and Intersection Observer utilities
- **Accessibility** - Accessible components using Kobalte UI primitives
- **Icon System** - Thousands of icons from multiple libraries via Iconify integration
- **State Management** - Multiple options from simple signals to XState for complex state machines
- **Production Optimization** - Built-in compression, code splitting, and performance optimizations
- **Docker Support** - Multi-architecture Docker images for easy deployment
- **CI/CD Integration** - GitHub Actions workflows for testing, building, and deployment

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

- [SolidJS](https://www.solidjs.com/) 💎 - Core UI framework
- [TailwindCSS](https://tailwindcss.com/) 🎨 - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) 🌼 - Tailwind CSS component library
- [Rombo Tailwind](https://rombo.co/tailwind/) 💫 - Additional Tailwind utilities
- [Swapy](https://swapy.tahazsh.com/) 🔄 - Animated component transitions
- [Auto Animate](https://auto-animate.formkit.com/) ✨ - Animation library
- [PocketBase](https://pocketbase.io/) 🗄️ - Backend solution
- [TailwindCSS Intersect](https://github.com/heidkaemper/tailwindcss-intersect) 🔗 - Intersection utilities
- [Nanostores](https://github.com/nanostores/nanostores) 🗃️ - Tiny state management
- [Felte](https://github.com/pablo-abc/felte) 📝 - Form management
- [Yup](https://github.com/jquense/yup) ✅ - Schema validation
- [Kobalte](https://kobalte.dev) 💡 - Accessible UI components
- [Lucide](https://lucide.dev/) ✏️ - SVG icon library
- [Solid Router](https://github.com/solidjs/solid-router) 🛣️ - Routing solution
- [Solid AG Grid](https://github.com/solidjs-community/solid-ag-grid) 📊 - Data grid component
- [XState Store](https://stately.ai/docs/xstate-store) 🔄 - State machine management
- [Unplugin Icons](https://github.com/unplugin/unplugin-icons) ([Iconify](https://iconify.design/)) 🌐 - Icon integration
- [Solid Markdown](https://github.com/andi23rosca/solid-markdown) 📖 - Markdown renderer
- [Solid Highlight](https://github.com/aidanaden/solid-highlight) 🌈 - Code highlighting

### Vite Plugins 🔌

Check out these useful Vite plugins included in the project:

- [vite-plugin-webfont-dl](https://github.com/feat-agency/vite-plugin-webfont-dl) 🌐 - Web font downloading
- [vite-plugin-lqip](https://github.com/drwpow/vite-plugin-lqip) 📸 - Low-quality image placeholders
- [vite-plugin-solid](https://github.com/solidjs/vite-plugin-solid) ⚡ - SolidJS integration
- [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression) 📦 - Asset compression
- [unplugin-lightningcss](https://github.com/unjs/unplugin-lightningcss) 🌩️ - CSS processing

## Development Workflow 🛠️

This project includes several npm scripts to streamline your development workflow:

```bash
# Start production build with preview
bun run start

# Start development server with hot reloading
bun run dev

# Build for production
bun run build

# Preview production build
bun run serve

# Check for outdated dependencies
bun run update

# Update all dependencies
bun run upgrade

# Type checking with TypeScript
bun run type-check

# Format code with Prettier
bun run format

# Check code formatting
bun run format-check

# Lint and fix code issues
bun run lint

# Check for linting issues without fixing
bun run lint-check

# Backend-specific commands
bun run backend:build    # Build the Go backend
bun run backend:serve    # Run the PocketBase server
bun run backend:format   # Format Go code
```

## Project Structure 📂

The project follows a simple and intuitive structure:

```
simple-frontend-stack/
├── src/                  # Source code
│   ├── images/           # Image assets
│   ├── pages/            # Page components
│   ├── styles/           # CSS stylesheets
│   │   └── general/      # General styling utilities
│   ├── backend/          # Go backend code (PocketBase integration)
│   ├── types/            # TypeScript type definitions
│   ├── index.html        # Main HTML template
│   └── index.tsx         # Application entry point
├── .github/              # GitHub-specific files
│   └── workflows/        # GitHub Actions CI/CD workflows
├── .husky/               # Git hooks for code quality
├── .vscode/              # VS Code configuration
├── bun.lock              # Bun lockfile
├── Dockerfile            # Docker container definition
├── eslint.config.mjs     # ESLint configuration
├── go.mod, go.sum        # Go module definitions
├── main.go               # Go entry point
├── package.json          # Project dependencies
├── prettier.config.js    # Prettier configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

This organization promotes separation of concerns and makes it easy to locate specific components and files within the project.

## Deployment Options 🌐

This project can be deployed in several ways:

### 1. Static Site (Frontend Only)

For a purely static frontend deployment, build the project and deploy the generated files:

```bash
bun run frontend:build
```

Deploy the generated `dist` folder to any static site hosting service like:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### 2. Docker Deployment (Full Stack)

The project includes a Dockerfile for containerized deployment of both frontend and PocketBase backend:

```bash
# Build the Docker image
docker build -t simple-frontend-stack .

# Run the container
docker run -p 8161:8161 simple-frontend-stack
```

### 3. Manual Deployment

Build both frontend and backend:

```bash
bun run build
```

Then deploy the generated binary and static files to your server.

### CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for:
- Building and testing the application
- Deploying to GitHub Pages
- Building and publishing multi-architecture Docker images

## Contributing 👥

Contributions are welcome! Here's how you can contribute:

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/simple-frontend-stack
   cd simple-frontend-stack
   ```
3. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b my-feature-branch
   ```
4. **Make your changes** and commit them with meaningful messages:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```
5. **Run tests and formatting checks**:
   ```bash
   bun run type-check
   bun run lint-check
   bun run format-check
   ```
6. **Push** your branch to your fork:
   ```bash
   git push origin my-feature-branch
   ```
7. Submit a **Pull Request** through GitHub's interface.
8. Participate in the review process by responding to feedback.

### Code Style Guidelines

- Follow the established project structure
- Use TypeScript with strict types wherever possible
- Format your code with Prettier before submitting
- Ensure your code passes all ESLint checks
- Write meaningful commit messages following conventional commits style
- Add appropriate documentation for new features

---

## Summary 🎯

This project offers a practical, no-nonsense frontend stack that gets you up and running with a modern development workflow quickly. The combination of **Bun**, **Vite**, and a carefully curated set of libraries provides the speed, simplicity, and flexibility needed for both small enhancements and complete web applications.

Happy coding! 🎉

---

## License 📝

This project is licensed under the [MIT License](LICENSE.md).

_Code has no borders – neither should solidarity_ 🌍✊

Last updated: March 27, 2025
