import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = String(body?.text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3900);

    if (!text) {
      return NextResponse.json(
        { error: "ไม่มีข้อความสำหรับอ่าน" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ยังไม่ได้ตั้ง OPENAI_API_KEY"
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model:
            "gpt-4o-mini-tts",

          voice:
            "shimmer",

          input:
            text,

          instructions:
            "อ่านภาษาไทยด้วยน้ำเสียงนุ่ม สดใส เป็นธรรมชาติ โทนผู้หญิงวัยผู้ใหญ่ สุขุมและมีเสน่ห์แบบนักพยากรณ์ พูดเร็วขึ้นเล็กน้อยประมาณหนึ่งจุดหนึ่งห้าเท่าของความเร็วสนทนาปกติ แต่ยังออกเสียงภาษาไทยชัดเจน ไม่ลากคำ ไม่เว้นจังหวะนาน และไม่อ่านเครื่องหมายวรรคตอนออกเสียง",

          response_format:
            "mp3",
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "TTS ERROR:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "สร้างเสียงอ่านไม่สำเร็จ"
        },
        { status: 500 }
      );
    }

    const audio =
      await response.arrayBuffer();

    return new NextResponse(
      audio,
      {
        headers: {
          "Content-Type":
            "audio/mpeg",

          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "ระบบเสียงเกิดข้อผิดพลาด"
      },
      { status: 500 }
    );
  }
}
