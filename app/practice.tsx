import {
  CheckCircle2,
  FileText,
  Headphones,
  Mic2,
  PenLine,
  Play,
  Send,
  Timer,
  Trophy,
  Volume2,
  ArrowRight
} from "lucide-react-native";
import { router } from "expo-router";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState, useRef } from "react";
import { html } from "@/lib/strictHtml";

import { AppShell, Panel, Pill, ProgressBar, SectionTitle, Waveform, cn } from "@/components/ui";
import { assessSpeakingWithGemini, assessWritingWithGemini } from "@/lib/aiClient";
import { bandDescriptors, listeningTask, readingPassage, speakingPrompts, writingTasks } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";
import type { DiagnosticQuestion, PracticeMode, SpeakingFeedback, WritingFeedback } from "@/lib/types";

const modes: PracticeMode[] = ["Speaking", "Writing", "Reading", "Listening"];

const modeIcons: Record<PracticeMode, typeof Mic2> = {
  Speaking: Mic2,
  Writing: PenLine,
  Reading: FileText,
  Listening: Headphones
};

const sampleWriting =
  "Digital devices can improve education because they give students quick access to information. However, schools need clear rules so that technology supports learning instead of replacing attention and discussion.";

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

export default function PracticeRoute() {
  const recognitionRef = useRef<any>(null);
  const [activeMode, setActiveMode] = useState<PracticeMode>("Speaking");
  const [writingText, setWritingText] = useState(sampleWriting);
  const [selectedWritingId, setSelectedWritingId] = useState(writingTasks[0]?.id ?? "");
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [isWritingLoading, setIsWritingLoading] = useState(false);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // 3-step Speaking practice state
  const [speakingStep, setSpeakingStep] = useState(0); // 0, 1, 2, 3 (3 means ready to grade or graded)
  const [speakingTranscripts, setSpeakingTranscripts] = useState<string[]>(["", "", ""]);
  const speakingQuestions = [
    "What's your full name? What can I call you?",
    "Where are you from? What do you like most about your hometown?",
    "Do you work or study? Describe your typical weekday."
  ];

  const user = useBuddyStore((state) => state.user);
  const speakingFeedback = useBuddyStore((state) => state.speakingFeedback);
  const applySpeakingFeedback = useBuddyStore((state) => state.applySpeakingFeedback);
  const applyWritingFeedback = useBuddyStore((state) => state.applyWritingFeedback);
  const writingFeedback = useBuddyStore((state) => state.writingFeedback);
  const mockExamReport = useBuddyStore((state) => state.mockExamReport);
  const completeMockExam = useBuddyStore((state) => state.completeMockExam);

  const selectedWritingTask = writingTasks.find((task) => task.id === selectedWritingId) ?? writingTasks[0];
  const readingScore = useMemo(() => scoreQuestions(readingPassage.questions, readingAnswers), [readingAnswers]);
  const listeningScore = useMemo(() => scoreQuestions(listeningTask.questions, listeningAnswers), [listeningAnswers]);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAiNotice("Voice playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const recordRealSpeech = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAiNotice("Speech recording stopped.");
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setAiNotice("Microphone recognition is not supported in this browser. Chrome desktop works best.");
      const sample = [
        "My full name is Amina Rahman and you can call me Amina.",
        "I am from Kazakhstan. What I like most about my hometown is the clean air and beautiful mountain views.",
        "I am currently studying at school. A typical weekday for me involves attending classes in the morning and self-studying in the afternoon."
      ][speakingStep] || "";
      updateSpeakingTranscript(sample);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index]?.[0]?.transcript ?? "")
        .join(" ")
        .trim();
      updateSpeakingTranscript(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setAiNotice("Speech recognition stopped. Check microphone permission.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setAiNotice("Listening... Speak clearly. Press the button again when you are finished.");
    setIsListening(true);
    recognition.start();
  };

  const updateSpeakingTranscript = (text: string) => {
    setSpeakingTranscripts((current) => {
      const next = [...current];
      next[speakingStep] = text;
      return next;
    });
  };

  const handleNextSpeakingStep = () => {
    if (!speakingTranscripts[speakingStep]?.trim()) {
      setAiNotice("Please record an answer before proceeding.");
      return;
    }
    setAiNotice(null);
    setSpeakingStep((current) => current + 1);
  };

  const gradeSpeaking = async () => {
    setIsSpeakingLoading(true);
    setAiNotice(null);

    const combinedTranscript = speakingQuestions
      .map((q, idx) => `Question: ${q}\nAnswer: ${speakingTranscripts[idx]}`)
      .join("\n\n");

    const speakingPromptPayload = {
      id: "speaking-placement",
      part: 1 as const,
      prompt: "IELTS Full Interview (3 questions)",
      followUp: "Hometown and work/study questions",
      transcriptSample: "",
      waveform: [40, 50, 45, 60]
    };

    try {
      const result = await assessSpeakingWithGemini(user, speakingPromptPayload, combinedTranscript);
      const feedback: SpeakingFeedback = {
        ...result,
        id: `speaking-gemini-${Date.now()}`,
        source: "gemini"
      };
      applySpeakingFeedback(feedback);
      speakText(feedback.summary);

      // Save transcripts to answerHistory
      useBuddyStore.setState((state) => ({
        answerHistory: [
          ...state.answerHistory,
          ...speakingQuestions.map((q, idx) => ({
            id: `speaking-practice-${Date.now()}-${idx}`,
            kind: "speaking" as const,
            question: q,
            answer: speakingTranscripts[idx] || ""
          }))
        ]
      }));
    } catch (err) {
      console.warn("Gemini is unavailable, so Buddy used local mock speaking feedback:", err);
      setAiNotice("Gemini is unavailable, so Buddy used local mock speaking feedback.");
      const mockResult: SpeakingFeedback = {
        id: `speaking-mock-${Date.now()}`,
        band: 6.5,
        fluency: 7.0,
        lexical: 6.0,
        grammar: 6.0,
        pronunciation: 7.0,
        summary: "Good fluency overall, with nice native-like expressions, though you need to use more complex clauses.",
        improvedAnswer: "My name is Amina Rahman. I study at Qyzylorda Lyceum, and my typical day starts at 8 AM and ends with homework around 6 PM.",
        nextDrill: "Practice using although or because to link contrastive ideas.",
        source: "mock"
      };
      applySpeakingFeedback(mockResult);
      speakText(mockResult.summary);
    } finally {
      setIsSpeakingLoading(false);
    }
  };

  const gradeWriting = async () => {
    if (!selectedWritingTask) {
      return;
    }

    setIsWritingLoading(true);
    setAiNotice(null);

    try {
      const result = await assessWritingWithGemini(user, selectedWritingTask, writingText);
      const feedback: WritingFeedback = {
        ...result,
        id: `writing-gemini-${Date.now()}`,
        taskType: selectedWritingTask.taskType,
        source: "gemini"
      };
      applyWritingFeedback(feedback);

      // Save writing answer to history!
      useBuddyStore.setState((state) => ({
        answerHistory: [
          ...state.answerHistory,
          {
            id: `writing-practice-${Date.now()}`,
            kind: "writing" as const,
            question: selectedWritingTask.prompt,
            answer: writingText
          }
        ]
      }));
    } catch (err) {
      console.warn("Gemini is unavailable, so Buddy used local mock writing grade:", err);
      setAiNotice("Gemini is unavailable, so Buddy used local mock writing grade.");
      const mockFeedback: WritingFeedback = {
        id: `writing-mock-${Date.now()}`,
        taskType: selectedWritingTask.taskType,
        band: 6.0,
        taskAchievement: 6.0,
        coherence: 6.0,
        lexical: 6.0,
        grammar: 6.0,
        summary: "Your essay response has a clear direction, but needs stronger topic sentences and more precise linkers.",
        upgradeLine: "Upgrade: Although digital tools improve access, they must be used with clear classroom boundaries.",
        improvements: ["Structure longer paragraphs", "Expand with real examples"],
        source: "mock"
      };
      applyWritingFeedback(mockFeedback);

      // Save writing answer to history!
      useBuddyStore.setState((state) => ({
        answerHistory: [
          ...state.answerHistory,
          {
            id: `writing-practice-${Date.now()}`,
            kind: "writing" as const,
            question: selectedWritingTask.prompt,
            answer: writingText
          }
        ]
      }));
    } finally {
      setIsWritingLoading(false);
    }
  };

  const handleSpeakingChatWithBuddy = () => {
    if (!speakingFeedback) return;
    const context = `IELTS Speaking Placement Interview.
Questions and Transcripts:
${speakingQuestions.map((q, idx) => `- Q: ${q}\n  A: ${speakingTranscripts[idx]}`).join("\n")}

Examiner Grade: Band ${speakingFeedback.band.toFixed(1)}
Fluency: ${speakingFeedback.fluency.toFixed(1)}
Lexical Resource: ${speakingFeedback.lexical.toFixed(1)}
Grammatical Range: ${speakingFeedback.grammar.toFixed(1)}
Pronunciation: ${speakingFeedback.pronunciation.toFixed(1)}

Feedback Summary: ${speakingFeedback.summary}
Model Answer Recommendation: ${speakingFeedback.improvedAnswer}
Next Drill suggested: ${speakingFeedback.nextDrill}`;

    const reply = `Hello! I have reviewed your IELTS Speaking Interview response. Your overall predicted band is ${speakingFeedback.band.toFixed(1)}. I noticed some grammatical points and pronunciation tweaks we can work on, specifically related to: "${speakingFeedback.summary}". How can I help you improve these answers, or would you like to practice a specific question again?`;

    useBuddyStore.getState().startBuddyChatWithContext(context, reply);
    router.push("/buddy" as any);
  };

  const handleWritingChatWithBuddy = () => {
    if (!writingFeedback || !selectedWritingTask) return;
    const context = `IELTS Writing Practice Task.
Task Type: ${selectedWritingTask.taskType}
Prompt: ${selectedWritingTask.prompt}

User Submission:
${writingText}

Examiner Grade: Band ${writingFeedback.band.toFixed(1)}
Task Achievement: ${writingFeedback.taskAchievement.toFixed(1)}
Coherence & Cohesion: ${writingFeedback.coherence.toFixed(1)}
Lexical Resource: ${writingFeedback.lexical.toFixed(1)}
Grammatical Range & Accuracy: ${writingFeedback.grammar.toFixed(1)}

Feedback Summary: ${writingFeedback.summary}
Suggested Revision Line: ${writingFeedback.upgradeLine}`;

    const reply = `Hi! I've analyzed your IELTS Writing response. You scored a Band ${writingFeedback.band.toFixed(1)}. Your Coherence score was ${writingFeedback.coherence.toFixed(1)}. To improve, I highly recommend checking: "${writingFeedback.summary}". Ask me anything about how to restructure this essay, or let's rewrite it together!`;

    useBuddyStore.getState().startBuddyChatWithContext(context, reply);
    router.push("/buddy" as any);
  };

  return (
    <AppShell active="Practice">
      <html.div className="space-y-5">
        <Panel className="bg-white">
          <html.div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Practice lab</html.p>
              <html.h2 className="mt-1 text-3xl font-semibold text-ink">IELTS tasks with simulated AI feedback</html.h2>
              <html.p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Switch between modules, submit answers, and watch the mock tutor create rubric feedback and exam reports.
              </html.p>
            </html.div>
            <html.div className="flex flex-wrap gap-2" role="tablist" aria-label="Practice mode tabs">
              {modes.map((mode) => {
                const Icon = modeIcons[mode];
                const selected = activeMode === mode;
                return (
                  <html.button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveMode(mode)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                      selected ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Icon size={16} color={selected ? "#ffffff" : "#526077"} aria-hidden />
                    <html.span>{mode}</html.span>
                  </html.button>
                );
              })}
            </html.div>
          </html.div>
        </Panel>

        {activeMode === "Speaking" ? (
          <Panel ariaLabel="Speaking practice">
            <SectionTitle eyebrow="Speaking" title="Three-question mock interview" />
            <html.div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <html.div className="space-y-3">
                {speakingQuestions.map((question, index) => {
                  const isActive = index === speakingStep;
                  const isDone = index < speakingStep;
                  return (
                    <html.div
                      key={index}
                      className={cn(
                        "w-full rounded-lg border p-4 text-left",
                        isActive ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink"
                      )}
                    >
                      <html.div className="flex items-center justify-between">
                        <html.p className="text-xs font-semibold uppercase tracking-wide">Question {index + 1}</html.p>
                        {isDone && <Pill tone="mint">Answered</Pill>}
                      </html.div>
                      <html.p className="mt-2 text-sm leading-5 font-semibold">{question}</html.p>
                      {speakingTranscripts[index] ? (
                        <html.p className={cn("mt-2 text-xs leading-4 line-clamp-2", isActive ? "text-slate-200" : "text-slate-500")}>
                          "{speakingTranscripts[index]}"
                        </html.p>
                      ) : null}
                    </html.div>
                  );
                })}

                {(speakingStep >= 3 || speakingFeedback) && (
                  <html.button
                    type="button"
                    onClick={() => {
                      setSpeakingStep(0);
                      setSpeakingTranscripts(["", "", ""]);
                      useBuddyStore.setState({ speakingFeedback: null });
                    }}
                    className="w-full flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  >
                    Restart Interview
                  </html.button>
                )}
              </html.div>

              <html.div className="rounded-lg border border-slate-200 p-4">
                {speakingStep < 3 ? (
                  <>
                    <html.div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <Pill tone="ocean">Question {speakingStep + 1} of 3</Pill>
                      <html.div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Timer size={16} color="#64748b" aria-hidden />
                        <html.span>Answer verbally</html.span>
                      </html.div>
                    </html.div>

                    <html.h3 className="text-xl font-semibold leading-7 text-ink">
                      {speakingQuestions[speakingStep]}
                    </html.h3>

                    <html.div className="mt-4">
                      <Waveform values={[30, 45, 35, 55, 40, 60, 45, 50]} label="Mock audio waveform" tone="violet" />
                    </html.div>

                    <html.div className="mt-4 grid gap-3 md:grid-cols-2">
                      <html.button
                        type="button"
                        onClick={recordRealSpeech}
                        className={cn(
                          "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-300",
                          isListening
                            ? "bg-coral text-white animate-pulse"
                            : "bg-ink text-white hover:bg-ocean"
                        )}
                      >
                        <Mic2 size={17} color="#ffffff" aria-hidden />
                        <html.span>{isListening ? "Stop Transcribing" : "Record real answer"}</html.span>
                      </html.button>
                      <html.button
                        type="button"
                        onClick={() => speakText(speakingQuestions[speakingStep] || "")}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-ink"
                      >
                        <Play size={17} color="#172033" aria-hidden />
                        <html.span>Read prompt aloud</html.span>
                      </html.button>
                    </html.div>

                    <html.div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean mb-2">Transcript (Real-time)</html.p>
                      <html.textarea
                        value={speakingTranscripts[speakingStep] || ""}
                        onChange={(e) => updateSpeakingTranscript(e.currentTarget.value)}
                        placeholder="Click record to transcribe your voice, or type/edit your response here directly..."
                        className="w-full min-h-20 bg-transparent text-sm leading-6 text-slate-700 outline-none resize-none"
                      />
                    </html.div>

                    <html.div className="mt-4">
                      {speakingStep < 2 ? (
                        <html.button
                          type="button"
                          onClick={handleNextSpeakingStep}
                          disabled={!speakingTranscripts[speakingStep]?.trim()}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <html.span>Next Question</html.span>
                          <ArrowRight size={17} color="#ffffff" aria-hidden />
                        </html.button>
                      ) : (
                        <html.button
                          type="button"
                          onClick={async () => {
                            setSpeakingStep(3);
                            await gradeSpeaking();
                          }}
                          disabled={isSpeakingLoading || !speakingTranscripts[speakingStep]?.trim()}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ocean px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <SparklesIcon />
                          <html.span>{isSpeakingLoading ? "Gemini is assessing..." : "Submit & Assess with Gemini"}</html.span>
                        </html.button>
                      )}
                    </html.div>
                  </>
                ) : (
                  <html.div className="space-y-4">
                    <html.div className="rounded-lg bg-slate-50 p-4">
                      <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean mb-3">Submitted Interview Transcripts</html.p>
                      <html.div className="space-y-3">
                        {speakingQuestions.map((q, idx) => (
                          <html.div key={idx} className="border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                            <html.p className="text-xs font-semibold text-slate-500">{q}</html.p>
                            <html.p className="text-sm text-ink leading-6 mt-1">"{speakingTranscripts[idx]}"</html.p>
                          </html.div>
                        ))}
                      </html.div>
                    </html.div>

                    {speakingFeedback ? (
                      <html.div className="rounded-lg border border-ocean/20 bg-ocean/10 p-4">
                        <html.div className="flex items-center justify-between gap-3">
                          <html.p className="text-sm font-semibold text-ink">
                            Speaking band {speakingFeedback.band.toFixed(1)}
                          </html.p>
                          <Pill tone={speakingFeedback.source === "gemini" ? "mint" : "amber"}>
                            {speakingFeedback.source === "gemini" ? "Gemini" : "Mock fallback"}
                          </Pill>
                        </html.div>
                        <html.div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <Rubric label="Fluency" value={speakingFeedback.fluency} />
                          <Rubric label="Lexical" value={speakingFeedback.lexical} />
                          <Rubric label="Grammar" value={speakingFeedback.grammar} />
                          <Rubric label="Pronunciation" value={speakingFeedback.pronunciation} />
                        </html.div>
                        <html.p className="text-sm leading-6 text-slate-700 mt-3">{speakingFeedback.summary}</html.p>
                        <html.div className="mt-3 rounded-lg bg-white p-3">
                          <html.p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Improved Version Suggestion</html.p>
                          <html.p className="text-sm font-semibold leading-6 text-ink">
                            {speakingFeedback.improvedAnswer}
                          </html.p>
                        </html.div>

                        <html.div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <html.button
                            type="button"
                            onClick={() => speakText(`${speakingFeedback.summary} ${speakingFeedback.improvedAnswer}`)}
                            className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-3 text-sm font-semibold text-ink hover:bg-slate-50"
                          >
                            <Volume2 size={16} color="#172033" aria-hidden />
                            <html.span>Read Aloud</html.span>
                          </html.button>
                          <html.button
                            type="button"
                            onClick={handleSpeakingChatWithBuddy}
                            className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink text-white px-3 text-sm font-semibold hover:bg-ocean"
                          >
                            <SparklesIcon />
                            <html.span>Chat with Buddy</html.span>
                          </html.button>
                        </html.div>
                      </html.div>
                    ) : (
                      <html.div className="text-center p-6 text-sm text-slate-500">
                        <html.p>Interview submitted. Awaiting assessment results...</html.p>
                      </html.div>
                    )}
                  </html.div>
                )}
              </html.div>
            </html.div>
          </Panel>
        ) : null}

        {activeMode === "Writing" && selectedWritingTask ? (
          <Panel ariaLabel="Writing practice">
            <SectionTitle eyebrow="Writing" title="Task 1 and Task 2 grading lab" />
            <html.div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <html.div>
                <html.label className="mb-3 block">
                  <html.span className="mb-2 block text-sm font-semibold text-slate-600">Choose writing task</html.span>
                  <html.select
                    value={selectedWritingId}
                    onChange={(event) => setSelectedWritingId(event.currentTarget.value)}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
                  >
                    {writingTasks.map((task) => (
                      <html.option key={task.id} value={task.id}>
                        {task.taskType}: {task.title}
                      </html.option>
                    ))}
                  </html.select>
                </html.label>
                <html.div className="rounded-lg bg-slate-50 p-4">
                  <Pill tone="ocean">{selectedWritingTask.taskType}</Pill>
                  <html.h3 className="mt-3 text-xl font-semibold text-ink">{selectedWritingTask.title}</html.h3>
                  <html.p className="mt-2 text-sm leading-6 text-slate-600">{selectedWritingTask.prompt}</html.p>
                </html.div>
                <html.label className="mt-4 block">
                  <html.span className="mb-2 block text-sm font-semibold text-slate-600">Your answer</html.span>
                  <html.textarea
                    value={writingText}
                    onChange={(event) => setWritingText(event.currentTarget.value)}
                    className="min-h-52 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-ocean"
                  />
                </html.label>
                <html.button
                  type="button"
                  onClick={gradeWriting}
                  disabled={isWritingLoading}
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
                >
                  <Send size={17} color="#ffffff" aria-hidden />
                  <html.span>{isWritingLoading ? "Gemini is grading..." : "Grade with Gemini"}</html.span>
                </html.button>
              </html.div>

              <html.div className="space-y-4">
                <html.div className="rounded-lg border border-slate-200 p-4">
                  <html.p className="text-sm font-semibold text-ink">Band 9 sample comparison</html.p>
                  <html.p className="mt-2 text-sm leading-6 text-slate-600">{selectedWritingTask.sampleBandNine}</html.p>
                </html.div>
                {writingFeedback ? (
                  <html.div className="rounded-lg border border-mint/30 bg-mint/10 p-4">
                    <html.div className="mb-4 flex items-center justify-between gap-3">
                      <html.p className="text-sm font-semibold text-ink">
                        {writingFeedback.source === "gemini" ? "Gemini band" : "Mock band"}
                      </html.p>
                      <html.p className="text-3xl font-semibold text-mint">{writingFeedback.band.toFixed(1)}</html.p>
                    </html.div>
                    <Rubric label="Task Achievement" value={writingFeedback.taskAchievement} />
                    <Rubric label="Coherence" value={writingFeedback.coherence} />
                    <Rubric label="Lexical" value={writingFeedback.lexical} />
                    <Rubric label="Grammar" value={writingFeedback.grammar} />
                    <html.p className="mt-4 text-sm leading-6 text-slate-700">{writingFeedback.summary}</html.p>
                    <html.p className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold leading-6 text-ink">
                      {writingFeedback.upgradeLine}
                    </html.p>
                    {writingFeedback.improvements?.length ? (
                      <html.div className="mt-3 grid gap-2">
                        {writingFeedback.improvements.map((item) => (
                          <html.p key={item} className="rounded-lg bg-white p-3 text-sm leading-5 text-slate-700">
                            {item}
                          </html.p>
                        ))}
                      </html.div>
                    ) : null}
                    <html.button
                      type="button"
                      onClick={handleWritingChatWithBuddy}
                      className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-white px-4 text-sm font-semibold hover:bg-ocean"
                    >
                      <SparklesIcon />
                      <html.span>Chat with Buddy</html.span>
                    </html.button>
                  </html.div>
                ) : (
                  <html.div className="rounded-lg bg-slate-50 p-4">
                    <html.p className="text-sm leading-6 text-slate-600">
                      Submit an answer to see Task Achievement, Coherence, Lexical Resource, and Grammar feedback.
                    </html.p>
                  </html.div>
                )}
              </html.div>
            </html.div>
          </Panel>
        ) : null}

        {activeMode === "Reading" ? (
          <QuestionLab
            title={readingPassage.title}
            eyebrow="Reading"
            text={readingPassage.passage}
            questions={readingPassage.questions}
            answers={readingAnswers}
            setAnswers={setReadingAnswers}
            score={readingScore}
            timer={`${readingPassage.minutes} min`}
          />
        ) : null}

        {activeMode === "Listening" ? (
          <Panel ariaLabel="Listening practice">
            <SectionTitle
              eyebrow="Listening"
              title={listeningTask.title}
              action={
                <html.div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Volume2 size={16} color="#64748b" aria-hidden />
                  <html.span>{listeningTask.duration}</html.span>
                </html.div>
              }
            />
            <Waveform values={listeningTask.waveform} label="Listening audio waveform" tone="coral" />
            <html.p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {listeningTask.transcript}
            </html.p>
            <QuestionGrid
              questions={listeningTask.questions}
              answers={listeningAnswers}
              setAnswers={setListeningAnswers}
            />
            <html.div className="mt-4">
              <Pill tone="mint">Score {listeningScore}/{listeningTask.questions.length}</Pill>
            </html.div>
          </Panel>
        ) : null}



        {aiNotice ? (
          <html.div className="rounded-lg border border-amber/30 bg-amber/15 p-3 text-sm font-semibold text-ink">
            {aiNotice}
          </html.div>
        ) : null}
      </html.div>
    </AppShell>
  );
}

function SparklesIcon() {
  return <CheckCircle2 size={17} color="#ffffff" aria-hidden />;
}

interface RubricProps {
  label: string;
  value: number;
}

function Rubric({ label, value }: RubricProps) {
  return (
    <html.div className="mb-3">
      <ProgressBar value={(value / 9) * 100} label={`${label}: ${value.toFixed(1)}`} tone="mint" />
    </html.div>
  );
}

interface QuestionLabProps {
  title: string;
  eyebrow: string;
  text: string;
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  setAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  score: number;
  timer: string;
}

function QuestionLab({ title, eyebrow, text, questions, answers, setAnswers, score, timer }: QuestionLabProps) {
  return (
    <Panel ariaLabel={`${eyebrow} practice`}>
      <SectionTitle
        eyebrow={eyebrow}
        title={title}
        action={
          <html.div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Timer size={16} color="#64748b" aria-hidden />
            <html.span>{timer}</html.span>
          </html.div>
        }
      />
      <html.div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <html.article className="rounded-lg bg-slate-50 p-4">
          <html.p className="text-sm leading-7 text-slate-700">{text}</html.p>
        </html.article>
        <html.div>
          <QuestionGrid questions={questions} answers={answers} setAnswers={setAnswers} />
          <html.div className="mt-4">
            <Pill tone="mint">Score {score}/{questions.length}</Pill>
          </html.div>
        </html.div>
      </html.div>
    </Panel>
  );
}

interface QuestionGridProps {
  questions: DiagnosticQuestion[];
  answers: Record<string, string>;
  setAnswers: Dispatch<SetStateAction<Record<string, string>>>;
}

function QuestionGrid({ questions, answers, setAnswers }: QuestionGridProps) {
  return (
    <html.div className="mt-4 grid gap-3">
      {questions.map((question) => (
        <html.div key={question.id} className="rounded-lg border border-slate-200 p-3">
          <html.p className="text-sm font-semibold leading-5 text-ink">{question.prompt}</html.p>
          <html.div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => {
              const selected = answers[question.id] === option;
              return (
                <html.button
                  key={option}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                  className={cn(
                    "min-h-11 rounded-lg border px-3 text-left text-sm",
                    selected ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-slate-700"
                  )}
                >
                  {option}
                </html.button>
              );
            })}
          </html.div>
        </html.div>
      ))}
    </html.div>
  );
}

const scoreQuestions = (questions: DiagnosticQuestion[], answers: Record<string, string>): number =>
  questions.filter((question) => answers[question.id] === question.correctAnswer).length;
