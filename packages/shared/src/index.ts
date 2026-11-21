import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "queued",
  "planning",
  "running",
  "verifying",
  "awaiting_approval",
  "succeeded",
  "failed",
  "cancelled"
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const CreateTaskSchema = z.object({
  projectId: z.string().min(1).max(128),
  instruction: z.string().trim().min(5).max(12_000),
  source: z.enum(["web", "telegram"]).default("web")
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export interface TaskRecord {
  id: string;
  projectId: string;
  instruction: string;
  source: CreateTaskInput["source"];
  status: TaskStatus;
  createdAt: string;
}

export interface AgentPlan {
  summary: string;
  steps: Array<{
    id: string;
    description: string;
    requiresApproval: boolean;
  }>;
}
