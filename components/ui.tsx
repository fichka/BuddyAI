import { router } from "expo-router";
import {
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  GraduationCap,
  LayoutDashboard,
  type LucideIcon,
  MessageCircle,
  Route,
  Sparkles,
  Target,
  Trophy
} from "lucide-react-native";
import type { ReactNode } from "react";
import { html } from "react-strict-dom";

import { dailyRecommendations } from "@/lib/mockData";
import { useBuddyStore } from "@/lib/store";

export type MainRoute = "Dashboard" | "Roadmap" | "Practice" | "Buddy" | "Learn";

interface NavItem {
  label: MainRoute;
  href: "/dashboard" | "/roadmap" | "/practice" | "/buddy" | "/learn";
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Roadmap", href: "/roadmap", icon: Route },
  { label: "Practice", href: "/practice", icon: GraduationCap },
  { label: "Buddy", href: "/buddy", icon: Bot },
  { label: "Learn", href: "/learn", icon: BookOpen }
];

const routeDescriptions: Record<MainRoute, string> = {
  Dashboard: "Your IELTS command center",
  Roadmap: "Six week band growth plan",
  Practice: "Mock tasks and AI grading",
  Buddy: "Persistent IELTS tutor",
  Learn: "Media picks for your level"
};

export const cn = (...classes: Array<string | false | undefined>): string => classes.filter(Boolean).join(" ");

export const progressWidthClass = (value: number): string => {
  if (value >= 96) return "w-full";
  if (value >= 88) return "w-11/12";
  if (value >= 80) return "w-10/12";
  if (value >= 72) return "w-9/12";
  if (value >= 64) return "w-8/12";
  if (value >= 56) return "w-7/12";
  if (value >= 48) return "w-6/12";
  if (value >= 40) return "w-5/12";
  if (value >= 32) return "w-4/12";
  if (value >= 24) return "w-3/12";
  if (value >= 16) return "w-2/12";
  if (value > 0) return "w-1/12";
  return "w-0";
};

export const barHeightClass = (value: number): string => {
  if (value >= 72) return "h-16";
  if (value >= 64) return "h-14";
  if (value >= 56) return "h-12";
  if (value >= 48) return "h-10";
  if (value >= 40) return "h-8";
  if (value >= 32) return "h-7";
  return "h-5";
};

interface AppShellProps {
  active: MainRoute;
  children: ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  const user = useBuddyStore((state) => state.user);
  const streak = useBuddyStore((state) => state.streak);
  const readiness = useBuddyStore((state) => state.readiness);

  return (
    <html.div className="min-h-screen bg-cloud">
      <html.div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <html.aside
          aria-label="Primary"
          className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 md:flex md:flex-col"
        >
          <html.div className="mb-8 flex items-center gap-3">
            <html.div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink">
              <Sparkles size={22} color="#ffffff" aria-hidden />
            </html.div>
            <html.div>
              <html.h1 className="text-lg font-semibold text-ink">IELTS Buddy AI</html.h1>
              <html.p className="text-sm text-slate-500">Band growth cockpit</html.p>
            </html.div>
          </html.div>

          <html.nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = item.label === active;
              return (
                <html.a
                  key={item.href}
                  href={item.href}
                  aria-current={selected ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(item.href);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition",
                    selected
                      ? "bg-ink text-white shadow-panel"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  )}
                >
                  <Icon size={18} color={selected ? "#ffffff" : "#526077"} aria-hidden />
                  <html.span>{item.label}</html.span>
                </html.a>
              );
            })}
          </html.nav>

          <html.div className="rounded-lg border border-slate-200 bg-cloud p-4">
            <html.div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Trophy size={17} color="#f4b740" aria-hidden />
              <html.span>Target {user.targetBand.toFixed(1)}</html.span>
            </html.div>
            <ProgressBar value={readiness} tone="mint" label="Readiness" />
            <html.p className="mt-3 text-xs leading-5 text-slate-500">
              {streak} day streak. Exam date: {user.examDate}.
            </html.p>
          </html.div>
        </html.aside>

        <html.main className="flex min-h-screen flex-1 flex-col pb-24 md:pb-0">
          <html.header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 md:static md:bg-transparent md:px-8 md:py-7">
            <html.div className="flex items-center justify-between gap-4">
              <html.div>
                <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                  {routeDescriptions[active]}
                </html.p>
                <html.h2 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">{active}</html.h2>
              </html.div>
              <html.div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 md:flex">
                <html.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/15">
                  <Flame size={18} color="#36b37e" aria-hidden />
                </html.div>
                <html.div>
                  <html.p className="text-sm font-semibold text-ink">{user.fullName}</html.p>
                  <html.p className="text-xs text-slate-500">
                    Predicted {user.predictedBand.toFixed(1)} / Target {user.targetBand.toFixed(1)}
                  </html.p>
                </html.div>
              </html.div>
            </html.div>
          </html.header>

          <html.div className="flex-1 px-4 py-5 md:px-8 md:pb-10 md:pt-0">{children}</html.div>
        </html.main>
      </html.div>

      <html.nav
        aria-label="Mobile primary"
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-2 py-2 md:hidden"
      >
        <html.div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = item.label === active;
            return (
              <html.a
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                aria-label={item.label}
                onClick={(event) => {
                  event.preventDefault();
                  router.push(item.href);
                }}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium",
                  selected ? "bg-ink text-white" : "text-slate-500"
                )}
              >
                <Icon size={18} color={selected ? "#ffffff" : "#526077"} aria-hidden />
                <html.span>{item.label}</html.span>
              </html.a>
            );
          })}
        </html.div>
      </html.nav>
    </html.div>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function Panel({ children, className, ariaLabel }: PanelProps) {
  return (
    <html.section aria-label={ariaLabel} className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5", className)}>
      {children}
    </html.section>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "ocean" | "mint" | "coral" | "amber" | "violet" | "ink";
}

const toneClass: Record<MetricCardProps["tone"], string> = {
  ocean: "bg-ocean/10",
  mint: "bg-mint/10",
  coral: "bg-coral/10",
  amber: "bg-amber/15",
  violet: "bg-violet/10",
  ink: "bg-ink/10"
};

const toneColor: Record<MetricCardProps["tone"], string> = {
  ocean: "#1b6b8f",
  mint: "#36b37e",
  coral: "#ff6b4a",
  amber: "#f4b740",
  violet: "#6f5bd8",
  ink: "#172033"
};

export function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <Panel className="min-h-36">
      <html.div className="flex items-start justify-between gap-4">
        <html.div>
          <html.p className="text-sm font-medium text-slate-500">{label}</html.p>
          <html.p className="mt-2 text-3xl font-semibold text-ink">{value}</html.p>
        </html.div>
        <html.div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClass[tone])}>
          <Icon size={21} color={toneColor[tone]} aria-hidden />
        </html.div>
      </html.div>
      <html.p className="mt-4 text-sm leading-5 text-slate-600">{detail}</html.p>
    </Panel>
  );
}

interface ProgressBarProps {
  value: number;
  label: string;
  tone?: "mint" | "ocean" | "coral" | "amber" | "violet";
}

const progressTone: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  mint: "bg-mint",
  ocean: "bg-ocean",
  coral: "bg-coral",
  amber: "bg-amber",
  violet: "bg-violet"
};

export function ProgressBar({ value, label, tone = "ocean" }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <html.div aria-label={`${label}: ${normalized}%`}>
      <html.div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <html.span>{label}</html.span>
        <html.span>{normalized}%</html.span>
      </html.div>
      <html.div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
        className="h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <html.div className={cn("h-full rounded-full", progressTone[tone], progressWidthClass(normalized))} />
      </html.div>
    </html.div>
  );
}

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}

export function SectionTitle({ eyebrow, title, action }: SectionTitleProps) {
  return (
    <html.div className="mb-4 flex items-end justify-between gap-4">
      <html.div>
        <html.p className="text-xs font-semibold uppercase tracking-wide text-ocean">{eyebrow}</html.p>
        <html.h3 className="mt-1 text-xl font-semibold text-ink">{title}</html.h3>
      </html.div>
      {action}
    </html.div>
  );
}

interface PillProps {
  children: ReactNode;
  tone?: "slate" | "mint" | "ocean" | "coral" | "amber" | "violet";
}

const pillTone: Record<NonNullable<PillProps["tone"]>, string> = {
  slate: "bg-slate-100 text-slate-600",
  mint: "bg-mint/10 text-mint",
  ocean: "bg-ocean/10 text-ocean",
  coral: "bg-coral/10 text-coral",
  amber: "bg-amber/15 text-amber",
  violet: "bg-violet/10 text-violet"
};

export function Pill({ children, tone = "slate" }: PillProps) {
  return <html.span className={cn("rounded-full px-3 py-1 text-xs font-semibold", pillTone[tone])}>{children}</html.span>;
}

interface WaveformProps {
  values: number[];
  tone?: "ocean" | "mint" | "coral" | "violet";
  label: string;
}

const waveformTone: Record<NonNullable<WaveformProps["tone"]>, string> = {
  ocean: "bg-ocean",
  mint: "bg-mint",
  coral: "bg-coral",
  violet: "bg-violet"
};

export function Waveform({ values, tone = "ocean", label }: WaveformProps) {
  return (
    <html.div aria-label={label} className="flex h-20 items-center gap-1 rounded-lg bg-slate-50 px-3">
      {values.map((value, index) => (
        <html.span
          key={`${value}-${index}`}
          className={cn("w-2 rounded-full opacity-80", waveformTone[tone], barHeightClass(value))}
        />
      ))}
    </html.div>
  );
}

interface TaskCheckProps {
  completed: boolean;
}

export function TaskCheck({ completed }: TaskCheckProps) {
  return completed ? (
    <CheckCircle2 size={18} color="#36b37e" aria-label="Completed" />
  ) : (
    <Circle size={18} color="#94a3b8" aria-label="Not completed" />
  );
}

export function RecommendationStrip() {
  const activeRecommendationId = useBuddyStore((state) => state.activeRecommendationId);
  const rotateRecommendation = useBuddyStore((state) => state.rotateRecommendation);
  const recommendation = dailyRecommendations.find((item) => item.id === activeRecommendationId) ?? dailyRecommendations[0];

  if (!recommendation) {
    return null;
  }

  return (
    <Panel className="bg-ink text-white" ariaLabel="Daily Buddy recommendation">
      <html.div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <html.div className="flex gap-3">
            <html.div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <MessageCircle size={20} color="#ffffff" aria-hidden />
          </html.div>
          <html.div>
            <html.p className="text-sm font-semibold text-white">{recommendation.title}</html.p>
            <html.p className="mt-1 text-sm leading-5 text-slate-200">{recommendation.reason}</html.p>
          </html.div>
        </html.div>
        <html.button
          type="button"
          onClick={rotateRecommendation}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink"
        >
          <CalendarDays size={17} color="#172033" aria-hidden />
          <html.span>{recommendation.action}</html.span>
        </html.button>
      </html.div>
    </Panel>
  );
}

export function TargetSummary() {
  const user = useBuddyStore((state) => state.user);
  return (
    <html.div className="flex flex-wrap gap-2">
      <Pill tone="ocean">
        <html.span>Level {user.currentLevel}</html.span>
      </Pill>
      <Pill tone="mint">
        <html.span>Predicted {user.predictedBand.toFixed(1)}</html.span>
      </Pill>
      <Pill tone="amber">
        <html.span>Target {user.targetBand.toFixed(1)}</html.span>
      </Pill>
      <Pill tone="violet">
        <html.span>{user.examDate}</html.span>
      </Pill>
      <Pill tone="coral">
        <Target size={13} color="#ff6b4a" aria-hidden />
        <html.span className="ml-1">IELTS sprint</html.span>
      </Pill>
    </html.div>
  );
}
