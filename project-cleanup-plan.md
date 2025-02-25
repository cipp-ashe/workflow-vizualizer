# Project Structure Cleanup Plan - Implementation Status

## Issues Addressed

1. **Duplicate Components**:

   - ✅ Removed standalone `TaskNode.tsx` file
   - ✅ Removed standalone `WorkflowViewer.tsx` file
   - ✅ Updated imports to use the directory versions

2. **Inconsistent Directory Structure**:

   - ✅ Moved all components into dedicated directories
   - ✅ Organized `TestWorkflow.tsx` into its own directory
   - ✅ Moved loose files in WorkflowViewer to appropriate subdirectories

3. **Path Alias Confusion**:

   - ✅ Removed duplicate `@/` directory at the root level
   - ✅ Updated imports to use the correct path alias from `src/`

4. **Lack of Consistent Documentation**:
   - ✅ Added README.md files to key component directories:
     - `src/components/WorkflowViewer/README.md`
     - `src/components/TaskNode/README.md`
     - `src/components/ui/README.md`
   - ✅ Enhanced JSDoc comments in components

## Issues Still to Address

1. **Nested Project**:

   - The Next.js project (`workflow-visualizer`) still exists within the main Vite project
   - Decision needed: Should we fully integrate it or maintain as separate project?

2. **Potential Hard-Coding Issues**:
   - Some values that should be configurable might be hard-coded
   - Lack of centralized configuration for shared values

## Cleanup Strategy

The plan is organized into several phases to systematically address these issues:

### Phase 1: Separate the Projects

The first step is to clearly separate the Next.js project from the main Vite project:

1. **Move the Next.js project out of the main project directory**:
   - The `workflow-visualizer` directory should be moved to a separate location (e.g., `../workflow-visualizer`)
   - This will prevent confusion between the two projects
   - Update any references or documentation accordingly
   - Create a clear README in both projects explaining their relationship and purpose

### Phase 2: Establish Project-Wide Standards

Before restructuring components, establish clear standards for the entire project:

1. **Naming Conventions**:

   - Components: PascalCase (e.g., `TaskNode.tsx`)
   - Hooks: camelCase with 'use' prefix (e.g., `useTaskNode.ts`)
   - Utilities: camelCase (e.g., `formatUtils.ts`)
   - Constants: UPPER_SNAKE_CASE for values, PascalCase for objects
   - Types/Interfaces: PascalCase with descriptive names (e.g., `TaskNodeProps`, not just `Props`)

2. **Documentation Standards**:

   - Every component must have a JSDoc comment explaining its purpose and usage
   - All props/interfaces must be documented with descriptions
   - Complex functions must include parameter and return value documentation
   - Add examples where appropriate for complex components

3. **Code Organization**:

   - Group related functionality in dedicated directories
   - Use index files for clean exports
   - Separate business logic from UI components where possible

4. **Global Configuration**:
   - Move all configurable values to dedicated configuration files
   - Create a centralized theme configuration
   - Establish constants files for shared values

### Phase 3: Standardize Component Structure

Create a consistent structure for all components:

1. **Component Organization Pattern**:

   - All components will be organized in dedicated directories
   - Each component gets its own directory under `src/components/`
   - Related files (styles, hooks, types, sub-components) go in the component's directory
   - Each component directory has an `index.ts` file that exports the main component
   - Complex components may have a `components/` subdirectory for child components

2. **Component Directory Structure**:

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

3. **UI Components**:
   - Consolidate all UI components in `src/components/ui`
   - Remove any duplicate UI component directories
   - Ensure all UI components follow the same pattern
   - Create a comprehensive UI component documentation

### Phase 4: Resolve Duplicate Components

1. **TaskNode Component**:

   - Compare the standalone `TaskNode.tsx` with the directory version
   - Keep the more complete/updated version (likely the directory version)
   - Remove the standalone version
   - Update all imports to reference the correct version
   - Ensure comprehensive documentation is added
   - Extract any hard-coded values to constants

2. **WorkflowViewer Component**:
   - Compare the standalone `WorkflowViewer.tsx` with the directory version
   - Keep the more complete/updated version
   - Remove the standalone version
   - Update all imports to reference the correct version
   - Ensure comprehensive documentation is added
   - Extract any hard-coded values to constants

### Phase 5: Standardize Imports and Paths

1. **Import Style**:

   - Use path aliases (`@/`) consistently for all imports from the `src` directory
   - Use relative imports only for files within the same component directory
   - Group imports logically (React, third-party, internal)

2. **Update Imports**:
   - Scan all files and update imports to follow the chosen pattern
   - Ensure all components use the same import style
   - Remove any unused imports

### Phase 6: Clean Up and Enhance Utility Files

1. **Organize Utility Files**:

   - Move all utility functions to `src/lib`
   - Group related utilities into dedicated files with clear naming
   - Add comprehensive documentation for each utility function
   - Write unit tests for critical utility functions
   - Example structure:
     ```
     src/lib/
     ├── formatUtils.ts      # String/data formatting utilities
     ├── fileUtils.ts        # File handling utilities
     ├── apiUtils.ts         # API-related utilities
     └── ...
     ```

2. **Organize Types**:

   - Consolidate all shared type definitions in `src/types`
   - Component-specific types should remain in their component directories
   - Create a clear hierarchy of types (base types, extended types)
   - Document all types thoroughly

3. **Create Global Constants**:
   - Move all hard-coded values to a constants directory
   - Organize constants by domain/purpose
   - Example structure:
     ```
     src/constants/
     ├── theme.ts            # Theme-related constants
     ├── api.ts              # API-related constants
     ├── workflow.ts         # Workflow-specific constants
     └── ...
     ```

### Phase 7: Enhance Documentation

1. **Component Documentation**:

   - Add comprehensive JSDoc comments to all components
   - Document props, state, and effects
   - Include usage examples for complex components

2. **Project Documentation**:

   - Update README.md with clear project structure information
   - Add a CONTRIBUTING.md with coding standards and conventions
   - Create a directory structure visualization

3. **Code Comments**:
   - Add meaningful comments for complex logic
   - Document any non-obvious decisions or workarounds
   - Remove any outdated or misleading comments

## Implementation Plan

### Phase 1: Separate the Projects

1. Create a backup of the entire project
2. Move the `workflow-visualizer` directory to a parent directory:
   ```bash
   mv workflow-visualizer ../
   ```
3. Create clear README files in both projects explaining their relationship and purpose

### Phase 2: Establish Project Standards

1. Create a coding standards document in the project root:
   ```bash
   touch CONTRIBUTING.md
   ```
2. Document naming conventions, code organization, and documentation standards
3. Set up linting rules to enforce these standards where possible

### Phase 3: Standardize Component Structure

1. **For each standalone component file in `src/components/`**:

   - Create a new directory with the component name
   - Move the component file into the directory and rename to match the directory
   - Create an `index.ts` file that exports the component
   - Add proper documentation
   - Extract any hard-coded values to constants

2. **For UI components**:
   - Ensure all UI components are in `src/components/ui`
   - Create an `index.ts` file in the UI directory that exports all components
   - Add comprehensive documentation for each UI component

### Phase 4: Resolve Duplicate Components

1. **TaskNode Component**:

   - Compare `src/components/TaskNode.tsx` with `src/components/TaskNode/TaskNode.tsx`
   - If the directory version is more complete:
     - Update any imports in other files to use the directory version
     - Remove the standalone file
   - If the standalone version is more complete:
     - Move its functionality to the directory version
     - Update any imports to use the directory version
     - Remove the standalone file
   - Add comprehensive documentation
   - Extract any hard-coded values to constants

2. **WorkflowViewer Component**:
   - Compare `src/components/WorkflowViewer.tsx` with `src/components/WorkflowViewer/WorkflowViewer.tsx`
   - Follow the same process as with TaskNode
   - Add comprehensive documentation
   - Extract any hard-coded values to constants

### Phase 5: Standardize Imports and Paths

1. Update all imports to use path aliases consistently:

   - Replace relative imports like `../lib/utils` with `@/lib/utils`
   - Keep relative imports only for files within the same component directory
   - Group imports logically (React, third-party, internal)

2. Update the `tsconfig.app.json` to ensure path aliases are correctly configured:
   ```json
   "paths": {
     "@/*": ["src/*"]
   }
   ```

### Phase 6: Clean Up and Enhance Utility Files

1. **Organize utility files**:

   - Create a structured directory for utilities in `src/lib`
   - Group related utilities into dedicated files with clear naming
   - Add comprehensive documentation for each utility function
   - Extract any hard-coded values to constants

2. **Organize types**:

   - Create a structured directory for shared types in `src/types`
   - Document all types thoroughly
   - Ensure consistent naming conventions

3. **Create global constants**:
   - Create a structured directory for constants in `src/constants`
   - Extract hard-coded values from components and utilities
   - Group constants by domain/purpose

### Phase 7: Enhance Documentation

1. Update the README.md with:

   - Project overview
   - Directory structure
   - Setup instructions
   - Development workflow

2. Add inline documentation to all components and functions

## Testing Plan

After each phase:

1. Run the application to ensure it still works
2. Fix any import errors or other issues that arise
3. Run the linter to catch any missed issues
4. Document any changes made
5. Write or update tests for modified components

## Final Steps

1. Update the README.md with the new project structure
2. Run a final test of the application
3. Commit the changes with a clear message about the restructuring
4. Create a pull request with detailed documentation of the changes

## Code Quality Checklist

Before finalizing each component or utility:

1. **Documentation**:

   - [ ] JSDoc comments for components and functions
   - [ ] Props/parameters documented
   - [ ] Return values documented
   - [ ] Usage examples for complex components

2. **Code Organization**:

   - [ ] Logical grouping of related functionality
   - [ ] Separation of concerns (UI vs. logic)
   - [ ] Consistent file structure

3. **Naming**:

   - [ ] Clear, descriptive names
   - [ ] Consistent naming conventions
   - [ ] No ambiguous abbreviations

4. **Configuration**:

   - [ ] No hard-coded values
   - [ ] Constants extracted to appropriate files
   - [ ] Theme values used consistently

5. **Imports**:
   - [ ] Consistent import style
   - [ ] No unused imports
   - [ ] Logical grouping of imports
