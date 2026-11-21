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

export const AgentPlanSchema = z.object({
  summary: z.string().min(1).max(2_000),
  steps: z.array(z.object({
    id: z.string().min(1).max(64),
    description: z.string().min(1).max(1_000),
    requiresApproval: z.boolean()
  })).min(1).max(20)
});

export type AgentPlan = z.infer<typeof AgentPlanSchema>;

export interface TaskRecord {
  id: string;
  projectId: string;
  instruction: string;
  source: CreateTaskInput["source"];
  status: TaskStatus;
  createdAt: string;
  plan?: AgentPlan;
  error?: string;
}
