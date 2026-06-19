import { Redirect, router } from "expo-router";
import { useState } from "react";
import { FileText, PenLine, ArrowRight, Sparkles } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, SectionTitle, cn } from "@/components/ui";

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
  const [selectedReading, setSelectedReading] = useState("");
  const [writingAnswer, setWritingAnswer] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  if (registrationComplete) {
    return <Redirect href="/dashboard" />;
  }

  const handleStartOnboarding = () => {
    if (!selectedReading || !writingAnswer.trim()) {
      setErrorNotice("Please answer both the reading and writing questions to continue.");
      return;
    }
    setErrorNotice("");
    setMiniTestAnswers({
      readingAnswers: { [readingQuestion.id]: selectedReading },
      writingAnswer: writingAnswer.trim()
    });
    router.push("/register/name" as any);
  };

  return (
    <html.main className="min-h-screen bg-cloud px-4 py-8 md:px-8 md:py-12">
      <html.div className="mx-auto max-w-4xl space-y-6">
        <html.header className="text-center">
          <html.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-ink mb-4 shadow-panel">
            <Sparkles size={28} color="#ffffff" aria-hidden />
          </html.div>
          <html.h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">IELTS Placement Diagnostic</html.h1>
          <html.p className="mt-2 text-base text-slate-500 max-w-xl mx-auto">
            Take this quick 5-minute Reading and Writing test. Get instant AI band grading and a personalized study roadmap.
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
            onClick={handleStartOnboarding}
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
