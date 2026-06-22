import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  categoryLabels,
  detailLevelLabels,
  promptResponseSchema,
  targetToolLabels,
  toneLabels,
  type PromptRequest,
  type PromptResponse,
} from "@/lib/prompt-schema";

const DEFAULT_MODEL = "gpt-5.4-mini";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function getProviderConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const configuredBaseUrl = process.env.OPENAI_BASE_URL;
  const usesOpenRouter =
    configuredBaseUrl?.includes("openrouter.ai") || apiKey?.startsWith("sk-or-");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const baseURL =
    configuredBaseUrl || (usesOpenRouter ? OPENROUTER_BASE_URL : undefined);
  const configuredModel = process.env.OPENAI_MODEL;
  const model =
    configuredModel && (!usesOpenRouter || configuredModel.includes("/"))
      ? configuredModel
      : usesOpenRouter
        ? DEFAULT_OPENROUTER_MODEL
        : DEFAULT_MODEL;

  return {
    apiKey,
    baseURL,
    model,
    usesOpenRouter,
  };
}

function getClient() {
  const config = getProviderConfig();

  return {
    client: new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      defaultHeaders: config.usesOpenRouter
        ? {
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "Myanmar AI Prompt Generator",
          }
        : undefined,
    }),
    config,
  };
}

function buildInstructions() {
  return [
    "You generate reusable English prompts for beginner AI users in Myanmar.",
    "The user will provide intent in Myanmar/Burmese, English, or mixed language.",
    "Translate the user's intent into natural English, but do not answer the task itself.",
    "Create a structured prompt that can be pasted into ChatGPT, Gemini, DeepSeek, Claude, or another generative AI tool.",
    "Preserve important local Myanmar context, names, constraints, audience, tone, and examples from the user input.",
    "If the user input is vague, make the prompt useful without inventing sensitive facts; add a warning explaining what detail is missing.",
    "Keep the final prompt direct, beginner-friendly, and provider-neutral unless the selected target tool requires minor wording adjustments.",
  ].join("\n");
}

function buildUserInput(request: PromptRequest) {
  return [
    `Original user request: ${request.inputMyanmar}`,
    `Prompt category: ${categoryLabels[request.category]}`,
    `Target AI tool: ${targetToolLabels[request.targetTool]}`,
    `Tone: ${toneLabels[request.tone]}`,
    `Detail level: ${detailLevelLabels[request.detailLevel]}`,
    "",
    "Return a copy-ready English prompt with clear sections. The finalPrompt must include the same section ideas in one clean prompt the user can copy.",
  ].join("\n");
}

export async function generateStructuredPrompt(
  request: PromptRequest,
): Promise<PromptResponse> {
  const { client, config } = getClient();

  if (config.usesOpenRouter) {
    return generateWithChatCompletions(client, config.model, request);
  }

  const response = await client.responses.parse({
    model: config.model,
    instructions: buildInstructions(),
    input: buildUserInput(request),
    text: {
      format: zodTextFormat(promptResponseSchema, "structured_prompt"),
      verbosity: request.detailLevel === "short" ? "low" : "medium",
    },
    reasoning: {
      effort: "low",
    },
    store: false,
  });

  if (!response.output_parsed) {
    throw new Error("The AI response did not match the expected prompt format.");
  }

  return response.output_parsed;
}

async function generateWithChatCompletions(
  client: OpenAI,
  model: string,
  request: PromptRequest,
) {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${buildInstructions()}\nReturn only valid JSON matching this TypeScript shape: { title: string; finalPrompt: string; sections: { role: string; task: string; context: string; requirements: string[]; outputFormat: string; qualityCriteria: string[] }; warnings: string[] }.`,
      },
      {
        role: "user",
        content: buildUserInput(request),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  try {
    return promptResponseSchema.parse(JSON.parse(content));
  } catch {
    throw new Error("The AI response did not match the expected prompt format.");
  }
}
