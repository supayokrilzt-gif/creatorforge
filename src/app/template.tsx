import AdminShortcut from "@/components/AdminShortcut";
import TarotCinematicBridge from "@/components/TarotCinematicBridge";

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}

      <AdminShortcut />

      <TarotCinematicBridge />
    </>
  );
}