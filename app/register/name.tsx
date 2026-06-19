import { router } from "expo-router";
import { useState } from "react";
import { UserRound, ArrowLeft, ArrowRight } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, cn } from "@/components/ui";

export default function RegisterNameRoute() {
  const registerForm = useBuddyStore((state) => state.registerForm);
  const setRegisterForm = useBuddyStore((state) => state.setRegisterForm);
  const [name, setName] = useState(registerForm.fullName || "Amina Rahman");

  const handleNext = () => {
    if (!name.trim()) {
      return;
    }
    setRegisterForm({ fullName: name.trim() });
    router.push("/register/class" as any);
  };

  return (
    <html.main className="min-h-screen bg-cloud">
      <html.div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-10">
        <html.section className="flex flex-col justify-between rounded-lg bg-ink p-6 text-white shadow-panel md:p-8">
          <html.div>
            <html.div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <UserRound size={24} color="#ffffff" aria-hidden />
            </html.div>
            <html.p className="text-sm font-semibold uppercase tracking-wide text-mint">IELTS Buddy AI</html.p>
            <html.h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Tell us about yourself.
            </html.h1>
            <html.p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Let's build your profile. Buddy will use this information to customize your IELTS study plan.
            </html.p>
          </html.div>
          <html.div className="mt-8">
            <html.div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
              <html.span>Onboarding progress</html.span>
              <html.span>33%</html.span>
            </html.div>
            <html.div className="h-2 overflow-hidden rounded-full bg-white/10">
              <html.div className="h-full rounded-full bg-mint w-1/3" />
            </html.div>
          </html.div>
        </html.section>

        <Panel className="self-center p-5 md:p-7" ariaLabel="Register name step">
          <html.div className="mb-6 flex gap-3">
            <html.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <UserRound size={22} color="#1b6b8f" aria-hidden />
            </html.div>
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Step 1 of 3</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold leading-8 text-ink">What is your full name?</html.h2>
              <html.p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Buddy uses this in study reports, feedback sessions, and daily recommendations.
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
              <html.label className="block">
                <html.span className="mb-3 block text-sm font-semibold text-slate-600">Full Name</html.span>
                <html.input
                  required
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  className="h-14 w-full rounded-lg border border-slate-200 bg-white px-4 text-base text-ink outline-none focus:border-ocean"
                />
              </html.label>
            </html.div>

            <html.div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <html.button
                type="button"
                onClick={() => router.push("/")}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-ink"
              >
                <ArrowLeft size={18} color="#172033" aria-hidden />
                <html.span>Back to Test</html.span>
              </html.button>
              <html.button
                type="submit"
                disabled={!name.trim()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ocean disabled:opacity-50 sm:min-w-56"
              >
                <html.span>Next Step</html.span>
                <ArrowRight size={18} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.form>

          <html.div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="mint">Step 1</Pill>
            <Pill tone="ocean">Name Profile</Pill>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}
