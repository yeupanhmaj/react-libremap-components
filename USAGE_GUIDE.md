# Project Usage Guide: MapComponents Monorepo

This project is a monorepo managed with **Nx** and **pnpm**. Below is a guide on how to interact with it and answer your specific questions about installation.

## 📦 Dependency Installation

**Do I need to install node modules for each package or just the root?**
Successfully working with this project only requires you to run the installation command at the **root level**.

1.  **Install pnpm and Nx globally** (if not already installed):
    ```bash
    npm i -g nx pnpm
    ```
2.  **Install dependencies from the root**:
    ```bash
    pnpm install
    ```

> [!IMPORTANT]
> Running `pnpm install` at the root will automatically resolve and link dependencies for all packages in the `apps/` and `packages/` directories thanks to pnpm workspaces. You should **not** run `npm install` or `pnpm install` inside individual package directories unless you have a very specific reason to do so.

## 🚀 Running Tasks

Since this project uses **Nx**, you don't typically run scripts directly from a package's directory. Instead, you run them from the root using the `nx` CLI.

### Listing Projects
To see all projects in the monorepo:
```bash
nx show projects
```

### Running a Specific Task
To run a task (like `build`, `test`, or `storybook`) for a specific package:
```bash
nx run <project-name>:<task-name>
# Example:
nx run react-libremap-components:storybook
```

### Running Tasks in Parallel
To run a specific task for all projects that support it:
```bash
nx run-many -t <task-name>
# Example (start all storybooks):
nx run-many -t storybook
```

## 📂 Project Structure

-   `apps/`: Contains runnable applications or complex compositions (e.g., `storybook-composition`).
-   `packages/`: Contains reusable libraries and components (e.g., `react-libremap-components`, `deck-gl`).
-   `nx.json`: Configuration for the Nx workspace.
-   `pnpm-workspace.yaml`: Defines the workspace roots for pnpm.
-   `MonorepoNX-cheatsheet.md`: A detailed local guide with more advanced commands.

## 🎨 Storybook & Decorators

When working with Storybook in `packages/react-libremap-components`, you might notice that many components (like `MlSketchTool`) don't explicitly include a `<MapLibreMap />` in their stories, yet a map appears in the preview.

This is handled by **Storybook Decorators**:
- **`MapContextDecorator.tsx`**: This decorator wraps stories with the necessary `MapComponentsProvider` and a `MapLibreMap` component.
- **Configuration**: It is usually applied in the story's `default export` or globally in `.storybook/preview.ts`.

Example from `MlSketchTool.stories.tsx`:
```typescript
import mapContextDecorator from '../../decorators/MapContextDecorator';

export default {
    title: 'MapComponents/MlSketchTool',
    decorators: mapContextDecorator, // Automatically adds the map background
};
```

## 🛠️ Adding New Packages

To add a new library or application, use the Nx generators to ensure all boilerplate and workspace configurations are correctly updated:

-   **New Library**: `nx g @nx/react:library --directory=packages/my-package ...`
-   **New Application**: `nx g @nx/react:application --directory=apps/my-app ...`

Refer to the [MonorepoNX-cheatsheet.md](file:///c:/Users/nmhoang/Documents/Source/react-map-components-maplibre/MonorepoNX-cheatsheet.md) for more detailed generator commands.
