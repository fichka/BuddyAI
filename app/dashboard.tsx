import { router } from "expo-router";
import { ArrowRight, CalendarDays, Flame, Send, Target, TrendingUp, Trophy } from "lucide-react-native";
import { useState } from "react";
import { html } from "@/lib/strictHtml";

import { AppShell, MetricCard, Panel, ProgressBar, RecommendationStrip, SectionTitle, TaskCheck } from "@/components/ui";
import { dailyRecommendations } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";

export default function DashboardRoute() {
  const user = useBuddyStore((state) => state.user);
  const readiness = useBuddyStore((state) => state.readiness);
  const dailyProgress = useBuddyStore((state) => state.dailyProgress);
  const streak = useBuddyStore((state) => state.streak);
  const roadmap = useBuddyStore((state) => state.roadmap);
  const chat = useBuddyStore((state) => state.chat);
  const sendBuddyMessage = useBuddyStore((state) => state.sendBuddyMessage);
  const [message, setMessage] = useState("Give me today's 30 minute plan");

  const bandGap = Math.max(0, user.targetBand - user.predictedBand);
  const nextTasks = roadmap.flatMap((stage) => stage.tasks.map((task) => ({ ...task, stage: stage.name }))).filter((task) => !task.completed).slice(0, 5);
  const latestBuddyMessage = [...chat].reverse().find((item) => item.role === "buddy");

  const submitMessage = () => {
    sendBuddyMessage(message);
    setMessage("");
  };

  return (
    <AppShell active="Dashboard">
      <html.div className="space-y-5">
        <RecommendationStrip />

        <html.section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="IELTS progress metrics">
          <MetricCard
            label="Predicted band"
            value={user.predictedBand.toFixed(1)}
            detail={`${bandGap.toFixed(1)} band gap to target ${user.targetBand.toFixed(1)}.`}
            icon={Trophy}
            tone="amber"
          />
          <MetricCard
            label="Readiness"
            value={`${readiness}%`}
            detail="Weighted from diagnostics, roadmap completion, and latest mock report."
            icon={Target}
            tone="mint"
          />
          <MetricCard
            label="Daily progress"
            value={`${dailyProgress}%`}
            detail="Completing tasks and Buddy drills increases today's progress."
            icon={TrendingUp}
            tone="ocean"
          />
          <MetricCard
            label="Study streak"
            value={`${streak}`}
            detail={`Exam date ${user.examDate}. Keep daily sessions short and consistent.`}
            icon={Flame}
            tone="coral"
          />
        </html.section>

        <html.section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" aria-label="Dashboard planning area">
          <Panel>
            <SectionTitle
              eyebrow="Roadmap pulse"
              title="This week needs focused execution"
              action={
                <html.a
                  href="/roadmap"
                  onClick={(event) => {
                    event.preventDefault();
                    router.push("/roadmap");
                  }}
                  className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-ink"
                >
                  <html.span>View plan</html.span>
                  <ArrowRight size={16} color="#172033" aria-hidden />
                </html.a>
              }
            />
            <html.div className="grid gap-4 md:grid-cols-2">
              {roadmap.slice(0, 4).map((stage) => (
                <html.div key={stage.id} className="rounded-lg border border-slate-200 p-4">
                  <html.div className="mb-3 flex items-center justify-between gap-3">
                    <html.div>
                      <html.p className="text-sm font-semibold text-ink">{stage.name}</html.p>
                      <html.p className="mt-1 text-xs text-slate-500">{stage.deadline}</html.p>
                    </html.div>
                    <html.span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean">
                      {stage.progress}%
                    </html.span>
                  </html.div>
                  <ProgressBar value={stage.progress} label={`${stage.name} progress`} tone="ocean" />
                  <html.p className="mt-3 text-sm leading-5 text-slate-600">{stage.focus}</html.p>
                </html.div>
              ))}
            </html.div>
          </Panel>

          <Panel ariaLabel="Buddy widget">
            <SectionTitle eyebrow="Buddy widget" title="Daily AI tutor check-in" />
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm leading-6 text-slate-700">
                {latestBuddyMessage?.content ?? dailyRecommendations[0]?.reason}
              </html.p>
              <html.div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays size={15} color="#526077" aria-hidden />
                <html.span>Updated from your mock history</html.span>
              </html.div>
            </html.div>

            <html.form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage();
              }}
            >
              <html.input
                aria-label="Ask Buddy"
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
                className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-ocean"
              />
              <html.button
                type="submit"
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white"
              >
                <Send size={16} color="#ffffff" aria-hidden />
                <html.span>Ask</html.span>
              </html.button>
            </html.form>
          </Panel>
        </html.section>

        <Panel ariaLabel="Next tasks">
          <SectionTitle eyebrow="Next actions" title="Small tasks with high band impact" />
          <html.div className="grid gap-3 lg:grid-cols-5">
            {nextTasks.map((task) => (
              <html.div key={task.id} className="rounded-lg border border-slate-200 p-3">
                <html.div className="mb-3 flex items-center justify-between gap-2">
                  <html.span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {task.stage}
                  </html.span>
                  <TaskCheck completed={task.completed} />
                </html.div>
                <html.p className="text-sm font-semibold leading-5 text-ink">{task.title}</html.p>
                <html.p className="mt-2 text-xs text-slate-500">{task.minutes} minutes</html.p>
              </html.div>
            ))}
          </html.div>
        </Panel>
      </html.div>
    </AppShell>
  );
}
