import type {
  ReactNode,
} from "react";

import AdminShortcut from "@/components/AdminShortcut";
import TarotCinematicBridge from "@/components/TarotCinematicBridge";

export default function Template({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}

      <AdminShortcut />

      <TarotCinematicBridge />
    </>
  );
}