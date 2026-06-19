import { router } from "expo-router";
import { ArrowRight, CalendarDays, Lock, Mail, UserRound } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { html } from "@/lib/strictHtml";

import { Panel, Pill, TargetSummary } from "@/components/ui";
import { useBuddyStore } from "@/lib/store";
import type { CEFRLevel, RegistrationForm } from "@/lib/types";

const levels: CEFRLevel[] = ["A2", "B1", "B2", "C1"];
const targetBands = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5"];

const initialForm: RegistrationForm = {
  fullName: "Amina Rahman",
  age: "17",
  country: "Kazakhstan",
  school: "Qyzylorda Lyceum",
  email: "amina@example.com",
  password: "buddy-band-7",
  currentLevel: "B1",
  targetBand: "7.5",
  examDate: "2026-09-18"
};

type TextFieldName = Exclude<keyof RegistrationForm, "currentLevel">;

export default function RegisterRoute() {
  const registerUser = useBuddyStore((state) => state.registerUser);
  const [form, setForm] = useState<RegistrationForm>(initialForm);

  const updateText = (field: TextFieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    registerUser(form);
    router.push("/diagnostic");
  };

  return (
    <html.main className="min-h-screen bg-cloud">
      <html.div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-10">
        <html.section className="flex flex-col justify-between rounded-lg bg-ink p-6 text-white shadow-panel md:p-8">
          <html.div>
            <html.div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <UserRound size={24} color="#ffffff" aria-hidden />
            </html.div>
            <html.p className="text-sm font-semibold uppercase tracking-wide text-mint">IELTS Buddy AI</html.p>
            <html.h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Build a band plan that reacts to your skills.
            </html.h1>
            <html.p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Register once, complete a short diagnostic, and unlock a live roadmap with mock tutor feedback across
              Reading, Listening, Writing, and Speaking.
            </html.p>
          </html.div>

          <html.div className="mt-8 grid gap-3 sm:grid-cols-3">
            <html.div className="rounded-lg bg-white/10 p-4">
              <html.p className="text-2xl font-semibold">6</html.p>
              <html.p className="mt-1 text-sm text-slate-200">roadmap stages</html.p>
            </html.div>
            <html.div className="rounded-lg bg-white/10 p-4">
              <html.p className="text-2xl font-semibold">4</html.p>
              <html.p className="mt-1 text-sm text-slate-200">diagnostic skills</html.p>
            </html.div>
            <html.div className="rounded-lg bg-white/10 p-4">
              <html.p className="text-2xl font-semibold">24/7</html.p>
              <html.p className="mt-1 text-sm text-slate-200">Buddy tutor</html.p>
            </html.div>
          </html.div>
        </html.section>

        <Panel className="self-center p-5 md:p-7" ariaLabel="Registration form">
          <html.div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Start profile</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold text-ink">Registration</html.h2>
            </html.div>
            <TargetSummary />
          </html.div>

          <html.form
            aria-label="IELTS Buddy AI registration"
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Field label="Full name" icon={UserRound}>
              <html.input
                required
                value={form.fullName}
                onChange={(event) => updateText("fullName", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="Age">
              <html.input
                required
                inputMode="numeric"
                value={form.age}
                onChange={(event) => updateText("age", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="Country">
              <html.input
                required
                value={form.country}
                onChange={(event) => updateText("country", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="School">
              <html.input
                required
                value={form.school}
                onChange={(event) => updateText("school", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <html.input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateText("email", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <html.input
                required
                type="password"
                value={form.password}
                onChange={(event) => updateText("password", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <Field label="Current English level">
              <html.select
                value={form.currentLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, currentLevel: event.currentTarget.value as CEFRLevel }))
                }
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              >
                {levels.map((level) => (
                  <html.option key={level} value={level}>
                    {level}
                  </html.option>
                ))}
              </html.select>
            </Field>

            <Field label="Target band">
              <html.select
                value={form.targetBand}
                onChange={(event) => updateText("targetBand", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              >
                {targetBands.map((band) => (
                  <html.option key={band} value={band}>
                    {band}
                  </html.option>
                ))}
              </html.select>
            </Field>

            <Field label="Exam date" icon={CalendarDays}>
              <html.input
                required
                type="date"
                value={form.examDate}
                onChange={(event) => updateText("examDate", event.currentTarget.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
            </Field>

            <html.div className="flex items-end md:col-span-2">
              <html.button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ocean"
              >
                <html.span>Continue to diagnostic</html.span>
                <ArrowRight size={18} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.form>

          <html.div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="mint">Mock AI ready</Pill>
            <Pill tone="ocean">Expo Router</Pill>
            <Pill tone="violet">Responsive app</Pill>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}

interface FieldProps {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
}

function Field({ label, icon: Icon, children }: FieldProps) {
  return (
    <html.label className="block">
      <html.span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
        {Icon ? <Icon size={15} color="#526077" aria-hidden /> : null}
        <html.span>{label}</html.span>
      </html.span>
      {children}
    </html.label>
  );
}
