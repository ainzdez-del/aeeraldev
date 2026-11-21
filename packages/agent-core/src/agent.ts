import type { AgentPlan, TaskRecord } from "../../shared/src/index.js";

export interface ModelProvider {
  createPlan(input: {
    instruction: string;
    projectId: string;
  }): Promise<AgentPlan>;
}

export interface TaskStore {
  create(task: TaskRecord): Promise<void>;
  get(taskId: string): Promise<TaskRecord | null>;
  update(task: TaskRecord): Promise<void>;
}

/** Orchestrates planning only. It never executes model-generated commands. */
export class AgentCore {
  constructor(
    private readonly model: ModelProvider,
    private readonly store: TaskStore
  ) {}

  async plan(task: TaskRecord): Promise<AgentPlan> {
    await this.store.create({ ...task, status: "planning" });

    try {
      const plan = await this.model.createPlan({
        instruction: task.instruction,
        projectId: task.projectId
      });
      await this.store.update({
        ...task,
        status: "awaiting_approval",
        plan
      });
      return plan;
    } catch (error) {
      await this.store.update({
        ...task,
        status: "failed",
        error: error instanceof Error ? error.message : "Planning failed"
      });
      throw error;
    }
  }
}
