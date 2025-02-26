import { RepoItem, RepoContent } from "../types";
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
      if (key.startsWith("github_cache_")) {
        localStorage.removeItem(key);
      }
    });
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
