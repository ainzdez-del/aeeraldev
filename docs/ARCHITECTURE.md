# Architecture

## Request flow

1. A client (web or Telegram) submits a validated task to the API.
2. The API authenticates the actor and checks project permissions (authentication is a required next step before public deployment).
3. The API stores a durable task and emits a queue event.
4. A worker claims the task using a lease and asks the model provider for a structured plan.
5. The worker validates each proposed action and executes permitted work in an isolated runtime.
6. Verification runs (tests, lint, build) and results are attached to the task.
7. The client receives status updates and a sanitized summary.

## Service responsibilities

- API: authentication, validation, authorization, task lifecycle, event access.
- Agent core: model-independent planning/execution state machine.
- Worker: queue consumption and sandbox lifecycle.
- Web: project/task management and approval UX.
- Telegram: conversational task intake and notifications.
- Shared: schemas and contracts used across services.

## Current implementation boundary

The current API provides health checks and in-memory task intake only. It is a scaffold, not a functioning autonomous coding agent. The next implementation milestone is durable persistence and queue processing, followed by a sandboxed worker.
