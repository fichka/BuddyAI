import { useState } from "react";
import { UserRound, Edit3, CheckCircle2, History, Image as ImageIcon } from "lucide-react-native";
import { html } from "@/lib/strictHtml";

import { useBuddyStore } from "@/lib/store";
import { AppShell, Panel, Pill, SectionTitle, cn } from "@/components/ui";

const avatarPresets = [
  "https://api.dicebear.com/9.x/initials/svg?seed=Amina%20Rahman",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Amina",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Buster"
];

export default function ProfileRoute() {
  const user = useBuddyStore((state) => state.user);
  const answerHistory = useBuddyStore((state) => state.answerHistory);
  const updateAnswerHistoryItem = useBuddyStore((state) => state.updateAnswerHistoryItem);

  const [aboutMe, setAboutMe] = useState(user.aboutMe || "");
  const [activePreset, setActivePreset] = useState(user.avatarUrl || avatarPresets[0]);
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  const handleSaveAbout = () => {
    useBuddyStore.setState((state) => ({
      user: {
        ...state.user,
        aboutMe: aboutMe.trim()
      }
    }));
    triggerSaveNotification();
  };

  const handleSelectPreset = (url: string) => {
    setActivePreset(url);
    useBuddyStore.setState((state) => ({
      user: {
        ...state.user,
        avatarUrl: url
      }
    }));
    triggerSaveNotification();
  };

  const triggerSaveNotification = () => {
    setSaveStatus("Saving changes...");
    setTimeout(() => {
      setSaveStatus("All changes saved");
    }, 800);
  };

  const handleEditHistoryItem = (id: string, text: string) => {
    updateAnswerHistoryItem(id, text);
    triggerSaveNotification();
  };

  return (
    <AppShell active="Dashboard">
      <html.div className="space-y-6">
        <Panel ariaLabel="Profile Settings">
          <SectionTitle
            eyebrow="Settings"
            title="Profile details"
            action={
              <html.span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {saveStatus}
              </html.span>
            }
          />

          <html.div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] mt-4">
            {/* Left: Avatar presets */}
            <html.div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
              <html.div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ImageIcon size={18} color="#172033" aria-hidden />
                <html.span>Select your avatar profile</html.span>
              </html.div>

              <html.div className="flex justify-center py-4">
                <html.img
                  src={activePreset}
                  className="h-28 w-28 rounded-full border-2 border-slate-200 bg-white p-1"
                  alt="Current Avatar"
                />
              </html.div>

              <html.div className="flex flex-wrap justify-center gap-2">
                {avatarPresets.map((preset) => {
                  const isSelected = activePreset === preset;
                  return (
                    <html.button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        "h-14 w-14 rounded-full overflow-hidden border-2 bg-white transition hover:scale-105",
                        isSelected ? "border-ink scale-105" : "border-slate-200"
                      )}
                    >
                      <html.img src={preset} className="h-full w-full" alt="Avatar Preset" />
                    </html.button>
                  );
                })}
              </html.div>
            </html.div>

            {/* Right: Personal details */}
            <html.div className="space-y-4">
              <html.div className="grid gap-3 sm:grid-cols-2">
                <html.div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                  <html.p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full Name</html.p>
                  <html.p className="mt-1 text-sm font-semibold text-ink">{user.fullName}</html.p>
                </html.div>
                <html.div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                  <html.p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Class Grade</html.p>
                  <html.p className="mt-1 text-sm font-semibold text-ink">Class {user.classLevel}</html.p>
                </html.div>
              </html.div>

              <html.label className="block">
                <html.span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">About Me</html.span>
                <html.textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.currentTarget.value)}
                  onBlur={handleSaveAbout}
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-ocean"
                />
              </html.label>
            </html.div>
          </html.div>
        </Panel>

        <Panel ariaLabel="Answer History">
          <SectionTitle
            eyebrow="History logs"
            title="Question Answer History"
            action={
              <html.div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <History size={15} color="#94a3b8" aria-hidden />
                <html.span>{answerHistory.length} answers logged</html.span>
              </html.div>
            }
          />

          {answerHistory.length > 0 ? (
            <html.div className="space-y-4 mt-4">
              {answerHistory.map((item) => (
                <html.div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <html.div className="mb-3 flex items-center justify-between gap-3">
                    <Pill tone={item.kind === "mini-test" ? "amber" : item.kind === "speaking" ? "violet" : "mint"}>
                      {item.kind.toUpperCase()}
                    </Pill>
                    <html.span className="text-xs font-semibold text-slate-400">ID: {item.id}</html.span>
                  </html.div>
                  <html.p className="text-sm font-semibold leading-5 text-ink mb-2">{item.question}</html.p>
                  <html.label className="block">
                    <html.textarea
                      value={item.answer}
                      onChange={(e) => handleEditHistoryItem(item.id, e.currentTarget.value)}
                      className="w-full min-h-16 rounded bg-slate-50 border border-slate-200 p-2 text-sm leading-6 text-slate-700 outline-none focus:bg-white focus:border-ocean"
                    />
                  </html.label>
                </html.div>
              ))}
            </html.div>
          ) : (
            <html.div className="text-center py-8 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-400 font-medium">
              No placement answers or practice sessions have been logged yet. Complete tasks in the practice lab to populate history.
            </html.div>
          )}
        </Panel>
      </html.div>
    </AppShell>
  );
}
