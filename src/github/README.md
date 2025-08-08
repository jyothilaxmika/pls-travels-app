# MCP GitHub Server

A Model Context Protocol (MCP) compatible GitHub server that provides REST API endpoints for GitHub repository management.

## Features

- Repository listing and details
- Issues management
- Pull requests management
- Workflows management
- Health check endpoint
- MCP-compatible interface

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up GitHub token:**
   Create a GitHub personal access token with appropriate permissions and set it as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

## Docker Build

To build the Docker image:

```bash
docker build -t mcp/github -f src/github/Dockerfile .
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### MCP Info
- `GET /mcp/info` - MCP server information and capabilities

### Repositories
- `GET /api/repositories` - List user repositories
- `GET /api/repositories/:owner/:repo` - Get repository details

### Issues
- `GET /api/repositories/:owner/:repo/issues` - List repository issues
  - Query parameters:
    - `state` (optional): "open", "closed", "all" (default: "open")
    - `per_page` (optional): Number of issues per page (default: 30)

### Pull Requests
- `GET /api/repositories/:owner/:repo/pulls` - List repository pull requests
  - Query parameters:
    - `state` (optional): "open", "closed", "all" (default: "open")
    - `per_page` (optional): Number of PRs per page (default: 30)

### Workflows
- `GET /api/repositories/:owner/:repo/workflows` - List repository workflows

## Environment Variables

- `GITHUB_TOKEN` (required): GitHub personal access token
- `PORT` (optional): Server port (default: 3001)

## Docker Usage

```bash
# Build the image
docker build -t mcp/github -f src/github/Dockerfile .

# Run the container
docker run -p 3001:3001 -e GITHUB_TOKEN=your_token_here mcp/github
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": [...]
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```
