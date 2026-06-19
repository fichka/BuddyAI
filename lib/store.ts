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
  UserProfile,
  WritingFeedback
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
  writingFeedback: WritingFeedback | null;
  mockExamReport: MockExamReport | null;
  registerUser: (form: RegistrationForm) => void;
  completeDiagnostic: (correctAnswers: number, totalQuestions: number) => void;
  toggleTask: (stageId: string, taskId: string) => void;
  sendBuddyMessage: (message: string) => void;
  rotateRecommendation: () => void;
  setSpeakingPrompt: (promptId: string) => void;
  recordSpeakingTranscript: (transcript: string) => void;
  submitWriting: (taskType: "Task 1" | "Task 2", text: string) => void;
  completeMockExam: () => void;
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
        : "Upgrade: Although digital tools can distract learners, structured use can improve access, feedback, and independent study."
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
  writingFeedback: null,
  mockExamReport: null,
  registerUser: (form) => {
    const targetBand = Number.parseFloat(form.targetBand);
    const age = Number.parseInt(form.age, 10);
    set({
      user: {
        fullName: form.fullName.trim() || mockUserProfile.fullName,
        age: Number.isNaN(age) ? mockUserProfile.age : age,
        country: form.country.trim() || mockUserProfile.country,
        school: form.school.trim() || mockUserProfile.school,
        email: form.email.trim() || mockUserProfile.email,
        currentLevel: form.currentLevel,
        targetBand: Number.isNaN(targetBand) ? mockUserProfile.targetBand : targetBand,
        examDate: form.examDate || mockUserProfile.examDate,
        predictedBand: mockUserProfile.predictedBand
      },
      registrationComplete: true
    });
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
  sendBuddyMessage: (message) => {
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
    const response: ChatMessage = {
      id: `chat-buddy-${Date.now()}`,
      role: "buddy",
      content: buddyReply(trimmed, state.user),
      time: nowTime()
    };

    set({
      chat: [...state.chat, userMessage, response],
      dailyProgress: clamp(state.dailyProgress + 2, 0, 100)
    });
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
      dailyProgress: clamp(state.dailyProgress + 1, 0, 100)
    }));
  },
  submitWriting: (taskType, text) => {
    const feedback = writingFeedbackFor(taskType, text);
    set((state) => ({
      writingFeedback: feedback,
      readiness: clamp(state.readiness + 2, 0, 100),
      chat: [
        ...state.chat,
        {
          id: `chat-writing-${Date.now()}`,
          role: "buddy",
          content: `${taskType} graded at band ${feedback.band.toFixed(1)}. Your fastest fix is: ${feedback.upgradeLine}`,
          time: nowTime()
        }
      ]
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
  }
}));
