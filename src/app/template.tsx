import AdminShortcut from "@/components/AdminShortcut";
import TarotCinematicBridge from "@/components/TarotCinematicBridge";

import TarotAudioV1 from "@/components/TarotAudioV1";
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
          <TarotAudioV1 />
    </>
  );
}