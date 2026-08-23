"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import TarotCinematic, {
  type CinematicStage,
} from "./TarotCinematic";

import TarotResultOverlay from "./TarotResultOverlay";

export type TarotResultPayload = {
  images: string[];
  reversed: boolean[];

  poem: string[];

  meaning: string;
  answer: string;
  example: string;
  guidance: string;
  hook: string;

  deep: boolean;
  deepReading: string;
};

function cleanText(
  value?: string | null
) {
  return (value || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TarotCinematicBridge() {
  const [cinematicOpen, setCinematicOpen] =
    useState(false);

  const [stage, setStage] =
    useState<CinematicStage>("idle");

  const [image, setImage] =
    useState("");

  const [reversed, setReversed] =
    useState(false);

  const [deepImages, setDeepImages] =
    useState<string[]>([]);

  const [deepReversed, setDeepReversed] =
    useState<boolean[]>([]);

  const [resultOpen, setResultOpen] =
    useState(false);

  const [resultData, setResultData] =
    useState<TarotResultPayload | null>(
      null
    );

  const [soundOn, setSoundOn] =
    useState(true);

  const runningRef =
    useRef(false);

  const timersRef =
    useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach(
      (timer) =>
        window.clearTimeout(timer)
    );

    timersRef.current = [];
  }

  function later(
    callback: () => void,
    delay: number
  ) {
    const timer =
      window.setTimeout(
        callback,
        delay
      );

    timersRef.current.push(timer);
  }

  function captureFirstCard() {
    const cardImage =
      document.querySelector(
        ".card-front img"
      ) as HTMLImageElement | null;

    if (!cardImage?.src) {
      return null;
    }

    const isReversed =
      (
        cardImage.style.transform ||
        ""
      ).includes("180deg");

    setImage(cardImage.src);

    setReversed(isReversed);

    return {
      image: cardImage.src,
      reversed: isReversed,
    };
  }

  function captureInitialResult():
    TarotResultPayload | null {
    const panel =
      document.querySelector(
        ".meaning-panel"
      ) as HTMLElement | null;

    if (!panel) {
      return null;
    }

    const direct =
      panel.querySelector(
        ".direct-answer"
      );

    if (!direct) {
      return null;
    }

    const first =
      captureFirstCard();

    if (!first) {
      return null;
    }

    const answer =
      cleanText(
        direct
          .querySelector(
            "p:first-child strong"
          )
          ?.textContent
      );

    if (!answer) {
      return null;
    }

    const paragraphs =
      Array.from(
        direct.querySelectorAll(
          ".reading-paragraph"
        )
      );

    const poem =
      Array.from(
        panel.querySelectorAll(
          ".poem-inline p"
        )
      )
        .map((item) =>
          cleanText(
            item.textContent
          )
        )
        .filter(Boolean);

    let meaning = "";

    const blocks =
      Array.from(
        panel.querySelectorAll("div")
      ) as HTMLElement[];

    for (const block of blocks) {
      const text =
        cleanText(
          block.textContent
        );

      if (
        text.includes(
          "ความหมายของไพ่ใบนี้"
        )
      ) {
        const found =
          cleanText(
            block
              .querySelector("strong")
              ?.textContent
          );

        if (found) {
          meaning = found;
          break;
        }
      }
    }

    return {
      images: [
        first.image,
      ],

      reversed: [
        first.reversed,
      ],

      poem,

      meaning,

      answer,

      example:
        cleanText(
          paragraphs[0]
            ?.textContent
        ),

      guidance:
        cleanText(
          paragraphs[1]
            ?.textContent
        ),

      hook:
        cleanText(
          direct
            .querySelector(
              ".reading-hook"
            )
            ?.textContent
        ),

      deep: false,

      deepReading: "",
    };
  }

  function captureDeepResult():
    TarotResultPayload | null {
    const first =
      captureFirstCard();

    if (!first) {
      return null;
    }

    const deepCardImages =
      Array.from(
        document.querySelectorAll(
          ".deep-cards .mini-card img"
        )
      ) as HTMLImageElement[];

    if (
      deepCardImages.length < 2
    ) {
      return null;
    }

    const deepText =
      cleanText(
        document.querySelector(
          ".deep-final"
        )?.textContent
      );

    if (!deepText) {
      return null;
    }

    const second =
      deepCardImages[0];

    const third =
      deepCardImages[1];

    const secondReversed =
      (
        second.style.transform ||
        ""
      ).includes("180deg");

    const thirdReversed =
      (
        third.style.transform ||
        ""
      ).includes("180deg");

    const images = [
      first.image,
      second.src,
      third.src,
    ];

    const reversedStates = [
      first.reversed,
      secondReversed,
      thirdReversed,
    ];

    setDeepImages(images);

    setDeepReversed(
      reversedStates
    );

    return {
      images,

      reversed:
        reversedStates,

      poem: [],

      meaning: "",
      answer: "",
      example: "",
      guidance: "",
      hook: "",

      deep: true,

      deepReading:
        deepText,
    };
  }

  function waitForInitialResult(
    attempt = 0
  ) {
    const result =
      captureInitialResult();

    if (result) {
      setResultData(result);

      setResultOpen(true);

      later(() => {
        setCinematicOpen(false);

        setStage("idle");

        runningRef.current =
          false;
      }, 300);

      return;
    }

    if (attempt < 25) {
      later(() => {
        waitForInitialResult(
          attempt + 1
        );
      }, 120);

      return;
    }

    console.error(
      "Tarot Result: อ่านคำทำนายไม่สำเร็จ"
    );

    setCinematicOpen(false);

    setStage("idle");

    runningRef.current =
      false;
  }

  function startInitialSequence() {
    if (
      runningRef.current
    ) {
      return;
    }

    runningRef.current =
      true;

    clearTimers();

    setResultOpen(false);

    setResultData(null);

    setDeepImages([]);

    setDeepReversed([]);

    setImage("");

    setReversed(false);

    setCinematicOpen(true);

    setStage("dark");

    later(() => {
      setStage("portal");
    }, 450);

    later(() => {
      setStage("orbit");
    }, 1300);

    later(() => {
      captureFirstCard();
    }, 1900);

    later(() => {
      captureFirstCard();

      setStage("chosen");
    }, 3000);

    later(() => {
      captureFirstCard();

      setStage("reveal");
    }, 4200);

    later(() => {
      waitForInitialResult();
    }, 6000);
  }

  function findDeepButton() {
    const buttons =
      Array.from(
        document.querySelectorAll(
          "button"
        )
      ) as HTMLButtonElement[];

    return (
      buttons.find(
        (button) =>
          button.classList.contains(
            "deep-button"
          )
      ) ||
      buttons.find(
        (button) =>
          button.innerText.includes(
            "เปิดไพ่อีก 2 ใบ"
          )
      )
    );
  }

  function waitForDeepCards(
    attempt = 0
  ) {
    const deep =
      captureDeepResult();

    if (!deep) {
      if (attempt < 40) {
        later(() => {
          waitForDeepCards(
            attempt + 1
          );
        }, 120);

        return;
      }

      console.error(
        "Tarot Deep Result: ยังไม่พบไพ่เพิ่ม"
      );

      /*
        สำคัญ:
        ถ้าระบบเปิดต่อไม่สำเร็จ
        กลับไป Result ใบแรก
        ไม่กลับหน้า Home
      */

      setCinematicOpen(false);

      setStage("idle");

      setResultOpen(true);

      runningRef.current =
        false;

      return;
    }

    /*
      ไพ่ 2 ใบพร้อมแล้ว
    */

    setStage(
      "deep-arrive"
    );

    /*
      ให้ไพ่ซ้าย/ขวาวิ่งเข้ามา
    */

    later(() => {
      setStage(
        "deep-hold"
      );
    }, 1600);

    /*
      เปลี่ยน Result ที่อยู่ด้านหลัง
      เป็นผล 3 ใบ
    */

    later(() => {
      setResultData(deep);

      /*
        Result ยังเปิดอยู่ตลอด
        ไม่เคยกลับ Home
      */
      setResultOpen(true);
    }, 3000);

    /*
      จากนั้นค่อยเอา Cinematic ออก
    */

    later(() => {
      setCinematicOpen(false);

      setStage("idle");

      runningRef.current =
        false;
    }, 3400);
  }

  function startDeepSequence() {
    if (
      runningRef.current
    ) {
      return;
    }

    const first =
      resultData?.images[0] ||
      image;

    const firstReverse =
      resultData?.reversed[0] ??
      reversed;

    if (!first) {
      return;
    }

    runningRef.current =
      true;

    clearTimers();

    /*
      สำคัญ:
      ไม่ปิด Result เดิมแล้ว

      Result ใบแรกจะอยู่ด้านหลัง
      Cinematic ใหม่จะขึ้นทับ
    */

    setImage(first);

    setReversed(
      firstReverse
    );

    setDeepImages([
      first,
    ]);

    setDeepReversed([
      firstReverse,
    ]);

    setCinematicOpen(true);

    setStage(
      "deep-start"
    );

    later(() => {
      const deepButton =
        findDeepButton();

      if (!deepButton) {
        console.error(
          "ไม่พบปุ่มเปิดไพ่อีก 2 ใบ"
        );

        setCinematicOpen(false);

        setStage("idle");

        setResultOpen(true);

        runningRef.current =
          false;

        return;
      }

      /*
        เรียกระบบจริงใน page.tsx
      */

      deepButton.click();

      /*
        page.tsx มีช่วงสุ่มไพ่
        จึงรอสักนิดก่อนเริ่มตรวจ
      */

      later(() => {
        waitForDeepCards();
      }, 500);

    }, 700);
  }

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "creatorforge-tarot-sound"
      );

    if (
      saved === "off"
    ) {
      setSoundOn(false);
    }

    function handleClick(
      event: MouseEvent
    ) {
      const target =
        event.target as
          | HTMLElement
          | null;

      if (!target) {
        return;
      }

      const button =
        target.closest(
          "button"
        ) as HTMLButtonElement | null;

      if (!button) {
        return;
      }

      /*
        Result buttons
        Bridge ไม่ต้องจับ
      */

      if (
        button.classList.contains(
          "tarot-result-more"
        ) ||
        button.classList.contains(
          "tarot-result-home"
        )
      ) {
        return;
      }

      const isQuick =
        button.classList.contains(
          "menu"
        );

      const isCustom =
        button.classList.contains(
          "open-button"
        );

      if (
        !isQuick &&
        !isCustom
      ) {
        return;
      }

      if (isCustom) {
        const textarea =
          document.querySelector(
            ".question-box"
          ) as HTMLTextAreaElement | null;

        if (
          textarea &&
          !textarea.value.trim()
        ) {
          return;
        }
      }

      window.setTimeout(() => {
        startInitialSequence();
      }, 60);
    }

    document.addEventListener(
      "click",
      handleClick,
      false
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        false
      );

      clearTimers();
    };
  }, []);

  function closeResult() {
    setResultOpen(false);

    setResultData(null);

    setCinematicOpen(false);

    setStage("idle");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleSound() {
    setSoundOn(
      (current) => {
        const next =
          !current;

        localStorage.setItem(
          "creatorforge-tarot-sound",
          next
            ? "on"
            : "off"
        );

        return next;
      }
    );
  }

  return (
    <>
      <TarotResultOverlay
        open={resultOpen}
        data={resultData}
        onClose={closeResult}
        onMore={
          startDeepSequence
        }
      />

      <TarotCinematic
        open={cinematicOpen}
        stage={stage}
        image={image}
        reversed={reversed}
        deepImages={deepImages}
        deepReversed={
          deepReversed
        }
        soundOn={soundOn}
        onToggleSound={
          toggleSound
        }
      />
    </>
  );
}