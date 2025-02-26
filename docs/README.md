# Rewst Workflow Viewer Documentation

Welcome to the Rewst Workflow Viewer documentation. This directory contains detailed documentation about various aspects of the project.

## Documentation Files

- [**WORKFLOW_PARSING.md**](WORKFLOW_PARSING.md): Detailed explanation of how the application parses and visualizes Rewst workflow templates
- [**GITHUB_INTEGRATION.md**](GITHUB_INTEGRATION.md): Comprehensive guide to the GitHub integration features
- [**../SECURITY.md**](../SECURITY.md): Security guidelines and best practices
- [**../CONTRIBUTING.md**](../CONTRIBUTING.md): Guidelines for contributing to the project
- [**../CHANGELOG.md**](../CHANGELOG.md): History of changes and version updates

## Project Overview

The Rewst Workflow Viewer is a specialized visualization tool for Rewst workflow templates. It allows users to:

1. Upload Rewst workflow JSON templates
2. Browse and visualize workflows directly from GitHub repositories
3. View workflows as interactive node graphs
4. Explore task details and connections
5. Export visualizations as SVG or PNG

For a complete overview of the project, see the [main README](../README.md).

## Key Topics

### Workflow Parsing

The [Workflow Parsing documentation](WORKFLOW_PARSING.md) covers:

- The structure of Rewst workflow bundles
- The validation process for workflow JSON
- How tasks are converted to nodes and transitions to edges
- The automatic layout algorithm
- Handling of different workflow versions
- Troubleshooting parsing issues

### GitHub Integration

The [GitHub Integration documentation](GITHUB_INTEGRATION.md) covers:

- The architecture of the GitHub integration
- How the application interacts with the GitHub API
- The caching system to minimize API calls
- How bundle files are detected in repositories
- Adding new GitHub users to the featured list
- Extending the GitHub integration with new features

### Contributing

The [Contributing guidelines](../CONTRIBUTING.md) cover:

- Code standards and naming conventions
- Documentation requirements
- Project structure
- Component organization
- Testing guidelines
- Accessibility considerations
- Git workflow

## For Developers

If you're a developer looking to contribute to or extend the Rewst Workflow Viewer, these documentation files provide detailed information about the project's architecture and implementation. The code is also extensively documented with JSDoc comments to help you understand how each component works.

## For Users

If you're a user of the Rewst Workflow Viewer, the documentation provides insights into how the application works and how to troubleshoot common issues. The [main README](../README.md) contains usage instructions and feature descriptions.

## Updating Documentation

When making changes to the project, please update the relevant documentation files to reflect those changes. This helps keep the documentation accurate and useful for both users and developers.

## Getting Help

If you encounter issues not covered in the documentation, please report them on the GitHub repository's Issues page with:

1. A description of the problem
2. Steps to reproduce
3. Expected vs. actual behavior
4. Browser and OS information
5. Screenshots if applicable
6. Sample workflow JSON if possible (with sensitive data removed)
