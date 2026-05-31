import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";

export const metadata = { title: "Manage Profiles | Zephyrus" };

export default function ManageProfilesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-16 pb-16 px-4">
      <div className="liquid-glass rounded-2xl p-10 max-w-sm w-full text-center space-y-5">
        <div className="flex justify-center">
          <UserCircle2 className="h-14 w-14 text-accent-gold opacity-60" />
        </div>
        <h1 className="text-2xl font-bold text-white">Profile Management</h1>
        <p className="text-sm text-text-muted">
          Full profile creation, editing, and avatar upload are coming in the next update.
        </p>
        <Link
          href="/profiles"
          className="inline-flex items-center gap-2 text-sm text-accent-purple-light hover:text-accent-purple transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profiles
        </Link>
      </div>
    </div>
  );
}