export type CEFRLevel = "A2" | "B1" | "B2" | "C1";

export type IELTSSection = "Reading" | "Listening" | "Writing" | "Speaking";

export type PracticeMode = IELTSSection | "Mock Exam";

export type RoadmapStageName =
  | "Grammar"
  | "Vocabulary"
  | "Reading"
  | "Writing"
  | "Speaking"
  | "Final Exam";

export interface RegistrationForm {
  fullName: string;
  classLevel: "9" | "10" | "11" | "12";
  aboutMe: string;
}

export interface UserProfile {
  fullName: string;
  classLevel: "9" | "10" | "11" | "12";
  aboutMe: string;
  avatarUrl: string;
  age: number;
  country: string;
  school: string;
  email: string;
  currentLevel: CEFRLevel;
  targetBand: number;
  examDate: string;
  predictedBand: number;
}

export interface DiagnosticQuestion {
  id: string;
  section: IELTSSection;
  title: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  skillTag: string;
}

export interface DiagnosticResult {
  cefrLevel: CEFRLevel;
  baseBand: number;
  sectionScores: Record<IELTSSection, number>;
  summary: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
}

export interface RoadmapStage {
  id: string;
  name: RoadmapStageName;
  focus: string;
  deadline: string;
  progress: number;
  tasks: RoadmapTask[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "buddy";
  content: string;
  time: string;
}

export interface DailyRecommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
}

export interface SpeakingPrompt {
  id: string;
  part: 1 | 2 | 3;
  prompt: string;
  followUp: string;
  transcriptSample: string;
  waveform: number[];
}

export interface WritingTask {
  id: string;
  taskType: "Task 1" | "Task 2";
  title: string;
  prompt: string;
  sampleBandNine: string;
}

export interface WritingFeedback {
  id: string;
  taskType: "Task 1" | "Task 2";
  band: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  summary: string;
  upgradeLine: string;
  strengths?: string[];
  improvements?: string[];
  source?: "mock" | "gemini";
}

export interface StartTestAnswers {
  readingMainIdea: string;
  readingVocabulary: string;
  writingResponse: string;
}

export interface StartTestResult {
  id: string;
  predictedBand: number;
  readingScore: number;
  writingBand: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  source: "mock" | "gemini";
}

export interface AnswerHistoryItem {
  id: string;
  kind: "onboarding" | "mini-test" | "speaking" | "writing";
  question: string;
  answer: string;
}

export interface SpeakingFeedback {
  id: string;
  band: number;
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  summary: string;
  improvedAnswer: string;
  nextDrill: string;
  source: "mock" | "gemini";
}

export interface ReadingPassage {
  id: string;
  title: string;
  minutes: number;
  passage: string;
  questions: DiagnosticQuestion[];
}

export interface ListeningTask {
  id: string;
  title: string;
  duration: string;
  transcript: string;
  questions: DiagnosticQuestion[];
  waveform: number[];
}

export interface MockExamReport {
  id: string;
  date: string;
  overallBand: number;
  readiness: number;
  sections: Record<IELTSSection, number>;
  nextActions: string[];
}

export interface LearnRecommendation {
  id: string;
  category: "TV Show" | "Movie" | "Podcast" | "Book";
  title: string;
  level: CEFRLevel;
  reason: string;
  weeklyTask: string;
}
