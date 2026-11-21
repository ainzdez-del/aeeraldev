import "dotenv/config";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { CreateTaskSchema } from "../../../packages/shared/src/index.js";

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
  bodyLimit: 16 * 1024
});

// Temporary in-memory intake store. Replace with Supabase before multi-instance use.
const tasks = new Map<string, {
  id: string;
  projectId: string;
  instruction: string;
  source: "web" | "telegram";
  status: "queued";
  createdAt: string;
}>();

app.get("/health", async () => ({
  ok: true,
  service: "aeeral-dev-api",
  version: "0.1.0"
}));

app.post("/v1/tasks", async (request, reply) => {
  const parsed = CreateTaskSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_TASK",
      details: parsed.error.flatten()
    });
  }

  const task = {
    id: randomUUID(),
    ...parsed.data,
    status: "queued" as const,
    createdAt: new Date().toISOString()
  };

  tasks.set(task.id, task);
  return reply.code(202).send({ task });
});

app.get("/v1/tasks/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const task = tasks.get(id);
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
