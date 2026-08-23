"use client";

import type {
  TarotResultPayload,
} from "./TarotCinematicBridge";

import "./TarotResultOverlay.css";

type Props = {
  open: boolean;
  data: TarotResultPayload | null;
  onClose: () => void;
  onMore: () => void;
};

function buildSpokenReading(
  data: TarotResultPayload
) {
  const paragraphs: string[] = [];

  if (data.meaning && data.answer) {
    paragraphs.push(
      `เรื่องนี้ถ้ามองภาพรวมแล้ว ${data.meaning} ส่วนเรื่องที่คุณกำลังอยากรู้ ${data.answer}`
    );
  } else if (data.answer) {
    paragraphs.push(
      `ถ้ามองเรื่องนี้โดยรวม ${data.answer}`
    );
  }

  if (data.example) {
    paragraphs.push(
      `ทีนี้ลองสังเกตสิ่งที่เกิดขึ้นจริงรอบตัวด้วยนะ ${data.example}`
    );
  }

  if (data.guidance) {
    paragraphs.push(
      `ส่วนช่วงนี้สิ่งที่อยากให้คุณทำก่อนคือ ${data.guidance}`
    );
  }

  if (data.hook) {
    paragraphs.push(
      `แต่เรื่องนี้ยังมีบางอย่างที่น่าดูต่ออยู่ ${data.hook}`
    );
  }

  return paragraphs;
}

export default function TarotResultOverlay({
  open,
  data,
  onClose,
  onMore,
}: Props) {
  if (!open || !data) {
    return null;
  }

  const spoken =
    buildSpokenReading(data);

  const firstImage =
    data.images?.[0] || "";

  return (
    <div
      className={
        data.deep
          ? "tarot-result-screen tarot-result-deep"
          : "tarot-result-screen"
      }
    >
      <div className="tarot-result-card-zone">

        {/* ผลครั้งแรก — ไพ่ใบเดียว */}
        {!data.deep && firstImage && (
          <img
            src={firstImage}
            alt=""
            className="tarot-result-full-card"
            style={{
              transform:
                data.reversed?.[0]
                  ? "translate(-50%, -50%) rotate(180deg)"
                  : "translate(-50%, -50%)",
            }}
          />
        )}

        {/* ผลเปิดต่อ — ไพ่ 3 ใบ */}
        {data.deep &&
          data.images.length >= 3 && (
            <div className="tarot-result-three-cards">
              {data.images.slice(0, 3).map(
                (cardImage, index) => (
                  <div
                    className="tarot-result-three-card"
                    key={`${cardImage}-${index}`}
                  >
                    <img
                      src={cardImage}
                      alt=""
                      draggable={false}
                      style={{
                        transform:
                          data.reversed?.[index]
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}

        <div className="tarot-result-card-shade" />

        <div className="tarot-result-header">
          <span>
            ✦ CREATORFORGE
          </span>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="tarot-result-text-layer">

          <div className="tarot-result-label">
            {data.deep
              ? "DEEP TAROT READING"
              : "TAROT READING"}
          </div>

          {!data.deep &&
            data.poem.length > 0 && (
              <div className="tarot-result-poem">
                {data.poem.map(
                  (line, index) => (
                    <p
                      key={`${index}-${line}`}
                    >
                      {line}
                    </p>
                  )
                )}
              </div>
            )}

          {!data.deep && (
            <div className="tarot-spoken-reading">
              {spoken.map(
                (paragraph, index) => (
                  <p
                    key={`${index}-${paragraph}`}
                  >
                    {paragraph}
                  </p>
                )
              )}
            </div>
          )}

          {data.deep &&
            data.deepReading && (
              <div className="tarot-deep-reading-text">
                <p>
                  {data.deepReading}
                </p>
              </div>
            )}

        </div>
      </div>

      <div className="tarot-result-actions">

        {!data.deep && (
          <button
            type="button"
            className="tarot-result-more"
            onClick={onMore}
          >
            <strong>
              ✦ เปิดไพ่ต่อ
            </strong>

            <small>
              ดูสิ่งที่ยังซ่อนอยู่
            </small>
          </button>
        )}

        <button
          type="button"
          className="tarot-result-home"
          onClick={onClose}
        >
          ⌂ กลับ
        </button>

      </div>
    </div>
  );
}