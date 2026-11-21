# AEERAL DEV

Autonomous AI software engineering agent.

AEERAL DEV accepts development tasks through Telegram and a web dashboard, plans work, edits project files in an isolated workspace, runs checks, and reports verified results.

## Status

Foundation stage. The repository is being built incrementally; no autonomous execution or deployment capability is considered production-ready until sandboxing, permissions, and tests are implemented.

## Planned architecture

- `apps/web` — React web dashboard
- `apps/telegram` — Telegram bot interface
- `services/api` — HTTP API and task orchestration
- `services/worker` — isolated task execution
- `packages/agent-core` — planner and agent state machine
- `packages/shared` — shared contracts and validation
- `supabase` — database migrations
- `infrastructure` — local development and deployment configuration

## Safety principles

- Execute generated code only in an isolated workspace/container.
- Never expose secrets to model prompts or task logs.
- Require explicit approval for production deployments, destructive operations, and paid actions.
- Keep an auditable event log for every agent action.

## Development

See `docs/ROADMAP.md` and `docs/SECURITY.md` for implementation sequence and security boundaries.
