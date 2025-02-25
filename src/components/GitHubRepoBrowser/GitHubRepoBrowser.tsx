import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  File,
  Github,
  ExternalLink,
  ChevronRight,
  Info,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { isValidWorkflowBundle } from "@/lib/workflow-validation";
import {
  GitHubRepoBrowserProps,
  GitHubUser,
  RepoItem,
  RepoContent,
  BreadcrumbItem,
} from "./types";
import {
  FEATURED_USERS,
  ERROR_MESSAGES,
  UI_TEXT,
  CSS_CLASSES,
  WORKFLOW_FILE_EXTENSIONS,
} from "./constants";

/**
 * GitHubRepoBrowser Component
 *
 * A component that allows users to browse and visualize Rewst workflows
 * directly from GitHub repositories. It provides a user interface to:
 * - Browse featured GitHub contributors
 * - Navigate through repository folders
 * - View README files
 * - Load and visualize workflow bundles
 *
 * @example
 * ```tsx
 * <GitHubRepoBrowser onWorkflowSelect={(data) => console.log('Selected workflow:', data)} />
 * ```
 */
export function GitHubRepoBrowser({
  onWorkflowSelect,
}: GitHubRepoBrowserProps) {
  // State for selected user and repository
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [repoName, setRepoName] = useState("Rewst");

  // State for repository contents and navigation
  const [content, setContent] = useState<RepoContent>({ items: [] });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches repository contents from GitHub API
   * @param path - Path within the repository to fetch
   */
  const fetchRepoContents = useCallback(
    async (path: string = "") => {
      if (!selectedUser) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.github.com/repos/${selectedUser.username}/${repoName}/contents/${path}`
        );

        if (!response.ok) {
          // Check for rate limit errors
          if (response.status === 403) {
            const rateLimitRemaining = response.headers.get(
              "X-RateLimit-Remaining"
            );
            if (rateLimitRemaining === "0") {
              const resetTime = response.headers.get("X-RateLimit-Reset");
              const resetDate = resetTime
                ? new Date(parseInt(resetTime) * 1000)
                : new Date();
              const formattedTime = resetDate.toLocaleTimeString();
              throw new Error(
                ERROR_MESSAGES.RATE_LIMIT_EXCEEDED(formattedTime)
              );
            }
          }
          throw new Error(ERROR_MESSAGES.API_ERROR(response.status));
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : [data];

        // Sort items: directories first, then files
        const sortedItems = items.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "dir" ? -1 : 1;
        });

        // Try to fetch README.md if it exists
        let readme = "";
        const readmeItem = items.find(
          (item) => item.name.toLowerCase() === "readme.md"
        );

        if (readmeItem && readmeItem.download_url) {
          const readmeResponse = await fetch(readmeItem.download_url);
          if (readmeResponse.ok) {
            readme = await readmeResponse.text();
          }
        }

        setContent({ items: sortedItems, readme });

        // Update breadcrumbs
        if (path) {
          const parts = path.split("/");
          const newBreadcrumbs = parts.map((part, index) => ({
            name: part,
            path: parts.slice(0, index + 1).join("/"),
          }));
          setBreadcrumbs([{ name: "Home", path: "" }, ...newBreadcrumbs]);
        } else {
          setBreadcrumbs([{ name: "Home", path: "" }]);
        }
      } catch (err) {
        setError(
          ERROR_MESSAGES.FETCH_REPO_CONTENTS(
            err instanceof Error ? err.message : String(err)
          )
        );
        console.error("Error fetching repo contents:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, repoName]
  );

  /**
   * Loads a workflow file from GitHub
   * @param item - Repository item representing the workflow file
   */
  const loadWorkflow = useCallback(
    async (item: RepoItem) => {
      if (!item.download_url) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(item.download_url);
        if (!response.ok) {
          throw new Error(ERROR_MESSAGES.FETCH_WORKFLOW(response.status));
        }

        const data = await response.json();

        // Validate that the data is a valid WorkflowBundle
        if (!isValidWorkflowBundle(data)) {
          throw new Error(ERROR_MESSAGES.INVALID_WORKFLOW);
        }

        onWorkflowSelect(data);
      } catch (err) {
        setError(
          ERROR_MESSAGES.LOAD_WORKFLOW(
            err instanceof Error ? err.message : String(err)
          )
        );
        console.error("Error loading workflow:", err);
      } finally {
        setLoading(false);
      }
    },
    [onWorkflowSelect]
  );

  /**
   * Navigates to a directory in the repository
   * @param path - Path to navigate to
   */
  const navigateTo = useCallback(
    (path: string) => {
      fetchRepoContents(path);
    },
    [fetchRepoContents]
  );

  /**
   * Selects a GitHub user to browse their repositories
   * @param user - GitHub user to select
   */
  const selectUser = useCallback((user: GitHubUser) => {
    setSelectedUser(user);
    setRepoName(user.defaultRepo || "Rewst");
    setContent({ items: [] });
    setBreadcrumbs([]);
  }, []);

  /**
   * Returns to the user selection view
   */
  const goBackToUsers = useCallback(() => {
    setSelectedUser(null);
    setContent({ items: [] });
    setBreadcrumbs([]);
  }, []);

  /**
   * Handles repository name input change
   * @param e - Change event from the input element
   */
  const handleRepoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRepoName(e.target.value);
      setBreadcrumbs([]);
      setContent({ items: [] });
    },
    []
  );

  /**
   * Handles repository form submission
   * @param e - Form submission event
   */
  const handleRepoSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      fetchRepoContents();
    },
    [fetchRepoContents]
  );

  // Initial load when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchRepoContents();
    }
  }, [selectedUser, fetchRepoContents]);

  /**
   * Checks if a file is a workflow bundle based on its extension
   * @param fileName - Name of the file to check
   * @returns True if the file is a workflow bundle
   */
  const isWorkflowBundle = (fileName: string): boolean => {
    return WORKFLOW_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  };

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      <div className={CSS_CLASSES.TITLE_CONTAINER}>
        <Github className={CSS_CLASSES.TITLE_ICON} />
        <h2 className={CSS_CLASSES.TITLE}>{UI_TEXT.TITLE}</h2>
      </div>

      {/* User selection view */}
      {!selectedUser ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">{UI_TEXT.BROWSE_INTRO}</p>
          <div className={CSS_CLASSES.USER_GRID}>
            {FEATURED_USERS.map((user) => (
              <div
                key={user.username}
                className={CSS_CLASSES.USER_CARD}
                onClick={() => selectUser(user)}
              >
                <div className={CSS_CLASSES.USER_AVATAR_CONTAINER}>
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className={CSS_CLASSES.USER_AVATAR}
                    />
                  ) : (
                    <div className={CSS_CLASSES.USER_ICON_CONTAINER}>
                      <User className={CSS_CLASSES.USER_ICON} />
                    </div>
                  )}
                </div>
                <div className={CSS_CLASSES.USER_INFO}>
                  <h3 className={CSS_CLASSES.USER_NAME}>{user.name}</h3>
                  <p className={CSS_CLASSES.USER_DESCRIPTION}>
                    {user.description}
                  </p>
                </div>
                <ChevronRight className={CSS_CLASSES.CHEVRON_ICON} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Repository selection */}
          <div className="mb-4">
            <form onSubmit={handleRepoSubmit} className={CSS_CLASSES.REPO_FORM}>
              <div className="flex-1">
                <label htmlFor="repo-name" className={CSS_CLASSES.REPO_LABEL}>
                  {UI_TEXT.REPOSITORY_LABEL}
                </label>
                <div className="flex">
                  <span className={CSS_CLASSES.REPO_PREFIX}>
                    {selectedUser.username}/
                  </span>
                  <input
                    type="text"
                    id="repo-name"
                    value={repoName}
                    onChange={handleRepoChange}
                    className={CSS_CLASSES.REPO_INPUT}
                    placeholder={UI_TEXT.REPOSITORY_PLACEHOLDER}
                  />
                </div>
              </div>
              <button type="submit" className={CSS_CLASSES.LOAD_BUTTON}>
                {UI_TEXT.LOAD_BUTTON}
              </button>
            </form>
          </div>

          {/* Breadcrumbs */}
          <div className={CSS_CLASSES.BREADCRUMBS}>
            <button
              onClick={goBackToUsers}
              className={CSS_CLASSES.BREADCRUMB_BUTTON}
            >
              {UI_TEXT.FEATURED_USERS_BREADCRUMB}
            </button>
            <ChevronRight className={CSS_CLASSES.BREADCRUMB_CHEVRON} />
            <span className="text-foreground">{selectedUser.name}</span>
            {breadcrumbs.length > 0 && (
              <>
                <ChevronRight className={CSS_CLASSES.BREADCRUMB_CHEVRON} />
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && (
                      <ChevronRight
                        className={CSS_CLASSES.BREADCRUMB_CHEVRON}
                      />
                    )}
                    <button
                      onClick={() => navigateTo(crumb.path)}
                      className={CSS_CLASSES.BREADCRUMB_BUTTON}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className={CSS_CLASSES.ERROR_CONTAINER}>
              <div className={CSS_CLASSES.ERROR_CONTENT}>
                <Info className={CSS_CLASSES.ERROR_ICON} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className={CSS_CLASSES.LOADING_CONTAINER}>
              <div className={CSS_CLASSES.LOADING_SPINNER}></div>
              <p className={CSS_CLASSES.LOADING_TEXT}>{UI_TEXT.LOADING}</p>
            </div>
          )}

          {/* Repository contents */}
          {!loading && content.items.length > 0 && (
            <div className={CSS_CLASSES.ITEM_GRID}>
              {content.items.map((item) => (
                <div
                  key={item.path}
                  className={CSS_CLASSES.ITEM_CARD}
                  onClick={() => {
                    if (item.type === "dir") {
                      navigateTo(item.path);
                    } else if (isWorkflowBundle(item.name)) {
                      loadWorkflow(item);
                    }
                  }}
                >
                  {item.type === "dir" ? (
                    <Folder className={CSS_CLASSES.FOLDER_ICON} />
                  ) : isWorkflowBundle(item.name) ? (
                    <File className={CSS_CLASSES.FILE_ICON} />
                  ) : (
                    <File className={CSS_CLASSES.GENERIC_FILE_ICON} />
                  )}
                  <div className={CSS_CLASSES.ITEM_INFO}>
                    <p className={CSS_CLASSES.ITEM_NAME}>{item.name}</p>
                    <p className={CSS_CLASSES.ITEM_TYPE}>
                      {item.type === "dir"
                        ? UI_TEXT.ITEM_TYPES.DIRECTORY
                        : isWorkflowBundle(item.name)
                        ? UI_TEXT.ITEM_TYPES.WORKFLOW_BUNDLE
                        : UI_TEXT.ITEM_TYPES.FILE}
                    </p>
                  </div>
                  <a
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={CSS_CLASSES.EXTERNAL_LINK}
                    title={UI_TEXT.VIEW_ON_GITHUB}
                  >
                    <ExternalLink className={CSS_CLASSES.EXTERNAL_LINK_ICON} />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* README content */}
          {!loading && content.readme && (
            <div className={CSS_CLASSES.README_CONTAINER}>
              <h3 className={CSS_CLASSES.README_TITLE}>
                {UI_TEXT.README_TITLE}
              </h3>
              <div className={CSS_CLASSES.README_CONTENT}>
                <ReactMarkdown>{content.readme}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && content.items.length === 0 && !error && (
            <div className={CSS_CLASSES.EMPTY_STATE}>
              <p>{UI_TEXT.EMPTY_DIRECTORY}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
