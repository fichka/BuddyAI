import { router } from "expo-router";
import { useState } from "react";
import { GraduationCap, ArrowLeft, ArrowRight, Target } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, cn } from "@/components/ui";

const targetOptions = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export default function RegisterClassRoute() {
  const registerForm = useBuddyStore((state) => state.registerForm);
  const setRegisterForm = useBuddyStore((state) => state.setRegisterForm);
  const registerUser = useBuddyStore((state) => state.registerUser);
  const [selectedTarget, setSelectedTarget] = useState<number>(registerForm.targetBand || 7.0);

  const handleSubmit = () => {
    const finalForm = {
      fullName: registerForm.fullName || "IELTS Candidate",
      classLevel: registerForm.classLevel || "11",
      aboutMe: registerForm.aboutMe || "Prepared for university admission.",
      email: registerForm.email || "",
      password: registerForm.password || "",
      confirmPassword: registerForm.confirmPassword || "",
      targetBand: selectedTarget
    };
    setRegisterForm({ targetBand: selectedTarget });
    registerUser(finalForm);
    router.push("/dashboard" as any);
  };

  return (
    <html.main className="min-h-screen bg-cloud">
      <html.div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-10">
        <html.section className="flex flex-col justify-between rounded-lg bg-ink p-6 text-white shadow-panel md:p-8">
          <html.div>
            <html.div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Target size={24} color="#ffffff" aria-hidden />
            </html.div>
            <html.p className="text-sm font-semibold uppercase tracking-wide text-mint">IELTS Buddy AI</html.p>
            <html.h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Targeted exercises.
            </html.h1>
            <html.p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Your goal band score helps Buddy structure daily study recommendations to maximize your chances of success.
            </html.p>
          </html.div>
          <html.div className="mt-8">
            <html.div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
              <html.span>Onboarding progress</html.span>
              <html.span>100%</html.span>
            </html.div>
            <html.div className="h-2 overflow-hidden rounded-full bg-white/10">
              <html.div className="h-full rounded-full bg-mint w-full" />
            </html.div>
          </html.div>
        </html.section>

        <Panel className="self-center p-5 md:p-7" ariaLabel="Register class step">
          <html.div className="mb-6 flex gap-3">
            <html.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <Target size={22} color="#1b6b8f" aria-hidden />
            </html.div>
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Step 2 of 2</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold leading-8 text-ink">What is your target IELTS band?</html.h2>
              <html.p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Select your desired targeted overall score.
              </html.p>
            </html.div>
          </html.div>

          <html.form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <html.div className="min-h-[200px] rounded-lg bg-slate-50 p-4 md:p-6 flex flex-col justify-center">
              <html.p className="mb-3 text-sm font-semibold text-slate-600">Choose Targeted Score</html.p>
              <html.div className="grid gap-3 grid-cols-2">
                {targetOptions.map((option) => {
                  const isSelected = selectedTarget === option;
                  return (
                    <html.button
                      key={option}
                      type="button"
                      onClick={() => setSelectedTarget(option)}
                      className={cn(
                        "min-h-14 rounded-lg border px-4 text-center text-sm font-semibold transition",
                        isSelected
                          ? "border-ink bg-ink text-white"
                          : "border-slate-200 bg-white text-ink hover:border-ocean"
                      )}
                    >
                      Band {option.toFixed(1)}
                    </html.button>
                  );
                })}
              </html.div>
            </html.div>

            <html.div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <html.button
                type="button"
                onClick={() => router.push("/register/name" as any)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-ink"
              >
                <ArrowLeft size={18} color="#172033" aria-hidden />
                <html.span>Back</html.span>
              </html.button>
              <html.button
                type="submit"
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ocean sm:min-w-56"
              >
                <html.span>Complete Registration</html.span>
                <ArrowRight size={18} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.form>

          <html.div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="mint">Step 2</Pill>
            <Pill tone="ocean">Target score</Pill>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}
