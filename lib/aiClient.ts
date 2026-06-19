import type { ChatMessage, DiagnosticResult, SpeakingFeedback, SpeakingPrompt, UserProfile, WritingFeedback, WritingTask } from "./types";

interface ChatContext {
  diagnosticResult: DiagnosticResult;
  readiness: number;
  writingFeedback: WritingFeedback | null;
  speakingTranscript: string;
}

type WritingPayload = Pick<WritingTask, "taskType" | "title" | "prompt" | "sampleBandNine">;

interface ChatResponse {
  reply: string;
}

export async function assessWritingWithGemini(
  user: UserProfile,
  task: WritingPayload,
  answer: string
): Promise<Omit<WritingFeedback, "id" | "taskType" | "source">> {
  return postGemini<Omit<WritingFeedback, "id" | "taskType" | "source">>({
    action: "writing",
    user,
    task,
    answer
  });
}

export async function assessSpeakingWithGemini(
  user: UserProfile,
  prompt: SpeakingPrompt,
  transcript: string
): Promise<Omit<SpeakingFeedback, "id" | "source">> {
  return postGemini<Omit<SpeakingFeedback, "id" | "source">>({
    action: "speaking",
    user,
    prompt: prompt.prompt,
    followUp: prompt.followUp,
    transcript
  });
}

export async function askBuddyWithGemini(
  user: UserProfile,
  message: string,
  history: ChatMessage[],
  context: ChatContext
): Promise<string> {
  const data = await postGemini<ChatResponse>({
    action: "chat",
    user,
    message,
    history,
    context: {
      diagnosticSummary: context.diagnosticResult.summary,
      readiness: context.readiness,
      writingFeedback: context.writingFeedback,
      speakingTranscript: context.speakingTranscript
    }
  });
  return data.reply;
}

async function postGemini<TResponse>(payload: any): Promise<TResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    const prompt = promptFor(payload);
    const schema = schemaFor(payload.action);
    const model = "gemini-2.5-flash";
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
      throw new Error(`Gemini direct returned ${geminiResponse.status}: ${details.slice(0, 240)}`);
    }

    const json = await geminiResponse.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini direct returned empty response");
    }

    return JSON.parse(text) as TResponse;
  }

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed with ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

function promptFor(payload: any): string {
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
Readiness: ${payload.context?.readiness || 68}%
Diagnostic: ${payload.context?.diagnosticSummary || ""}
Latest writing feedback: ${payload.context?.writingFeedback?.summary ?? "No writing feedback yet"}
Latest speaking transcript: ${payload.context?.speakingTranscript || "No speaking transcript yet"}
Recent chat:
${(payload.history || []).slice(-8).map((item: any) => `${item.role}: ${item.content}`).join("\n")}
Student asks: ${payload.message}

Return strict JSON only with a helpful tutor reply.`;
}

function schemaFor(action: string): unknown {
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
