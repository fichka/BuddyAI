import { create } from "zustand";

import {
  buddyChatHistory,
  dailyRecommendations,
  initialDiagnosticResult,
  latestMockExamReport,
  mockUserProfile,
  roadmapStages,
  speakingPrompts
} from "./mockData";
import type {
  ChatMessage,
  DiagnosticResult,
  IELTSSection,
  MockExamReport,
  RegistrationForm,
  RoadmapStage,
  SpeakingPrompt,
  SpeakingFeedback,
  UserProfile,
  WritingFeedback,
  AnswerHistoryItem
} from "./types";

interface BuddyStore {
  user: UserProfile;
  registrationComplete: boolean;
  diagnosticComplete: boolean;
  diagnosticResult: DiagnosticResult;
  roadmap: RoadmapStage[];
  chat: ChatMessage[];
  streak: number;
  dailyProgress: number;
  readiness: number;
  activeRecommendationId: string;
  speakingPrompt: SpeakingPrompt;
  speakingTranscript: string;
  speakingFeedback: SpeakingFeedback | null;
  writingFeedback: WritingFeedback | null;
  mockExamReport: MockExamReport | null;
  registerForm: RegistrationForm;
  miniTestAnswers: {
    readingAnswers: Record<string, string>;
    writingAnswer: string;
  };
  answerHistory: AnswerHistoryItem[];
  registerUser: (form: RegistrationForm) => void;
  setRegisterForm: (form: Partial<RegistrationForm>) => void;
  setMiniTestAnswers: (answers: { readingAnswers?: Record<string, string>; writingAnswer?: string }) => void;
  completeDiagnostic: (correctAnswers: number, totalQuestions: number) => void;
  toggleTask: (stageId: string, taskId: string) => void;
  sendBuddyMessage: (message: string) => Promise<void>;
  rotateRecommendation: () => void;
  setSpeakingPrompt: (promptId: string) => void;
  recordSpeakingTranscript: (transcript: string) => void;
  applySpeakingFeedback: (feedback: SpeakingFeedback) => void;
  submitWriting: (taskType: "Task 1" | "Task 2", text: string) => void;
  applyWritingFeedback: (feedback: WritingFeedback) => void;
  appendBuddyExchange: (message: string, reply: string) => void;
  completeMockExam: () => void;
  updateAnswerHistoryItem: (id: string, answer: string) => void;
  startBuddyChatWithContext: (contextText: string, initialBuddyReply: string) => void;
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const calculateRoadmapProgress = (roadmap: RoadmapStage[]): number => {
  const tasks = roadmap.flatMap((stage) => stage.tasks);
  const completed = tasks.filter((task) => task.completed).length;
  return tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
};

const recalculateStages = (stages: RoadmapStage[]): RoadmapStage[] =>
  stages.map((stage) => {
    const completed = stage.tasks.filter((task) => task.completed).length;
    const progress = stage.tasks.length === 0 ? 0 : Math.round((completed / stage.tasks.length) * 100);
    return { ...stage, progress };
  });

const createDiagnosticResult = (correctAnswers: number, totalQuestions: number): DiagnosticResult => {
  const ratio = totalQuestions === 0 ? 0 : correctAnswers / totalQuestions;
  const baseBand = ratio >= 0.88 ? 7.5 : ratio >= 0.7 ? 6.5 : ratio >= 0.5 ? 6 : 5.5;
  const cefrLevel = baseBand >= 7 ? "C1" : baseBand >= 6.5 ? "B2" : baseBand >= 5.5 ? "B1" : "A2";
  const spread = clamp(Math.round((ratio - 0.5) * 10) / 2, -0.5, 1);

  return {
    cefrLevel,
    baseBand,
    sectionScores: {
      Reading: clamp(baseBand + spread, 4, 9),
      Listening: clamp(baseBand + 0.5, 4, 9),
      Writing: clamp(baseBand - 0.5, 4, 9),
      Speaking: clamp(baseBand, 4, 9)
    },
    summary:
      ratio >= 0.7
        ? "Your diagnostic shows a solid IELTS foundation. The roadmap now prioritizes band 7 coherence and advanced vocabulary control."
        : "Your diagnostic shows useful core skills, with the biggest gains available in grammar accuracy, paragraph control, and active listening."
  };
};

const nowTime = (): string =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());

const buddyReply = (message: string, user: UserProfile): string => {
  const lower = message.toLowerCase();

  if (lower.includes("writing") || lower.includes("essay")) {
    return `For your ${user.targetBand.toFixed(1)} target, write a direct thesis first, then make each body paragraph prove one idea. Send me a paragraph and I will grade coherence.`;
  }

  if (lower.includes("speaking") || lower.includes("part 2")) {
    return "Use this structure: one sentence answer, one reason, one specific example, one reflection. That gives your answer fluency without sounding memorized.";
  }

  if (lower.includes("plan") || lower.includes("schedule")) {
    return "Today: 18 minutes Writing, 12 minutes Speaking, 10 minutes vocabulary review. Finish with one mistake log entry so tomorrow's practice is targeted.";
  }

  if (lower.includes("grammar")) {
    return "Focus on control before complexity. Write three accurate simple sentences, then combine two with because, although, or which.";
  }

  return "I would start with the skill that most affects your next band jump: coherence. Give me one answer or paragraph, and I will turn it into a band-focused drill.";
};

const writingFeedbackFor = (taskType: "Task 1" | "Task 2", text: string): WritingFeedback => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lengthBonus = wordCount > 120 ? 0.5 : 0;
  const band = clamp(6 + lengthBonus + (text.includes("however") || text.includes("although") ? 0.5 : 0), 5.5, 8);

  return {
    id: `feedback-${Date.now()}`,
    taskType,
    band,
    taskAchievement: clamp(band, 0, 9),
    coherence: clamp(band - 0.5, 0, 9),
    lexical: clamp(band, 0, 9),
    grammar: clamp(band - 0.5, 0, 9),
    summary:
      wordCount < 80
        ? "This is a useful start, but it needs a fuller position, more evidence, and clearer paragraph development."
        : "Your response has a clear direction. The next improvement is stronger topic sentences and more precise cause-effect language.",
    upgradeLine:
      taskType === "Task 1"
        ? "Upgrade: Overall, all three categories increased, but the sharpest rise occurred in the final period."
        : "Upgrade: Although digital tools can distract learners, structured use can improve access, feedback, and independent study.",
    source: "mock"
  };
};

const speakingFeedbackFor = (transcript: string): SpeakingFeedback => {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const band = clamp(wordCount > 55 ? 6.5 : 6, 4.5, 7);

  return {
    id: `speaking-feedback-${Date.now()}`,
    band,
    fluency: band,
    lexical: clamp(band - 0.5, 0, 9),
    grammar: clamp(band - 0.5, 0, 9),
    pronunciation: band,
    summary: "Your answer is understandable. Add a clearer example, reduce repetition, and finish with a reflective final sentence.",
    improvedAnswer:
      "I would say this experience helped me become more confident because I had to explain my ideas clearly and respond to unexpected questions.",
    nextDrill: "Record a 45 second answer using one reason, one example, and one final reflection.",
    source: "mock"
  };
};

const initialRoadmap = recalculateStages(roadmapStages);

export const useBuddyStore = create<BuddyStore>((set, get) => ({
  user: mockUserProfile,
  registrationComplete: false,
  diagnosticComplete: false,
  diagnosticResult: initialDiagnosticResult,
  roadmap: initialRoadmap,
  chat: buddyChatHistory,
  streak: 14,
  dailyProgress: calculateRoadmapProgress(initialRoadmap),
  readiness: 68,
  activeRecommendationId: dailyRecommendations[0]?.id ?? "rec-writing",
  speakingPrompt: speakingPrompts[0] ?? {
    id: "fallback-speaking",
    part: 1,
    prompt: "Tell me about your studies.",
    followUp: "Why do you enjoy that subject?",
    transcriptSample: "I enjoy science because it helps me understand everyday problems more clearly.",
    waveform: [30, 45, 35, 55]
  },
  speakingTranscript: "",
  speakingFeedback: null,
  writingFeedback: null,
  mockExamReport: null,
  registerForm: {
    fullName: "",
    classLevel: "11",
    aboutMe: ""
  },
  miniTestAnswers: {
    readingAnswers: {},
    writingAnswer: ""
  },
  answerHistory: [],
  setRegisterForm: (form) => set((state) => ({ registerForm: { ...state.registerForm, ...form } })),
  setMiniTestAnswers: (answers) => set((state) => ({
    miniTestAnswers: {
      readingAnswers: { ...state.miniTestAnswers.readingAnswers, ...answers.readingAnswers },
      writingAnswer: typeof answers.writingAnswer === "string" ? answers.writingAnswer : state.miniTestAnswers.writingAnswer
    }
  })),
  registerUser: (form) => {
    const mini = get().miniTestAnswers;
    const historyItems = [
      {
        id: "mini-test-reading",
        kind: "mini-test" as const,
        question: "Mini Test Reading: Urban Heat and Green Roofs benefit",
        answer: mini.readingAnswers["reading-green-benefit"] || "No answer"
      },
      {
        id: "mini-test-writing",
        kind: "mini-test" as const,
        question: "Mini Test Writing: Technology and Education",
        answer: mini.writingAnswer || "No answer"
      }
    ];
    set((state) => ({
      user: {
        ...state.user,
        fullName: form.fullName.trim() || mockUserProfile.fullName,
        classLevel: form.classLevel || mockUserProfile.classLevel,
        aboutMe: form.aboutMe.trim() || mockUserProfile.aboutMe,
      },
      registrationComplete: true,
      answerHistory: [...state.answerHistory, ...historyItems]
    }));
  },
  completeDiagnostic: (correctAnswers, totalQuestions) => {
    const result = createDiagnosticResult(correctAnswers, totalQuestions);
    const targetBand = get().user.targetBand;
    const readiness = clamp(Math.round((result.baseBand / targetBand) * 82), 42, 96);

    set((state) => ({
      diagnosticComplete: true,
      diagnosticResult: result,
      readiness,
      dailyProgress: clamp(state.dailyProgress + 8, 0, 100),
      user: {
        ...state.user,
        currentLevel: result.cefrLevel,
        predictedBand: result.baseBand
      },
      chat: [
        ...state.chat,
        {
          id: `chat-diagnostic-${Date.now()}`,
          role: "buddy",
          content: `Diagnostic complete: ${result.cefrLevel}, base IELTS ${result.baseBand.toFixed(1)}. I rebuilt your roadmap around Writing coherence and Speaking fluency.`,
          time: nowTime()
        }
      ]
    }));
  },
  toggleTask: (stageId, taskId) => {
    set((state) => {
      const roadmap = recalculateStages(
        state.roadmap.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                tasks: stage.tasks.map((task) =>
                  task.id === taskId ? { ...task, completed: !task.completed } : task
                )
              }
            : stage
        )
      );
      const dailyProgress = calculateRoadmapProgress(roadmap);

      return {
        roadmap,
        dailyProgress,
        readiness: clamp(state.readiness + 1, 0, 100),
        streak: state.streak + (dailyProgress > state.dailyProgress ? 1 : 0)
      };
    });
  },
  sendBuddyMessage: async (message) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const state = get();
    const userMessage: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      time: nowTime()
    };

    set({
      chat: [...state.chat, userMessage],
      dailyProgress: clamp(state.dailyProgress + 1, 0, 100)
    });

    try {
      const { askBuddyWithGemini } = await import("./aiClient");
      const reply = await askBuddyWithGemini(
        get().user,
        trimmed,
        get().chat,
        {
          diagnosticResult: get().diagnosticResult,
          readiness: get().readiness,
          writingFeedback: get().writingFeedback,
          speakingTranscript: get().speakingTranscript
        }
      );

      const response: ChatMessage = {
        id: `chat-buddy-${Date.now()}`,
        role: "buddy",
        content: reply,
        time: nowTime()
      };

      set((state) => ({
        chat: [...state.chat, response],
        dailyProgress: clamp(state.dailyProgress + 1, 0, 100)
      }));
    } catch (error) {
      console.warn("Gemini chatbot failed, fallback to mock reply:", error);
      const response: ChatMessage = {
        id: `chat-buddy-${Date.now()}`,
        role: "buddy",
        content: buddyReply(trimmed, get().user),
        time: nowTime()
      };
      set((state) => ({
        chat: [...state.chat, response]
      }));
    }
  },
  rotateRecommendation: () => {
    const currentId = get().activeRecommendationId;
    const currentIndex = dailyRecommendations.findIndex((recommendation) => recommendation.id === currentId);
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % dailyRecommendations.length;
    const next = dailyRecommendations[nextIndex];

    if (next) {
      set({ activeRecommendationId: next.id });
    }
  },
  setSpeakingPrompt: (promptId) => {
    const prompt = speakingPrompts.find((item) => item.id === promptId);
    if (prompt) {
      set({ speakingPrompt: prompt, speakingTranscript: "" });
    }
  },
  recordSpeakingTranscript: (transcript) => {
    set((state) => ({
      speakingTranscript: transcript,
      speakingFeedback: transcript.trim() ? speakingFeedbackFor(transcript) : null,
      dailyProgress: clamp(state.dailyProgress + 1, 0, 100)
    }));
  },
  applySpeakingFeedback: (feedback) => {
    set((state) => ({
      speakingFeedback: feedback,
      readiness: clamp(state.readiness + 2, 0, 100),
      chat: [
        ...state.chat,
        {
          id: `chat-speaking-${Date.now()}`,
          role: "buddy",
          content: `Speaking feedback: band ${feedback.band.toFixed(1)}. Next drill: ${feedback.nextDrill}`,
          time: nowTime()
        }
      ]
    }));
  },
  submitWriting: (taskType, text) => {
    const feedback = writingFeedbackFor(taskType, text);
    get().applyWritingFeedback(feedback);
  },
  applyWritingFeedback: (feedback) => {
    set((state) => ({
      writingFeedback: feedback,
      readiness: clamp(state.readiness + 2, 0, 100),
      chat: [
        ...state.chat,
        {
          id: `chat-writing-${Date.now()}`,
          role: "buddy",
          content: `${feedback.taskType} graded at band ${feedback.band.toFixed(1)}. Your fastest fix is: ${feedback.upgradeLine}`,
          time: nowTime()
        }
      ]
    }));
  },
  appendBuddyExchange: (message, reply) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    set((state) => ({
      chat: [
        ...state.chat,
        {
          id: `chat-user-${Date.now()}`,
          role: "user",
          content: trimmed,
          time: nowTime()
        },
        {
          id: `chat-buddy-${Date.now()}`,
          role: "buddy",
          content: reply,
          time: nowTime()
        }
      ],
      dailyProgress: clamp(state.dailyProgress + 2, 0, 100)
    }));
  },
  completeMockExam: () => {
    set((state) => ({
      mockExamReport: latestMockExamReport,
      readiness: latestMockExamReport.readiness,
      user: {
        ...state.user,
        predictedBand: latestMockExamReport.overallBand
      }
    }));
  },
  updateAnswerHistoryItem: (id, answer) => {
    set((state) => ({
      answerHistory: state.answerHistory.map((item) =>
        item.id === id ? { ...item, answer } : item
      )
    }));
  },
  startBuddyChatWithContext: (contextText, initialBuddyReply) => {
    set((state) => ({
      chat: [
        ...state.chat,
        {
          id: `chat-context-${Date.now()}`,
          role: "user",
          content: `[Context: ${contextText}]`,
          time: nowTime()
        },
        {
          id: `chat-context-reply-${Date.now()}`,
          role: "buddy",
          content: initialBuddyReply,
          time: nowTime()
        }
      ]
    }));
  }
}));
