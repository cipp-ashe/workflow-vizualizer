# Rewst Workflow Viewer

A specialized visualization tool for Rewst workflow templates.

## Overview

Rewst Workflow Viewer is a React/TypeScript application that allows users to upload Rewst workflow JSON templates and visualize them as interactive node graphs. The application provides a detailed view of workflow tasks, their connections, and properties, making it easier to understand complex workflows.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)

## Features

- **File Upload**: Upload Rewst workflow JSON templates
- **GitHub Integration**: Browse and visualize workflows directly from GitHub repositories
- **Interactive Visualization**: View workflows as interactive node graphs
- **Task Details**: Expand nodes to see detailed information about each task
- **Visual Indicators**: Different colors and icons for various task types and properties
- **Export Options**: Save visualizations as SVG or PNG
- **Responsive Design**: Works on various screen sizes
- **Persistent Browsing**: Maintain your browsing context while viewing workflows
- **Efficient Caching**: Minimize GitHub API calls with local storage caching
- **Bundle-Focused Browsing**: Automatically filter repositories to show only folders with workflow bundles

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

## Workflow JSON Format and Parsing

The application parses and visualizes Rewst workflow templates in JSON format. The parsing process involves:

1. **Validation**: Verifying the JSON structure matches the expected Rewst workflow format
2. **Processing**: Converting workflow tasks into nodes and transitions into edges
3. **Layout**: Automatically positioning nodes if no position data is available
4. **Rendering**: Displaying the workflow as an interactive graph

### Workflow Bundle Structure

```json
{
  "version": number,        // Version of the workflow format (1 or 2)
  "exportedAt": string,     // Timestamp when the workflow was exported
  "objects": {              // Map of workflow objects
    [key: string]: {
      "type": string,       // Object type (e.g., "workflow", "action", etc.)
      "content_hash": string,
      "hash": string,
      "fields": {
        "tasks": [          // Array of workflow tasks
          {
            "id": string,   // Unique identifier for the task
            "type": string, // Task type
            "name": string, // Display name
            "description": string,
            "action": {     // Action to perform
              "id": string,
              "ref": string // Reference to action definition
            },
            "next": [       // Transitions to next tasks
              {
                "id": string,
                "label": string,
                "do": string[]
              }
            ],
            // Additional task properties...
          }
        ],
        // Additional workflow fields...
      },
      "nonfunctional_fields": {
        // Metadata and display properties
      }
    }
  },
  "references": {
    // References to external objects
  }
}
```

### Parsing Process

The workflow parsing process follows these steps:

1. **Bundle Validation** (`isValidWorkflowBundle` in `workflow-validation.ts`):

   - Checks for required top-level properties (version, exportedAt, objects)
   - Verifies version is supported (1 or 2)
   - Ensures at least one workflow object with tasks exists

2. **Workflow Processing** (`useWorkflowProcessor` hook):

   - Identifies the selected workflow from the bundle
   - Extracts tasks and converts them to nodes
   - Processes transitions into edges
   - Adds trigger connections if applicable
   - Applies automatic layout if position data is missing

3. **Visualization** (`WorkflowViewer` component):
   - Renders the processed nodes and edges using ReactFlow
   - Provides interactive controls for navigation
   - Enables expanding/collapsing task details
   - Supports zooming, panning, and exporting

### Supported Workflow Versions

The viewer supports both version 1 and version 2 of the Rewst workflow format, with automatic detection and appropriate handling of each version's specific features.

## GitHub Integration

The application can browse and visualize workflows directly from GitHub repositories. By default, it connects to featured GitHub contributors who have shared Rewst workflows.

### GitHub Integration Features

- **Smart Repository Filtering**: Automatically identifies and displays only folders containing `.bundle.json` files
- **Rewst Repository Discovery**: Finds repositories with "rewst" in their name
- **Efficient Caching**: Minimizes API calls with local storage caching (24-hour expiration)
- **Repository Browsing**: Navigate through repository folders
- **README Rendering**: Automatically displays documentation when available
- **Direct Visualization**: One-click workflow bundle loading
- **External Links**: Quick access to view files on GitHub
- **Persistent Context**: Maintain browsing state while viewing workflows
- **Custom Repository Input**: Enter specific repositories for each contributor

### GitHub API Usage

The GitHub integration uses the public GitHub API with the following considerations:

- **Rate Limiting**: Implements caching to minimize API calls and avoid rate limits
- **Authentication**: Uses unauthenticated API access (subject to lower rate limits)
- **Cache Management**: Provides a "Clear Cache" button to refresh data when needed
- **Error Handling**: Gracefully handles API errors with informative messages

### Adding New GitHub Contributors

To add new GitHub contributors to the featured list:

1. Identify users with repositories containing `.bundle.json` files
2. Add them to the `FEATURED_USERS` array in `src/components/GitHubRepoBrowser/constants.ts`
3. Provide their GitHub username, display name, and description

## Troubleshooting

### Common Issues and Solutions

#### Workflow Not Visualizing Correctly

- **Issue**: Workflow loads but doesn't display any nodes
- **Solution**: Check that the JSON format matches the expected structure. The workflow must have a `tasks` array with valid task objects.

#### GitHub API Rate Limit Exceeded

- **Issue**: Error message about GitHub API rate limit
- **Solution**:
  1. Wait for the rate limit to reset (time is shown in the error message)
  2. Clear the cache to use cached data if available
  3. Consider implementing GitHub authentication for higher rate limits

#### Layout Issues with Large Workflows

- **Issue**: Nodes overlap or are positioned poorly in large workflows
- **Solution**:
  1. Use the layout controls to adjust the layout
  2. Try different layout algorithms
  3. Manually adjust node positions by dragging

#### Browser Performance Issues

- **Issue**: Slow performance with very large workflows
- **Solution**:
  1. Close other browser tabs/applications
  2. Use the latest version of Chrome, Firefox, or Edge
  3. Consider splitting very large workflows into smaller sub-workflows

### Reporting Issues

If you encounter issues not covered here, please report them on the GitHub repository's Issues page with:

1. A description of the problem
2. Steps to reproduce
3. Expected vs. actual behavior
4. Browser and OS information
5. Screenshots if applicable
6. Sample workflow JSON if possible (with sensitive data removed)

## Contributing

We welcome contributions to improve the Rewst Workflow Viewer! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/workflow-vizualizer.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests: `npm test`
7. Commit with a descriptive message: `git commit -m "Add feature: your feature description"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request

### Enhancement Ideas

- **Search/Filter**: Add functionality to search and filter large workflows
- **Workflow Comparison**: Implement side-by-side comparison of workflow versions
- **Multiple Workflow Management**: Add ability to save/load multiple workflows
- **Mini-Map**: Add a mini-map for navigation in large workflows
- **Accessibility Improvements**: Enhance keyboard navigation and screen reader support
- **Test Coverage**: Add comprehensive unit and integration tests
- **GitHub Authentication**: Add support for authenticated GitHub API access
- **Custom Themes**: Allow users to customize the visualization appearance
- **Workflow Analytics**: Add metrics and statistics about workflow complexity

## Security Considerations

### Data Handling

- All workflow processing happens client-side in the browser
- No workflow data is sent to any server
- GitHub API requests are made directly from the browser
- Cached data is stored in the browser's localStorage

### Best Practices

- Keep sensitive data out of workflow templates shared publicly
- Review workflows before uploading to ensure they don't contain secrets
- Clear browser cache and localStorage when working with sensitive workflows
- Use the latest browser version with security updates

## License

[GNU General Public License v3.0](LICENSE)

## Acknowledgments

- [ReactFlow](https://reactflow.dev/) for the graph visualization library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build system
- [Lucide Icons](https://lucide.dev/) for the icon set
- All contributors who have helped improve this project
