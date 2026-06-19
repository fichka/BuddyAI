import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Sparkles, Trophy, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, ProgressBar, SectionTitle } from "@/components/ui";
import { assessWritingWithGemini } from "@/lib/aiClient";

export default function RegisterRevealRoute() {
  const user = useBuddyStore((state) => state.user);
  const miniTestAnswers = useBuddyStore((state) => state.miniTestAnswers);
  const completeDiagnostic = useBuddyStore((state) => state.completeDiagnostic);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState("");
  const [results, setResults] = useState<{
    band: number;
    summary: string;
    readingCorrect: boolean;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  useEffect(() => {
    async function runGrading() {
      try {
        const isReadingCorrect =
          miniTestAnswers.readingAnswers["reading-green-benefit"] ===
          "They reduce rainwater runoff and improve insulation.";

        const taskPayload = {
          taskType: "Task 2" as const,
          title: "Technology and Education",
          prompt: "Some people believe that digital devices improve education, while others think they distract students.",
          sampleBandNine: "Digital devices can improve education by offering instant access to information, provided that schools enforce rules to prevent distraction."
        };

        const writingAnswer = miniTestAnswers.writingAnswer || "";
        const assessment = await assessWritingWithGemini(user, taskPayload, writingAnswer);

        // Calculate a realistic overall band based on reading (1.0 weight) and writing
        const baseWritingBand = assessment.band;
        const readingBonus = isReadingCorrect ? 0.5 : 0;
        const overallBand = Math.min(9.0, Math.max(4.0, baseWritingBand + readingBonus));

        setResults({
          band: overallBand,
          summary: assessment.summary,
          readingCorrect: isReadingCorrect,
          strengths: assessment.strengths || ["Grammar control is stable", "Clear position stated"],
          improvements: assessment.improvements || ["Add more academic linkers", "Expand the explanation"]
        });

        // Trigger diagnostic completion with computed results in store
        completeDiagnostic(isReadingCorrect ? 1 : 0, 1);
      } catch (err) {
        console.warn("Gemini grading failed, using offline fallback: ", err);
        setErrorNotice("Gemini API was not accessible, using offline mock evaluation.");
        
        // Fallback results
        const isReadingCorrect =
          miniTestAnswers.readingAnswers["reading-green-benefit"] ===
          "They reduce rainwater runoff and improve insulation.";
        
        setResults({
          band: isReadingCorrect ? 6.5 : 6.0,
          summary: "Your response is clear and provides a solid foundation. Focus on introducing more formal linkers (e.g. furthermore, consequently) and expanding body paragraphs with examples.",
          readingCorrect: isReadingCorrect,
          strengths: ["Clear direct position", "Appropriate vocabulary choice"],
          improvements: ["Structure longer paragraphs", "Add formal cohesive devices"]
        });
        
        completeDiagnostic(isReadingCorrect ? 1 : 0, 1);
      } finally {
        setLoading(false);
      }
    }

    runGrading();
  }, []);

  const handleProceed = () => {
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <html.main className="min-h-screen bg-cloud flex items-center justify-center p-6">
        <html.div className="text-center space-y-4 max-w-sm">
          <html.div className="animate-spin mx-auto h-12 w-12 border-4 border-slate-200 border-t-ink rounded-full" />
          <html.h2 className="text-xl font-bold text-ink">Analyzing your placement test...</html.h2>
          <html.p className="text-sm text-slate-500">
            Gemini is grading your Reading comprehension and Writing task response against IELTS descriptors.
          </html.p>
        </html.div>
      </html.main>
    );
  }

  return (
    <html.main className="min-h-screen bg-cloud px-4 py-8 md:px-8 md:py-12">
      <html.div className="mx-auto max-w-3xl space-y-6">
        <html.header className="text-center">
          <html.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-mint mb-4 shadow-panel">
            <Trophy size={28} color="#ffffff" aria-hidden />
          </html.div>
          <html.h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">Your IELTS Diagnostics</html.h1>
          <html.p className="mt-2 text-base text-slate-500">
            Profile created for {user.fullName} (Class {user.classLevel})
          </html.p>
        </html.header>

        {errorNotice ? (
          <html.div className="rounded-lg border border-amber/30 bg-amber/15 p-3 text-sm font-semibold text-ink flex items-center gap-2">
            <AlertTriangle size={16} color="#f4b740" aria-hidden />
            <html.span>{errorNotice}</html.span>
          </html.div>
        ) : null}

        <Panel className="bg-ink text-white" ariaLabel="Result Overview">
          <html.div className="grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-center">
            <html.div>
              <html.p className="text-xs font-semibold uppercase tracking-wide text-mint">Predicted IELTS Band</html.p>
              <html.h2 className="mt-2 text-5xl font-bold text-white">{results?.band.toFixed(1)}</html.h2>
              <html.p className="mt-3 text-sm leading-6 text-slate-200">{results?.summary}</html.p>
            </html.div>
            <html.div className="space-y-3">
              <html.div className="rounded-lg bg-white/10 p-3">
                <html.p className="text-xs text-slate-300">Reading Question</html.p>
                <html.p className="mt-1 text-sm font-semibold">
                  {results?.readingCorrect ? "✅ Correct (1/1)" : "❌ Incorrect (0/1)"}
                </html.p>
              </html.div>
              <html.div className="rounded-lg bg-white/10 p-3">
                <html.p className="text-xs text-slate-300">Writing Grammar & Coherence</html.p>
                <html.p className="mt-1 text-sm font-semibold">Analyzed by Gemini AI</html.p>
              </html.div>
            </html.div>
          </html.div>
        </Panel>

        <html.div className="grid gap-5 md:grid-cols-2">
          <Panel ariaLabel="Strengths">
            <SectionTitle eyebrow="Key strengths" title="What went well" />
            <html.div className="space-y-2">
              {results?.strengths.map((strength) => (
                <html.div key={strength} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  <CheckCircle2 size={16} color="#36b37e" className="mt-0.5 shrink-0" aria-hidden />
                  <html.span>{strength}</html.span>
                </html.div>
              ))}
            </html.div>
          </Panel>

          <Panel ariaLabel="Improvements">
            <SectionTitle eyebrow="Roadmap priorities" title="Areas to focus" />
            <html.div className="space-y-2">
              {results?.improvements.map((improvement) => (
                <html.div key={improvement} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  <TrendingUp size={16} color="#1b6b8f" className="mt-0.5 shrink-0" aria-hidden />
                  <html.span>{improvement}</html.span>
                </html.div>
              ))}
            </html.div>
          </Panel>
        </html.div>

        <html.div className="flex justify-center pt-4">
          <html.button
            type="button"
            onClick={handleProceed}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-8 text-sm font-semibold text-white shadow-panel hover:bg-ocean transition"
          >
            <html.span>Go to Study Dashboard</html.span>
            <CheckCircle2 size={18} color="#ffffff" aria-hidden />
          </html.button>
        </html.div>
      </html.div>
    </html.main>
  );
}
