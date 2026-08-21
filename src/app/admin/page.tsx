"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  email: string;
  display_name: string | null;
  credits: number;
  created_at: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    startAdmin();
  }, []);

  async function startAdmin() {
    setChecking(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const currentUser = session?.user ?? null;

    setUser(currentUser);

    if (!currentUser) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "is_current_user_admin"
    );

    if (error) {
      console.error(error);
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    const adminStatus = Boolean(data);

    setIsAdmin(adminStatus);
    setChecking(false);

    if (adminStatus) {
      await loadMembers();
    }
  }

  async function loadMembers() {
    setLoadingMembers(true);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "admin_list_members"
    );

    setLoadingMembers(false);

    if (error) {
      console.error(error);
      setMessage("โหลดรายชื่อสมาชิกไม่สำเร็จ");
      return;
    }

    setMembers((data ?? []) as Member[]);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function openMember(memberId: string) {
    window.location.href =
      `/admin/member/${memberId}`;
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <h2 style={styles.gold}>
            กำลังตรวจสอบสิทธิ์...
          </h2>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <div style={styles.bigIcon}>🔒</div>

          <h1 style={styles.gold}>
            Admin Login Required
          </h1>

          <p style={styles.muted}>
            กรุณาเข้าสู่ระบบก่อน
          </p>

          <button
            style={styles.mainButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <div style={styles.bigIcon}>⛔</div>

          <h1 style={styles.gold}>
            ไม่มีสิทธิ์เข้าถึง
          </h1>

          <p style={styles.muted}>
            บัญชีนี้ไม่ใช่ผู้ดูแลระบบ
          </p>

          <button
            style={styles.mainButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>
            ✦ CREATORFORGE
          </div>

          <div style={styles.adminText}>
            ADMIN PANEL
          </div>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.adminBadge}>
            ADMIN
          </span>

          <button
            style={styles.secondaryButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            กลับหน้าเว็บ
          </button>

          <button
            style={styles.secondaryButton}
            onClick={logout}
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <section style={styles.container}>
        <div style={styles.topSection}>
          <div>
            <p style={styles.eyebrow}>
              CREATORFORGE CONTROL CENTER
            </p>

            <h1 style={styles.title}>
              สมาชิกทั้งหมด
            </h1>

            <p style={styles.muted}>
              แสดงชื่อ อีเมล และเครดิตของสมาชิก
            </p>
          </div>

          <div style={styles.totalBox}>
            <span style={styles.totalLabel}>
              สมาชิกทั้งหมด
            </span>

            <strong style={styles.totalNumber}>
              {members.length}
            </strong>
          </div>
        </div>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <div>ชื่อ</div>
            <div>อีเมล</div>
            <div style={styles.creditHeader}>
              เครดิต
            </div>
            <div />
          </div>

          {loadingMembers ? (
            <div style={styles.empty}>
              กำลังโหลดสมาชิก...
            </div>
          ) : members.length === 0 ? (
            <div style={styles.empty}>
              ยังไม่มีสมาชิก
            </div>
          ) : (
            members.map((member) => (
              <button
                key={member.id}
                style={styles.memberRow}
                onClick={() =>
                  openMember(member.id)
                }
              >
                <div style={styles.nameCell}>
                  {member.display_name || "สมาชิก"}
                </div>

                <div style={styles.emailCell}>
                  {member.email}
                </div>

                <div style={styles.creditCell}>
                  {member.credits}
                </div>

                <div style={styles.arrowCell}>
                  ›
                </div>
              </button>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 18% 8%, rgba(100,54,170,.18), transparent 30%), linear-gradient(135deg,#050714,#0b0c20 50%,#100b21)",
    color: "#eee8df",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  header: {
    minHeight: "72px",
    padding: "14px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom:
      "1px solid rgba(220,180,90,.18)",
    background:
      "rgba(5,7,18,.88)",
  },

  logo: {
    color: "#e7c36f",
    fontWeight: 800,
    letterSpacing: "1.5px",
  },

  adminText: {
    marginTop: "3px",
    color: "#777384",
    fontSize: "10px",
    letterSpacing: "2px",
  },

  headerRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  adminBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    border:
      "1px solid rgba(226,184,90,.3)",
    color: "#e9c66f",
    fontSize: "10px",
    fontWeight: 700,
  },

  secondaryButton: {
    minHeight: "34px",
    padding: "7px 11px",
    border:
      "1px solid rgba(220,180,90,.18)",
    borderRadius: "8px",
    background:
      "rgba(255,255,255,.03)",
    color: "#aaa5b3",
    cursor: "pointer",
  },

  container: {
    width: "min(1100px,92%)",
    margin: "0 auto",
    padding: "38px 0 70px",
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: 0,
    color: "#8f73b2",
    fontSize: "10px",
    letterSpacing: "2px",
  },

  title: {
    margin: "8px 0 6px",
    color: "#efd186",
    fontSize: "34px",
    fontWeight: 500,
  },

  muted: {
    color: "#8a8697",
    lineHeight: 1.7,
  },

  totalBox: {
    minWidth: "150px",
    padding: "18px 22px",
    textAlign: "center",
    borderRadius: "14px",
    border:
      "1px solid rgba(224,182,87,.22)",
    background:
      "rgba(220,172,70,.05)",
  },

  totalLabel: {
    display: "block",
    color: "#888492",
    fontSize: "10px",
  },

  totalNumber: {
    display: "block",
    marginTop: "4px",
    color: "#f0cf78",
    fontSize: "32px",
  },

  card: {
    border:
      "1px solid rgba(220,178,86,.17)",
    borderRadius: "18px",
    overflow: "hidden",
    background:
      "linear-gradient(145deg,rgba(22,19,48,.84),rgba(7,9,24,.92))",
    boxShadow:
      "0 22px 60px rgba(0,0,0,.28)",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "1.1fr 2fr 110px 40px",
    gap: "10px",
    padding: "15px 20px",
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
    color: "#777383",
    fontSize: "10px",
    letterSpacing: ".5px",
  },

  creditHeader: {
    textAlign: "center",
  },

  memberRow: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "1.1fr 2fr 110px 40px",
    gap: "10px",
    alignItems: "center",
    padding: "17px 20px",
    border: 0,
    borderBottom:
      "1px solid rgba(255,255,255,.055)",
    background: "transparent",
    color: "#eee8df",
    textAlign: "left",
    cursor: "pointer",
  },

  nameCell: {
    fontWeight: 600,
    color: "#e9dfd5",
  },

  emailCell: {
    color: "#96919e",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  creditCell: {
    textAlign: "center",
    color: "#efd07d",
    fontWeight: 700,
    fontSize: "16px",
  },

  arrowCell: {
    textAlign: "center",
    color: "#a985c9",
    fontSize: "25px",
  },

  empty: {
    padding: "50px 20px",
    textAlign: "center",
    color: "#777383",
  },

  message: {
    marginBottom: "15px",
    padding: "12px 14px",
    borderRadius: "10px",
    border:
      "1px solid rgba(225,183,84,.18)",
    background:
      "rgba(225,183,84,.06)",
    color: "#d9bd83",
  },

  centerCard: {
    width: "min(450px,92%)",
    margin: "0 auto",
    padding: "90px 20px",
    textAlign: "center",
  },

  bigIcon: {
    fontSize: "42px",
  },

  gold: {
    color: "#e8c875",
  },

  mainButton: {
    minHeight: "46px",
    padding: "10px 18px",
    border: 0,
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    color: "#171006",
    background:
      "linear-gradient(135deg,#986418,#f0ce7a 50%,#a16a18)",
  },
};