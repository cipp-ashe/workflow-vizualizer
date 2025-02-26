import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  File,
  Github,
  ExternalLink,
  ChevronRight,
  Info,
  User,
  RefreshCw,
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
} from "./constants";
import {
  fetchRepoContentsWithCache,
  loadWorkflowWithCache,
  isWorkflowBundle,
  clearGitHubCache,
} from "./utils/githubFetchUtils";

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
        // Use the cached version when available
        const repoContent = await fetchRepoContentsWithCache(
          selectedUser.username,
          repoName,
          path
        );

        setContent(repoContent);

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
        // Use the cached version when available
        const data = await loadWorkflowWithCache(item);

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

  /**
   * Handles clearing the GitHub cache
   */
  const handleClearCache = useCallback(() => {
    try {
      clearGitHubCache();
      // If we're in a repository, refresh the current view
      if (selectedUser) {
        fetchRepoContents(
          breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].path : ""
        );
      }
      alert("GitHub cache cleared successfully!");
    } catch (error) {
      alert(
        `Failed to clear cache: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, [selectedUser, breadcrumbs, fetchRepoContents]);

  // Initial load when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchRepoContents();
    }
  }, [selectedUser, fetchRepoContents]);

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      <div className={CSS_CLASSES.TITLE_CONTAINER}>
        <Github className={CSS_CLASSES.TITLE_ICON} />
        <div className="flex flex-1 justify-between items-center">
          <h2 className={CSS_CLASSES.TITLE}>{UI_TEXT.TITLE}</h2>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 text-foreground rounded-md transition-colors"
            title="Clear GitHub cache to fetch fresh data"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Clear Cache
          </button>
        </div>
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
