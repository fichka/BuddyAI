import { BookOpen, Film, Headphones, Star, Tv } from "lucide-react-native";
import { useMemo, useState } from "react";
import { html } from "@/lib/strictHtml";

import { AppShell, Panel, Pill, ProgressBar, SectionTitle, cn } from "@/components/ui";
import { learnRecommendations } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";
import type { LearnRecommendation } from "@/lib/types";

const categories: Array<LearnRecommendation["category"] | "All"> = ["All", "TV Show", "Movie", "Podcast", "Book"];

const categoryIcons: Record<LearnRecommendation["category"], typeof Tv> = {
  "TV Show": Tv,
  Movie: Film,
  Podcast: Headphones,
  Book: BookOpen
};

export default function LearnRoute() {
  const user = useBuddyStore((state) => state.user);
  const dailyProgress = useBuddyStore((state) => state.dailyProgress);
  const [category, setCategory] = useState<LearnRecommendation["category"] | "All">("All");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const recommendations = useMemo(
    () =>
      learnRecommendations.filter((item) => {
        const categoryMatch = category === "All" || item.category === category;
        const levelMatch = item.level === user.currentLevel || item.level === "B1" || item.level === "B2";
        return categoryMatch && levelMatch;
      }),
    [category, user.currentLevel]
  );

  const toggleComplete = (id: string) => {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AppShell active="Learn">
      <html.div className="space-y-5">
        <Panel className="bg-white">
          <html.div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <html.div>
              <html.p className="text-sm font-semibold uppercase tracking-wide text-ocean">Learn beyond drills</html.p>
              <html.h2 className="mt-1 text-3xl font-semibold text-ink">Media recommendations for IELTS input</html.h2>
              <html.p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Buddy recommends TV shows, movies, podcasts, and books that match your level and build speaking,
                listening, vocabulary, and Task 2 examples.
              </html.p>
            </html.div>
            <html.div className="rounded-lg bg-cloud p-4">
              <html.div className="mb-4 flex flex-wrap gap-2">
                <Pill tone="ocean">Current level {user.currentLevel}</Pill>
                <Pill tone="mint">{completedIds.size} weekly tasks done</Pill>
              </html.div>
              <ProgressBar value={dailyProgress} label="Daily learning progress" tone="violet" />
            </html.div>
          </html.div>
        </Panel>

        <Panel>
          <html.div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionTitle eyebrow="Library" title="Pick your input source" />
            <html.div className="flex flex-wrap gap-2" role="tablist" aria-label="Learning categories">
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <html.button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "min-h-10 rounded-lg px-3 text-sm font-semibold",
                      selected ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item}
                  </html.button>
                );
              })}
            </html.div>
          </html.div>

          <html.div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item) => {
              const Icon = categoryIcons[item.category];
              const completed = completedIds.has(item.id);
              return (
                <html.article key={item.id} className="flex min-h-72 flex-col rounded-lg border border-slate-200 bg-white p-4">
                  <html.div className="mb-4 flex items-start justify-between gap-3">
                    <html.div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean/10">
                      <Icon size={20} color="#1b6b8f" aria-hidden />
                    </html.div>
                    <Pill tone={completed ? "mint" : "slate"}>{completed ? "Done" : item.level}</Pill>
                  </html.div>
                  <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean">{item.category}</html.p>
                  <html.h3 className="mt-1 text-xl font-semibold text-ink">{item.title}</html.h3>
                  <html.p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.reason}</html.p>
                  <html.div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <html.p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly task</html.p>
                    <html.p className="mt-2 text-sm leading-5 text-ink">{item.weeklyTask}</html.p>
                  </html.div>
                  <html.button
                    type="button"
                    onClick={() => toggleComplete(item.id)}
                    className={cn(
                      "mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
                      completed ? "bg-mint text-white" : "bg-ink text-white"
                    )}
                  >
                    <Star size={17} color="#ffffff" aria-hidden />
                    <html.span>{completed ? "Marked complete" : "Add to this week"}</html.span>
                  </html.button>
                </html.article>
              );
            })}
          </html.div>
        </Panel>

        <Panel>
          <SectionTitle eyebrow="Input strategy" title="How to turn entertainment into IELTS practice" />
          <html.div className="grid gap-3 md:grid-cols-4">
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Watch once</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">Understand the gist without subtitles.</html.p>
            </html.div>
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Watch again</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">Collect useful expressions and collocations.</html.p>
            </html.div>
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Speak it</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">Retell the scene as a Part 2 response.</html.p>
            </html.div>
            <html.div className="rounded-lg bg-slate-50 p-4">
              <html.p className="text-sm font-semibold text-ink">Write it</html.p>
              <html.p className="mt-2 text-sm leading-6 text-slate-600">Use one idea as a Task 2 example.</html.p>
            </html.div>
          </html.div>
        </Panel>
      </html.div>
    </AppShell>
  );
}
