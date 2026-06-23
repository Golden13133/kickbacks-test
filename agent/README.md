# Kickbacks Automation Agent

A general-purpose AI agent powered by Claude that can automate tasks in any field.

## Setup

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=your_key_here
```

Get your API key at: https://console.anthropic.com/

## Usage

```bash
# Default task (competitor research)
node agent/agent.mjs

# Custom task — any automation in natural language
node agent/agent.mjs "Research trending topics in referral marketing and write a blog post to agent/output/blog-post.md"

node agent/agent.mjs "List all files in the src directory and create a summary of the project structure"

node agent/agent.mjs "Fetch the Hacker News top stories API and save the top 10 titles to agent/output/hn-stories.md"

node agent/agent.mjs "Analyze this CSV data and find the top performing products: product,sales\nShoes,500\nBags,320\nHats,210"
```

## What it can do

| Field | Example tasks |
|---|---|
| Research | Competitor analysis, market research, news summaries |
| Content | Blog posts, reports, email templates, social posts |
| Data | Analyze CSV/JSON files, spot trends, create summaries |
| Technical | Run shell scripts, call APIs, process files |
| Business | Lead research, pricing analysis, feature comparisons |

## Tools available

- `web_search` — Search the web for live information
- `read_file` — Read any local file
- `write_file` — Write/create files
- `list_files` — Browse directory contents
- `run_script` — Execute shell commands
- `http_request` — Call any REST API
- `analyze_data` — Process CSV/JSON/text data
- `generate_report` — Create formatted markdown reports
