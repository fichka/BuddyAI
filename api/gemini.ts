import type { VercelRequest, VercelResponse } from "@vercel/node";

import type { ChatMessage, SpeakingFeedback, UserProfile, WritingFeedback, WritingTask } from "../lib/types";

type GeminiAction = "writing" | "speaking" | "chat";

interface BaseRequest {
  action: GeminiAction;
  user: UserProfile;
}

interface WritingRequest extends BaseRequest {
  action: "writing";
  task: Pick<WritingTask, "taskType" | "title" | "prompt" | "sampleBandNine">;
  answer: string;
}

interface SpeakingRequest extends BaseRequest {
  action: "speaking";
  prompt: string;
  followUp: string;
  transcript: string;
}

interface ChatRequest extends BaseRequest {
  action: "chat";
  message: string;
  history: ChatMessage[];
  context: {
    diagnosticSummary: string;
    readiness: number;
    writingFeedback: WritingFeedback | null;
    speakingTranscript: string;
  };
}

type GeminiRequest = WritingRequest | SpeakingRequest | ChatRequest;

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "Gemini API key is not configured" });
    return;
  }

  const payload = request.body as unknown;
  if (!isGeminiRequest(payload)) {
    response.status(400).json({ error: "Invalid Gemini request" });
    return;
  }

  try {
    const data = await callGemini(apiKey, payload);
    response.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";
    response.status(502).json({ error: message });
  }
}

async function callGemini(apiKey: string, payload: GeminiRequest): Promise<unknown> {
  const prompt = promptFor(payload);
  const schema = schemaFor(payload.action);
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    }
  );

  if (!geminiResponse.ok) {
    const details = await geminiResponse.text();
    throw new Error(`Gemini returned ${geminiResponse.status}: ${details.slice(0, 240)}`);
  }

  const json = (await geminiResponse.json()) as GeminiGenerateResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text) as unknown;
}

function promptFor(payload: GeminiRequest): string {
  const profile = `Student: ${payload.user.fullName}, CEFR ${payload.user.currentLevel}, predicted IELTS ${payload.user.predictedBand}, target ${payload.user.targetBand}, exam ${payload.user.examDate}.`;

  if (payload.action === "writing") {
    return `${profile}
You are an expert IELTS examiner. Grade this IELTS ${payload.task.taskType} answer against IELTS public band descriptors.
Task title: ${payload.task.title}
Prompt: ${payload.task.prompt}
Band 9 reference style: ${payload.task.sampleBandNine}
Student answer:
${payload.answer}

Return strict JSON only. Scores must be IELTS bands from 0 to 9 in 0.5 increments.`;
  }

  if (payload.action === "speaking") {
    return `${profile}
You are an IELTS Speaking examiner. Assess the transcript for fluency, lexical resource, grammar, and pronunciation inference from transcript quality.
Question: ${payload.prompt}
Follow-up: ${payload.followUp}
Transcript:
${payload.transcript}

Return strict JSON only. Be direct, helpful, and band-focused.`;
  }

  return `${profile}
You are IELTS Buddy AI, a concise IELTS tutor. Use the student's history and answer naturally.
Readiness: ${payload.context.readiness}%
Diagnostic: ${payload.context.diagnosticSummary}
Latest writing feedback: ${payload.context.writingFeedback?.summary ?? "No writing feedback yet"}
Latest speaking transcript: ${payload.context.speakingTranscript || "No speaking transcript yet"}
Recent chat:
${payload.history.slice(-8).map((item) => `${item.role}: ${item.content}`).join("\n")}
Student asks: ${payload.message}

Return strict JSON only with a helpful tutor reply.`;
}

function schemaFor(action: GeminiAction): unknown {
  if (action === "writing") {
    return {
      type: "OBJECT",
      properties: {
        band: { type: "NUMBER" },
        taskAchievement: { type: "NUMBER" },
        coherence: { type: "NUMBER" },
        lexical: { type: "NUMBER" },
        grammar: { type: "NUMBER" },
        summary: { type: "STRING" },
        upgradeLine: { type: "STRING" },
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        improvements: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["band", "taskAchievement", "coherence", "lexical", "grammar", "summary", "upgradeLine"]
    };
  }

  if (action === "speaking") {
    return {
      type: "OBJECT",
      properties: {
        band: { type: "NUMBER" },
        fluency: { type: "NUMBER" },
        lexical: { type: "NUMBER" },
        grammar: { type: "NUMBER" },
        pronunciation: { type: "NUMBER" },
        summary: { type: "STRING" },
        improvedAnswer: { type: "STRING" },
        nextDrill: { type: "STRING" }
      },
      required: ["band", "fluency", "lexical", "grammar", "pronunciation", "summary", "improvedAnswer", "nextDrill"]
    };
  }

  return {
    type: "OBJECT",
    properties: {
      reply: { type: "STRING" }
    },
    required: ["reply"]
  };
}

function isGeminiRequest(value: unknown): value is GeminiRequest {
  if (!isRecord(value) || !isRecord(value.user) || typeof value.action !== "string") {
    return false;
  }
  if (value.action === "writing") {
    return isRecord(value.task) && typeof value.answer === "string";
  }
  if (value.action === "speaking") {
    return typeof value.prompt === "string" && typeof value.followUp === "string" && typeof value.transcript === "string";
  }
  if (value.action === "chat") {
    return typeof value.message === "string" && Array.isArray(value.history) && isRecord(value.context);
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
