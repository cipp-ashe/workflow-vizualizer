# Security Policy

## Reporting a Vulnerability

We take the security of the Rewst Workflow Viewer seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly** until it has been addressed by the maintainers.
2. Email details of the vulnerability to [project maintainer email] or create a private security advisory on GitHub.
3. Include as much information as possible, including:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

We will acknowledge receipt of your vulnerability report as soon as possible and will work to verify and address the issue.

## Security Considerations

### Data Handling

The Rewst Workflow Viewer is designed with the following security principles:

- **Client-side Processing**: All workflow processing happens in the browser; no workflow data is sent to any server
- **No Backend Storage**: The application does not have a backend server that stores your data
- **Local Storage Only**: Cached data (including GitHub API responses) is stored only in your browser's localStorage
- **No Authentication Required**: The application does not require you to authenticate or provide credentials

### GitHub API Usage

The application interacts with the GitHub API with the following considerations:

- **Public Data Only**: Only public repositories and files are accessed
- **Rate Limiting**: The application implements caching to minimize API calls and avoid rate limits
- **No Authentication**: By default, the application uses unauthenticated GitHub API access
- **Error Handling**: API errors are handled gracefully with informative messages

### Best Practices for Users

When using the Rewst Workflow Viewer, consider the following security best practices:

1. **Sensitive Data**: Do not upload workflow templates containing sensitive information such as:

   - API keys or tokens
   - Passwords or credentials
   - Personal identifiable information (PII)
   - Proprietary business logic you don't want to expose

2. **Browser Security**:

   - Keep your browser updated to the latest version
   - Consider using private/incognito mode when working with sensitive workflows
   - Clear browser cache and localStorage after working with sensitive data
   - Be cautious when using the application on shared or public computers

3. **GitHub Integration**:
   - Be aware that accessing GitHub repositories is subject to GitHub's terms of service
   - Remember that GitHub API requests from your browser may be subject to rate limiting
   - Consider implementing GitHub authentication for higher rate limits if needed

## Security Features

### Input Validation

- All uploaded JSON is validated before processing
- GitHub API responses are validated before rendering
- User inputs are sanitized to prevent injection attacks

### Error Handling

- Errors are caught and handled gracefully
- Error messages are informative but do not expose sensitive information
- Failed operations degrade gracefully without crashing the application

### Dependencies

- Dependencies are regularly updated to address security vulnerabilities
- We use npm audit to check for known vulnerabilities in dependencies
- Critical security updates are applied promptly

## Future Security Enhancements

We are considering the following security enhancements for future releases:

- Optional GitHub authentication for higher API rate limits
- Client-side encryption for localStorage cache
- Enhanced input validation and sanitization
- Content Security Policy (CSP) implementation
- Subresource Integrity (SRI) for external resources

## Responsible Disclosure

We are committed to working with security researchers and users to improve the security of our application. We promise:

- To respond to security reports promptly
- To validate and reproduce reported issues
- To address confirmed vulnerabilities in a timely manner
- To credit researchers who report valid vulnerabilities (unless they prefer to remain anonymous)

Thank you for helping to keep the Rewst Workflow Viewer secure!
