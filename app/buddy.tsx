import { Bot, CalendarDays, GraduationCap, Send, Sparkles, Wand2 } from "lucide-react-native";
import { useState } from "react";
import { html } from "@/lib/strictHtml";

import { AppShell, Panel, Pill, ProgressBar, SectionTitle, cn } from "@/components/ui";
import { useBuddyStore } from "@/lib/store";

const quickPrompts = [
  "Explain conditionals for IELTS Writing",
  "Make a 7 day speaking plan",
  "How do I improve coherence?",
  "Give me a band 7 Task 2 thesis"
];

export default function BuddyRoute() {
  const user = useBuddyStore((state) => state.user);
  const chat = useBuddyStore((state) => state.chat);
  const readiness = useBuddyStore((state) => state.readiness);
  const diagnosticResult = useBuddyStore((state) => state.diagnosticResult);
  const sendBuddyMessage = useBuddyStore((state) => state.sendBuddyMessage);
  const [message, setMessage] = useState("");

  const submit = (text: string) => {
    sendBuddyMessage(text);
    setMessage("");
  };

  return (
    <AppShell active="Buddy">
      <html.div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <html.aside className="space-y-5">
          <Panel className="bg-ink text-white">
            <html.div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Bot size={24} color="#ffffff" aria-hidden />
            </html.div>
            <html.h2 className="mt-4 text-2xl font-semibold">Buddy remembers your IELTS profile</html.h2>
            <html.p className="mt-3 text-sm leading-6 text-slate-200">
              Current level {user.currentLevel}, predicted {user.predictedBand.toFixed(1)}, target{" "}
              {user.targetBand.toFixed(1)}. Responses adapt to your diagnostic summary.
            </html.p>
            <html.div className="mt-5">
              <ProgressBar value={readiness} label="Exam readiness" tone="mint" />
            </html.div>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Diagnostic memory" title="Current focus" />
            <html.p className="text-sm leading-6 text-slate-600">{diagnosticResult.summary}</html.p>
            <html.div className="mt-4 grid gap-2">
              {(["Reading", "Listening", "Writing", "Speaking"] as const).map((section) => (
                <html.div key={section} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <html.span className="text-sm font-semibold text-slate-600">{section}</html.span>
                  <html.span className="text-sm font-semibold text-ink">
                    {diagnosticResult.sectionScores[section].toFixed(1)}
                  </html.span>
                </html.div>
              ))}
            </html.div>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Quick requests" title="Ask in one tap" />
            <html.div className="grid gap-2">
              {quickPrompts.map((prompt) => (
                <html.button
                  key={prompt}
                  type="button"
                  onClick={() => submit(prompt)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 text-left text-sm font-semibold text-ink hover:bg-slate-100"
                >
                  <html.span>{prompt}</html.span>
                  <Wand2 size={16} color="#6f5bd8" aria-hidden />
                </html.button>
              ))}
            </html.div>
          </Panel>
        </html.aside>

        <Panel className="flex min-h-[680px] flex-col" ariaLabel="Buddy chat">
          <html.div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">AI Tutor</html.p>
              <html.h2 className="mt-1 text-2xl font-semibold text-ink">IELTS Buddy Chat</html.h2>
            </html.div>
            <html.div className="flex flex-wrap gap-2">
              <Pill tone="mint">Live mock state</Pill>
              <Pill tone="ocean">Grammar</Pill>
              <Pill tone="violet">Study plans</Pill>
            </html.div>
          </html.div>

          <html.div className="flex-1 space-y-3 overflow-hidden rounded-lg bg-slate-50 p-3">
            {chat.map((messageItem) => {
              const isUser = messageItem.role === "user";
              return (
                <html.div key={messageItem.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <html.div
                    className={cn(
                      "max-w-[88%] rounded-lg px-4 py-3 md:max-w-[72%]",
                      isUser ? "bg-ink text-white" : "bg-white text-slate-700 shadow-sm"
                    )}
                  >
                    <html.div className="mb-2 flex items-center gap-2">
                      {isUser ? (
                        <GraduationCap size={15} color="#ffffff" aria-hidden />
                      ) : (
                        <Sparkles size={15} color="#1b6b8f" aria-hidden />
                      )}
                      <html.span className={cn("text-xs font-semibold", isUser ? "text-slate-200" : "text-ocean")}>
                        {isUser ? user.fullName : "Buddy"}
                      </html.span>
                      <html.span className={cn("text-xs", isUser ? "text-slate-300" : "text-slate-400")}>
                        {messageItem.time}
                      </html.span>
                    </html.div>
                    <html.p className="text-sm leading-6">{messageItem.content}</html.p>
                  </html.div>
                </html.div>
              );
            })}
          </html.div>

          <html.form
            className="mt-4 flex flex-col gap-2 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              submit(message);
            }}
          >
            <html.input
              aria-label="Message Buddy"
              value={message}
              placeholder="Ask for grammar help, a study plan, or essay feedback"
              onChange={(event) => setMessage(event.currentTarget.value)}
              className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus:border-ocean"
            />
            <html.button
              type="submit"
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white"
            >
              <Send size={17} color="#ffffff" aria-hidden />
              <html.span>Send</html.span>
            </html.button>
          </html.form>

          <html.div className="mt-4 flex items-center gap-2 rounded-lg bg-mint/10 px-3 py-2 text-sm text-ink">
            <CalendarDays size={16} color="#36b37e" aria-hidden />
            <html.span>Buddy syncs with diagnostics, roadmap progress, writing feedback, and mock exam reports.</html.span>
          </html.div>
        </Panel>
      </html.div>
    </AppShell>
  );
}
