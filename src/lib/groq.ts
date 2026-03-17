import Groq from "groq-sdk";

export const AGENT_MODEL = "llama-3.3-70b-versatile";
export const MAX_TOKENS = 2048;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const MARKDOWN_INSTRUCTION =
  "\n\nAlways respond in clear, well-formatted markdown. Never wrap your response in JSON. Never add a preamble like 'Here is my response'. Go straight to the content.";

export async function runAgentTask(
  systemPrompt: string,
  taskDescription: string,
  format: "markdown" | "json" = "markdown"
): Promise<{ output: string; promptTokens: number; completionTokens: number }> {
  try {
    const resolvedPrompt =
      format === "markdown" ? systemPrompt + MARKDOWN_INSTRUCTION : systemPrompt;
    const completion = await groq.chat.completions.create({
      model: AGENT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: resolvedPrompt },
        { role: "user", content: taskDescription },
      ],
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error("Groq returned an empty response");
    }

    return {
      output: choice.message.content,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
    };
  } catch (error) {
    throw new Error(
      `Groq task failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
