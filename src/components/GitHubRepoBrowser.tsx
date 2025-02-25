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
import { WorkflowBundle } from "../types/workflow";
import { isValidWorkflowBundle } from "../lib/workflow-validation";

interface RepoItem {
  name: string;
  path: string;
  type: "dir" | "file";
  html_url: string;
  download_url?: string;
}

interface RepoContent {
  items: RepoItem[];
  readme?: string;
}

interface GitHubUser {
  name: string;
  username: string;
  description: string;
  avatarUrl?: string;
  defaultRepo?: string;
}

interface GitHubRepoBrowserProps {
  onWorkflowSelect: (data: WorkflowBundle) => void;
}

// Featured GitHub users with Rewst workflows
const FEATURED_USERS: GitHubUser[] = [
  {
    name: "GigaCode Dev",
    username: "gigacodedev",
    description: "Collection of Rewst workflows and automation examples",
    avatarUrl: "https://github.com/gigacodedev.png",
    defaultRepo: "Rewst",
  },
  // More users can be added here in the future
];

export function GitHubRepoBrowser({
  onWorkflowSelect,
}: GitHubRepoBrowserProps) {
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [repoName, setRepoName] = useState("Rewst");
  const [content, setContent] = useState<RepoContent>({ items: [] });
  const [breadcrumbs, setBreadcrumbs] = useState<
    { name: string; path: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch repository contents
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
                `GitHub API rate limit exceeded. Rate limit will reset at ${formattedTime}`
              );
            }
          }
          throw new Error(`GitHub API error: ${response.status}`);
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
          `Failed to fetch repository contents: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error("Error fetching repo contents:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, repoName]
  );

  // Load workflow from GitHub
  const loadWorkflow = useCallback(
    async (item: RepoItem) => {
      if (!item.download_url) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(item.download_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow: ${response.status}`);
        }

        const data = await response.json();

        // Validate that the data is a valid WorkflowBundle
        if (!isValidWorkflowBundle(data)) {
          throw new Error(
            "Invalid workflow format. The file does not contain a valid Rewst workflow."
          );
        }

        onWorkflowSelect(data as WorkflowBundle);
      } catch (err) {
        setError(
          `Failed to load workflow: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error("Error loading workflow:", err);
      } finally {
        setLoading(false);
      }
    },
    [onWorkflowSelect]
  );

  // Navigate to a directory
  const navigateTo = useCallback(
    (path: string) => {
      fetchRepoContents(path);
    },
    [fetchRepoContents]
  );

  // Select a GitHub user
  const selectUser = useCallback((user: GitHubUser) => {
    setSelectedUser(user);
    setRepoName(user.defaultRepo || "Rewst");
    setContent({ items: [] });
    setBreadcrumbs([]);
  }, []);

  // Go back to user selection
  const goBackToUsers = useCallback(() => {
    setSelectedUser(null);
    setContent({ items: [] });
    setBreadcrumbs([]);
  }, []);

  // Handle repository change
  const handleRepoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRepoName(e.target.value);
      setBreadcrumbs([]);
      setContent({ items: [] });
    },
    []
  );

  // Handle repository form submission
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

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Github className="w-5 h-5 text-workflow-blue" />
        <h2 className="text-xl font-semibold text-foreground">
          Featured Workflows from GitHub
        </h2>
      </div>

      {/* User selection view */}
      {!selectedUser ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Browse workflow examples from these GitHub contributors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURED_USERS.map((user) => (
              <div
                key={user.username}
                className="flex items-center gap-4 p-4 rounded-md hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                onClick={() => selectUser(user)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[hsl(var(--muted))]">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Repository selection */}
          <div className="mb-4">
            <form onSubmit={handleRepoSubmit} className="flex gap-2">
              <div className="flex-1">
                <label
                  htmlFor="repo-name"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Repository
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-muted-foreground text-sm">
                    {selectedUser.username}/
                  </span>
                  <input
                    type="text"
                    id="repo-name"
                    value={repoName}
                    onChange={handleRepoChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
                    placeholder="Repository name"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="self-end px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors"
              >
                Load
              </button>
            </form>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center flex-wrap gap-1 mb-4 text-sm text-muted-foreground">
            <button
              onClick={goBackToUsers}
              className="hover:text-foreground transition-colors font-medium"
            >
              Featured Users
            </button>
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-foreground">{selectedUser.name}</span>
            {breadcrumbs.length > 0 && (
              <>
                <ChevronRight className="w-3 h-3 mx-1" />
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
                    <button
                      onClick={() => navigateTo(crumb.path)}
                      className="hover:text-foreground transition-colors"
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
            <div className="bg-red-500/10 border border-red-500/50 rounded-md p-4 mb-4 text-red-500">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-8 text-center text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--workflow-blue))]"></div>
              <p className="mt-2">Loading...</p>
            </div>
          )}

          {/* Repository contents */}
          {!loading && content.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {content.items.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  onClick={() => {
                    if (item.type === "dir") {
                      navigateTo(item.path);
                    } else if (
                      item.name.endsWith(".json") ||
                      item.name.endsWith(".bundle.json")
                    ) {
                      loadWorkflow(item);
                    }
                  }}
                >
                  {item.type === "dir" ? (
                    <Folder className="w-5 h-5 text-workflow-blue" />
                  ) : item.name.endsWith(".json") ||
                    item.name.endsWith(".bundle.json") ? (
                    <File className="w-5 h-5 text-workflow-green" />
                  ) : (
                    <File className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 truncate">
                    <p className="text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type === "dir"
                        ? "Directory"
                        : item.name.endsWith(".json") ||
                          item.name.endsWith(".bundle.json")
                        ? "Workflow Bundle"
                        : "File"}
                    </p>
                  </div>
                  <a
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* README content */}
          {!loading && content.readme && (
            <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
              <h3 className="text-lg font-semibold mb-4">README</h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{content.readme}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && content.items.length === 0 && !error && (
            <div className="py-8 text-center text-muted-foreground">
              <p>No items found in this directory.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
