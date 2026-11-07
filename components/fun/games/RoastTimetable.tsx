"use client";

import { useRef, useState } from "react";
import CardRoast from "@/components/fun/cards/CardRoast";
import CardActions from "@/components/fun/CardActions";
import { FitBox, GameShell, hash, useTimers } from "@/components/fun/kit";
import { resultLink } from "@/lib/fun/results";
import { useHindi, useTr } from "@/lib/tools/useTr";

type Phase = "input" | "roasting" | "result";

const GENERIC = [
  "This timetable was made by someone who hates you, and that someone is you.",
  "Even Google Calendar looked at this and logged out.",
  "Free time? Never heard of her.",
  "The only thing consistent here is the chaos.",
  "A sleep doctor somewhere just got chills.",
  "This isn't time management, it's pure chaos with extra steps.",
];
const GENERIC_HI = [
  "यह टाइमटेबल किसी ऐसे ने बनाया है जो आपसे नफ़रत करता है, और वो कोई और नहीं, आप ख़ुद हैं।",
  "Google Calendar ने भी इसे देखा और लॉग आउट कर दिया।",
  "फ़्री टाइम? ये नाम तो पहली बार सुना।",
  "इसमें अगर कुछ लगातार है तो वो है अफ़रा-तफ़री।",
  "कहीं किसी स्लीप डॉक्टर को अभी-अभी सिहरन हुई है।",
  "यह टाइम मैनेजमेंट नहीं, एक्स्ट्रा स्टेप्स वाली पूरी अफ़रा-तफ़री है।",
];
const LEVELS = ["MILD", "MILD", "MILD", "WARM", "WARM", "SPICY", "SPICY", "HOT", "EXTRA HOT", "VOLCANIC", "VOLCANIC"];
const LEVELS_HI = ["हल्का", "हल्का", "हल्का", "गुनगुना", "गुनगुना", "तीखा", "तीखा", "गरम", "बहुत गरम", "ज्वालामुखी", "ज्वालामुखी"];
const TIMES = ["7:00", "9:30", "1:00", "6:00", "11:45"];
const FLAME_COLORS = ["#ff5b1f", "#ffb020", "#ff7a1f", "#ffd23f"];
const FLAME_H = [60, 84, 96, 72, 100, 80, 90, 64];

/** Same line about your day always gives the same roast. */
/** Works on English, Hindi or mixed (Hinglish) text. With `hi` the roast lines come out in Hindi. */
export function roastFor(day: string, hi = false) {
  const raw = day.trim();
  const d = raw.toLowerCase();
  const h = hash("roast:" + d);
  const out: string[] = [];
  let hits = 0;
  const m1 = d.match(/(\d+)\s*(classes|class|lectures|periods|subjects|क्लास|क्लासेस|लेक्चर|पीरियड|विषय)/);
  if (m1) {
    const n = +m1[1];
    hits += n >= 5 ? 3 : 1;
    out.push(
      hi
        ? n >= 5 ? `${n} क्लास? ये टाइमटेबल नहीं है भाई, ये तो बंधक बनाने वाली हालत है।` : `${n} क्लास में ही थक गए? बेंच भी आपसे थक चुकी है।`
        : n >= 5 ? `${n} classes? That's not a timetable bro, that's a hostage situation.` : `${n} classes and you're already tired? Even the bench is tired of you.`,
    );
  }
  if (/no\s*break|बिना\s*ब्रेक|ब्रेक\s*नहीं/.test(d)) { hits += 2; out.push(hi ? "कोई ब्रेक नहीं? आपके ब्लैडर ने शिकायत दर्ज कर दी है, सच में।" : "No breaks? Your bladder just filed a complaint, no cap."); }
  // "sleep at 2am", or the Hindi order "रात 2 बजे सोना" (number first)
  const m2 =
    d.match(/(sleep|bed|sleeping|सोना|सोता|सोती|नींद)\D{0,10}(\d{1,2})\s*(am|बजे)/) ??
    ((x) => (x ? ([x[0], x[2], x[1]] as unknown as RegExpMatchArray) : null))(d.match(/(\d{1,2})\s*बजे\s*(?:को\s*)?(सोना|सोता|सोती|नींद)/));
  if (m2) {
    const hr = +m2[2];
    hits += hr <= 5 ? 3 : 1;
    out.push(hi ? `${hr} बजे सोना शेड्यूल नहीं है, ये तो आपके वाईफ़ाई का स्पॉन्सर किया हुआ लाइफ़स्टाइल है।` : `Sleeping at ${hr}am isn't a schedule, it's a lifestyle sponsored by your wifi.`);
  }
  if (/gym|workout|जिम|वर्कआउट/.test(d)) { hits += 1; out.push(hi ? "आपने टाइमटेबल में “जिम” लिखा है। जिम को पता ही नहीं कि आप कौन हैं।" : 'You wrote "gym" in the timetable. The gym has no idea who you are.'); }
  if (/netflix|reels|insta|youtube|scroll|phone|रील|इंस्टा|यूट्यूब|फ़ोन|फोन|स्क्रॉल/.test(d)) { hits += 2; out.push(hi ? "वो “थोड़ा-सा स्क्रॉल” पिछले 3 दिन से लगातार चल रहा है।" : 'That "quick scroll" has been going for 3 days straight.'); }
  if (/coaching|tuition|कोचिंग|ट्यूशन/.test(d)) { hits += 2; out.push(hi ? "स्कूल, फिर कोचिंग, फिर ट्यूशन। आपकी परछाईं भी ब्रेक माँग रही है।" : "School, then coaching, then tuition. Even your shadow wants a break."); }
  if ((/\b(6|7|8)\s*am\b/.test(d) || /सुबह\s*(6|7|8)\s*बजे/.test(d)) && !m2) { hits += 1; out.push(hi ? "सुबह की क्लास? आपके अलार्म को अब आप पर भरोसा नहीं रहा।" : "Early morning class? Your alarm has trust issues now."); }
  if (/self.?study|revision|study|सेल्फ़?\s*स्टडी|पढ़ाई|रिवीज़न/.test(d)) { hits += 1; out.push(hi ? "“सेल्फ़ स्टडी” एक मिथक है, यूनिकॉर्न और फ़्री पीरियड की तरह।" : '"Self study" is lowkey a myth, like unicorns and free periods.'); }
  if (/chai|coffee|tea|maggi|चाय|कॉफ़ी|कॉफी|मैगी/.test(d)) { hits += 1; out.push(hi ? "चाय और मैगी अब आधिकारिक विषय हैं। सम्मान।" : "Chai and Maggi are officially subjects now. Respect."); }
  const generic = hi ? GENERIC_HI : GENERIC;
  const finisher = generic[h % generic.length];
  const lines = out.slice(0, 2);
  if (lines.length < 2) lines.push(generic[(h >>> 5) % generic.length] === finisher ? generic[(h + 1) % generic.length] : generic[(h >>> 5) % generic.length]);
  lines.push(finisher);
  const score = Math.max(2, Math.min(10, 3 + (h % 3) + hits));
  const parts = raw.split(/,|\band\b|;|\sऔर\s/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const rows = (parts.length ? parts : [hi ? "यहाँ आपका दिन आएगा" : "your day goes here"]).map((text, i) => ({ time: TIMES[i], text }));
  return { lines, score, rows, level: hi ? LEVELS_HI[score] : LEVELS[score] };
}

const btn =
  "min-h-14 w-full cursor-pointer rounded-[18px] border-0 bg-[#ffb020] px-[18px] py-3.5 text-lg font-extrabold text-[#2a1600] shadow-[0_6px_0_#c77d00,0_14px_24px_rgba(199,125,0,.28)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_2px_0_#c77d00] disabled:cursor-default disabled:opacity-50";
const ghost =
  "min-h-[52px] cursor-pointer rounded-[18px] border-2 border-[#f3d9a6] bg-white px-3.5 py-3 text-base font-extrabold text-[#6b3b00] shadow-[0_5px_0_#f3d9a6] active:translate-y-[3px] active:shadow-[0_2px_0_#f3d9a6]";

export default function RoastTimetable() {
  const tr = useTr();
  const hi = useHindi();
  const [phase, setPhase] = useState<Phase>("input");
  const [day, setDay] = useState("");
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const later = useTimers();

  const r = roastFor(day, hi);
  const roasting = phase === "roasting";
  const isResult = phase === "result";
  const stageH = isResult ? 430 : roasting ? 440 : 290;
  const cardTop = roasting ? 60 : isResult ? 0 : 10;
  const cardH = isResult ? 420 : 270;
  const cardTf = roasting
    ? "rotateX(58deg) rotateZ(-5deg) translateZ(-20px)"
    : isResult
      ? flipped ? "rotateY(0deg)" : "rotateY(180deg)"
      : "rotateX(0deg) rotateY(0deg)";

  function roast() {
    if (!day.trim() || phase !== "input") return;
    setPhase("roasting");
    setFlipped(false);
    later(() => setPhase("result"), 2300);
  }

  const input = phase === "input" && (
    <div className="flex flex-col gap-2 lg:col-start-2 lg:row-start-2">
      <label htmlFor="roast-day" className="text-sm font-bold text-[#7a5a2e]">{tr("Your day in one line")}</label>
      <input
        id="roast-day"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && roast()}
        placeholder={tr("6 classes, no breaks, sleep at 2am")}
        maxLength={90}
        autoComplete="off"
        className="box-border w-full rounded-2xl border-2 border-[#f3d9a6] bg-white px-4 py-[15px] text-base font-medium text-[#2a1600] outline-none placeholder:text-[#b39a6c] focus:border-[#ffb020] focus:shadow-[0_0_0_4px_rgba(255,176,32,.2)]"
      />
    </div>
  );

  const stage = (
    <div className="lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:self-center">
      <FitBox width={320} height={stageH} max={1.2} className="transition-[height] duration-500">
        <div className="relative h-full w-[320px] [perspective:900px]">
          {roasting && (
            <>
              <div className="absolute bottom-1.5 left-1/2 h-[110px] w-[300px] -translate-x-1/2">
                {FLAME_H.map((h, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 w-[34px] origin-bottom animate-fz-flick rounded-[50%_50%_50%_50%/62%_62%_38%_38%]"
                    style={{ left: i * 36 + 4, height: h, background: FLAME_COLORS[i % 4], animationDelay: `${(i * 0.07).toFixed(2)}s` }}
                  />
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="absolute bottom-5 size-1.5 animate-fz-rise rounded-full bg-[#ffcf4a]" style={{ left: 20 + i * 42, animationDelay: `${(i * 0.21).toFixed(2)}s` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-1/2 h-[22px] w-[320px] -translate-x-1/2 rounded-[11px] bg-[#3d3a44] shadow-[inset_0_-5px_0_#24222a]" />
            </>
          )}
          <div
            className="absolute left-1/2 -ml-[150px] w-[300px] [transform-style:preserve-3d]"
            style={{ top: cardTop, height: cardH, transform: cardTf, transition: "transform 1s cubic-bezier(.3,1.3,.5,1), top .6s, height .6s" }}
          >
            <div
              className="absolute inset-0 box-border overflow-hidden rounded-[14px] bg-[#fffdf7] px-[18px] py-4 shadow-[0_18px_34px_rgba(42,22,0,.22)] [backface-visibility:hidden] [background-image:repeating-linear-gradient(180deg,transparent_0_33px,#e9dcc0_33px_34px)]"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-[#c73a1d]">{tr("TIMETABLE")}</span>
                <span className="text-xs font-bold text-[#7a5a2e]">{tr("TODAY")}</span>
              </div>
              <div className="mt-1.5 flex flex-col">
                {r.rows.map((row, i) => (
                  <div key={i} className="flex h-[34px] items-center gap-3">
                    <span className="w-11 shrink-0 text-xs font-bold text-[#a07a3e]">{row.time}</span>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-hand text-[23px] text-[#2b3a8f]">{row.text}</span>
                  </div>
                ))}
              </div>
              {roasting && <div className="pointer-events-none absolute inset-0 animate-fz-char rounded-[14px] bg-[radial-gradient(circle_at_50%_80%,#2a1600_0%,rgba(42,22,0,.6)_40%,rgba(42,22,0,0)_75%)]" />}
            </div>
            <div className="absolute inset-0 box-border flex flex-col gap-3.5 rounded-[22px] bg-[#c73a1d] p-[22px] text-white shadow-[0_20px_40px_rgba(199,58,29,.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[.12em] opacity-90">{tr("THE ROAST")}</span>
                <span className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold">{r.level}</span>
              </div>
              {r.lines.map((t, i) => (
                <p key={i} className="m-0 text-[17px] font-medium leading-[1.4]">{t}</p>
              ))}
              <div className="mt-auto text-xs font-bold opacity-85">toppershelf.online/fun</div>
            </div>
          </div>
        </div>
      </FitBox>
    </div>
  );

  const heat = roasting && (
    <div className="text-center font-display text-[26px] font-normal text-[#c73a1d] lg:col-start-2 lg:row-start-3">{tr("Getting the roast ready…")}</div>
  );

  const result = isResult && (
    <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-3">
      <div className="flex items-center justify-between gap-2 rounded-[18px] bg-white px-3.5 py-3 shadow-[0_5px_0_#f3d9a6]">
        <span className="text-sm font-bold text-[#7a5a2e]">{tr("Roast level")}</span>
        <div className="flex gap-[3px]" role="img" aria-label={tr("Roast level {n} out of 10", { n: r.score })}>
          {Array.from({ length: 10 }, (_, i) => (
            <svg key={i} className="w-4 animate-fz-chili min-[380px]:w-5" style={{ animationDelay: `${(0.6 + i * 0.08).toFixed(2)}s` }} viewBox="0 0 20 24" aria-hidden="true">
              <path d="M10 6c4 0 6 3 5 8-1 5-6 9-10 9 3-3 3-6 2-9-1-4 0-8 3-8z" fill={i < r.score ? "#e5381d" : "#f1e3c8"} />
              <path d="M10 6c0-2 1-4 3-5" stroke="#3a8f3a" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          ))}
        </div>
        <span className="text-[22px] font-extrabold">{r.score}/10</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={ghost} onClick={() => { setPhase("input"); setDay(""); setFlipped(false); }}>{tr("Roast another")}</button>
        <button type="button" className={ghost} onClick={() => setFlipped(!flipped)}>{flipped ? tr("Show roast") : tr("Show timetable")}</button>
      </div>
    </div>
  );

  const storyCard = isResult && (
    <div className="flex flex-col items-center gap-3 lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-[380px]">
      <CardRoast cardRef={cardRef} data={{ day, lines: r.lines, level: r.level, score: r.score }} />
      <CardActions
        getNode={() => cardRef.current}
        fileName="roast-toppershelf.png"
        shareText={tr("My timetable got roasted: {n}/10. Roast yours!", { n: r.score })}
        shareUrl={resultLink("roast", { d: day.trim() })}
        btnClass={btn}
        ghostClass={ghost}
      />
    </div>
  );

  const go = phase === "input" && (
    <div className="lg:col-start-2 lg:row-start-3">
      <button type="button" className={btn} onClick={roast} disabled={!day.trim()}>{tr("Roast it")}</button>
    </div>
  );

  return (
    <GameShell
      gradient="linear-gradient(150deg,#facc15 0%,#f97316 45%,#e11d48 100%)"
      icon="/fun-zone/roast-my-timetable.webp"
      iconBg="#feeaac"
      title="Roast My Timetable"
      subtitle="A friendly roast of your day. Nothing is uploaded."
      status="LIVE"
      panelClass="bg-[#fff7e6] px-5 text-[#2a1600] sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-10 lg:gap-y-4"
      rootClass="bg-[#fff7e6]"
      body={<>{input}{stage}{heat}{result}{go}{storyCard}</>}
    />
  );
}
