import OpenAI from "openai";

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in .env");
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

type GroqGenerateJsonOptions = {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export async function generateJsonWithGroq<T>(
  options: GroqGenerateJsonOptions
): Promise<T> {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    response_format: { type: "json_object" },
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxOutputTokens ?? 300,
    messages: [
      {
        role: "system",
        content: options.systemInstruction,
      },
      {
        role: "user",
        content: options.userPrompt,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;

  if (!raw) {
    throw new Error("Groq returned an empty response");
  }

  return JSON.parse(raw) as T;
}
