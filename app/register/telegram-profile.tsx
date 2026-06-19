import { router } from "expo-router";
import { useState } from "react";
import { Target, Sparkles, GraduationCap, ArrowRight } from "lucide-react-native";
import { html } from "@/lib/strictHtml";
import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, cn } from "@/components/ui";

const targetOptions = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const classOptions = [
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11" },
  { value: "12", label: "Grade 12" }
] as const;

export default function TelegramProfileRoute() {
  const registerForm = useBuddyStore((state) => state.registerForm);
  const user = useBuddyStore((state) => state.user);
  const registerUser = useBuddyStore((state) => state.registerUser);

  const [classLevel, setClassLevel] = useState<"9" | "10" | "11" | "12">(registerForm.classLevel || "11");
  const [targetBand, setTargetBand] = useState<number>(registerForm.targetBand || 7.0);
  const [aboutMe, setAboutMe] = useState(registerForm.aboutMe || "I need to pass IELTS for university application.");
  const [error, setError] = useState("");

  const handleComplete = () => {
    if (!aboutMe.trim()) {
      setError("Please write a short description of your IELTS preparation goals.");
      return;
    }

    const finalForm = {
      fullName: user.fullName || "Telegram User",
      classLevel,
      aboutMe: aboutMe.trim(),
      email: user.email || "telegram_user@t.me",
      password: "",
      confirmPassword: "",
      targetBand
    };

    // Complete registration
    registerUser(finalForm);
    router.push("/dashboard" as any);
  };

  return (
    <html.main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <html.div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <html.div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <html.div className="max-w-4xl w-full grid md:grid-cols-[0.85fr_1.15fr] gap-6 relative z-10">
        {/* Left Side: Welcome Panel */}
        <html.section className="flex flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
          <html.div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          
          <html.div className="space-y-6">
            <html.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles size={22} color="#ffffff" aria-hidden />
            </html.div>
            <html.div className="space-y-2">
              <html.p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Telegram Sign In</html.p>
              <html.h1 className="text-3xl font-black leading-tight">
                Welcome, <html.span className="text-indigo-400">{user.fullName.split(" ")[0] || "Candidate"}</html.span>!
              </html.h1>
            </html.div>
            
            {user.avatarUrl && (
              <html.div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <html.img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-12 w-12 rounded-full border border-white/20 bg-slate-800"
                />
                <html.div>
                  <html.p className="text-sm font-bold text-white">{user.fullName}</html.p>
                  <html.p className="text-xs text-slate-400">{user.email}</html.p>
                </html.div>
              </html.div>
            )}

            <html.p className="text-sm text-slate-300 leading-relaxed">
              We've successfully verified your Telegram account. Now, let's customize Buddy to your target scores and school level.
            </html.p>
          </html.div>
          
          <html.div className="pt-8 border-t border-white/10 mt-8">
            <html.div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <html.span>Setup Progress</html.span>
              <html.span>90%</html.span>
            </html.div>
            <html.div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <html.div className="h-full rounded-full bg-indigo-500 w-[90%]" />
            </html.div>
          </html.div>
        </html.section>

        {/* Right Side: Additional details form */}
        <Panel className="p-6 md:p-8 bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-3xl" ariaLabel="Telegram Additional Information Form">
          <html.div className="space-y-6">
            <html.div className="flex gap-3">
              <html.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Target size={20} />
              </html.div>
              <html.div>
                <html.h2 className="text-xl font-bold text-slate-900">Additional Information</html.h2>
                <html.p className="text-xs text-slate-500 mt-1">Configure your targets to shape your personalized study plan.</html.p>
              </html.div>
            </html.div>

            <html.div className="space-y-5">
              {/* Class Level Selector */}
              <html.div className="space-y-2">
                <html.span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap size={16} /> Grade Level
                </html.span>
                <html.div className="grid grid-cols-4 gap-2">
                  {classOptions.map((opt) => {
                    const isSelected = classLevel === opt.value;
                    return (
                      <html.button
                        key={opt.value}
                        type="button"
                        onClick={() => setClassLevel(opt.value)}
                        className={cn(
                          "py-3 px-1 rounded-xl border text-center text-xs font-bold transition-all",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/20"
                        )}
                      >
                        {opt.label}
                      </html.button>
                    );
                  })}
                </html.div>
              </html.div>

              {/* Target Band Selector */}
              <html.div className="space-y-2">
                <html.span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Target size={16} /> Target IELTS Band
                </html.span>
                <html.div className="grid grid-cols-4 gap-2">
                  {targetOptions.map((opt) => {
                    const isSelected = targetBand === opt;
                    return (
                      <html.button
                        key={opt}
                        type="button"
                        onClick={() => setTargetBand(opt)}
                        className={cn(
                          "py-3 rounded-xl border text-center text-xs font-bold transition-all",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/20"
                        )}
                      >
                        {opt.toFixed(1)}
                      </html.button>
                    );
                  })}
                </html.div>
              </html.div>

              {/* About Me / Goals Textarea */}
              <html.div className="space-y-2">
                <html.label htmlFor="about-me" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={16} /> Study Goals & Background
                </html.label>
                <html.textarea
                  id="about-me"
                  rows={3}
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.currentTarget.value)}
                  placeholder="Tell us what you're preparing for (e.g. university abroad, immigration, career upgrade)..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                />
              </html.div>

              {error && (
                <html.p className="text-xs font-semibold text-rose-500">{error}</html.p>
              )}
            </html.div>

            <html.div className="pt-4 border-t border-slate-200/50 flex justify-end">
              <html.button
                type="button"
                onClick={handleComplete}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-[0.98] px-6"
              >
                <html.span>Complete Setup</html.span>
                <ArrowRight size={16} color="#ffffff" aria-hidden />
              </html.button>
            </html.div>
          </html.div>
        </Panel>
      </html.div>
    </html.main>
  );
}
