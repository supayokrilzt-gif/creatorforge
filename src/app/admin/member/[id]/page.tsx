"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  email: string;
  display_name: string | null;
  credits: number;
  created_at: string;
};

type Reading = {
  id: string;
  reading_type: string;
  question: string | null;
  topic: string | null;
  intent: string | null;
  first_card_name: string | null;
  first_card_thai: string | null;
  second_card_name: string | null;
  second_card_thai: string | null;
  third_card_name: string | null;
  third_card_thai: string | null;
  credits_spent: number;
  created_at: string;
};

type CreditHistory = {
  id: string;
  amount: number;
  transaction_type: string;
  note: string | null;
  created_at: string;
};

export default function AdminMemberPage() {
  const params = useParams();
  const memberId = String(params.id);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [member, setMember] = useState<Member | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([]);

  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startPage();
  }, [memberId]);

  async function startPage() {
    setChecking(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setChecking(false);
      return;
    }

    const { data: adminStatus } = await supabase.rpc(
      "is_current_user_admin"
    );

    if (!adminStatus) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    setIsAdmin(true);

    await Promise.all([
      loadMember(),
      loadReadings(),
      loadCreditHistory(),
    ]);

    setChecking(false);
  }

  async function loadMember() {
    const { data, error } = await supabase.rpc(
      "admin_get_member_detail",
      {
        p_user_id: memberId,
      }
    );

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setMember(data[0] as Member);
    }
  }

  async function loadReadings() {
    const { data, error } = await supabase.rpc(
      "admin_get_member_readings",
      {
        p_user_id: memberId,
      }
    );

    if (error) {
      console.error(error);
      return;
    }

    setReadings((data ?? []) as Reading[]);
  }

  async function loadCreditHistory() {
    const { data, error } = await supabase.rpc(
      "admin_get_credit_history",
      {
        p_user_id: memberId,
      }
    );

    if (error) {
      console.error(error);
      return;
    }

    setCreditHistory((data ?? []) as CreditHistory[]);
  }

  async function changeCredits(mode: "add" | "remove") {
    if (!member) return;

    const parsed = Math.floor(Number(amount));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage("กรุณากรอกจำนวนเครดิตมากกว่า 0");
      return;
    }

    const value =
      mode === "add"
        ? parsed
        : -parsed;

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "admin_change_credits",
      {
        p_user_id: member.id,
        p_amount: value,
        p_note:
          note.trim() ||
          (mode === "add"
            ? "เติมเครดิตโดยแอดมิน"
            : "หักเครดิตโดยแอดมิน"),
      }
    );

    setLoading(false);

    if (error) {
      console.error(error);

      if (error.message?.includes("INVALID_BALANCE")) {
        setMessage("หักไม่ได้ เพราะเครดิตจะติดลบ");
        return;
      }

      setMessage("เปลี่ยนเครดิตไม่สำเร็จ");
      return;
    }

    setMember({
      ...member,
      credits: Number(data),
    });

    setMessage(
      mode === "add"
        ? `เติมเครดิตสำเร็จ +${parsed}`
        : `หักเครดิตสำเร็จ -${parsed}`
    );

    await loadCreditHistory();
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <div style={styles.center}>
          กำลังโหลดข้อมูลสมาชิก...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={styles.page}>
        <div style={styles.center}>
          ไม่มีสิทธิ์เข้าถึง
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main style={styles.page}>
        <div style={styles.center}>
          ไม่พบสมาชิก
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
            MEMBER DETAIL
          </div>
        </div>

        <button
          style={styles.backButton}
          onClick={() => {
            window.location.href = "/admin";
          }}
        >
          ← กลับรายชื่อสมาชิก
        </button>
      </header>

      <section style={styles.container}>
        <section style={styles.memberCard}>
          <div>
            <p style={styles.labelTop}>
              MEMBER
            </p>

            <h1 style={styles.name}>
              {member.display_name || "สมาชิก"}
            </h1>

            <p style={styles.email}>
              {member.email}
            </p>

            <p style={styles.joinDate}>
              สมัครเมื่อ{" "}
              {new Date(
                member.created_at
              ).toLocaleString("th-TH")}
            </p>
          </div>

          <div style={styles.creditBox}>
            <span style={styles.creditLabel}>
              เครดิตปัจจุบัน
            </span>

            <strong style={styles.creditNumber}>
              {member.credits}
            </strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            จัดการเครดิต
          </h2>

          <div style={styles.quickGrid}>
            {[10, 30, 50, 100].map((value) => (
              <button
                key={value}
                style={styles.quickButton}
                disabled={loading}
                onClick={() => {
                  setAmount(String(value));
                }}
              >
                {value}
              </button>
            ))}
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>
                จำนวนเครดิต
              </label>

              <input
                style={styles.input}
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.formLabel}>
                หมายเหตุ
              </label>

              <input
                style={styles.input}
                value={note}
                placeholder="เช่น ปรับเครดิตทดสอบ"
                onChange={(e) =>
                  setNote(e.target.value)
                }
              />
            </div>
          </div>

          <div style={styles.actionGrid}>
            <button
              style={styles.addButton}
              disabled={loading}
              onClick={() =>
                changeCredits("add")
              }
            >
              + เติมเครดิต
            </button>

            <button
              style={styles.removeButton}
              disabled={loading}
              onClick={() =>
                changeCredits("remove")
              }
            >
              − หักเครดิต
            </button>
          </div>

          {message && (
            <div style={styles.message}>
              {message}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              ประวัติการดูดวง
            </h2>

            <span style={styles.count}>
              {readings.length} รายการ
            </span>
          </div>

          {readings.length === 0 ? (
            <div style={styles.empty}>
              ยังไม่มีประวัติการดูดวง
            </div>
          ) : (
            readings.map((reading) => (
              <div
                key={reading.id}
                style={styles.historyRow}
              >
                <div>
                  <strong style={styles.historyTitle}>
                    {reading.reading_type === "quick"
                      ? "ดูดวงแบบด่วน"
                      : "คำถามส่วนตัว"}
                  </strong>

                  <div style={styles.historyText}>
                    {reading.question ||
                      reading.topic ||
                      "ไม่ได้ระบุคำถาม"}
                  </div>

                  <div style={styles.cardNames}>
                    {reading.first_card_thai ||
                      reading.first_card_name ||
                      "ไพ่ใบแรก"}

                    {reading.second_card_name &&
                      ` • ${
                        reading.second_card_thai ||
                        reading.second_card_name
                      }`}

                    {reading.third_card_name &&
                      ` • ${
                        reading.third_card_thai ||
                        reading.third_card_name
                      }`}
                  </div>
                </div>

                <div style={styles.historyRight}>
                  <span>
                    {new Date(
                      reading.created_at
                    ).toLocaleString("th-TH")}
                  </span>

                  <strong>
                    ใช้ {reading.credits_spent || 0} เครดิต
                  </strong>
                </div>
              </div>
            ))
          )}
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              ประวัติเครดิต
            </h2>

            <span style={styles.count}>
              {creditHistory.length} รายการ
            </span>
          </div>

          {creditHistory.length === 0 ? (
            <div style={styles.empty}>
              ยังไม่มีประวัติเครดิต
            </div>
          ) : (
            creditHistory.map((item) => (
              <div
                key={item.id}
                style={styles.historyRow}
              >
                <div>
                  <strong
                    style={
                      item.amount >= 0
                        ? styles.plus
                        : styles.minus
                    }
                  >
                    {item.amount >= 0
                      ? `+${item.amount}`
                      : item.amount}
                    {" เครดิต"}
                  </strong>

                  <div style={styles.historyText}>
                    {item.note ||
                      item.transaction_type}
                  </div>
                </div>

                <div style={styles.historyRight}>
                  {new Date(
                    item.created_at
                  ).toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 18% 8%, rgba(100,54,170,.18), transparent 30%), linear-gradient(135deg,#050714,#0b0c20 50%,#100b21)",
    color: "#eee8df",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  header: {
    minHeight: "72px",
    padding: "14px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom:
      "1px solid rgba(220,180,90,.18)",
    background: "rgba(5,7,18,.88)",
  },

  logo: {
    color: "#e7c36f",
    fontWeight: 800,
  },

  adminText: {
    marginTop: "3px",
    fontSize: "10px",
    color: "#777384",
    letterSpacing: "2px",
  },

  backButton: {
    padding: "9px 13px",
    borderRadius: "9px",
    border:
      "1px solid rgba(220,180,90,.18)",
    background: "rgba(255,255,255,.03)",
    color: "#aaa5b3",
    cursor: "pointer",
  },

  container: {
    width: "min(1050px,92%)",
    margin: "0 auto",
    padding: "35px 0 70px",
  },

  memberCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    padding: "27px",
    marginBottom: "20px",
    borderRadius: "18px",
    border:
      "1px solid rgba(220,178,86,.17)",
    background:
      "linear-gradient(145deg,rgba(22,19,48,.84),rgba(7,9,24,.92))",
  },

  labelTop: {
    margin: 0,
    fontSize: "10px",
    color: "#8f73b2",
    letterSpacing: "2px",
  },

  name: {
    margin: "7px 0",
    color: "#efd186",
  },

  email: {
    color: "#96919e",
  },

  joinDate: {
    color: "#696574",
    fontSize: "11px",
  },

  creditBox: {
    minWidth: "160px",
    padding: "18px 24px",
    textAlign: "center",
    borderRadius: "14px",
    border:
      "1px solid rgba(224,182,87,.22)",
    background: "rgba(220,172,70,.05)",
  },

  creditLabel: {
    display: "block",
    color: "#888492",
    fontSize: "10px",
  },

  creditNumber: {
    display: "block",
    marginTop: "4px",
    color: "#f0cf78",
    fontSize: "36px",
  },

  card: {
    padding: "24px",
    marginBottom: "20px",
    borderRadius: "18px",
    border:
      "1px solid rgba(220,178,86,.17)",
    background:
      "linear-gradient(145deg,rgba(22,19,48,.84),rgba(7,9,24,.92))",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: "0 0 15px",
    color: "#dcc076",
    fontSize: "18px",
  },

  count: {
    color: "#777383",
    fontSize: "11px",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
    marginBottom: "18px",
  },

  quickButton: {
    minHeight: "45px",
    borderRadius: "10px",
    border:
      "1px solid rgba(226,184,90,.25)",
    background: "rgba(226,184,90,.05)",
    color: "#e8c870",
    fontWeight: 700,
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.7fr",
    gap: "12px",
  },

  formLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#777383",
    fontSize: "10px",
  },

  input: {
    width: "100%",
    minHeight: "45px",
    padding: "10px 12px",
    borderRadius: "9px",
    border:
      "1px solid rgba(170,137,195,.25)",
    background: "rgba(4,6,18,.72)",
    color: "#eee8df",
    outline: "none",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "13px",
  },

  addButton: {
    minHeight: "47px",
    border: 0,
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#8d5f19,#edc977,#9d6719)",
    color: "#171006",
    fontWeight: 700,
    cursor: "pointer",
  },

  removeButton: {
    minHeight: "47px",
    borderRadius: "10px",
    border:
      "1px solid rgba(206,107,91,.28)",
    background: "rgba(170,63,51,.12)",
    color: "#daa298",
    fontWeight: 700,
    cursor: "pointer",
  },

  message: {
    marginTop: "13px",
    padding: "11px 13px",
    borderRadius: "9px",
    border:
      "1px solid rgba(225,183,84,.18)",
    background: "rgba(225,183,84,.06)",
    color: "#d9bd83",
  },

  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "15px 0",
    borderBottom:
      "1px solid rgba(255,255,255,.055)",
  },

  historyTitle: {
    color: "#e6ddd3",
  },

  historyText: {
    marginTop: "5px",
    color: "#96919e",
    fontSize: "12px",
  },

  cardNames: {
    marginTop: "6px",
    color: "#aa8bc5",
    fontSize: "11px",
  },

  historyRight: {
    minWidth: "180px",
    textAlign: "right",
    color: "#777383",
    fontSize: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  plus: {
    color: "#9fd4a1",
  },

  minus: {
    color: "#d89a92",
  },

  empty: {
    padding: "30px 0",
    textAlign: "center",
    color: "#777383",
  },

  center: {
    padding: "100px 20px",
    textAlign: "center",
    color: "#efd186",
  },
};