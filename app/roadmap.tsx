import { Clock, Route, Sparkles } from "lucide-react-native";
import { html } from "react-strict-dom";

import { AppShell, Panel, Pill, ProgressBar, SectionTitle, TaskCheck, cn } from "@/components/ui";
import { useBuddyStore } from "@/lib/store";

export default function RoadmapRoute() {
  const roadmap = useBuddyStore((state) => state.roadmap);
  const readiness = useBuddyStore((state) => state.readiness);
  const toggleTask = useBuddyStore((state) => state.toggleTask);

  const totalTasks = roadmap.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const completedTasks = roadmap.reduce((sum, stage) => sum + stage.tasks.filter((task) => task.completed).length, 0);

  return (
    <AppShell active="Roadmap">
      <html.div className="space-y-5">
        <Panel className="bg-white">
          <html.div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <html.div>
              <html.div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ocean/10">
                <Route size={24} color="#1b6b8f" aria-hidden />
              </html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Adaptive IELTS roadmap</html.p>
              <html.h2 className="mt-2 text-3xl font-semibold text-ink">Six stages from fundamentals to final exam</html.h2>
              <html.p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Each task is short enough for daily practice and mapped to your diagnostic result. Completing tasks updates
                dashboard readiness immediately.
              </html.p>
            </html.div>
            <html.div className="rounded-lg bg-cloud p-4">
              <html.div className="mb-4 flex flex-wrap gap-2">
                <Pill tone="mint">{completedTasks}/{totalTasks} tasks done</Pill>
                <Pill tone="ocean">{readiness}% ready</Pill>
                <Pill tone="amber">6 week plan</Pill>
              </html.div>
              <ProgressBar value={(completedTasks / totalTasks) * 100} label="Total roadmap completion" tone="mint" />
            </html.div>
          </html.div>
        </Panel>

        <html.section className="grid gap-4 lg:grid-cols-2" aria-label="Six stage IELTS roadmap">
          {roadmap.map((stage, index) => (
            <Panel key={stage.id} className="relative overflow-hidden">
              <html.div className="absolute right-4 top-4 hidden text-7xl font-semibold text-slate-100 md:block">
                {String(index + 1).padStart(2, "0")}
              </html.div>
              <html.div className="relative">
                <html.div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <html.div>
                    <html.div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-ink">
                      <Sparkles size={20} color="#ffffff" aria-hidden />
                    </html.div>
                    <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean">{stage.deadline}</html.p>
                    <html.h3 className="mt-1 text-2xl font-semibold text-ink">{stage.name}</html.h3>
                    <html.p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{stage.focus}</html.p>
                  </html.div>
                  <Pill tone={stage.progress >= 70 ? "mint" : stage.progress >= 40 ? "amber" : "coral"}>
                    {stage.progress}% complete
                  </Pill>
                </html.div>

                <ProgressBar value={stage.progress} label={`${stage.name} completion`} tone={stage.progress >= 70 ? "mint" : "ocean"} />

                <html.div className="mt-4 grid gap-2">
                  {stage.tasks.map((task) => (
                    <html.button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(stage.id, task.id)}
                      className={cn(
                        "flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 text-left transition",
                        task.completed
                          ? "border-mint/30 bg-mint/10 text-ink"
                          : "border-slate-200 bg-white text-slate-700 hover:border-ocean"
                      )}
                    >
                      <html.span className="flex items-center gap-3">
                        <TaskCheck completed={task.completed} />
                        <html.span className="text-sm font-semibold leading-5">{task.title}</html.span>
                      </html.span>
                      <html.span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock size={14} color="#64748b" aria-hidden />
                        <html.span>{task.minutes}m</html.span>
                      </html.span>
                    </html.button>
                  ))}
                </html.div>
              </html.div>
            </Panel>
          ))}
        </html.section>

        <Panel>
          <SectionTitle eyebrow="Deadline logic" title="How Buddy sequences the plan" />
          <html.div className="grid gap-3 md:grid-cols-3">
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Foundation first</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">
                Grammar and vocabulary unlock clearer Writing and Speaking responses.
              </html.p>
            </html.div>
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Skill loops</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">
                Each practice task feeds back into the dashboard and Buddy recommendations.
              </html.p>
            </html.div>
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Exam finish</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">
                Final stage emphasizes timing, endurance, and post-exam report review.
              </html.p>
            </html.div>
          </html.div>
        </Panel>
      </html.div>
    </AppShell>
  );
}
