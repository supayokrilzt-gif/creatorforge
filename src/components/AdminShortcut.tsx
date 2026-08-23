"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminShortcut() {
  const pathname = usePathname();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshAdminStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setShowAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("ตรวจสอบสิทธิ์แอดมินไม่สำเร็จ:", error);
        setShowAdmin(false);
        return;
      }

      setShowAdmin(Boolean(data?.is_admin));
    }

    void refreshAdminStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void refreshAdminStatus();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

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
        zIndex: 99999,
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