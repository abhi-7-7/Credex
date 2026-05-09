export type ToolId =
  | "cursor"
  | "copilot"
  | "claude_sub"
  | "chatgpt_sub"
  | "gemini"
  | "openai_api"
  | "groq_api";

export type UseCase =
  | "code_completion"
  | "chat_assistant"
  | "complex_reasoning"
  | "document_processing"
  | "simple_tasks";

export interface ToolEntry {
  toolId: ToolId;
  enabled: boolean;
  plan?: string;
  seats?: number;
  monthlySpend?: number;
  model?: string;
  useCase?: UseCase;
  usingBatchApi?: boolean;
  usingPromptCaching?: boolean;
}

export interface AuditInput {
  tools: ToolEntry[];
}

export interface Recommendation {
  toolId: ToolId;
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  estimatedSaving: number;
  savingPercent: number;
  reasoning: string;
  sourceUrl: string;
  confidence: "high" | "medium" | "low";
}

export interface AuditResult {
  totalCurrentSpend: number;
  totalEstimatedSaving: number;
  recommendations: Recommendation[];
  credexCtaVisible: boolean;
  auditId?: string;
  createdAt?: string;
}
