import { z } from "zod";

export const promptCategories = [
  "general",
  "writing",
  "coding",
  "image",
  "learning",
  "business",
  "marketing",
  "analysis",
] as const;

export const targetTools = [
  "general",
  "chatgpt",
  "gemini",
  "deepseek",
  "claude",
] as const;

export const promptTones = [
  "simple",
  "professional",
  "creative",
  "academic",
] as const;

export const detailLevels = ["short", "balanced", "detailed"] as const;

export const promptRequestSchema = z.object({
  inputMyanmar: z
    .string()
    .trim()
    .min(10, "Please describe your request with at least 10 characters.")
    .max(2500, "Please keep the request under 2,500 characters."),
  category: z.enum(promptCategories),
  targetTool: z.enum(targetTools),
  tone: z.enum(promptTones),
  detailLevel: z.enum(detailLevels),
});

export const promptResponseSchema = z.object({
  title: z.string().min(3).max(120),
  finalPrompt: z.string().min(20),
  sections: z.object({
    role: z.string().min(3),
    task: z.string().min(3),
    context: z.string().min(3),
    requirements: z.array(z.string().min(2)).min(2).max(8),
    outputFormat: z.string().min(3),
    qualityCriteria: z.array(z.string().min(2)).min(2).max(8),
  }),
  warnings: z.array(z.string()).default([]),
});

export type PromptRequest = z.infer<typeof promptRequestSchema>;
export type PromptResponse = z.infer<typeof promptResponseSchema>;
export type PromptCategory = (typeof promptCategories)[number];
export type TargetTool = (typeof targetTools)[number];
export type PromptTone = (typeof promptTones)[number];
export type DetailLevel = (typeof detailLevels)[number];

export const categoryLabels: Record<PromptCategory, string> = {
  general: "General task",
  writing: "Writing",
  coding: "Coding",
  image: "Image generation",
  learning: "Learning",
  business: "Business",
  marketing: "Marketing",
  analysis: "Analysis",
};

export const targetToolLabels: Record<TargetTool, string> = {
  general: "General AI",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  claude: "Claude",
};

export const toneLabels: Record<PromptTone, string> = {
  simple: "Simple",
  professional: "Professional",
  creative: "Creative",
  academic: "Academic",
};

export const detailLevelLabels: Record<DetailLevel, string> = {
  short: "Short",
  balanced: "Balanced",
  detailed: "Detailed",
};
