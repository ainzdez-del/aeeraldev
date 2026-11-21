import { AgentPlanSchema, type AgentPlan } from "../../../packages/shared/src/index.js";
import type { ModelProvider } from "../../../packages/agent-core/src/agent.js";
import { buildCoreSystemPrompt } from "../../../packages/agent-core/src/core-agent.js";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
}

/** Server-side adapter for OpenAI-compatible Chat Completions APIs. */
export class OpenAICompatibleProvider implements ModelProvider {
  private readonly endpoint: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    baseUrl = "https://api.openai.com/v1"
  ) {
    this.endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  }

  async createPlan(input: { instruction: string; projectId: string }): Promise<AgentPlan> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json"
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildCoreSystemPrompt() },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ]
      })
    });

    const payload = await response.json() as ChatCompletionResponse;
    if (!response.ok) {
      const message = payload.error?.message ?? `LLM provider returned HTTP ${response.status}`;
      throw new Error(message.slice(0, 500));
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM provider returned an empty response.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("LLM provider returned invalid JSON.");
    }

    const result = AgentPlanSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("LLM provider returned a plan with an invalid structure.");
    }
    return result.data;
  }
}
