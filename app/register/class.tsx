import { router } from "expo-router";
import { useState } from "react";
import { GraduationCap, ArrowLeft, ArrowRight } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, cn } from "@/components/ui";

const classOptions = ["9", "10", "11", "12"] as const;

export default function RegisterClassRoute() {
  const registerForm = useBuddyStore((state) => state.registerForm);
  const setRegisterForm = useBuddyStore((state) => state.setRegisterForm);
  const [selectedClass, setSelectedClass] = useState<"9" | "10" | "11" | "12">(registerForm.classLevel || "11");

  const handleNext = () => {
    setRegisterForm({ classLevel: selectedClass });
    router.push("/register/about" as any);
  };

  return (
    <html.main className="min-h-screen bg-cloud">
      <html.div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-10">
        <html.section className="flex flex-col justify-between rounded-lg bg-ink p-6 text-white shadow-panel md:p-8">
          <html.div>
            <html.div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <GraduationCap size={24} color="#ffffff" aria-hidden />
            </html.div>
            <html.p className="text-sm font-semibold uppercase tracking-wide text-mint">IELTS Buddy AI</html.p>
            <html.h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Targeted exercises.
            </html.h1>
            <html.p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Your academic level helps Buddy recommend the appropriate difficulty for Reading and Listening tasks.
            </html.p>
          </html.div>
          <html.div className="mt-8">
            <html.div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
              <html.span>Onboarding progress</html.span>
              <html.span>66%</html.span>
            </html.div>
            <html.div className="h-2 overflow-hidden rounded-full bg-white/10">
              <html.div className="h-full rounded-full bg-mint w-2/3" />
            </html.div>
          </html.div>
        </html.section>

        <Panel className="self-center p-5 md:p-7" ariaLabel="Register class step">
          <html.div className="mb-6 flex gap-3">
            <html.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <GraduationCap size={22} color="#1b6b8f" aria-hidden />
            </html.div>
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Step 2 of 3</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold leading-8 text-ink">What grade are you in?</html.h2>
              <html.p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Select your current school class level.
              </html.p>
            </html.div>
          </html.div>

          <html.form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <html.div className="min-h-[200px] rounded-lg bg-slate-50 p-4 md:p-6 flex flex-col justify-center">
              <html.p className="mb-3 text-sm font-semibold text-slate-600">Choose Class</html.p>
              <html.div className="grid gap-3 grid-cols-2">
                {classOptions.map((option) => {
                  const isSelected = selectedClass === option;
                  return (
                    <html.button
                      key={option}
                      type="button"
                      onClick={() => setSelectedClass(option)}
                      className={cn(
                        "min-h-14 rounded-lg border px-4 text-center text-sm font-semibold transition",
                        isSelected
                          ? "border-ink bg-ink text-white"
                          : "border-slate-200 bg-white text-ink hover:border-ocean"
                      )}
                    >
                      Class {option}
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
                <html.span>Next Step</html.span>
                <ArrowRight size={18} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.form>

          <html.div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="mint">Step 2</Pill>
            <Pill tone="ocean">School Grade</Pill>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}
