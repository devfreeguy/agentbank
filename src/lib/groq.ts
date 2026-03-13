import Groq from "groq-sdk";

export const AGENT_MODEL = "llama-3.3-70b-versatile";
export const MAX_TOKENS = 2048;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function runAgentTask(
  systemPrompt: string,
  taskDescription: string
): Promise<{ output: string; promptTokens: number; completionTokens: number }> {
  try {
    const completion = await groq.chat.completions.create({
      model: AGENT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: systemPrompt },
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
