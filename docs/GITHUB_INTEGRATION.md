# GitHub Integration

This document provides a detailed explanation of the GitHub integration in the Rewst Workflow Viewer.

## Overview

The GitHub integration allows users to browse and visualize Rewst workflows directly from GitHub repositories. The integration:

1. Displays featured GitHub users with Rewst workflows
2. Allows browsing repositories and directories
3. Automatically filters to show only folders containing `.bundle.json` files
4. Renders README files for documentation
5. Provides one-click workflow visualization
6. Implements efficient caching to minimize API calls

## Architecture

The GitHub integration is implemented in the following files:

- `src/components/GitHubRepoBrowser/GitHubRepoBrowser.tsx`: Main component
- `src/components/GitHubRepoBrowser/types.ts`: TypeScript interfaces
- `src/components/GitHubRepoBrowser/constants.ts`: Configuration constants
- `src/components/GitHubRepoBrowser/utils/githubFetchUtils.ts`: API utilities

### Component Structure

The GitHub integration follows a modular structure:

```
src/components/GitHubRepoBrowser/
├── GitHubRepoBrowser.tsx     # Main component
├── types.ts                  # TypeScript interfaces
├── constants.ts              # Configuration constants
└── utils/
    └── githubFetchUtils.ts   # API utilities
```

## Featured GitHub Users

The integration includes a curated list of featured GitHub users who have shared Rewst workflows. This list is defined in `constants.ts`:

```typescript
export const FEATURED_USERS: GitHubUser[] = [
  {
    name: "GigaCode Dev",
    username: "gigacodedev",
    description: "Collection of Rewst workflows and automation examples",
    avatarUrl: "https://github.com/gigacodedev.png",
    defaultRepo: "Rewst",
  },
  // Additional users...
];
```

Each user entry includes:

- `name`: Display name
- `username`: GitHub username
- `description`: Brief description of their contributions
- `avatarUrl`: URL to their GitHub avatar
- `defaultRepo`: Default repository to browse

## GitHub API Integration

The integration uses the public GitHub API to fetch repository contents. All API interactions are handled in `githubFetchUtils.ts`.

### Key API Endpoints

- Repository contents: `https://api.github.com/repos/{username}/{repo}/contents/{path}`
- User repositories: `https://api.github.com/users/{username}/repos`
- Repository search: `https://api.github.com/search/repositories?q={query}`

### Caching System

To minimize API calls and avoid rate limits, the integration implements a comprehensive caching system:

```typescript
// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Cache keys
const getCacheKey = (username: string, repo: string, path: string = "") =>
  `github_cache_${username}_${repo}_${path}`;

// Save data to cache
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

// Get data from cache
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
```

The caching system:

- Stores API responses in localStorage
- Sets a 24-hour expiration time
- Automatically clears expired cache entries
- Provides a manual cache clearing function

### Rate Limit Handling

The integration includes special handling for GitHub API rate limits:

```typescript
if (!response.ok) {
  // Check for rate limit errors
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
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
```

This provides users with clear information about rate limit issues and when they will be resolved.

## Bundle File Detection

A key feature of the integration is the automatic detection of directories containing `.bundle.json` files:

```typescript
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
    // ...
  } catch (error) {
    console.error(`Error checking directory ${path} for bundle files:`, error);
    return false;
  }
};
```

This function:

- Checks if a directory contains any `.bundle.json` files
- Recursively checks subdirectories (first level only to avoid excessive API calls)
- Caches results to minimize API calls
- Returns a boolean indicating if bundle files were found

## Rewst Repository Discovery

The integration can also search for repositories with "rewst" in their name:

```typescript
export const searchRewstRepos = async (
  username: string
): Promise<GitHubRepo[]> => {
  const cacheKey = `github_rewst_repos_${username}`;

  // Check cache first
  // ...

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
    // ...

    return rewstRepos;
  } catch (error) {
    console.error("Error searching for Rewst repositories:", error);
    throw error;
  }
};
```

This function:

- Fetches all repositories for a user
- Filters for repositories with "rewst" in their name
- Excludes private repositories
- Returns a simplified representation of the repositories

## User Interface

The GitHub integration provides a user-friendly interface for browsing repositories:

1. **Featured Users**: Displays a grid of featured GitHub users
2. **Repository Selection**: Allows selecting a repository for each user
3. **Directory Navigation**: Provides breadcrumb navigation for directories
4. **README Rendering**: Automatically displays README files when available
5. **File Type Indicators**: Shows icons for different file types
6. **External Links**: Provides links to view files on GitHub

## Adding New GitHub Users

To add new GitHub users to the featured list:

1. Identify users with repositories containing `.bundle.json` files
2. Add them to the `FEATURED_USERS` array in `constants.ts`
3. Provide their GitHub username, display name, and description

Example:

```typescript
{
  name: "New Contributor",
  username: "new-contributor",
  description: "Rewst workflow examples for specific use cases",
  avatarUrl: "https://github.com/new-contributor.png",
  defaultRepo: "Rewst-Workflows",
}
```

## Extending the GitHub Integration

### Adding Authentication

To add GitHub authentication for higher API rate limits:

1. Implement a login mechanism using GitHub OAuth
2. Store the authentication token securely
3. Add the token to API requests:

```typescript
const response = await fetch(apiUrl, {
  headers: {
    Authorization: `token ${authToken}`,
  },
});
```

### Supporting Private Repositories

To support private repositories:

1. Implement GitHub authentication as described above
2. Modify the repository fetching logic to include private repositories
3. Update the UI to indicate private repositories

### Adding Organization Support

To support GitHub organizations:

1. Add a new function to fetch organization repositories:

```typescript
export const fetchOrgRepos = async (orgName: string): Promise<GitHubRepo[]> => {
  const apiUrl = `https://api.github.com/orgs/${orgName}/repos?per_page=100`;
  // Implementation similar to searchRewstRepos
};
```

2. Update the UI to allow selecting organizations

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**

   - **Symptom**: Error message about GitHub API rate limit
   - **Solution**: Wait for the rate limit to reset, clear the cache, or implement authentication

2. **Repository Not Found**

   - **Symptom**: Error message about repository not found
   - **Solution**: Check the repository name and username, ensure the repository is public

3. **No Bundle Files Found**
   - **Symptom**: No directories shown when browsing a repository
   - **Solution**: Verify the repository contains `.bundle.json` files, check the repository structure

### Debugging

The GitHub integration includes console logs for debugging:

```typescript
console.log("Using cached data for", path || "root");
console.log(`Found ${bundleFiles.length} .bundle.json files:`);
console.log("Error fetching repo contents:", error);
```

These logs can be viewed in the browser's developer console to understand what's happening during API calls.

## Conclusion

The GitHub integration provides a powerful way to browse and visualize Rewst workflows directly from GitHub repositories. By understanding its architecture and features, you can effectively use and extend this functionality.
