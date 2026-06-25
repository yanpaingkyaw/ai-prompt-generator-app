import { NextResponse } from "next/server";
import { generateStructuredPrompt } from "@/lib/openai";
import { promptRequestSchema } from "@/lib/prompt-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsed = promptRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid prompt request.",
        details: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  try {
    const result = await generateStructuredPrompt(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "";
    const message = getClientErrorMessage(errorMessage);

    console.error("Prompt generation failed", {
      error: errorMessage || "Unknown error",
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getClientErrorMessage(errorMessage: string) {
  if (errorMessage.includes("OPENAI_API_KEY")) {
    return "The AI service is not configured yet. Add OPENAI_API_KEY to the server environment.";
  }

  if (
    errorMessage.includes("Incorrect API key") ||
    errorMessage.includes("401")
  ) {
    return "The AI API key was rejected. Please check whether your key matches the configured API provider.";
  }

  if (errorMessage.includes("No endpoints found for")) {
    return "The selected AI model is not available for this provider. Please update OPENAI_MODEL in .env.";
  }

  if (
    errorMessage.includes("requires more credits") ||
    errorMessage.includes("can only afford") ||
    errorMessage.includes("402")
  ) {
    return "The AI provider rejected the request because of credits or token limits. Try adding credits or using a cheaper model.";
  }

  return "Unable to generate the prompt right now. Please try again.";
}
