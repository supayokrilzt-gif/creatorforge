"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";


export default function TarotAudioV1() {

  const [resultVisible, setResultVisible] =
    useState(false);

  const [musicOn, setMusicOn] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [loadingVoice, setLoadingVoice] =
    useState(false);

  const ambientRef =
    useRef<HTMLAudioElement | null>(null);

  const cardRef =
    useRef<HTMLAudioElement | null>(null);

  const deepRef =
    useRef<HTMLAudioElement | null>(null);

  const voiceRef =
    useRef<HTMLAudioElement | null>(null);

  const lastReadingRef =
    useRef("");

  const autoTimerRef =
    useRef<number | null>(null);

  const lastDeepSoundRef =
    useRef(0);


  function getReadingText() {

    const deep =
      document.querySelector(
        ".deep-final"
      );

    const normal =
      document.querySelector(
        ".direct-answer"
      );

    const target =
      deep || normal;

    if (!target) {
      return "";
    }

    const clone =
      target.cloneNode(true) as HTMLElement;

    clone
      .querySelectorAll(
        "button, svg, input, textarea"
      )
      .forEach(
        el => el.remove()
      );

    return (
      clone.innerText ||
      clone.textContent ||
      ""
    )
      .replace(
        /TAROT READING/gi,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }


  function startMusic() {

    const audio =
      ambientRef.current;

    if (!audio) return;

    audio.loop = true;
    audio.muted = false;
    audio.volume = 0.78;

    audio.play()
      .then(() => {
        setMusicOn(true);
      })
      .catch(
        () => {}
      );
  }


  function stopMusic() {

    if (!ambientRef.current) {
      return;
    }

    ambientRef.current.pause();

    setMusicOn(false);
  }


  function toggleMusic() {

    if (musicOn) {
      stopMusic();
    } else {
      startMusic();
    }
  }


  function playEffect(
    audio:
      HTMLAudioElement | null,
    volume = 0.95
  ) {

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime = 0;
    audio.volume = volume;

    audio.play()
      .catch(
        () => {}
      );
  }


  function restoreMusic() {

    if (
      ambientRef.current &&
      musicOn
    ) {
      ambientRef.current.volume = 0.78;
    }
  }


  function stopVoice() {

    if (
      autoTimerRef.current !== null
    ) {
      window.clearTimeout(
        autoTimerRef.current
      );

      autoTimerRef.current = null;
    }

    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
    }

    setSpeaking(false);
    setLoadingVoice(false);

    restoreMusic();
  }


  async function createAndPlayVoice(
    text: string
  ) {

    if (!text) {
      return;
    }

    try {

      setLoadingVoice(true);

      if (
        ambientRef.current &&
        musicOn
      ) {
        ambientRef.current.volume =
          0.12;
      }

      const response =
        await fetch(
          "/api/tts",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                text
              }),
          }
        );

      if (!response.ok) {

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        throw new Error(
          data?.error ||
          "สร้างเสียงอ่านไม่สำเร็จ"
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob
        );

      if (voiceRef.current) {
        voiceRef.current.pause();
      }

      const audio =
        new Audio(url);

      voiceRef.current =
        audio;

      /*
        เร็วขึ้นอีกเล็กน้อย
        หลังจาก TTS สร้างเสียงมาแล้ว
      */
      audio.playbackRate = 1.27;

      audio.volume =
        1;

      audio.onplay =
        () => {

          setLoadingVoice(false);
          setSpeaking(true);
        };

      audio.onended =
        () => {

          setSpeaking(false);

          URL.revokeObjectURL(
            url
          );

          restoreMusic();
        };

      audio.onerror =
        () => {

          setLoadingVoice(false);
          setSpeaking(false);

          URL.revokeObjectURL(
            url
          );

          restoreMusic();
        };

      await audio.play();

    } catch (error) {

      console.error(
        error
      );

      setLoadingVoice(false);
      setSpeaking(false);

      restoreMusic();
    }
  }


  async function readNow() {

    if (
      speaking ||
      loadingVoice
    ) {

      stopVoice();

      return;
    }

    const text =
      getReadingText();

    if (!text) {
      return;
    }

    lastReadingRef.current =
      text;

    await createAndPlayVoice(
      text
    );
  }


  function autoReadIfNew() {

    const text =
      getReadingText();

    if (!text) {
      return;
    }

    if (
      text ===
      lastReadingRef.current
    ) {
      return;
    }

    lastReadingRef.current =
      text;

    stopVoice();

    /*
      รอให้ animation ไพ่ขึ้นก่อนนิดเดียว
      แล้วเริ่มสร้างเสียงทันที
    */
    autoTimerRef.current =
      window.setTimeout(
        () => {

          createAndPlayVoice(
            text
          );

        },
        450
      );
  }


  useEffect(() => {

    ambientRef.current =
      new Audio(
        "/audio/tarot-ambient-v6.wav"
      );

    cardRef.current =
      new Audio(
        "/audio/card-open-v4.wav"
      );

    deepRef.current =
      new Audio(
        "/audio/deep-open-v5.wav"
      );


    ambientRef.current.loop =
      true;

    ambientRef.current.preload =
      "auto";

    cardRef.current.preload =
      "auto";

    deepRef.current.preload =
      "auto";


    ambientRef.current.load();
    cardRef.current.load();
    deepRef.current.load();

    /*
      AUDIO V6 AUTOSTART

      Chrome อาจบล็อก audible autoplay
      จึงลองเล่นทันที และถ้าถูกบล็อก
      interaction แรกจะเริ่มเพลงอัตโนมัติ
    */
    ambientRef.current.loop = true;
    ambientRef.current.volume = 0.78;
    ambientRef.current.muted = false;

    ambientRef.current
      .play()
      .then(() => {
        setMusicOn(true);
      })
      .catch(() => {
        // รอ interaction แรก
      });

    ambientRef.current.volume = 0.78;
    ambientRef.current.loop = true;
    ambientRef.current.muted = false;


    /*
      เปิดเพลงจาก interaction แรก
    */
    const unlockAudio =
      () => {

        startMusic();

        window.removeEventListener(
          "pointerdown",
          unlockAudio
        );

        window.removeEventListener(
          "keydown",
          unlockAudio
        );
      };


    window.addEventListener(
      "pointerdown",
      unlockAudio,
      {
        passive: true
      }
    );

    window.addEventListener(
      "keydown",
      unlockAudio
    );


    /*
      เปิดไพ่ใบแรก
    */
    const cardOpen =
      () => {

        playEffect(
          cardRef.current,
          1
        );
      };


    /*
      เปิดไพ่ต่อ
    */
    const deepOpen =
      () => {

        const now =
          Date.now();

        if (
          now -
          lastDeepSoundRef.current
          < 1400
        ) {
          return;
        }

        lastDeepSoundRef.current =
          now;

        stopVoice();

        // ปิด SFX ใบแรกก่อน
        // เพื่อไม่ให้ซ้อนกับเสียงเปิดต่อ
        if (cardRef.current) {
          cardRef.current.pause();
          cardRef.current.currentTime = 0;
        }

        playEffect(
          deepRef.current,
          1
        );
      };


    window.addEventListener(
      "creatorforge:custom-reading-valid",
      cardOpen
    );

    /*
      AUDIO V7 FIRST CARD FALLBACK
      กดปุ่มเปิดไพ่ครั้งแรก -> มี SFX ทันที
    */

    let lastFirstCardSound =
      0;

    const firstCardClick =
      (event: Event) => {

        const target =
          event.target as HTMLElement | null;

        const button =
          target?.closest(
            "button"
          );

        if (!button) {
          return;
        }

        const label =
          (
            button.textContent ||
            ""
          )
            .replace(/\s+/g, " ")
            .trim();

        if (
          label.includes("เปิดไพ่ต่อ")
        ) {
          return;
        }

        if (
          label.includes("เปิดไพ่") ||
          label.includes("ดูคำทำนาย") ||
          label.includes("เริ่มดู")
        ) {

          const now =
            Date.now();

          if (
            now -
            lastFirstCardSound
            < 900
          ) {
            return;
          }

          lastFirstCardSound =
            now;

          playEffect(
            cardRef.current,
            1
          );
        }
      };

    document.addEventListener(
      "click",
      firstCardClick,
      true
    );




    window.addEventListener(
      "creatorforge:deep-reading",
      deepOpen
    );


    /*
      ตรวจผลคำทำนาย
      ถ้ามีข้อความใหม่ -> อ่านอัตโนมัติ
    */

    /*
      AUDIO V7 NAV STOP
      หยุดเสียงอ่านเมื่อผู้ใช้:
      - กดกลับ
      - เปลี่ยนหน้า
      - เปิดไพ่ต่อ
      - เริ่มคำถามใหม่
    */

    const stopOnNavigation =
      (event: Event) => {

        const target =
          event.target as HTMLElement | null;

        const button =
          target?.closest(
            "button, a"
          );

        if (!button) {
          return;
        }

        const label =
          (
            button.textContent ||
            ""
          )
            .replace(/\s+/g, " ")
            .trim();

        const shouldStop =
          label.includes("กลับ") ||
          label.includes("เปิดไพ่ต่อ") ||
          label.includes("เปิดไพ่") ||
          label.includes("ถามใหม่") ||
          label.includes("เริ่มใหม่") ||
          label.includes("หน้าหลัก");

        if (shouldStop) {
          stopVoice();
        }
      };

    document.addEventListener(
      "click",
      stopOnNavigation,
      true
    );

    const checkResult =
      () => {

        const visible =
          !!document.querySelector(
            ".tarot-result-screen"
          );

        setResultVisible(
          visible
        );

        if (visible) {

          window.setTimeout(
            autoReadIfNew,
            120
          );
        }
      };


    checkResult();


    const observer =
      new MutationObserver(
        () => {

          checkResult();

        }
      );


    observer.observe(
      document.body,
      {
        childList:
          true,

        subtree:
          true,

        characterData:
          true,
      }
    );


    return () => {

      observer.disconnect();

      document.removeEventListener(
        "click",
        stopOnNavigation,
        true
      );

      stopVoice();

      ambientRef.current?.pause();
      cardRef.current?.pause();
      deepRef.current?.pause();

      window.removeEventListener(
        "pointerdown",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );

      window.removeEventListener(
        "creatorforge:custom-reading-valid",
        cardOpen
      );

      window.removeEventListener(
        "creatorforge:deep-reading",
        deepOpen
      );

      document.removeEventListener(
        "click",
        firstCardClick,
        true
      );
    };

  }, []);


  if (!resultVisible) {

    return (
      <button
        type="button"

        onClick={
          toggleMusic
        }

        aria-label={
          musicOn
            ? "ปิดเพลง"
            : "เปิดเพลง"
        }

        style={{
          position:
            "fixed",

          right:
            14,

          bottom:
            14,

          zIndex:
            999999,

          width:
            50,

          height:
            50,

          borderRadius:
            "50%",

          border:
            "1px solid rgba(245,205,105,.70)",

          background:
            "rgba(18,9,40,.94)",

          color:
            "#ffe19a",

          fontSize:
            21,

          cursor:
            "pointer",

          boxShadow:
            "0 8px 28px rgba(0,0,0,.50),0 0 22px rgba(214,163,69,.20)",
        }}
      >

        {musicOn
          ? "♫"
          : "♪"}

      </button>
    );
  }


  return (
    <div
      style={{
        position:
          "fixed",

        left:
          14,

        bottom:
          "max(14px, env(safe-area-inset-bottom))",

        transform:
          "none",

        zIndex:
          999999,

        display:
          "flex",

        alignItems:
          "center",

        gap:
          5,

        padding:
          "5px 6px",

        borderRadius:
          999,

        border:
          "1px solid rgba(242,204,112,.55)",

        background:
          "rgba(12,7,28,.93)",

        boxShadow:
          "0 14px 36px rgba(0,0,0,.52),0 0 22px rgba(131,69,255,.22)",

        backdropFilter:
          "blur(14px)",
      }}
    >

      <button
        type="button"

        onClick={
          speaking ||
          loadingVoice
            ? stopVoice
            : readNow
        }

        style={{
          minHeight:
            36,

          padding:
            "0 11px",

          borderRadius:
            999,

          border:
            "1px solid rgba(255,220,130,.82)",

          background:
            speaking ||
            loadingVoice
              ? "linear-gradient(180deg,#673589,#351b55)"
              : "linear-gradient(180deg,#ffe4a7,#c58d34)",

          color:
            speaking ||
            loadingVoice
              ? "#fff1ff"
              : "#2c1900",

          fontWeight:
            900,

          fontSize:
            11,

          cursor:
            "pointer",
        }}
      >

        {
          loadingVoice
            ? "⏹ หยุดสร้างเสียง"
            : speaking
            ? "⏹ หยุดอ่าน"
            : "🔊 อ่านอีกครั้ง"
        }

      </button>


      <button
        type="button"

        onClick={
          toggleMusic
        }

        aria-label={
          musicOn
            ? "ปิดเพลง"
            : "เปิดเพลง"
        }

        style={{
          width:
            36,

          height:
            36,

          borderRadius:
            "50%",

          border:
            "1px solid rgba(203,162,255,.55)",

          background:
            "rgba(63,31,101,.95)",

          color:
            "#f4dcff",

          fontSize:
            14,

          cursor:
            "pointer",
        }}
      >

        {musicOn
          ? "♫"
          : "♪"}

      </button>

    </div>
  );
}
