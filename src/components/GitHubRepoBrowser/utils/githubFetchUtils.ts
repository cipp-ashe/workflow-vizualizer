import { RepoItem, RepoContent, GitHubRepo } from "../types";
import { WORKFLOW_FILE_EXTENSIONS } from "../constants";
import { WorkflowBundle } from "@/types/workflow";

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Cache keys
const getCacheKey = (username: string, repo: string, path: string = "") =>
  `github_cache_${username}_${repo}_${path}`;

interface CacheEntry {
  timestamp: number;
  data: RepoContent;
}

/**
 * Check if a cache entry is valid (not expired)
 */
const isCacheValid = (entry: CacheEntry): boolean => {
  const now = Date.now();
  return now - entry.timestamp < CACHE_EXPIRATION;
};

/**
 * Save data to cache
 */
const saveToCache = (key: string, data: RepoContent): void => {
  try {
    const cacheEntry: CacheEntry = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn("Failed to save to cache:", error);
  }
};

/**
 * Get data from cache
 * @returns The cached data or null if not found or expired
 */
const getFromCache = (key: string): RepoContent | null => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const cacheEntry: CacheEntry = JSON.parse(cachedData);
    if (!isCacheValid(cacheEntry)) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.warn("Failed to retrieve from cache:", error);
    return null;
  }
};

/**
 * Clear all GitHub cache entries
 */
export const clearGitHubCache = (): void => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("github_cache_") ||
        key.startsWith("github_file_") ||
        key.startsWith("github_bundle_check_") ||
        key.startsWith("github_bundle_dirs_") ||
        key.startsWith("github_rewst_repos_")
      ) {
        localStorage.removeItem(key);
      }
    });
    console.log("All GitHub cache entries cleared");
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
};

/**
 * Fetch repository contents with caching
 * Uses raw GitHub URLs instead of API when possible to avoid rate limits
 */
export const fetchRepoContentsWithCache = async (
  username: string,
  repo: string,
  path: string = ""
): Promise<RepoContent> => {
  // Check cache first
  const cacheKey = getCacheKey(username, repo, path);
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log("Using cached data for", path || "root");
    return cachedData;
  }

  // For the root directory or directories, we need to use the API
  // because there's no raw URL equivalent for directory listings
  try {
    // Use the API to get directory contents
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const response = await fetch(apiUrl);

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
      // Use raw URL for README content
      const readmeResponse = await fetch(readmeItem.download_url);
      if (readmeResponse.ok) {
        readme = await readmeResponse.text();
      }
    }

    const result: RepoContent = { items: sortedItems, readme };

    // Save to cache
    saveToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching repo contents:", error);
    throw error;
  }
};

/**
 * Load a workflow file from GitHub with caching
 */
export const loadWorkflowWithCache = async (
  item: RepoItem
): Promise<WorkflowBundle> => {
  if (!item.download_url) {
    throw new Error("No download URL available for this file");
  }

  // Create a cache key for this specific file
  const cacheKey = `github_file_${item.path}`;

  try {
    // Check cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const cacheEntry = JSON.parse(cachedData);
      if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached workflow data for", item.name);
        return cacheEntry.data;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }

    // Use the raw URL instead of API
    const response = await fetch(item.download_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }

    const data = await response.json();

    // Save to cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch (error) {
      console.warn("Failed to cache workflow data:", error);
    }

    return data;
  } catch (error) {
    console.error("Error loading workflow:", error);
    throw error;
  }
};

/**
 * Checks if a file is a workflow bundle based on its extension
 */
export const isWorkflowBundle = (fileName: string): boolean => {
  return WORKFLOW_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
};

/**
 * Checks if a directory contains any .bundle.json files
 * @param username GitHub username
 * @param repo Repository name
 * @param path Directory path
 * @returns Promise that resolves to true if the directory contains .bundle.json files
 */
export const directoryContainsBundleFiles = async (
  username: string,
  repo: string,
  path: string
): Promise<boolean> => {
  // Create a cache key for this check
  const cacheKey = `github_bundle_check_${username}_${repo}_${path}`;

  // Check cache first
  try {
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      const cacheEntry = JSON.parse(cachedResult);
      if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log(`Using cached bundle check result for ${path || "root"}`);
        return cacheEntry.data;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.warn("Failed to retrieve bundle check from cache:", error);
  }

  try {
    const contents = await fetchRepoContentsWithCache(username, repo, path);

    // Check if any files in this directory are .bundle.json files
    const hasBundleFiles = contents.items.some(
      (item) => item.type === "file" && item.name.endsWith(".bundle.json")
    );

    if (hasBundleFiles) {
      // Save positive result to cache
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: true,
          })
        );
      } catch (error) {
        console.warn("Failed to cache bundle check result:", error);
      }
      return true;
    }

    // Recursively check subdirectories
    const subdirectories = contents.items.filter((item) => item.type === "dir");
    if (subdirectories.length === 0) {
      // Save negative result to cache
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: false,
          })
        );
      } catch (error) {
        console.warn("Failed to cache bundle check result:", error);
      }
      return false;
    }

    // Check first level of subdirectories only to avoid excessive API calls
    for (const dir of subdirectories) {
      // Create a subcache key for this check to avoid redundant checks
      const subCacheKey = `github_bundle_check_${username}_${repo}_${dir.path}`;
      let hasSubBundleFiles = false;

      // Check subcache first
      try {
        const cachedSubResult = localStorage.getItem(subCacheKey);
        if (cachedSubResult) {
          const cacheEntry = JSON.parse(cachedSubResult);
          if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
            console.log(`Using cached bundle check result for ${dir.path}`);
            hasSubBundleFiles = cacheEntry.data;
          } else {
            // Remove expired cache
            localStorage.removeItem(subCacheKey);
          }
        }
      } catch (error) {
        console.warn("Failed to retrieve sub-bundle check from cache:", error);
      }

      // If not in cache, check the subdirectory
      if (hasSubBundleFiles === false) {
        const subContents = await fetchRepoContentsWithCache(
          username,
          repo,
          dir.path
        );

        hasSubBundleFiles = subContents.items.some(
          (item) => item.type === "file" && item.name.endsWith(".bundle.json")
        );

        // Save subdirectory result to cache
        try {
          localStorage.setItem(
            subCacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: hasSubBundleFiles,
            })
          );
        } catch (error) {
          console.warn("Failed to cache sub-bundle check result:", error);
        }
      }

      if (hasSubBundleFiles) {
        // Save positive result to parent cache
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: true,
            })
          );
        } catch (error) {
          console.warn("Failed to cache bundle check result:", error);
        }
        return true;
      }
    }

    // Save negative result to cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: false,
        })
      );
    } catch (error) {
      console.warn("Failed to cache bundle check result:", error);
    }
    return false;
  } catch (error) {
    console.error(`Error checking directory ${path} for bundle files:`, error);
    return false;
  }
};

/**
 * Searches for repositories with "rewst" in their name for a given user
 * @param username GitHub username
 * @returns Promise that resolves to an array of repositories
 */
export const searchRewstRepos = async (
  username: string
): Promise<GitHubRepo[]> => {
  const cacheKey = `github_rewst_repos_${username}`;

  // Check cache first
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const cacheEntry = JSON.parse(cachedData);
      if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached Rewst repos data for", username);
        return cacheEntry.data;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.warn("Failed to retrieve Rewst repos from cache:", error);
  }

  try {
    // Fetch all repositories for the user
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    // Filter repositories with "rewst" in their name (case insensitive)
    const rewstRepos = repos
      .filter(
        (repo: { name: string; private: boolean }) =>
          repo.name.toLowerCase().includes("rewst") && !repo.private
      )
      .map(
        (repo: {
          name: string;
          description?: string;
          html_url: string;
          updated_at: string;
        }) => ({
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          updated_at: repo.updated_at,
        })
      );

    // Save to cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: rewstRepos,
        })
      );
    } catch (error) {
      console.warn("Failed to cache Rewst repos data:", error);
    }

    return rewstRepos;
  } catch (error) {
    console.error("Error searching for Rewst repositories:", error);
    throw error;
  }
};

/**
 * Finds directories containing .bundle.json files in a repository
 * @param username GitHub username
 * @param repo Repository name
 * @returns Promise that resolves to an array of directories
 */
export const findBundleDirectories = async (
  username: string,
  repo: string
): Promise<RepoItem[]> => {
  const cacheKey = `github_bundle_dirs_${username}_${repo}`;

  // Check cache first
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const cacheEntry = JSON.parse(cachedData);
      if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached bundle directories data for", repo);
        return cacheEntry.data;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.warn("Failed to retrieve bundle directories from cache:", error);
  }

  try {
    // Get root directory contents
    const rootContents = await fetchRepoContentsWithCache(username, repo);

    // Filter for directories only
    const directories = rootContents.items.filter(
      (item) => item.type === "dir"
    );

    // Check each directory for .bundle.json files
    const bundleDirs: RepoItem[] = [];

    for (const dir of directories) {
      const hasBundleFiles = await directoryContainsBundleFiles(
        username,
        repo,
        dir.path
      );

      if (hasBundleFiles) {
        bundleDirs.push(dir);
      }
    }

    // Save to cache
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: bundleDirs,
        })
      );
    } catch (error) {
      console.warn("Failed to cache bundle directories data:", error);
    }

    return bundleDirs;
  } catch (error) {
    console.error("Error finding bundle directories:", error);
    throw error;
  }
};
