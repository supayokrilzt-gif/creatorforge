"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Topic = "daily" | "love" | "work" | "money";
type Tone = "positive" | "caution" | "hope";

type Intent =
  | "love_crush"
  | "love_continue"
  | "love_return"
  | "love_trust"
  | "work_survival"
  | "work_quit"
  | "work_opportunity"
  | "customer_payment"
  | "customer_sale"
  | "money_general"
  | "money_invest"
  | "money_lend"
  | "unknown";

type TarotCard = {
  number: string;
  name: string;
  thai: string;
  symbol: string;
  uprightTone: Tone;
  reversedTone: Tone;
  uprightMeaning: string;
  reversedMeaning: string;
  image: string;
};

type DrawnCard = TarotCard & {
  reversed: boolean;
  tone: Tone;
  meaning: string;
};

type Reading = {
  answer: string;
  example: string;
  guidance: string;
  hook: string;
};

type AuthMode = "login" | "register";

const cards: TarotCard[] = [
  {
    number: "0",
    name: "THE FOOL",
    thai: "คนพเนจร",
    symbol: "✧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การเริ่มต้นใหม่ ความเป็นอิสระ และการเปิดใจรับประสบการณ์",
    reversedMeaning: "ความหุนหัน ความไม่พร้อม หรือการเริ่มโดยยังไม่เห็นความเสี่ยง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2000%20Fool.jpeg",
  },
  {
    number: "I",
    name: "THE MAGICIAN",
    thai: "นักมายากล",
    symbol: "✦",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ศักยภาพ ทักษะ การลงมือทำ และการใช้สิ่งที่มีให้เกิดผล",
    reversedMeaning: "พลังที่กระจัดกระจาย การลังเล หรือใช้ความสามารถไม่เต็มที่",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2001%20Magician.jpeg",
  },
  {
    number: "II",
    name: "THE HIGH PRIESTESS",
    thai: "มหาปุโรหิตหญิง",
    symbol: "☾",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "สัญชาตญาณ ความสงบ การสังเกต และสิ่งที่ยังไม่เปิดเผย",
    reversedMeaning: "สัญญาณที่สับสน การไม่ฟังใจตัวเอง หรือข้อมูลที่ยังคลุมเครือ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2002%20High%20Priestess.jpeg",
  },
  {
    number: "III",
    name: "THE EMPRESS",
    thai: "จักรพรรดินี",
    symbol: "♕",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความอุดมสมบูรณ์ การดูแล การเติบโต และความสร้างสรรค์",
    reversedMeaning: "การดูแลมากเกินไป ความเหนื่อยล้า หรือการเติบโตที่ติดขัด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2003%20Empress.jpeg",
  },
  {
    number: "IV",
    name: "THE EMPEROR",
    thai: "จักรพรรดิ",
    symbol: "♔",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "โครงสร้าง ความมั่นคง ความรับผิดชอบ และการวางระบบ",
    reversedMeaning: "ความแข็งเกินไป การควบคุมมากเกิน หรือโครงสร้างที่ไม่ยืดหยุ่น",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2004%20Emperor.jpeg",
  },
  {
    number: "V",
    name: "THE HIEROPHANT",
    thai: "มหาปุโรหิต",
    symbol: "✥",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "หลักการ การเรียนรู้จากระบบ ประสบการณ์ และคำแนะนำที่น่าเชื่อถือ",
    reversedMeaning: "การยึดกรอบเดิมเกินไป หรือจำเป็นต้องทบทวนกติกาที่ใช้มาตลอด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2005%20Hierophant.jpeg",
  },
  {
    number: "VI",
    name: "THE LOVERS",
    thai: "คู่รัก",
    symbol: "♡",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความสอดคล้อง ความสัมพันธ์ และการเลือกที่ตรงกับคุณค่าของตัวเอง",
    reversedMeaning: "ความไม่ลงรอย การลังเล หรือการตัดสินใจที่ยังไม่ตรงกับใจจริง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2006%20Lovers.jpeg",
  },
  {
    number: "VII",
    name: "THE CHARIOT",
    thai: "ราชรถ",
    symbol: "✦",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "แรงขับ การควบคุมทิศทาง ความมุ่งมั่น และการเดินหน้า",
    reversedMeaning: "ทิศทางไม่ชัด การเร่งมากเกิน หรือพลังที่ถูกดึงไปคนละทาง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2007%20Chariot.jpeg",
  },
  {
    number: "VIII",
    name: "STRENGTH",
    thai: "พลังใจ",
    symbol: "∞",
    uprightTone: "positive",
    reversedTone: "hope",
    uprightMeaning: "ความกล้า ความอดทน การควบคุมอารมณ์ และพลังที่นุ่มนวล",
    reversedMeaning: "ความไม่มั่นใจ พลังใจตก หรือจำเป็นต้องใจดีกับตัวเองมากขึ้น",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2008%20Strength.jpeg",
  },
  {
    number: "IX",
    name: "THE HERMIT",
    thai: "ฤๅษี",
    symbol: "✧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การถอยมาคิด การค้นคำตอบด้วยตัวเอง และความรอบคอบ",
    reversedMeaning: "การแยกตัวมากเกิน การคิดวน หรือหลีกเลี่ยงคำตอบที่ต้องเผชิญ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2009%20Hermit.jpeg",
  },
  {
    number: "X",
    name: "WHEEL OF FORTUNE",
    thai: "กงล้อแห่งโชคชะตา",
    symbol: "◉",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "จังหวะเปลี่ยน โอกาสใหม่ และสิ่งที่กำลังเคลื่อนไปอีกช่วงหนึ่ง",
    reversedMeaning: "ความล่าช้า วงจรเดิม หรือสิ่งที่ยังควบคุมไม่ได้",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2010%20Wheel%20of%20Fortune.jpeg",
  },
  {
    number: "XI",
    name: "JUSTICE",
    thai: "ความยุติธรรม",
    symbol: "⚖",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "เหตุผล ความเป็นธรรม ผลจากการตัดสินใจ และการมองข้อเท็จจริง",
    reversedMeaning: "ความไม่สมดุล ข้อมูลไม่ครบ หรือผลจากการตัดสินใจที่ต้องทบทวน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2011%20Justice.jpeg",
  },
  {
    number: "XII",
    name: "THE HANGED MAN",
    thai: "ชายแขวน",
    symbol: "◇",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การหยุดเพื่อมองใหม่ การยอมปล่อย และการเปลี่ยนมุมมอง",
    reversedMeaning: "การค้างอยู่กับที่ การเสียเวลา หรือยังไม่ยอมเปลี่ยนมุมมองเดิม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2012%20Hanged%20Man.jpeg",
  },
  {
    number: "XIII",
    name: "DEATH",
    thai: "ความเปลี่ยนผ่าน",
    symbol: "✦",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การปิดฉากสิ่งเก่า การเปลี่ยนผ่าน และการเปิดพื้นที่ให้สิ่งใหม่",
    reversedMeaning: "การยื้อสิ่งที่หมดเวลา ความกลัวการเปลี่ยน หรือยังตัดใจไม่ได้",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2013%20Death.jpeg",
  },
  {
    number: "XIV",
    name: "TEMPERANCE",
    thai: "ความพอดี",
    symbol: "⚗",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "สมดุล การประสานสิ่งต่าง ๆ ความพอดี และค่อยเป็นค่อยไป",
    reversedMeaning: "ความสุดโต่ง ความไม่พอดี หรือหลายอย่างยังไม่ลงตัว",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2014%20Temperance.jpeg",
  },
  {
    number: "XV",
    name: "THE DEVIL",
    thai: "พันธนาการ",
    symbol: "♑",
    uprightTone: "caution",
    reversedTone: "caution",
    uprightMeaning: "ความยึดติด แรงดึงดูด สิ่งล่อใจ และรูปแบบที่ควรเห็นให้ชัด",
    reversedMeaning: "การเริ่มหลุดจากพันธนาการ การเห็นปัญหา และมีโอกาสวางสิ่งที่ฉุดไว้",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2015%20Devil.jpeg",
  },
  {
    number: "XVI",
    name: "THE TOWER",
    thai: "หอคอย",
    symbol: "⚡",
    uprightTone: "caution",
    reversedTone: "caution",
    uprightMeaning: "การเปลี่ยนฉับพลัน ความจริงที่ทำให้ต้องปรับโครงสร้าง และสิ่งเก่าที่ไม่มั่นคง",
    reversedMeaning: "การพยายามเลี่ยงการเปลี่ยน หรือแรงสั่นสะเทือนที่ยังค้างและต้องค่อย ๆ จัดการ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2016%20Tower.jpeg",
  },
  {
    number: "XVII",
    name: "THE STAR",
    thai: "ดวงดาว",
    symbol: "✦",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความหวัง การฟื้นตัว แรงบันดาลใจ และการเห็นทางข้างหน้า",
    reversedMeaning: "ความหวังที่สั่นคลอน ความเหนื่อยใจ หรือจำเป็นต้องกลับมาเติมพลัง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2017%20Star.jpeg",
  },
  {
    number: "XVIII",
    name: "THE MOON",
    thai: "ดวงจันทร์",
    symbol: "☾",
    uprightTone: "caution",
    reversedTone: "caution",
    uprightMeaning: "ความไม่ชัด สัญชาตญาณ ความกังวล และสิ่งที่ควรตรวจให้แน่",
    reversedMeaning: "ความคลุมเครือเริ่มคลาย การเห็นความจริงมากขึ้น แต่ยังควรตรวจข้อมูล",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2018%20Moon.jpeg",
  },
  {
    number: "XIX",
    name: "THE SUN",
    thai: "ดวงอาทิตย์",
    symbol: "☀",
    uprightTone: "positive",
    reversedTone: "hope",
    uprightMeaning: "ความชัดเจน พลังบวก ความสำเร็จ และสิ่งที่เปิดเผยตรงไปตรงมา",
    reversedMeaning: "สิ่งดีที่ยังมาไม่เต็มที่ ความมั่นใจสะดุด หรือความสำเร็จที่ต้องใช้เวลาอีกนิด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2019%20Sun.jpeg",
  },
  {
    number: "XX",
    name: "JUDGEMENT",
    thai: "การตื่นรู้",
    symbol: "✧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การประเมินใหม่ การตัดสินใจจากบทเรียน และโอกาสเริ่มอีกครั้งอย่างเข้าใจ",
    reversedMeaning: "การตัดสินตัวเองหนักเกิน ลังเลกับบทเรียนเดิม หรือยังไม่ยอมตอบรับการเปลี่ยนแปลง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2020%20Judgement.jpeg",
  },
  {
    number: "XXI",
    name: "THE WORLD",
    thai: "โลก",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "hope",
    uprightMeaning: "ความสมบูรณ์ การปิดวงจร ความสำเร็จ และการก้าวสู่ระดับถัดไป",
    reversedMeaning: "งานที่เกือบเสร็จแต่ยังมีรายละเอียดค้าง หรือบทหนึ่งยังต้องปิดให้เรียบร้อย",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%2021%20World.jpeg",
  },
  {
    number: "01",
    name: "ACE OF WANDS",
    thai: "เอซไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "แรงเริ่มต้น ไอเดียใหม่ และแรงผลักให้ลงมือ",
    reversedMeaning: "ไฟเริ่มต้นที่ติดขัด หมดแรง หรือควรจัดพลังให้เป็นทิศทาง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2001.jpeg",
  },
  {
    number: "02",
    name: "TWO OF WANDS",
    thai: "สองไม้เท้า",
    symbol: "🔥",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การวางแผน มองทางเลือก และเตรียมขยายขอบเขต",
    reversedMeaning: "ความลังเล แผนยังแคบ หรือกลัวก้าวออกจากพื้นที่คุ้นเคย",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2002.jpeg",
  },
  {
    number: "03",
    name: "THREE OF WANDS",
    thai: "สามไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความก้าวหน้า การมองไกล และผลจากสิ่งที่เริ่มลงมือแล้ว",
    reversedMeaning: "ความล่าช้า ผลยังมาไม่เต็ม หรือจำเป็นต้องปรับแผน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2003.jpeg",
  },
  {
    number: "04",
    name: "FOUR OF WANDS",
    thai: "สี่ไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความมั่นคงเล็ก ๆ การเฉลิมฉลอง และฐานที่เริ่มลงตัว",
    reversedMeaning: "บรรยากาศไม่ลงตัว ความสำเร็จยังไม่เต็ม หรือฐานบางส่วนยังต้องจัด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2004.jpeg",
  },
  {
    number: "05",
    name: "FIVE OF WANDS",
    thai: "ห้าไม้เท้า",
    symbol: "🔥",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "การแข่งขัน ความเห็นต่าง และพลังที่ชนกัน",
    reversedMeaning: "ความขัดแย้งเริ่มเบา การหลีกเลี่ยงปัญหา หรือจำเป็นต้องคุยให้ชัด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2005.jpeg",
  },
  {
    number: "06",
    name: "SIX OF WANDS",
    thai: "หกไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การยอมรับ ความคืบหน้า และผลงานที่เริ่มถูกมองเห็น",
    reversedMeaning: "การไม่ได้รับการยอมรับตามหวัง หรือควรกลับมาวัดผลจากคุณค่าจริง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2006.jpeg",
  },
  {
    number: "07",
    name: "SEVEN OF WANDS",
    thai: "เจ็ดไม้เท้า",
    symbol: "🔥",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การยืนหยัด ปกป้องจุดยืน และรับมือแรงกดดัน",
    reversedMeaning: "ความเหนื่อยจากการตั้งรับ หรือควรเลือกศึกที่คุ้มจะสู้",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2007.jpeg",
  },
  {
    number: "08",
    name: "EIGHT OF WANDS",
    thai: "แปดไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความเร็ว ข่าวสาร ความคืบหน้า และสิ่งที่กำลังเคลื่อน",
    reversedMeaning: "ความล่าช้า สื่อสารติดขัด หรือหลายอย่างมาเร็วเกินจัดการ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2008.jpeg",
  },
  {
    number: "09",
    name: "NINE OF WANDS",
    thai: "เก้าไม้เท้า",
    symbol: "🔥",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "ความอดทน การระวัง และยืนต่อแม้ผ่านเรื่องหนัก",
    reversedMeaning: "ความล้าสะสม กำแพงสูงเกิน หรือควรพักก่อนฝืน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2009.jpeg",
  },
  {
    number: "10",
    name: "TEN OF WANDS",
    thai: "สิบไม้เท้า",
    symbol: "🔥",
    uprightTone: "caution",
    reversedTone: "caution",
    uprightMeaning: "ภาระ ความรับผิดชอบมาก และการแบกหลายอย่าง",
    reversedMeaning: "ภาระเกินกำลัง การปล่อยบางอย่าง หรือจำเป็นต้องแบ่งงาน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2010.jpeg",
  },
  {
    number: "11",
    name: "PAGE OF WANDS",
    thai: "เด็กถือไพ่ไม้เท้า",
    symbol: "🔥",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "ข่าวใหม่ ความอยากรู้ ความกล้าลอง และพลังเริ่มต้น",
    reversedMeaning: "ใจร้อน ข่าวไม่ชัด หรือเริ่มหลายอย่างแต่ไม่ต่อเนื่อง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2011.jpeg",
  },
  {
    number: "12",
    name: "KNIGHT OF WANDS",
    thai: "อัศวินไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การเคลื่อนไหวด้วยความมุ่งมั่น ความกล้า และพลังสูง",
    reversedMeaning: "รีบเกินไป ใจร้อน หรือใช้พลังโดยขาดแผน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2012.jpeg",
  },
  {
    number: "13",
    name: "QUEEN OF WANDS",
    thai: "ราชินีไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความมั่นใจ ความสร้างสรรค์ และพลังดึงดูดให้คนร่วมมือ",
    reversedMeaning: "ความไม่มั่นใจ อารมณ์ร้อน หรือพลังที่กระจาย",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2013.jpeg",
  },
  {
    number: "14",
    name: "KING OF WANDS",
    thai: "ราชาไม้เท้า",
    symbol: "🔥",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "วิสัยทัศน์ ภาวะผู้นำ และการเปลี่ยนไอเดียเป็นการลงมือ",
    reversedMeaning: "ควบคุมมากเกิน ใจร้อน หรือเป้าหมายใหญ่แต่การจัดการยังไม่ลงตัว",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Wands%2014.jpeg",
  },
  {
    number: "01",
    name: "ACE OF CUPS",
    thai: "เอซถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การเปิดใจ ความรู้สึกใหม่ ความเมตตา และความสัมพันธ์ที่เริ่มไหล",
    reversedMeaning: "อารมณ์อั้น ความรู้สึกที่ยังไม่เปิด หรือใจที่ต้องการการฟื้นฟู",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2001.jpeg",
  },
  {
    number: "02",
    name: "TWO OF CUPS",
    thai: "สองถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความสัมพันธ์ที่ตอบรับกัน ความร่วมมือ และการเชื่อมโยง",
    reversedMeaning: "ความไม่ลงรอย การสื่อสารใจไม่ตรง หรือความสัมพันธ์เสียสมดุล",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2002.jpeg",
  },
  {
    number: "03",
    name: "THREE OF CUPS",
    thai: "สามถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "มิตรภาพ การแบ่งปัน ข่าวดี และการเฉลิมฉลองร่วมกัน",
    reversedMeaning: "สังคมมากเกิน ดราม่า หรือความสัมพันธ์บางวงไม่จริงใจพอ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2003.jpeg",
  },
  {
    number: "04",
    name: "FOUR OF CUPS",
    thai: "สี่ถ้วย",
    symbol: "💧",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความเบื่อ ความไม่พอใจ และมองไม่เห็นทางเลือกที่อยู่ใกล้",
    reversedMeaning: "เริ่มเปิดใจ เห็นโอกาสใหม่ หรือพร้อมออกจากภาวะนิ่ง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2004.jpeg",
  },
  {
    number: "05",
    name: "FIVE OF CUPS",
    thai: "ห้าถ้วย",
    symbol: "💧",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความผิดหวัง การเสียดาย และการจดจ่อกับสิ่งที่เสีย",
    reversedMeaning: "การยอมรับ การฟื้นใจ และเริ่มหันกลับไปเห็นสิ่งที่ยังเหลือ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2005.jpeg",
  },
  {
    number: "06",
    name: "SIX OF CUPS",
    thai: "หกถ้วย",
    symbol: "💧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "ความทรงจำ ความคุ้นเคย ความอบอุ่น และเรื่องเก่าที่กลับมา",
    reversedMeaning: "ติดอดีต มองอดีตสวยเกินจริง หรือจำเป็นต้องอยู่กับปัจจุบัน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2006.jpeg",
  },
  {
    number: "07",
    name: "SEVEN OF CUPS",
    thai: "เจ็ดถ้วย",
    symbol: "💧",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "หลายทางเลือก จินตนาการ และสิ่งล่อใจที่ต้องแยกจริงกับฝัน",
    reversedMeaning: "เริ่มเห็นตัวเลือกชัดขึ้น ตัดสิ่งฟุ้งออก และพร้อมเลือก",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2007.jpeg",
  },
  {
    number: "08",
    name: "EIGHT OF CUPS",
    thai: "แปดถ้วย",
    symbol: "💧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การเดินออกจากสิ่งที่ไม่ตอบใจ เพื่อค้นสิ่งที่มีความหมายกว่า",
    reversedMeaning: "ลังเลจะจาก ย้อนกลับไปเรื่องเดิม หรือยังตัดสินใจไม่สุด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2008.jpeg",
  },
  {
    number: "09",
    name: "NINE OF CUPS",
    thai: "เก้าถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความพอใจ ความสมหวัง และการรู้คุณค่าของสิ่งที่มี",
    reversedMeaning: "พอใจชั่วคราว คาดหวังมากเกิน หรือสิ่งที่ได้ยังไม่เติมเต็ม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2009.jpeg",
  },
  {
    number: "10",
    name: "TEN OF CUPS",
    thai: "สิบถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความอบอุ่น ความกลมกลืน และความสัมพันธ์ที่มีฐานดี",
    reversedMeaning: "ความไม่ลงรอยในบ้านหรือกลุ่ม ความคาดหวังไม่ตรงกัน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2010.jpeg",
  },
  {
    number: "11",
    name: "PAGE OF CUPS",
    thai: "เด็กถือไพ่ถ้วย",
    symbol: "💧",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "ข่าวด้านความรู้สึก ความอ่อนโยน และการเปิดใจแบบยังเรียนรู้",
    reversedMeaning: "อ่อนไหวเกิน สื่อสารอารมณ์ไม่ชัด หรือฝันมากกว่าลงมือ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2011.jpeg",
  },
  {
    number: "12",
    name: "KNIGHT OF CUPS",
    thai: "อัศวินถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การเข้าหาด้วยความรู้สึก ความโรแมนติก และข้อเสนอจากใจ",
    reversedMeaning: "คาดหวังสูง อารมณ์พาไป หรือคำหวานที่ยังต้องดูการกระทำ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2012.jpeg",
  },
  {
    number: "13",
    name: "QUEEN OF CUPS",
    thai: "ราชินีถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความเข้าอกเข้าใจ สัญชาตญาณ และการดูแลอารมณ์ได้ดี",
    reversedMeaning: "รับอารมณ์คนอื่นมากเกิน ใจล้า หรือขอบเขตไม่ชัด",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2013.jpeg",
  },
  {
    number: "14",
    name: "KING OF CUPS",
    thai: "ราชาถ้วย",
    symbol: "💧",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "วุฒิภาวะทางอารมณ์ ความนิ่ง และการตอบสนองอย่างมีสติ",
    reversedMeaning: "เก็บอารมณ์มากเกิน คุมความรู้สึกจนห่าง หรืออารมณ์ขึ้นลงภายใน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Cups%2014.jpeg",
  },
  {
    number: "01",
    name: "ACE OF SWORDS",
    thai: "เอซดาบ",
    symbol: "⚔",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความคิดชัด ความจริง การตัดสินใจ และการตัดสิ่งสับสน",
    reversedMeaning: "ความคิดสับสน ข้อมูลคลาดเคลื่อน หรือยังไม่พร้อมตัดสิน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2001.jpeg",
  },
  {
    number: "02",
    name: "TWO OF SWORDS",
    thai: "สองดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ภาวะชั่งใจ ทางเลือกสองด้าน และยังไม่อยากตัดสิน",
    reversedMeaning: "ความลังเลเริ่มแตก การตัดสินใจที่เลี่ยงมานาน หรือข้อมูลใหม่เข้ามา",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2002.jpeg",
  },
  {
    number: "03",
    name: "THREE OF SWORDS",
    thai: "สามดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความเจ็บใจ ความผิดหวัง และความจริงที่กระทบความรู้สึก",
    reversedMeaning: "การเยียวยา การให้อภัย และความเจ็บที่เริ่มคลาย",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2003.jpeg",
  },
  {
    number: "04",
    name: "FOUR OF SWORDS",
    thai: "สี่ดาบ",
    symbol: "⚔",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การพัก ฟื้นแรง และถอยจากความวุ่นวายเพื่อคิด",
    reversedMeaning: "พักไม่พอ ใจยังไม่หยุด หรือถูกบังคับให้กลับมาเคลื่อนไหว",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2004.jpeg",
  },
  {
    number: "05",
    name: "FIVE OF SWORDS",
    thai: "ห้าดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความขัดแย้ง เกมอำนาจ และชัยชนะที่อาจมีต้นทุน",
    reversedMeaning: "การลดความขัดแย้ง ยอมวางทิฐิ หรือเลือกไม่เล่นเกมเดิม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2005.jpeg",
  },
  {
    number: "06",
    name: "SIX OF SWORDS",
    thai: "หกดาบ",
    symbol: "⚔",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การเคลื่อนจากช่วงหนักไปสู่ที่สงบกว่า และการเปลี่ยนผ่าน",
    reversedMeaning: "ติดอยู่กับปัญหาเดิม การเดินหน้าช้า หรือยังมีเรื่องที่ต้องปล่อย",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2006.jpeg",
  },
  {
    number: "07",
    name: "SEVEN OF SWORDS",
    thai: "เจ็ดดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "กลยุทธ์ การเก็บข้อมูล และสิ่งที่ไม่ได้พูดตรง ๆ",
    reversedMeaning: "ความจริงเริ่มเปิด การยอมรับ หรือแผนที่ซ่อนอยู่เริ่มถูกเห็น",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2007.jpeg",
  },
  {
    number: "08",
    name: "EIGHT OF SWORDS",
    thai: "แปดดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความรู้สึกติดกรอบ ข้อจำกัด และมุมมองที่ทำให้ขยับยาก",
    reversedMeaning: "เริ่มเห็นทางออก ปลดข้อจำกัด และกล้าขยับจากกรอบเดิม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2008.jpeg",
  },
  {
    number: "09",
    name: "NINE OF SWORDS",
    thai: "เก้าดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ความกังวล คิดมาก และความกลัวที่ขยายในใจ",
    reversedMeaning: "ความกังวลเริ่มลด การขอความช่วยเหลือ หรือเห็นว่าสิ่งที่กลัวไม่ทั้งหมดเป็นจริง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2009.jpeg",
  },
  {
    number: "10",
    name: "TEN OF SWORDS",
    thai: "สิบดาบ",
    symbol: "⚔",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "จุดจบของวงจรหนัก ความอิ่มตัว และสิ่งที่ไปต่อแบบเดิมไม่ได้",
    reversedMeaning: "การฟื้นหลังช่วงหนัก เริ่มลุกขึ้น หรือจุดต่ำสุดผ่านไปแล้ว",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2010.jpeg",
  },
  {
    number: "11",
    name: "PAGE OF SWORDS",
    thai: "เด็กถือไพ่ดาบ",
    symbol: "⚔",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "ความอยากรู้ การสังเกต ข่าวสาร และความคิดไว",
    reversedMeaning: "ข่าวลือ คำพูดเร็วเกิน หรือเก็บข้อมูลโดยยังไม่เห็นภาพรวม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2011.jpeg",
  },
  {
    number: "12",
    name: "KNIGHT OF SWORDS",
    thai: "อัศวินดาบ",
    symbol: "⚔",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การเดินหน้าตรง ความเด็ดขาด และการแก้ปัญหาเร็ว",
    reversedMeaning: "รีบตัดสิน ปะทะง่าย หรือใช้เหตุผลโดยไม่ฟังบริบท",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2012.jpeg",
  },
  {
    number: "13",
    name: "QUEEN OF SWORDS",
    thai: "ราชินีดาบ",
    symbol: "⚔",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความชัดเจน อิสระทางความคิด และการตั้งขอบเขต",
    reversedMeaning: "คำพูดคมเกิน ปิดใจ หรือมองทุกอย่างด้วยเหตุผลจนขาดความรู้สึก",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2013.jpeg",
  },
  {
    number: "14",
    name: "KING OF SWORDS",
    thai: "ราชาดาบ",
    symbol: "⚔",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "เหตุผล ภาวะผู้นำทางความคิด และการตัดสินจากข้อเท็จจริง",
    reversedMeaning: "ใช้อำนาจทางคำพูดมากเกิน เย็นชา หรือเหตุผลถูกใช้เพื่อควบคุม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Swords%2014.jpeg",
  },
  {
    number: "01",
    name: "ACE OF PENTACLES",
    thai: "เอซเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "โอกาสด้านเงิน งาน ทรัพยากร และสิ่งที่จับต้องได้",
    reversedMeaning: "โอกาสที่หลุดมือ แผนการเงินไม่ชัด หรือเริ่มโดยฐานยังไม่พร้อม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2001.jpeg",
  },
  {
    number: "02",
    name: "TWO OF PENTACLES",
    thai: "สองเหรียญ",
    symbol: "◉",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การจัดสมดุลหลายเรื่อง เงินเข้าออก และความยืดหยุ่น",
    reversedMeaning: "ภาระหลายด้านจนเสียสมดุล เงินหรือเวลาจัดยาก",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2002.jpeg",
  },
  {
    number: "03",
    name: "THREE OF PENTACLES",
    thai: "สามเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ฝีมือ การร่วมงาน และการสร้างผลงานที่มีมาตรฐาน",
    reversedMeaning: "ทำงานไม่เข้ากัน คุณภาพยังไม่ถึง หรือขาดการวางบทบาท",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2003.jpeg",
  },
  {
    number: "04",
    name: "FOUR OF PENTACLES",
    thai: "สี่เหรียญ",
    symbol: "◉",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "การรักษาทรัพยากร ความมั่นคง และความระวังเรื่องเงิน",
    reversedMeaning: "เริ่มปล่อยความยึดติด ใช้ทรัพยากรยืดหยุ่นขึ้น หรือใช้เงินเกินควร",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2004.jpeg",
  },
  {
    number: "05",
    name: "FIVE OF PENTACLES",
    thai: "ห้าเหรียญ",
    symbol: "◉",
    uprightTone: "caution",
    reversedTone: "hope",
    uprightMeaning: "ช่วงตึง ความขาดแคลน หรือรู้สึกไม่ได้รับการสนับสนุน",
    reversedMeaning: "สถานการณ์เริ่มฟื้น เห็นความช่วยเหลือ หรือค่อย ๆ ออกจากช่วงตึง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2005.jpeg",
  },
  {
    number: "06",
    name: "SIX OF PENTACLES",
    thai: "หกเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การให้และรับอย่างสมดุล ความช่วยเหลือ และการแบ่งทรัพยากร",
    reversedMeaning: "การให้แบบมีเงื่อนไข ความไม่เท่าเทียม หรือพึ่งพามากเกิน",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2006.jpeg",
  },
  {
    number: "07",
    name: "SEVEN OF PENTACLES",
    thai: "เจ็ดเหรียญ",
    symbol: "◉",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การรอผล ประเมินสิ่งที่ลงทุนลงแรง และความอดทน",
    reversedMeaning: "ใจร้อน ผลตอบแทนไม่คุ้ม หรือควรทบทวนว่าลงแรงผิดจุดไหม",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2007.jpeg",
  },
  {
    number: "08",
    name: "EIGHT OF PENTACLES",
    thai: "แปดเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "การฝึกฝน ความขยัน และพัฒนาทักษะด้วยความสม่ำเสมอ",
    reversedMeaning: "ทำแบบเดิมจนล้า ใส่ใจรายละเอียดน้อย หรือยังไม่ยกระดับฝีมือ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2008.jpeg",
  },
  {
    number: "09",
    name: "NINE OF PENTACLES",
    thai: "เก้าเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความพึ่งพาตัวเอง ความมั่นคง และผลจากวินัย",
    reversedMeaning: "ความมั่นคงที่ยังเปราะ ใช้จ่ายเพื่อภาพลักษณ์ หรือพึ่งพาสิ่งภายนอกมากไป",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2009.jpeg",
  },
  {
    number: "10",
    name: "TEN OF PENTACLES",
    thai: "สิบเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ฐานระยะยาว ครอบครัว ทรัพย์สิน และผลที่สะสม",
    reversedMeaning: "ความไม่มั่นคงระยะยาว เรื่องเงินในครอบครัว หรือฐานเดิมต้องจัดใหม่",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2010.jpeg",
  },
  {
    number: "11",
    name: "PAGE OF PENTACLES",
    thai: "เด็กถือไพ่เหรียญ",
    symbol: "◉",
    uprightTone: "hope",
    reversedTone: "caution",
    uprightMeaning: "การเรียนรู้เรื่องงานหรือเงิน โอกาสเล็กที่โตได้ และความตั้งใจ",
    reversedMeaning: "ผัดวัน ขาดแผน หรืออยากได้ผลแต่ยังไม่ลงมือจริง",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2011.jpeg",
  },
  {
    number: "12",
    name: "KNIGHT OF PENTACLES",
    thai: "อัศวินเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความสม่ำเสมอ ความรับผิดชอบ และการเดินช้าแต่มั่นคง",
    reversedMeaning: "ช้าเกิน ติดวิธีเดิม หรือทำตามหน้าที่จนขาดการพัฒนา",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2012.jpeg",
  },
  {
    number: "13",
    name: "QUEEN OF PENTACLES",
    thai: "ราชินีเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความอบอุ่นแบบเป็นรูปธรรม การดูแลทรัพยากร และความมั่นคง",
    reversedMeaning: "ดูแลคนอื่นจนลืมตัวเอง กังวลเรื่องความมั่นคง หรือใช้ทรัพยากรไม่สมดุล",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2013.jpeg",
  },
  {
    number: "14",
    name: "KING OF PENTACLES",
    thai: "ราชาเหรียญ",
    symbol: "◉",
    uprightTone: "positive",
    reversedTone: "caution",
    uprightMeaning: "ความมั่นคง ความชำนาญด้านทรัพยากร และการบริหารระยะยาว",
    reversedMeaning: "ยึดวัตถุมากไป คุมเงิน/งานมากเกิน หรือความมั่นคงถูกใช้เป็นอำนาจ",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/RWS1909%20-%20Pentacles%2014.jpeg",
  },
];

const poems: Record<Topic, Record<Tone, string[]>> = {
  daily: {
    positive: [
      "ตะวันฉายปลายทางเริ่มสว่าง",
      "สิ่งที่ค้างค่อยเปิดทางอย่างสดใส",
      "หากเดินหน้าต่อไปด้วยหัวใจ",
      "ผลที่ได้มีโอกาสสมดังปอง",
    ],
    caution: [
      "แสงจันทร์นวลชวนใจให้สงสัย",
      "สิ่งที่เห็นอาจไม่ใช่อย่างใจหมาย",
      "ช้าสักนิดก่อนตัดสินเรื่องมากมาย",
      "เมื่อหมอกคลายความจริงนั้นจะชัดเอง",
    ],
    hope: [
      "ดาวยังส่องแม้คืนนี้มีเมฆหม่น",
      "ทางที่จนจะค่อยเปิดเมื่อใจมั่น",
      "สิ่งที่หวังอย่าเร่งร้อนให้ทันวัน",
      "ค่อยสร้างฝันด้วยสองมือและความจริง",
    ],
  },

  love: {
    positive: [
      "บางสายตาซ่อนความหมายเกินคำกล่าว",
      "บางเรื่องราวไม่ต้องเอ่ยก็เห็นไหว",
      "เมื่อสองคนยังเฝ้ามองอยู่ไม่ไกล",
      "ความในใจย่อมมีมากกว่าที่เห็น",
    ],
    caution: [
      "ใจหนึ่งใกล้ใจหนึ่งยังลังเล",
      "บางเสน่ห์ปิดซ่อนไม่ให้เห็น",
      "ความรู้สึกบางส่วนยังซ่อนเร้น",
      "ต้องมองเป็นมากกว่าคำที่พูดมา",
    ],
    hope: [
      "ความรู้สึกค่อยก่อตัวอยู่ภายใน",
      "ยังไม่เปิดทั้งหมดตรงหน้า",
      "หากสองใจค่อยเรียนรู้ไปช้า ๆ",
      "ความสัมพันธ์ย่อมมีทางงอกงาม",
    ],
  },

  work: {
    positive: [
      "งานที่ทำเริ่มเห็นทางสว่างแล้ว",
      "สิ่งที่แน่วแน่ทำไว้จะให้ผล",
      "หากเดินหน้าต่อไปไม่วกวน",
      "งานนี้มีผลดีให้ชื่นใจ",
    ],
    caution: [
      "งานตรงหน้ายังมีเงื่อนซ่อนอยู่",
      "อย่าเพิ่งดูด้านเดียวแล้วรีบหมาย",
      "ตรวจเงิน งาน และคนรอบกาย",
      "เมื่อเรื่องคลายจึงค่อยเดินอย่างมั่นคง",
    ],
    hope: [
      "งานที่ทำแม้วันนี้ยังเหนื่อยหนัก",
      "สิ่งที่หวังยังพอเห็นเป็นทางใหม่",
      "หากคุมเงิน คุมงาน และคุมใจ",
      "งานนี้ไปต่อได้ ให้ทำจริง",
    ],
  },

  money: {
    positive: [
      "เงินที่รอเริ่มมีทางให้ไหลเข้า",
      "จากงานเก่าหรือสิ่งสร้างที่ทำไว้",
      "เมื่อมีมากอย่าประมาทในการใช้",
      "เก็บส่วนหนึ่งเอาไว้สร้างวันหน้า",
    ],
    caution: [
      "เงินที่เห็นอาจมิใช่เงินที่เหลือ",
      "ควรเผื่อเรื่องรายจ่ายที่ซ่อนอยู่",
      "ก่อนตัดสินคิดอีกครั้งให้รอบรู้",
      "ผ่านช่วงนี้แล้วประตูจะเปิดเอง",
    ],
    hope: [
      "ทรัพย์ที่หวังยังมีทางให้ไขว่คว้า",
      "แต่มิใช่ลอยมาหาโดยง่ายยิ่ง",
      "เก็บทีละน้อย ค่อยสร้างทุกสิ่ง",
      "วันหนึ่งเงินจะนิ่งกว่าเดิมมา",
    ],
  },
};

const phrases = {
  loveCrush: [
    "แอบชอบ",
    "คนที่ชอบ",
    "คนที่เราชอบ",
    "เขาคิดอะไร",
    "เค้าคิดอะไร",
    "คิดยังไงกับเรา",
    "คิดอย่างไรกับเรา",
    "รู้สึกยังไงกับเรา",
    "รู้สึกอย่างไรกับเรา",
    "มองเราแบบไหน",
    "มีใจไหม",
    "มีใจมั้ย",
    "สนใจเราไหม",
    "สนใจเรามั้ย",
    "ชอบเราไหม",
    "ชอบเรามั้ย",
    "ชอบเราหรือเปล่า",
    "แอบชอบเราไหม",
    "แอบชอบเรามั้ย",
    "คิดเกินเพื่อนไหม",
    "คิดเกินเพื่อนมั้ย",
  ],

  loveContinue: [
    "ความสัมพันธ์นี้ไปรอด",
    "ความสัมพันธ์นี้ไปต่อ",
    "เราสองคนไปต่อ",
    "ควรคบต่อ",
    "คบต่อดีไหม",
    "คบต่อดีมั้ย",
    "ควรเลิกไหม",
    "ควรเลิกมั้ย",
    "เลิกดีไหม",
    "เลิกดีมั้ย",
    "ควรพอไหม",
    "ควรพอมั้ย",
    "รักนี้ไปรอด",
  ],

  loveReturn: [
    "กลับมาคบ",
    "กลับไปคบ",
    "คืนดี",
    "กลับมาเป็นแฟน",
    "มีโอกาสคืนดี",
    "เขาจะกลับมาไหม",
    "เขาจะกลับมามั้ย",
    "เค้าจะกลับมาไหม",
    "แฟนเก่าจะกลับมา",
  ],

  loveTrust: [
    "ไว้ใจเขาได้ไหม",
    "ไว้ใจเค้าได้ไหม",
    "เชื่อใจได้ไหม",
    "เชื่อใจได้มั้ย",
    "จริงใจไหม",
    "จริงใจมั้ย",
    "โกหกไหม",
    "โกหกมั้ย",
    "ปิดบังอะไร",
    "มีอะไรปิดบัง",
  ],

  workSurvival: [
    "งานนี้ไปรอด",
    "งานที่ทำอยู่ไปรอด",
    "จะรอดไหม",
    "จะรอดมั้ย",
    "รอดไหม",
    "รอดมั้ย",
    "รอดหรือเปล่า",
    "ไปต่อได้ไหม",
    "ไปต่อได้มั้ย",
    "ควรไปต่อไหม",
    "ควรไปต่อมั้ย",
    "ควรทำต่อไหม",
    "ควรทำต่อมั้ย",
    "ทำต่อดีไหม",
    "ทำต่อดีมั้ย",
    "เวิร์กไหม",
    "เวิร์กมั้ย",
    "เวิร์คไหม",
    "เวิร์คมั้ย",
    "จะรุ่งไหม",
    "จะรุ่งมั้ย",
    "มีอนาคตไหม",
    "มีอนาคตมั้ย",
    "พอไปได้ไหม",
    "พอไปได้มั้ย",
    "ทำแล้วจะดีไหม",
    "ทำแล้วจะดีมั้ย",
    "ธุรกิจนี้ไปรอด",
    "ร้านนี้ไปรอด",
    "ธุรกิจนี้มีอนาคต",
    "ควรทำธุรกิจนี้",
    "เปิดร้านดีไหม",
    "เปิดร้านดีมั้ย",
  ],

  workQuit: [
    "ลาออกดีไหม",
    "ลาออกดีมั้ย",
    "ควรลาออกไหม",
    "ควรลาออกมั้ย",
    "ออกจากงานดีไหม",
    "ออกจากงานดีมั้ย",
    "เปลี่ยนงานดีไหม",
    "เปลี่ยนงานดีมั้ย",
    "ย้ายงานดีไหม",
    "ย้ายงานดีมั้ย",
    "อยู่ต่อหรือออก",
  ],

  workOpportunity: [
    "จะได้งานนี้ไหม",
    "จะได้งานนี้มั้ย",
    "สมัครงานนี้",
    "มีโอกาสได้งาน",
    "งานใหม่นี้ดีไหม",
    "งานใหม่นี้ดีมั้ย",
    "งานนี้เหมาะไหม",
    "งานนี้เหมาะมั้ย",
    "บริษัทนี้เหมาะไหม",
    "บริษัทนี้เหมาะมั้ย",
    "รับเข้าทำงานไหม",
    "รับเข้าทำงานมั้ย",
  ],

  customerPayment: [
    "ลูกค้าจะจ่าย",
    "ลูกค้าจ่ายไหม",
    "ลูกค้าจ่ายมั้ย",
    "ลูกค้าจะโอน",
    "ลูกค้าจะชำระ",
    "ลูกค้าจะเบี้ยว",
    "เก็บเงินลูกค้า",
    "ลูกค้าค้างเงิน",
    "ลูกค้าค้างจ่าย",
  ],

  customerSale: [
    "ลูกค้าจะซื้อ",
    "ลูกค้าซื้อไหม",
    "ลูกค้าซื้อมั้ย",
    "ลูกค้ารายนี้จะเอา",
    "ลูกค้ารายนี้สนใจจริงไหม",
    "ลูกค้ารายนี้สนใจจริงมั้ย",
    "ปิดการขายได้ไหม",
    "ปิดการขายได้มั้ย",
  ],

  moneyInvest: [
    "ลงทุนดีไหม",
    "ลงทุนดีมั้ย",
    "ควรลงทุนไหม",
    "ควรลงทุนมั้ย",
    "ลงทุนต่อดีไหม",
    "ลงทุนต่อดีมั้ย",
  ],

  moneyLend: [
    "ให้ยืมเงินดีไหม",
    "ให้ยืมเงินดีมั้ย",
    "ควรให้ยืมเงินไหม",
    "ควรให้ยืมเงินมั้ย",
    "ให้เขายืมเงิน",
    "ให้เค้ายืมเงิน",
  ],

  moneyGeneral: [
    "การเงินจะดีขึ้นไหม",
    "การเงินจะดีขึ้นมั้ย",
    "เงินจะดีขึ้นไหม",
    "เงินจะดีขึ้นมั้ย",
    "การเงินเป็นยังไง",
    "การเงินเป็นอย่างไร",
    "รายได้จะดีขึ้น",
    "เงินตึง",
    "เงินไม่พอ",
    "มีปัญหาเรื่องเงิน",
    "หนี้จะเบาลง",
    "จัดการเงินยังไง",
  ],
};

function hasAny(question: string, list: string[]) {
  const q = question.toLowerCase();
  return list.some((item) => q.includes(item));
}

function normalizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/[?!.,ๆฯ'"“”‘’]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateQuestion(question: string) {
  const q = question.trim();

  if (!q) {
    return "เขียนสิ่งที่อยากรู้ก่อน แล้วค่อยเปิดคำตอบ";
  }

  if (q.length < 5) {
    return "คำถามยังสั้นเกินไป ลองเขียนให้ชัดขึ้นอีกนิด";
  }

  const forbiddenTime = [
    "เมื่อไหร่",
    "เมื่อไร",
    "วันไหน",
    "เดือนไหน",
    "ปีไหน",
    "กี่วัน",
    "กี่เดือน",
    "กี่ปี",
    "กี่โมง",
  ];

  if (forbiddenTime.some((word) => q.includes(word))) {
    return "คำถามนี้ถามเรื่องเวลาโดยตรง ลองเปลี่ยนเป็นคำถามเรื่องแนวโน้มหรือสิ่งที่ควรทำแทน";
  }

  const forbiddenNumbers = [
    "กี่คน",
    "กี่ครั้ง",
    "กี่บาท",
    "เท่าไหร่",
    "เท่าไร",
    "เลขอะไร",
    "เลขไหน",
    "หมายเลข",
  ];

  if (forbiddenNumbers.some((word) => q.includes(word))) {
    return "คำถามนี้ต้องการจำนวนหรือตัวเลขที่แน่นอน ลองถามเรื่องแนวโน้มหรือการตัดสินใจแทน";
  }

  if (/\d/.test(q)) {
    return "กรุณาไม่ใส่ตัวเลขในคำถาม";
  }

  return "";
}

function detectIntent(question: string): Intent {
  if (hasAny(question, phrases.loveReturn)) return "love_return";
  if (hasAny(question, phrases.loveTrust)) return "love_trust";
  if (hasAny(question, phrases.loveContinue)) return "love_continue";
  if (hasAny(question, phrases.loveCrush)) return "love_crush";

  if (hasAny(question, phrases.customerPayment)) return "customer_payment";
  if (hasAny(question, phrases.customerSale)) return "customer_sale";

  if (hasAny(question, phrases.workQuit)) return "work_quit";
  if (hasAny(question, phrases.workOpportunity)) return "work_opportunity";
  if (hasAny(question, phrases.workSurvival)) return "work_survival";

  if (hasAny(question, phrases.moneyInvest)) return "money_invest";
  if (hasAny(question, phrases.moneyLend)) return "money_lend";
  if (hasAny(question, phrases.moneyGeneral)) return "money_general";

  const q = question.toLowerCase();

  if (
    /งาน|ธุรกิจ|ร้าน|อาชีพ|โปรเจกต์/.test(q) &&
    /ดีไหม|ดีมั้ย|ไปต่อ|รอด|รุ่ง|อนาคต|เวิร์ก|เวิร์ค/.test(q)
  ) {
    return "work_survival";
  }

  if (
    /รัก|แฟน|คนรัก|ความสัมพันธ์/.test(q) &&
    /ไปต่อ|คบต่อ|พอไหม|พอมั้ย|เลิก|รอด/.test(q)
  ) {
    return "love_continue";
  }

  if (/เงิน|รายได้|รายจ่าย|หนี้|การเงิน|กำไร/.test(q)) {
    return "money_general";
  }

  return "unknown";
}

function detectTopic(intent: Intent): Topic {
  if (
    intent === "love_crush" ||
    intent === "love_continue" ||
    intent === "love_return" ||
    intent === "love_trust"
  ) {
    return "love";
  }

  if (
    intent === "money_general" ||
    intent === "money_invest" ||
    intent === "money_lend"
  ) {
    return "money";
  }

  return "work";
}

function getBaseReading(intent: Intent, tone: Tone): Reading {
  if (intent === "love_crush") {
    return {
      answer:
        tone === "caution"
          ? "เขามีความสนใจในตัวคุณอยู่ แต่ยังมีความลังเลบางอย่าง ทำให้การแสดงออกไม่สม่ำเสมอ"
          : "เขามีแนวโน้มมองคุณในทางที่ดี และมีความสนใจมากกว่าการมองผ่าน ๆ เพียงแต่ความรู้สึกนี้ยังค่อย ๆ ชัดขึ้น",
      example:
        "ลองสังเกตว่าเขาจำรายละเอียดเล็ก ๆ ที่คุณเคยพูดได้ไหม เป็นฝ่ายกลับมาคุยเอง ต่อบทสนทนา หรือพยายามสร้างโอกาสให้ได้อยู่ใกล้กันหรือไม่ พฤติกรรมที่เกิดซ้ำมีน้ำหนักกว่าคำพูดเพียงครั้งเดียว",
      guidance:
        "ไม่ต้องเร่งให้เขาพูดความรู้สึกออกมาตรง ๆ ให้ดูความสม่ำเสมอของการกระทำเป็นหลัก",
      hook:
        "แต่สิ่งที่เขาแสดงออกตอนนี้อาจยังไม่ใช่ทั้งหมด เพราะยังมีเหตุผลบางอย่างที่ทำให้เขาเลือกเก็บความรู้สึกบางส่วนเอาไว้...",
    };
  }

  if (intent === "love_continue") {
    return {
      answer:
        tone === "caution"
          ? "ความสัมพันธ์นี้ยังไม่ถึงจุดที่ต้องจบทันที แต่มีปัญหาบางอย่างที่ถ้าปล่อยให้วนซ้ำ ความรู้สึกของทั้งสองฝ่ายอาจค่อย ๆ ถอยห่าง"
          : "ความสัมพันธ์นี้ยังมีพื้นที่ให้ไปต่อได้ แต่การไปต่อจะต้องเกิดจากคนสองคน ไม่ใช่มีฝ่ายหนึ่งพยายามประคองอยู่เพียงคนเดียว",
      example:
        "ลองดูว่าหลังจากมีปัญหาแล้ว ทั้งสองฝ่ายยังกลับมาคุย ปรับตัว และพยายามแก้เรื่องเดิมหรือไม่ ถ้ามีการเปลี่ยนพฤติกรรมจริง ความสัมพันธ์ยังมีฐานให้ซ่อมได้",
      guidance:
        "อย่าดูแค่ว่ายังรักกันหรือไม่ ให้ดูความเคารพ ความสบายใจ และความพยายามของทั้งสองฝ่ายด้วย",
      hook:
        "ปัญหาที่เห็นอยู่ตอนนี้อาจเป็นเพียงอาการ แต่ต้นเหตุจริงของความสัมพันธ์อาจอยู่ลึกกว่านั้น...",
    };
  }

  if (intent === "love_return") {
    return {
      answer:
        tone === "caution"
          ? "ยังมีความผูกพันบางอย่างหลงเหลืออยู่ แต่การกลับมาคบกันไม่ได้ขึ้นอยู่กับความคิดถึงเพียงอย่างเดียว"
          : "ยังมีพื้นที่ให้เกิดการติดต่อหรือการกลับมาเปิดใจคุยกันได้ แต่การคืนดีจะมีความหมายก็ต่อเมื่อเรื่องที่เคยทำให้แยกจากกันได้รับการแก้จริง",
      example:
        "ถ้าอีกฝ่ายเริ่มกลับมาคุยเอง สนใจชีวิตคุณ หรือพยายามพูดถึงเรื่องที่เคยเกิดขึ้นอย่างจริงจัง นั่นมีน้ำหนักมากกว่าการทักมาเพราะคิดถึงชั่วคราว",
      guidance:
        "ถ้ามีโอกาสกลับมาคุย อย่ารีบกลับไปอยู่ในรูปแบบเดิมทันที ให้ดูว่าอีกฝ่ายพร้อมแก้ปัญหาเดิมจริงหรือไม่",
      hook:
        "สิ่งสำคัญคือ ถ้าเขากลับมา เขากลับมาเพราะอยากสร้างใหม่จริง ๆ หรือเพียงเพราะยังไม่คุ้นกับการไม่มีคุณ...",
    };
  }

  if (intent === "love_trust") {
    return {
      answer:
        tone === "caution"
          ? "ตอนนี้มีบางจุดที่ควรระวัง และไม่ควรเชื่อจากคำพูดเพียงอย่างเดียว ความไว้ใจควรสร้างจากพฤติกรรมที่สม่ำเสมอ"
          : "ยังไม่มีเหตุให้ต้องสรุปในทางร้ายทันที แต่ความเชื่อใจควรมาจากการที่คำพูดและการกระทำไปในทิศทางเดียวกัน",
      example:
        "ลองสังเกตว่าเรื่องที่เขาพูดสอดคล้องกันหรือไม่ และเมื่อคุณถามเรื่องสำคัญ เขาพร้อมอธิบายอย่างตรงไปตรงมาหรือพยายามหลบเลี่ยง",
      guidance:
        "ไม่จำเป็นต้องจับผิด แต่ถ้ามีเรื่องหนึ่งทำให้สงสัยซ้ำ ๆ ควรคุยด้วยข้อเท็จจริงมากกว่าปล่อยให้ความกังวลโตเอง",
      hook:
        "ยังมีบางอย่างในพฤติกรรมของเขาที่ถ้ามองให้ละเอียด จะช่วยแยกได้ว่าความไม่สบายใจนี้มาจากสิ่งที่เกิดขึ้นจริงหรือไม่...",
    };
  }

  if (intent === "work_survival") {
    return {
      answer:
        tone === "caution"
          ? "งานนี้ยังไม่ถึงขั้นหมดทาง แต่ถ้ายังทำแบบเดิมต่อไป มีโอกาสเหนื่อยมากขึ้นโดยที่ผลตอบแทนโตไม่ทันแรงที่ใส่ลงไป"
          : "งานที่ทำอยู่ยังมีทางไปรอด และตอนนี้ยังไม่ใช่จุดที่ควรทิ้ง แต่การอยู่รอดจะขึ้นอยู่กับการเลือกให้ถูกว่าจะทุ่มแรงตรงไหน",
      example:
        "ลองดูว่างานประเภทไหนปิดง่ายกว่า ลูกค้ากลุ่มไหนกลับมาใช้ซ้ำ ช่องทางไหนเริ่มมีคนถามจริง หรือส่วนไหนกินเวลาเยอะแต่แทบไม่สร้างผล",
      guidance:
        "เก็บสิ่งที่เริ่มสร้างผลไว้ ลดส่วนที่กินเงินกินเวลา และทดลองสิ่งใหม่ทีละเรื่องโดยใช้ต้นทุนต่ำก่อน",
      hook:
        "แต่สิ่งที่อาจทำให้งานนี้สะดุดจริง ๆ อาจไม่ได้อยู่ที่ตัวสินค้า หรือตัวงานที่คุณกำลังจับตามองอยู่เลย...",
    };
  }

  if (intent === "work_quit") {
    return {
      answer:
        "การคิดเรื่องเปลี่ยนงานมีเหตุผลรองรับ แต่ยังไม่ควรตัดสินใจจากความเหนื่อยเพียงช่วงเดียว ควรแยกให้ออกว่าคุณกำลังเหนื่อยชั่วคราว หรือระบบของงานนี้ไม่เหมาะจริง ๆ",
      example:
        "ถ้าพยายามแก้ปัญหาเดิมมาหลายครั้งแล้วไม่ดีขึ้น ไม่มีโอกาสโต หรือเริ่มเห็นว่างานไม่ตอบทั้งเรื่องรายได้และการเรียนรู้ นั่นมีน้ำหนักมากกว่าช่วงงานยุ่งธรรมดา",
      guidance:
        "สร้างทางเลือกก่อน เช่น ดูงานใหม่ เตรียมผลงาน หรือวางแผนรายได้สำรอง แล้วค่อยตัดสินใจ",
      hook:
        "เหตุผลที่ทำให้คุณอยากออกตอนนี้อาจยังไม่ใช่ต้นเหตุทั้งหมด...",
    };
  }

  if (intent === "work_opportunity") {
    return {
      answer:
        tone === "caution"
          ? "โอกาสนี้ยังไม่ปิด แต่ยังมีบางจุดที่ทำให้คุณไม่ได้เปรียบเต็มที่"
          : "โอกาสนี้มีสิ่งที่เข้ากับคุณ และมีพื้นที่ให้ผลออกมาในทางที่ดี แต่ยังต้องดูองค์ประกอบจริงด้วย",
      example:
        "ถ้าได้รับการติดต่อกลับ มีการถามรายละเอียดเพิ่มเติม หรือเริ่มคุยเรื่องขั้นตอนถัดไป สิ่งเหล่านี้มีน้ำหนักกว่าการเดาจากความรู้สึก",
      guidance:
        "เตรียมตัวให้ดีที่สุด แต่ควรมองทางเลือกอื่นควบคู่กันไปด้วย",
      hook:
        "ยังมีจุดหนึ่งในโอกาสนี้ที่อาจเป็นทั้งข้อได้เปรียบและจุดเสี่ยงของคุณ...",
    };
  }

  if (intent === "customer_payment") {
    return {
      answer:
        "ลูกค้ารายนี้ยังมีแนวโน้มดำเนินเรื่องการชำระได้ แต่ไม่ควรรอโดยอาศัยคำรับปากเพียงอย่างเดียว ความตั้งใจจะจ่ายกับการชำระจริงเป็นคนละเรื่อง",
      example:
        "ถ้ายังตอบข้อความ รับโทรศัพท์ ให้รายละเอียดเรื่องขั้นตอน หรือยืนยันเอกสาร นั่นต่างจากการเริ่มหลบเลี่ยง เลื่อนซ้ำ และเปลี่ยนเหตุผลไปเรื่อย ๆ",
      guidance:
        "ยืนยันยอด เอกสาร และเงื่อนไขให้ชัด โดยเฉพาะก่อนส่งมอบงานส่วนสำคัญเพิ่ม",
      hook:
        "แต่ความล่าช้านี้เป็นเพียงขั้นตอน หรือมีปัญหาบางอย่างอีกด้านที่เขายังไม่ได้พูดออกมาตรง ๆ...",
    };
  }

  if (intent === "customer_sale") {
    return {
      answer:
        tone === "caution"
          ? "ลูกค้ารายนี้มีความสนใจ แต่ยังไม่ได้อยู่ในจุดที่ตัดสินใจแน่นอน"
          : "ลูกค้ารายนี้มีสัญญาณของความสนใจจริง และมีโอกาสพัฒนาไปสู่การซื้อได้ หากช่วยให้เขาตัดสินใจง่ายขึ้น",
      example:
        "ถ้าเขาถามราคา รายละเอียด เปรียบเทียบตัวเลือก หรือกลับมาถามซ้ำ แปลว่าเขากำลังประเมินอยู่",
      guidance:
        "อย่ารีบลดราคาโดยอัตโนมัติ ลองหาก่อนว่าลูกค้าติดเรื่องราคา ความมั่นใจ ความเหมาะสม หรือขั้นตอนการซื้อ",
      hook:
        "จุดที่ทำให้การขายครั้งนี้สำเร็จอาจเป็นข้อสงสัยเพียงเรื่องเดียวที่ลูกค้ายังไม่ได้พูดออกมาตรง ๆ...",
    };
  }

  if (intent === "money_invest") {
    return {
      answer:
        "เรื่องนี้ไม่ควรตัดสินใจจากคำพยากรณ์อย่างเดียว ควรดูข้อมูลจริง ความเสี่ยง และผลกระทบหากสิ่งที่หวังไม่เป็นไปตามแผน",
      example:
        "ก่อนตัดสินใจ ควรรู้ว่าเงินจะถูกใช้กับอะไร มีค่าใช้จ่ายอะไร และกรณีแย่ที่สุดจะกระทบคุณแค่ไหน",
      guidance:
        "หลีกเลี่ยงการใช้เงินที่จำเป็นต่อค่าใช้จ่ายหลักหรือเงินสำรอง และใช้ข้อมูลจริงเป็นหลัก",
      hook:
        "จุดสำคัญอาจไม่ได้อยู่ที่กำไร แต่อยู่ที่ความเสี่ยงบางส่วนที่ยังมองไม่ครบ...",
    };
  }

  if (intent === "money_lend") {
    return {
      answer:
        "ก่อนให้ยืมเงิน ควรดูความสามารถในการคืนและผลที่จะเกิดกับความสัมพันธ์หากเงินไม่กลับมาตามที่หวัง",
      example:
        "ถ้าอีกฝ่ายอธิบายเหตุผล แผนคืน และเงื่อนไขได้ชัด ย่อมต่างจากการขอยืมโดยไม่มีแผน",
      guidance:
        "อย่าให้ยืมจำนวนที่ถ้าไม่ได้คืนแล้วจะกระทบเงินจำเป็นของคุณ และควรตกลงเงื่อนไขให้ชัด",
      hook:
        "สิ่งที่ต้องมองต่อคือปัญหานี้เป็นเหตุการณ์ครั้งเดียว หรือเป็นรูปแบบที่มีโอกาสเกิดซ้ำ...",
    };
  }

  return {
    answer:
      "การเงินยังสามารถค่อย ๆ แข็งแรงขึ้นได้ แต่จุดสำคัญไม่ใช่การรอเงินก้อนใหญ่ เป็นการทำให้เงินที่เข้ามาอยู่กับคุณได้นานขึ้นและรู้ว่าเงินกำลังไหลออกไปตรงไหน",
    example:
      "บางครั้งสิ่งที่ทำให้เงินตึงไม่ใช่รายจ่ายใหญ่ แต่เป็นค่าใช้จ่ายเล็ก ๆ ที่เกิดซ้ำ หรือเงินที่ออกไปกับงานโดยไม่รู้ว่าคืนผลกลับมาจริงหรือไม่",
    guidance:
      "แยกเงินใช้ เงินสำรอง และเงินสำหรับงานออกจากกัน แล้วดูข้อมูลจริงก่อนตัดสินใจเรื่องสำคัญ",
    hook:
      "ยังมีจุดรั่วบางอย่างที่อาจไม่ได้อยู่ในรายการที่คุณกำลังกังวล...",
  };
}

function getDeepReading(
  intent: Intent,
  secondTone: Tone,
  thirdTone: Tone
) {
  const caution = secondTone === "caution";
  const positivePath = thirdTone === "positive";

  if (intent === "love_crush") {
    return `${
      caution
        ? "เมื่อมองลึกลงไป ความลังเลของเขาอาจเกิดจากความไม่แน่ใจว่าคุณรู้สึกแบบเดียวกัน หรือกลัวว่าถ้าเปิดเผยมากเกินไป ความสัมพันธ์ที่มีอยู่จะเปลี่ยน"
        : "เมื่อมองลึกลงไป ความสนใจของเขามีแนวโน้มกำลังค่อย ๆ เติบโต แต่เขายังต้องการความมั่นใจบางอย่างก่อนจะแสดงออกมากขึ้น"
    } ${
      positivePath
        ? "จากตรงนี้ ความสัมพันธ์มีพื้นที่ให้ชัดขึ้นได้ถ้าคุณปล่อยให้เขาเป็นฝ่ายสร้างจังหวะเข้ามาบ้าง"
        : "จากตรงนี้ยังไม่ควรเร่งความชัดเจน ให้ดูว่าการกระทำของเขาสม่ำเสมอจริงหรือไม่"
    } เมื่อรวมทั้งหมดแล้ว สิ่งที่มีน้ำหนักที่สุดคือการกระทำที่เกิดซ้ำ การกลับเข้ามาหาเอง และความพยายามรักษาความสัมพันธ์`;
  }

  if (
    intent === "love_continue" ||
    intent === "love_return" ||
    intent === "love_trust"
  ) {
    return `${
      caution
        ? "เมื่อมองลึกลงไป ปัญหานี้มีเรื่องที่ยังไม่ได้พูดกันตรง ๆ ซ่อนอยู่ด้วย"
        : "เมื่อมองลึกลงไป ยังมีพื้นที่ที่สามารถใช้สร้างความเข้าใจใหม่ได้"
    } ${
      positivePath
        ? "สิ่งที่จะช่วยให้เรื่องนี้ดีขึ้นคือการคุยกันด้วยสิ่งที่เกิดขึ้นจริง และดูว่าทั้งสองฝ่ายพร้อมเปลี่ยนพฤติกรรมตรงไหน"
        : "สิ่งที่ควรระวังคือการกลับไปวนรูปแบบเดิมโดยหวังว่าความรู้สึกเพียงอย่างเดียวจะเปลี่ยนทุกอย่าง"
    } เมื่อรวมทั้งหมดแล้ว คำตอบไม่ได้อยู่เพียงที่ว่ายังรักกันหรือไม่ แต่อยู่ที่ว่าความสัมพันธ์ยังสร้างความไว้ใจ ความเคารพ และความสบายใจให้กันได้หรือเปล่า`;
  }

  if (
    intent === "work_survival" ||
    intent === "work_quit" ||
    intent === "work_opportunity" ||
    intent === "customer_sale"
  ) {
    return `${
      caution
        ? "เมื่อมองลึกลงไป จุดที่ต้องระวังอาจอยู่ในระบบ ต้นทุน เวลา หรือการเลือกสิ่งที่จะทุ่มแรง มากกว่าตัวงานเพียงอย่างเดียว"
        : "เมื่อมองลึกลงไป มีบางส่วนของงานที่กำลังตอบรับดีกว่าส่วนอื่น และตรงนั้นอาจเป็นเบาะแสสำคัญ"
    } ${
      positivePath
        ? "จากนี้ควรเพิ่มแรงให้กับส่วนที่เริ่มเห็นผลจริง แล้วค่อยขยายอย่างมีข้อมูลรองรับ"
        : "จากนี้ควรชะลอการตัดสินใจใหญ่ แล้วกลับไปดูต้นทุน ผลตอบแทน และปัญหาที่เกิดซ้ำก่อน"
    } เมื่อรวมทั้งหมดแล้ว สิ่งที่เหมาะที่สุดคือเลือกสิ่งที่มีหลักฐานว่ากำลังไปได้ดี และลดแรงจากส่วนที่ยังไม่สร้างผล`;
  }

  if (intent === "customer_payment") {
    return "เมื่อมองลึกลงไป ความล่าช้าอาจเกิดจากทั้งขั้นตอนภายใน สภาพคล่อง หรือการจัดลำดับความสำคัญของลูกค้า สิ่งที่ควรดูไม่ใช่คำรับปากเพียงอย่างเดียว แต่เป็นการเคลื่อนไหวจริง ถ้ายังมีการตอบกลับ ยืนยันเอกสาร และเดินขั้นตอนต่อ ยังมีเหตุให้รออย่างมีเงื่อนไขได้ แต่ถ้าเริ่มเลื่อนซ้ำหรือหลีกเลี่ยงการยืนยัน คุณควรป้องกันตัวเองมากขึ้น";
  }

  return `${
    caution
      ? "เมื่อมองลึกลงไป เรื่องนี้ยังมีจุดเสี่ยงที่ควรตรวจให้ชัดก่อนตัดสินใจ"
      : "เมื่อมองลึกลงไป สถานการณ์นี้ยังสามารถจัดการได้ หากแยกสิ่งที่ควบคุมได้ออกจากสิ่งที่คาดเดาไม่ได้"
  } ${
    positivePath
      ? "ทางที่เหมาะกว่าคือค่อย ๆ เดินด้วยข้อมูลจริงและรักษาพื้นที่เผื่อไว้สำหรับความไม่แน่นอน"
      : "ทางที่เหมาะกว่าคือชะลอการตัดสินใจใหญ่ แล้วตรวจข้อมูลและเงื่อนไขอีกครั้ง"
  } เมื่อรวมทั้งหมดแล้ว ควรใช้สิ่งที่เกิดขึ้นจริงเป็นหลักในการตัดสินใจ`;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [intent, setIntent] = useState<Intent>("unknown");
  const [topic, setTopic] = useState<Topic>("daily");

  const [card, setCard] = useState<DrawnCard>({
    ...cards[0],
    reversed: false,
    tone: cards[0].uprightTone,
    meaning: cards[0].uprightMeaning,
  });
  const [secondCard, setSecondCard] = useState<DrawnCard | null>(null);
  const [thirdCard, setThirdCard] = useState<DrawnCard | null>(null);

  const [reading, setReading] = useState<Reading | null>(null);
  const [deepReading, setDeepReading] = useState("");
  const [resultPoem, setResultPoem] = useState<string[]>([]);

  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [readingType, setReadingType] = useState<"quick" | "custom">("quick");

  const [message, setMessage] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const [credits, setCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditModal, setCreditModal] = useState(false);

  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [readingRecordId, setReadingRecordId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        loadCredits();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setTimeout(() => {
          loadCredits();
        }, 0);
      } else {
        setCredits(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadCredits() {
    setCreditsLoading(true);

    const { data, error } = await supabase.rpc("get_my_credits");

    if (error) {
      console.error("โหลดเครดิตไม่สำเร็จ:", error);
      setCredits(0);
      setCreditsLoading(false);
      return;
    }

    const value = Number(data ?? 0);

    setCredits(Number.isFinite(value) ? value : 0);
    setCreditsLoading(false);
  }

  function randomCard(excludedNames: string[] = []): DrawnCard {
    const available = cards.filter(
      (item) => !excludedNames.includes(item.name)
    );

    const pool = available.length > 0 ? available : cards;
    const base = pool[Math.floor(Math.random() * pool.length)];

    // จำลองการสับไพ่จริง: ตั้งตรง/กลับหัวมีโอกาสเท่ากัน
    const reversed = Math.random() < 0.5;

    return {
      ...base,
      reversed,
      tone: reversed ? base.reversedTone : base.uprightTone,
      meaning: reversed ? base.reversedMeaning : base.uprightMeaning,
    };
  }

  function resetDeepReading() {
    setDeepReading("");
    setSecondCard(null);
    setThirdCard(null);
    setReadingRecordId(null);
  }

  async function saveInitialReading(params: {
    currentUser: User;
    currentQuestion: string | null;
    currentReadingType: "quick" | "custom";
    currentTopic: Topic;
    currentIntent: Intent;
    firstCard: DrawnCard;
    poemLines: string[];
    firstReading: Reading;
  }) {
    const {
      currentUser,
      currentQuestion,
      currentReadingType,
      currentTopic,
      currentIntent,
      firstCard,
      poemLines,
      firstReading,
    } = params;

    const { data, error } = await supabase
      .from("tarot_readings")
      .insert({
        user_id: currentUser.id,
        question: currentQuestion,
        reading_type: currentReadingType,
        topic: currentTopic,
        intent: currentIntent,

        first_card_name: firstCard.reversed ? `${firstCard.name} (REVERSED)` : firstCard.name,
        first_card_thai: `${firstCard.thai} · ${firstCard.reversed ? "กลับหัว" : "ตั้งตรง"}`,
        first_card_symbol: firstCard.symbol,
        first_card_tone: firstCard.tone,

        poem: poemLines,

        answer: firstReading.answer,
        example: firstReading.example,
        guidance: firstReading.guidance,
        hook: firstReading.hook,

        credits_spent: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("บันทึกประวัติไม่สำเร็จ:", error);
      return null;
    }

    return data.id as string;
  }

  async function ensureHistoryRecord() {
    if (readingRecordId) {
      return readingRecordId;
    }

    if (!user || !reading) {
      return null;
    }

    const newId = await saveInitialReading({
      currentUser: user,
      currentQuestion: readingType === "custom" ? question : null,
      currentReadingType: readingType,
      currentTopic: topic,
      currentIntent: intent,
      firstCard: card,
      poemLines: resultPoem,
      firstReading: reading,
    });

    if (newId) {
      setReadingRecordId(newId);
    }

    return newId;
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthMessage("");
    setAuthPassword("");
    setAuthModal(true);
  }

  async function handleAuth() {
    setAuthMessage("");

    const email = authEmail.trim();
    const password = authPassword.trim();

    if (!email) {
      setAuthMessage("กรุณากรอกอีเมล");
      return;
    }

    if (password.length < 6) {
      setAuthMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: authName.trim() || "สมาชิก",
            },
          },
        });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data.session) {
          setAuthMessage("สมัครสมาชิกสำเร็จ");
          setAuthModal(false);
        } else {
          setAuthMessage(
            "สมัครสมาชิกสำเร็จ กรุณาเปิดอีเมลและกดยืนยันบัญชีก่อนเข้าสู่ระบบ"
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthMessage(
            "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน"
          );
          return;
        }

        setAuthMessage("");
        setAuthModal(false);

        setTimeout(() => {
          loadCredits();
        }, 200);
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setCredits(0);
    setDeepReading("");
    setMessage("");
    setReadingRecordId(null);
  }

  function openCustomReading() {
    if (opening) return;

    setMessage("");

    const error = validateQuestion(question);

    if (error) {
      setMessage(error);
      return;
    }

    const detectedIntent = detectIntent(question);

    if (detectedIntent === "unknown") {
      setMessage(
        "ฉันยังจับใจความของคำถามนี้ไม่ชัดพอ จึงไม่อยากเดาคำตอบให้คุณ ลองถามเป็นเรื่องเดียวและเจาะจงขึ้น เช่น “งานนี้ควรไปต่อไหม?” “เขาชอบเราหรือเปล่า?” หรือ “ลูกค้ารายนี้จะจ่ายไหม?”"
      );
      return;
    }

    const fingerprint = normalizeQuestion(question);
    const storageKey = `creatorforge-question-${getTodayKey()}`;

    const raw = localStorage.getItem(storageKey);
    const history: string[] = raw ? JSON.parse(raw) : [];

    if (history.includes(fingerprint)) {
      setMessage(
        "คำถามนี้ถูกถามไปแล้วในวันนี้ ลองใช้เวลากับคำตอบเดิมก่อน แล้วค่อยกลับมาถามเรื่องเดิมใหม่ในวันถัดไป"
      );
      return;
    }

    const detectedTopic = detectTopic(detectedIntent);

    setIntent(detectedIntent);
    setTopic(detectedTopic);
    setReadingType("custom");

    resetDeepReading();

    setOpening(true);
    setOpened(false);

    window.setTimeout(async () => {
      const first = randomCard();

      const firstReading = getBaseReading(detectedIntent, first.tone);
      const poemLines = poems[detectedTopic][first.tone];

      setCard(first);
      setReading(firstReading);
      setResultPoem(poemLines);

      localStorage.setItem(
        storageKey,
        JSON.stringify([...history, fingerprint])
      );

      setOpened(true);
      setOpening(false);

      if (user) {
        const newId = await saveInitialReading({
          currentUser: user,
          currentQuestion: question,
          currentReadingType: "custom",
          currentTopic: detectedTopic,
          currentIntent: detectedIntent,
          firstCard: first,
          poemLines,
          firstReading,
        });

        if (newId) {
          setReadingRecordId(newId);
        }
      }
    }, 1200);
  }

  function openQuickReading(selectedTopic: Topic) {
    if (opening) return;

    setQuestion("");
    setMessage("");

    resetDeepReading();

    let quickIntent: Intent = "work_survival";

    if (selectedTopic === "love") {
      quickIntent = "love_crush";
    }

    if (selectedTopic === "money") {
      quickIntent = "money_general";
    }

    setIntent(quickIntent);
    setTopic(selectedTopic);
    setReadingType("quick");

    setOpening(true);
    setOpened(false);

    window.setTimeout(async () => {
      const first = randomCard();

      const firstReading = getBaseReading(quickIntent, first.tone);
      const poemLines = poems[selectedTopic][first.tone];

      setCard(first);
      setReading(firstReading);
      setResultPoem(poemLines);

      setOpened(true);
      setOpening(false);

      if (user) {
        const newId = await saveInitialReading({
          currentUser: user,
          currentQuestion: null,
          currentReadingType: "quick",
          currentTopic: selectedTopic,
          currentIntent: quickIntent,
          firstCard: first,
          poemLines,
          firstReading,
        });

        if (newId) {
          setReadingRecordId(newId);
        }
      }
    }, 1200);
  }

  async function unlockDeepReading() {
    if (!reading || opening || deepReading) {
      return;
    }

    if (!user) {
      setMessage(
        "กรุณาเข้าสู่ระบบก่อนใช้เครดิตเพื่อเปิดไพ่เพิ่ม"
      );

      openAuth("login");
      return;
    }

    setOpening(true);
    setMessage("");

    const historyId = await ensureHistoryRecord();

    const { data, error } = await supabase.rpc("spend_credits", {
      p_amount: 3,
    });

    if (error) {
      console.error("หักเครดิตไม่สำเร็จ:", error);

      setOpening(false);

      setMessage(
        "เกิดปัญหาในการตรวจสอบเครดิต กรุณาลองใหม่อีกครั้ง"
      );

      return;
    }

    const newBalance = Number(data);

    if (!Number.isFinite(newBalance) || newBalance < 0) {
      setOpening(false);

      setMessage(
        "เครดิตไม่เพียงพอ กรุณาเติมเครดิตเพื่อเปิดไพ่เพิ่ม"
      );

      setCreditModal(true);

      await loadCredits();

      return;
    }

    setCredits(newBalance);

    window.setTimeout(async () => {
      const second = randomCard([card.name]);
      const third = randomCard([card.name, second.name]);

      const contextualDeepText = getDeepReading(
        intent,
        second.tone,
        third.tone
      );

      const deepText =
        `ไพ่ใบที่ 2 ${second.thai} (${second.reversed ? "กลับหัว" : "ตั้งตรง"}) สื่อถึง ${second.meaning} ` +
        `ไพ่ใบที่ 3 ${third.thai} (${third.reversed ? "กลับหัว" : "ตั้งตรง"}) สื่อถึง ${third.meaning} ` +
        contextualDeepText;

      setSecondCard(second);
      setThirdCard(third);
      setDeepReading(deepText);
      setOpening(false);

      if (historyId) {
        const { error: updateError } = await supabase
          .from("tarot_readings")
          .update({
            second_card_name: second.reversed ? `${second.name} (REVERSED)` : second.name,
            second_card_thai: `${second.thai} · ${second.reversed ? "กลับหัว" : "ตั้งตรง"}`,
            second_card_symbol: second.symbol,
            second_card_tone: second.tone,

            third_card_name: third.reversed ? `${third.name} (REVERSED)` : third.name,
            third_card_thai: `${third.thai} · ${third.reversed ? "กลับหัว" : "ตั้งตรง"}`,
            third_card_symbol: third.symbol,
            third_card_tone: third.tone,

            deep_reading: deepText,
            credits_spent: 3,
          })
          .eq("id", historyId);

        if (updateError) {
          console.error(
            "อัปเดตประวัติไพ่เพิ่มไม่สำเร็จ:",
            updateError
          );
        }
      }
    }, 900);
  }

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email ||
    "สมาชิก";

  return (
    <main className="page">
      <style jsx global>{`
        @keyframes tarotFlipIn {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateY(90deg) scale(.94);
          }
          60% {
            opacity: 1;
            transform: perspective(900px) rotateY(-7deg) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) scale(1);
          }
        }

        @keyframes tarotShuffle {
          from {
            transform: translateX(-4px) rotate(-1.5deg);
          }
          to {
            transform: translateX(4px) rotate(1.5deg);
          }
        }

        .card-front {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-front img {
          filter: saturate(.93) contrast(1.03);
        }
      `}</style>

      <header>
        <div className="logo">
          ✦ CREATORFORGE
        </div>

        <nav>
          <a>หน้าหลัก</a>
          <a className="active">
            ดูดวง
          </a>
          <a>เขียนนิยาย</a>
          <a>เว็บบอร์ด</a>
          <a>อ่านนิยาย</a>
          <a>เครดิต</a>
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            className="credit"
            onClick={() => setCreditModal(true)}
          >
            💎{" "}
            {user
              ? creditsLoading
                ? "..."
                : credits
              : "0"}{" "}
            เครดิต
          </button>

          {!user ? (
            <button
              className="credit"
              onClick={() => openAuth("login")}
            >
              👤 เข้าสู่ระบบ
            </button>
          ) : (
            <button
              className="credit"
              onClick={logout}
              title="กดเพื่อออกจากระบบ"
            >
              👤 {displayName} · ออก
            </button>
          )}
        </div>
      </header>

      <section className="tarot-hero">
        <div className="hero-brand">
          <div className="hero-emblem">
            ✦
          </div>

          <div>
            <small>CREATORFORGE</small>
            <h1>Tarot Lounge</h1>
          </div>
        </div>

        <div className="hero-message">
          <p className="hero-eyebrow">
            ไพ่แห่งชะตา · บทกวีแห่งคำพยากรณ์
          </p>

          <h2>
            ถามสิ่งที่ค้างอยู่ในใจ
          </h2>

          <p className="hero-description">
            ถามได้เรื่อง งาน · เงิน · ความรัก · การตัดสินใจ
          </p>

          <div className="hero-rules">
            <span>✓ ถามเรื่องแนวโน้มได้</span>
            <span>✕ ไม่ดูเวลา</span>
            <span>✕ ไม่ดูจำนวน</span>
            <span>✕ ไม่ดูตัวเลข</span>
          </div>
        </div>

        <div className="hero-badge">
          <span>✧</span>

          <div>
            <strong>
              คำตอบแรกฟรี
            </strong>

            <small>
              ดูต่อใช้เครดิต
            </small>
          </div>
        </div>
      </section>

      <section className="content">
        <aside className="panel left">
          <h2>
            🔮 Tarot Lounge
          </h2>

          <p className="muted">
            เลือกเรื่องเพื่อเปิดทันที
          </p>

          <h3>
            ดูแบบรวดเร็ว
          </h3>

          <button
            className="menu"
            onClick={() => openQuickReading("daily")}
          >
            ☀ ไพ่ประจำวัน
          </button>

          <button
            className="menu"
            onClick={() => openQuickReading("love")}
          >
            ♡ ความรัก
          </button>

          <button
            className="menu"
            onClick={() => openQuickReading("work")}
          >
            ▣ การงาน
          </button>

          <button
            className="menu"
            onClick={() => openQuickReading("money")}
          >
            ◉ การเงิน
          </button>

          <div className="question-divider">
            <span />
            <b>หรือ</b>
            <span />
          </div>

          <div className="question-area">
            <h3>
              ถามเรื่องเฉพาะ
            </h3>

            <textarea
              className="question-box"
              placeholder="เช่น งานที่ทำอยู่จะไปรอดมั้ย?"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
            />
          </div>

          {message && (
            <div className="question-warning">
              {message}
            </div>
          )}

          <button
            className="open-button"
            onClick={openCustomReading}
          >
            {opening
              ? "กำลังสับไพ่..."
              : "✦ เปิดไพ่"}
          </button>
        </aside>

        <section className="center">
          <div className="title">
            <p>TAROT READING</p>

            <h1>
              {opened
                ? card.thai
                : "ตั้งจิต แล้วเปิดสิ่งที่อยากรู้"}
            </h1>
          </div>

          <div className="reading-layout">
            <div className="scene">
              <div className="rune-ring rune-one">
                ✦ ☾ ✧ ☀ ✦ ☽ ✧
              </div>

              <div className="rune-ring rune-two">
                ☯ ✦ ☽ ✧ ☀ ✦ ☯
              </div>

              <div
                className="card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {!opened ? (
                  <div
                    className="card-back"
                    style={{
                      animation: opening
                        ? "tarotShuffle .55s ease-in-out infinite alternate"
                        : undefined,
                    }}
                  >
                    <div>☾</div>

                    <div className="eye">
                      ◉
                    </div>

                    <div>✦</div>
                  </div>
                ) : (
                  <div
                    className="card-front"
                    style={{
                      animation: "tarotFlipIn .85s cubic-bezier(.2,.8,.2,1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 10px 5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "#806523",
                          fontFamily: "Georgia, serif",
                          fontWeight: 700,
                        }}
                      >
                        {card.number}
                      </span>

                      <strong
                        style={{
                          color: "#5d471c",
                          fontSize: "10px",
                          letterSpacing: ".8px",
                          textAlign: "right",
                        }}
                      >
                        {card.name}
                      </strong>
                    </div>

                    <div
                      style={{
                        margin: "0 8px 7px",
                        padding: "5px 8px",
                        borderRadius: "999px",
                        textAlign: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: ".5px",
                        color: card.reversed ? "#9c3c35" : "#5b6b2a",
                        background: card.reversed
                          ? "rgba(176,73,62,.12)"
                          : "rgba(92,118,52,.12)",
                        border: card.reversed
                          ? "1px solid rgba(176,73,62,.22)"
                          : "1px solid rgba(92,118,52,.22)",
                      }}
                    >
                      {card.reversed ? "↻ กลับหัว · REVERSED" : "↑ ตั้งตรง · UPRIGHT"}
                    </div>

                    <div
                      style={{
                        position: "relative",
                        flex: 1,
                        minHeight: 0,
                        margin: "0 8px",
                        border: "1px solid rgba(92,65,19,.45)",
                        background: "#d8c793",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={card.image}
                        alt={`${card.name} Tarot Card`}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                          objectPosition: "center",
                          transform: card.reversed ? "rotate(180deg)" : "none",
                          transition: "transform .5s ease",
                        }}
                      />
                    </div>

                    <div
                      className="card-bottom"
                      style={{
                        padding: "7px 8px 9px",
                        textAlign: "center",
                      }}
                    >
                      <strong>
                        {card.thai}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <section className="meaning-panel panel">
              {!opened || !reading ? (
                <div className="waiting">
                  <div className="waiting-symbol">
                    ✦
                  </div>

                  <h2>
                    คำตอบจะปรากฏที่นี่
                  </h2>

                  <p>
                    เลือกเรื่อง หรือเขียนคำถามที่ค้างอยู่ในใจ
                  </p>
                </div>
              ) : (
                <>
                  <div className="poem-inline">
                    {resultPoem.map((line) => (
                      <p key={line}>
                        {line}
                      </p>
                    ))}
                  </div>

                  <div
                    style={{
                      margin: "0 0 18px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(221,180,90,.18)",
                      background: "rgba(221,180,90,.045)",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "5px",
                        color: "#b49a61",
                        fontSize: "10px",
                        letterSpacing: "1px",
                      }}
                    >
                      ความหมายของไพ่ใบนี้ · {card.reversed ? "กลับหัว" : "ตั้งตรง"}
                    </div>
                    <strong style={{ color: "#ead19a", lineHeight: 1.7 }}>
                      {card.meaning}
                    </strong>
                  </div>

                  <div className="direct-answer">
                    <p>
                      <strong>
                        {reading.answer}
                      </strong>
                    </p>

                    <p className="reading-paragraph">
                      {reading.example}
                    </p>

                    <p className="reading-paragraph">
                      {reading.guidance}
                    </p>

                    <p className="reading-hook">
                      {reading.hook}
                    </p>
                  </div>

                  {!deepReading && (
                    <div className="deep-unlock">
                      <button
                        className="deep-button"
                        onClick={unlockDeepReading}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "16px",
                            fontWeight: 700,
                          }}
                        >
                          ✦ เปิดไพ่อีก 2 ใบ
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: "3px",
                            fontSize: "10px",
                            fontWeight: 500,
                            opacity: 0.72,
                          }}
                        >
                          (หัก 3 เครดิต)
                        </span>
                      </button>

                      <small>
                        {user
                          ? `คงเหลือ ${credits} เครดิต`
                          : "เข้าสู่ระบบเพื่อใช้เครดิต"}
                      </small>
                    </div>
                  )}

                  {deepReading && (
                    <div className="deep-result">
                      <div className="deep-cards">
                        {secondCard && (
                          <div
                            className="mini-card"
                            style={{
                              overflow: "hidden",
                              padding: "7px",
                              animation: "tarotFlipIn .75s ease",
                            }}
                          >
                            <img
                              src={secondCard.image}
                              alt={secondCard.name}
                              style={{
                                width: "100%",
                                aspectRatio: "0.58",
                                objectFit: "cover",
                                borderRadius: "7px",
                                display: "block",
                                transform: secondCard.reversed ? "rotate(180deg)" : "none",
                              }}
                            />

                            <strong
                              style={{
                                display: "block",
                                marginTop: "7px",
                              }}
                            >
                              {secondCard.name}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                marginTop: "3px",
                                color: secondCard.reversed ? "#d69a91" : "#a7c889",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              {secondCard.reversed ? "กลับหัว" : "ตั้งตรง"}
                            </span>

                            <span
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#8f8a99",
                                fontSize: "9px",
                                lineHeight: 1.45,
                              }}
                            >
                              {secondCard.meaning}
                            </span>
                          </div>
                        )}

                        {thirdCard && (
                          <div
                            className="mini-card"
                            style={{
                              overflow: "hidden",
                              padding: "7px",
                              animation: "tarotFlipIn .75s .18s ease both",
                            }}
                          >
                            <img
                              src={thirdCard.image}
                              alt={thirdCard.name}
                              style={{
                                width: "100%",
                                aspectRatio: "0.58",
                                objectFit: "cover",
                                borderRadius: "7px",
                                display: "block",
                                transform: thirdCard.reversed ? "rotate(180deg)" : "none",
                              }}
                            />

                            <strong
                              style={{
                                display: "block",
                                marginTop: "7px",
                              }}
                            >
                              {thirdCard.name}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                marginTop: "3px",
                                color: thirdCard.reversed ? "#d69a91" : "#a7c889",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              {thirdCard.reversed ? "กลับหัว" : "ตั้งตรง"}
                            </span>

                            <span
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#8f8a99",
                                fontSize: "9px",
                                lineHeight: 1.45,
                              }}
                            >
                              {thirdCard.meaning}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="deep-final">
                        <p>
                          {deepReading}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </section>

      {authModal && (
        <div
          onClick={() => setAuthModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(2,3,12,.86)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(430px,96vw)",
              padding: "30px",
              border: "1px solid rgba(235,196,104,.34)",
              borderRadius: "20px",
              background:
                "linear-gradient(145deg,#17152f,#090b1d)",
              boxShadow:
                "0 30px 90px rgba(0,0,0,.7)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "32px",
                color: "#e7c36f",
              }}
            >
              ✦
            </div>

            <h2
              style={{
                margin: "8px 0 4px",
                textAlign: "center",
                color: "#efd38a",
                fontFamily: "Georgia, serif",
              }}
            >
              {authMode === "login"
                ? "เข้าสู่ CreatorForge"
                : "สมัครสมาชิก CreatorForge"}
            </h2>

            <p
              style={{
                margin: "0 0 22px",
                textAlign: "center",
                color: "#807c8e",
                fontSize: "11px",
              }}
            >
              {authMode === "login"
                ? "เข้าสู่ระบบเพื่อใช้เครดิตและเก็บประวัติของคุณ"
                : "สมัครสมาชิกใหม่ รับเครดิตเริ่มต้น 10 เครดิต"}
            </p>

            {authMode === "register" && (
              <input
                value={authName}
                onChange={(event) =>
                  setAuthName(event.target.value)
                }
                placeholder="ชื่อที่ต้องการแสดง"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(180,145,205,.25)",
                  outline: "none",
                  background:
                    "rgba(4,6,18,.72)",
                  color: "#eee8df",
                }}
              />
            )}

            <input
              type="email"
              value={authEmail}
              onChange={(event) =>
                setAuthEmail(event.target.value)
              }
              placeholder="อีเมล"
              style={{
                width: "100%",
                padding: "13px 14px",
                marginBottom: "10px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(180,145,205,.25)",
                outline: "none",
                background:
                  "rgba(4,6,18,.72)",
                color: "#eee8df",
              }}
            />

            <input
              type="password"
              value={authPassword}
              onChange={(event) =>
                setAuthPassword(event.target.value)
              }
              placeholder="รหัสผ่านอย่างน้อย 6 ตัว"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAuth();
                }
              }}
              style={{
                width: "100%",
                padding: "13px 14px",
                marginBottom: "12px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(180,145,205,.25)",
                outline: "none",
                background:
                  "rgba(4,6,18,.72)",
                color: "#eee8df",
              }}
            />

            {authMessage && (
              <div
                style={{
                  padding: "11px 12px",
                  marginBottom: "12px",
                  border:
                    "1px solid rgba(225,183,84,.2)",
                  borderRadius: "9px",
                  background:
                    "rgba(225,183,84,.06)",
                  color: "#d8bf88",
                  fontSize: "11px",
                  lineHeight: 1.6,
                }}
              >
                {authMessage}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authLoading}
              style={{
                width: "100%",
                minHeight: "48px",
                border: 0,
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg,#996518,#f2d184 50%,#9e6819)",
                color: "#171006",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {authLoading
                ? "กำลังดำเนินการ..."
                : authMode === "login"
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
            </button>

            <button
              onClick={() => {
                setAuthMode(
                  authMode === "login"
                    ? "register"
                    : "login"
                );

                setAuthMessage("");
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: "15px",
                border: 0,
                background: "transparent",
                color: "#c8ae70",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {authMode === "login"
                ? "ยังไม่มีบัญชี? สมัครสมาชิก"
                : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>

            <button
              onClick={() => setAuthModal(false)}
              style={{
                display: "block",
                margin: "13px auto 0",
                border: 0,
                background: "transparent",
                color: "#777383",
                cursor: "pointer",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {creditModal && (
        <div
          onClick={() => setCreditModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(2,3,12,.82)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(430px,96vw)",
              padding: "30px",
              border:
                "1px solid rgba(235,196,104,.35)",
              borderRadius: "20px",
              background:
                "linear-gradient(145deg,#17152f,#090b1d)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "38px",
              }}
            >
              💎
            </div>

            <h2
              style={{
                margin: "10px 0 6px",
                color: "#efd38a",
              }}
            >
              เครดิตของคุณ
            </h2>

            {user ? (
              <>
                <div
                  style={{
                    margin: "15px 0",
                    color: "#f2d184",
                    fontSize: "34px",
                    fontWeight: 700,
                  }}
                >
                  {credits}
                </div>

                <p
                  style={{
                    color: "#8d899a",
                    fontSize: "12px",
                    lineHeight: 1.7,
                  }}
                >
                  ระบบเติมเครดิตจริงจะเชื่อมในขั้นตอนถัดไป
                </p>

                {credits < 3 && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      borderRadius: "10px",
                      background:
                        "rgba(180,80,70,.08)",
                      border:
                        "1px solid rgba(220,120,100,.18)",
                      color: "#d8a89a",
                      fontSize: "12px",
                    }}
                  >
                    เครดิตไม่เพียงพอ กรุณาเติมเครดิต
                  </div>
                )}
              </>
            ) : (
              <>
                <p
                  style={{
                    margin: "18px 0",
                    color: "#aaa4b0",
                    lineHeight: 1.7,
                  }}
                >
                  กรุณาเข้าสู่ระบบเพื่อดูและใช้เครดิตของคุณ
                </p>

                <button
                  onClick={() => {
                    setCreditModal(false);
                    openAuth("login");
                  }}
                  style={{
                    width: "100%",
                    minHeight: "46px",
                    border: 0,
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg,#996518,#f2d184 50%,#9e6819)",
                    color: "#171006",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  เข้าสู่ระบบ
                </button>
              </>
            )}

            <button
              onClick={() => setCreditModal(false)}
              style={{
                marginTop: "18px",
                border: 0,
                background: "transparent",
                color: "#9994a4",
                cursor: "pointer",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </main>
  );
}