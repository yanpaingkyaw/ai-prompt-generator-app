import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
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

const normalizedIntentSchema = z.object({
  originalLanguage: z.enum(["myanmar", "english", "mixed", "unknown"]),
  englishIntentSummary: z.string().min(10),
  userGoal: z.string().min(3),
  audience: z.string().default("Not specified"),
  topicOrSubject: z.string().default("Not specified"),
  outputType: z.string().default("Not specified"),
  localContext: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  examplesFromUser: z.array(z.string()).default([]),
  missingDetails: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]),
});

type NormalizedIntent = z.infer<typeof normalizedIntentSchema>;

type CategorySkeleton = {
  roleHint: string;
  taskHint: string;
  outputFormatHint: string;
  defaultRequirements: string[];
  defaultQualityCriteria: string[];
};

const categorySkeletons: Record<PromptRequest["category"], CategorySkeleton> = {
  general: {
    roleHint: "Act as a practical assistant for the user's task.",
    taskHint: "Help the AI complete the user's stated goal clearly.",
    outputFormatHint: "Return a clear, useful answer with headings or bullets when helpful.",
    defaultRequirements: [
      "Use simple, direct language.",
      "Ask clarifying questions only when required.",
      "Preserve the user's local context and constraints.",
    ],
    defaultQualityCriteria: [
      "The answer directly addresses the user's goal.",
      "The answer avoids invented facts.",
    ],
  },
  writing: {
    roleHint: "Act as an expert writing assistant.",
    taskHint: "Draft or improve the requested writing piece.",
    outputFormatHint: "Return polished writing in the requested format.",
    defaultRequirements: [
      "Match the selected tone.",
      "Keep the message natural for the intended audience.",
      "Preserve names, places, and examples from the user.",
    ],
    defaultQualityCriteria: [
      "The writing is clear and ready to use.",
      "The writing fits the audience and channel.",
    ],
  },
  coding: {
    roleHint: "Act as a senior software engineer.",
    taskHint: "Solve the coding or technical task described by the user.",
    outputFormatHint: "Return code, explanation, and steps as needed.",
    defaultRequirements: [
      "Respect the user's existing technology stack when mentioned.",
      "Explain assumptions before giving code.",
      "Prefer simple, maintainable solutions.",
    ],
    defaultQualityCriteria: [
      "The solution is technically coherent.",
      "The answer includes edge cases or tests when relevant.",
    ],
  },
  image: {
    roleHint: "Act as an image prompt specialist.",
    taskHint: "Create a detailed image-generation prompt.",
    outputFormatHint: "Return one copy-ready image prompt plus optional negative prompt.",
    defaultRequirements: [
      "Describe subject, setting, composition, style, lighting, and mood.",
      "Preserve Myanmar cultural or local context if present.",
      "Avoid unclear or conflicting visual instructions.",
    ],
    defaultQualityCriteria: [
      "The prompt is visually specific.",
      "The prompt can be used in common image-generation tools.",
    ],
  },
  learning: {
    roleHint: "Act as a patient teacher.",
    taskHint: "Teach or explain the topic at the user's level.",
    outputFormatHint: "Return an explanation with examples, steps, and practice if useful.",
    defaultRequirements: [
      "Use beginner-friendly language.",
      "Break difficult ideas into steps.",
      "Include examples relevant to the user's context.",
    ],
    defaultQualityCriteria: [
      "The explanation is easy to follow.",
      "The answer helps the user apply the idea.",
    ],
  },
  business: {
    roleHint: "Act as a practical business advisor.",
    taskHint: "Create business-focused content or guidance for the user's goal.",
    outputFormatHint: "Return actionable business content with clear next steps.",
    defaultRequirements: [
      "Consider customers, offer, channel, and business constraints.",
      "Keep the result realistic for a small business.",
      "Preserve local market context when provided.",
    ],
    defaultQualityCriteria: [
      "The output is practical and business-ready.",
      "The advice avoids unsupported claims.",
    ],
  },
  marketing: {
    roleHint: "Act as a marketing strategist and copywriter.",
    taskHint: "Create marketing content for the user's product, service, or campaign.",
    outputFormatHint: "Return copy or campaign ideas in a ready-to-use structure.",
    defaultRequirements: [
      "Identify the target audience and main benefit.",
      "Use persuasive but honest wording.",
      "Fit the selected tone and platform.",
    ],
    defaultQualityCriteria: [
      "The message is compelling and clear.",
      "The copy includes a suitable call to action when relevant.",
    ],
  },
  analysis: {
    roleHint: "Act as an analytical assistant.",
    taskHint: "Analyze the topic, information, or decision requested by the user.",
    outputFormatHint: "Return structured analysis with findings and recommendations.",
    defaultRequirements: [
      "Separate facts, assumptions, and recommendations.",
      "Explain the reasoning clearly.",
      "Call out missing information that could change the conclusion.",
    ],
    defaultQualityCriteria: [
      "The analysis is balanced and evidence-aware.",
      "The conclusion follows from the available information.",
    ],
  },
};

function getProviderConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const configuredBaseUrl = process.env.OPENAI_BASE_URL;
  const usesOpenRouter = Boolean(
    configuredBaseUrl?.includes("openrouter.ai") || apiKey?.startsWith("sk-or-"),
  );

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const baseURL =
    configuredBaseUrl || (usesOpenRouter ? OPENROUTER_BASE_URL : undefined);
  const model = resolveModel(process.env.OPENAI_MODEL, usesOpenRouter);
  const intentModel = resolveModel(
    process.env.OPENAI_INTENT_MODEL,
    usesOpenRouter,
    model,
  );
  const promptModel = resolveModel(
    process.env.OPENAI_PROMPT_MODEL,
    usesOpenRouter,
    model,
  );

  return {
    apiKey,
    baseURL,
    model,
    intentModel,
    promptModel,
    usesOpenRouter,
  };
}

function resolveModel(
  configuredModel: string | undefined,
  usesOpenRouter: boolean,
  fallbackModel?: string,
) {
  if (configuredModel && (!usesOpenRouter || configuredModel.includes("/"))) {
    return configuredModel;
  }

  if (fallbackModel) {
    return fallbackModel;
  }

  return usesOpenRouter ? DEFAULT_OPENROUTER_MODEL : DEFAULT_MODEL;
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

function containsMyanmarScript(input: string) {
  return /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/u.test(input);
}

function buildNormalizationInstructions() {
  return [
    "You normalize Myanmar/Burmese, English, or mixed-language user requests into structured English intent briefs.",
    "Do not complete the user's task. Only understand, translate, and structure the user's intent.",
    "Preserve Myanmar local context, names, products, places, platform names, audience details, constraints, and examples exactly when they matter.",
    "If a detail is not present, mark it as missing instead of inventing it.",
    "Set confidence to low when the request is too vague or the Burmese meaning is uncertain.",
    "Use natural English, but keep original proper nouns and culturally specific terms.",
  ].join("\n");
}

function buildNormalizationInput(request: PromptRequest) {
  const hasMyanmarScript = containsMyanmarScript(request.inputMyanmar);

  return [
    "Normalize this request into an English intent brief.",
    "",
    "Few-shot examples:",
    "Example 1 input: ကျွန်တော် online shop အတွက် Facebook post ရေးချင်တယ်။ Product က handmade bag ဖြစ်ပြီး လူငယ်မိန်းကလေးတွေကို target ထားချင်တယ်။",
    'Example 1 brief: {"originalLanguage":"myanmar","englishIntentSummary":"The user wants a Facebook post for an online shop selling handmade bags to young women.","userGoal":"Create a Facebook post for an online shop.","audience":"Young women","topicOrSubject":"Handmade bags","outputType":"Facebook post","localContext":["Myanmar/Burmese-speaking online shop context"],"constraints":["Product is handmade bags"],"examplesFromUser":[],"missingDetails":["price","brand name","promotion details"],"confidence":"high"}',
    "Example 2 input: Python ကို beginner အနေနဲ့ လေ့လာချင်တယ်။ daily 30 minutes ပဲအချိန်ရတယ်။",
    'Example 2 brief: {"originalLanguage":"mixed","englishIntentSummary":"The user wants a beginner Python learning plan with only 30 minutes available each day.","userGoal":"Create a beginner Python learning plan.","audience":"Beginner learner","topicOrSubject":"Python programming","outputType":"Learning plan","localContext":[],"constraints":["Only 30 minutes per day"],"examplesFromUser":[],"missingDetails":["current coding experience","learning goal"],"confidence":"high"}',
    "Example 3 input: customer ကို reply ပြန်ချင်တယ် order late ဖြစ်သွားလို့",
    'Example 3 brief: {"originalLanguage":"mixed","englishIntentSummary":"The user wants to reply to a customer because an order is late.","userGoal":"Write a customer reply about a delayed order.","audience":"Customer","topicOrSubject":"Late order","outputType":"Customer service message","localContext":[],"constraints":["Order is delayed"],"examplesFromUser":[],"missingDetails":["reason for delay","new delivery date","business name"],"confidence":"medium"}',
    "",
    `Original user request: ${request.inputMyanmar}`,
    `Contains Myanmar script: ${hasMyanmarScript ? "yes" : "no"}`,
    `Prompt category: ${categoryLabels[request.category]}`,
    `Target AI tool: ${targetToolLabels[request.targetTool]}`,
    `Tone: ${toneLabels[request.tone]}`,
    `Detail level: ${detailLevelLabels[request.detailLevel]}`,
  ].join("\n");
}

function buildGenerationInstructions() {
  return [
    "You generate reusable English prompts for beginner AI users in Myanmar.",
    "Use the normalized English intent brief as the source of truth.",
    "Do not answer the user's task. Create a prompt the user can paste into ChatGPT, Gemini, DeepSeek, Claude, or another AI tool.",
    "Keep the final prompt provider-neutral unless the selected target tool requires small wording adjustments.",
    "Preserve Myanmar context, proper nouns, names, constraints, examples, audience, product details, and platform names from the intent brief.",
    "Do not invent missing sensitive or business facts.",
    "Add warnings for missing details, low confidence, vague user intent, or important assumptions.",
    "The finalPrompt must be in English and must be copy-ready.",
  ].join("\n");
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return "- None specified";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

function buildGenerationInput(
  request: PromptRequest,
  normalizedIntent: NormalizedIntent,
) {
  const skeleton = categorySkeletons[request.category];

  return [
    "Create the final structured prompt from this normalized intent brief.",
    "",
    "Normalized intent brief:",
    `Original language: ${normalizedIntent.originalLanguage}`,
    `English intent summary: ${normalizedIntent.englishIntentSummary}`,
    `User goal: ${normalizedIntent.userGoal}`,
    `Audience: ${normalizedIntent.audience}`,
    `Topic or subject: ${normalizedIntent.topicOrSubject}`,
    `Output type: ${normalizedIntent.outputType}`,
    `Confidence: ${normalizedIntent.confidence}`,
    "Local context:",
    formatList(normalizedIntent.localContext),
    "Constraints:",
    formatList(normalizedIntent.constraints),
    "Examples from user:",
    formatList(normalizedIntent.examplesFromUser),
    "Missing details:",
    formatList(normalizedIntent.missingDetails),
    "",
    "User selections:",
    `Prompt category: ${categoryLabels[request.category]}`,
    `Target AI tool: ${targetToolLabels[request.targetTool]}`,
    `Tone: ${toneLabels[request.tone]}`,
    `Detail level: ${detailLevelLabels[request.detailLevel]}`,
    "",
    "Category skeleton to follow:",
    `Role hint: ${skeleton.roleHint}`,
    `Task hint: ${skeleton.taskHint}`,
    `Output format hint: ${skeleton.outputFormatHint}`,
    "Default requirements:",
    formatList(skeleton.defaultRequirements),
    "Default quality criteria:",
    formatList(skeleton.defaultQualityCriteria),
    "",
    "Return a copy-ready English prompt with clear sections. The finalPrompt must include the same section ideas in one clean prompt the user can copy.",
  ].join("\n");
}

function getMaxOutputTokens(request: PromptRequest) {
  if (request.detailLevel === "short") {
    return 900;
  }

  if (request.detailLevel === "detailed") {
    return 1800;
  }

  return 1300;
}

const normalizedIntentJsonShape =
  "{ originalLanguage: 'myanmar' | 'english' | 'mixed' | 'unknown'; englishIntentSummary: string; userGoal: string; audience: string; topicOrSubject: string; outputType: string; localContext: string[]; constraints: string[]; examplesFromUser: string[]; missingDetails: string[]; confidence: 'high' | 'medium' | 'low' }";

const promptResponseJsonShape =
  "{ title: string; finalPrompt: string; sections: { role: string; task: string; context: string; requirements: string[]; outputFormat: string; qualityCriteria: string[] }; warnings: string[] }";

export async function generateStructuredPrompt(
  request: PromptRequest,
): Promise<PromptResponse> {
  const { client, config } = getClient();

  if (config.usesOpenRouter) {
    const normalizedIntent = await normalizeWithChatCompletions(
      client,
      config.intentModel,
      request,
    );

    return generatePromptWithChatCompletions(
      client,
      config.promptModel,
      request,
      normalizedIntent,
    );
  }

  const normalizedIntent = await normalizeWithResponses(
    client,
    config.intentModel,
    request,
  );

  return generatePromptWithResponses(
    client,
    config.promptModel,
    request,
    normalizedIntent,
  );
}

async function normalizeWithResponses(
  client: OpenAI,
  model: string,
  request: PromptRequest,
): Promise<NormalizedIntent> {
  const response = await client.responses.parse({
    model,
    instructions: buildNormalizationInstructions(),
    input: buildNormalizationInput(request),
    max_output_tokens: 900,
    text: {
      format: zodTextFormat(normalizedIntentSchema, "normalized_intent"),
      verbosity: "low",
    },
    reasoning: {
      effort: "low",
    },
    store: false,
  });

  if (!response.output_parsed) {
    throw new Error("The AI response did not match the expected intent format.");
  }

  return response.output_parsed;
}

async function generatePromptWithResponses(
  client: OpenAI,
  model: string,
  request: PromptRequest,
  normalizedIntent: NormalizedIntent,
): Promise<PromptResponse> {
  const response = await client.responses.parse({
    model,
    instructions: buildGenerationInstructions(),
    input: buildGenerationInput(request, normalizedIntent),
    max_output_tokens: getMaxOutputTokens(request),
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

async function normalizeWithChatCompletions(
  client: OpenAI,
  model: string,
  request: PromptRequest,
): Promise<NormalizedIntent> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${buildNormalizationInstructions()}\nReturn only valid JSON matching this TypeScript shape: ${normalizedIntentJsonShape}.`,
      },
      {
        role: "user",
        content: buildNormalizationInput(request),
      },
    ],
    max_tokens: 900,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  try {
    return normalizedIntentSchema.parse(JSON.parse(content));
  } catch {
    throw new Error("The AI response did not match the expected intent format.");
  }
}

async function generatePromptWithChatCompletions(
  client: OpenAI,
  model: string,
  request: PromptRequest,
  normalizedIntent: NormalizedIntent,
): Promise<PromptResponse> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${buildGenerationInstructions()}\nReturn only valid JSON matching this TypeScript shape: ${promptResponseJsonShape}.`,
      },
      {
        role: "user",
        content: buildGenerationInput(request, normalizedIntent),
      },
    ],
    max_tokens: getMaxOutputTokens(request),
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
