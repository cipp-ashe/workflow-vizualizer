import { GitHubUser } from "./types";

/**
 * Constants for the GitHubRepoBrowser component
 */

/**
 * Featured GitHub users with Rewst workflows
 */
export const FEATURED_USERS: GitHubUser[] = [
  {
    name: "GigaCode Dev",
    username: "gigacodedev",
    description: "Collection of Rewst workflows and automation examples",
    avatarUrl: "https://github.com/gigacodedev.png",
    defaultRepo: "Rewst",
  },
  {
    name: "Tre Eiler",
    username: "Tre-Eiler",
    description:
      "Rewst workflows including Apple Shortcuts and TimeZest integrations",
    avatarUrl: "https://github.com/Tre-Eiler.png",
    defaultRepo: "Rewst",
  },
  {
    name: "GoCovi",
    username: "gocovi",
    description: "Run Python natively in Rewst",
    avatarUrl: "https://github.com/gocovi.png",
    defaultRepo: "RewstPy",
  },
  {
    name: "PEAKE Technology Partners",
    username: "PEAKE-Technology-Partners",
    description: "Meraki integrations and organization variable workflows",
    avatarUrl: "https://github.com/PEAKE-Technology-Partners.png",
    defaultRepo: "Rewst-Workflows",
  },
  {
    name: "Bezalu LLC",
    username: "BezaluLLC",
    description: "Long-Running Ticket Report workflow",
    avatarUrl: "https://github.com/BezaluLLC.png",
    defaultRepo: "Rewst-Workflows",
  },
  {
    name: "DJ Hayes",
    username: "djhayes1994",
    description: "ConnectWise RSS Feed example workflow",
    avatarUrl: "https://github.com/djhayes1994.png",
    defaultRepo: "Rewst-Workflows",
  },
  {
    name: "Techgeek",
    username: "Techgeek2858",
    description: "Rewst workflow examples",
    avatarUrl: "https://github.com/Techgeek2858.png",
    defaultRepo: "Rewst-Workflows",
  },
];

/**
 * Error messages for GitHub API interactions
 */
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: (formattedTime: string) =>
    `GitHub API rate limit exceeded. Rate limit will reset at ${formattedTime}`,
  API_ERROR: (status: number) => `GitHub API error: ${status}`,
  FETCH_REPO_CONTENTS: (message: string) =>
    `Failed to fetch repository contents: ${message}`,
  FETCH_WORKFLOW: (status: number) => `Failed to fetch workflow: ${status}`,
  INVALID_WORKFLOW:
    "Invalid workflow format. The file does not contain a valid Rewst workflow.",
  LOAD_WORKFLOW: (message: string) => `Failed to load workflow: ${message}`,
};

/**
 * UI text for the GitHubRepoBrowser component
 */
export const UI_TEXT = {
  TITLE: "Featured Workflows from GitHub",
  BROWSE_INTRO: "Browse workflow examples from these GitHub contributors:",
  REPOSITORY_LABEL: "Repository",
  REPOSITORY_PLACEHOLDER: "Repository name",
  LOAD_BUTTON: "Load",
  FEATURED_USERS_BREADCRUMB: "Featured Users",
  LOADING: "Loading...",
  EMPTY_DIRECTORY: "No items found in this directory.",
  README_TITLE: "README",
  ITEM_TYPES: {
    DIRECTORY: "Directory",
    WORKFLOW_BUNDLE: "Workflow Bundle",
    FILE: "File",
  },
  VIEW_ON_GITHUB: "View on GitHub",
};

/**
 * CSS class names for styling
 */
export const CSS_CLASSES = {
  CONTAINER: "bg-[hsl(var(--card))] rounded-lg shadow-lg p-6",
  TITLE_CONTAINER: "flex items-center gap-2 mb-6",
  TITLE_ICON: "w-5 h-5 text-workflow-blue",
  TITLE: "text-xl font-semibold text-foreground",
  USER_GRID: "grid grid-cols-1 md:grid-cols-2 gap-4",
  USER_CARD:
    "flex items-center gap-4 p-4 rounded-md hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
  USER_AVATAR_CONTAINER:
    "w-12 h-12 rounded-full overflow-hidden bg-[hsl(var(--muted))]",
  USER_AVATAR: "w-full h-full object-cover",
  USER_ICON_CONTAINER: "w-full h-full flex items-center justify-center",
  USER_ICON: "w-6 h-6 text-muted-foreground",
  USER_INFO: "flex-1",
  USER_NAME: "font-medium text-foreground",
  USER_DESCRIPTION: "text-sm text-muted-foreground",
  CHEVRON_ICON: "w-5 h-5 text-muted-foreground",
  REPO_FORM: "flex gap-2",
  REPO_LABEL: "block text-sm font-medium text-muted-foreground mb-1",
  REPO_PREFIX:
    "inline-flex items-center px-3 rounded-l-md border border-r-0 border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-muted-foreground text-sm",
  REPO_INPUT:
    "flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]",
  LOAD_BUTTON:
    "self-end px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors",
  BREADCRUMBS:
    "flex items-center flex-wrap gap-1 mb-4 text-sm text-muted-foreground",
  BREADCRUMB_BUTTON: "hover:text-foreground transition-colors font-medium",
  BREADCRUMB_CHEVRON: "w-3 h-3 mx-1",
  ERROR_CONTAINER:
    "bg-red-500/10 border border-red-500/50 rounded-md p-4 mb-4 text-red-500",
  ERROR_CONTENT: "flex items-start gap-2",
  ERROR_ICON: "w-5 h-5 mt-0.5 flex-shrink-0",
  LOADING_CONTAINER: "py-8 text-center text-muted-foreground",
  LOADING_SPINNER:
    "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--workflow-blue))]",
  LOADING_TEXT: "mt-2",
  ITEM_GRID: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
  ITEM_CARD:
    "flex items-center gap-3 p-3 rounded-md hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
  FOLDER_ICON: "w-5 h-5 text-workflow-blue",
  FILE_ICON: "w-5 h-5 text-workflow-green",
  GENERIC_FILE_ICON: "w-5 h-5 text-muted-foreground",
  ITEM_INFO: "flex-1 truncate",
  ITEM_NAME: "text-foreground truncate",
  ITEM_TYPE: "text-xs text-muted-foreground",
  EXTERNAL_LINK:
    "text-muted-foreground hover:text-foreground transition-colors",
  EXTERNAL_LINK_ICON: "w-4 h-4",
  README_CONTAINER: "mt-8 border-t border-[hsl(var(--border))] pt-6",
  README_TITLE: "text-lg font-semibold mb-4",
  README_CONTENT: "prose prose-invert max-w-none",
  EMPTY_STATE: "py-8 text-center text-muted-foreground",
};

/**
 * File extensions for workflow bundles
 */
export const WORKFLOW_FILE_EXTENSIONS = [".json", ".bundle.json"];
