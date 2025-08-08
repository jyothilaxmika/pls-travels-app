const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Octokit (GitHub API client)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'mcp-github' });
});

// MCP-compatible endpoints
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'github-mcp',
    version: '1.0.0',
    description: 'MCP GitHub server for repository management',
    capabilities: {
      repositories: true,
      issues: true,
      pull_requests: true,
      workflows: true
    }
  });
});

// Get repositories
app.get('/api/repositories', async (req, res) => {
  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated'
    });
    
    res.json({
      success: true,
      data: repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        updated_at: repo.updated_at,
        language: repo.language
      }))
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get repository details
app.get('/api/repositories/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { data } = await octokit.repos.get({ owner, repo });
    
    res.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        private: data.private,
        html_url: data.html_url,
        clone_url: data.clone_url,
        ssh_url: data.ssh_url,
        default_branch: data.default_branch,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        open_issues_count: data.open_issues_count,
        updated_at: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get issues for a repository
app.get('/api/repositories/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open', per_page = 30 } = req.query;
    
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: parseInt(per_page)
    });
    
    res.json({
      success: true,
      data: issues.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        html_url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        user: issue.user,
        labels: issue.labels
      }))
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pull requests for a repository
app.get('/api/repositories/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open', per_page = 30 } = req.query;
    
    const { data: pulls } = await octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: parseInt(per_page)
    });
    
    res.json({
      success: true,
      data: pulls.map(pull => ({
        id: pull.id,
        number: pull.number,
        title: pull.title,
        body: pull.body,
        state: pull.state,
        html_url: pull.html_url,
        created_at: pull.created_at,
        updated_at: pull.updated_at,
        user: pull.user,
        head: pull.head,
        base: pull.base,
        mergeable: pull.mergeable
      }))
    });
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflows for a repository
app.get('/api/repositories/:owner/:repo/workflows', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner,
      repo
    });
    
    res.json({
      success: true,
      data: workflows.workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        path: workflow.path,
        state: workflow.state,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        url: workflow.url
      }))
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP GitHub server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
