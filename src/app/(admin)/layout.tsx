import React from "react";
import { SessionProvider } from "next-auth/react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: { default: "Admin | Zephyrus", template: "%s · Admin | Zephyrus" },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-primary">
        <AdminSidebar />
        <div className="lg:pl-64">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}