"use client";

import "./TarotCinematic.css";
import "./TarotDeepEffects.css";

export type CinematicStage =
  | "idle"
  | "dark"
  | "portal"
  | "orbit"
  | "chosen"
  | "reveal"
  | "deep-start"
  | "deep-arrive"
  | "deep-hold";

type Props = {
  open: boolean;
  stage: CinematicStage;

  image: string;
  reversed: boolean;

  deepImages?: string[];
  deepReversed?: boolean[];

  soundOn: boolean;
  onToggleSound: () => void;
};

export default function TarotCinematic({
  open,
  stage,
  image,
  reversed,
  deepImages = [],
  deepReversed = [],
  soundOn,
  onToggleSound,
}: Props) {
  if (!open) {
    return null;
  }

  const first =
    deepImages[0] || image;

  const second =
    deepImages[1] || "";

  const third =
    deepImages[2] || "";

  return (
    <div
      className={`tarot-cinema tarot-stage-${stage}`}
    >
      <div className="tarot-stars tarot-stars-a" />
      <div className="tarot-stars tarot-stars-b" />

      <div className="tarot-cinema-vignette" />
      <div className="tarot-cinema-light" />

      <button
        type="button"
        className="tarot-cinema-sound"
        onClick={onToggleSound}
      >
        {soundOn ? "♪" : "×"}
      </button>

      {/* =========================
          FIRST READING PORTAL
      ========================== */}

      <div className="tarot-portal-wrap">
        <div className="tarot-portal-glow" />
        <div className="tarot-portal-ring tarot-portal-ring-a" />
        <div className="tarot-portal-ring tarot-portal-ring-b" />

        <div className="tarot-portal-core">
          ✦
        </div>
      </div>

      <div className="tarot-orbit">
        {Array.from({
          length: 18,
        }).map((_, index) => (
          <div
            key={index}
            className="tarot-orbit-slot"
            style={
              {
                "--i": index,
              } as React.CSSProperties
            }
          >
            <div className="tarot-orbit-card">
              <div className="tarot-card-back-symbol">
                ✦
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tarot-selected-card">
        <div className="tarot-selected-back">
          <div className="tarot-selected-back-inner">
            <span className="tarot-selected-moon">
              ☾
            </span>

            <span className="tarot-selected-eye">
              ◉
            </span>

            <span className="tarot-selected-star">
              ✦
            </span>
          </div>
        </div>
      </div>

      <div className="tarot-reveal-card">
        {image ? (
          <img
            src={image}
            alt="Tarot card"
            draggable={false}
            style={{
              transform: reversed
                ? "rotate(180deg)"
                : "none",
            }}
          />
        ) : (
          <div className="tarot-reveal-placeholder">
            ✦
          </div>
        )}
      </div>

      {/* =========================
          DEEP READING — 3 CARDS
      ========================== */}

      <div className="tarot-deep-stage">
        <div className="tarot-deep-card tarot-deep-card-one">
          {first && (
            <img
              src={first}
              alt=""
              draggable={false}
              style={{
                transform:
                  deepReversed[0]
                    ? "rotate(180deg)"
                    : "none",
              }}
            />
          )}
        </div>

        <div className="tarot-deep-card tarot-deep-card-two">
          {second ? (
            <img
              src={second}
              alt=""
              draggable={false}
              style={{
                transform:
                  deepReversed[1]
                    ? "rotate(180deg)"
                    : "none",
              }}
            />
          ) : (
            <div className="tarot-deep-back">
              ✦
            </div>
          )}
        </div>

        <div className="tarot-deep-card tarot-deep-card-three">
          {third ? (
            <img
              src={third}
              alt=""
              draggable={false}
              style={{
                transform:
                  deepReversed[2]
                    ? "rotate(180deg)"
                    : "none",
              }}
            />
          ) : (
            <div className="tarot-deep-back">
              ✦
            </div>
          )}
        </div>

        <div className="tarot-deep-glow" />
      </div>

      <div className="tarot-cinema-caption">
        {stage === "dark" && (
          <>
            <strong>
              ตั้งจิตให้สงบ
            </strong>

            <small>
              คำตอบกำลังเดินทางมาหาคุณ
            </small>
          </>
        )}

        {stage === "portal" && (
          <>
            <strong>
              ประตูแห่งคำตอบกำลังเปิด
            </strong>

            <small>
              ไพ่กำลังเคลื่อนไหว
            </small>
          </>
        )}

        {stage === "orbit" && (
          <>
            <strong>
              ไพ่หนึ่งใบกำลังเลือกคุณ
            </strong>

            <small>
              รออีกเพียงครู่
            </small>
          </>
        )}

        {stage === "chosen" && (
          <>
            <strong>
              คำตอบถูกเลือกแล้ว
            </strong>
          </>
        )}

        {stage === "reveal" && (
          <>
            <strong>
              ค่อย ๆ มองสิ่งที่กำลังเปิดออก
            </strong>
          </>
        )}

        {stage === "deep-start" && (
          <>
            <strong>
              เรื่องนี้ยังมีบางอย่างซ่อนอยู่
            </strong>

            <small>
              ไพ่เดิมจะยังคงอยู่ตรงกลาง
            </small>
          </>
        )}

        {stage === "deep-arrive" && (
          <>
            <strong>
              อีกสองด้านของเรื่องกำลังเปิดออก
            </strong>
          </>
        )}

        {stage === "deep-hold" && (
          <>
            <strong>
              ตอนนี้ภาพทั้งหมดเชื่อมเข้าด้วยกันแล้ว
            </strong>
          </>
        )}
      </div>
    </div>
  );
}