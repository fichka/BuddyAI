import { router } from "expo-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, Headphones, Mic2, PenLine, Timer } from "lucide-react-native";
import { useMemo, useState } from "react";
import { html } from "@/lib/strictHtml";

import { Panel, Pill, ProgressBar, SectionTitle, cn } from "@/components/ui";
import { diagnosticQuestions } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";
import type { IELTSSection } from "@/lib/types";

const sectionIcons: Record<IELTSSection, typeof ClipboardCheck> = {
  Reading: ClipboardCheck,
  Listening: Headphones,
  Writing: PenLine,
  Speaking: Mic2
};

const sections: IELTSSection[] = ["Reading", "Listening", "Writing", "Speaking"];

export default function DiagnosticRoute() {
  const completeDiagnostic = useBuddyStore((state) => state.completeDiagnostic);
  const diagnosticComplete = useBuddyStore((state) => state.diagnosticComplete);
  const result = useBuddyStore((state) => state.diagnosticResult);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = diagnosticQuestions.length;
  const completion = Math.round((answeredCount / totalQuestions) * 100);
  const correctAnswers = useMemo(
    () => diagnosticQuestions.filter((question) => answers[question.id] === question.correctAnswer).length,
    [answers]
  );

  const submit = () => {
    completeDiagnostic(correctAnswers, totalQuestions);
  };

  return (
    <html.main className="min-h-screen bg-cloud">
      <html.div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <html.div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <html.div>
            <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Placement engine</html.p>
            <html.h1 className="mt-1 text-3xl font-semibold text-ink md:text-4xl">Diagnostic Test</html.h1>
            <html.p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Complete mini Reading, Listening, Writing, and Speaking checks. Buddy will estimate CEFR level, base IELTS
              band, and activate your roadmap.
            </html.p>
          </html.div>
          <html.div className="w-full md:w-72">
            <ProgressBar value={completion} label="Diagnostic completion" tone="mint" />
          </html.div>
        </html.div>

        {diagnosticComplete ? (
          <Panel className="mb-6 bg-ink text-white" ariaLabel="Diagnostic result">
            <html.div className="grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-center">
              <html.div>
                <html.p className="text-sm font-semibold uppercase tracking-wide text-mint">Generated result</html.p>
                <html.h2 className="mt-2 text-3xl font-semibold">CEFR {result.cefrLevel} / IELTS {result.baseBand.toFixed(1)}</html.h2>
                <html.p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">{result.summary}</html.p>
              </html.div>
              <html.div className="grid grid-cols-2 gap-3">
                {sections.map((section) => (
                  <html.div key={section} className="rounded-lg bg-white/10 p-4">
                    <html.p className="text-xs font-semibold text-slate-200">{section}</html.p>
                    <html.p className="mt-1 text-2xl font-semibold">{result.sectionScores[section].toFixed(1)}</html.p>
                  </html.div>
                ))}
              </html.div>
            </html.div>
          </Panel>
        ) : null}

        <html.div className="grid gap-5 lg:grid-cols-2">
          {sections.map((section) => {
            const Icon = sectionIcons[section];
            const questions = diagnosticQuestions.filter((question) => question.section === section);
            return (
              <Panel key={section} ariaLabel={`${section} diagnostic questions`}>
                <SectionTitle
                  eyebrow={section}
                  title={`Mini ${section}`}
                  action={
                    <html.div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Timer size={16} color="#526077" aria-hidden />
                      <html.span>4 min</html.span>
                    </html.div>
                  }
                />
                <html.div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <html.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                    <Icon size={19} color="#1b6b8f" aria-hidden />
                  </html.div>
                  <html.p className="text-sm leading-5 text-slate-600">
                    Answer quickly. The mock engine grades accuracy and maps it to band readiness.
                  </html.p>
                </html.div>

                <html.div className="space-y-4">
                  {questions.map((question) => (
                    <html.fieldset key={question.id} className="rounded-lg border border-slate-200 p-3">
                      <html.span className="px-1 text-sm font-semibold text-ink">{question.skillTag}</html.span>
                      <html.p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</html.p>
                      <html.div className="mt-3 grid gap-2">
                        {question.options.map((option) => {
                          const selected = answers[question.id] === option;
                          return (
                            <html.button
                              key={option}
                              type="button"
                              onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                              className={cn(
                                "min-h-11 rounded-lg border px-3 text-left text-sm transition",
                                selected
                                  ? "border-ink bg-ink text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-ocean"
                              )}
                            >
                              {option}
                            </html.button>
                          );
                        })}
                      </html.div>
                    </html.fieldset>
                  ))}
                </html.div>
              </Panel>
            );
          })}
        </html.div>

        <html.div className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <html.div className="flex flex-wrap items-center gap-2">
            <Pill tone={answeredCount === totalQuestions ? "mint" : "amber"}>
              {answeredCount}/{totalQuestions} answered
            </Pill>
            <Pill tone="ocean">Correct now: {correctAnswers}</Pill>
            {diagnosticComplete ? <Pill tone="violet">Roadmap generated</Pill> : null}
          </html.div>
          <html.div className="flex flex-col gap-2 sm:flex-row">
            <html.button
              type="button"
              disabled={answeredCount < totalQuestions}
              onClick={submit}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
                answeredCount < totalQuestions ? "bg-slate-200 text-slate-500" : "bg-ink text-white"
              )}
            >
              <CheckCircle2 size={17} color={answeredCount < totalQuestions ? "#64748b" : "#ffffff"} aria-hidden />
              <html.span>Generate roadmap</html.span>
            </html.button>
            <html.button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ocean px-4 text-sm font-semibold text-white"
            >
              <html.span>Open dashboard</html.span>
              <ArrowRight size={17} color="#ffffff" aria-hidden />
            </html.button>
          </html.div>
        </html.div>
      </html.div>
    </html.main>
  );
}
