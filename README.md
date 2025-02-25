# Rewst Workflow Viewer

A specialized visualization tool for Rewst workflow templates.

## Overview

Rewst Workflow Viewer is a React/TypeScript application that allows users to upload Rewst workflow JSON templates and visualize them as interactive node graphs. The application provides a detailed view of workflow tasks, their connections, and properties, making it easier to understand complex workflows.

## Features

- **File Upload**: Upload Rewst workflow JSON templates
- **GitHub Integration**: Browse and visualize workflows directly from GitHub repositories
- **Interactive Visualization**: View workflows as interactive node graphs
- **Task Details**: Expand nodes to see detailed information about each task
- **Visual Indicators**: Different colors and icons for various task types and properties
- **Export Options**: Save visualizations as SVG or PNG
- **Responsive Design**: Works on various screen sizes
- **Persistent Browsing**: Maintain your browsing context while viewing workflows

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- ReactFlow for graph visualization
- Tailwind CSS for styling
- html-to-image for export functionality

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local development server (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Uploading Workflow Files

1. Launch the application
2. Upload a Rewst workflow JSON template using the file upload interface
3. The workflow will be visualized as an interactive graph
4. Hover over nodes to see basic information
5. Click on nodes to expand and see detailed information
6. Use the controls to pan and zoom the graph
7. Use the export buttons to save the visualization as SVG or PNG

### Using GitHub Integration

1. Scroll down to the "Featured Workflows from GitHub" section
2. Browse through the featured GitHub contributors
3. Click on a contributor to view their repositories
4. Navigate through repository folders to find workflow bundles
5. README files will be displayed automatically when available
6. Click on a workflow bundle file (_.json or _.bundle.json) to visualize it
7. The GitHub browser remains visible while viewing workflows, allowing you to:
   - Easily return to browsing after viewing a workflow
   - Toggle the browser visibility with the "Hide/Show Browser" button
   - Navigate to different folders without losing your place

## Project Structure

The project follows a standardized component-based structure:

### Main Directories

- `src/components/`: UI components organized in dedicated directories
- `src/lib/`: Utility functions and shared logic
- `src/types/`: TypeScript type definitions
- `src/styles/`: Global styles and theme configuration

### Key Components

- `src/components/FileUpload/`: Handles JSON file uploads
  - `FileUpload.tsx`: Main component
  - `types.ts`: TypeScript interfaces
  - `constants.ts`: Component constants
- `src/components/GitHubRepoBrowser/`: Provides GitHub repository browsing functionality
  - `GitHubRepoBrowser.tsx`: Main component
  - `types.ts`: TypeScript interfaces
  - `constants.ts`: Component constants
- `src/components/WorkflowViewer/`: Main visualization components
  - `WorkflowViewer.tsx`: Main component for rendering the workflow graph
  - `components/`: Sub-components for the workflow viewer
  - `hooks/`: Custom hooks for workflow processing
  - `utils/`: Utility functions for workflow visualization
  - `constants/`: Constants for the workflow viewer
- `src/components/TaskNode/`: Components for rendering task nodes
  - `TaskNode.tsx`: Main component for rendering task nodes
  - `TaskNodeHeader.tsx`: Header component for task nodes
  - `TaskNodeDetails.tsx`: Component for displaying task details
  - `useTaskNode.ts`: Hook for task node functionality
- `src/components/ui/`: Shared UI components
  - `button.tsx`: Button component
  - `card.tsx`: Card component
  - `tabs.tsx`: Tabs component
  - And more reusable UI components

### Utilities and Types

- `src/lib/utils.ts`: Shared utility functions
- `src/lib/workflow-validation.ts`: Workflow validation utilities
- `src/types/workflow.ts`: TypeScript interfaces for workflow data

### Path Aliases

The project uses the `@/` path alias to reference files from the `src` directory, making imports cleaner and more maintainable.

## Workflow JSON Format

The application expects Rewst workflow templates in JSON format with the following structure:

```json
{
  "version": number,
  "exportedAt": string,
  "objects": {
    [key: string]: {
      "type": string,
      "content_hash": string,
      "hash": string,
      "fields": {
        "tasks": [
          {
            "id": string,
            "type": string,
            "name": string,
            "description": string,
            "action": {
              "id": string,
              "ref": string
            },
            "next": [
              {
                "id": string,
                "label": string,
                "do": string[]
              }
            ],
            ...
          }
        ],
        ...
      },
      "nonfunctional_fields": {
        ...
      }
    }
  },
  "references": {
    ...
  }
}
```

## GitHub Integration

The application can browse and visualize workflows directly from GitHub repositories. By default, it connects to featured GitHub contributors who have shared Rewst workflows.

The GitHub integration features:

- Repository browsing with folder navigation
- README rendering for documentation
- Direct visualization of workflow bundle files
- Links to view files on GitHub
- Persistent browsing context while viewing workflows
- Custom repository input for each contributor

## Future Improvements

- Add search/filter functionality for large workflows
- Implement workflow comparison (comparing two versions)
- Add ability to save/load multiple workflows
- Add a mini-map for navigation in large workflows
- Improve accessibility features
- Add comprehensive test coverage
- Support for more GitHub repositories and custom repository configuration
- Add GitHub authentication for accessing private repositories

## License

[GNU General Public License v3.0](LICENSE)
