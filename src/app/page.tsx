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

// เปิดใช้ฟรีทั้งระบบชั่วคราว
const FREE_MODE = true;

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
    "เค้าจะกลับมามั้ย",
    "เขาจะกลับมาไหม",
    "เขาจะกลับมามั้ย",
    "จะกลับมาหาไหม",
    "จะกลับมาหามั้ย",
    "จะกลับมาอีกไหม",
    "จะกลับมาอีกมั้ย",
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
  const q = question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // กฎเดิม: จับคำถามที่ระบุเจตนาชัดเจนก่อน
  if (hasAny(q, phrases.loveReturn)) return "love_return";
  if (hasAny(q, phrases.loveTrust)) return "love_trust";
  if (hasAny(q, phrases.loveContinue)) return "love_continue";
  if (hasAny(q, phrases.loveCrush)) return "love_crush";

  if (hasAny(q, phrases.customerPayment)) return "customer_payment";
  if (hasAny(q, phrases.customerSale)) return "customer_sale";

  if (hasAny(q, phrases.workQuit)) return "work_quit";
  if (hasAny(q, phrases.workOpportunity)) return "work_opportunity";
  if (hasAny(q, phrases.workSurvival)) return "work_survival";

  if (hasAny(q, phrases.moneyInvest)) return "money_invest";
  if (hasAny(q, phrases.moneyLend)) return "money_lend";
  if (hasAny(q, phrases.moneyGeneral)) return "money_general";

  // จับคำถามภาษาธรรมชาติเรื่อง "การกลับมา/ติดต่อ"
  // เช่น "ฝนจะกลับมามั้ย", "นิดเค้าจะโทรมามั้ย", "เขาจะทักมาไหม"
  if (
    /(กลับมา|กลับมาหา|กลับมาคุย|กลับมาคบ|คืนดี|โทรมา|โทรหา|โทรกลับ|ทักมา|ส่งข้อความ|ติดต่อมา|ติดต่อกลับ|คุยอีก|เจอกันอีก)/.test(q) &&
    /(เขา|เค้า|แฟน|คนรัก|อดีตแฟน|คนชื่อ|คนนั้น|คนนี้|จะโทร|จะทัก|จะติดต่อ|จะกลับ)/.test(q)
  ) {
    return "love_return";
  }

  // แยกบริบทงาน ลูกค้า และการเงินก่อน
  // เพื่อไม่ให้คำว่า เขา / เค้า / คนนั้น ถูกตีความเป็นเรื่องความรักผิดหมวด
  const hasWorkContext =
    /งาน|บริษัท|หัวหน้า|เจ้านาย|เพื่อนร่วมงาน|สมัครงาน|สัมภาษณ์|อาชีพ|ธุรกิจ|ร้าน|โปรเจกต์/.test(q);

  const hasCustomerContext =
    /ลูกค้า|ผู้ซื้อ|คนซื้อ|ผู้ว่าจ้าง|เจ้าของงาน|คู่ค้า/.test(q);

  const hasMoneyContext =
    /เงิน|รายได้|รายจ่าย|หนี้|กำไร|การเงิน|ลงทุน|หุ้น|กู้|ยืม|ชำระ|จ่ายเงิน|โอนเงิน/.test(q);

  if (
    hasWorkContext &&
    /ลาออก|ออกจากงาน|เปลี่ยนงาน|ย้ายงาน|ควรออก/.test(q)
  ) {
    return "work_quit";
  }

  if (
    hasWorkContext &&
    /โอกาส|ได้งาน|รับไหม|รับมั้ย|ผ่านไหม|ผ่านมั้ย|สัมภาษณ์/.test(q)
  ) {
    return "work_opportunity";
  }

  if (
    hasWorkContext &&
    /ดีไหม|ดีมั้ย|ไปต่อ|รอด|รุ่ง|อนาคต|เวิร์ก|เวิร์ค|เป็นยังไง|เป็นอย่างไร/.test(q)
  ) {
    return "work_survival";
  }

  if (
    hasCustomerContext &&
    /จ่าย|ชำระ|โอน|เงิน|ยอด|ค้าง|เบี้ยว/.test(q)
  ) {
    return "customer_payment";
  }

  if (hasCustomerContext) {
    return "customer_sale";
  }

  if (
    hasMoneyContext &&
    /ลงทุน|หุ้น|กองทุน|คริปโต|ธุรกิจใหม่/.test(q)
  ) {
    return "money_invest";
  }

  if (
    hasMoneyContext &&
    /ยืม|ให้ยืม|กู้|ให้กู้/.test(q)
  ) {
    return "money_lend";
  }

  if (hasMoneyContext) {
    return "money_general";
  }

  // ความสัมพันธ์ที่ระบุชัด
  if (
    /รัก|แฟน|คนรัก|ความสัมพันธ์/.test(q) &&
    /ไปต่อ|คบต่อ|พอไหม|พอมั้ย|เลิก|รอด/.test(q)
  ) {
    return "love_continue";
  }

  /*
    LOVE PERSON INFERENCE

    ถ้าผู้ใช้พูดถึง เขา / เค้า / คนนั้น / คนที่คิดถึง
    โดยไม่มีบริบทงาน ลูกค้า หรือการเงิน
    ให้ตีความว่าเป็นคนสำคัญ คนรัก หรือคนที่ผู้ใช้กำลังคิดถึง
  */
  const hasPersonReference =
    /เขา|เค้า|คนนั้น|คนๆนั้น|คน ๆ นั้น|คนนี้|คนที่คิดถึง|คนที่ชอบ|คนสำคัญ|ผู้ชายคนนั้น|ผู้หญิงคนนั้น|แฟน|คนรัก|อดีตแฟน/.test(q);

  const asksFeelingOrThought =
    /คิดอะไร|คิดยังไง|คิดอย่างไร|รู้สึกอะไร|รู้สึกยังไง|รู้สึกอย่างไร|มองยังไง|มองอย่างไร|มองเรา|มีใจ|ชอบ|สนใจ|คิดถึง|แคร์|ห่วง|รัก/.test(q);

  const asksBehavior =
    /ทำอะไร|ทำไม.*เงียบ|ทำไม.*หาย|ทำไม.*ไม่ทัก|ทำไม.*ไม่ตอบ|ทำไม.*ทำแบบนี้|เป็นอะไร|เป็นยังไง|เป็นอย่างไร|ต้องการอะไร|อยากได้อะไร/.test(q);

  if (
    hasPersonReference &&
    (asksFeelingOrThought || asksBehavior)
  ) {
    return "love_crush";
  }

  if (
    hasPersonReference &&
    /เรา|กับเรา|ระหว่างเรา|ความสัมพันธ์|เรื่องของเรา|ต่อเรา/.test(q)
  ) {
    return "love_crush";
  }

  // fallback เดิม
  if (
    /งาน|ธุรกิจ|ร้าน|อาชีพ|โปรเจกต์/.test(q) &&
    /ดีไหม|ดีมั้ย|ไปต่อ|รอด|รุ่ง|อนาคต|เวิร์ก|เวิร์ค/.test(q)
  ) {
    return "work_survival";
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


type QuestionFocus =
  | "call"
  | "message"
  | "contact"
  | "reconcile"
  | "return"
  | "general";

function getQuestionFocus(question: string): QuestionFocus {
  const q = question.toLowerCase();

  if (/โทรมา|โทรหา|โทรกลับ|โทรศัพท์/.test(q)) return "call";
  if (/ทักมา|ส่งข้อความ|แชต|แชท|ข้อความ/.test(q)) return "message";
  if (/ติดต่อมา|ติดต่อกลับ|คุยอีก|คุยกันอีก/.test(q)) return "contact";
  if (/คืนดี|กลับมาคบ|คบกันใหม่|เริ่มใหม่/.test(q)) return "reconcile";
  if (/กลับมา|กลับมาหา|กลับมาอีก/.test(q)) return "return";

  return "general";
}

function getPersonLabel(question: string) {
  const q = question.trim();

  const patterns = [
    /^คนชื่อ\s*([^\sเขาเค้า]{1,20})/i,
    /^([ก-๙A-Za-z]{1,20})\s*(?:เขา|เค้า)\s*จะ/i,
    /^([ก-๙A-Za-z]{1,20})\s*จะ(?:โทร|ทัก|ติดต่อ|กลับ)/i,
  ];

  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "เขา";
}

function getLoveReturnDirectAnswer(tone: Tone, question: string) {
  const focus = getQuestionFocus(question);
  const person = getPersonLabel(question);

  const positive = {
    call: `มีโอกาสค่อนข้างมากที่${person}จะโทรมาหรือหาเหตุให้ได้คุยกันอีก แต่ยังควรดูต่อว่าการติดต่อครั้งนั้นต่อเนื่องแค่ไหน`,
    message: `มีโอกาสค่อนข้างมากที่${person}จะทักหรือส่งข้อความมาอีก แต่การทักครั้งแรกยังไม่เท่ากับว่าเขาตัดสินใจกลับมาเริ่มใหม่แล้ว`,
    contact: `มีโอกาสค่อนข้างมากที่${person}จะกลับมาติดต่อหรือเปิดทางคุยกันอีก และมีน้ำหนักมากกว่าการเงียบหายไปเลย`,
    reconcile: `มีโอกาสที่${person}จะกลับมาเปิดเรื่องความสัมพันธ์อีกครั้ง แต่การคืนดีจริงยังต้องดูว่าเรื่องเดิมได้รับการแก้หรือไม่`,
    return: `มีโอกาสค่อนข้างมากที่${person}จะกลับมาติดต่อหรือกลับมาใกล้กันอีก แต่ยังไม่ควรตีความทันทีว่าเป็นการกลับมาคบกัน`,
    general: `มีแนวโน้มที่${person}จะกลับเข้ามาในชีวิตหรือเกิดการติดต่อกันอีก แต่ยังต้องดูความต่อเนื่องหลังจากนั้น`,
  }[focus];

  const caution = {
    call: `ตอนนี้ยังไม่เห็นแนวโน้มชัดว่า${person}จะโทรมาในเร็ว ๆ นี้ ถ้ามีการติดต่อก็อาจยังมาแบบลังเลหรือไม่ต่อเนื่อง`,
    message: `ตอนนี้ยังไม่เห็นแนวโน้มชัดว่า${person}จะทักมาอย่างจริงจัง ถ้ามีข้อความเข้ามาก็อาจเป็นการลองเชิงมากกว่าการกลับมาเต็มตัว`,
    contact: `ตอนนี้แนวโน้มการติดต่อจาก${person}ยังไม่เด่นชัด แม้ยังมีช่องให้กลับมาคุยกันได้ แต่ความลังเลยังมีน้ำหนักมาก`,
    reconcile: `ตอนนี้ยังไม่เห็นแนวโน้มชัดว่า${person}จะกลับมาเพื่อคืนดีจริงจัง แม้ความสัมพันธ์อาจยังไม่ปิดสนิท`,
    return: `ตอนนี้ยังไม่เห็นแนวโน้มชัดว่า${person}จะกลับมาเพื่อเริ่มใหม่จริงจัง แม้ยังมีโอกาสวนกลับมาติดต่อกันอีก`,
    general: `ตอนนี้ยังไม่เห็นแนวโน้มชัดว่า${person}จะกลับเข้ามาอย่างจริงจัง แม้เรื่องนี้ยังไม่ถือว่าปิดสนิท`,
  }[focus];

  const hope = {
    call: `มีโอกาสที่${person}จะโทรมาหรือกลับมาคุยกันอีก แต่จังหวะยังไม่นิ่งพอที่จะบอกว่าเกิดขึ้นแน่นอน`,
    message: `มีโอกาสที่${person}จะทักหรือส่งข้อความมาอีก แต่ยังอยู่ในช่วงที่ความลังเลกับความคิดถึงพอ ๆ กัน`,
    contact: `มีโอกาสที่${person}จะกลับมาติดต่อกันอีก แต่ยังไม่ชัดว่าเขาจะเข้ามาเพียงชั่วคราวหรืออยากสร้างความต่อเนื่อง`,
    reconcile: `ยังมีพื้นที่ให้${person}กลับมาเปิดเรื่องความสัมพันธ์ แต่ตอนนี้ยังไม่ชัดพอว่าจะพัฒนาไปถึงการคืนดี`,
    return: `มีโอกาสที่${person}จะกลับมาติดต่อหรือกลับมาใกล้กันอีก แต่ยังไม่ชัดว่าจะกลับมาเพื่อเริ่มใหม่หรือเพราะความผูกพันเดิม`,
    general: `ยังมีโอกาสที่${person}จะกลับเข้ามาในภาพอีกครั้ง แต่คำตอบยังอยู่กึ่งกลางและต้องดูการกระทำต่อจากนั้น`,
  }[focus];

  if (tone === "positive") return positive;
  if (tone === "caution") return caution;
  return hope;
}


type LoveQuestionFocus =
  | "thought"
  | "feeling"
  | "like"
  | "behavior"
  | "general";

function getLoveQuestionFocus(question: string): LoveQuestionFocus {
  const q = question.toLowerCase();

  if (/คิดอะไรอยู่|คิดอะไร|คิดยังไง|คิดอย่างไร|มองยังไง|มองอย่างไร|มองเรา/.test(q)) {
    return "thought";
  }

  if (/รู้สึกอะไร|รู้สึกยังไง|รู้สึกอย่างไร|ความรู้สึก/.test(q)) {
    return "feeling";
  }

  if (/ชอบ|มีใจ|รัก|สนใจเรา|สนใจผม|สนใจฉัน/.test(q)) {
    return "like";
  }

  if (/ทำไม.*เงียบ|ทำไม.*หาย|ทำไม.*ไม่ทัก|ทำไม.*ไม่ตอบ|ทำไม.*ทำแบบนี้|ต้องการอะไร|อยากได้อะไร/.test(q)) {
    return "behavior";
  }

  return "general";
}

function getLoveCrushDirectAnswer(tone: Tone, question: string) {
  const focus = getLoveQuestionFocus(question);
  const person = getPersonLabel(question);

  if (focus === "thought") {
    if (tone === "positive") {
      return `ถ้าดูจากแนวโน้ม ${person}น่าจะกำลังคิดถึงคุณในทางที่ดี และกำลังดูท่าทีว่าความสัมพันธ์นี้จะขยับไปได้แค่ไหน แต่ยังไม่ได้แสดงออกทั้งหมด`;
    }
    if (tone === "caution") {
      return `ถ้าดูจากแนวโน้ม ${person}น่าจะกำลังลังเลและคิดเยอะเกี่ยวกับความสัมพันธ์นี้ มากกว่าจะมีคำตอบชัด ๆ ในใจตอนนี้`;
    }
    return `ถ้าดูจากแนวโน้ม ${person}น่าจะกำลังชั่งใจและสังเกตท่าทีของคุณอยู่ มีความสนใจอยู่บ้าง แต่ยังไม่ถึงขั้นตัดสินใจชัดเจน`;
  }

  if (focus === "feeling") {
    if (tone === "positive") {
      return `มีแนวโน้มว่า ${person}รู้สึกดีกับคุณและเปิดรับความสัมพันธ์นี้ แต่ยังค่อย ๆ ดูจังหวะก่อนแสดงออกให้ชัด`;
    }
    if (tone === "caution") {
      return `ตอนนี้ความรู้สึกของ${person}ดูยังไม่มั่นคง มีทั้งความสนใจและความลังเลปนกัน จึงยังไม่ควรสรุปว่าเขาพร้อมเดินหน้า`;
    }
    return `มีแนวโน้มว่า ${person}มีความรู้สึกบางอย่างต่อคุณ แต่ยังอยู่ในช่วงที่กำลังดูใจและยังไม่แสดงออกทั้งหมด`;
  }

  if (focus === "like") {
    if (tone === "positive") {
      return `มีสัญญาณว่า ${person}มีความสนใจหรือมีใจให้คุณอยู่พอสมควร แต่ยังควรดูการกระทำต่อเนื่องก่อนสรุปว่าเขาต้องการความสัมพันธ์แบบจริงจัง`;
    }
    if (tone === "caution") {
      return `ตอนนี้ยังไม่ชัดพอจะบอกว่า ${person}ชอบคุณแบบจริงจัง เพราะความลังเลยังเด่นกว่าความชัดเจน`;
    }
    return `มีโอกาสว่า ${person}สนใจคุณมากกว่าคนทั่วไป แต่ความรู้สึกยังอยู่ในช่วงก่อตัวและยังไม่ชัดเต็มที่`;
  }

  if (focus === "behavior") {
    return tone === "caution"
      ? `พฤติกรรมของ${person}ตอนนี้ดูเหมือนมาจากความลังเลและการถอยไปคิด มากกว่าจะเป็นการปิดคุณออกไปแบบเด็ดขาด`
      : `พฤติกรรมของ${person}ดูเหมือนยังมีความสนใจอยู่ แต่เขากำลังเลือกจังหวะและยังไม่พร้อมแสดงออกตรง ๆ`;
  }

  return tone === "caution"
    ? `ความสัมพันธ์นี้ยังมีความไม่แน่ใจอยู่มาก จึงยังไม่ควรตีความแทนความคิดหรือความรู้สึกของ${person}จากสัญญาณเพียงไม่กี่อย่าง`
    : `ความสัมพันธ์นี้ยังมีพื้นที่ให้พัฒนาได้ และ${person}มีแนวโน้มเปิดรับคุณอยู่ แต่ต้องดูการกระทำจริงควบคู่กัน`;
}

function getBaseReading(intent: Intent, tone: Tone, question = ""): Reading {
  if (intent === "love_crush") {
    const focus = getLoveQuestionFocus(question);

    return {
      answer: getLoveCrushDirectAnswer(tone, question),
      example:
        focus === "thought"
          ? "สิ่งที่ควรดูคือเขากลับมาเริ่มบทสนทนาเองไหม จำเรื่องที่คุณเคยพูดได้ไหม หรือพยายามหาเหตุให้ได้คุยกันต่อ ถ้าพฤติกรรมพวกนี้เกิดซ้ำ จะมีน้ำหนักมากกว่าการเดาว่าเขาคิดอะไรจากครั้งเดียว"
          : focus === "feeling" || focus === "like"
          ? "ตัวอย่างเช่น ถ้าเขาเป็นฝ่ายทักเอง หาเวลาอยู่ใกล้ สนใจรายละเอียดของคุณ หรือกลับมาคุยต่อเนื่อง สิ่งเหล่านี้มีน้ำหนักกว่าคำพูดดี ๆ เพียงครั้งเดียว"
          : "ลองดูการกระทำที่เกิดซ้ำ เช่น เขาเป็นฝ่ายกลับมาคุยเอง ตอบต่อเนื่อง หรือพยายามรักษาการติดต่อไว้หรือไม่",
      guidance:
        "อย่ารีบถามให้เขาตอบความรู้สึกทันที ให้พื้นที่เขาแสดงออกด้วยการกระทำ และดูความสม่ำเสมอเป็นหลัก เพราะเราไม่สามารถรู้ความคิดในใจของอีกฝ่ายได้แน่นอนจากการเปิดไพ่",
      hook:
        focus === "thought"
          ? "แต่ยังมีจุดหนึ่งที่น่าสนใจว่า สิ่งที่เขากำลังคิดอยู่นี้มีแนวโน้มจะพัฒนาเป็นการลงมือทำจริง หรือจะยังคงอยู่แค่ในใจ..."
          : "แต่ยังมีบางอย่างที่คำตอบแรกยังไม่คลี่ชัด ว่าความสนใจนี้จะพัฒนาเป็นการกระทำที่ชัดขึ้นหรือไม่...",
    };
  }

  if (intent === "love_continue") {
    return {
      answer:
        tone === "caution"
          ? "ความสัมพันธ์นี้ยังไปต่อได้ แต่ถ้ายังใช้รูปแบบเดิมต่อ มีโอกาสเหนื่อยและห่างกันมากขึ้น"
          : tone === "positive"
          ? "ความสัมพันธ์นี้ยังมีโอกาสไปต่อค่อนข้างดี ถ้าทั้งสองฝ่ายยอมปรับสิ่งที่เคยทำให้ติดขัด"
          : "ยังมีพื้นที่ให้ไปต่อได้ แต่ยังไม่ใช่จุดที่ควรปล่อยให้ทุกอย่างเดินเองโดยไม่คุยกัน",
      example:
        "ภาพรวมไม่ได้ชี้ว่าความสัมพันธ์หมดทาง แต่มีเรื่องที่ต้องจัดการให้จริงจัง ตัวอย่างเช่น ถ้าหลังมีปัญหาแล้วทั้งคู่ยังกลับมาคุย ขอโทษ แก้พฤติกรรมเดิม และพยายามเข้าใจกัน นั่นมีน้ำหนักมากกว่าการพูดว่าอยากไปต่อเฉย ๆ",
      guidance:
        "ดูสามอย่างเป็นหลัก: ความเคารพ ความสบายใจ และความพยายามที่มาจากทั้งสองฝ่าย ถ้ามีเพียงคนเดียวที่ประคองอยู่ตลอด ควรถามตัวเองว่าความสัมพันธ์นี้ยังยุติธรรมกับคุณหรือไม่",
      hook:
        "สิ่งที่เห็นตอนนี้อาจยังเป็นเพียงปลายเหตุ เพราะต้นตอที่ทำให้ความสัมพันธ์สะดุดจริง ๆ ยังมีอีกชั้นหนึ่ง...",
    };
  }

  if (intent === "love_return") {
    return {
      answer: getLoveReturnDirectAnswer(tone, question),
      example:
        getQuestionFocus(question) === "call"
          ? "ภาพรวมยังมีช่องให้เกิดการติดต่อ แต่ความลังเลยังอยู่ ตัวอย่างเช่น ถ้ามีการโทรมา อาจเริ่มจากเรื่องเล็ก ๆ หรือหาเหตุคุยก่อน ถ้าหลังจากนั้นยังโทรหรือคุยต่อเนื่องเอง นั่นมีน้ำหนักมากกว่าการโทรเพียงครั้งเดียว"
          : getQuestionFocus(question) === "message"
          ? "ภาพรวมยังมีช่องให้เกิดการติดต่อ ตัวอย่างเช่น อาจเริ่มจากการตอบสตอรี่ ส่งข้อความสั้น ๆ หรือถามสารทุกข์สุขดิบก่อน ถ้าการคุยต่อเนื่องและเขาเป็นฝ่ายกลับเข้ามาเองซ้ำ ๆ นั่นจึงมีน้ำหนักมากขึ้น"
          : "ภาพรวมยังไม่ใช่ความสัมพันธ์ที่ปิดสนิท แต่มีทั้งความผูกพันและความลังเลอยู่ด้วยกัน ตัวอย่างเช่น เขาอาจเริ่มจากการทักถามสารทุกข์สุขดิบ หาเหตุคุย หรือกลับมาติดตามชีวิตคุณมากขึ้นก่อน มากกว่าจะพูดเรื่องคืนดีตรง ๆ",
      guidance:
        "ถ้าเขากลับมา อย่ารีบตัดสินจากความคิดถึงเพียงอย่างเดียว ให้ดูว่าเขาเข้ามาสม่ำเสมอไหม กล้าพูดถึงปัญหาเดิมไหม และมีการเปลี่ยนพฤติกรรมจริงหรือเปล่า เพราะการกลับมาที่ดีควรต่างจากรูปแบบเดิมที่เคยทำให้ต้องแยกกัน",
      hook:
        "แต่คำตอบแรกยังทิ้งจุดสำคัญไว้ว่า ถ้าเขากลับมา เขากลับมาเพราะอยากสร้างความสัมพันธ์ใหม่จริง ๆ หรือเพราะความผูกพันเก่ายังดึงเขาไว้...",
    };
  }

  if (intent === "love_trust") {
    return {
      answer:
        tone === "caution"
          ? "ตอนนี้ยังไม่ควรไว้ใจแบบเต็มร้อย ควรให้พฤติกรรมที่สม่ำเสมอเป็นตัวพิสูจน์มากกว่าคำพูด"
          : tone === "positive"
          ? "ยังไม่มีสัญญาณมากพอให้สรุปในทางร้าย แต่ความไว้ใจควรค่อย ๆ สร้างจากสิ่งที่เขาทำจริง"
          : "ยังไม่ควรรีบตัดสินว่าเขาไม่น่าไว้ใจ แต่ก็ควรเปิดตาดูความสอดคล้องระหว่างคำพูดกับการกระทำ",
      example:
        "ภาพรวมยังมีจุดที่ควรตรวจให้ชัด ตัวอย่างเช่น เรื่องที่เขาพูดสอดคล้องกันหรือไม่ เมื่อถามเรื่องสำคัญเขาพร้อมตอบตรง ๆ ไหม และพฤติกรรมหลังจากพูดสัญญาไปแล้วตรงกับที่พูดหรือเปล่า",
      guidance:
        "ไม่จำเป็นต้องจับผิดทุกอย่าง แต่ถ้ามีเรื่องเดิมทำให้สงสัยซ้ำ ๆ ให้คุยด้วยข้อเท็จจริงและตั้งขอบเขตที่ชัดเจน ความไว้ใจที่ดีไม่ควรทำให้คุณต้องคอยตรวจสอบตลอดเวลา",
      hook:
        "ยังมีรายละเอียดบางอย่างที่ถ้ามองลึกลงไป จะช่วยแยกได้ว่าความไม่สบายใจนี้มาจากสิ่งที่เกิดขึ้นจริง หรือมาจากความกลัวที่สะสมอยู่...",
    };
  }

  if (intent === "work_survival") {
    return {
      answer:
        tone === "caution"
          ? "งานนี้ยังไม่หมดทาง แต่ถ้ายังทำแบบเดิมต่อ มีโอกาสเหนื่อยมากขึ้นโดยที่ผลตอบแทนโตไม่ทันแรงที่ใส่ลงไป"
          : tone === "positive"
          ? "งานนี้ยังมีทางไปรอดและมีพื้นที่โตได้ โดยเฉพาะถ้าคุณเลือกทุ่มแรงกับส่วนที่เริ่มตอบรับจริง"
          : "งานนี้ยังพอไปต่อได้ แต่ต้องปรับวิธีและเลือกให้ชัดว่าจะลงทุนแรงกับส่วนไหน",
      example:
        "ภาพรวมชี้ว่าปัญหาไม่ได้อยู่ที่ตัวงานอย่างเดียว แต่อยู่ที่การใช้แรงและทรัพยากร ตัวอย่างเช่น งานประเภทไหนปิดง่ายกว่า ลูกค้ากลุ่มไหนกลับมาใช้ซ้ำ หรือช่องทางไหนเริ่มมีคนถามจริง สิ่งเหล่านี้ควรถูกให้ความสำคัญมากกว่าส่วนที่กินเวลาแต่ไม่สร้างผล",
      guidance:
        "เก็บสิ่งที่เริ่มสร้างผลไว้ ลดส่วนที่กินเงินกินเวลา และทดลองสิ่งใหม่ทีละเรื่องด้วยต้นทุนต่ำก่อน อย่าขยายทุกอย่างพร้อมกัน",
      hook:
        "แต่จุดที่อาจทำให้งานนี้สะดุดจริง ๆ ยังมีอีกด้านหนึ่ง และอาจไม่ใช่สิ่งที่คุณกำลังจับตามองอยู่ตอนนี้...",
    };
  }

  if (intent === "work_quit") {
    return {
      answer:
        tone === "caution"
          ? "ยังไม่ควรลาออกทันที ควรสร้างทางเลือกให้พร้อมก่อน เพราะตอนนี้การออกโดยไม่มีแผนสำรองมีความเสี่ยงมากกว่าประโยชน์"
          : "การเปลี่ยนงานมีเหตุผลรองรับ แต่ควรตัดสินใจจากภาพรวมระยะยาว ไม่ใช่จากความเหนื่อยเพียงช่วงเดียว",
      example:
        "ตัวอย่างเช่น ถ้าพยายามแก้ปัญหาเดิมมาหลายครั้งแล้วไม่ดีขึ้น ไม่มีโอกาสโต หรือรายได้กับภาระงานไม่สมดุลต่อเนื่อง นั่นมีน้ำหนักมากกว่าช่วงงานยุ่งธรรมดา",
      guidance:
        "เริ่มดูงานใหม่ เตรียมผลงาน วางเงินสำรอง และประเมินค่าใช้จ่ายก่อนค่อยตัดสินใจ การออกจากงานจะปลอดภัยกว่าเมื่อคุณมีทางไป ไม่ใช่แค่มีทางหนี",
      hook:
        "เหตุผลที่ทำให้คุณอยากออกตอนนี้อาจยังไม่ใช่ต้นเหตุทั้งหมด และยังมีอีกจุดหนึ่งที่ควรเห็นให้ชัดก่อนตัดสินใจ...",
    };
  }

  if (intent === "work_opportunity") {
    return {
      answer:
        tone === "caution"
          ? "โอกาสนี้ยังไม่ปิด แต่ตอนนี้ยังไม่ได้เปรียบเต็มที่ จึงควรเตรียมแผนสำรองไว้ด้วย"
          : tone === "positive"
          ? "โอกาสนี้มีแนวโน้มไปในทางที่ดี และมีบางอย่างที่เข้ากับคุณ แต่ผลสุดท้ายยังขึ้นอยู่กับขั้นตอนจริง"
          : "โอกาสนี้ยังเปิดอยู่และมีพื้นที่ให้ลุ้น แต่ยังไม่ควรหยุดมองทางเลือกอื่น",
      example:
        "ตัวอย่างเช่น ถ้าได้รับการติดต่อกลับ มีการถามรายละเอียดเพิ่มเติม นัดขั้นตอนถัดไป หรือคุยเรื่องเงื่อนไข สิ่งเหล่านี้มีน้ำหนักกว่าการเดาจากความรู้สึก",
      guidance:
        "เตรียมตัวให้ดีที่สุดและตอบกลับให้ไว แต่เดินหน้าสมัครหรือสร้างโอกาสอื่นควบคู่กันไป เพื่อไม่ฝากความหวังไว้กับทางเดียว",
      hook:
        "ยังมีจุดหนึ่งในโอกาสนี้ที่อาจเป็นทั้งข้อได้เปรียบและจุดที่ทำให้ผลพลิกได้...",
    };
  }

  if (intent === "customer_payment") {
    return {
      answer:
        tone === "caution"
          ? "ยังมีความเสี่ยงที่การจ่ายจะล่าช้าหรือเลื่อนต่อ จึงไม่ควรรอโดยอาศัยคำรับปากอย่างเดียว"
          : "ยังมีแนวโน้มว่าลูกค้าจะดำเนินเรื่องการชำระได้ แต่ควรยืนยันขั้นตอนและกำหนดให้ชัด",
      example:
        "ตัวอย่างเช่น ถ้ายังตอบข้อความ รับโทรศัพท์ ยืนยันเอกสาร หรือแจ้งขั้นตอนภายในอย่างสม่ำเสมอ ยังมีน้ำหนักว่ากระบวนการเดินอยู่ แต่ถ้าเริ่มเลื่อนซ้ำ เปลี่ยนเหตุผล หรือหลบการยืนยัน ควรเพิ่มความระวัง",
      guidance:
        "ยืนยันยอด เอกสาร วันนัดหมาย และเงื่อนไขเป็นลายลักษณ์อักษร โดยเฉพาะก่อนส่งมอบงานส่วนสำคัญเพิ่ม",
      hook:
        "แต่ความล่าช้านี้เป็นเพียงขั้นตอนภายใน หรือมีปัญหาอีกด้านที่ลูกค้ายังไม่ได้พูดออกมาตรง ๆ...",
    };
  }

  if (intent === "customer_sale") {
    return {
      answer:
        tone === "caution"
          ? "ลูกค้ารายนี้มีความสนใจ แต่ยังไม่ถึงจุดตัดสินใจแน่นอน"
          : "ลูกค้ารายนี้มีสัญญาณของความสนใจจริง และมีโอกาสพัฒนาไปสู่การซื้อได้ถ้าช่วยให้เขาตัดสินใจง่ายขึ้น",
      example:
        "ตัวอย่างเช่น ถ้าเขาถามราคา รายละเอียด เปรียบเทียบตัวเลือก หรือกลับมาถามซ้ำ แปลว่าเขากำลังประเมินอยู่ แต่ยังมีข้อสงสัยบางอย่างที่ต้องถูกคลี่ก่อน",
      guidance:
        "อย่ารีบลดราคาโดยอัตโนมัติ ลองหาก่อนว่าลูกค้าติดเรื่องราคา ความมั่นใจ ความเหมาะสม หรือขั้นตอนการซื้อ แล้วตอบให้ตรงจุด",
      hook:
        "สิ่งที่จะตัดสินการขายครั้งนี้อาจเป็นข้อสงสัยเพียงเรื่องเดียวที่ลูกค้ายังไม่ได้พูดออกมาตรง ๆ...",
    };
  }

  if (intent === "money_invest") {
    return {
      answer:
        "เรื่องลงทุนไม่ควรใช้คำทำนายเป็นตัวตัดสินผลกำไรหรือขาดทุน ควรใช้ข้อมูลจริงและความสามารถรับความเสี่ยงเป็นหลัก",
      example:
        "ภาพรวมช่วยใช้เป็นมุมสะท้อนความพร้อมได้ ตัวอย่างเช่น ก่อนลงทุนควรรู้ว่าเงินจะถูกใช้กับอะไร มีค่าใช้จ่ายอะไร และถ้าผลไม่เป็นตามแผนจะกระทบเงินจำเป็นของคุณแค่ไหน",
      guidance:
        "หลีกเลี่ยงการใช้เงินค่าใช้จ่ายหลักหรือเงินสำรอง และตรวจข้อมูล เงื่อนไข และความเสี่ยงจากแหล่งที่เชื่อถือได้ก่อนตัดสินใจ",
      hook:
        "สิ่งที่ควรมองให้ลึกกว่าเรื่องกำไร คือความเสี่ยงบางส่วนที่อาจยังถูกประเมินต่ำเกินไป...",
    };
  }

  if (intent === "money_lend") {
    return {
      answer:
        tone === "caution"
          ? "ตอนนี้ยังไม่ควรให้ยืมโดยไม่มีเงื่อนไขชัดเจน เพราะความเสี่ยงไม่ได้อยู่แค่เรื่องเงิน แต่รวมถึงความสัมพันธ์ด้วย"
          : "ถ้าจะให้ยืม ควรให้ในจำนวนที่คุณรับผลกระทบได้ และต้องมีข้อตกลงเรื่องการคืนที่ชัดเจน",
      example:
        "ตัวอย่างเช่น ถ้าอีกฝ่ายอธิบายเหตุผล แผนคืน และกำหนดเวลาที่สมเหตุสมผลได้ ย่อมต่างจากการขอยืมโดยไม่มีแผนหรือเปลี่ยนเหตุผลไปเรื่อย ๆ",
      guidance:
        "อย่าให้ยืมจำนวนที่ถ้าไม่ได้คืนแล้วจะกระทบเงินจำเป็นของคุณ และควรตกลงเงื่อนไขเป็นลายลักษณ์อักษร",
      hook:
        "ยังมีอีกจุดที่ควรเห็นให้ชัด ว่านี่เป็นเหตุจำเป็นครั้งเดียว หรือเป็นรูปแบบที่มีโอกาสเกิดซ้ำ...",
    };
  }

  return {
    answer:
      tone === "caution"
        ? "การเงินยังพอประคองได้ แต่ตอนนี้ควรเน้นหยุดจุดรั่วและลดความเสี่ยงก่อนคิดเรื่องขยาย"
        : "การเงินมีพื้นที่ค่อย ๆ ดีขึ้นได้ แต่ผลจะมาจากการจัดระบบและรักษาเงินที่เข้ามา มากกว่าการรอเงินก้อนใหญ่",
    example:
      "ภาพรวมชี้ว่าจุดสำคัญอยู่ที่กระแสเงิน ตัวอย่างเช่น ค่าใช้จ่ายเล็ก ๆ ที่เกิดซ้ำ เงินที่ออกไปกับงานโดยไม่รู้ผลตอบแทน หรือรายรับที่เข้ามาแล้วถูกใช้ทันที สิ่งเหล่านี้รวมกันอาจทำให้รู้สึกตึงกว่าที่ควร",
    guidance:
      "แยกเงินใช้ เงินสำรอง และเงินสำหรับงานออกจากกัน แล้วดูตัวเลขจริงก่อนตัดสินใจเรื่องสำคัญ",
    hook:
      "ยังมีจุดรั่วบางอย่างที่อาจไม่ได้อยู่ในรายการที่คุณกำลังกังวล และตรงนั้นอาจเปลี่ยนภาพรวมได้มากกว่าที่คิด...",
  };
}


function getDeepReading(
  intent: Intent,
  firstTone: Tone,
  secondTone: Tone,
  thirdTone: Tone,
  question = ""
) {
  const tones = [firstTone, secondTone, thirdTone];

  const score = tones.reduce((total, tone) => {
    if (tone === "positive") return total + 1;
    if (tone === "caution") return total - 1;
    return total;
  }, 0);

  const strongPositive = score >= 2;
  const positivePath = score >= 1;
  const cautionPath = score <= -1;

  if (intent === "love_return") {
    const focus = getQuestionFocus(question);
    const person = getPersonLabel(question);

    const focusLine =
      focus === "call"
        ? `คำถามของคุณคือว่า ${person}จะโทรมาหรือไม่ — `
        : focus === "message"
        ? `คำถามของคุณคือว่า ${person}จะทักหรือส่งข้อความมาหรือไม่ — `
        : focus === "contact"
        ? `คำถามของคุณคือว่า ${person}จะกลับมาติดต่อหรือไม่ — `
        : focus === "reconcile"
        ? `คำถามของคุณคือว่า ${person}จะกลับมาคืนดีหรือไม่ — `
        : `คำถามของคุณคือว่า ${person}จะกลับมาหรือไม่ — `;

    const conclusion = strongPositive
      ? "บทสรุปหลังมองภาพรวมทั้งหมด: มีโอกาสค่อนข้างมากที่เขาจะกลับมาติดต่อหรือกลับมาเปิดทางคุยกันอีก และครั้งนี้มีน้ำหนักมากกว่าการทักผ่าน ๆ แต่ยังต้องให้การกระทำหลังจากกลับมาเป็นตัวพิสูจน์ว่าจะพัฒนาไปถึงการเริ่มต้นใหม่จริงหรือไม่"
      : cautionPath
      ? "บทสรุปหลังมองภาพรวมทั้งหมด: ยังไม่เห็นแนวโน้มชัดว่าเขาจะกลับมาเพื่อคืนดีอย่างจริงจังในตอนนี้ แม้ยังมีโอกาสเกิดการติดต่อหรือวนกลับมา แต่การกลับมานั้นอาจยังไม่มั่นคงพอที่จะเรียกว่าเริ่มต้นใหม่"
      : "บทสรุปหลังมองภาพรวมทั้งหมด: มีโอกาสที่เขาจะกลับมาติดต่อหรือกลับมาใกล้กันอีก แต่ภาพรวมยังอยู่กึ่งกลางระหว่างความผูกพันเดิมกับความลังเล จึงยังต้องแยกให้ออกว่าเขากลับมาเพราะอยากสร้างใหม่ หรือเพียงเพราะยังตัดความสัมพันธ์เดิมไม่ขาด";

    return `${focusLine}${conclusion}

ขยายความ: ความสัมพันธ์นี้ยังมีเรื่องค้างอยู่และยังไม่ใช่ภาพของการปิดประตูสนิท แต่สิ่งที่จะตัดสินผลจริงไม่ใช่แค่การกลับมาให้เห็นหน้า หรือการทักกันหนึ่งครั้ง อยู่ที่ว่าเขากลับมาแล้วสร้างความต่อเนื่องหรือไม่ และพร้อมเผชิญเรื่องเดิมที่เคยทำให้ความสัมพันธ์หยุดลงหรือเปล่า

ตัวอย่างที่อาจเกิดขึ้น: เขาอาจเริ่มจากการทักธรรมดา ตอบสตอรี่ ถามสารทุกข์สุขดิบ หรือหาเหตุให้ได้คุยกันก่อน ถ้าหลังจากนั้นเขายังคุยต่อเนื่อง เป็นฝ่ายเข้ามาเองมากกว่าหนึ่งครั้ง และเริ่มพูดถึงสิ่งที่เคยเกิดขึ้นอย่างตรงไปตรงมา นั่นจะมีน้ำหนักมากกว่าการกลับมาเพราะคิดถึงชั่วคราว

คำแนะนำ: ถ้าเขากลับมา อย่ารีบตอบคำถามทั้งหมดในวันเดียว และอย่ารีบกลับไปอยู่ในรูปแบบเดิมเพียงเพราะยังรู้สึกดี ให้ดูความสม่ำเสมอ ความรับผิดชอบ และการเปลี่ยนพฤติกรรมก่อน คุณมีสิทธิ์ค่อย ๆ ดูว่าเขากลับมาเพื่อสร้างความสัมพันธ์ที่ดีขึ้นจริง หรือเพียงกลับมาเติมช่องว่างในช่วงหนึ่ง

คำอวยพร: ขอให้ไม่ว่าความสัมพันธ์นี้จะย้อนกลับมาเริ่มใหม่หรือพาคุณไปสู่ทางอื่น คุณได้พบความชัดเจนที่ไม่ทำให้ต้องคอยเดา และได้อยู่กับความสัมพันธ์ที่ให้ทั้งความสบายใจ ความเคารพ และความจริงใจกับคุณ`;
  }

  if (intent === "love_crush") {
    const focus = getLoveQuestionFocus(question);
    const person = getPersonLabel(question);

    const direct =
      focus === "thought"
        ? positivePath
          ? `สรุปตรง ๆ: ${person}มีแนวโน้มกำลังคิดถึงคุณในทางที่ดี และกำลังประเมินว่าควรขยับความสัมพันธ์ต่อหรือไม่`
          : `สรุปตรง ๆ: ${person}น่าจะกำลังลังเลและคิดเยอะเกี่ยวกับคุณอยู่ แต่ยังไม่เห็นความชัดเจนพอว่าจะลงมือทำอะไรต่อ`
        : focus === "feeling" || focus === "like"
        ? positivePath
          ? `สรุปตรง ๆ: ${person}มีแนวโน้มรู้สึกดีกับคุณและมีความสนใจอยู่ แต่ยังไม่ควรถือว่าเป็นคำยืนยันว่าเขาพร้อมคบ`
          : `สรุปตรง ๆ: ความรู้สึกของ${person}ยังไม่ชัดพอ มีทั้งความสนใจและความลังเลปนกัน`
        : positivePath
        ? `สรุปตรง ๆ: ความสัมพันธ์นี้ยังมีพื้นที่พัฒนา และ${person}มีแนวโน้มเปิดรับคุณอยู่`
        : `สรุปตรง ๆ: ตอนนี้ความสัมพันธ์ยังไม่ชัดพอ ควรดูการกระทำต่อมากกว่าการตีความความรู้สึก`;

    return `${direct}

ขยายความ: จุดที่เด่นที่สุดคือเขายังไม่ได้ปิดคุณออกไป แต่ความชัดเจนยังขึ้นอยู่กับว่าเขาจะเปลี่ยนความคิดหรือความรู้สึกนั้นให้เป็นการกระทำหรือไม่

ตัวอย่าง: ถ้าเขาเริ่มทักเอง คุยต่อเนื่อง จำรายละเอียดของคุณ หรือหาเหตุให้ได้เจอหรือได้คุยซ้ำ ๆ นั่นจะมีน้ำหนักมากกว่าสัญญาณครั้งเดียว

คำแนะนำ: อย่าเร่งคำตอบจากเขา ให้ดูความสม่ำเสมอและรักษาขอบเขตของตัวเองไว้ด้วย เพราะเราไม่สามารถรู้ความคิดของอีกฝ่ายได้แบบแน่นอนจากการเปิดไพ่

คำอวยพร: ขอให้ความสัมพันธ์นี้ค่อย ๆ ชัดขึ้นในแบบที่คุณไม่ต้องเดาอยู่ฝ่ายเดียว และได้เจอคนที่แสดงความรู้สึกผ่านการกระทำอย่างจริงใจ`;
  }

  if (intent === "love_continue") {
    const conclusion = positivePath
      ? "บทสรุปหลังมองภาพรวมทั้งหมด: ความสัมพันธ์นี้ยังมีโอกาสไปต่อได้ แต่เงื่อนไขสำคัญคือทั้งสองฝ่ายต้องยอมเปลี่ยนสิ่งที่เคยทำให้ติดขัด ไม่ใช่เพียงกลับมารู้สึกดีชั่วคราว"
      : "บทสรุปหลังมองภาพรวมทั้งหมด: ความสัมพันธ์ยังไม่ถึงขั้นหมดทาง แต่ถ้ารูปแบบเดิมยังเกิดซ้ำโดยไม่มีการแก้จริง การไปต่ออาจทำให้เหนื่อยมากกว่ามีความสุข";

    return `${conclusion}

ขยายความ: ปัญหานี้ไม่ได้มีแค่เรื่องความรู้สึก แต่เกี่ยวกับวิธีสื่อสาร ความไว้ใจ และการรับผิดชอบต่อสิ่งที่เคยเกิดขึ้นด้วย ถ้าสามอย่างนี้เริ่มดีขึ้น ความสัมพันธ์จะมีพื้นที่ฟื้นตัว แต่ถ้ายังมีเพียงคำพูดโดยพฤติกรรมไม่เปลี่ยน ผลก็มีโอกาสวนกลับจุดเดิม

ตัวอย่างที่ควรดู: หลังจากมีปัญหาแล้ว ทั้งคู่กลับมาคุยโดยไม่หนีประเด็นหรือไม่ มีการขอโทษที่ตามด้วยการเปลี่ยนพฤติกรรมหรือไม่ และเวลามีความเห็นต่าง ยังเคารพกันอยู่หรือเปล่า

คำแนะนำ: อย่าตัดสินเพียงจากคำว่า “ยังรัก” ให้ดูว่าความสัมพันธ์นี้ยังปลอดภัย สบายใจ และเป็นธรรมกับคุณไหม ถ้าจะไปต่อ ควรตกลงกันให้ชัดว่ามีเรื่องอะไรที่ทั้งสองฝ่ายต้องช่วยกันเปลี่ยน

คำอวยพร: ขอให้คำตอบที่คุณเลือกพาไปสู่ความสัมพันธ์ที่ไม่ต้องฝืนตัวเอง และมีคนสองคนช่วยกันรักษา ไม่ใช่มีเพียงคนเดียวคอยประคอง`;
  }

  if (intent === "love_trust") {
    const conclusion = cautionPath
      ? "บทสรุปหลังมองภาพรวมทั้งหมด: ยังไม่ควรให้ความไว้ใจแบบเต็มร้อยในตอนนี้ ควรให้เวลาและพฤติกรรมที่สม่ำเสมอพิสูจน์ก่อน"
      : "บทสรุปหลังมองภาพรวมทั้งหมด: ยังไม่มีน้ำหนักมากพอให้สรุปในทางร้าย แต่ความไว้ใจควรถูกสร้างจากความสอดคล้องระหว่างคำพูดกับการกระทำ";

    return `${conclusion}

ขยายความ: ความไม่สบายใจของคุณไม่ควรถูกมองข้าม แต่ก็ไม่ควรกลายเป็นการเดาแทนข้อเท็จจริง สิ่งสำคัญคือดูว่าพฤติกรรมที่ทำให้สงสัยเกิดขึ้นซ้ำหรือไม่ และเมื่อพูดคุยกันแล้ว อีกฝ่ายพร้อมอธิบายและปรับตัวหรือเปล่า

ตัวอย่างที่ควรดู: เรื่องที่เขาเล่าสอดคล้องกันไหม เวลามีคำถามเขาตอบตรงหรือหลบเลี่ยง และหลังจากให้คำมั่นแล้ว พฤติกรรมในช่วงต่อมาสนับสนุนสิ่งที่พูดหรือไม่

คำแนะนำ: ตั้งขอบเขตให้ชัดและคุยด้วยเหตุการณ์จริง ไม่ต้องจับผิดทุกเรื่อง แต่ก็ไม่จำเป็นต้องฝืนเชื่อในสิ่งที่ทำให้คุณไม่สบายใจซ้ำ ๆ

คำอวยพร: ขอให้คุณได้อยู่กับความสัมพันธ์ที่ความจริงไม่ต้องถูกไล่ถาม และความไว้ใจเกิดขึ้นจากสิ่งที่อีกฝ่ายทำให้เห็นอย่างสม่ำเสมอ`;
  }

  if (
    intent === "work_survival" ||
    intent === "work_quit" ||
    intent === "work_opportunity" ||
    intent === "customer_sale"
  ) {
    const conclusion = positivePath
      ? "บทสรุปหลังมองภาพรวมทั้งหมด: เรื่องนี้ยังมีพื้นที่ให้เดินหน้าต่อ และมีบางส่วนที่กำลังตอบรับดีกว่าส่วนอื่น แต่ควรขยายจากสิ่งที่พิสูจน์แล้วแทนการทุ่มทุกอย่างพร้อมกัน"
      : "บทสรุปหลังมองภาพรวมทั้งหมด: เรื่องนี้ยังไม่ใช่ทางตัน แต่ตอนนี้ควรชะลอการตัดสินใจใหญ่และกลับไปดูข้อมูลจริง ต้นทุน เวลา และผลตอบแทนก่อน";

    return `${conclusion}

ขยายความ: จุดสำคัญไม่ได้อยู่ที่คำว่า “ดีหรือไม่ดี” เพียงอย่างเดียว แต่อยู่ที่ส่วนไหนของงานกำลังสร้างผลจริงและส่วนไหนกำลังใช้ทรัพยากรมากเกินไป ถ้าจัดลำดับใหม่ได้ ภาพรวมยังมีโอกาสดีขึ้น

ตัวอย่างที่ควรดู: งานประเภทไหนปิดง่าย ลูกค้ากลุ่มไหนกลับมาใช้ซ้ำ ช่องทางไหนมีคนถามจริง หรือขั้นตอนไหนทำให้เสียเวลามากแต่แทบไม่สร้างผล สิ่งเหล่านี้คือข้อมูลที่ควรใช้ตัดสินใจ

คำแนะนำ: เพิ่มแรงให้สิ่งที่มีหลักฐานว่ากำลังเวิร์ก ลดหรือทดลองใหม่กับส่วนที่ยังไม่สร้างผล และอย่าให้การตัดสินใจครั้งเดียวกินเงินหรือเวลาจนไม่มีพื้นที่แก้ตัว

คำอวยพร: ขอให้งานที่คุณเลือกทำตอบแทนทั้งแรง เวลา และความตั้งใจของคุณ และค่อย ๆ พาไปสู่ความมั่นคงที่วัดได้จากผลจริง`;
  }

  if (intent === "customer_payment") {
    return `บทสรุปหลังมองภาพรวมทั้งหมด: การชำระยังมีทางเกิดขึ้นได้ แต่ควรรอแบบมีเงื่อนไข ไม่ใช่รอจากคำรับปากอย่างเดียว

ขยายความ: ความล่าช้าอาจมาจากขั้นตอนภายใน สภาพคล่อง หรือการจัดลำดับความสำคัญของลูกค้า สิ่งที่มีน้ำหนักคือการเคลื่อนไหวจริง ถ้ายังมีการตอบกลับ ยืนยันเอกสาร และเดินขั้นตอนต่อ ยังมีเหตุให้รอได้ แต่ถ้าเริ่มเลื่อนซ้ำหรือหลีกเลี่ยงการยืนยัน ความเสี่ยงจะสูงขึ้น

ตัวอย่างที่ควรดู: เขายืนยันยอดและเอกสารไหม ให้วันหรือขั้นตอนที่ตรวจสอบได้หรือไม่ และเมื่อถึงวันที่พูดไว้มีการดำเนินการจริงหรือเลื่อนเหตุผลใหม่

คำแนะนำ: ยืนยันทุกอย่างเป็นลายลักษณ์อักษร กำหนดขอบเขตการส่งมอบงานเพิ่ม และเตรียมทางเลือกหากการชำระไม่เป็นไปตามที่ตกลง

คำอวยพร: ขอให้เรื่องเงินจบด้วยความชัดเจน ได้รับสิ่งที่ควรได้รับครบถ้วน และไม่ต้องเสียทั้งเวลาและความสบายใจกับการตามซ้ำ ๆ`;
  }

  return `${cautionPath
    ? "บทสรุปหลังมองภาพรวมทั้งหมด: เรื่องนี้ยังมีจุดเสี่ยงที่ควรตรวจให้ชัดก่อนตัดสินใจใหญ่"
    : "บทสรุปหลังมองภาพรวมทั้งหมด: สถานการณ์ยังมีพื้นที่จัดการได้ ถ้าคุณใช้ข้อมูลจริงและแยกสิ่งที่ควบคุมได้ออกจากสิ่งที่คาดเดาไม่ได้"}

ขยายความ: ภาพรวมไม่ได้เรียกร้องให้รีบตัดสิน แต่ชวนให้ดูเงื่อนไขจริงที่มีผลต่อเรื่องนี้มากที่สุด และเลือกทางที่ยังเหลือพื้นที่ให้แก้ไขได้

ตัวอย่างที่ควรดู: มองหาสิ่งที่เกิดซ้ำ ตัวเลขหรือหลักฐานที่ตรวจสอบได้ และผลจากการตัดสินใจเล็ก ๆ ก่อนใช้เป็นฐานของการตัดสินใจใหญ่

คำแนะนำ: ค่อย ๆ เดินทีละขั้น อย่าให้ความหวังหรือความกังวลอย่างเดียวเป็นตัวนำ และเก็บทางเลือกสำรองไว้เสมอ

คำอวยพร: ขอให้คุณได้คำตอบที่พาไปสู่ความชัดเจน ความสบายใจ และการตัดสินใจที่ดีกับตัวเองในระยะยาว`;
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
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
    setShowAuthPassword(false);
    setAuthModal(true);
  }

  async function handleGoogleLogin() {
    setAuthMessage("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Google login error:", error);
        setAuthMessage("เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    setAuthMessage("");

    const email = authEmail.trim();

    if (!email) {
      setAuthMessage("กรอกอีเมลของคุณก่อน แล้วกดลืมรหัสผ่าน");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        console.error("Reset password error:", error);
        setAuthMessage(
          "ส่งลิงก์ตั้งรหัสผ่านใหม่ไม่สำเร็จ กรุณาตรวจสอบอีเมลแล้วลองอีกครั้ง"
        );
        return;
      }

      setAuthMessage(
        "ถ้าอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ กรุณาตรวจสอบกล่องจดหมายและสแปม"
      );
    } finally {
      setResetLoading(false);
    }
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

    // Cinematic เริ่มได้เฉพาะเมื่อคำถามผ่านการตรวจและระบบเข้าใจ intent แล้ว
    window.dispatchEvent(
      new Event("creatorforge:custom-reading-valid")
    );

    setOpening(true);
    setOpened(false);

    window.setTimeout(async () => {
      const first = randomCard();

      const firstReading = getBaseReading(detectedIntent, first.tone, question);
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

    setOpening(true);
    setMessage("");

    const historyId = user
      ? await ensureHistoryRecord()
      : null;

    if (!FREE_MODE) {
      if (!user) {
        setOpening(false);

        setMessage(
          "กรุณาเข้าสู่ระบบก่อนใช้เครดิตเพื่อเปิดไพ่เพิ่ม"
        );

        openAuth("login");
        return;
      }

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
    }

    window.setTimeout(async () => {
      const second = randomCard([card.name]);
      const third = randomCard([card.name, second.name]);

      const contextualDeepText = getDeepReading(
        intent,
        card.tone,
        second.tone,
        third.tone,
        readingType === "custom" ? question : ""
      );

      const deepText = contextualDeepText;

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
            credits_spent: FREE_MODE ? 0 : 3,
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


  useEffect(() => {
    function handleCinematicDeepReading() {
      void unlockDeepReading();
    }

    window.addEventListener(
      "creatorforge:deep-reading",
      handleCinematicDeepReading
    );

    return () => {
      window.removeEventListener(
        "creatorforge:deep-reading",
        handleCinematicDeepReading
      );
    };
  });

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email ||
    "สมาชิก";

  return (
    <main className="page">

      {/* MEMBER GATE V20 START */}
      {!user && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "22px",
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 20%, rgba(119,68,190,.34), transparent 32%), radial-gradient(circle at 50% 78%, rgba(229,180,70,.15), transparent 30%), linear-gradient(180deg,#070513 0%,#120826 48%,#05040d 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: .72,
              backgroundImage:
                'url("/tarot-home-v8.png")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(2px) brightness(.42)",
              transform: "scale(1.03)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg,rgba(4,3,13,.43),rgba(7,4,17,.72))",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "min(390px, 94vw)",
              padding: "38px 25px 30px",
              borderRadius: "28px",
              border: "1px solid rgba(247,210,119,.62)",
              background:
                "linear-gradient(145deg,rgba(28,15,55,.93),rgba(8,7,23,.96))",
              boxShadow:
                "0 26px 80px rgba(0,0,0,.62), 0 0 38px rgba(222,174,73,.18), inset 0 1px 0 rgba(255,255,255,.10)",
              textAlign: "center",
              backdropFilter: "blur(14px)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "4px",
                color: "#cba85e",
                marginBottom: "13px",
              }}
            >
              ✦ CREATORFORGE ✦
            </div>

            <div
              style={{
                fontSize: "38px",
                marginBottom: "11px",
                filter:
                  "drop-shadow(0 0 14px rgba(232,190,83,.45))",
              }}
            >
              ✨
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "26px",
                lineHeight: 1.35,
                color: "#f4d992",
                fontWeight: 800,
                textShadow:
                  "0 0 18px rgba(232,190,83,.20)",
              }}
            >
              ดูดวงไพ่ทาโร่
            </h1>

            <div
              style={{
                width: "72px",
                height: "1px",
                margin: "16px auto 20px",
                background:
                  "linear-gradient(90deg,transparent,#d7ad55,transparent)",
              }}
            />

            <p
              style={{
                margin: "0 auto",
                maxWidth: "310px",
                color: "#e9e1ef",
                fontSize: "15px",
                lineHeight: 1.9,
              }}
            >
              สมัครสมาชิกฟรีก่อนเริ่มเปิดไพ่
              <br />
              เพื่อบันทึกประวัติคำทำนายและใช้งาน CreatorForge
            </p>

            <div
              style={{
                margin: "17px auto 24px",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 13px",
                borderRadius: "999px",
                border:
                  "1px solid rgba(217,178,91,.27)",
                background:
                  "rgba(216,174,82,.07)",
                color: "#d8bb78",
                fontSize: "11px",
              }}
            >
              ✦ ช่วง Beta ใช้งานฟรี
            </div>

            <button
              type="button"
              onClick={() => openAuth("register")}
              style={{
                width: "100%",
                minHeight: "62px",
                borderRadius: "999px",
                border:
                  "1px solid rgba(255,232,157,.95)",
                background:
                  "radial-gradient(circle at 50% 0%,rgba(255,247,205,.75),transparent 45%),linear-gradient(180deg,#ffe49a 0%,#d5a03d 52%,#a96e17 100%)",
                color: "#321d02",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow:
                  "inset 0 2px 0 rgba(255,255,255,.42),0 12px 30px rgba(0,0,0,.40),0 0 25px rgba(242,196,78,.30)",
              }}
            >
              ✦ สมัครสมาชิกฟรี
            </button>

            <button
              type="button"
              onClick={() => openAuth("login")}
              style={{
                display: "block",
                width: "100%",
                marginTop: "16px",
                padding: "8px",
                border: 0,
                background: "transparent",
                color: "#cbb8dc",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </button>

            <div
              style={{
                marginTop: "12px",
                color: "#777083",
                fontSize: "10px",
                lineHeight: 1.6,
              }}
            >
              สมัครด้วย Google หรืออีเมลได้
            </div>
          </div>
        </div>
      )}
      {/* MEMBER GATE V20 END */}

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

        /* =========================================================
           RESULT PAGE V16 — FULLSCREEN CARD + SCROLLING TEXT OVERLAY
           เป้าหมาย:
           - ไพ่กินพื้นที่เกือบเต็มจอ
           - ข้อความคำทำนายทับบนไพ่ทั้งหมด
           - ข้อความยาว เลื่อนลงอ่านต่อได้
           - 3 ใบซ้อนแบบถือไพ่ และข้อความทับเช่นเดียวกัน
           - คง logic คำทำนายเดิมทั้งหมด
           ========================================================= */

        @keyframes v16CardReveal {
          0% { opacity: 0; transform: scale(.92) translateY(30px); filter: blur(5px); }
          70% { opacity: 1; transform: scale(1.015) translateY(-3px); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes v16TextReveal {
          0% { opacity: 0; transform: translateY(24px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @keyframes v16GlowPulse {
          0%,100% {
            box-shadow:
              0 24px 54px rgba(0,0,0,.62),
              0 0 22px rgba(255,204,78,.42),
              0 0 44px rgba(126,69,255,.20);
          }
          50% {
            box-shadow:
              0 28px 62px rgba(0,0,0,.68),
              0 0 34px rgba(255,221,112,.68),
              0 0 60px rgba(143,78,255,.30);
          }
        }

        .tarot-result-screen {
          position: fixed !important;
          inset: 0 !important;
          z-index: 950000 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          box-sizing: border-box !important;
          padding:
            max(12px, env(safe-area-inset-top))
            8px
            max(30px, env(safe-area-inset-bottom)) !important;
          color: #fff9ec !important;
          font-family: "Leelawadee UI", Tahoma, sans-serif !important;

          /* ใช้ galaxy background จริงแบบหน้าแรก */
          background:
            linear-gradient(rgba(1,3,10,.18), rgba(1,3,10,.18)),
            url("/tarot-result-galaxy.png") center top / cover fixed no-repeat !important;
        }

        .tarot-result-screen::before {
          content: "" !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: 0 !important;
          pointer-events: none !important;
          background:
            radial-gradient(circle at 50% 15%, rgba(255,211,93,.12), transparent 24%),
            radial-gradient(circle at 18% 32%, rgba(125,74,255,.12), transparent 28%),
            radial-gradient(circle at 82% 35%, rgba(54,132,255,.10), transparent 30%) !important;
        }

        .tarot-result-screen::after {
          content: "" !important;
          position: fixed !important;
          inset: 10px !important;
          z-index: 1 !important;
          pointer-events: none !important;
          border: 1px solid rgba(255,205,82,.72) !important;
          border-radius: 22px !important;
          box-shadow:
            inset 0 0 0 2px rgba(255,235,167,.05),
            inset 0 0 32px rgba(255,188,52,.05) !important;
        }

        .tarot-result-screen > * {
          position: relative !important;
          z-index: 3 !important;
        }

        .tarot-result-screen > div:not(.tarot-cinema) {
          width: min(100%, 470px) !important;
          max-width: 470px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          box-sizing: border-box !important;
        }

        /* ไม่ใช้ poem แยกออกนอกไพ่ */
        .tarot-result-screen .poem-inline {
          display: none !important;
        }

        /* ===== ไพ่ 1 ใบ ===== */
        .tarot-result-screen > div img:not(.deep-cards img) {
          display: block !important;
          width: min(94vw, 420px) !important;
          max-width: 420px !important;
          height: auto !important;
          margin: 18px auto 0 !important;
          object-fit: contain !important;
          border-radius: 20px !important;
          border: 2px solid rgba(255,224,139,.88) !important;
          box-shadow:
            0 0 0 5px rgba(255,194,63,.08),
            0 22px 42px rgba(0,0,0,.62) !important;
          animation:
            v16CardReveal .9s cubic-bezier(.18,.78,.16,1) both,
            v16GlowPulse 3.8s ease-in-out 1s infinite !important;
        }

        /* ===== คำทำนาย 1 ใบ ทับบนไพ่เต็มพื้นที่ ===== */
        .tarot-result-screen .direct-answer {
          position: relative !important;
          z-index: 8 !important;
          width: min(92vw, 406px) !important;
          margin: -560px auto 0 !important;
          min-height: 560px !important;
          padding: 34px 24px 28px !important;
          box-sizing: border-box !important;
          border: 0 !important;
          border-radius: 18px !important;
          background:
            linear-gradient(
              180deg,
              rgba(2,4,12,.18) 0%,
              rgba(2,4,12,.45) 14%,
              rgba(2,4,12,.68) 36%,
              rgba(2,4,12,.82) 62%,
              rgba(2,4,12,.88) 100%
            ) !important;
          backdrop-filter: blur(1.3px) !important;
          box-shadow: none !important;
          animation: v16TextReveal .8s ease 1.05s both !important;
        }

        .tarot-result-screen .direct-answer::before {
          content: "" !important;
        }

        .tarot-result-screen p,
        .tarot-result-screen strong {
          font-family: "Leelawadee UI", Tahoma, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          text-rendering: optimizeLegibility !important;
        }

        /* กลอน 4 ประโยค / 2 บรรทัด-ish ด้านบน */
        .tarot-result-screen .direct-answer > p:first-child strong {
          display: block !important;
          margin: 0 0 18px !important;
          color: #ffe29a !important;
          font-size: 23px !important;
          line-height: 1.55 !important;
          font-weight: 900 !important;
          text-align: center !important;
          text-shadow:
            0 2px 5px rgba(0,0,0,1),
            0 0 14px rgba(255,208,90,.36) !important;
        }

        /* เนื้อหาคำทำนายทั้งหมด */
        .tarot-result-screen .direct-answer > p,
        .tarot-result-screen .reading-paragraph,
        .tarot-result-screen .reading-hook {
          margin: 0 0 17px !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #fff8ec !important;
          font-size: 17px !important;
          line-height: 1.92 !important;
          font-weight: 500 !important;
          white-space: pre-line !important;
          text-align: left !important;
          -webkit-text-stroke: 0 !important;
          text-shadow:
            0 2px 5px rgba(0,0,0,1),
            0 0 11px rgba(0,0,0,.94) !important;
        }

        .tarot-result-screen .reading-hook {
          color: #f2ddff !important;
          font-weight: 700 !important;
        }

        /* spacer ด้านล่าง เพื่อให้ข้อความยาวเลื่อนดูต่อได้ */
        .tarot-result-screen .direct-answer::after,
        .tarot-result-screen .deep-final::after {
          content: "" !important;
          display: block !important;
          height: 20px !important;
        }

        /* ===== 3 ใบ ซ้อนเหมือนถือไพ่ ===== */
        .tarot-result-screen .deep-cards {
          position: relative !important;
          z-index: 5 !important;
          width: min(100%, 470px) !important;
          height: 500px !important;
          margin: 18px auto 0 !important;
          display: block !important;
          overflow: visible !important;
        }

        .tarot-result-screen .deep-cards .mini-card {
          position: absolute !important;
          top: 26px !important;
          left: 50% !important;
          width: 52% !important;
          max-width: 210px !important;
          margin: 0 !important;
          padding: 5px !important;
          border: 1px solid rgba(255,224,137,.72) !important;
          border-radius: 16px !important;
          background: #070814 !important;
          transform-origin: 50% 90% !important;
          box-shadow:
            0 24px 44px rgba(0,0,0,.62),
            0 0 22px rgba(255,196,63,.24),
            0 0 40px rgba(127,65,255,.16) !important;
          animation:
            tarotFlipIn .75s ease both,
            v16GlowPulse 3.8s ease-in-out 1s infinite !important;
        }

        .tarot-result-screen .deep-cards .mini-card:nth-child(1) {
          z-index: 1 !important;
          transform: translateX(-106%) translateY(48px) rotate(-13deg) !important;
        }

        .tarot-result-screen .deep-cards .mini-card:nth-child(2) {
          z-index: 4 !important;
          transform: translateX(-50%) translateY(0) rotate(0deg) !important;
        }

        .tarot-result-screen .deep-cards .mini-card:nth-child(3) {
          z-index: 2 !important;
          transform: translateX(6%) translateY(48px) rotate(13deg) !important;
        }

        .tarot-result-screen .deep-cards img {
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          border-radius: 10px !important;
          box-shadow: none !important;
        }

        /* ===== คำทำนาย 3 ใบ ทับกองไพ่และเลื่อนอ่านได้ ===== */
        .tarot-result-screen .deep-final {
          position: relative !important;
          z-index: 8 !important;
          width: min(92vw, 406px) !important;
          margin: -400px auto 0 !important;
          min-height: 520px !important;
          padding: 34px 24px 28px !important;
          box-sizing: border-box !important;
          border: 0 !important;
          border-radius: 18px !important;
          background:
            linear-gradient(
              180deg,
              rgba(2,4,12,.18) 0%,
              rgba(2,4,12,.48) 14%,
              rgba(2,4,12,.70) 38%,
              rgba(2,4,12,.84) 65%,
              rgba(2,4,12,.90) 100%
            ) !important;
          backdrop-filter: blur(1.4px) !important;
          box-shadow: none !important;
          animation: v16TextReveal .8s ease .9s both !important;
        }

        .tarot-result-screen .deep-final::before {
          content: "" !important;
        }

        .tarot-result-screen .deep-final > p {
          margin: 0 0 17px !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #fff8ec !important;
          font-size: 17px !important;
          line-height: 1.92 !important;
          font-weight: 500 !important;
          white-space: pre-line !important;
          text-align: left !important;
          -webkit-text-stroke: 0 !important;
          text-shadow:
            0 2px 5px rgba(0,0,0,1),
            0 0 11px rgba(0,0,0,.94) !important;
        }

        /* ปุ่มแบบหน้าแรก */
        .tarot-result-screen .tarot-result-more {
          width: min(88%, 360px) !important;
          min-height: 62px !important;
          margin: 26px auto 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid rgba(255,232,157,.96) !important;
          border-radius: 999px !important;
          color: #2c1700 !important;
          font-family: "Leelawadee UI", Tahoma, sans-serif !important;
          font-size: 17px !important;
          font-weight: 900 !important;
          background:
            radial-gradient(circle at 50% 0%, rgba(255,245,193,.74), transparent 44%),
            linear-gradient(180deg, #ffe39b 0%, #d59e39 52%, #a86b13 100%) !important;
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.48),
            inset 0 -8px 14px rgba(119,68,0,.18),
            0 12px 24px rgba(0,0,0,.39),
            0 0 27px rgba(255,201,75,.30) !important;
        }

        .tarot-result-screen .tarot-result-home {
          width: min(80%, 290px) !important;
          min-height: 54px !important;
          margin: 14px auto 28px !important;
          padding: 10px 22px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid rgba(221,178,91,.58) !important;
          border-radius: 999px !important;
          color: #ffe7ad !important;
          background:
            radial-gradient(circle at 50% 0%, rgba(146,84,255,.17), transparent 48%),
            linear-gradient(180deg, rgba(40,21,74,.97), rgba(15,11,40,.99)) !important;
          font-size: 15px !important;
          font-weight: 800 !important;
          box-shadow:
            0 10px 23px rgba(0,0,0,.35),
            0 0 19px rgba(131,76,255,.16),
            inset 0 1px 0 rgba(255,255,255,.10) !important;
        }

        @media (max-width: 600px) {
          .tarot-result-screen {
            padding-left: 6px !important;
            padding-right: 6px !important;
          }

          .tarot-result-screen > div img:not(.deep-cards img) {
            width: min(95vw, 400px) !important;
          }

          .tarot-result-screen .direct-answer {
            width: min(93vw, 390px) !important;
            margin-top: -530px !important;
            min-height: 530px !important;
            padding: 30px 18px 24px !important;
          }

          .tarot-result-screen .direct-answer > p:first-child strong {
            font-size: 21px !important;
            line-height: 1.5 !important;
          }

          .tarot-result-screen .direct-answer > p,
          .tarot-result-screen .reading-paragraph,
          .tarot-result-screen .reading-hook,
          .tarot-result-screen .deep-final > p {
            font-size: 16px !important;
            line-height: 1.88 !important;
          }

          .tarot-result-screen .deep-final {
            width: min(93vw, 390px) !important;
            margin-top: -380px !important;
            min-height: 500px !important;
            padding: 30px 18px 24px !important;
          }
        }


        /* =========================================================
           CREATORFORGE V8 — SINGLE SCREEN MOCKUP, NO DUPLICATE UI
           ========================================================= */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #02040d !important;
          overflow-x: hidden !important;
        }

        .cf-v8-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 12px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 50% 12%, rgba(86, 52, 169, .26), transparent 30%),
            radial-gradient(circle at 20% 70%, rgba(39, 74, 142, .16), transparent 30%),
            #02040d;
        }

        .cf-v8-phone {
          position: relative;
          width: min(100%, 430px);
          aspect-ratio: 941 / 1672;
          overflow: hidden;
          border-radius: 28px;
          box-shadow:
            0 28px 90px rgba(0,0,0,.78),
            0 0 48px rgba(139, 85, 255, .18);
          background: #050714;
        }

        .cf-v8-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
          pointer-events: none;
        }

        .cf-v8-livebar {
          position: absolute;
          z-index: 20;
          top: 4.1%;
          right: 5.7%;
          width: 20%;
          height: 4.7%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .cf-v8-account {
          width: 100%;
          min-height: 34px;
          border: 1px solid rgba(255, 224, 138, .58);
          border-radius: 999px;
          color: #fff1c3;
          background: rgba(9, 9, 25, .62);
          backdrop-filter: blur(6px);
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-shadow:
            0 6px 14px rgba(0, 0, 0, .24),
            0 0 12px rgba(255, 209, 102, .10);
          transform: translateY(-1px);
          transition: transform .16s ease, filter .16s ease;
        }

        .cf-v8-topics {
          position: absolute;
          z-index: 20;
          left: 4.6%;
          right: 4.6%;
          top: 37.5%;
          height: 20.2%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2.1%;
        }

        .cf-v8-hotspot {
          position: relative;
          border: 1px solid rgba(255, 223, 135, .42);
          border-radius: 18px;
          background: rgba(8, 8, 24, .04);
          box-shadow:
            0 7px 14px rgba(0, 0, 0, .24),
            0 14px 24px rgba(0, 0, 0, .18),
            0 0 12px rgba(255, 210, 105, .10),
            inset 0 1px 0 rgba(255, 246, 214, .12);
          cursor: pointer;
          transform: translateY(-2px);
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            border-color .16s ease;
        }

        .cf-v8-question-wrap {
          position: absolute;
          z-index: 25;
          left: 8.2%;
          right: 8.1%;
          top: 60.1%;
          height: 11.4%;
        }

        .cf-v8-question {
          width: 100%;
          height: 100%;
          resize: none;
          box-sizing: border-box;
          padding: 13px 15px 23px;
          border: 0 !important;
          outline: none !important;
          border-radius: 14px;
          color: #f8f2e8 !important;
          background: rgba(3, 6, 20, .52) !important;
          font-family: "Leelawadee UI", Tahoma, sans-serif !important;
          font-size: 11px !important;
          line-height: 1.6 !important;
          box-shadow: none !important;
        }

        .cf-v8-question:focus {
          background: rgba(3, 6, 20, .66) !important;
          box-shadow: inset 0 0 0 1px rgba(255, 221, 135, .25) !important;
        }

        .cf-v8-count {
          position: absolute;
          right: 12px;
          bottom: 7px;
          color: rgba(255, 236, 195, .78);
          font-size: 8px;
        }

        .cf-v8-message {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 4px);
          z-index: 30;
          padding: 7px 9px;
          border-radius: 8px;
          color: #ffd29a !important;
          background: rgba(24, 9, 18, .94) !important;
          border: 1px solid rgba(255, 190, 102, .28) !important;
          font-size: 8px !important;
          line-height: 1.4 !important;
        }

        .cf-v8-open {
          position: absolute;
          z-index: 25;
          left: 15.6%;
          right: 15.5%;
          top: 72.2%;
          height: 8.4%;
          border: 1px solid rgba(255, 232, 158, .32) !important;
          border-radius: 999px;
          background: rgba(255, 215, 125, .02) !important;
          cursor: pointer;
          color: transparent !important;
          font-size: 0 !important;
          box-shadow:
            0 8px 16px rgba(0, 0, 0, .22),
            0 15px 28px rgba(0, 0, 0, .18),
            0 0 16px rgba(255, 204, 91, .14),
            inset 0 1px 0 rgba(255, 248, 221, .14);
          transform: translateY(-2px);
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            border-color .16s ease;
        }

        .cf-v8-open:disabled {
          cursor: wait;
          opacity: 1;
        }

        .cf-v8-hotspot:hover,
        .cf-v8-bottom button:hover,
        .cf-v8-open:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 229, 153, .66);
          box-shadow:
            0 10px 18px rgba(0, 0, 0, .28),
            0 18px 30px rgba(0, 0, 0, .20),
            0 0 18px rgba(255, 210, 105, .18),
            inset 0 1px 0 rgba(255, 255, 255, .14);
        }

        .cf-v8-account:hover {
          transform: translateY(-3px);
          filter: brightness(1.05);
        }

        .cf-v8-hotspot:active,
        .cf-v8-bottom button:active,
        .cf-v8-open:active,
        .cf-v8-account:active {
          transform: translateY(0);
        }

        .cf-v8-bottom {
          position: absolute;
          z-index: 20;
          left: 2.6%;
          right: 2.6%;
          bottom: 1.8%;
          height: 7.8%;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .cf-v8-bottom button {
          margin: 0;
          border: 1px solid rgba(255, 220, 130, .12);
          border-radius: 12px;
          background: rgba(8, 8, 24, .01);
          box-shadow:
            0 6px 12px rgba(0, 0, 0, .14),
            inset 0 1px 0 rgba(255, 255, 255, .06);
          cursor: pointer;
          transform: translateY(-1px);
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            border-color .16s ease;
        }

        /* Engine เดิมยังอยู่ใน DOM เพื่อให้ animation / result / deep reading ทำงาน
           แต่ห้ามกินพื้นที่ ห้ามแสดงซ้อนกับหน้าใหม่ */
        .content {
          position: fixed !important;
          left: -20000px !important;
          top: -20000px !important;
          width: 900px !important;
          height: 900px !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          overflow: hidden !important;
        }

        /* ป้องกัน header / hero / section เก่าที่อาจหลงเหลือจาก CSS เดิม */
        body > header,
        body > nav,
        .tarot-hero,
        .workspace:not(.tarot-result-screen),
        .main-grid:not(.tarot-result-screen) {
          max-width: none;
        }

        @media (max-width: 470px) {
          .cf-v8-page {
            padding: 0;
          }

          .cf-v8-phone {
            width: 100vw;
            border-radius: 0;
          }
        }


        /* RESULT HOTFIX V17 START */

        /*
          ผลลัพธ์แบบใหม่
          - Galaxy เป็น Background
          - ไพ่เกือบเต็มหน้าจอ
          - ไพ่ล็อกอยู่กลางจอ
          - ข้อความทับบนไพ่
          - เลื่อนอ่านข้อความได้
        */

        .tarot-result-screen {
          overflow-x: hidden !important;
          overflow-y: auto !important;

          background:
            linear-gradient(
              rgba(0, 0, 8, .12),
              rgba(0, 0, 8, .18)
            ),
            url("/tarot-result-galaxy.png")
            center top / cover
            fixed
            no-repeat !important;
        }

        .tarot-result-screen > div:not(.tarot-cinema) {
          position: relative !important;

          width: min(100%, 430px) !important;
          max-width: 430px !important;

          margin-left: auto !important;
          margin-right: auto !important;

          overflow: visible !important;
        }

        /*
          ไม่เอากลอน/ข้อความไปอยู่แยกนอกไพ่
        */
        .tarot-result-screen .poem-inline {
          display: none !important;
        }

        /*
          ==========================
          ผลลัพธ์ 1 ใบ
          ==========================
        */

        .tarot-result-screen > div img:not(.deep-cards img) {
          position: sticky !important;

          top: 18px !important;

          display: block !important;

          width: min(88vw, 380px) !important;
          max-width: 380px !important;

          height: 82vh !important;
          max-height: 720px !important;

          margin: 18px auto 0 !important;

          object-fit: contain !important;

          border-radius: 18px !important;

          border:
            2px solid
            rgba(255, 221, 125, .90) !important;

          z-index: 2 !important;

          filter:
            drop-shadow(
              0 20px 32px
              rgba(0,0,0,.72)
            )
            drop-shadow(
              0 0 16px
              rgba(255,198,65,.70)
            )
            drop-shadow(
              0 0 34px
              rgba(255,185,45,.36)
            ) !important;
        }

        /*
          ข้อความขึ้นทับหน้าไพ่ทั้งหมด
        */

        .tarot-result-screen .direct-answer {
          position: relative !important;

          z-index: 20 !important;

          width: min(86vw, 360px) !important;

          margin:
            calc(-82vh + 36px)
            auto
            0 !important;

          min-height:
            calc(82vh - 36px) !important;

          box-sizing: border-box !important;

          padding:
            34px
            20px
            40px !important;

          border: 0 !important;

          background:
            linear-gradient(
              180deg,
              rgba(3,4,12,.28) 0%,
              rgba(3,4,12,.47) 18%,
              rgba(3,4,12,.59) 45%,
              rgba(3,4,12,.68) 72%,
              rgba(3,4,12,.76) 100%
            ) !important;

          border-radius: 17px !important;

          backdrop-filter:
            blur(.8px) !important;

          box-shadow:
            none !important;
        }

        /*
          กลอน / คำตอบเด่นด้านบน
        */

        .tarot-result-screen
        .direct-answer
        > p:first-child
        strong {
          display: block !important;

          margin:
            0
            0
            24px !important;

          color:
            #ffe19a !important;

          font-size:
            22px !important;

          line-height:
            1.58 !important;

          font-weight:
            900 !important;

          text-align:
            center !important;

          text-shadow:
            0 3px 5px
              rgba(0,0,0,1),
            0 0 14px
              rgba(255,203,74,.48) !important;
        }

        /*
          เนื้อหาผลคำทำนาย
        */

        .tarot-result-screen
        .direct-answer > p,

        .tarot-result-screen
        .reading-paragraph,

        .tarot-result-screen
        .reading-hook {

          margin:
            0
            0
            19px !important;

          padding:
            0 !important;

          color:
            #fffaf0 !important;

          font-size:
            17px !important;

          line-height:
            1.95 !important;

          font-weight:
            500 !important;

          text-align:
            left !important;

          white-space:
            pre-line !important;

          background:
            transparent !important;

          border:
            0 !important;

          box-shadow:
            none !important;

          text-shadow:
            0 3px 5px
              rgba(0,0,0,1),
            0 0 12px
              rgba(0,0,0,.96) !important;
        }

        .tarot-result-screen
        .reading-hook {
          color:
            #f3dcff !important;

          font-weight:
            700 !important;
        }


        /*
          ==========================
          ผลลัพธ์ 3 ใบ
          ==========================
        */

        .tarot-result-screen
        .deep-cards {

          position: sticky !important;

          top: 22px !important;

          z-index:
            2 !important;

          width:
            min(96vw, 420px) !important;

          height:
            74vh !important;

          max-height:
            650px !important;

          margin:
            18px
            auto
            0 !important;

          overflow:
            visible !important;

          display:
            block !important;
        }

        /*
          ไพ่ทั้งสาม
        */

        .tarot-result-screen
        .deep-cards
        .mini-card {

          position:
            absolute !important;

          top:
            50% !important;

          left:
            50% !important;

          width:
            48% !important;

          max-width:
            190px !important;

          margin:
            0 !important;

          padding:
            4px !important;

          border:
            1px solid
            rgba(255,220,125,.85) !important;

          border-radius:
            15px !important;

          background:
            #080812 !important;

          box-shadow:
            0 22px 40px
              rgba(0,0,0,.70),
            0 0 18px
              rgba(255,200,65,.65),
            0 0 34px
              rgba(255,185,45,.26) !important;

          transform-origin:
            50% 90% !important;
        }

        /*
          ซ้าย
        */

        .tarot-result-screen
        .deep-cards
        .mini-card:nth-child(1) {

          z-index:
            1 !important;

          transform:
            translate(
              -104%,
              -48%
            )
            rotate(-12deg) !important;
        }

        /*
          กลาง
        */

        .tarot-result-screen
        .deep-cards
        .mini-card:nth-child(2) {

          z-index:
            4 !important;

          transform:
            translate(
              -50%,
              -54%
            )
            rotate(0deg) !important;
        }

        /*
          ขวา
        */

        .tarot-result-screen
        .deep-cards
        .mini-card:nth-child(3) {

          z-index:
            2 !important;

          transform:
            translate(
              4%,
              -48%
            )
            rotate(12deg) !important;
        }

        .tarot-result-screen
        .deep-cards img {

          width:
            100% !important;

          height:
            auto !important;

          border-radius:
            10px !important;
        }

        /*
          ข้อความผล 3 ใบ
          ทับอยู่บนกองไพ่เหมือนกัน
        */

        .tarot-result-screen
        .deep-final {

          position:
            relative !important;

          z-index:
            20 !important;

          width:
            min(87vw, 365px) !important;

          margin:
            calc(-74vh + 40px)
            auto
            0 !important;

          min-height:
            calc(74vh - 40px) !important;

          padding:
            34px
            20px
            42px !important;

          box-sizing:
            border-box !important;

          border:
            0 !important;

          border-radius:
            17px !important;

          background:
            linear-gradient(
              180deg,
              rgba(3,4,12,.30),
              rgba(3,4,12,.54) 26%,
              rgba(3,4,12,.70) 67%,
              rgba(3,4,12,.78)
            ) !important;

          backdrop-filter:
            blur(.9px) !important;

          box-shadow:
            none !important;
        }

        .tarot-result-screen
        .deep-final > p {

          margin:
            0
            0
            19px !important;

          padding:
            0 !important;

          color:
            #fffaf0 !important;

          font-size:
            17px !important;

          line-height:
            1.95 !important;

          font-weight:
            500 !important;

          text-align:
            left !important;

          white-space:
            pre-line !important;

          background:
            transparent !important;

          border:
            0 !important;

          text-shadow:
            0 3px 5px
              rgba(0,0,0,1),
            0 0 12px
              rgba(0,0,0,.96) !important;
        }

        /*
          ปุ่มเปิดต่อ
        */

        .tarot-result-screen
        .tarot-result-more {

          position:
            relative !important;

          z-index:
            30 !important;

          width:
            min(88%, 355px) !important;

          min-height:
            62px !important;

          margin:
            28px
            auto
            13px !important;
        }

        /*
          ปุ่มกลับ
        */

        .tarot-result-screen
        .tarot-result-home {

          position:
            relative !important;

          z-index:
            30 !important;

          width:
            min(80%, 285px) !important;

          min-height:
            54px !important;

          margin:
            14px
            auto
            30px !important;
        }


        /*
          มือถือ
        */

        @media (max-width: 600px) {

          .tarot-result-screen
          > div
          img:not(.deep-cards img) {

            width:
              90vw !important;

            height:
              80vh !important;
          }

          .tarot-result-screen
          .direct-answer {

            width:
              86vw !important;

            margin-top:
              calc(-80vh + 34px) !important;

            min-height:
              calc(80vh - 34px) !important;

            padding:
              30px
              17px
              38px !important;
          }

          .tarot-result-screen
          .direct-answer
          > p:first-child
          strong {

            font-size:
              21px !important;

            line-height:
              1.55 !important;
          }

          .tarot-result-screen
          .direct-answer > p,

          .tarot-result-screen
          .reading-paragraph,

          .tarot-result-screen
          .reading-hook,

          .tarot-result-screen
          .deep-final > p {

            font-size:
              16px !important;

            line-height:
              1.9 !important;
          }

          .tarot-result-screen
          .deep-cards {

            height:
              72vh !important;
          }

          .tarot-result-screen
          .deep-final {

            margin-top:
              calc(-72vh + 38px) !important;

            min-height:
              calc(72vh - 38px) !important;

            padding:
              30px
              17px
              38px !important;
          }
        }

        /* RESULT HOTFIX V17 END */

      `}</style>

      <div className="cf-v8-page">
        <div className="cf-v8-phone">
          <img
            src="/tarot-home-v8.png"
            alt="ดูดวงไพ่ทาโร่"
            className="cf-v8-background"
          />

          <div className="cf-v8-livebar">
            {!user ? (
              <button
                type="button"
                className="cf-v8-account"
                onClick={() => openAuth("login")}
              >
                เข้าสู่ระบบ
              </button>
            ) : (
              <button
                type="button"
                className="cf-v8-account"
                onClick={logout}
              >
                {displayName} · ออก
              </button>
            )}
          </div>

          <div className="cf-v8-topics">
            <button className="menu cf-v8-hotspot" type="button" onClick={() => openQuickReading("love")} aria-label="ความรัก" />
            <button className="menu cf-v8-hotspot" type="button" onClick={() => openQuickReading("work")} aria-label="การงาน" />
            <button className="menu cf-v8-hotspot" type="button" onClick={() => openQuickReading("money")} aria-label="การเงิน" />
            <button className="menu cf-v8-hotspot" type="button" onClick={() => openQuickReading("daily")} aria-label="ดวงรายวัน" />
          </div>

          <div className="cf-v8-question-wrap">
            <textarea
              className="question-box cf-v8-question"
              value={question}
              maxLength={100}
              placeholder=""
              onChange={(event) => setQuestion(event.target.value)}
            />
            <span className="cf-v8-count">{question.length}/100</span>
            {message && (
              <div className="question-warning cf-v8-message">
                {message}
              </div>
            )}
          </div>

          <button
            className="open-button cf-v8-open"
            type="button"
            onClick={openCustomReading}
            disabled={opening}
            aria-label="เปิดไพ่ทำนาย"
          >
            {opening ? "กำลังสับไพ่..." : ""}
          </button>

          <div className="cf-v8-bottom">
            <button type="button" aria-label="หน้าหลัก" />
            <button type="button" aria-label="ประวัติการดู" />
            <button type="button" aria-label="สิทธิพิเศษ" />
            <button type="button" aria-label="บทความ" />
            <button type="button" aria-label="วิธีใช้งาน" />
          </div>
        </div>
      </div>

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
                          {FREE_MODE ? "(ใช้ฟรี)" : "(หัก 3 เครดิต)"}
                        </span>
                      </button>

                      <small>
                        {FREE_MODE
                          ? "เปิดดูต่อได้ฟรี · ไม่หักเครดิต · ไม่ต้องเข้าสู่ระบบ"
                          : user
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
              autoComplete="email"
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

            <div
              style={{
                position: "relative",
                marginBottom: authMode === "login" ? "6px" : "12px",
              }}
            >
              <input
                type={showAuthPassword ? "text" : "password"}
                value={authPassword}
                onChange={(event) =>
                  setAuthPassword(event.target.value)
                }
                placeholder="รหัสผ่านอย่างน้อย 6 ตัว"
                autoComplete={
                  authMode === "login"
                    ? "current-password"
                    : "new-password"
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAuth();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "13px 52px 13px 14px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(180,145,205,.25)",
                  outline: "none",
                  background:
                    "rgba(4,6,18,.72)",
                  color: "#eee8df",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowAuthPassword((current) => !current)
                }
                aria-label={
                  showAuthPassword
                    ? "ซ่อนรหัสผ่าน"
                    : "แสดงรหัสผ่าน"
                }
                title={
                  showAuthPassword
                    ? "ซ่อนรหัสผ่าน"
                    : "ดูรหัสผ่าน"
                }
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "38px",
                  height: "38px",
                  border: 0,
                  borderRadius: "9px",
                  background: "rgba(255,255,255,.04)",
                  color: "#d9bf7e",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                {showAuthPassword ? "🙈" : "👁"}
              </button>
            </div>

            {authMode === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  display: "block",
                  margin: "0 0 12px auto",
                  padding: "4px 2px",
                  border: 0,
                  background: "transparent",
                  color: "#d4b66f",
                  fontSize: "11px",
                  cursor: resetLoading ? "wait" : "pointer",
                }}
              >
                {resetLoading
                  ? "กำลังส่งลิงก์..."
                  : "ลืมรหัสผ่าน?"}
              </button>
            )}

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
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: "100%",
                minHeight: "48px",
                marginBottom: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,.16)",
                background: "#ffffff",
                color: "#202124",
                fontWeight: 700,
                cursor: googleLoading ? "wait" : "pointer",
              }}
            >
              {googleLoading
                ? "กำลังเชื่อมต่อ Google..."
                : "G  เข้าสู่ระบบด้วย Google"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "4px 0 12px",
                color: "#6f6b78",
                fontSize: "10px",
              }}
            >
              <span
                style={{
                  height: "1px",
                  flex: 1,
                  background: "rgba(255,255,255,.10)",
                }}
              />
              หรือใช้อีเมล
              <span
                style={{
                  height: "1px",
                  flex: 1,
                  background: "rgba(255,255,255,.10)",
                }}
              />
            </div>

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