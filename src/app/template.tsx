"use client";

import AdminShortcut from "@/components/AdminShortcut";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AdminShortcut />
    </>
  );
}