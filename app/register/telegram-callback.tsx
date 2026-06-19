import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Loader2 } from "lucide-react-native";
import { html } from "@/lib/strictHtml";
import { useBuddyStore } from "@/lib/store";
import { exchangeCodeForTelegramUser } from "@/lib/telegramOauth";
import { Panel } from "@/components/ui";

export default function TelegramCallbackRoute() {
  const { code, state } = useLocalSearchParams<{ code?: string; state?: string }>();
  const setRegisterForm = useBuddyStore((state) => state.setRegisterForm);

  useEffect(() => {
    async function handleCallback() {
      // Check for code
      if (!code) {
        console.error("No code received from Telegram OAuth");
        router.replace("/");
        return;
      }

      try {
        const redirectUri = window.location.origin + window.location.pathname;
        const tgUser = await exchangeCodeForTelegramUser(code, redirectUri);
        
        const email = tgUser.email || `${tgUser.username || "telegram"}_user@t.me`;
        const registeredUsers = useBuddyStore.getState().registeredUsers;
        const existingUser = registeredUsers.find((u) => u.email === email);

        if (existingUser) {
          // Sign in directly
          useBuddyStore.setState(() => ({
            user: existingUser,
            registrationComplete: true
          }));
          router.replace("/dashboard");
        } else {
          // Register flow
          setRegisterForm({
            fullName: tgUser.fullName,
            email,
            aboutMe: ""
          });

          useBuddyStore.setState((state) => ({
            user: {
              ...state.user,
              fullName: tgUser.fullName,
              email,
              avatarUrl: tgUser.avatarUrl || "https://api.dicebear.com/9.x/initials/svg?seed=" + encodeURIComponent(tgUser.fullName)
            }
          }));

          router.replace("/register/telegram-profile" as any);
        }
      } catch (err) {
        console.error("Error during Telegram authentication callback", err);
        router.replace("/");
      }
    }

    if (code) {
      handleCallback();
    } else {
      // If loaded without code, redirect to home
      const timeout = setTimeout(() => {
        router.replace("/");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [code]);

  return (
    <html.main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <html.div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <html.div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <Panel className="max-w-md w-full p-8 text-center flex flex-col items-center justify-center gap-6 bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-2xl relative z-10" ariaLabel="Telegram callback authentication state">
        <html.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 animate-spin">
          <Loader2 size={32} />
        </html.div>
        <html.div className="space-y-2">
          <html.h2 className="text-2xl font-black text-slate-900">Telegram Sign In</html.h2>
          <html.p className="text-slate-500 text-sm">
            Authenticating your account and retrieving secure profile details. Please wait a moment...
          </html.p>
        </html.div>
      </Panel>
    </html.main>
  );
}
