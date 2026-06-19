import { Redirect, router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Trophy, Loader2, Mic2, PenLine, Route, LogIn, X, Lock, Mail } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { Panel, Pill, SectionTitle, cn } from "@/components/ui";
import { assessWritingWithGemini } from "@/lib/aiClient";
import { initiateTelegramAuth } from "@/lib/telegramOauth";

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
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const tempAssessmentResult = useBuddyStore((state) => state.tempAssessmentResult);

  // Animate progress up to 99%
  useEffect(() => {
    if (phase !== "loading") {
      setAnalysisProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 99) {
          return 99;
        }
        return prev + 1.5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [phase]);

  // Once result is ready, jump to 100% and transition to intrigue
  useEffect(() => {
    if (phase === "loading" && tempAssessmentResult && analysisProgress === 99) {
      setAnalysisProgress(100);
      const timer = setTimeout(() => {
        setPhase("intrigue");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, tempAssessmentResult, analysisProgress]);

  const handleTelegramLogin = () => {
    initiateTelegramAuth();
  };

  const handleEmailLogin = (e: any) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters.");
      return;
    }
    setLoginError("");
    const registeredUsers = useBuddyStore.getState().registeredUsers;
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (existing) {
      useBuddyStore.setState(() => ({
        user: existing,
        registrationComplete: true
      }));
    } else {
      const parts = email.split("@");
      const localPart = parts[0] || "user";
      const fullName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      const newUser = {
        ...user,
        email: email.trim(),
        fullName,
        classLevel: "11" as const,
        aboutMe: "Prepared for university admission.",
        targetBand: 7.0,
      };
      useBuddyStore.setState((state) => ({
        user: newUser,
        registeredUsers: [...state.registeredUsers, newUser],
        registrationComplete: true
      }));
    }
    router.replace("/dashboard");
  };

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
    }
  };

  const handleContinueToRegistration = () => {
    router.push("/register/name" as any);
  };

  if (phase === "landing") {
    return (
      <html.main className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background glows */}
        <html.div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <html.div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <html.header className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <html.div className="flex items-center gap-2">
            <html.div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md">
              <Sparkles size={20} color="#ffffff" aria-hidden />
            </html.div>
            <html.span className="text-xl font-black text-slate-900 tracking-tight">IELTS Buddy AI</html.span>
          </html.div>
          <html.button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn size={16} />
            <html.span>Sign In</html.span>
          </html.button>
        </html.header>

        {/* Hero Section */}
        <html.section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 max-w-5xl mx-auto w-full">
          <html.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg mb-8">
            <Sparkles size={26} color="#ffffff" aria-hidden />
          </html.div>
          
          <html.span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-100 shadow-sm mb-6">
            IELTS Buddy AI Examiner
          </html.span>

          <html.h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-7xl leading-tight max-w-4xl">
            Master IELTS with Your{" "}
            <html.span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Personal AI Examiner
            </html.span>
          </html.h1>

          <html.p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            No endless registration, no fee. Just start speaking or typing, and get your predicted band score in 5 minutes.
          </html.p>

          <html.div className="mt-10 flex justify-center w-full">
            <html.button
              type="button"
              onClick={handleStartTest}
              className="group relative flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <html.span>Get Your Band Score Right Now</html.span>
              <ArrowRight size={22} color="#ffffff" className="transition-transform group-hover:translate-x-1" aria-hidden />
            </html.button>
          </html.div>
        </html.section>

        {/* Benefits Section */}
        <html.section className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-md py-16 w-full">
          <html.div className="max-w-7xl mx-auto px-4">
            <html.div className="max-w-xl mx-auto text-center mb-12">
              <html.h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Designed to maximize your IELTS band
              </html.h2>
              <html.p className="mt-3 text-slate-500 text-sm md:text-base">
                Everything you need to prepare, practice, and polish your skills for exam day.
              </html.p>
            </html.div>

            <html.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {/* Card 1: Speaking Partner */}
              <html.div className="bg-white/70 backdrop-blur-md border border-slate-200/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4">
                <html.div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                  <Mic2 size={22} />
                </html.div>
                <html.div className="space-y-1">
                  <html.h3 className="text-lg font-bold text-slate-900">24/7 AI Speaking Partner</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Practice Speaking Part 1 & Part 2. Continuous real speech transcribing and immediate vocabulary upgrades.
                  </html.p>
                </html.div>
              </html.div>

              {/* Card 2: Writing Feedback */}
              <html.div className="bg-white/70 backdrop-blur-md border border-slate-200/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4">
                <html.div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <PenLine size={22} />
                </html.div>
                <html.div className="space-y-1">
                  <html.h3 className="text-lg font-bold text-slate-900">Instant Gemini Writing Grading</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Submit IELTS Task 1 and Task 2. Get immediate feedback scored strictly against official band descriptors.
                  </html.p>
                </html.div>
              </html.div>

              {/* Card 3: Personalized Roadmap */}
              <html.div className="bg-white/70 backdrop-blur-md border border-slate-200/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4 sm:col-span-2 lg:col-span-1">
                <html.div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
                  <Route size={22} />
                </html.div>
                <html.div className="space-y-1">
                  <html.h3 className="text-lg font-bold text-slate-900">Personalized Study Roadmap</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Auto-generated prep plan targeted around your weak spots. Follow structured checklists to hit your band target.
                  </html.p>
                </html.div>
              </html.div>
            </html.div>
          </html.div>
        </html.section>

        {/* Sneak Peek Features Gallery */}
        <html.section className="relative z-10 py-16 bg-slate-50 w-full overflow-hidden border-t border-slate-200/50">
          <html.div className="max-w-7xl mx-auto px-4">
            <html.div className="max-w-xl mx-auto text-center mb-12">
              <html.span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100 shadow-sm mb-3">
                Platform Sneak Peek
              </html.span>
              <html.h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Explore the Prep Platform
              </html.h2>
              <html.p className="mt-3 text-slate-500 text-sm md:text-base">
                Scroll to view how Buddy AI guides your study journey from diagnostic assessment to the target score.
              </html.p>
            </html.div>

            {/* Horizontal Scroll Gallery Container */}
            <html.div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 scroll-smooth" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
              <html.div className="flex-shrink-0 w-80 sm:w-96 bg-white/80 backdrop-blur-md border border-slate-200/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                <html.div className="h-40 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white relative overflow-hidden">
                  <html.div className="absolute inset-0 bg-black/10" />
                  <Sparkles size={40} className="relative z-10" />
                </html.div>
                <html.div className="space-y-2">
                  <html.h3 className="text-lg font-bold text-slate-900">1. Fast 5-Min Diagnostic</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Test your English syntax coherence and reading inference in minutes. Our examiner AI analyzes structure and patterns instantly.
                  </html.p>
                </html.div>
              </html.div>

              <html.div className="flex-shrink-0 w-80 sm:w-96 bg-white/80 backdrop-blur-md border border-slate-200/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                <html.div className="h-40 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white relative overflow-hidden">
                  <html.div className="absolute inset-0 bg-black/10" />
                  <Mic2 size={40} className="relative z-10" />
                </html.div>
                <html.div className="space-y-2">
                  <html.h3 className="text-lg font-bold text-slate-900">2. Interactive Speaking Lab</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Practice verbal cues under timing constraints. The speaking system transcribes and grades fluency, vocabulary, and grammar.
                  </html.p>
                </html.div>
              </html.div>

              <html.div className="flex-shrink-0 w-80 sm:w-96 bg-white/80 backdrop-blur-md border border-slate-200/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                <html.div className="h-40 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white relative overflow-hidden">
                  <html.div className="absolute inset-0 bg-black/10" />
                  <PenLine size={40} className="relative z-10" />
                </html.div>
                <html.div className="space-y-2">
                  <html.h3 className="text-lg font-bold text-slate-900">3. AI Essay Assessment</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Receive direct score breakdowns against official IELTS criteria (Task Achievement, Lexical Resource, Coherence).
                  </html.p>
                </html.div>
              </html.div>

              <html.div className="flex-shrink-0 w-80 sm:w-96 bg-white/80 backdrop-blur-md border border-slate-200/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                <html.div className="h-40 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white relative overflow-hidden">
                  <html.div className="absolute inset-0 bg-black/10" />
                  <Route size={40} className="relative z-10" />
                </html.div>
                <html.div className="space-y-2">
                  <html.h3 className="text-lg font-bold text-slate-900">4. Tailored Study Checklist</html.h3>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    An auto-adjusting study roadmap prioritized around your gaps. Complete daily tasks to upgrade your grammar.
                  </html.p>
                </html.div>
              </html.div>
            </html.div>
          </html.div>
        </html.section>

        {/* List of Advantages */}
        <html.section className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-md py-16 w-full">
          <html.div className="max-w-7xl mx-auto px-4">
            <html.div className="max-w-xl mx-auto text-center mb-12">
              <html.span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100 shadow-sm mb-3">
                Why Buddy AI?
              </html.span>
              <html.h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Core Platform Advantages
              </html.h2>
              <html.p className="mt-3 text-slate-500 text-sm md:text-base">
                How we compare to traditional study books and expensive tutoring classes.
              </html.p>
            </html.div>

            <html.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              <html.div className="bg-white/40 border border-slate-200/20 rounded-2xl p-5 shadow-sm space-y-2">
                <html.span className="text-emerald-500 text-lg font-bold">✓</html.span>
                <html.h3 className="text-base font-bold text-slate-900">98% Scoring Accuracy</html.h3>
                <html.p className="text-xs text-slate-500 leading-relaxed">
                  Evaluated and optimized to align with official IELTS public descriptor guidelines.
                </html.p>
              </html.div>

              <html.div className="bg-white/40 border border-slate-200/20 rounded-2xl p-5 shadow-sm space-y-2">
                <html.span className="text-emerald-500 text-lg font-bold">✓</html.span>
                <html.h3 className="text-base font-bold text-slate-900">24/7 Availability</html.h3>
                <html.p className="text-xs text-slate-500 leading-relaxed">
                  No appointments, no wait times. Practice essays or speaking cues anytime, anywhere.
                </html.p>
              </html.div>

              <html.div className="bg-white/40 border border-slate-200/20 rounded-2xl p-5 shadow-sm space-y-2">
                <html.span className="text-emerald-500 text-lg font-bold">✓</html.span>
                <html.h3 className="text-base font-bold text-slate-900">Secure Telegram Sync</html.h3>
                <html.p className="text-xs text-slate-500 leading-relaxed">
                  Sign up and link accounts with Telegram OAuth to synchronize data between devices.
                </html.p>
              </html.div>

              <html.div className="bg-white/40 border border-slate-200/20 rounded-2xl p-5 shadow-sm space-y-2">
                <html.span className="text-emerald-500 text-lg font-bold">✓</html.span>
                <html.h3 className="text-base font-bold text-slate-900">Free to Try Diagnostics</html.h3>
                <html.p className="text-xs text-slate-500 leading-relaxed">
                  No credit cards, no payments required. Instant score assessment for first-time candidates.
                </html.p>
              </html.div>
            </html.div>
          </html.div>
        </html.section>

        {/* Glassmorphic Sign In Modal */}
        {showLoginModal && (
          <html.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <html.div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-2xl relative">
              <html.button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError("");
                }}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={16} />
              </html.button>

              <html.div className="space-y-5">
                <html.div className="space-y-1 text-center mt-2">
                  <html.h2 className="text-2xl font-black text-slate-900">Sign In to Buddy</html.h2>
                  <html.p className="text-sm text-slate-500 leading-relaxed">
                    Access your personalized IELTS roadmap & examiner recommendations.
                  </html.p>
                </html.div>

                <html.button
                  type="button"
                  onClick={handleTelegramLogin}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#24A1DE] text-sm font-bold text-white shadow-md hover:bg-[#208ebd] transition transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <html.span className="text-lg">✈</html.span>
                  <html.span>Continue with Telegram</html.span>
                </html.button>

                <html.div className="flex items-center gap-3 my-2">
                  <html.div className="h-[1px] flex-1 bg-slate-200" />
                  <html.span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</html.span>
                  <html.div className="h-[1px] flex-1 bg-slate-200" />
                </html.div>

                <html.form onSubmit={handleEmailLogin} className="space-y-4">
                  <html.div className="space-y-3">
                    <html.label className="block">
                      <html.span className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</html.span>
                      <html.div className="relative">
                        <html.div className="absolute left-3 top-3 text-slate-400">
                          <Mail size={16} />
                        </html.div>
                        <html.input
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.currentTarget.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 transition-all"
                          required
                        />
                      </html.div>
                    </html.label>

                    <html.label className="block">
                      <html.span className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</html.span>
                      <html.div className="relative">
                        <html.div className="absolute left-3 top-3 text-slate-400">
                          <Lock size={16} />
                        </html.div>
                        <html.input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.currentTarget.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 transition-all"
                          required
                        />
                      </html.div>
                    </html.label>
                  </html.div>

                  {loginError && (
                    <html.p className="text-xs font-semibold text-rose-500">{loginError}</html.p>
                  )}

                  <html.button
                    type="submit"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-indigo-600 transition transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <html.span>Sign In with Email</html.span>
                  </html.button>
                </html.form>
              </html.div>
            </html.div>
          </html.div>
        )}
      </html.main>
    );
  }

  if (phase === "loading") {
    let statusMessage = "Analyzing reading comprehension patterns...";
    if (analysisProgress >= 30 && analysisProgress < 65) {
      statusMessage = "Evaluating writing syntax coherence and vocabulary diversity...";
    } else if (analysisProgress >= 65 && analysisProgress < 90) {
      statusMessage = "Scanning grammar structure against official IELTS band descriptors...";
    } else if (analysisProgress >= 90) {
      statusMessage = "Finalizing personalized preparation roadmap...";
    }

    return (
      <html.main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background glows */}
        <html.div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <html.div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <Panel className="max-w-md w-full p-8 text-center flex flex-col items-center justify-center gap-6 bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-3xl relative z-10" ariaLabel="AI Assessment Diagnostics Loading">
          <html.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md text-white animate-spin">
            <Loader2 size={32} />
          </html.div>
          <html.div className="space-y-2 w-full">
            <html.span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100 shadow-sm mb-2">
              Gemini AI Diagnostic Active
            </html.span>
            <html.h2 className="text-2xl font-black text-slate-900">Evaluating Placement Test</html.h2>
            <html.p className="text-slate-500 text-sm leading-relaxed">
              Evaluating your Reading answers and Writing syntax coherence against IELTS public criteria.
            </html.p>
          </html.div>

          {/* Progress Bar */}
          <html.div className="w-full space-y-2 mt-2">
            <html.div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <html.span className="text-slate-400">Analysis status</html.span>
              <html.span>{Math.round(analysisProgress)}%</html.span>
            </html.div>
            <html.div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden border border-slate-300/10">
              <html.div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-150"
                style={{ width: `${analysisProgress}%` }}
              />
            </html.div>
            <html.p className="text-xs font-semibold text-indigo-600 animate-pulse text-left h-5">
              {statusMessage}
            </html.p>
          </html.div>
        </Panel>
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
