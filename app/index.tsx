import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Trophy, Loader2 } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, SectionTitle, cn } from "@/components/ui";
import { assessWritingWithGemini } from "@/lib/aiClient";

const readingQuestion = {
  id: "reading-green-benefit",
  prompt: "According to the passage, what is one benefit of green roofs?",
  options: [
    "They increase solar heat storage in buildings.",
    "They reduce rainwater runoff and improve insulation.",
    "They eliminate building installation costs.",
    "They reduce the need for urban parks."
  ],
  correctAnswer: "They reduce rainwater runoff and improve insulation."
};

export default function IndexRoute() {
  const registrationComplete = useBuddyStore((state) => state.registrationComplete);
  const setMiniTestAnswers = useBuddyStore((state) => state.setMiniTestAnswers);
  const setTempAssessmentResult = useBuddyStore((state) => state.setTempAssessmentResult);
  const user = useBuddyStore((state) => state.user);

  const [phase, setPhase] = useState<"landing" | "test" | "loading" | "intrigue">("landing");
  const [selectedReading, setSelectedReading] = useState("");
  const [writingAnswer, setWritingAnswer] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  if (registrationComplete) {
    return <Redirect href="/dashboard" />;
  }

  const handleStartTest = () => {
    setPhase("test");
  };

  const handleSubmitTest = async () => {
    if (!selectedReading || !writingAnswer.trim()) {
      setErrorNotice("Please answer both the reading and writing questions to continue.");
      return;
    }
    setErrorNotice("");
    setMiniTestAnswers({
      readingAnswers: { [readingQuestion.id]: selectedReading },
      writingAnswer: writingAnswer.trim()
    });

    setPhase("loading");

    try {
      const isReadingCorrect = selectedReading === readingQuestion.correctAnswer;
      const taskPayload = {
        taskType: "Task 2" as const,
        title: "Technology and Education",
        prompt: "Some people believe that digital devices improve education, while others think they distract students.",
        sampleBandNine: "Digital devices can improve education by offering instant access to information, provided that schools enforce rules to prevent distraction."
      };

      const assessment = await assessWritingWithGemini(user, taskPayload, writingAnswer.trim());
      const baseWritingBand = assessment.band;
      const readingBonus = isReadingCorrect ? 0.5 : 0;
      const overallBand = Math.min(9.0, Math.max(4.0, baseWritingBand + readingBonus));

      setTempAssessmentResult({
        band: overallBand,
        summary: assessment.summary,
        readingCorrect: isReadingCorrect,
        strengths: assessment.strengths || ["Grammar control is stable", "Clear position stated"],
        improvements: assessment.improvements || ["Add more academic linkers", "Expand the explanation"]
      });

      setPhase("intrigue");
    } catch (err) {
      console.warn("Gemini diagnostic failed, fallback to mock evaluation:", err);
      const isReadingCorrect = selectedReading === readingQuestion.correctAnswer;
      const overallBand = isReadingCorrect ? 6.5 : 6.0;

      setTempAssessmentResult({
        band: overallBand,
        summary: "Your response is clear and provides a solid foundation. Focus on introducing more formal linkers (e.g. furthermore, consequently) and expanding body paragraphs with examples.",
        readingCorrect: isReadingCorrect,
        strengths: ["Clear direct position", "Appropriate vocabulary choice"],
        improvements: ["Structure longer paragraphs", "Add formal cohesive devices"]
      });

      setPhase("intrigue");
    }
  };

  const handleContinueToRegistration = () => {
    router.push("/register/name" as any);
  };

  if (phase === "landing") {
    return (
      <html.main className="min-h-screen bg-cloud flex flex-col justify-center items-center px-4 py-12 md:px-8">
        <html.div className="max-w-2xl w-full text-center space-y-8">
          <html.div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink shadow-panel">
            <Sparkles size={32} color="#ffffff" aria-hidden />
          </html.div>
          <html.div className="space-y-4">
            <html.span className="inline-flex items-center rounded-full bg-ocean/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-ocean">
              IELTS Prep Refinement
            </html.span>
            <html.h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl leading-tight">
              Unlock Your True <html.span className="text-ocean">IELTS</html.span> Band Score.
            </html.h1>
            <html.p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
              Take a fast, 5-minute diagnostic test graded by advanced Gemini AI. Learn your current level instantly without registering.
            </html.p>
          </html.div>
          <html.div className="pt-4 flex justify-center">
            <html.button
              type="button"
              onClick={handleStartTest}
              className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-ink px-10 text-lg font-bold text-white shadow-panel hover:bg-ocean transition-all transform hover:scale-105"
            >
              <html.span>Get Your Band Score Right Now</html.span>
              <ArrowRight size={22} color="#ffffff" aria-hidden />
            </html.button>
          </html.div>
        </html.div>
      </html.main>
    );
  }

  if (phase === "loading") {
    return (
      <html.main className="min-h-screen bg-cloud flex items-center justify-center p-6">
        <html.div className="text-center space-y-6 max-w-sm">
          <html.div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 shadow-panel">
            <Loader2 size={36} color="#172033" className="animate-spin" aria-hidden />
          </html.div>
          <html.div className="space-y-2">
            <html.h2 className="text-2xl font-bold text-ink">Analyzing your English level...</html.h2>
            <html.p className="text-sm text-slate-500 leading-relaxed">
              Gemini AI is assessing your Reading comprehension and Writing syntax coherence against IELTS public band descriptors.
            </html.p>
          </html.div>
        </html.div>
      </html.main>
    );
  }

  if (phase === "intrigue") {
    return (
      <html.main className="min-h-screen bg-cloud flex flex-col justify-center items-center px-4 py-12 md:px-8">
        <html.div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-panel">
          <html.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint/10">
            <Trophy size={28} color="#36b37e" aria-hidden />
          </html.div>
          <html.div className="space-y-2">
            <html.h2 className="text-2xl font-bold text-ink">Your IELTS Band Score is Ready!</html.h2>
            <html.p className="text-sm text-slate-500 leading-relaxed">
              We've successfully generated your custom IELTS assessment. Finish setting up your profile to reveal your predicted band score and detailed breakdown.
            </html.p>
          </html.div>
          <html.button
            type="button"
            onClick={handleContinueToRegistration}
            className="w-full flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white shadow-panel hover:bg-ocean transition"
          >
            <html.span>Continue to Registration</html.span>
            <ArrowRight size={18} color="#ffffff" aria-hidden />
          </html.button>
        </html.div>
      </html.main>
    );
  }

  return (
    <html.main className="min-h-screen bg-cloud px-4 py-8 md:px-8 md:py-12">
      <html.div className="mx-auto max-w-4xl space-y-6">
        <html.header className="text-center">
          <html.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-ink mb-4 shadow-panel">
            <Sparkles size={28} color="#ffffff" aria-hidden />
          </html.div>
          <html.h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">IELTS Placement Diagnostic</html.h1>
          <html.p className="mt-2 text-base text-slate-500 max-w-xl mx-auto">
            Answer the Reading comprehension and Writing prompts below to generate your score.
          </html.p>
        </html.header>

        <Panel ariaLabel="Reading section">
          <SectionTitle
            eyebrow="Section 1"
            title="Mini Reading Passage"
            action={<Pill tone="ocean">Reading (2 mins)</Pill>}
          />
          <html.article className="rounded-lg bg-slate-50 p-4 leading-7 text-slate-700 text-sm mb-4">
            Cities often absorb and retain more heat than rural areas because concrete and asphalt store solar energy. 
            Green roofs can reduce this effect by adding vegetation to building surfaces. Researchers have found that 
            these roofs also slow rainwater runoff and improve insulation, although installation costs remain a barrier 
            for smaller buildings.
          </html.article>

          <html.div className="rounded-lg border border-slate-200 p-4 bg-white">
            <html.p className="text-sm font-semibold leading-5 text-ink mb-3">{readingQuestion.prompt}</html.p>
            <html.div className="grid gap-2 sm:grid-cols-2">
              {readingQuestion.options.map((option) => {
                const isSelected = selectedReading === option;
                return (
                  <html.button
                    key={option}
                    type="button"
                    onClick={() => setSelectedReading(option)}
                    className={cn(
                      "min-h-12 rounded-lg border px-4 py-2 text-left text-sm transition",
                      isSelected
                        ? "border-ink bg-ink text-white font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-ocean"
                    )}
                  >
                    {option}
                  </html.button>
                );
              })}
            </html.div>
          </html.div>
        </Panel>

        <Panel ariaLabel="Writing section">
          <SectionTitle
            eyebrow="Section 2"
            title="Mini Writing Prompt"
            action={<Pill tone="violet">Writing (3 mins)</Pill>}
          />
          <html.div className="rounded-lg bg-slate-50 p-4 mb-4">
            <html.p className="text-sm font-semibold text-ink">IELTS Task 2 Style Question:</html.p>
            <html.p className="mt-1 text-sm text-slate-600">
              Some people believe that digital devices improve education, while others think they distract students. 
              Write a short response (1-2 sentences) giving your opinion.
            </html.p>
          </html.div>

          <html.label className="block">
            <html.span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Your Answer</html.span>
            <html.textarea
              value={writingAnswer}
              onChange={(e) => setWritingAnswer(e.currentTarget.value)}
              placeholder="e.g. In my opinion, digital devices can significantly enhance learning by offering instant access to information, provided that schools enforce rules to prevent distraction..."
              className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-ocean"
            />
          </html.label>
        </Panel>

        {errorNotice ? (
          <html.div className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral text-center">
            {errorNotice}
          </html.div>
        ) : null}

        <html.div className="flex justify-center">
          <html.button
            type="button"
            onClick={handleSubmitTest}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-8 text-sm font-semibold text-white shadow-panel hover:bg-ocean transition"
          >
            <html.span>Check My Score</html.span>
            <ArrowRight size={18} color="#ffffff" aria-hidden />
          </html.button>
        </html.div>
      </html.div>
    </html.main>
  );
}
