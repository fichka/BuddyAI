import { router } from "expo-router";
import { useState } from "react";
import { UserRound, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, cn } from "@/components/ui";
import { initiateTelegramAuth } from "@/lib/telegramOauth";

export default function RegisterNameRoute() {
  const registerForm = useBuddyStore((state) => state.registerForm);
  const setRegisterForm = useBuddyStore((state) => state.setRegisterForm);

  const [fullName, setFullName] = useState(registerForm.fullName || "");
  const [aboutMe, setAboutMe] = useState(registerForm.aboutMe || "");
  const [email, setEmail] = useState(registerForm.email || "");
  const [password, setPassword] = useState(registerForm.password || "");
  const [confirmPassword, setConfirmPassword] = useState(registerForm.confirmPassword || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!fullName.trim() || !aboutMe.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError("");
    setRegisterForm({
      fullName: fullName.trim(),
      aboutMe: aboutMe.trim(),
      email: email.trim(),
      password,
      confirmPassword
    });
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
              Create Your Account.
            </html.h1>
            <html.p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Setup your account credentials. Your diagnostic IELTS score is ready and will be linked to this account.
            </html.p>
          </html.div>
          <html.div className="mt-8">
            <html.div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
              <html.span>Onboarding progress</html.span>
              <html.span>50%</html.span>
            </html.div>
            <html.div className="h-2 overflow-hidden rounded-full bg-white/10">
              <html.div className="h-full rounded-full bg-mint w-1/2" />
            </html.div>
          </html.div>
        </html.section>

        <Panel className="self-center p-5 md:p-7" ariaLabel="Register name step">
          <html.div className="mb-6 flex gap-3">
            <html.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <UserRound size={22} color="#1b6b8f" aria-hidden />
            </html.div>
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Step 1 of 2</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold leading-8 text-ink">Account setup</html.h2>
              <html.p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Setup your credentials to access your personalized IELTS roadmap.
              </html.p>
            </html.div>
          </html.div>

          <html.form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="space-y-4"
          >
            <html.div className="rounded-lg bg-slate-50 p-4 md:p-6 space-y-4 flex flex-col justify-center">
              {/* Telegram Signup option */}
              <html.div className="pb-4 border-b border-slate-200">
                <html.p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-3">Or sign up instantly</html.p>
                <html.button
                  type="button"
                  onClick={() => initiateTelegramAuth()}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#24A1DE] text-sm font-bold text-white shadow-sm hover:bg-[#208ebd] transition transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <html.span className="text-lg">✈</html.span>
                  <html.span>Register with Telegram</html.span>
                </html.button>
              </html.div>

              <html.label className="block">
                <html.span className="mb-2 block text-sm font-semibold text-slate-600">Full Name</html.span>
                <html.input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.currentTarget.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
                />
              </html.label>

              <html.label className="block">
                <html.span className="mb-2 block text-sm font-semibold text-slate-600">About Me / Goals</html.span>
                <html.input
                  required
                  type="text"
                  placeholder="e.g. Preparing for study abroad in Canada"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.currentTarget.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
                />
              </html.label>

              <html.label className="block">
                <html.span className="mb-2 block text-sm font-semibold text-slate-600">Email Address</html.span>
                <html.input
                  required
                  autoFocus
                  type="email"
                  placeholder="e.g. email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
                />
              </html.label>

              <html.label className="block">
                <html.span className="mb-2 block text-sm font-semibold text-slate-600">Password</html.span>
                <html.input
                  required
                  type="password"
                  placeholder="Enter password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
                />
              </html.label>

              <html.label className="block">
                <html.span className="mb-2 block text-sm font-semibold text-slate-600">Confirm Password</html.span>
                <html.input
                  required
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
                />
              </html.label>

              {error ? (
                <html.p className="text-xs font-semibold text-coral">{error}</html.p>
              ) : null}
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
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ocean sm:min-w-56"
              >
                <html.span>Next Step</html.span>
                <ArrowRight size={18} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.form>

          <html.div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="mint">Step 1</Pill>
            <Pill tone="ocean">Credentials</Pill>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}
