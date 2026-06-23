import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { execSync } from "child_process";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "web_search",
    description: "Search the web for current information on any topic",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "read_file",
    description: "Read a file from the local filesystem",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to read" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file (creates or overwrites)",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to write" },
        content: { type: "string", description: "Content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory",
    input_schema: {
      type: "object",
      properties: {
        directory: { type: "string", description: "Directory path (default: current)" },
        pattern: { type: "string", description: "Optional file extension filter e.g. .csv" },
      },
      required: [],
    },
  },
  {
    name: "run_script",
    description: "Run a shell command or script for data processing, calculations, or automation",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to run" },
      },
      required: ["command"],
    },
  },
  {
    name: "http_request",
    description: "Make an HTTP/HTTPS request to any URL or API",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Full URL" },
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], description: "HTTP method" },
        headers: { type: "object", description: "Optional HTTP headers" },
        body: { type: "string", description: "Optional request body (JSON string)" },
      },
      required: ["url", "method"],
    },
  },
  {
    name: "analyze_data",
    description: "Parse and analyze CSV, JSON, or plain text data and produce insights",
    input_schema: {
      type: "object",
      properties: {
        data: { type: "string", description: "Raw data as a string" },
        format: { type: "string", enum: ["csv", "json", "text"], description: "Data format" },
        analysis_type: { type: "string", description: "What to analyze e.g. 'trends', 'summary', 'top 10'" },
      },
      required: ["data", "format", "analysis_type"],
    },
  },
  {
    name: "generate_report",
    description: "Generate a formatted markdown report from structured content",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              content: { type: "string" },
            },
            required: ["heading", "content"],
          },
        },
        output_file: { type: "string", description: "File to save the report to" },
      },
      required: ["title", "sections"],
    },
  },
];

// ─── Tool executor ───────────────────────────────────────────────────────────

async function executeTool(name, input) {
  switch (name) {
    case "web_search": {
      // Uses Anthropic's built-in web search via a separate messages call
      const res = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 2000,
        tools: [{ type: "web_search_20260209", name: "web_search" }],
        messages: [{ role: "user", content: `Search for: ${input.query}` }],
      });
      const texts = res.content.filter((b) => b.type === "text").map((b) => b.text);
      return texts.join("\n") || "No results found.";
    }

    case "read_file": {
      const fp = path.resolve(input.path);
      if (!fs.existsSync(fp)) return `Error: File not found: ${fp}`;
      return fs.readFileSync(fp, "utf-8");
    }

    case "write_file": {
      const fp = path.resolve(input.path);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, input.content, "utf-8");
      return `File written: ${fp}`;
    }

    case "list_files": {
      const dir = path.resolve(input.directory || ".");
      if (!fs.existsSync(dir)) return `Directory not found: ${dir}`;
      let files = fs.readdirSync(dir);
      if (input.pattern) files = files.filter((f) => f.endsWith(input.pattern));
      return files.length ? files.join("\n") : "No files found.";
    }

    case "run_script": {
      try {
        const output = execSync(input.command, { encoding: "utf-8", timeout: 30000 });
        return output || "(no output)";
      } catch (err) {
        return `Error: ${err.message}`;
      }
    }

    case "http_request": {
      return new Promise((resolve) => {
        const url = new URL(input.url);
        const lib = url.protocol === "https:" ? https : http;
        const options = {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: input.method,
          headers: input.headers || {},
        };
        if (input.body) {
          options.headers["Content-Length"] = Buffer.byteLength(input.body);
        }
        const req = lib.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(`Status: ${res.statusCode}\n${data.slice(0, 3000)}`));
        });
        req.on("error", (e) => resolve(`Request error: ${e.message}`));
        if (input.body) req.write(input.body);
        req.end();
      });
    }

    case "analyze_data": {
      // Delegate analysis back to Claude with the raw data
      const res = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Analyze this ${input.format} data for: ${input.analysis_type}\n\nDATA:\n${input.data}`,
          },
        ],
      });
      return res.content.find((b) => b.type === "text")?.text || "No analysis produced.";
    }

    case "generate_report": {
      let md = `# ${input.title}\n\n_Generated: ${new Date().toISOString()}_\n\n`;
      for (const s of input.sections) {
        md += `## ${s.heading}\n\n${s.content}\n\n`;
      }
      if (input.output_file) {
        const fp = path.resolve(input.output_file);
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, md, "utf-8");
        return `Report written to ${fp}`;
      }
      return md;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Agent loop ──────────────────────────────────────────────────────────────

async function runAgent(task) {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║          KICKBACKS AUTOMATION AGENT              ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`\n📋 Task: ${task}\n`);

  const messages = [{ role: "user", content: task }];

  let iteration = 0;
  while (true) {
    iteration++;
    process.stdout.write(`\n[Step ${iteration}] Thinking...`);

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: `You are a powerful general-purpose automation agent. You can automate tasks in ANY field:
- Business: lead research, competitor analysis, market research
- Content: writing articles, reports, summaries, social posts
- Data: analyzing CSVs, JSON data, spotting trends
- Technical: running scripts, calling APIs, processing files
- Marketing: SEO research, keyword analysis, email templates
- Finance: price monitoring, data aggregation, reporting

Always:
1. Break complex tasks into clear steps
2. Use tools to gather real data before writing reports
3. Save outputs to files when the task involves reports or data
4. Complete the full task — don't stop halfway
5. Be thorough but efficient`,
      tools: TOOLS,
      messages,
    });

    // Collect text output
    const textBlocks = response.content.filter((b) => b.type === "text");
    if (textBlocks.length) {
      console.log("\n");
      for (const b of textBlocks) console.log(b.text);
    }

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      console.log("\n✅ Task complete!\n");
      break;
    }

    // Execute tool calls
    const toolUses = response.content.filter((b) => b.type === "tool_use");
    if (toolUses.length === 0) break;

    const toolResults = [];
    for (const tool of toolUses) {
      console.log(`\n🔧 Tool: ${tool.name}`);
      if (tool.input.query) console.log(`   Query: ${tool.input.query}`);
      if (tool.input.path) console.log(`   Path: ${tool.input.path}`);
      if (tool.input.command) console.log(`   Command: ${tool.input.command}`);
      if (tool.input.url) console.log(`   URL: ${tool.input.url}`);

      const result = await executeTool(tool.name, tool.input);
      const preview = result.slice(0, 120).replace(/\n/g, " ");
      console.log(`   Result: ${preview}${result.length > 120 ? "..." : ""}`);

      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: result,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const task = process.argv.slice(2).join(" ") ||
  "Research the top 5 referral marketing platforms competing with Kickbacks, summarize their pricing and key features, and save the results to agent/output/competitor-research.md";

runAgent(task).catch((err) => {
  console.error("Agent error:", err.message);
  process.exit(1);
});
