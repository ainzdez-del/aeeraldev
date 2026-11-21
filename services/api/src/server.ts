import "dotenv/config";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { AgentCore, type TaskStore } from "../../../packages/agent-core/src/agent.js";
import {
  CreateTaskSchema,
  type TaskRecord
} from "../../../packages/shared/src/index.js";
import { OpenAICompatibleProvider } from "./openai-provider.js";

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
  bodyLimit: 16 * 1024
});

// Temporary in-memory store. Supabase persistence is a later milestone.
const tasks = new Map<string, TaskRecord>();
const store: TaskStore = {
  async create(task) { tasks.set(task.id, task); },
  async get(taskId) { return tasks.get(taskId) ?? null; },
  async update(task) { tasks.set(task.id, task); }
};

const apiKey = process.env.LLM_API_KEY;
const modelName = process.env.LLM_MODEL;
const planner = apiKey && modelName
  ? new AgentCore(
      new OpenAICompatibleProvider(apiKey, modelName, process.env.LLM_BASE_URL),
      store
    )
  : null;

app.get("/health", async () => ({
  ok: true,
  service: "aeeral-dev-api",
  version: "0.2.0",
  plannerConfigured: Boolean(planner)
}));

app.post("/v1/tasks", async (request, reply) => {
  const parsed = CreateTaskSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_TASK",
      details: parsed.error.flatten()
    });
  }

  if (!planner) {
    return reply.code(503).send({
      error: "PLANNER_NOT_CONFIGURED",
      message: "Set LLM_API_KEY and LLM_MODEL in the server environment."
    });
  }

  const task: TaskRecord = {
    id: randomUUID(),
    ...parsed.data,
    status: "queued",
    createdAt: new Date().toISOString()
  };

  try {
    const plan = await planner.plan(task);
    return reply.code(201).send({
      task: await store.get(task.id),
      plan
    });
  } catch (error) {
    request.log.error({ err: error, taskId: task.id }, "Task planning failed");
    return reply.code(502).send({
      error: "PLANNING_FAILED",
      task: await store.get(task.id)
    });
  }
});

app.get("/v1/tasks/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const task = await store.get(id);
  if (!task) return reply.code(404).send({ error: "TASK_NOT_FOUND" });
  return { task };
});

const start = async () => {
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? "127.0.0.1";
  await app.listen({ port, host });
};

start().catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
