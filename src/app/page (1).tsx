"use client";

import { useMemo, useState } from "react";

type TarotCard = {
  name: string;
  roman: string;
  thai: string;
  rarity: "RARE" | "EPIC" | "LEGENDARY";
  keywords: string[];
  story: string;
  poem: string[];
  advice: string;
  symbols: { icon: string; title: string; text: string }[];
  powers: {
    love: number;
    money: number;
    work: number;
    luck: number;
    mind: number;
    overall: number;
  };
};

const cards: TarotCard[] = [
  {
    name: "THE STAR",
    roman: "XVII",
    thai: "ดวงดาวแห่งความหวัง",
    rarity: "LEGENDARY",
    keywords: ["ความหวัง", "แรงบันดาลใจ", "การเยียวยา", "โอกาสใหม่"],
    story:
      "หญิงสาวใต้แสงดาวกำลังเทสายน้ำสองสาย สายหนึ่งคืนพลังให้ผืนดิน อีกสายหล่อเลี้ยงสายน้ำ เป็นภาพของการฟื้นตัว ความสมดุล และความเชื่อมั่นว่าหลังคืนมืดยังมีแสงนำทางอยู่เสมอ",
    poem: [
      "ดาวเหนือฟ้ายังส่องทางกลางคืนมืด",
      "เรื่องที่ฝืดจะค่อยคลายเมื่อใจมั่น",
      "สิ่งที่หวังอย่าเร่งร้อนให้ทันวัน",
      "ค่อยสร้างฝันด้วยสองมือและความจริง",
    ],
    advice:
      "เปิดใจรับโอกาสใหม่ แต่ต้องลงมือทำด้วยตัวเอง ความหวังจะมีพลังเมื่อเปลี่ยนเป็นการกระทำ",
    symbols: [
      { icon: "✦", title: "ดาว 8 แฉก", text: "แสงนำทาง ความหวัง และแรงบันดาลใจ" },
      { icon: "♒", title: "สายน้ำ", text: "การไหลเวียน การเยียวยา และการปล่อยสิ่งเก่า" },
      { icon: "♧", title: "ผืนดิน", text: "การทำให้ความฝันกลายเป็นสิ่งที่จับต้องได้" },
      { icon: "𓅭", title: "นก", text: "ข่าวใหม่ การเริ่มต้น และมุมมองที่กว้างขึ้น" },
    ],
    powers: { love: 4, money: 3, work: 5, luck: 4, mind: 5, overall: 86 },
  },
  {
    name: "THE MOON",
    roman: "XVIII",
    thai: "จันทร์แห่งความลับ",
    rarity: "EPIC",
    keywords: ["สัญชาตญาณ", "ความไม่ชัดเจน", "ความฝัน", "ความจริงที่ซ่อนอยู่"],
    story:
      "ดวงจันทร์ส่องทางระหว่างหอคอยสองฝั่ง ขณะที่เส้นทางทอดลึกเข้าไปในความมืด ไพ่ใบนี้เตือนว่าบางสิ่งยังมองเห็นไม่ครบทั้งหมด จึงต้องใช้ทั้งเหตุผลและสัญชาตญาณก่อนตัดสินใจ",
    poem: [
      "แสงจันทร์นวลชวนใจให้สงสัย",
      "สิ่งที่เห็นอาจไม่ใช่อย่างใจหมาย",
      "ช้าสักนิดก่อนตัดสินเรื่องมากมาย",
      "เมื่อหมอกคลายความจริงนั้นจะชัดเอง",
    ],
    advice:
      "อย่ารีบเชื่อข้อมูลเพียงด้านเดียว หากยังรู้สึกไม่แน่ใจ ให้เก็บข้อมูลเพิ่มและรอจังหวะที่ชัดเจนกว่าเดิม",
    symbols: [
      { icon: "☾", title: "ดวงจันทร์", text: "จิตใต้สำนึก ความฝัน และสิ่งที่ยังไม่เปิดเผย" },
      { icon: "⌂", title: "หอคอยคู่", text: "ทางเลือกสองด้านและขอบเขตของความเข้าใจ" },
      { icon: "〰", title: "เส้นทาง", text: "การเดินผ่านความไม่แน่นอนไปหาความจริง" },
      { icon: "♓", title: "สายน้ำ", text: "อารมณ์ลึกและสัญชาตญาณ" },
    ],
    powers: { love: 3, money: 2, work: 3, luck: 2, mind: 5, overall: 68 },
  },
  {
    name: "THE SUN",
    roman: "XIX",
    thai: "สุริยาแห่งความสำเร็จ",
    rarity: "LEGENDARY",
    keywords: ["ความสำเร็จ", "ความสุข", "พลังชีวิต", "ความชัดเจน"],
    story:
      "ดวงอาทิตย์สาดแสงเหนือทุ่งดอกไม้ ทุกสิ่งมองเห็นได้อย่างชัดเจน ไพ่ใบนี้เป็นสัญลักษณ์ของพลังชีวิต ความสำเร็จ และช่วงเวลาที่สิ่งซับซ้อนเริ่มมีคำตอบ",
    poem: [
      "ตะวันฉายปลายทางเริ่มสว่าง",
      "เรื่องอ้างว้างจะมีคนเข้ามาหา",
      "งานที่ทำด้วยใจและศรัทธา",
      "มีเวลาผลิดอกออกผลดี",
    ],
    advice:
      "ใช้ช่วงเวลาที่มีความชัดเจนนี้เดินหน้าสิ่งสำคัญ เหมาะกับการเปิดตัวงาน การเจรจา และการตัดสินใจที่เตรียมข้อมูลมาดีแล้ว",
    symbols: [
      { icon: "☀", title: "ดวงอาทิตย์", text: "ความชัดเจน พลังชีวิต และชัยชนะ" },
      { icon: "✺", title: "ดอกทานตะวัน", text: "การเติบโต ความมั่นใจ และผลลัพธ์" },
      { icon: "♘", title: "ม้าขาว", text: "พลังที่บริสุทธิ์และการเคลื่อนไปข้างหน้า" },
      { icon: "⚑", title: "ธง", text: "การประกาศความสำเร็จและความพร้อม" },
    ],
    powers: { love: 5, money: 4, work: 5, luck: 5, mind: 4, overall: 94 },
  },
];

const categories = [
  { icon: "☀", label: "ไพ่ประจำวัน", sub: "พลังงานและคำแนะนำของวันนี้" },
  { icon: "♡", label: "ความรัก", sub: "ความสัมพันธ์ หัวใจ และความรู้สึก" },
  { icon: "▣", label: "การงาน", sub: "งาน อาชีพ และความสำเร็จ" },
  { icon: "◉", label: "การเงิน", sub: "เงิน โอกาส และการวางแผน" },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="stars-rating" aria-label={`${value} จาก 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <b key={i} className={i < value ? "on" : ""}>
          ★
        </b>
      ))}
    </span>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("ไพ่ประจำวัน");
  const [card, setCard] = useState<TarotCard>(cards[0]);
  const [phase, setPhase] = useState<"idle" | "drawing" | "revealed">("idle");
  const [history, setHistory] = useState<TarotCard[]>([]);

  const cardArtClass = useMemo(() => {
    if (card.name === "THE MOON") return "moon-art";
    if (card.name === "THE SUN") return "sun-art";
    return "star-art";
  }, [card]);

  const drawCard = () => {
    if (phase === "drawing") return;
    setPhase("drawing");

    window.setTimeout(() => {
      const next = cards[Math.floor(Math.random() * cards.length)];
      setCard(next);
      setHistory((old) => [next, ...old].slice(0, 4));
      setPhase("revealed");
    }, 1500);
  };

  return (
    <main className="app-shell">
      <div className="cosmos" />

      <header className="topbar">
        <a className="logo" href="#">
          <span className="logo-mark">✦</span>
          <span>CREATORFORGE</span>
        </a>

        <nav>
          <a href="#">หน้าหลัก</a>
          <a className="active" href="#">ดูดวง</a>
          <a href="#">เขียนนิยาย</a>
          <a href="#">เว็บบอร์ด</a>
          <a href="#">อ่านนิยาย</a>
          <a href="#">เครดิต</a>
        </nav>

        <div className="top-actions">
          <div className="credit">◆ 1,250 เครดิต</div>
          <button className="purple-btn">เติมเครดิต</button>
          <div className="avatar">CF</div>
        </div>
      </header>

      <section className="layout">
        <aside className="left-panel panel">
          <div className="section-heading">
            <span className="sigil">✧</span>
            <div>
              <h2>Tarot Lounge</h2>
              <p>เปิดไพ่ทำนายโชคชะตา</p>
            </div>
          </div>

          <div className="side-block">
            <h3>เลือกเรื่องที่อยากถาม</h3>
            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item.label}
                  className={selectedCategory === item.label ? "category active" : "category"}
                  onClick={() => setSelectedCategory(item.label)}
                >
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.sub}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="side-block">
            <h3>รูปแบบการเปิดไพ่</h3>
            <div className="spread-card">
              <span>✦</span>
              <div>
                <strong>ไพ่ 1 ใบ</strong>
                <small>คำแนะนำชัดเจนในคำถามเดียว</small>
              </div>
            </div>
          </div>

          <button className="gold-btn wide" onClick={drawCard} disabled={phase === "drawing"}>
            {phase === "drawing" ? "กำลังเปิดชะตา..." : "เปิดไพ่"}
          </button>

          <div className="free-note">● ไพ่ประจำวัน ฟรี 1 ครั้ง</div>

          <div className="history-block">
            <div className="history-title">
              <h3>ประวัติล่าสุด</h3>
              <button>ดูทั้งหมด</button>
            </div>

            {history.length === 0 ? (
              <p className="empty-history">ยังไม่มีประวัติการเปิดไพ่</p>
            ) : (
              history.map((item, index) => (
                <div className="history-item" key={`${item.name}-${index}`}>
                  <div className={`mini-art ${item.name.toLowerCase().replaceAll(" ", "-")}`} />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{selectedCategory} · เมื่อสักครู่</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="center-stage">
          <div className="stage-title">
            <span>✦</span>
            <div>
              <p>{selectedCategory}</p>
              <h1>{phase === "idle" ? "ตั้งจิต แล้วเปิดไพ่ของคุณ" : card.thai}</h1>
            </div>
            <span>✦</span>
          </div>

          <div className={`tarot-scene ${phase}`}>
            <div className="magic-ring ring-one" />
            <div className="magic-ring ring-two" />
            <div className="particles" />

            <div className={`tarot-card-wrap ${phase}`}>
              <div className="tarot-card-3d">
                <div className="tarot-face tarot-back">
                  <div className="back-border">
                    <div className="back-moon">☾</div>
                    <div className="back-eye">◉</div>
                    <div className="back-star">✦</div>
                  </div>
                </div>

                <article className="tarot-face tarot-front">
                  <div className="card-frame">
                    <div className="rarity">{card.rarity}</div>
                    <div className="roman">{card.roman}</div>
                    <h2>{card.name}</h2>

                    <div className={`card-art ${cardArtClass}`}>
                      <div className="main-celestial">
                        {card.name === "THE SUN" ? "☀" : card.name === "THE MOON" ? "☾" : "✦"}
                      </div>
                      <div className="figure">
                        <div className="figure-head" />
                        <div className="figure-body" />
                        <div className="water-lines">≈ ≈ ≈</div>
                      </div>
                      <div className="art-stars">✦ · ✧ · ✦ · ✧ · ✦</div>
                    </div>

                    <div className="keyword-line">
                      {card.keywords.slice(0, 3).map((x) => (
                        <span key={x}>{x}</span>
                      ))}
                    </div>

                    <p className="story">{card.story}</p>

                    <div className="power-grid">
                      <div><span>ความรัก</span><Stars value={card.powers.love} /></div>
                      <div><span>การเงิน</span><Stars value={card.powers.money} /></div>
                      <div><span>การงาน</span><Stars value={card.powers.work} /></div>
                      <div><span>โชคลาภ</span><Stars value={card.powers.luck} /></div>
                    </div>

                    <div className="overall">
                      <span>พลังโดยรวม</span>
                      <div className="overall-track">
                        <i style={{ width: `${card.powers.overall}%` }} />
                      </div>
                      <b>{card.powers.overall}</b>
                    </div>

                    <div className="card-advice">
                      <strong>คำแนะนำ</strong>
                      <p>{card.advice}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="action-row">
            <button className="soft-btn">♡ บันทึกไพ่ใบนี้</button>
            <button className="gold-btn main-open" onClick={drawCard} disabled={phase === "drawing"}>
              {phase === "drawing" ? "✦ กำลังเปิดไพ่..." : "↻ เปิดไพ่ใบใหม่"}
            </button>
            <button className="soft-btn">⌁ แชร์ผลลัพธ์</button>
          </div>

          {phase === "revealed" && (
            <div className="fortune-poem panel">
              <div className="poem-title">✦ คำพยากรณ์แบบเซียมซี ✦</div>
              {card.poem.map((line) => <p key={line}>{line}</p>)}
            </div>
          )}
        </section>

        <aside className="right-panel panel">
          <div className="right-title">รายละเอียดไพ่</div>

          <div className="card-summary">
            <div className={`summary-thumb ${cardArtClass}`} />
            <div>
              <h2>{card.name}</h2>
              <p>{card.thai}</p>
              <div className="rarity-label">{card.rarity}</div>
            </div>
          </div>

          <div className="meta-grid">
            <div><small>หมายเลข</small><strong>{card.roman}</strong></div>
            <div><small>ธาตุ</small><strong>{card.name === "THE SUN" ? "ไฟ" : "ลม / น้ำ"}</strong></div>
            <div><small>พลังใจ</small><strong>{card.powers.mind}/5</strong></div>
            <div><small>ภาพรวม</small><strong>{card.powers.overall}/100</strong></div>
          </div>

          <h3 className="symbol-heading">สัญลักษณ์บนหน้าไพ่</h3>

          <div className="symbols">
            {card.symbols.map((symbol) => (
              <div className="symbol-row" key={symbol.title}>
                <span>{symbol.icon}</span>
                <div>
                  <strong>{symbol.title}</strong>
                  <p>{symbol.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="position-box">
            <small>ตำแหน่งไพ่</small>
            <strong>ปัจจุบัน</strong>
            <p>พลังของไพ่กำลังสะท้อนสิ่งที่ควรใส่ใจในช่วงเวลานี้</p>
          </div>

          <div className="daily-card">
            <span>🎁</span>
            <div>
              <strong>Daily Free Card</strong>
              <p>ไพ่ฟรีประจำวันของคุณ</p>
              <small>กลับมาเปิดใหม่พรุ่งนี้</small>
            </div>
          </div>
        </aside>
      </section>

      <footer>
        ไพ่ทาโร่ใช้เพื่อความบันเทิงและการสะท้อนความคิด ผลลัพธ์ไม่ใช่การรับประกันเหตุการณ์ในอนาคต
      </footer>
    </main>
  );
}
