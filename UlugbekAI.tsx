import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";

/* ─── constants ─────────────────────────────────────────────────── */
const ONE_HOUR = 60 * 60 * 1000;
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const NOW      = Date.now();
const COLOR    = "#C8A96E";

/* ─── AI call ───────────────────────────────────────────────────── */
async function callAI(
  messages : { role: string; content: string }[],
  system   = "",
  maxTokens = 800,
) {
  try {
    const res = await fetch("/api/ai/chat", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ messages, system, maxTokens }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(e?.error ?? `HTTP ${res.status}`);
    }
    const d = await res.json() as { text: string };
    return { ok: true, text: d.text ?? "" };
  } catch (e: unknown) {
    return { ok: false, text: "", error: e instanceof Error ? e.message : String(e) };
  }
}

/* ─── ripple hook ───────────────────────────────────────────────── */
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const addRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const btn  = e.currentTarget.getBoundingClientRect();
    const size = Math.max(btn.width, btn.height) * 2;
    const x    = e.clientX - btn.left - size / 2;
    const y    = e.clientY - btn.top  - size / 2;
    const id   = Date.now() + Math.random();
    setRipples(p => [...p, { id, x, y, size }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 600);
  };

  const RippleLayer = () => (
    <>
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position     : "absolute",
            left         : r.x,
            top          : r.y,
            width        : r.size,
            height       : r.size,
            borderRadius : "50%",
            background   : "rgba(255,255,255,0.28)",
            transform    : "scale(0)",
            animation    : "rippleAnim 0.6s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );

  return { addRipple, RippleLayer };
}

/* ─── Ripple Button ─────────────────────────────────────────────── */
interface RBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
function RBtn({ children, style, onClick, ...rest }: RBtnProps) {
  const { addRipple, RippleLayer } = useRipple();
  return (
    <button
      {...rest}
      onClick={e => { addRipple(e); onClick?.(e); }}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <RippleLayer />
      {children}
    </button>
  );
}

/* ─── data ──────────────────────────────────────────────────────── */
const INIT_MODULES = [
  { id: "chat",      icon: "💬", name: "AI Chat",            cat: "ai",      desc: "Aqlli suhbat",           lastUsed: NOW, uses: 0, locked: true  },
  { id: "voice",     icon: "🎙️", name: "Ovozli Yordamchi",  cat: "ai",      desc: "STT + TTS",              lastUsed: NOW, uses: 0, locked: true  },
  { id: "avatar",    icon: "🎭", name: "Avatar",             cat: "ai",      desc: "Animatsion yuz",         lastUsed: NOW, uses: 0, locked: true  },
  { id: "video",     icon: "🎬", name: "Video Generator",   cat: "media",   desc: "AI video stsenariy",     lastUsed: NOW, uses: 0, locked: false },
  { id: "image",     icon: "🖼️", name: "Rasm & Dizayn",    cat: "media",   desc: "AI rasm yaratish",       lastUsed: NOW, uses: 0, locked: false },
  { id: "social",    icon: "📱", name: "Ijtimoiy Tarmoqlar",cat: "social",  desc: "SMM & kontent",          lastUsed: NOW, uses: 0, locked: false },
  { id: "money",     icon: "💰", name: "Pul Ishlash",       cat: "finance", desc: "Online daromad",         lastUsed: NOW, uses: 0, locked: false },
  { id: "code",      icon: "💻", name: "Dasturchi AI",      cat: "dev",     desc: "Kod yozish & debug",     lastUsed: NOW, uses: 0, locked: false },
  { id: "nocode",    icon: "🛠️", name: "No-Code Builder",   cat: "dev",     desc: "Kodsiz ilovalar",        lastUsed: NOW, uses: 0, locked: false },
  { id: "bank",      icon: "🏦", name: "Bank Operatori",    cat: "finance", desc: "Moliyaviy maslahat",     lastUsed: NOW, uses: 0, locked: false },
  { id: "gov",       icon: "🏛️", name: "Davlat Xizmatlari",cat: "civic",   desc: "Hujjat & ariza",         lastUsed: NOW, uses: 0, locked: false },
  { id: "doctor",    icon: "🏥", name: "Tibbiy Maslahat",   cat: "health",  desc: "Sog'liq ma'lumotlari",  lastUsed: NOW, uses: 0, locked: false },
  { id: "lawyer",    icon: "⚖️", name: "Huquqiy Maslahat",  cat: "civic",   desc: "Qonun & huquq",          lastUsed: NOW, uses: 0, locked: false },
  { id: "translate", icon: "🌐", name: "Tarjimon Pro",      cat: "ai",      desc: "200+ til tarjima",       lastUsed: NOW, uses: 0, locked: false },
  { id: "edu",       icon: "🎓", name: "Ta'lim AI",         cat: "learn",   desc: "O'rgatish & dars",      lastUsed: NOW, uses: 0, locked: false },
  { id: "seo",       icon: "🔍", name: "SEO Optimizer",     cat: "dev",     desc: "Sayt optim & tahlil",    lastUsed: NOW, uses: 0, locked: false },
  { id: "shop",      icon: "🛍️", name: "Online Do'kon",     cat: "finance", desc: "E-commerce yordamchi",  lastUsed: NOW, uses: 0, locked: false },
  { id: "news",      icon: "📰", name: "Tech Yangiliklari", cat: "learn",   desc: "Texnologiya lenta",      lastUsed: NOW, uses: 0, locked: false },
  { id: "logistic",  icon: "🚚", name: "Logistika AI",      cat: "finance", desc: "Yetkazib berish",        lastUsed: NOW, uses: 0, locked: false },
  { id: "files",     icon: "📂", name: "Fayl Menejeri",     cat: "system",  desc: "Telefon fayllar",        lastUsed: NOW, uses: 0, locked: false },
];

const SOCIAL_LIST = [
  { icon: "📸", name: "Instagram", color: "#e1306c", tasks: ["Post yoz","Hashtag","Reel script","Bio optim","Viral caption"] },
  { icon: "✈️", name: "Telegram",  color: "#0088cc", tasks: ["Kanal post","Bot xabar","Announcement","Guruh qoidalari","Reklama matni"] },
  { icon: "🎵", name: "TikTok",    color: "#ff0050", tasks: ["Video g'oyasi","Caption","Trend tahlil","Hook yoz","Duet g'oya"] },
  { icon: "▶️", name: "YouTube",   color: "#ff0000", tasks: ["Sarlavha","Tavsif","Skript","SEO teglari","Thumbnail g'oya"] },
  { icon: "in", name: "LinkedIn",  color: "#0077b5", tasks: ["Post yoz","CV optim","Cover letter","Network post","Article"] },
  { icon: "🐦", name: "Twitter/X", color: "#1da1f2", tasks: ["Tweet yoz","Thread","Bio yoz","Viral post","Reply yoz"] },
  { icon: "👻", name: "Snapchat",  color: "#fffc00", tasks: ["Story g'oya","Caption","DM matni","Filter g'oya"] },
  { icon: "📌", name: "Pinterest", color: "#e60023", tasks: ["Pin tavsif","Board nomi","SEO","Kontent reja"] },
];

const MONEY_LIST = [
  { icon:"📹", name:"YouTube Shorts AI",  earn:"$300-2000/oy", diff:"Oson",  how:"AI video → monetizatsiya → AdSense" },
  { icon:"✍️", name:"AI Blog/Maqola",    earn:"$100-800/oy",  diff:"Oson",  how:"ChatGPT/Claude → blog → Google reklama" },
  { icon:"🎨", name:"AI Rasm Sotish",    earn:"$200-1500/oy", diff:"O'rta", how:"Midjourney → Etsy/Gumroad → sotish" },
  { icon:"🤖", name:"Telegram Bot",      earn:"$50-500/oy",   diff:"O'rta", how:"Bot yaratish → kanalga ulash → to'lov" },
  { icon:"📱", name:"SMM Xizmati",       earn:"$300-1200/oy", diff:"Oson",  how:"AI kontent → mahalliy bizneslar → oylik" },
  { icon:"💻", name:"No-Code Ilovalar",  earn:"$500-5000/oy", diff:"O'rta", how:"Bubble/Glide → mijoz topish → loyiha" },
  { icon:"🎓", name:"Online Kurs",       earn:"$300-3000/oy", diff:"O'rta", how:"AI kurs yozish → Udemy/Teachable" },
  { icon:"📈", name:"Crypto AI Signal",  earn:"$100-2000/oy", diff:"Qiyin", how:"AI tahlil → signal kanal → obuna" },
  { icon:"🚀", name:"Dropshipping",      earn:"$200-1500/oy", diff:"O'rta", how:"AI mahsulot → Shopify → reklama" },
  { icon:"🎧", name:"AI Podcast",        earn:"$50-600/oy",   diff:"Oson",  how:"AI skript → ElevenLabs → Spotify" },
  { icon:"📧", name:"Email Marketing",   earn:"$200-1000/oy", diff:"O'rta", how:"AI email → Mailchimp → mijoz" },
  { icon:"🔗", name:"Affiliate",         earn:"$100-3000/oy", diff:"Oson",  how:"AI review → link → komissiya" },
];

/* ─── helpers ───────────────────────────────────────────────────── */
function timeLeft(lastUsed: number) {
  const rem = lastUsed + ONE_YEAR - Date.now();
  if (rem <= 0) return "O'chirish vaqti!";
  const days = Math.floor(rem / 86400000);
  return days > 60 ? `${Math.floor(days / 30)} oy qoldi` : `${days} kun qoldi`;
}

const Dots = () => (
  <span style={{ display:"inline-flex", gap:5, alignItems:"center" }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        width:7, height:7, borderRadius:"50%", background:COLOR,
        animation:`tdot 1.2s ease ${i*.2}s infinite`,
      }}/>
    ))}
  </span>
);

/* ─── Avatar ────────────────────────────────────────────────────── */
function Avatar({ talking, thinking, size=105 }: { talking:boolean; thinking:boolean; size?:number }) {
  const [blink,   setBlink]   = useState(false);
  const [tilt,    setTilt]    = useState(0);
  const [mouthH,  setMouthH]  = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 2800 + Math.random() * 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!talking) { setTilt(0); setMouthH(0); return; }
    const t = setInterval(() => {
      setTilt((Math.random()-.5)*6);
      setMouthH(Math.random()*12);
    }, 220);
    return () => clearInterval(t);
  }, [talking]);

  const sc   = size / 160;
  const eyeH = blink ? 1 : 10;
  const mouthD = talking
    ? `M 58 122 Q 80 ${134+mouthH} 102 122`
    : thinking ? "M 62 123 Q 80 120 98 123"
    : "M 60 121 Q 80 131 100 121";

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      {talking && [1,2,3].map(i=>(
        <div key={i} style={{
          position:"absolute", inset:-10*i, borderRadius:"50%",
          border:`1.5px solid ${COLOR}`,
          animation:`ripR 1.5s ease ${i*.3}s infinite`,
          opacity:0, pointerEvents:"none",
        }}/>
      ))}
      <div style={{
        transform:`rotate(${tilt}deg) scale(${sc})`,
        transformOrigin:"center bottom",
        filter:`drop-shadow(0 0 18px ${COLOR}66)`,
        animation:"avatarFloat 4s ease-in-out infinite",
      }}>
        <svg width="160" height="180" viewBox="0 0 160 180">
          <rect x="56" y="148" width="48" height="22" rx="12" fill={COLOR} opacity=".85"/>
          <rect x="68" y="138" width="24" height="16" rx="8" fill="#e8c9a0"/>
          <ellipse cx="80" cy="90" rx="48" ry="52" fill="#f5d5a8"/>
          <ellipse cx="80" cy="44" rx="48" ry="22" fill="#2a1a0e"/>
          <ellipse cx="32" cy="72" rx="10" ry="24" fill="#2a1a0e"/>
          <ellipse cx="128" cy="72" rx="10" ry="24" fill="#2a1a0e"/>
          <rect x="32" y="42" width="96" height="30" fill="#2a1a0e" rx="4"/>
          <ellipse cx="32" cy="92" rx="9" ry="13" fill="#e8c9a0"/>
          <ellipse cx="128" cy="92" rx="9" ry="13" fill="#e8c9a0"/>
          <ellipse cx="32" cy="92" rx="5" ry="8" fill="#d4a882"/>
          <ellipse cx="128" cy="92" rx="5" ry="8" fill="#d4a882"/>
          <path d={thinking?"M 50 74 Q 62 68 70 74":"M 50 72 Q 62 66 70 72"}
            stroke="#2a1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d={thinking?"M 90 74 Q 98 68 110 74":"M 90 72 Q 98 66 110 72"}
            stroke="#2a1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="62" cy="94" rx="13" ry={eyeH} fill="white"/>
          <ellipse cx="98" cy="94" rx="13" ry={eyeH} fill="white"/>
          {!blink && <>
            <ellipse cx="62" cy="96" rx="8" ry="8" fill={COLOR}/>
            <ellipse cx="98" cy="96" rx="8" ry="8" fill={COLOR}/>
            <ellipse cx="63" cy="97" rx="4.5" ry="4.5" fill="#0a0500"/>
            <ellipse cx="99" cy="97" rx="4.5" ry="4.5" fill="#0a0500"/>
            <circle cx="65" cy="95" r="2.2" fill="white" opacity=".9"/>
            <circle cx="101" cy="95" r="2.2" fill="white" opacity=".9"/>
          </>}
          <path d="M 77 106 Q 74 116 80 118 Q 86 116 83 106"
            stroke="#c09070" strokeWidth="1.5" fill="none"/>
          <path d={mouthD} stroke="#8B4513" strokeWidth="2.5"
            fill={talking?"#cc5555":"none"} strokeLinecap="round"/>
          {talking && <ellipse cx="80" cy="130" rx="8" ry="5" fill="#aa2222"/>}
          {(talking||thinking) && <>
            <ellipse cx="46" cy="108" rx="11" ry="7" fill="#ffaaaa" opacity=".25"/>
            <ellipse cx="114" cy="108" rx="11" ry="7" fill="#ffaaaa" opacity=".25"/>
          </>}
          {thinking && [0,1,2].map(i=>(
            <circle key={i} cx={108+i*12} cy={66-i*6} r="4.5" fill={COLOR}
              style={{ animation:`tDotA 1s ease ${i*.25}s infinite alternate` }}/>
          ))}
        </svg>
      </div>
      <div style={{
        position:"absolute", bottom:6, right:6,
        width:13, height:13, borderRadius:"50%",
        background: talking?"#ff6b6b": thinking?"#ffd166":"#06d6a0",
        border:"2px solid #070b16",
        animation:(talking||thinking)?"blink 1s infinite":"none",
      }}/>
    </div>
  );
}

/* ─── Message Bubble ────────────────────────────────────────────── */
function MsgBubble({
  msg, onSpeak,
}: {
  msg: { role:string; content:string; typing?:boolean };
  onSpeak: (t:string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display:"flex", justifyContent:isUser?"flex-end":"flex-start",
      marginBottom:10, animation:"fadeUp .25s ease",
    }}>
      <div style={{
        maxWidth:"82%", padding:"10px 14px",
        borderRadius: isUser?"18px 18px 4px 18px":"4px 18px 18px 18px",
        background: isUser
          ? `linear-gradient(135deg,${COLOR}ee,${COLOR}aa)`
          : "rgba(255,255,255,0.08)",
        border: isUser?"none":"1px solid rgba(255,255,255,0.1)",
        color: isUser?"#080c18":"#e8e8e8",
        fontSize:14, lineHeight:1.65,
        whiteSpace:"pre-wrap", wordBreak:"break-word",
        position:"relative",
        boxShadow: isUser?`0 4px 14px ${COLOR}33`:"none",
      }}>
        {msg.typing ? <Dots /> : msg.content}
        {!isUser && !msg.typing && (
          <button onClick={() => onSpeak(msg.content)} style={{
            position:"absolute", bottom:4, right:8,
            background:"none", border:"none", cursor:"pointer",
            fontSize:13, opacity:.4, padding:2,
          }}>🔊</button>
        )}
      </div>
    </div>
  );
}

/* ─── types ─────────────────────────────────────────────────────── */
type Module   = typeof INIT_MODULES[number] & { auto?:boolean; earning?:string; tech?:string; addedAt?:number; removedAt?:number };
type Msg      = { role:string; content:string; typing?:boolean };
type LearnLog = { time:string; type:string; icon:string; text:string; tech?:string };
type Notif    = { id:number; text:string; type:string };
type VideoRes = { title?:string; duration?:string; hook?:string; scenes?:{ time:string; visual:string; voiceover?:string }[]; music?:string; platform?:string; cta?:string; tips?:string };

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function UlugbekAI() {
  const [modules,    setModules]   = useState<Module[]>(INIT_MODULES);
  const [removed,    setRemoved]   = useState<Module[]>([]);
  const [messages,   setMessages]  = useState<Msg[]>([]);
  const [input,      setInput]     = useState("");
  const [sending,    setSending]   = useState(false);
  const [talking,    setTalking]   = useState(false);
  const [thinking,   setThinking]  = useState(false);
  const [bubble,     setBubble]    = useState("Salom! Men har soatda yangi narsa o'rganaman 🌟");
  const [tab,        setTab]       = useState("chat");
  const [learnLog,   setLearnLog]  = useState<LearnLog[]>([]);
  const [discovering,setDiscover]  = useState(false);
  const [countdown,  setCountdown] = useState(ONE_HOUR);
  const [notifs,     setNotifs]    = useState<Notif[]>([]);
  const [showNotif,  setShowNotif] = useState(false);
  const [videoP,     setVideoP]    = useState("");
  const [videoRes,   setVideoRes]  = useState<VideoRes|null>(null);
  const [videoLoad,  setVideoLoad] = useState(false);
  const [listening,  setListening] = useState(false);
  const [ttsOn,      setTtsOn]     = useState(true);
  const [agentId,    setAgentId]   = useState("chat");
  const [lastLearn,  setLastLearn] = useState(Date.now());

  const endRef    = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const synthRef  = useRef<SpeechSynthesis|null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const recogRef  = useRef<SpeechRecognition|null>(null);
  const talkTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  /* scroll to bottom */
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  /* countdown tick */
  useEffect(() => {
    const t = setInterval(() =>
      setCountdown(Math.max(0, ONE_HOUR - (Date.now() - lastLearn))), 1000);
    return () => clearInterval(t);
  }, [lastLearn]);

  /* hourly auto-discover */
  useEffect(() => {
    const t = setInterval(() => discoverNew(), ONE_HOUR);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* yearly auto-remove */
  useEffect(() => {
    const t = setInterval(() => removeOld(), 24*60*60*1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── helpers ── */
  const addNotif = useCallback((text:string, type="info") => {
    const n:Notif = { id:Date.now(), text, type };
    setNotifs(p => [n,...p].slice(0,20));
    setShowNotif(true);
    setTimeout(()=>setShowNotif(false), 4500);
  }, []);

  const animTalk = useCallback((ms=3500) => {
    setTalking(true);
    if (talkTimer.current) clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(()=>setTalking(false), ms);
  }, []);

  const speakText = useCallback((text:string) => {
    if (!ttsOn || !synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0,450));
    u.lang="uz-UZ"; u.rate=0.93; u.pitch=1.05;
    u.onstart = () => setTalking(true);
    u.onend   = () => setTalking(false);
    u.onerror = () => setTalking(false);
    synthRef.current.speak(u);
  }, [ttsOn]);

  const removeOld = useCallback(() => {
    const cutoff = Date.now() - ONE_YEAR;
    setModules(prev => {
      const keep:Module[] = [], gone:Module[] = [];
      prev.forEach(m => {
        if (!m.locked && m.lastUsed < cutoff) {
          gone.push({ ...m, removedAt:Date.now() });
          addNotif(`🗑️ "${m.name}" — 1 yil ishlatilmadi`, "warn");
          setLearnLog(p => [{
            time:new Date().toLocaleTimeString(),
            type:"remove", icon:m.icon,
            text:`"${m.name}" o'chirildi — 1 yil ishlatilmagan`,
          },...p].slice(0,60));
        } else keep.push(m);
      });
      if (gone.length) setRemoved(p => [...gone,...p].slice(0,30));
      return keep;
    });
  }, [addNotif]);

  const discoverNew = useCallback(async () => {
    if (discovering) return;
    setDiscover(true);
    setLastLearn(Date.now());
    setBubble("🌐 Internet orqali yangi texnologiya qidiryapman...");

    const r = await callAI(
      [{ role:"user", content:
        `2025-2026 eng yangi AI yoki texnologiya funksiyasidan BITTA tanlang. Faqat JSON:\n{"id":"snake_id","icon":"emoji","name":"O'zbek nomi","cat":"ai|media|finance|dev|social|health|learn","desc":"Qisqa ta'rif","earning":"$X-Y/oy","tech":"Texnologiya"}\n\nFaqat JSON. Hech qanday izoh yo'q.`
      }],
      "Faqat toza JSON qaytargin.", 250
    );

    if (r.ok && r.text) {
      try {
        const parsed = JSON.parse(r.text.replace(/```[\w]*|```/g,"").trim()) as {
          name?:string; icon?:string; cat?:string; desc?:string; earning?:string; tech?:string;
        };
        if (parsed?.name && parsed?.icon) {
          const m:Module = {
            id:`auto_${Date.now()}`,
            icon:parsed.icon, name:parsed.name,
            cat:parsed.cat??"ai", desc:parsed.desc??"",
            earning:parsed.earning??"", tech:parsed.tech??"",
            lastUsed:Date.now(), uses:0, locked:false,
            auto:true, addedAt:Date.now(),
          };
          setModules(prev => prev.find(x=>x.name===m.name) ? prev : [...prev,m]);
          setLearnLog(p => [{
            time:new Date().toLocaleTimeString(), type:"add",
            icon:m.icon, text:`"${m.name}" qo'shildi${m.earning?` — ${m.earning}`:""}`,
            tech:m.tech,
          },...p].slice(0,60));
          addNotif(`✨ Yangi: ${m.name}`, "success");
          setBubble(`✨ Yangi funksiya: ${m.name}!`);
          setTimeout(()=>setBubble(""),5000);
        }
      } catch { setBubble(""); }
    } else setBubble("");
    setDiscover(false);
  }, [discovering, addNotif]);

  /* ── send message ── */
  const sendMessage = useCallback(async (txtArg?:string) => {
    const text = (txtArg ?? input).trim();
    if (!text || sending) return;

    const history:Msg[] = [...messages, { role:"user", content:text }];
    setMessages(history);
    setInput("");
    setSending(true);
    setThinking(true);
    setBubble("O'ylamoqda...");
    setModules(prev => prev.map(m =>
      m.id===agentId ? { ...m, lastUsed:Date.now(), uses:m.uses+1 } : m
    ));

    const SYS: Record<string,string> = {
      chat:      "Sen Ulug'bek AI — foydalanuvchining aqlli yordamchisi. Samimiy, qisqa javob ber. O'zbek tilida.",
      code:      "Sen ekspert dasturchi. Kodlarni ```kod_tili\n...\n``` formatida yoz. O'zbek tilida tushuntir.",
      bank:      "Sen bank operatorisan. Hisob, karta, kredit, o'tkazma haqida aniq ma'lumot ber. O'zbek tilida.",
      gov:       "Sen davlat xizmatlari ekspertisan. Hujjatlar, ariza berish, portallar haqida aniq gapir. O'zbek tilida.",
      doctor:    "Sen tibbiy ma'lumot beruvchi. Umumiy ma'lumot ber, shifokorga murojaat qilishni tavsiya et. O'zbek tilida.",
      lawyer:    "Sen huquqiy maslahatchi. O'zbekiston qonunlari, huquqlar haqida tushuntir. O'zbek tilida.",
      translate: "Sen tarjimonsan. Berilgan matnni so'ralgan tilga aniq tarjima qil.",
      social:    "Sen SMM mutaxassis. Viral, kreativ O'zbek auditoriyasiga mos kontent yarat.",
      money:     "Sen online pul ishlash ekspertisan. Amaliy qadamba-qadam yo'l xaritasi ber. O'zbek tilida.",
      edu:       "Sen sabr-toqatli o'qituvchi. Har qanday mavzuni oddiy, misollar bilan tushuntir. O'zbek tilida.",
    };
    const agent = INIT_MODULES.find(m=>m.id===agentId);
    const sys = SYS[agentId] ?? `Sen Ulug'bek AI — ${agent?.name??"yordamchi"}. O'zbek tilida qisqa, foydali javob ber.`;

    const result = await callAI(history as {role:string;content:string}[], sys);

    if (result.ok) {
      const reply = result.text;
      setMessages([...history, { role:"assistant", content:reply }]);
      setBubble("");
      setThinking(false);
      animTalk(Math.min(reply.length*28, 5000));
      if (ttsOn) speakText(reply);
    } else {
      setMessages([...history, {
        role:"assistant",
        content:`⚠️ Ulanish xatosi: ${result.error??""}\n\nIltimos qayta urining.`,
      }]);
      setBubble("");
      setThinking(false);
    }

    setSending(false);
    setTimeout(()=>inputRef.current?.focus(), 100);
  }, [input, messages, sending, agentId, animTalk, speakText, ttsOn]);

  /* ── voice input ── */
  const toggleListen = useCallback(() => {
    const SR = (window as Window & { SpeechRecognition?:typeof SpeechRecognition; webkitSpeechRecognition?:typeof SpeechRecognition })
      .SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?:typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { addNotif("⚠️ Chrome yoki Edge brauzerida ishlating","warn"); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang="uz-UZ"; r.interimResults=false;
    r.onstart  = () => setListening(true);
    r.onresult = (e:SpeechRecognitionEvent) => { const t=e.results[0][0].transcript; sendMessage(t); };
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    recogRef.current = r;
    r.start();
  }, [listening, sendMessage, addNotif]);

  /* ── video gen ── */
  const genVideo = async () => {
    if (!videoP.trim()) return;
    setVideoLoad(true);
    setModules(p=>p.map(m=>m.id==="video"?{...m,lastUsed:Date.now(),uses:m.uses+1}:m));
    const r = await callAI(
      [{ role:"user", content:
        `Video mavzusi: "${videoP}"\n\nFaqat JSON:\n{"title":"...","duration":"...s","platform":"TikTok/YouTube/Instagram","scenes":[{"time":"0-5s","visual":"...","voiceover":"..."},{"time":"5-12s","visual":"...","voiceover":"..."},{"time":"12-20s","visual":"...","voiceover":"..."}],"music":"...","hook":"...","cta":"...","tips":"..."}`
      }],
      "Faqat toza JSON qaytargin. Hech qanday izoh, markdown yo'q.", 700
    );
    if (r.ok) {
      try {
        setVideoRes(JSON.parse(r.text.replace(/```[\w]*|```/g,"").trim()) as VideoRes);
      } catch {
        setVideoRes({ title:"Qayta urining", tips:r.text.slice(0,200) });
      }
    } else setVideoRes({ title:"Ulanish xatosi", tips:r.error });
    setVideoLoad(false);
  };

  /* ── countdown string ── */
  const hh = String(Math.floor(countdown/3600000)).padStart(2,"0");
  const mm = String(Math.floor((countdown%3600000)/60000)).padStart(2,"0");
  const ss = String(Math.floor((countdown%60000)/1000)).padStart(2,"0");

  const activeMods = modules;
  const autoMods   = modules.filter(m=>m.auto);

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100dvh", background:"#070b16",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      overflow:"hidden", userSelect:"none",
    }}>
      {/* ── CSS ── */}
      <style>{`
        @keyframes tdot{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-8px);opacity:1}}
        @keyframes avatarFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes ripR{0%{transform:scale(.8);opacity:.5}100%{transform:scale(2.4);opacity:0}}
        @keyframes tDotA{from{transform:translateY(0);opacity:.3}to{transform:translateY(-9px);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 10px #C8A96E33}50%{box-shadow:0 0 24px #C8A96E77}}
        @keyframes rippleAnim{to{transform:scale(1);opacity:0}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:3px}
        input,textarea{outline:none;font-family:inherit}
        textarea{resize:none}
        button{font-family:inherit;cursor:pointer;transition:transform .12s,opacity .12s}
        button:active{transform:scale(.93)!important}
        button:disabled{cursor:default}
      `}</style>

      {/* ── BG glow ── */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`radial-gradient(ellipse at 15% 10%,${COLOR}14 0%,transparent 45%),
                   radial-gradient(ellipse at 85% 85%,#60a5fa0a 0%,transparent 45%)`,
      }}/>

      {/* ── notification ── */}
      {showNotif && notifs[0] && (
        <div style={{ position:"fixed", top:72, right:10, zIndex:500, animation:"slideDown .3s ease", maxWidth:290 }}>
          <div style={{
            background:"#0c1220",
            border:`1px solid ${notifs[0].type==="success"?"#06d6a0":notifs[0].type==="warn"?"#ff6b6b":COLOR}55`,
            borderRadius:13, padding:"10px 14px",
            backdropFilter:"blur(14px)",
            boxShadow:"0 8px 32px rgba(0,0,0,.4)",
            color:"#e8e8e8", fontSize:12.5,
          }}>
            {notifs[0].text}
          </div>
        </div>
      )}

      {/* ════ HEADER ════ */}
      <div style={{
        position:"relative", zIndex:20,
        padding:"10px 13px",
        borderBottom:"1px solid rgba(255,255,255,.07)",
        display:"flex", alignItems:"center", gap:9,
        background:"rgba(0,0,0,.4)", backdropFilter:"blur(16px)",
      }}>
        {/* logo */}
        <div style={{
          width:35, height:35, borderRadius:10, flexShrink:0,
          background:`linear-gradient(135deg,${COLOR},#7a5810)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:19, animation:"glow 3s infinite",
        }}>⭐</div>

        {/* title */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:COLOR, fontWeight:800, fontSize:14, letterSpacing:.3 }}>ULUG'BEK AI</div>
          <div style={{ color:"rgba(255,255,255,.3)", fontSize:9.5, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ color:"#06d6a0", fontSize:8 }}>●</span>
            <span style={{ color:COLOR }}>{activeMods.length}</span> modul aktiv
            {autoMods.length>0 && <span style={{ color:"#06d6a0" }}>· +{autoMods.length} AI qo'shgan</span>}
          </div>
        </div>

        {/* countdown */}
        <div style={{
          padding:"5px 10px", borderRadius:9, flexShrink:0,
          background:"rgba(255,255,255,.05)",
          border:`1px solid ${COLOR}33`, textAlign:"center",
        }}>
          <div style={{ color:"rgba(255,255,255,.3)", fontSize:8, letterSpacing:.4 }}>KEYINGI</div>
          <div style={{
            color:discovering?"#06d6a0":COLOR,
            fontSize:13, fontWeight:700, fontVariantNumeric:"tabular-nums",
            animation:discovering?"blink .6s infinite":"none",
          }}>
            {discovering ? "🌐 ..." : `${hh}:${mm}:${ss}`}
          </div>
        </div>

        {/* refresh */}
        <RBtn onClick={discoverNew} disabled={discovering} title="Yangi funksiya qo'shish" style={{
          background:`${COLOR}18`, border:`1px solid ${COLOR}44`,
          borderRadius:9, width:33, height:33,
          color:discovering?"rgba(255,255,255,.25)":COLOR,
          fontSize:15, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ display:"inline-block", animation:discovering?"spin 1s linear infinite":"none" }}>🔄</span>
        </RBtn>

        {/* TTS */}
        <RBtn onClick={()=>{ synthRef.current?.cancel(); setTtsOn(!ttsOn); }} style={{
          background:ttsOn?"rgba(6,214,160,.12)":"rgba(255,107,107,.12)",
          border:`1px solid ${ttsOn?"rgba(6,214,160,.3)":"rgba(255,107,107,.3)"}`,
          borderRadius:9, width:33, height:33,
          color:ttsOn?"#06d6a0":"#ff6b6b",
          fontSize:15, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {ttsOn?"🔊":"🔇"}
        </RBtn>

        {/* bell */}
        <RBtn onClick={()=>setShowNotif(!showNotif)} style={{
          position:"relative",
          background:"rgba(255,255,255,.06)",
          border:"1px solid rgba(255,255,255,.09)",
          borderRadius:9, width:33, height:33,
          color:"rgba(255,255,255,.45)", fontSize:15,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          🔔
          {notifs.length>0 && (
            <span style={{
              position:"absolute", top:5, right:5,
              width:7, height:7, borderRadius:"50%",
              background:"#ff6b6b", border:"1px solid #070b16",
            }}/>
          )}
        </RBtn>
      </div>

      {/* ════ AVATAR + TABS ════ */}
      <div style={{
        position:"relative", zIndex:5,
        display:"flex", alignItems:"center", gap:11,
        padding:"10px 13px 8px",
        background:"rgba(0,0,0,.14)",
        borderBottom:"1px solid rgba(255,255,255,.05)",
      }}>
        <div style={{ flexShrink:0 }}>
          <Avatar talking={talking} thinking={thinking} size={105}/>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {bubble && (
            <div style={{
              background:`${COLOR}1a`, border:`1.5px solid ${COLOR}44`,
              borderRadius:"12px 12px 12px 3px",
              padding:"7px 11px", marginBottom:7,
              color:"#e8e8e8", fontSize:11.5, lineHeight:1.55,
              animation:"fadeUp .3s ease",
            }}>
              {bubble}
            </div>
          )}
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:2 }}>
            {[
              { id:"chat",    icon:"💬", label:"Chat"     },
              { id:"video",   icon:"🎬", label:"Video"    },
              { id:"social",  icon:"📱", label:"Social"   },
              { id:"money",   icon:"💰", label:"Pul"      },
              { id:"modules", icon:"🧩", label:"Modullar" },
              { id:"learn",   icon:"🧠", label:"Log"      },
            ].map(t => (
              <RBtn key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"5px 9px", borderRadius:14, whiteSpace:"nowrap",
                border:`1px solid ${tab===t.id?COLOR:"rgba(255,255,255,.09)"}`,
                background:tab===t.id?`${COLOR}22`:"rgba(255,255,255,.04)",
                color:tab===t.id?COLOR:"rgba(255,255,255,.38)",
                fontSize:10.5, fontWeight:tab===t.id?700:400,
                display:"flex", alignItems:"center", gap:3,
              }}>
                {t.icon} {t.label}
              </RBtn>
            ))}
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:5 }}>

        {/* ── CHAT ── */}
        {tab==="chat" && (
          <div style={{ padding:"12px 13px" }}>
            {/* agent selector */}
            <div style={{ display:"flex", gap:5, overflowX:"auto", marginBottom:12, paddingBottom:2 }}>
              {[
                { id:"chat",      icon:"💬", name:"Umumiy"  },
                { id:"code",      icon:"💻", name:"Kod"     },
                { id:"bank",      icon:"🏦", name:"Bank"    },
                { id:"gov",       icon:"🏛️", name:"Davlat"  },
                { id:"doctor",    icon:"🏥", name:"Tibbiy"  },
                { id:"lawyer",    icon:"⚖️", name:"Huquq"   },
                { id:"translate", icon:"🌐", name:"Tarjima" },
                { id:"edu",       icon:"🎓", name:"Ta'lim"  },
              ].map(a => (
                <RBtn key={a.id} onClick={()=>setAgentId(a.id)} style={{
                  padding:"4px 10px", borderRadius:12, whiteSpace:"nowrap",
                  border:`1px solid ${agentId===a.id?COLOR:"rgba(255,255,255,.08)"}`,
                  background:agentId===a.id?`${COLOR}22`:"rgba(255,255,255,.04)",
                  color:agentId===a.id?COLOR:"rgba(255,255,255,.35)",
                  fontSize:11, display:"flex", alignItems:"center", gap:4,
                }}>
                  {a.icon} {a.name}
                </RBtn>
              ))}
            </div>

            {messages.length===0 ? (
              <div style={{ textAlign:"center", padding:"20px 0", color:"rgba(255,255,255,.22)", fontSize:13 }}>
                <div style={{ fontSize:34, marginBottom:10 }}>💬</div>
                <div style={{ marginBottom:16 }}>Suhbat boshlang!</div>
                <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                  {["Salom! Nima qila olasan?","Pul ishlash usullari","Python kodi yoz","AI yangiliklari","O'zbekiston qonunlari"].map(h=>(
                    <RBtn key={h} onClick={()=>sendMessage(h)} style={{
                      background:`${COLOR}18`, border:`1px solid ${COLOR}33`,
                      borderRadius:18, padding:"6px 13px", color:COLOR, fontSize:11.5,
                    }}>{h}</RBtn>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m,i)=>(
                <MsgBubble key={i} msg={m} onSpeak={speakText}/>
              ))
            )}
            <div ref={endRef}/>
          </div>
        )}

        {/* ── VIDEO ── */}
        {tab==="video" && (
          <div style={{ padding:13 }}>
            <div style={{ color:COLOR, fontWeight:700, fontSize:14, marginBottom:3 }}>🎬 AI Video Generator</div>
            <div style={{ color:"rgba(255,255,255,.35)", fontSize:11.5, marginBottom:12 }}>
              Mavzuni kiriting — stsenariy, kadrlar, ovoz matni, maslahat
            </div>
            <div style={{ display:"flex", gap:7, marginBottom:9 }}>
              <input
                value={videoP} onChange={e=>setVideoP(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") genVideo(); }}
                placeholder="Masalan: Viral TikTok — O'zbek oshxonasi..."
                style={{
                  flex:1, background:"rgba(255,255,255,.06)",
                  border:`1px solid ${COLOR}44`, borderRadius:10,
                  padding:"9px 13px", color:"#e8e8e8", fontSize:13,
                }}
              />
              <RBtn onClick={genVideo} disabled={videoLoad||!videoP.trim()} style={{
                padding:"9px 14px", borderRadius:10,
                background:videoLoad||!videoP.trim()
                  ?"rgba(255,255,255,.06)"
                  :`linear-gradient(135deg,${COLOR},${COLOR}99)`,
                border:"none",
                color:videoLoad||!videoP.trim()?"rgba(255,255,255,.25)":"#080c18",
                fontWeight:700, fontSize:12, whiteSpace:"nowrap",
              }}>
                {videoLoad ? "⏳..." : "🎬 Yaratish"}
              </RBtn>
            </div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
              {["TikTok Viral 🔥","YouTube Short","Instagram Reel","Mahsulot Reklama","Motivatsiya"].map(p=>(
                <RBtn key={p} onClick={()=>setVideoP(p+" uchun video")} style={{
                  background:`${COLOR}12`, border:`1px solid ${COLOR}33`,
                  borderRadius:13, padding:"4px 10px", color:COLOR, fontSize:11,
                }}>{p}</RBtn>
              ))}
            </div>
            {videoRes && (
              <div style={{
                background:"rgba(255,255,255,.04)", border:`1px solid ${COLOR}33`,
                borderRadius:13, padding:13, animation:"fadeUp .3s ease",
              }}>
                <div style={{ color:COLOR, fontWeight:700, fontSize:13, marginBottom:8 }}>
                  🎬 {videoRes.title}{videoRes.duration&&` · ${videoRes.duration}`}
                </div>
                {videoRes.hook && (
                  <div style={{ background:`${COLOR}15`, borderRadius:8, padding:"7px 10px", marginBottom:8, color:COLOR, fontSize:12 }}>
                    🎣 Hook: {videoRes.hook}
                  </div>
                )}
                {videoRes.scenes?.map((s,i)=>(
                  <div key={i} style={{
                    display:"flex", gap:9, marginBottom:7,
                    padding:"8px 10px", background:"rgba(255,255,255,.04)",
                    borderRadius:8, borderLeft:`3px solid ${COLOR}`,
                  }}>
                    <div style={{ color:COLOR, fontSize:10, fontWeight:700, flexShrink:0, marginTop:1, minWidth:36 }}>{s.time}</div>
                    <div>
                      <div style={{ color:"rgba(255,255,255,.75)", fontSize:12 }}>{s.visual}</div>
                      {s.voiceover&&<div style={{ color:"rgba(255,255,255,.35)", fontSize:11, marginTop:3, fontStyle:"italic" }}>🗣️ {s.voiceover}</div>}
                    </div>
                  </div>
                ))}
                {videoRes.music    && <div style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginTop:5 }}>🎵 Musiqa: {videoRes.music}</div>}
                {videoRes.platform && <div style={{ color:"rgba(255,255,255,.4)", fontSize:11 }}>📲 Platform: {videoRes.platform}</div>}
                {videoRes.cta      && <div style={{ color:"rgba(255,255,255,.4)", fontSize:11 }}>👉 CTA: {videoRes.cta}</div>}
                {videoRes.tips     && (
                  <div style={{ marginTop:8, padding:"8px 11px", background:`${COLOR}12`, borderRadius:8, color:COLOR, fontSize:11.5 }}>
                    💡 {videoRes.tips}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SOCIAL ── */}
        {tab==="social" && (
          <div style={{ padding:13 }}>
            <div style={{ color:COLOR, fontWeight:700, fontSize:14, marginBottom:3 }}>📱 Ijtimoiy Tarmoqlar AI</div>
            <div style={{ color:"rgba(255,255,255,.35)", fontSize:11.5, marginBottom:12 }}>Platforma tanlang va kontent turini bosing</div>
            {SOCIAL_LIST.map(p=>(
              <div key={p.name} style={{
                marginBottom:10, padding:"12px 13px", borderRadius:13,
                background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
                  <div style={{
                    width:32, height:32, borderRadius:8, background:p.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:700, color:"#fff",
                  }}>{p.icon}</div>
                  <span style={{ color:"rgba(255,255,255,.8)", fontWeight:600, fontSize:13 }}>{p.name}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {p.tasks.map(t=>(
                    <RBtn key={t} onClick={()=>{
                      setModules(prev=>prev.map(m=>m.id==="social"?{...m,lastUsed:Date.now(),uses:m.uses+1}:m));
                      sendMessage(`${p.name} uchun ${t} — viral, kreativ, O'zbek auditoriyasiga mos`);
                      setTab("chat");
                    }} style={{
                      background:`${p.color}22`, border:`1px solid ${p.color}44`,
                      borderRadius:13, padding:"5px 10px", color:p.color, fontSize:11,
                    }}>{t}</RBtn>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MONEY ── */}
        {tab==="money" && (
          <div style={{ padding:13 }}>
            <div style={{ color:COLOR, fontWeight:700, fontSize:14, marginBottom:3 }}>💰 Online Pul Ishlash</div>
            <div style={{ color:"rgba(255,255,255,.35)", fontSize:11.5, marginBottom:12 }}>Bosing → AI qadama-qadam yo'l xaritasi beradi</div>
            {MONEY_LIST.map((idea,i)=>(
              <RBtn key={i} onClick={()=>{
                setModules(prev=>prev.map(m=>m.id==="money"?{...m,lastUsed:Date.now(),uses:m.uses+1}:m));
                sendMessage(`"${idea.name}" bilan pul ishlash bo'yicha qadama-qadam yo'l xaritasi ber. O'zbekiston uchun mos, amaliy.`);
                setTab("chat");
              }} style={{
                display:"flex", alignItems:"center", gap:11,
                padding:"11px 13px", marginBottom:7, borderRadius:12,
                background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
                width:"100%", textAlign:"left",
              }}>
                <div style={{ fontSize:26, flexShrink:0 }}>{idea.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"rgba(255,255,255,.82)", fontWeight:600, fontSize:13 }}>{idea.name}</div>
                  <div style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginTop:2 }}>{idea.how}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ color:"#06d6a0", fontWeight:700, fontSize:12 }}>{idea.earn}</div>
                  <div style={{ color:idea.diff==="Oson"?"#06d6a0":idea.diff==="O'rta"?"#ffd166":"#ff6b6b", fontSize:10, marginTop:2 }}>
                    {idea.diff}
                  </div>
                </div>
              </RBtn>
            ))}
          </div>
        )}

        {/* ── MODULES ── */}
        {tab==="modules" && (
          <div style={{ padding:13 }}>
            <div style={{ color:COLOR, fontWeight:700, fontSize:14, marginBottom:12 }}>🧩 Barcha Modullar ({activeMods.length})</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {modules.map(m=>(
                <RBtn key={m.id} onClick={()=>{ if(!m.locked){ setAgentId(m.id); setTab("chat"); } }}
                  disabled={m.locked}
                  style={{
                    padding:"10px 11px", borderRadius:12, textAlign:"left",
                    background:"rgba(255,255,255,.04)",
                    border:`1px solid ${m.auto?`${COLOR}44`:"rgba(255,255,255,.07)"}`,
                    position:"relative", overflow:"hidden",
                    opacity:m.locked?.65:1,
                  }}>
                  {m.auto && (
                    <div style={{
                      position:"absolute", top:5, right:5,
                      background:`${COLOR}22`, border:`1px solid ${COLOR}44`,
                      borderRadius:5, padding:"1px 5px", fontSize:8, color:COLOR,
                    }}>AI</div>
                  )}
                  <div style={{ fontSize:22, marginBottom:5 }}>{m.icon}</div>
                  <div style={{ color:"rgba(255,255,255,.82)", fontSize:11.5, fontWeight:600, marginBottom:2 }}>{m.name}</div>
                  <div style={{ color:"rgba(255,255,255,.3)", fontSize:10, marginBottom:4 }}>{m.desc}</div>
                  {(m as Module & {earning?:string}).earning && (
                    <div style={{ color:"#06d6a0", fontSize:10, marginBottom:4 }}>{(m as Module & {earning:string}).earning}</div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ color:"rgba(255,255,255,.2)", fontSize:9 }}>{m.uses}x · {timeLeft(m.lastUsed)}</div>
                    {m.locked && <span style={{ color:"#ffd166", fontSize:10 }}>🔒</span>}
                  </div>
                </RBtn>
              ))}
            </div>

            {removed.length>0 && (
              <>
                <div style={{ color:"rgba(255,255,255,.25)", fontSize:10, fontWeight:700, marginBottom:7, textTransform:"uppercase", letterSpacing:.8 }}>
                  O'chirilgan modullar ({removed.length})
                </div>
                {removed.map((m,i)=>(
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"7px 10px", borderRadius:8, marginBottom:4,
                    background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.04)",
                    opacity:.55,
                  }}>
                    <span style={{ fontSize:16 }}>{m.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>{m.name}</div>
                      <div style={{ color:"rgba(255,255,255,.2)", fontSize:10 }}>1 yil ishlatilmadi</div>
                    </div>
                    <RBtn onClick={()=>{
                      setRemoved(p=>p.filter((_,j)=>j!==i));
                      setModules(prev=>[...prev,{...m,lastUsed:Date.now()}]);
                    }} style={{
                      background:`${COLOR}15`, border:`1px solid ${COLOR}33`,
                      borderRadius:6, padding:"3px 9px", color:COLOR, fontSize:10,
                    }}>Tiklash</RBtn>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── LEARN LOG ── */}
        {tab==="learn" && (
          <div style={{ padding:13 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ color:COLOR, fontWeight:700, fontSize:14 }}>🧠 O'z-o'zini O'rganish</div>
                <div style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginTop:2 }}>
                  Har 1 soatda yangi · 1 yil ishlatilmagan o'chiriladi
                </div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"rgba(255,255,255,.25)", fontSize:9, marginBottom:2 }}>KEYINGI</div>
                <div style={{ color:COLOR, fontSize:15, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>
                  {hh}:{mm}:{ss}
                </div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                { label:"Aktiv",       val:activeMods.length,  c:"#06d6a0", icon:"🟢" },
                { label:"AI qo'shdi",  val:autoMods.length,    c:COLOR,     icon:"✨" },
                { label:"O'chirildi",  val:removed.length,     c:"#ff6b6b", icon:"🗑️" },
              ].map(s=>(
                <div key={s.label} style={{
                  padding:10, borderRadius:10, textAlign:"center",
                  background:"rgba(255,255,255,.04)", border:`1px solid ${s.c}22`,
                }}>
                  <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                  <div style={{ color:s.c, fontWeight:800, fontSize:20 }}>{s.val}</div>
                  <div style={{ color:"rgba(255,255,255,.3)", fontSize:10 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding:"11px 13px", borderRadius:11,
              background:`${COLOR}0f`, border:`1px solid ${COLOR}33`, marginBottom:14,
            }}>
              <div style={{ color:COLOR, fontWeight:600, fontSize:12, marginBottom:7 }}>Avtomatik qoidalar:</div>
              <div style={{ color:"rgba(255,255,255,.5)", fontSize:11.5, lineHeight:1.75 }}>
                ⏰ <b style={{ color:COLOR }}>Har 1 soatda</b> — internet orqali yangi funksiya<br/>
                📅 <b style={{ color:"#ff6b6b" }}>1 yil</b> ishlatilmagan funksiyalar o'chiriladi<br/>
                🔒 <b style={{ color:"#06d6a0" }}>Chat, Ovoz, Avatar</b> — hech qachon o'chirilmaydi<br/>
                ♻️ O'chirilgan funksiyalarni istalgan vaqt tiklash mumkin
              </div>
            </div>

            {learnLog.length>0 ? learnLog.map((log,i)=>(
              <div key={i} style={{
                padding:"9px 11px", marginBottom:6, borderRadius:9, animation:"fadeUp .2s ease",
                background:log.type==="add"?"rgba(6,214,160,.07)":log.type==="remove"?"rgba(255,107,107,.07)":"rgba(255,255,255,.03)",
                border:`1px solid ${log.type==="add"?"rgba(6,214,160,.2)":log.type==="remove"?"rgba(255,107,107,.2)":"rgba(255,255,255,.06)"}`,
              }}>
                <div style={{ color:"rgba(255,255,255,.22)", fontSize:9.5, marginBottom:3 }}>🕐 {log.time}</div>
                <div style={{ color:log.type==="add"?"#06d6a0":log.type==="remove"?"#ff6b6b":"rgba(255,255,255,.55)", fontSize:12 }}>
                  {log.icon} {log.text}
                </div>
                {log.tech && <div style={{ color:"rgba(255,255,255,.25)", fontSize:10.5, marginTop:3 }}>🔧 {log.tech}</div>}
              </div>
            )) : (
              <div style={{ textAlign:"center", color:"rgba(255,255,255,.2)", fontSize:12.5, padding:"24px 0" }}>
                <div style={{ fontSize:30, marginBottom:10 }}>🧠</div>
                O'rganish logi hali bo'sh.<br/>Har 1 soatda yangi funksiya qo'shiladi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════ BOTTOM INPUT ════ */}
      <div style={{
        position:"relative", zIndex:20,
        padding:"8px 12px 14px",
        borderTop:"1px solid rgba(255,255,255,.07)",
        background:"rgba(0,0,0,.45)", backdropFilter:"blur(16px)",
      }}>
        <div style={{
          display:"flex", gap:7,
          background:"rgba(255,255,255,.05)",
          border:`1.5px solid ${sending?COLOR+"66":"rgba(255,255,255,.09)"}`,
          borderRadius:14, padding:"9px 11px",
          transition:"border-color .25s",
          boxShadow:sending?`0 0 16px ${COLOR}22`:"none",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); } }}
            placeholder="Ulug'bek AI ga yozing..."
            rows={1}
            style={{
              flex:1, background:"transparent", border:"none",
              color:"#e8e8e8", fontSize:14, lineHeight:1.5,
              maxHeight:96, overflowY:"auto",
            }}
          />

          {/* mic */}
          <RBtn onClick={toggleListen} title="Ovozli kiritish" style={{
            width:36, height:36, borderRadius:9, alignSelf:"flex-end",
            background:listening?`${COLOR}30`:"rgba(255,255,255,.07)",
            border:`1.5px solid ${listening?COLOR:"rgba(255,255,255,.1)"}`,
            color:listening?COLOR:"rgba(255,255,255,.4)",
            fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
            animation:listening?"blink 1s infinite":"none",
          }}>🎙️</RBtn>

          {/* send */}
          <RBtn onClick={()=>sendMessage()} disabled={sending||!input.trim()} style={{
            width:36, height:36, borderRadius:9, alignSelf:"flex-end",
            background:sending||!input.trim()
              ?"rgba(255,255,255,.07)"
              :`linear-gradient(135deg,${COLOR},${COLOR}99)`,
            border:"none",
            color:sending||!input.trim()?"rgba(255,255,255,.2)":"#080c18",
            fontSize:17, display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:sending||!input.trim()?"none":`0 4px 12px ${COLOR}44`,
          }}>
            {sending ? (
              <span style={{
                width:14, height:14,
                border:`2px solid ${COLOR}`, borderTopColor:"transparent",
                borderRadius:"50%", display:"inline-block",
                animation:"spin .7s linear infinite",
              }}/>
            ) : "➤"}
          </RBtn>
        </div>

        <div style={{ textAlign:"center", color:"rgba(255,255,255,.12)", fontSize:9.5, marginTop:5 }}>
          ⏰ Har 1 soatda yangilanadi · 📅 1 yil ishlatilmagan o'chiriladi · 🇺🇿 Ulug'bek AI v5
        </div>
      </div>
    </div>
  );
}
