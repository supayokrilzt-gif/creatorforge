"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminShortcut() {
  const pathname = usePathname();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        checkAdmin();
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAdmin() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setShowAdmin(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "is_current_user_admin"
    );

    if (error) {
      console.error("ตรวจสอบสิทธิ์แอดมินไม่สำเร็จ:", error);
      setShowAdmin(false);
      return;
    }

    setShowAdmin(Boolean(data));
  }

  if (!showAdmin) {
    return null;
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <button
      onClick={() => {
        window.location.href = "/admin";
      }}
      style={{
        position: "fixed",
        right: "22px",
        bottom: "22px",
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: "999px",
        border: "1px solid rgba(236,194,98,.38)",
        background:
          "linear-gradient(135deg,#8d5f19,#edc977,#9d6719)",
        color: "#171006",
        fontWeight: 800,
        fontSize: "12px",
        letterSpacing: ".8px",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(0,0,0,.4)",
      }}
    >
      ⚙ ADMIN
    </button>
  );
}