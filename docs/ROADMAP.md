# Development roadmap

## Milestone 0 — Repository foundation
- [x] Initialize repository and document architecture.
- [x] Add TypeScript project configuration.
- [x] Add a health endpoint and task intake contract.
- [ ] Add automated tests and CI.

## Milestone 1 — Task orchestration
- [ ] Persist tasks and events in Supabase.
- [ ] Implement durable queueing and worker leases.
- [ ] Add cancellation, retries, timeouts, and idempotency.
- [ ] Add model-provider adapter with structured output validation.

## Milestone 2 — Developer runtime
- [ ] Implement workspace manager.
- [ ] Run commands only in ephemeral, network-restricted containers.
- [ ] Add file patching, test execution, and build diagnostics.
- [ ] Capture artifacts and sanitized logs.

## Milestone 3 — Interfaces
- [ ] Telegram task intake and status notifications.
- [ ] Web dashboard with task history and live logs.
- [ ] Authentication, user roles, and project-level permissions.

## Milestone 4 — Controlled autonomy
- [ ] Plan → execute → verify → repair loop.
- [ ] Budget and iteration limits.
- [ ] Approval gates for destructive and production actions.
- [ ] Audit trail and operational monitoring.

A milestone is complete only after implementation and verification, not merely because its design is documented.
