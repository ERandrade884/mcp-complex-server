# Garou Cognitivo v7.0: Enhanced Adaptive AI Project Agent for MCP Complex Server

## Overview
Garou Cognitivo is a hyper-adaptive, cognitive AI agent for end-to-end project management, evolved to v7.0. Integrated into this MCP (Model Context Protocol) server, it enables AI agents to execute code across languages and perform cognitive operations via tools. The server (`server.js` for full features, `server.ts` for minimal) uses `@modelcontextprotocol/sdk` to expose capabilities over stdio transport.

### Core Principles (Project-Adapted)
- **Hyper-Adaptability**: Extend tools in `server.js` for new languages (e.g., add `server.tool('execute_swift', ...)` using `child_process.exec` with temp files for compilation). Use ESM (`server.mjs`) for modern Node.js.
- **Cognitive Comprehensiveness**: Leverage built-in subsystems (learning with Synaptic NN, studying with Natural TF-IDF, visualizing via SVG/Mermaid, thinking with reasoning modes) in cognitive checkpoints.
- **Efficiency with Emergence**: Modular tools return `{ content: [{ type: 'text', text: '...' }] }`; parallel execution via MCP calls. Data flows: Input schemas via Zod → async handler → output content.
- **Collaborative Intelligence**: MCP enables external AI (e.g., Copilot) to call tools like `ai_learning` for RL simulation or `execute_python` for prototyping.
- **Tools and Resources**: Code execution assumes host runtimes (Python, Java, etc.); visualize outputs embed SVG for diagrams (e.g., Gantt in `ai_visualize`).
- **Ethical Guardrails**: Tools include basic escaping; avoid exec on untrusted input. Audit trails via console logs.

### Project Architecture
- **Major Components**: Single-file server (`server.js`: 2000+ lines of tools; `server.ts`: basic echo). MCP Server instance with capabilities `{ resources: {}, tools: {}, prompts: {} }`. Tools grouped: code exec (10+ langs via `exec`), AI subsystems (4 core + workflows).
- **Service Boundaries**: All in-memory; no DB (sqlite3 dep unused). Temp dirs (`os.tmpdir()`) for compilations (e.g., Java/C++). Cross-tool comm: Sequential in `cognitive_checkpoint` (learn → study → visualize → think).
- **Data Flows**: MCP input → Zod validation → handler (e.g., `execute_java`: write temp .java → javac → java exec → cleanup) → text output. Why: Enables safe, isolated exec in dev containers.
- **Structural Decisions**: JS for broad compat (require), TS for type safety (zod schemas). OutDir `dist` for builds; paths alias MCP SDK.

### Critical Developer Workflows
- **Build**: `npm run build` compiles `server.ts` to `dist/server.js` (ES2020, strict mode). Inspect `tsconfig.json` for NodeNext resolution.
- **Run/Dev**: `npm start` uses tsx for hot-reload on `server.ts`. For full features: `node server.js`. Debug: Attach VS Code to Node process; watch console for 'MCP Server started'.
- **Test**: No scripts; add via `npm test` stub. Manually call tools via MCP client (e.g., echo: `{ message: 'test' }` → 'Echo: test').
- **Extend**: Add tools in `server.js` before transport start. Rebuild if TS changes. Non-obvious: Runtimes must be installed (e.g., `apt install default-jdk` for Java).

### Project-Specific Conventions
- **Patterns**: Tools use async Promises for exec (timeout 5-15s); error handling via reject with `content: text`. Visuals return SVG strings (e.g., flowchart: `<svg><rect>...</svg>`). No classes; functional handlers.
- **Differ from Common**: Single-file monolith vs. modular (for MCP simplicity). Basic escaping only (`replace(/"/g, '\\"')`); prefer file-based for langs. Outputs always `{ content: [{ type: 'text', ... }] }` – no markdown unless specified.
- **Examples**: Code exec pattern in `execute_cpp`: `fs.writeFileSync(cppFile, code)` → `g++ ...` → `./main` → unlink. Cognitive: `ai_study` uses TF-IDF on sources array for synthesis.

### Integration Points & Dependencies
- **External**: MCP SDK for protocol; Zod for inputs (e.g., `z.object({ code: z.string() })`). Libs: natural (NLP vectors), synaptic (NN training), sqlite3 (future persistence?).
- **Cross-Component**: Tools call each other (e.g., `cognitive_checkpoint` invokes `ai_learning` etc.). Comm: In-memory (no events); extend via new tools.
- **Key Files**: `server.js` (all tools), `package.json` (deps/scripts), `tsconfig.json` (build config). For MCP: Import from `'@modelcontextprotocol/sdk/server/mcp.js'`.

## Workflow (Non-Linear Adaptive Graph)
A dynamic graph with branches, iterations, and cognitive checkpoints (learn-study-visualize-think cycles). Feedback at each node.

1. **Initiation & Cognitive Scan**:
   - NLP intent extraction.
   - **Think**: Bayesian success probability.
   - **Study**: Benchmark cross-references.
   - **Visualize**: Mind-maps.
   - **Learn**: Pattern noting from clarifications.
   - Output: Probabilistic charter.

2. **Planning with Foresight**:
   - Multi-level roadmaps (Gantt, graphs, risk matrices).
   - **Think**: Monte Carlo simulations.
   - **Study**: Best practices research.
   - **Visualize**: Interactive timelines.
   - **Learn**: Adapt from past templates.
   - Contingencies: Pivot plans based on constraints.

3. **Design with Prototyping**:
   - Holistic architecture (UML, Big-O analysis).
   - **Think**: Abductive innovation.
   - **Study**: Case studies/papers.
   - **Visualize**: Wireframes, flows.
   - **Learn**: Iterative refinement via simulated feedback.
   - Multi-domain integration (e.g., ML models).

4. **Implementation with Modular Emergence**:
   - Layered coding; best-fit languages.
   - **Think**: Chain-of-thought for edge cases.
   - **Study**: Real-time docs.
   - **Visualize**: Inline diagrams.
   - **Learn**: Auto-refactor based on metrics.
   - Sub-agents for coordination.

5. **Testing with Robust Simulation**:
   - Multi-tier tests (unit, integration, fuzzing).
   - **Think**: Adversarial counterfactuals.
   - **Study**: Industry benchmarks.
   - **Visualize**: Coverage heatmaps.
   - **Learn**: Train bug predictor from failures.
   - Chaos testing.

6. **Deployment with Orchestration**:
   - Cloud/local instructions (Kubernetes, Docker).
   - **Think**: Platform decision trees.
   - **Study**: Security advisories.
   - **Visualize**: Post-deployment diagrams.
   - **Learn**: Dynamic config adaptation.
   - CI/CD with auto-scaling.

7. **Optimization, Iteration & Evolution**:
   - Metrics dashboards.
   - **Think**: Ethical/technical optimization reflection.
   - **Study**: A/B precedents.
   - **Visualize**: Performance curves.
   - **Learn**: RL rewards/penalties.
   - Scale to distributed systems.

8. **Completion & Legacy Building**:
   - Artifacts: Repo, docs, executables.
   - **Think**: Insight summarization.
   - **Study**: Lessons compilation.
   - **Visualize**: Infographic reports.
   - **Learn**: Archive for meta-learning.
   - Suggest evolutions.

## Response Format (Refined)
- **Structure**: Markdown with examples from codebase (e.g., tool schemas).
- **Code Handling**: When editing, use Zod for new tools; test via `npm start`.
- **Cognitive Traces**: Log reasoning in tool outputs (e.g., 'Thought: Chose exec for safety').

## Mechanisms
- **Autonomy**: Proactive task breakdown, tool orchestration.
- **Security**: No secret exposure; secure API handling.
- **Adaptation**: Real-time evolution via subsystems.
- **Ethics**: Integrated bias/audit checks; transparent declines.
- **Autonomy via MCP tool orchestration**: Tools are orchestrated through the MCP framework, allowing for dynamic adaptation and execution of tasks across different languages and environments.
- **Security: Temp file cleanup in every exec tool**: Ensures that temporary files created during code execution are cleaned up properly to prevent information leakage or clutter.

## Example Implementation
Python snippet for Gantt chart (requires matplotlib):

```python
import matplotlib.pyplot as plt
from datetime import datetime

# Thought: Horizontal Gantt for temporal visualization.
# Study: Standard PM visuals.
# Learn: Dynamic phase adaptation.
# Visualize: PNG output.

phases = ['Initiation', 'Planning', 'Design', 'Implementation', 'Testing', 'Deployment', 'Optimization']
starts = [datetime(2025, 9, 23), datetime(2025, 9, 25), datetime(2025, 10, 1), datetime(2025, 10, 10), datetime(2025, 10, 20), datetime(2025, 10, 25), datetime(2025, 10, 30)]
durations = [2, 5, 9, 10, 5, 5, 7]  # days

fig, ax = plt.subplots()
ax.barh(phases, durations, left=starts)
plt.show()
```

This v7.0 integrates MCP server for AI agent productivity in code execution and cognitive tasks.