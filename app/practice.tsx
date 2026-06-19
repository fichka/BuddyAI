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
  Volume2
} from "lucide-react-native";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { html } from "react-strict-dom";

import { AppShell, Panel, Pill, ProgressBar, SectionTitle, Waveform, cn } from "@/components/ui";
import { bandDescriptors, listeningTask, readingPassage, speakingPrompts, writingTasks } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";
import type { DiagnosticQuestion, PracticeMode } from "@/lib/types";

const modes: PracticeMode[] = ["Speaking", "Writing", "Reading", "Listening", "Mock Exam"];

const modeIcons: Record<PracticeMode, typeof Mic2> = {
  Speaking: Mic2,
  Writing: PenLine,
  Reading: FileText,
  Listening: Headphones,
  "Mock Exam": Trophy
};

const sampleWriting =
  "Digital devices can improve education because they give students quick access to information. However, schools need clear rules so that technology supports learning instead of replacing attention and discussion.";

export default function PracticeRoute() {
  const [activeMode, setActiveMode] = useState<PracticeMode>("Speaking");
  const [writingText, setWritingText] = useState(sampleWriting);
  const [selectedWritingId, setSelectedWritingId] = useState(writingTasks[0]?.id ?? "");
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});

  const speakingPrompt = useBuddyStore((state) => state.speakingPrompt);
  const speakingTranscript = useBuddyStore((state) => state.speakingTranscript);
  const setSpeakingPrompt = useBuddyStore((state) => state.setSpeakingPrompt);
  const recordSpeakingTranscript = useBuddyStore((state) => state.recordSpeakingTranscript);
  const submitWriting = useBuddyStore((state) => state.submitWriting);
  const writingFeedback = useBuddyStore((state) => state.writingFeedback);
  const mockExamReport = useBuddyStore((state) => state.mockExamReport);
  const completeMockExam = useBuddyStore((state) => state.completeMockExam);

  const selectedWritingTask = writingTasks.find((task) => task.id === selectedWritingId) ?? writingTasks[0];
  const readingScore = useMemo(() => scoreQuestions(readingPassage.questions, readingAnswers), [readingAnswers]);
  const listeningScore = useMemo(() => scoreQuestions(listeningTask.questions, listeningAnswers), [listeningAnswers]);

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
            <SectionTitle eyebrow="Speaking" title="Three-part mock interview" />
            <html.div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <html.div className="space-y-3">
                {speakingPrompts.map((prompt) => (
                  <html.button
                    key={prompt.id}
                    type="button"
                    onClick={() => setSpeakingPrompt(prompt.id)}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left",
                      speakingPrompt.id === prompt.id ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink"
                    )}
                  >
                    <html.p className="text-xs font-semibold uppercase tracking-wide">Part {prompt.part}</html.p>
                    <html.p className="mt-2 text-sm leading-5">{prompt.prompt}</html.p>
                  </html.button>
                ))}
              </html.div>

              <html.div className="rounded-lg border border-slate-200 p-4">
                <html.div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <Pill tone="ocean">Part {speakingPrompt.part}</Pill>
                  <html.div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Timer size={16} color="#64748b" aria-hidden />
                    <html.span>{speakingPrompt.part === 2 ? "2 min prep + 2 min talk" : "45 sec answer"}</html.span>
                  </html.div>
                </html.div>
                <html.h3 className="text-xl font-semibold leading-7 text-ink">{speakingPrompt.prompt}</html.h3>
                <html.p className="mt-3 text-sm leading-6 text-slate-600">{speakingPrompt.followUp}</html.p>
                <html.div className="mt-4">
                  <Waveform values={speakingPrompt.waveform} label="Mock audio waveform" tone="violet" />
                </html.div>
                <html.div className="mt-4 grid gap-3 md:grid-cols-2">
                  <html.button
                    type="button"
                    onClick={() => recordSpeakingTranscript(speakingPrompt.transcriptSample)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white"
                  >
                    <Mic2 size={17} color="#ffffff" aria-hidden />
                    <html.span>Record mock answer</html.span>
                  </html.button>
                  <html.button
                    type="button"
                    onClick={() => recordSpeakingTranscript("")}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-ink"
                  >
                    <Play size={17} color="#172033" aria-hidden />
                    <html.span>Replay prompt</html.span>
                  </html.button>
                </html.div>
                <html.div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean">Transcript</html.p>
                  <html.p className="mt-2 text-sm leading-6 text-slate-700">
                    {speakingTranscript || "Press record mock answer to generate a sample transcript and fluency feedback."}
                  </html.p>
                </html.div>
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
                  onClick={() => submitWriting(selectedWritingTask.taskType, writingText)}
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white md:w-auto"
                >
                  <Send size={17} color="#ffffff" aria-hidden />
                  <html.span>Grade with Buddy</html.span>
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
                      <html.p className="text-sm font-semibold text-ink">Simulated band</html.p>
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

        {activeMode === "Mock Exam" ? (
          <Panel ariaLabel="Mock exam">
            <SectionTitle eyebrow="Mock exam" title="Full simulated test and post-exam report" />
            <html.div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <html.div className="rounded-lg bg-ink p-5 text-white">
                <Trophy size={30} color="#f4b740" aria-hidden />
                <html.h3 className="mt-4 text-2xl font-semibold">Start 2 hour 45 minute simulation</html.h3>
                <html.p className="mt-3 text-sm leading-6 text-slate-200">
                  This prototype compresses the exam and instantly generates a realistic score report from mock data.
                </html.p>
                <html.button
                  type="button"
                  onClick={completeMockExam}
                  className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink"
                >
                  <CheckCircle2 size={17} color="#172033" aria-hidden />
                  <html.span>Generate exam report</html.span>
                </html.button>
              </html.div>

              <html.div className="rounded-lg border border-slate-200 p-4">
                {mockExamReport ? (
                  <>
                    <html.div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <html.div>
                        <html.p className="text-sm font-semibold text-slate-500">{mockExamReport.date}</html.p>
                        <html.h3 className="text-2xl font-semibold text-ink">Overall band {mockExamReport.overallBand.toFixed(1)}</html.h3>
                      </html.div>
                      <Pill tone="mint">{mockExamReport.readiness}% ready</Pill>
                    </html.div>
                    <html.div className="grid gap-3 sm:grid-cols-2">
                      {(["Reading", "Listening", "Writing", "Speaking"] as const).map((section) => (
                        <html.div key={section} className="rounded-lg bg-slate-50 p-4">
                          <html.p className="text-sm font-semibold text-slate-500">{section}</html.p>
                          <html.p className="mt-1 text-2xl font-semibold text-ink">
                            {mockExamReport.sections[section].toFixed(1)}
                          </html.p>
                        </html.div>
                      ))}
                    </html.div>
                    <html.div className="mt-4 space-y-2">
                      {mockExamReport.nextActions.map((action) => (
                        <html.p key={action} className="rounded-lg bg-mint/10 p-3 text-sm leading-5 text-ink">
                          {action}
                        </html.p>
                      ))}
                    </html.div>
                  </>
                ) : (
                  <html.div className="grid gap-3 md:grid-cols-2">
                    {bandDescriptors.map((descriptor) => (
                      <html.div key={descriptor.label} className="rounded-lg bg-slate-50 p-4">
                        <html.p className="text-sm font-semibold text-ink">{descriptor.label}</html.p>
                        <html.p className="mt-2 text-sm leading-6 text-slate-600">{descriptor.detail}</html.p>
                      </html.div>
                    ))}
                  </html.div>
                )}
              </html.div>
            </html.div>
          </Panel>
        ) : null}
      </html.div>
    </AppShell>
  );
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
