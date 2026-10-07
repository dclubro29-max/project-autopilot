# Project Autopilot

## Architecture overview

Project Autopilot is structured as a local-first, desktop-oriented React application with a small persistence layer and a simulation-based autonomous control loop. The app is intentionally compact enough to ship as a working MVP while still preserving the architecture needed for future expansion into real providers, filesystem tooling, Git integration, and background execution.

### Frontend shell
- React + Vite provides a fast desktop-quality UI shell.
- The left sidebar handles navigation and project context.
- The main content area is organized into mission-control sections: Command Center, Projects, Tasks, Evidence, Tests, and Documentation.
- Local state is managed in the UI layer, while persisted project data stays in browser storage for a lightweight persistence model.

### Core domain model
- Projects carry mission state, task lists, documents, evidence, test runs, activity, and settings.
- Task planning is explicit and visible, with priorities and verification criteria tracked alongside runtime status.
- Milestones and evidence are first-class artifacts instead of decorative activity indicators.

### Autonomous loop
The internal loop is intentionally simplified for the MVP, but follows the required operating pattern:
1. Observe current project and task state.
2. Update project state and identify the highest-value unblocked task.
3. Plan the next engineering action.
4. Execute the simulated workflow via UI state changes and activity updates.
5. Verify the result with test and evidence records.
6. Document the outcome and checkpoint progress.
7. Continue to the next task until the project reaches a stable terminal state.

### Persistence and recovery
- The app persists project state in localStorage so the workspace survives refreshes and restarts.
- The current data model is designed to be extended to a server-backed database later without rewriting the UI model.
- Recovery is handled conservatively: the app reloads the last persisted project state and resumes from there.

### Security and boundaries
- The UI must never exceed the configured project permissions.
- Project content is treated as potentially untrusted; the agent loop is designed to operate within explicit, audited actions instead of free-form repository execution.
- External actions such as Git push and package installation remain treated as policy-gated operations in the MVP model.

### Evidence model
- Evidence is stored with real metadata: task, milestone, source, verification status, and a file path when available.
- This creates a traceable chain from task execution through verification to documentation and completion.

### Why this MVP works
This architecture deliberately avoids unnecessary microservices while still supporting the important core concepts required by Product Autopilot: real project state, explicit work planning, verification, evidence capture, and documentation.

It is intentionally structured to grow into a more complete orchestration system later without needing a full rewrite.
