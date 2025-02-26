import { WorkflowBundle } from "@/types/workflow";

/**
 * GitHub repository information
 */
export interface GitHubRepo {
  /** Name of the repository */
  name: string;
  /** Description of the repository */
  description?: string;
  /** URL to view the repository on GitHub */
  html_url: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Repository item representing a file or directory in a GitHub repository
 */
export interface RepoItem {
  /** Name of the file or directory */
  name: string;
  /** Path to the file or directory relative to the repository root */
  path: string;
  /** Type of the item: "dir" for directory, "file" for file */
  type: "dir" | "file";
  /** URL to view the item on GitHub */
  html_url: string;
  /** URL to download the file content (only available for files) */
  download_url?: string;
}

/**
 * Repository content including items and optional README content
 */
export interface RepoContent {
  /** List of items in the repository */
  items: RepoItem[];
  /** Content of the README.md file if available */
  readme?: string;
}

/**
 * GitHub user information
 */
export interface GitHubUser {
  /** Display name of the user */
  name: string;
  /** GitHub username */
  username: string;
  /** Description of the user's repositories */
  description: string;
  /** URL to the user's avatar image */
  avatarUrl?: string;
  /** Default repository to load when the user is selected */
  defaultRepo?: string;
}

/**
 * Props for the GitHubRepoBrowser component
 */
export interface GitHubRepoBrowserProps {
  /**
   * Callback function that is called when a workflow file is selected
   * @param data The parsed workflow bundle
   */
  onWorkflowSelect: (data: WorkflowBundle) => void;
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  /** Display name of the breadcrumb */
  name: string;
  /** Path associated with the breadcrumb */
  path: string;
}
