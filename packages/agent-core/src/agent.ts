import type { AgentPlan, TaskRecord } from "../../shared/src/index.js";

/**
 * First orchestration boundary. Planning is deliberately a provider interface:
 * credentials and vendor-specific SDKs belong in server-side adapters.
 */
export interface ModelProvider {
  createPlan(input: {
    instruction: string;
    projectId: string;
  }): Promise<AgentPlan>;
}

export interface TaskStore {
  create(task: TaskRecord): Promise<void>;
  get(taskId: string): Promise<TaskRecord | null>;
}

export class AgentCore {
  constructor(
    private readonly model: ModelProvider,
    private readonly store: TaskStore
  ) {}

  async plan(task: TaskRecord): Promise<AgentPlan> {
    await this.store.create({ ...task, status: "planning" });

    const plan = await this.model.createPlan({
      instruction: task.instruction,
      projectId: task.projectId
    });

    if (plan.steps.length === 0) {
      throw new Error("The planner returned an empty plan.");
    }

    return plan;
  }
}
