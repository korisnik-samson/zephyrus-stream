import api from "@/lib/api";
import ProfileSwitcher from "@/components/layout/ProfileSwitcher";
import type { Profile } from "@/types/auth";

export const metadata = { title: "Who's Watching? | Zephyrus" };

export default async function ProfilesPage() {
  let profiles: Profile[] = [];

  try {
    const res = await api.get<Profile[]>("/api/profiles");
    profiles = res.data ?? [];
  } catch {
    // Backend offline — ProfileSwitcher renders gracefully with empty list
  }

  return <ProfileSwitcher profiles={profiles} />;
}