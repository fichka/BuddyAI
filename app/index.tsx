import { Redirect } from "expo-router";

import { useBuddyStore } from "@/lib/store";

export default function IndexRoute() {
  const registrationComplete = useBuddyStore((state) => state.registrationComplete);

  return <Redirect href={registrationComplete ? "/dashboard" : "/register"} />;
}
