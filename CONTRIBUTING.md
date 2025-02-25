# Contributing to Rewst Workflow Viewer

Thank you for your interest in contributing to the Rewst Workflow Viewer project! This document outlines the standards and practices we follow to maintain a clean, consistent, and well-documented codebase.

## Code Standards

### Naming Conventions

- **Components**: Use PascalCase (e.g., `TaskNode.tsx`)
- **Hooks**: Use camelCase with 'use' prefix (e.g., `useTaskNode.ts`)
- **Utilities**: Use camelCase (e.g., `formatUtils.ts`)
- **Constants**:
  - Use UPPER_SNAKE_CASE for primitive values (e.g., `MAX_NODES`)
  - Use PascalCase for objects/collections (e.g., `DefaultTheme`)
- **Types/Interfaces**: Use PascalCase with descriptive names (e.g., `TaskNodeProps`, not just `Props`)
- **Files**: Match the name of the primary export (e.g., `TaskNode.tsx` for the `TaskNode` component)

### Documentation Standards

- **Components**: Every component must have a JSDoc comment explaining its purpose and usage

  ```tsx
  /**
   * TaskNode - Renders a workflow task as an interactive node
   *
   * Displays task information, status indicators, and handles user interactions
   * such as expanding/collapsing details and navigating to sub-workflows.
   */
  export function TaskNode({ data }: TaskNodeProps) {
    // ...
  }
  ```

- **Props/Interfaces**: Document all properties with descriptions

  ```tsx
  /**
   * Properties for the TaskNode component
   */
  interface TaskNodeProps {
    /** Task data containing all information about the task */
    data: TaskNodeData;
    /** Optional callback when the node is selected */
    onSelect?: (id: string) => void;
  }
  ```

- **Functions**: Include parameter and return value documentation

  ```tsx
  /**
   * Formats a workflow task for display
   *
   * @param task - The raw task data from the workflow JSON
   * @param options - Formatting options
   * @returns Formatted task data ready for display
   */
  function formatTask(task: RawTask, options?: FormatOptions): FormattedTask {
    // ...
  }
  ```

- **Examples**: Add usage examples for complex components or functions
  ````tsx
  /**
   * WorkflowExporter - Provides functionality to export workflows in various formats
   *
   * @example
   * ```tsx
   * const { exportAsSvg, exportAsPng } = useWorkflowExporter(nodeRef);
   *
   * return (
   *   <div>
   *     <button onClick={exportAsSvg}>Export as SVG</button>
   *     <button onClick={exportAsPng}>Export as PNG</button>
   *   </div>
   * );
   * ```
   */
  ````

### Project Structure

The project follows a standardized structure:

- `src/components/`: UI components organized in dedicated directories
- `src/lib/`: Utility functions and shared logic
- `src/types/`: TypeScript type definitions
- `src/styles/`: Global styles and theme configuration

### Component Organization

- **Component Structure**:

  ```
  src/components/ComponentName/
  ├── index.ts                 # Clean exports
  ├── ComponentName.tsx        # Main component
  ├── ComponentName.css        # Styles (if not using CSS-in-JS)
  ├── useComponentName.ts      # Custom hooks
  ├── types.ts                 # TypeScript interfaces/types
  ├── constants.ts             # Component-specific constants
  └── components/              # Sub-components (if needed)
      ├── SubComponent.tsx
      └── ...
  ```

### Path Aliases

The project uses the `@/` path alias to reference files from the `src` directory. This makes imports cleaner and more maintainable:

```tsx
// Instead of this (relative import)
import { formatValueForDisplay } from "../../../lib/utils";

// Use this (path alias)
import { formatValueForDisplay } from "@/lib/utils";
```

Path aliases are configured in both `tsconfig.app.json` and `vite.config.ts`.

- **Import Order**:

  1. React and React-related imports
  2. Third-party libraries
  3. Internal modules (using path aliases)
  4. Relative imports
  5. CSS/SCSS imports

  ```tsx
  // React and React-related imports
  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";

  // Third-party libraries
  import { Handle, Position } from "reactflow";
  import { ChevronDown, ChevronUp } from "lucide-react";

  // Internal modules (using path aliases)
  import { cn } from "@/lib/utils";
  import { Button } from "@/components/ui/button";

  // Relative imports
  import { TaskNodeHeader } from "./TaskNodeHeader";
  import { useTaskNode } from "./useTaskNode";
  import { TaskNodeProps } from "./types";

  // CSS imports
  import "./TaskNode.css";
  ```

- **Business Logic Separation**:
  - Extract complex logic into custom hooks
  - Separate UI components from data processing
  - Use container/presenter pattern for complex components

### Global Configuration

- **Theme Configuration**: Use a centralized theme configuration in `src/styles/theme.ts`
- **Constants**: Store shared constants in dedicated files under `src/constants/`
- **Environment Variables**: Use environment variables for configuration that might change between environments

## Component Guidelines

### Functional Components

- Use functional components with hooks instead of class components
- Use destructuring for props
- Provide default values for optional props
- Use TypeScript interfaces to define prop types

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
}: ButtonProps) {
  // Component implementation
}
```

### Hooks

- Follow the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- Create custom hooks for reusable logic
- Name custom hooks with the 'use' prefix
- Keep hooks focused on a single responsibility

### State Management

- Use local state for component-specific state
- Use context for state that needs to be shared between components
- Consider using a state management library for complex applications

## Testing Guidelines

- Write tests for all components and utilities
- Use Jest and React Testing Library
- Focus on testing behavior, not implementation details
- Write meaningful test descriptions

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure proper keyboard navigation
- Maintain appropriate color contrast
- Test with screen readers

## Performance Considerations

- Use React.memo for expensive components
- Use useCallback for functions passed as props
- Use useMemo for expensive calculations
- Avoid unnecessary re-renders
- Optimize images and assets

## Git Workflow

- Use descriptive branch names (feature/..., bugfix/..., etc.)
- Write clear commit messages
- Keep pull requests focused on a single change
- Request reviews from team members

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] Code follows the naming conventions
- [ ] Documentation is complete and follows standards
- [ ] No unused imports or variables
- [ ] No hardcoded values that should be constants
- [ ] Tests are written and passing
- [ ] Code is accessible
- [ ] Performance considerations are addressed
- [ ] No console.log statements or debugging code
