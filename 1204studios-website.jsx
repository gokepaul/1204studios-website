import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   SHARED DATA STORE — reads from window.storage,
   falls back to defaults if admin hasn't saved yet
═══════════════════════════════════════════════════ */
const DEFAULT_BRANDS = [
  { id:"b1", name:"Amazon", logoUrl:"" },
  { id:"b2", name:"MTN", logoUrl:"" },
  { id:"b3", name:"Bolt", logoUrl:"" },
  { id:"b4", name:"Netflix", logoUrl:"" },
  { id:"b5", name:"Dangote", logoUrl:"" },
  { id:"b6", name:"GTBank", logoUrl:"" },
  { id:"b7", name:"Airtel", logoUrl:"" },
  { id:"b8", name:"Flutterwave", logoUrl:"" },
];

const DEFAULT_HERO = {
  headline: "Built for brands that move differently.",
  subtext: "A Lagos-based creative and marketing studio. We design brands, build campaigns, produce print, and train the next wave of creative talent.",
  cta1: "Start a Project →",
  cta2: "See Our Work",
};

const DEFAULT_BRAND_BAR = {
  heading: "The brands who taught us greatness",
  sub: "Big brands who accidentally trained their future competition",
};

const DEFAULT_METRICS = [
  {
    id:"m1", service:"Brand Design & Identity", accent:"#ff2d78",
    stats:[{ value:"200+",label:"Brands Built" },{ value:"98%",label:"Client Retention" },{ value:"6wks",label:"Avg. Delivery" },{ value:"40+",label:"Industries Served" }],
    headline:"Identity systems that hold up everywhere.",
    body:"From startups to institutions — brand identities that outlast trends and outlive campaigns.",
  },
  {
    id:"m2", service:"Marketing & Campaigns", accent:"#ffe600",
    stats:[{ value:"50M+",label:"Impressions Generated" },{ value:"3.2x",label:"Avg. ROAS" },{ value:"₦2B+",label:"Media Managed" },{ value:"120+",label:"Campaigns Launched" }],
    headline:"Campaigns built to move people, not just metrics.",
    body:"Strategy-led creative that drives attention, builds trust, and converts audiences into customers.",
  },
  {
    id:"m3", service:"Print Media", accent:"#00c8e0",
    stats:[{ value:"500+",label:"Print Projects" },{ value:"12",label:"SKUs Packaged" },{ value:"18%",label:"Client Cost Reduction" },{ value:"100%",label:"End-to-End Managed" }],
    headline:"Print that commands attention before a word is read.",
    body:"Corporate materials, packaging, and collateral designed with the same rigour as our digital work.",
  },
  {
    id:"m4", service:"Design & Web Tutoring", accent:"#a855f7",
    stats:[{ value:"300+",label:"Students Trained" },{ value:"4",label:"Courses Running" },{ value:"92%",label:"Completion Rate" },{ value:"15+",label:"Partner Schools" }],
    headline:"The next generation of creative talent. Built by us.",
    body:"Practical, structured, future-ready. We teach the way we wished we'd been taught.",
  },
];

const DEFAULT_CASE_STUDIES = [
  { id: "cs1", title: "Greenleaf Environmental Agency", category: "Brand Identity", year: "2024", hero: "#1b3a2a", summary: "A full brand system built for a Lagos-based environmental NGO — from strategy to final rollout across digital and print.", challenge: "Greenleaf had strong credibility but no visual identity that matched it. Their materials looked improvised, and funders weren't taking them seriously.", approach: "We started with positioning — defining what made Greenleaf different from every other NGO in the space. From that came a mark built around growth and structure, and a visual language serious enough for boardrooms but warm enough for community.", result: "New brand system deployed across all touchpoints within 6 weeks. Three major grant applications submitted with new materials. First funder meeting secured within 2 months of launch.", tags: ["Branding", "Identity", "NGO"], featured: true },
  { id: "cs2", title: "NexaPay Fintech Launch", category: "Marketing Campaign", year: "2024", hero: "#0c1f4a", summary: "Go-to-market campaign strategy and creative execution for a Lagos fintech startup entering a crowded market.", challenge: "NexaPay needed to launch with noise in a market where three established players already had strong brand recognition and larger ad budgets.", approach: "We focused the campaign on one differentiator: speed. Every piece of creative, every channel, every message was built around the idea that NexaPay was faster — faster transfers, faster onboarding, faster support.", result: "2M+ organic impressions in week one. 47,000 app downloads in first month. Featured in TechCabal within two weeks of launch.", tags: ["Marketing", "Campaign", "Fintech"], featured: true },
  { id: "cs3", title: "LCCI Corporate Suite", category: "Print Media", year: "2023", hero: "#2a1a0a", summary: "Complete corporate print collateral for the Lagos Chamber of Commerce — stationery, brochures, and a 60-page annual report.", challenge: "LCCI's existing materials were inconsistent across departments — different fonts, different layouts, no unified system. Print vendors were making independent decisions about the brand.", approach: "We audited every existing piece of collateral, identified what was working and what wasn't, then built a modular print system that could be applied by any designer or vendor without losing brand integrity.", result: "Print system adopted across all 6 departments. Annual report won a design commendation at the African Business Awards. Print costs reduced by 18% through vendor consolidation.", tags: ["Print", "Corporate", "Identity"], featured: true },
  { id: "cs4", title: "Eko Hotels Brand Refresh", category: "Brand Identity", year: "2023", hero: "#1a1a1a", summary: "A careful visual language update for one of Lagos's most recognised heritage hotel brands.", challenge: "Eko Hotels had 40 years of brand equity. The challenge wasn't reinvention — it was modernisation without destruction. Every decision had to preserve what the brand had built while making it relevant for a new generation of guests.", approach: "We mapped the brand's history, identified the core visual assets that carried the most recognition, and built a refresh system around those — updating everything else while protecting what made Eko, Eko.", result: "New identity rolled out across all guest touchpoints. Social media engagement increased 34% in first quarter. Guest survey scores for 'brand impression' rose from 6.8 to 8.2 out of 10.", tags: ["Branding", "Hospitality", "Refresh"], featured: true },
  { id: "cs5", title: "Farmfresh Packaging System", category: "Print Media", year: "2023", hero: "#1a3a1b", summary: "Packaging design across 12 SKUs for a direct-to-consumer food brand entering retail shelves.", challenge: "Farmfresh was moving from market stalls to retail shelves. Their existing packaging was designed for informal markets — it would disappear in a supermarket environment.", approach: "We designed a packaging system built for shelf impact and brand consistency at the same time. Bold colour coding by product category, clear hierarchy, and a distinctive mark that works at any size.", result: "All 12 SKUs stocked in 4 major Lagos supermarket chains within 3 months. Consumer research showed 72% brand recall in target demographic.", tags: ["Print", "Packaging", "FMCG"], featured: false },
  { id: "cs6", title: "MamaDelight Consumer Brand", category: "Brand Identity", year: "2024", hero: "#3a2a0c", summary: "Full brand identity for a Lagos FMCG startup entering competitive retail shelves.", challenge: "A crowded market of established local brands with strong heritage. MamaDelight needed to feel premium and warm at the same time — a difficult balance in the food category.", approach: "We built the identity around the idea of intentional warmth — bold enough to command shelf space, human enough to feel like it came from someone's kitchen.", result: "Brand launched across Lagos retail in Q2 2024. First 3-month sell-through rate exceeded projections by 40%.", tags: ["Branding", "FMCG", "Identity"], featured: false },
];

const DEFAULT_BLOG_POSTS = [
  { id: "bp1", title: "The Future of Brand Messaging in 2025", tag: "Marketing", date: "Mar 12, 2025", readTime: "6 min read", summary: "Attention is scarcer than ever. The brands winning in 2025 aren't the ones with the biggest budgets — they're the ones with the clearest point of view.", content: "Brand messaging has always been about clarity. But in 2025, clarity has taken on a new dimension. It's not just about what you say — it's about what you choose not to say, and how quickly you say the thing that matters.\n\nThe brands that are cutting through aren't the ones with the most sophisticated campaigns. They're the ones who've made the hard decisions about what they stand for, and who they're talking to.\n\nHere's what we're seeing across our client work:\n\n**Specificity over scale.** A message built for a specific person in a specific situation outperforms a broad message every time. The instinct to appeal to everyone is the instinct that makes you appeal to no one.\n\n**Voice consistency matters more than channel strategy.** Brands that sound the same on a billboard as they do in a DM build more trust than brands that shift register for every platform.\n\n**The question isn't 'what do we want to say?' — it's 'what does our audience need to hear?'** The brands getting this right are the ones listening before they speak.", featured: true },
  { id: "bp2", title: "How AI is Reshaping Brand Accessibility", tag: "Technology", date: "Feb 28, 2025", readTime: "5 min read", summary: "AI isn't replacing brand designers. It's removing the excuse that good branding was ever too expensive for small businesses.", content: "The democratisation of design tools has been happening for 20 years. What AI has done is accelerate it to the point where the gap between enterprise brands and small businesses is closing faster than anyone expected.\n\nBut here's the thing: tools don't make brands. Thinking makes brands. And that's where small businesses still struggle — not with execution, but with strategy.\n\nWhat we're telling our clients: use AI for the things that used to require expensive production. Use humans — us, or someone like us — for the thinking that determines whether any of it works.", featured: true },
  { id: "bp3", title: "Why Visual Consistency Builds Brand Trust Faster Than Any Campaign", tag: "Design", date: "Feb 10, 2025", readTime: "4 min read", summary: "Before you spend on advertising, make sure every touchpoint is saying the same thing. Inconsistency is invisible to you and obvious to your audience.", content: "We had a client recently who'd spent ₦2M on a digital campaign that underperformed. When we audited their brand touchpoints, we found 6 different logo versions in active use, 3 different primary colours, and no consistent typography across their print and digital materials.\n\nThe campaign wasn't the problem. The brand was the problem.\n\nVisual consistency is not a cosmetic issue. It's a trust issue. When someone sees your brand in three different places and it looks like three different companies, they don't consciously notice — but their subconscious registers the inconsistency and files it under 'uncertain'.\n\nBefore you spend on advertising, audit your brand. Make sure everything is saying the same thing.", featured: true },
  { id: "bp4", title: "Branding on a Budget: What to Prioritise First", tag: "Branding", date: "Jan 22, 2025", readTime: "7 min read", summary: "You don't need a ₦2M brand identity to start. You need a clear mark, a consistent colour, and a tone of voice. Here's the order we'd recommend.", content: "Not every business can spend ₦800K on a full brand identity. That's fine. What's not fine is spending nothing and ending up with something that actively undermines your credibility.\n\nHere's the order we'd prioritise if budget is tight:\n\n1. A clear, scalable mark. It doesn't need to be complex. It needs to be distinctive and work at small sizes.\n\n2. One or two brand colours. Pick them deliberately. Make sure they work in print and on screen.\n\n3. A consistent typeface. One for headlines, one for body text. Use them everywhere.\n\n4. A tone of voice document. Even a one-pager. How do you sound? What words do you use? What words do you avoid?\n\nThat's a functioning brand system. Everything else is refinement.", featured: true },
  { id: "bp5", title: "The Brief is the Brief: Why Client Communication Is a Design Skill", tag: "Process", date: "Jan 5, 2025", readTime: "5 min read", summary: "The best designers we know are also the best listeners. Not because listening is a soft skill — because it's a technical one.", content: "Bad briefs produce bad work. This isn't a controversial statement — every designer knows it. What's less obvious is that bad briefs are usually the designer's fault.\n\nA brief is a document the client gives you. But the brief you work from should be one you've co-created with the client through questioning, challenging, and clarifying.\n\n'We want a new logo' is not a brief. 'We need an identity that positions us as the premium option in a market where our competitors all look cheap' — that's a brief.\n\nThe skill of extracting the real brief from the stated brief is one of the highest-value things a designer can develop.", featured: false },
  { id: "bp6", title: "Print Is Not Dead. Bad Print Is Dead.", tag: "Print", date: "Dec 15, 2024", readTime: "4 min read", summary: "Every time someone tells us print is dying, we're in the middle of a print project that's generating more response than any digital campaign the same client ran.", content: "The narrative that print is irrelevant is a narrative spread by people who've only ever seen bad print.\n\nA well-designed, well-printed brochure placed in the right hands at the right moment is one of the most effective sales tools that exists. It's tangible. It's considered. And it says something about your business that a PDF never can.\n\nWhat's dying is lazy print. Template print. Print that was designed in 20 minutes and printed on the cheapest stock available.\n\nPrint that's designed with the same rigour as your digital presence, produced with the same attention to detail — that print is very much alive.", featured: false },
];

/* ═══════════════════════════════════════════════════
   ⚙️  SUPABASE CREDENTIALS — paste yours here
═══════════════════════════════════════════════════ */
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";  // ← replace
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY";              // ← replace

async function sbGet(table, query = "") {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) return null;
    return r.json();
  } catch(e) { return null; }
}

function useSharedData() {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [brandBar, setBrandBar] = useState(DEFAULT_BRAND_BAR);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [caseStudies, setCaseStudies] = useState(DEFAULT_CASE_STUDIES);
  const [blogPosts, setBlogPosts] = useState(DEFAULT_BLOG_POSTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function poll() {
      try {
        // Site config (hero, brand_bar, metrics)
        const cfg = await sbGet("site_config", "select=key,value");
        if (Array.isArray(cfg)) {
          cfg.forEach(row => {
            if (row.key === "hero") setHero(row.value);
            if (row.key === "brand_bar") setBrandBar(row.value);
            if (row.key === "metrics") setMetrics(row.value);
          });
        }
        // Brands
        const br = await sbGet("brands", "select=*&order=display_order.asc");
        if (Array.isArray(br) && br.length > 0)
          setBrands(br.map(b => ({ id:b.id, name:b.name, logoUrl:b.logo_url })));
        // Case studies
        const cs = await sbGet("case_studies", "select=*&order=display_order.asc");
        if (Array.isArray(cs) && cs.length > 0)
          setCaseStudies(cs.map(c => ({ id:c.id, title:c.title, category:c.category, year:c.year, hero:c.hero_color, summary:c.summary, challenge:c.challenge, approach:c.approach, result:c.result, tags:c.tags||[], featured:c.featured })));
        // Blog posts
        const bp = await sbGet("blog_posts", "select=*&order=display_order.asc");
        if (Array.isArray(bp) && bp.length > 0)
          setBlogPosts(bp.map(b => ({ id:b.id, title:b.title, tag:b.tag, date:b.date, readTime:b.read_time, summary:b.summary, content:b.content, featured:b.featured })));
      } catch(e) { /* silently use defaults */ }
      setLoaded(true);
    }
    poll();
    const iv = setInterval(poll, 8000); // poll every 8s
    return () => clearInterval(iv);
  }, []);

  return { brands, hero, brandBar, metrics, caseStudies, blogPosts, loaded };
}

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>{`
      *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
      :root {
        --ink:#0c0c0c; --paper:#f4f0eb; --pink:#ff2d78;
        --yellow:#ffe600; --cyan:#00c8e0; --mid:#6b6b6b;
        --border:rgba(12,12,12,0.1); --card:#fff;
      }
      html { scroll-behavior:smooth; }
      body { background:var(--paper); color:var(--ink); font-family:'Outfit',sans-serif; overflow-x:hidden; }
      a { text-decoration:none; color:inherit; }
      button { cursor:pointer; font-family:'Outfit',sans-serif; }
      .display { font-family:'Bebas Neue',sans-serif; letter-spacing:.02em; line-height:.95; }
      .label { font-size:11px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:var(--mid); }
      .wrap { max-width:1320px; margin:0 auto; padding:0 40px; }
      .wrap-sm { max-width:900px; margin:0 auto; padding:0 40px; }
      .section { padding:120px 0; }
      .section-sm { padding:80px 0; }
      .btn { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; font-size:14px; font-weight:600; border:none; cursor:pointer; transition:all .2s; letter-spacing:.3px; }
      .btn-dark { background:var(--ink); color:#fff; }
      .btn-dark:hover { background:#222; transform:translateY(-1px); }
      .btn-outline { background:transparent; color:var(--ink); border:1.5px solid var(--ink); }
      .btn-outline:hover { background:var(--ink); color:#fff; }
      .btn-pink { background:var(--pink); color:#fff; }
      .btn-pink:hover { background:#e0235f; }
      .card { background:var(--card); border:1px solid var(--border); padding:40px; transition:box-shadow .3s,transform .3s; }
      .card:hover { box-shadow:0 20px 60px rgba(0,0,0,.08); transform:translateY(-4px); }
      .tag { display:inline-block; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
      .tag-pink { background:var(--pink); color:#fff; }
      .tag-yellow { background:var(--yellow); color:var(--ink); }
      .tag-ink { background:var(--ink); color:#fff; }
      .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
      .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
      .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
      .divider { width:48px; height:3px; background:var(--pink); margin:20px 0; }
      .contact-input { width:100%; border:none; border-bottom:2px solid var(--border); background:transparent; padding:16px 0; font-family:'Outfit',sans-serif; font-size:15px; color:var(--ink); outline:none; transition:border-color .2s; }
      .contact-input:focus { border-color:var(--pink); }
      .contact-input::placeholder { color:var(--mid); }
      .footer-link { font-size:14px; color:rgba(255,255,255,0.4); transition:color .2s; display:block; margin-bottom:10px; cursor:pointer; background:none; border:none; text-align:left; font-family:'Outfit',sans-serif; }
      .footer-link:hover { color:#fff; }
      .nav-btn { background:none; border:none; font-size:14px; font-weight:500; color:var(--mid); transition:color .2s; cursor:pointer; font-family:'Outfit',sans-serif; }
      .nav-btn:hover, .nav-btn.active { color:var(--ink); }
      .price-box { background:var(--ink); color:#fff; padding:36px 40px; }
      .price-num { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; color:var(--yellow); }
      .process-step { display:grid; grid-template-columns:80px 1fr; gap:24px; align-items:start; padding:32px 0; border-bottom:1px solid var(--border); }
      .step-num { font-family:'Bebas Neue',sans-serif; font-size:56px; color:var(--pink); line-height:1; }
      @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
      .slide-up { animation:slideUp .7s ease both; }
      .delay-1 { animation-delay:.15s; } .delay-2 { animation-delay:.3s; } .delay-3 { animation-delay:.45s; }
      @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
      @media(max-width:900px) {
        .grid-2,.grid-3,.grid-4 { grid-template-columns:1fr; }
        .wrap,.wrap-sm { padding:0 20px; }
        .section { padding:72px 0; }
        .d-none-mobile { display:none !important; }
        .hero-h1 { font-size:clamp(60px,17vw,120px) !important; }
      }
    `}</style>
  </>
);

/* ═══════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════ */
const NAV_PAGES = ["Home","Branding","Marketing","Print","Tutoring","Portfolio","Blog","About","Contact"];

function Nav({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = p => { setPage(p); setOpen(false); window.scrollTo(0,0); };
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background: scrolled ? "rgba(244,240,235,0.97)" : "transparent", borderBottom: scrolled ? "1px solid var(--border)" : "none", backdropFilter: scrolled ? "blur(14px)" : "none", transition:"all .3s" }}>
      <div className="wrap" style={{ height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => go("Home")} style={{ background:"none", border:"none", display:"flex", alignItems:"baseline", gap:1 }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"var(--ink)", letterSpacing:1 }}>1204</span>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"var(--pink)", letterSpacing:1 }}>STUDIOS</span>
        </button>
        <div className="d-none-mobile" style={{ display:"flex", gap:28, alignItems:"center" }}>
          {["Branding","Marketing","Print","Tutoring","Portfolio","Blog","About"].map(p => (
            <button key={p} className={`nav-btn ${page===p?"active":""}`} onClick={() => go(p)}>{p}</button>
          ))}
          <button onClick={() => go("Contact")} className="btn btn-dark" style={{ padding:"10px 22px", fontSize:13 }}>Start a Project</button>
        </div>
        <button onClick={() => setOpen(!open)} style={{ display:"none", background:"none", border:"none", fontSize:22 }} className="mob-menu">☰</button>
      </div>
      {open && (
        <div style={{ background:"var(--paper)", borderTop:"1px solid var(--border)", padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
          {NAV_PAGES.map(p => <button key={p} className="nav-btn" onClick={() => go(p)} style={{ fontSize:17, padding:"8px 0", textAlign:"left" }}>{p}</button>)}
        </div>
      )}
      <style>{`@media(max-width:900px){.mob-menu{display:block!important}.d-none-mobile{display:none!important}}`}</style>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   BRAND BAR — image logos
═══════════════════════════════════════════════════ */
function BrandBar({ brands, brandBar }) {
  const doubled = [...brands, ...brands];
  return (
    <section style={{ background:"#fff", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"48px 0" }}>
      <div className="wrap" style={{ marginBottom:28 }}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(22px,3vw,34px)", color:"var(--ink)", letterSpacing:".5px" }}>{brandBar.heading}</p>
        <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, color:"var(--mid)", marginTop:6, fontStyle:"italic" }}>{brandBar.sub}</p>
      </div>
      <div style={{ overflow:"hidden", position:"relative" }}>
        <div style={{ display:"flex", animation:"marquee 32s linear infinite" }}>
          {doubled.map((b, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 44px", borderRight:"1px solid var(--border)", minWidth:160, height:60, flexShrink:0 }}>
              {b.logoUrl
                ? <img src={b.logoUrl} alt={b.name} style={{ maxHeight:40, maxWidth:110, objectFit:"contain", opacity:.55, transition:"opacity .2s" }}
                    onMouseOver={e => e.currentTarget.style.opacity="1"}
                    onMouseOut={e => e.currentTarget.style.opacity=".55"} />
                : <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"var(--ink)", opacity:.45, letterSpacing:.5, whiteSpace:"nowrap",
                    transition:"opacity .2s" }}
                    onMouseOver={e => e.currentTarget.style.opacity="1"}
                    onMouseOut={e => e.currentTarget.style.opacity=".45"}>{b.name}</span>
              }
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   METRICS CAROUSEL
═══════════════════════════════════════════════════ */
function MetricsCarousel({ metrics }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % metrics.length);
    }, 4000);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, [metrics.length]);

  const goTo = (i) => {
    clearInterval(timerRef.current);
    setActive(i);
    start();
  };

  const m = metrics[active];
  if (!m) return null;

  return (
    <section style={{ background:"var(--ink)", color:"#fff", padding:"100px 0", overflow:"hidden", position:"relative" }}>
      {/* Background accent glow */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 60% 50%, ${m.accent}0d 0%, transparent 65%)`, transition:"background 0.6s ease", pointerEvents:"none" }} />

      <div className="wrap" style={{ position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:20 }}>
          <div>
            <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Impact by Service</span>
            <h2 className="display" style={{ fontSize:"clamp(44px,6vw,76px)", color:"#fff", marginTop:10 }}>Numbers<br />that matter.</h2>
          </div>
          {/* Service tab pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {metrics.map((item, i) => (
              <button key={item.id} onClick={() => goTo(i)} style={{
                padding:"8px 18px", fontSize:12.5, fontWeight:600, fontFamily:"'Outfit',sans-serif",
                border:`1.5px solid ${i===active ? item.accent : "rgba(255,255,255,.12)"}`,
                background: i===active ? `${item.accent}22` : "transparent",
                color: i===active ? item.accent : "rgba(255,255,255,.45)",
                cursor:"pointer", transition:"all .25s", letterSpacing:.3,
              }}>
                {item.service}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div key={active} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center", animation:"slideUp .5s ease both" }}>
          {/* Left: headline + body + progress */}
          <div>
            <div style={{ width:48, height:4, background:m.accent, marginBottom:28 }} />
            <h3 className="display" style={{ fontSize:"clamp(32px,4vw,54px)", color:"#fff", lineHeight:.95, marginBottom:20 }}>{m.headline}</h3>
            <p style={{ fontSize:16, color:"rgba(255,255,255,.5)", lineHeight:1.8, maxWidth:420 }}>{m.body}</p>
            {/* Dot progress */}
            <div style={{ display:"flex", gap:8, marginTop:36, alignItems:"center" }}>
              {metrics.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  width: i===active ? 32 : 8, height:8,
                  background: i===active ? m.accent : "rgba(255,255,255,.2)",
                  border:"none", cursor:"pointer", transition:"all .4s ease", padding:0,
                }} />
              ))}
              <span style={{ marginLeft:8, fontSize:12, color:"rgba(255,255,255,.3)", fontFamily:"'Outfit',sans-serif" }}>Auto-advancing</span>
            </div>
          </div>

          {/* Right: 4 stat boxes */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
            {m.stats.map((s, i) => (
              <div key={i} style={{ padding:"32px 28px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, width:"100%", height:2, background: i===0 ? m.accent : "transparent" }} />
                <div className="display" style={{ fontSize:"clamp(36px,5vw,52px)", color:m.accent, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.45)", marginTop:8, fontFamily:"'Outfit',sans-serif", letterSpacing:.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════ */
function Home({ setPage, brands, hero, brandBar, metrics, caseStudies, blogPosts }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  const featuredCS = caseStudies.filter(c => c.featured).slice(0,4);
  const featuredBP = blogPosts.filter(b => b.featured).slice(0,4);

  const services = [
    { label:"Brand Design & Identity", icon:"◈", desc:"Visual systems that hold up everywhere and mean something to someone.", color:"var(--pink)", page:"Branding" },
    { label:"Marketing & Campaigns", icon:"◉", desc:"Strategy-led campaigns built to drive attention, trust, and action.", color:"var(--yellow)", page:"Marketing" },
    { label:"Print Media", icon:"▣", desc:"Corporate materials and packaging designed to demand attention.", color:"var(--cyan)", page:"Print" },
    { label:"Design & Web Tutoring", icon:"◐", desc:"Practical skills. Real briefs. The next generation of creative talent.", color:"var(--ink)", page:"Tutoring" },
  ];

  // Split headline for last-word pink highlight
  const headlineWords = hero.headline.trim().split(" ");
  const lastWord = headlineWords[headlineWords.length - 1];
  const restWords = headlineWords.slice(0, -1).join(" ");

  return (
    <div>
      {/* HERO */}
      <section style={{ background:"var(--ink)", color:"#fff", minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"flex-end", paddingTop:120, paddingBottom:80, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 70% 40%, rgba(255,45,120,0.07) 0%, transparent 60%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, right:0, width:"40%", height:"100%", backgroundImage:"url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop')", backgroundSize:"cover", backgroundPosition:"center", opacity:.07 }} />
        <div className="wrap" style={{ position:"relative", zIndex:2 }}>
          <div className="slide-up" style={{ display:"flex", gap:10, marginBottom:36, flexWrap:"wrap" }}>
            {["Creative Studio","Lagos, Nigeria","Est. 2020","Wired Differently"].map(t => (
              <span key={t} style={{ border:"1px solid rgba(255,255,255,0.15)", padding:"4px 14px", fontSize:12, fontWeight:500, letterSpacing:1, color:"rgba(255,255,255,0.5)" }}>{t}</span>
            ))}
          </div>
          <h1 className="display slide-up delay-1 hero-h1" style={{ fontSize:"clamp(72px,11vw,155px)", color:"#fff", maxWidth:1100 }}>
            {restWords}<br /><span style={{ color:"var(--pink)" }}>{lastWord}</span>
          </h1>
          <div className="slide-up delay-2" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, marginTop:56, paddingTop:40, borderTop:"1px solid rgba(255,255,255,0.08)", maxWidth:900, alignItems:"end" }}>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.6)", lineHeight:1.8, maxWidth:480 }}>{hero.subtext}</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={() => go("Contact")} className="btn btn-pink">{hero.cta1}</button>
              <button onClick={() => go("Portfolio")} className="btn" style={{ background:"transparent", color:"#fff", border:"1.5px solid rgba(255,255,255,0.25)" }}>{hero.cta2}</button>
            </div>
          </div>
        </div>
      </section>

      {/* PINK MARQUEE TICKER */}
      <div style={{ background:"var(--pink)", padding:"14px 0", overflow:"hidden" }}>
        <div style={{ display:"flex", animation:"marquee 16s linear infinite", whiteSpace:"nowrap" }}>
          {Array(8).fill(["Brand Design","·","Marketing","·","Print Media","·","Tutoring","·","Strategy","·"]).flat().map((t,i) => (
            <span key={i} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:"#fff", marginRight:20, opacity:t==="·"?.35:1 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* BRAND BAR */}
      <BrandBar brands={brands} brandBar={brandBar} />

      {/* SERVICES */}
      <section className="section">
        <div className="wrap">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:20 }}>
            <div>
              <span className="label">What We Do</span>
              <h2 className="display" style={{ fontSize:"clamp(48px,6vw,80px)", marginTop:12 }}>Four Ways<br />We Work</h2>
            </div>
            <p style={{ maxWidth:340, fontSize:15, color:"var(--mid)", lineHeight:1.75 }}>Not everything — the things we're genuinely great at, done with full attention.</p>
          </div>
          <div className="grid-4">
            {services.map((s,i) => (
              <div key={i} className="card" style={{ borderTop:`4px solid ${s.color}`, cursor:"pointer" }} onClick={() => go(s.page)}>
                <div style={{ fontSize:28, color:s.color, marginBottom:20 }}>{s.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:16, marginBottom:10, lineHeight:1.3 }}>{s.label}</h3>
                <p style={{ fontSize:13, color:"var(--mid)", lineHeight:1.7 }}>{s.desc}</p>
                <div style={{ marginTop:24, fontSize:13, color:s.color, fontWeight:600 }}>Explore →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS CAROUSEL */}
      <MetricsCarousel metrics={metrics} />

      {/* FEATURED CASE STUDIES */}
      {featuredCS.length > 0 && (
        <section className="section" style={{ background:"var(--ink)", color:"#fff" }}>
          <div className="wrap">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:20 }}>
              <div>
                <span className="label" style={{ color:"rgba(255,255,255,0.35)" }}>Work</span>
                <h2 className="display" style={{ fontSize:"clamp(48px,6vw,80px)", color:"#fff", marginTop:12 }}>Featured<br />Case Studies</h2>
              </div>
              <button onClick={() => go("Portfolio")} className="btn" style={{ background:"transparent", color:"#fff", border:"1.5px solid rgba(255,255,255,0.25)" }}>All Case Studies →</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: featuredCS.length >= 3 ? "1fr 1fr" : "1fr", gap:2 }}>
              {featuredCS.map((cs, i) => (
                <div key={cs.id} style={{ background: i===0 ? cs.hero : i===1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", padding:"40px", cursor:"pointer", transition:"all .3s", position:"relative", overflow:"hidden", minHeight:220 }}
                  onClick={() => go("CaseStudy:"+cs.id)}
                  onMouseOver={e => { e.currentTarget.style.borderColor="rgba(255,45,120,0.4)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                  <div style={{ position:"absolute", bottom:-10, right:-10, fontFamily:"'Bebas Neue',sans-serif", fontSize:120, opacity:.04, lineHeight:1, userSelect:"none" }}>0{i+1}</div>
                  <span className="tag tag-pink" style={{ marginBottom:16, display:"inline-block" }}>{cs.category}</span>
                  <h3 style={{ fontWeight:700, fontSize:"clamp(18px,2vw,24px)", color:"#fff", marginBottom:12, lineHeight:1.2 }}>{cs.title}</h3>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:440 }}>{cs.summary}</p>
                  <div style={{ marginTop:24, fontSize:13, color:"var(--pink)", fontWeight:600 }}>Read Case Study →</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      <section className="section">
        <div className="wrap">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:80, alignItems:"start" }}>
            <div style={{ position:"sticky", top:120 }}>
              <span className="label">How We Work</span>
              <h2 className="display" style={{ fontSize:"clamp(48px,5vw,72px)", marginTop:12 }}>Our<br />Process</h2>
              <div className="divider" />
              <p style={{ fontSize:15, color:"var(--mid)", lineHeight:1.8 }}>Structured from the start. Great work doesn't happen by accident.</p>
            </div>
            <div>
              {[
                { num:"01", t:"Understand the Goal", d:"We listen before we move. Every engagement starts with understanding your business, audience, and what success actually looks like." },
                { num:"02", t:"Define the Strategy", d:"We translate your goals into a structured approach — informed by data, shaped by experience, built for your context." },
                { num:"03", t:"Design and Produce", d:"Execution with intention. Every asset, pixel, and word is considered and deliberate." },
                { num:"04", t:"Launch and Refine", d:"We ship, measure, and improve. Strategy without execution is theory. Execution without learning is waste." },
              ].map((p,i) => (
                <div key={i} className="process-step">
                  <span className="step-num">{p.num}</span>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>{p.t}</h3>
                    <p style={{ fontSize:14, color:"var(--mid)", lineHeight:1.75 }}>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BLOG POSTS */}
      {featuredBP.length > 0 && (
        <section className="section" style={{ background:"var(--paper)", borderTop:"1px solid var(--border)" }}>
          <div className="wrap">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:20 }}>
              <div>
                <span className="label">Latest Thinking</span>
                <h2 className="display" style={{ fontSize:"clamp(48px,6vw,80px)", marginTop:12 }}>From<br />the Blog</h2>
              </div>
              <button onClick={() => go("Blog")} className="btn btn-outline">All Posts →</button>
            </div>
            <div className="grid-4">
              {featuredBP.map((post) => (
                <div key={post.id} style={{ background:"#fff", border:"1px solid var(--border)", cursor:"pointer", transition:"all .3s" }}
                  onClick={() => go("BlogPost:"+post.id)}
                  onMouseOver={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.07)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                  <div style={{ height:8, background:"var(--pink)" }} />
                  <div style={{ padding:"28px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                      <span className="tag tag-ink" style={{ fontSize:10 }}>{post.tag}</span>
                      <span style={{ fontSize:12, color:"var(--mid)" }}>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:16, lineHeight:1.3, marginBottom:12 }}>{post.title}</h3>
                    <p style={{ fontSize:13, color:"var(--mid)", lineHeight:1.65 }}>{post.summary}</p>
                    <p style={{ fontSize:12, color:"var(--mid)", marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>{post.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOUNDERS */}
      <section className="section" style={{ background:"var(--ink)", color:"#fff" }}>
        <div className="wrap">
          <div className="grid-2" style={{ gap:80, alignItems:"center" }}>
            <div>
              <span className="label" style={{ color:"rgba(255,255,255,0.35)" }}>Who We Are</span>
              <h2 className="display" style={{ fontSize:"clamp(48px,5vw,72px)", color:"#fff", marginTop:12 }}>Two designers<br />who never<br />fit the norm.</h2>
              <div style={{ width:48, height:3, background:"var(--pink)", margin:"24px 0" }} />
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.55)", lineHeight:1.8, marginBottom:28 }}>
                <strong style={{ color:"#fff" }}>Goke and Okiki</strong> built 1204Studios around a single belief: the best creative work comes from thinking differently — about problems, about audiences, about what design is actually for.
              </p>
              <button onClick={() => go("About")} className="btn btn-pink">Our Story →</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[{ name:"Goke", role:"Creative Director", bg:"#1a1a1a" }, { name:"Okiki", role:"Design Lead", bg:"var(--pink)" }].map((f,i) => (
                <div key={i} style={{ background:f.bg, padding:"48px 32px", color:"#fff", position:"relative", overflow:"hidden", minHeight:200 }}>
                  <div style={{ position:"absolute", bottom:-16, right:-8, fontFamily:"'Bebas Neue',sans-serif", fontSize:90, opacity:.06, lineHeight:1 }}>1204</div>
                  <div style={{ width:52, height:52, border:"2px solid rgba(255,255,255,0.25)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:24, marginBottom:16 }}>{f.name[0]}</div>
                  <h4 style={{ fontWeight:700, fontSize:17 }}>{f.name}</h4>
                  <p style={{ fontSize:13, opacity:.5, marginTop:4 }}>{f.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"var(--pink)", padding:"100px 0", overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")", pointerEvents:"none" }} />
        <div className="wrap" style={{ textAlign:"center", position:"relative", zIndex:1 }}>
          <h2 className="display" style={{ fontSize:"clamp(52px,8vw,110px)", color:"#fff" }}>Ready to move<br />differently?</h2>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.75)", maxWidth:480, margin:"24px auto 40px", lineHeight:1.7 }}>Tell us about your project. We'll tell you exactly how we'd approach it.</p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => go("Contact")} className="btn" style={{ background:"#fff", color:"var(--pink)", padding:"16px 48px", fontSize:15 }}>Start a Project</button>
            <button onClick={() => go("Portfolio")} className="btn" style={{ background:"transparent", color:"#fff", border:"2px solid rgba(255,255,255,0.35)", padding:"16px 48px", fontSize:15 }}>See Our Work</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PORTFOLIO PAGE
═══════════════════════════════════════════════════ */
function Portfolio({ setPage, caseStudies }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...Array.from(new Set(caseStudies.map(c => c.category)))];
  const filtered = filter === "All" ? caseStudies : caseStudies.filter(c => c.category === filter);
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,0.35)" }}>Our Work</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Selected<br /><span style={{ color:"var(--yellow)" }}>Portfolio</span></h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.55)", maxWidth:520, marginTop:32, lineHeight:1.8 }}>Real projects. Real problems. Real results.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div style={{ display:"flex", gap:8, marginBottom:48, flexWrap:"wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{ padding:"8px 20px", border:"1px solid var(--border)", background: filter===c ? "var(--ink)" : "#fff", color: filter===c ? "#fff" : "var(--ink)", fontSize:13, fontWeight:500, fontFamily:"'Outfit',sans-serif", transition:"all .2s", cursor:"pointer" }}>{c}</button>
            ))}
          </div>
          <div className="grid-3">
            {filtered.map((cs,i) => (
              <div key={cs.id} style={{ background:"#fff", border:"1px solid var(--border)", overflow:"hidden", cursor:"pointer", transition:"all .3s" }}
                onClick={() => { setPage("CaseStudy:"+cs.id); window.scrollTo(0,0); }}
                onMouseOver={e => { e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,.1)"; }}
                onMouseOut={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <div style={{ height:180, background:cs.hero, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:88, color:"rgba(255,255,255,.05)", userSelect:"none" }}>1204</span>
                  <span className="tag tag-pink" style={{ position:"absolute", top:16, left:16 }}>{cs.category}</span>
                  {cs.featured && <span style={{ position:"absolute", top:16, right:16, background:"var(--yellow)", color:"var(--ink)", padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:1 }}>FEATURED</span>}
                  <span style={{ position:"absolute", bottom:16, right:16, fontSize:12, color:"rgba(255,255,255,.4)", fontWeight:600 }}>{cs.year}</span>
                </div>
                <div style={{ padding:28 }}>
                  <h3 style={{ fontWeight:700, fontSize:17, marginBottom:10, lineHeight:1.3 }}>{cs.title}</h3>
                  <p style={{ fontSize:13, color:"var(--mid)", lineHeight:1.7 }}>{cs.summary}</p>
                  <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)", fontSize:13, color:"var(--pink)", fontWeight:600 }}>View Case Study →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CASE STUDY DETAIL
═══════════════════════════════════════════════════ */
function CaseStudyDetail({ id, setPage, caseStudies }) {
  const cs = caseStudies.find(c => c.id === id);
  if (!cs) return <div style={{ padding:"200px 40px", textAlign:"center" }}><p>Case study not found.</p><button className="btn btn-dark" style={{ marginTop:20 }} onClick={() => setPage("Portfolio")}>Back to Portfolio</button></div>;
  return (
    <div>
      <section style={{ background:cs.hero, color:"#fff", paddingTop:160, paddingBottom:100, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.4)" }} />
        <div className="wrap" style={{ position:"relative", zIndex:1 }}>
          <button onClick={() => { setPage("Portfolio"); window.scrollTo(0,0); }} style={{ background:"none", border:"1px solid rgba(255,255,255,.25)", color:"rgba(255,255,255,.7)", padding:"8px 20px", fontSize:13, marginBottom:32, fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>← Back to Portfolio</button>
          <span className="tag tag-pink" style={{ marginBottom:20, display:"inline-block" }}>{cs.category}</span>
          <h1 className="display" style={{ fontSize:"clamp(52px,8vw,110px)", color:"#fff", maxWidth:900 }}>{cs.title}</h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.65)", maxWidth:580, marginTop:28, lineHeight:1.8 }}>{cs.summary}</p>
          <div style={{ display:"flex", gap:32, marginTop:48, paddingTop:40, borderTop:"1px solid rgba(255,255,255,.1)", flexWrap:"wrap" }}>
            {cs.tags.map(t => <span key={t} style={{ border:"1px solid rgba(255,255,255,.2)", padding:"4px 16px", fontSize:12, letterSpacing:1.5, color:"rgba(255,255,255,.6)" }}>{t}</span>)}
            <span style={{ marginLeft:"auto", fontSize:14, color:"rgba(255,255,255,.4)", fontWeight:600 }}>{cs.year}</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap wrap-sm">
          {[{ label:"The Challenge", content:cs.challenge }, { label:"Our Approach", content:cs.approach }, { label:"The Result", content:cs.result }].map((s,i) => (
            <div key={i} style={{ marginBottom:72 }}>
              <span className="label" style={{ color:"var(--pink)" }}>{s.label}</span>
              <p style={{ fontSize:18, lineHeight:1.85, color:"var(--mid)", marginTop:16 }}>{s.content}</p>
            </div>
          ))}
          <div style={{ display:"flex", gap:16, marginTop:24 }}>
            <button onClick={() => { setPage("Contact"); window.scrollTo(0,0); }} className="btn btn-dark">Start a Similar Project →</button>
            <button onClick={() => { setPage("Portfolio"); window.scrollTo(0,0); }} className="btn btn-outline">Back to Portfolio</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BLOG PAGE
═══════════════════════════════════════════════════ */
function Blog({ setPage, blogPosts }) {
  const [filter, setFilter] = useState("All");
  const tags = ["All", ...Array.from(new Set(blogPosts.map(b => b.tag)))];
  const filtered = filter === "All" ? blogPosts : blogPosts.filter(b => b.tag === filter);
  const featured = blogPosts.filter(b => b.featured)[0];
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Insights</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>The<br /><span style={{ color:"var(--yellow)" }}>Blog</span></h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.55)", maxWidth:520, marginTop:32, lineHeight:1.8 }}>Thinking on brand, design, marketing, and building creative businesses in Africa.</p>
        </div>
      </section>
      {featured && (
        <section style={{ borderBottom:"1px solid var(--border)", background:"#fff" }}>
          <div className="wrap" style={{ padding:"64px 40px" }}>
            <span className="label" style={{ color:"var(--pink)" }}>Featured Post</span>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, marginTop:24, alignItems:"center" }}
              className="grid-2">
              <div>
                <span className="tag tag-ink" style={{ marginBottom:16, display:"inline-block" }}>{featured.tag}</span>
                <h2 className="display" style={{ fontSize:"clamp(36px,4vw,60px)", marginBottom:20, lineHeight:.95 }}>{featured.title}</h2>
                <p style={{ fontSize:16, color:"var(--mid)", lineHeight:1.8, marginBottom:28 }}>{featured.summary}</p>
                <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                  <button onClick={() => { setPage("BlogPost:"+featured.id); window.scrollTo(0,0); }} className="btn btn-dark">Read Article →</button>
                  <span style={{ fontSize:13, color:"var(--mid)" }}>{featured.date} · {featured.readTime}</span>
                </div>
              </div>
              <div style={{ background:"var(--ink)", height:320, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:120, color:"rgba(255,255,255,.04)", userSelect:"none" }}>1204</span>
                <span className="tag tag-pink" style={{ position:"absolute", bottom:24, left:24, fontSize:13 }}>{featured.tag}</span>
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="section">
        <div className="wrap">
          <div style={{ display:"flex", gap:8, marginBottom:48, flexWrap:"wrap" }}>
            {tags.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ padding:"8px 20px", border:"1px solid var(--border)", background: filter===t ? "var(--ink)" : "#fff", color: filter===t ? "#fff" : "var(--ink)", fontSize:13, fontWeight:500, fontFamily:"'Outfit',sans-serif", cursor:"pointer", transition:"all .2s" }}>{t}</button>
            ))}
          </div>
          <div className="grid-3">
            {filtered.map(post => (
              <div key={post.id} style={{ background:"#fff", border:"1px solid var(--border)", cursor:"pointer", transition:"all .3s", overflow:"hidden" }}
                onClick={() => { setPage("BlogPost:"+post.id); window.scrollTo(0,0); }}
                onMouseOver={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.07)"; }}
                onMouseOut={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <div style={{ height:6, background: post.featured ? "var(--pink)" : "var(--border)" }} />
                <div style={{ padding:"28px 24px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <span className="tag tag-ink" style={{ fontSize:10 }}>{post.tag}</span>
                    <span style={{ fontSize:12, color:"var(--mid)" }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:16, lineHeight:1.3, marginBottom:10 }}>{post.title}</h3>
                  <p style={{ fontSize:13, color:"var(--mid)", lineHeight:1.65 }}>{post.summary}</p>
                  <p style={{ fontSize:12, color:"var(--mid)", marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)" }}>{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BLOG POST DETAIL
═══════════════════════════════════════════════════ */
function BlogPostDetail({ id, setPage, blogPosts }) {
  const post = blogPosts.find(p => p.id === id);
  if (!post) return <div style={{ padding:"200px 40px", textAlign:"center" }}><button className="btn btn-dark" onClick={() => setPage("Blog")}>Back to Blog</button></div>;
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:80 }}>
        <div className="wrap wrap-sm">
          <button onClick={() => { setPage("Blog"); window.scrollTo(0,0); }} style={{ background:"none", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,255,255,.6)", padding:"8px 20px", fontSize:13, marginBottom:32, fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>← Back to Blog</button>
          <span className="tag tag-pink" style={{ marginBottom:20, display:"inline-block" }}>{post.tag}</span>
          <h1 className="display" style={{ fontSize:"clamp(44px,7vw,88px)", color:"#fff", lineHeight:.95 }}>{post.title}</h1>
          <div style={{ display:"flex", gap:24, marginTop:32, paddingTop:28, borderTop:"1px solid rgba(255,255,255,.08)", alignItems:"center" }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>{post.date}</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>·</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>{post.readTime}</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>·</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>1204Studios</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap wrap-sm">
          <p style={{ fontSize:20, color:"var(--mid)", lineHeight:1.85, marginBottom:48, fontWeight:400 }}>{post.summary}</p>
          <div style={{ fontSize:17, lineHeight:1.9, color:"var(--ink)" }}>
            {post.content.split("\n\n").map((para, i) => {
              if (para.startsWith("**") && para.endsWith("**")) {
                return <h3 key={i} style={{ fontWeight:700, fontSize:22, marginBottom:16, marginTop:40 }}>{para.replace(/\*\*/g,"")}</h3>;
              }
              if (para.match(/^\d\./)) {
                return <p key={i} style={{ marginBottom:20, paddingLeft:24, borderLeft:"3px solid var(--pink)", color:"var(--mid)" }}>{para}</p>;
              }
              return <p key={i} style={{ marginBottom:28, color:"var(--mid)" }}>{para.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
            })}
          </div>
          <div style={{ marginTop:64, paddingTop:48, borderTop:"1px solid var(--border)", display:"flex", gap:16, flexWrap:"wrap" }}>
            <button onClick={() => { setPage("Contact"); window.scrollTo(0,0); }} className="btn btn-dark">Work With Us →</button>
            <button onClick={() => { setPage("Blog"); window.scrollTo(0,0); }} className="btn btn-outline">More Articles</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SERVICE PAGES (Branding, Marketing, Print, Tutoring)
═══════════════════════════════════════════════════ */
function Branding({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Service</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Branding &<br /><span style={{ color:"var(--pink)" }}>Identity</span></h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.6)", maxWidth:580, marginTop:36, lineHeight:1.8 }}>A brand is a system of decisions — how you look, how you sound, how you show up. We design identities built to last and impossible to confuse with anything else.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap:80, alignItems:"start" }}>
            <div>
              <span className="label">What We Deliver</span>
              <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12, marginBottom:36 }}>Everything your brand needs.</h2>
              {["Logo systems & mark variations","Visual language & colour systems","Brand guidelines documentation","Typography systems","Application design (stationery, digital, signage)","Iconography & illustration direction"].map((d,i) => (
                <div key={i} style={{ display:"flex", gap:16, padding:"16px 0", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:"var(--pink)", minWidth:32 }}>0{i+1}</span>
                  <span style={{ fontSize:15, fontWeight:500 }}>{d}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="label">Who This Is For</span>
              <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12, marginBottom:36 }}>Built for where you are.</h2>
              {[{ l:"Startups", d:"You need an identity that matches your ambition from day one.", i:"◈" }, { l:"Growing Companies", d:"You've outgrown your old look and need a brand that reflects where you're actually going.", i:"◉" }, { l:"Institutions", d:"Schools, NGOs, and public-sector bodies that need identity systems built to last.", i:"▣" }].map((a,i) => (
                <div key={i} className="card" style={{ padding:28, marginBottom:20 }}>
                  <span style={{ fontSize:22, color:"var(--pink)" }}>{a.i}</span>
                  <h3 style={{ fontWeight:700, fontSize:17, margin:"10px 0 6px" }}>{a.l}</h3>
                  <p style={{ fontSize:14, color:"var(--mid)", lineHeight:1.7 }}>{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ background:"var(--ink)", color:"#fff" }}>
        <div className="wrap">
          <div className="grid-2" style={{ alignItems:"center", gap:64 }}>
            <div>
              <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Investment</span>
              <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", color:"#fff", marginTop:12 }}>Transparent Pricing</h2>
              <p style={{ fontSize:15, color:"rgba(255,255,255,.45)", lineHeight:1.75, marginTop:16, maxWidth:380 }}>Every project is quoted after discovery. These ranges reflect the depth of thinking behind the work.</p>
            </div>
            <div className="price-box">
              <p className="label" style={{ color:"rgba(255,255,255,.3)", marginBottom:12 }}>Starting From</p>
              <div className="price-num">₦800,000</div>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:14, marginTop:8 }}>Up to ₦2,500,000 for full systems</p>
              <button onClick={() => go("Contact")} className="btn btn-pink" style={{ marginTop:28, width:"100%", justifyContent:"center" }}>Request a Quote →</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Marketing({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Service</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Marketing &<br /><span style={{ color:"var(--yellow)" }}>Campaigns</span></h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.6)", maxWidth:580, marginTop:36, lineHeight:1.8 }}>Strategy before spend. We design campaigns with clear logic — who, what, where, why — then execute with the same rigour.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap:2 }}>
            {[
              { t:"Campaign Strategy", d:"Research-backed frameworks built around your audience, objectives, and budget. We define the message, the channels, and the metrics before anything gets made." },
              { t:"Creative Development", d:"Concepts, copy, design, and production. Campaign creative that's distinctive enough to cut through and relevant enough to convert." },
              { t:"Digital Marketing & Media Buying", d:"Paid social, search, and display. We plan, buy, and manage media — with full transparency on spend and performance." },
              { t:"Performance Optimisation", d:"Campaigns don't end at launch. We monitor, test, and improve throughout the lifecycle." },
            ].map((s,i) => (
              <div key={i} style={{ background: i%2===0?"#fff":"var(--paper)", border:"1px solid var(--border)", padding:48 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:56, color:"rgba(0,0,0,.05)", lineHeight:1, display:"block", marginBottom:16 }}>0{i+1}</span>
                <h3 style={{ fontWeight:700, fontSize:20, marginBottom:12 }}>{s.t}</h3>
                <p style={{ fontSize:15, color:"var(--mid)", lineHeight:1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ background:"var(--yellow)" }}>
        <div className="wrap">
          <div className="grid-2" style={{ gap:64, alignItems:"center" }}>
            <div>
              <span className="label">Investment</span>
              <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12 }}>Pricing</h2>
              <p style={{ fontSize:15, lineHeight:1.75, marginTop:16, maxWidth:380 }}>Ad platform spend is always separate from our fees.</p>
            </div>
            <div>
              {[{ l:"Campaign Creative", r:"₦600,000 – ₦2,000,000" }, { l:"Digital Marketing Mgmt", r:"₦350,000 – ₦900,000 / mo" }].map((p,i) => (
                <div key={i} style={{ background:"var(--ink)", color:"#fff", padding:"24px 32px", marginBottom:16 }}>
                  <p style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", opacity:.4, marginBottom:8 }}>{p.l}</p>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:"var(--yellow)", lineHeight:1 }}>{p.r}</p>
                </div>
              ))}
              <button onClick={() => go("Contact")} className="btn btn-dark" style={{ width:"100%", justifyContent:"center", marginTop:8 }}>Discuss a Campaign →</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Print({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Service</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Print<br /><span style={{ color:"var(--cyan)" }}>Media</span></h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.6)", maxWidth:580, marginTop:36, lineHeight:1.8 }}>Print is not dead. Poorly considered print is dead. We design materials intentional about every dimension — format, paper, finish, and brand fit.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap:2 }}>
            {[
              { t:"Corporate Materials", d:"Annual reports, letterheads, business cards, and presentation folders that carry the weight your business deserves." },
              { t:"Marketing Collateral", d:"Flyers, brochures, banners, and point-of-sale materials designed to work as hard in print as they do online." },
              { t:"Packaging Design", d:"Product packaging that turns unboxing into a brand experience. Structured, ownable, and distinctive." },
              { t:"Production Management", d:"We manage print vendors and timelines so the final output always matches the design." },
            ].map((s,i) => (
              <div key={i} style={{ background: i%2===0?"#fff":"var(--paper)", border:"1px solid var(--border)", padding:48 }}>
                <div style={{ width:40, height:40, background:"var(--cyan)", marginBottom:20 }} />
                <h3 style={{ fontWeight:700, fontSize:20, marginBottom:12 }}>{s.t}</h3>
                <p style={{ fontSize:15, color:"var(--mid)", lineHeight:1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ borderTop:"1px solid var(--border)" }}>
        <div className="wrap wrap-sm" style={{ textAlign:"center" }}>
          <div className="price-box" style={{ display:"inline-block", width:"100%" }}>
            <p className="label" style={{ color:"rgba(255,255,255,.3)", marginBottom:12 }}>Design Fee Range</p>
            <div className="price-num" style={{ fontSize:64 }}>₦250,000 – ₦800,000</div>
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:14, marginTop:12 }}>Print production costs quoted separately.</p>
            <button onClick={() => go("Contact")} className="btn btn-pink" style={{ marginTop:28 }}>Get a Print Quote →</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Tutoring({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Service</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Design &<br />Web <span style={{ color:"var(--yellow)" }}>Tutoring</span></h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.6)", maxWidth:580, marginTop:36, lineHeight:1.8 }}>Structured. Practical. Future-ready. We teach design and coding the way we wished it had been taught to us.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap:24 }}>
            {[
              { t:"Graphic Design", d:"Fundamentals of visual communication. Typography, layout, colour theory, and industry tools. Practical briefs from day one.", i:"◈" },
              { t:"Motion Basics", d:"Introduction to motion design. Principles of animation, After Effects fundamentals, and real-world motion briefs.", i:"◉" },
              { t:"Web Design & Development", d:"HTML, CSS, and design-to-code fundamentals. Students leave knowing how to design for screens and bring those designs to life.", i:"◐" },
              { t:"Creative Thinking", d:"Problem framing, ideation techniques, and creative confidence. The course we wish existed when we were starting out.", i:"▣" },
            ].map((c,i) => (
              <div key={i} className="card" style={{ borderLeft:"4px solid var(--yellow)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:16 }}>
                  <span style={{ fontSize:26, color:"var(--yellow)" }}>{c.i}</span>
                  <span className="tag tag-ink" style={{ fontSize:10 }}>Course 0{i+1}</span>
                </div>
                <h3 style={{ fontWeight:700, fontSize:19, marginBottom:10 }}>{c.t}</h3>
                <p style={{ fontSize:14, color:"var(--mid)", lineHeight:1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ background:"var(--yellow)" }}>
        <div className="wrap">
          <div className="grid-2" style={{ gap:64, alignItems:"center" }}>
            <div>
              <span className="label">Pricing</span>
              <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12 }}>Simple,<br />Fair Pricing</h2>
              <p style={{ fontSize:15, lineHeight:1.75, marginTop:16 }}>One flat rate per student per term. All materials included. We partner with schools to bring structured creative education into their programs.</p>
            </div>
            <div className="price-box">
              <p className="label" style={{ color:"rgba(255,255,255,.3)", marginBottom:12 }}>Per Student / Per Term</p>
              <div className="price-num">₦50,000</div>
              <ul style={{ marginTop:28, paddingTop:28, borderTop:"1px solid rgba(255,255,255,.1)", listStyle:"none", display:"flex", flexDirection:"column", gap:12 }}>
                {["All course materials","Practical briefs every module","Certificate of completion","Mentorship network access"].map((f,i) => (
                  <li key={i} style={{ display:"flex", gap:10, fontSize:14, color:"rgba(255,255,255,.6)" }}><span style={{ color:"var(--yellow)" }}>✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={() => go("Contact")} className="btn btn-pink" style={{ marginTop:28, width:"100%", justifyContent:"center" }}>Partner With Us →</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function About({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>About</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Wired<br /><span style={{ color:"var(--pink)" }}>Differently</span></h1>
        </div>
      </section>
      <section className="section">
        <div className="wrap wrap-sm">
          <span className="label">Our Story</span>
          <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12, marginBottom:32 }}>Why 1204Studios Exists</h2>
          {["The name 1204Studios is not arbitrary. It's a reference point — a reminder of where the thinking started and why the studio exists.", "We started because we kept seeing the same problem: businesses spending money on creative work that looked like everyone else's. Safe. Generic. Work that checked the box but moved nobody.", "We built something different. Not just in how we design, but in how we think — about clients, about craft, about what a studio in Lagos can be at the highest level."].map((t,i) => (
            <p key={i} style={{ fontSize:18, lineHeight:1.85, color:"var(--mid)", marginBottom:24 }}>{t}</p>
          ))}
          <div className="divider" style={{ marginTop:40 }} />
          <h3 className="display" style={{ fontSize:"clamp(32px,4vw,52px)", marginTop:36, marginBottom:16 }}>"Wired Differently" isn't a slogan. It's a standard.</h3>
          <p style={{ fontSize:16, color:"var(--mid)", lineHeight:1.8 }}>It means we approach every brief without assumptions. It means we'd rather do less work better than more work faster. The day we start sounding like everyone else is the day we close the doors.</p>
        </div>
      </section>
      <section className="section" style={{ background:"var(--paper)", borderTop:"1px solid var(--border)" }}>
        <div className="wrap">
          <span className="label">The Team</span>
          <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", marginTop:12, marginBottom:48 }}>The Founders</h2>
          <div className="grid-2" style={{ gap:24 }}>
            {[
              { name:"Goke", role:"Creative Director & Co-Founder", bio:"Goke leads creative direction at 1204Studios. With a background in brand design and visual strategy, he's shaped identities for startups, institutions, and fast-moving consumer brands. He believes the best design is the kind that makes you wonder why it was never done before.", bg:"var(--ink)" },
              { name:"Okiki", role:"Design Lead & Co-Founder", bio:"Okiki leads design across all client projects. His work spans identity, digital, and print — with a particular obsession for typographic systems and how information is structured on a page. He teaches the same discipline he applies to every brief.", bg:"var(--pink)" },
            ].map((f,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:28, padding:36, background:"#fff", border:"1px solid var(--border)" }}>
                <div style={{ width:100, height:120, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, color:"#fff" }}>{f.name[0]}</span>
                </div>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:20 }}>{f.name}</h3>
                  <p style={{ fontSize:13, color:"var(--pink)", fontWeight:600, marginBottom:12, marginTop:4 }}>{f.role}</p>
                  <p style={{ fontSize:14, color:"var(--mid)", lineHeight:1.8 }}>{f.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ background:"var(--ink)", color:"#fff" }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>What We Stand For</span>
          <h2 className="display" style={{ fontSize:"clamp(40px,5vw,64px)", color:"#fff", marginTop:12, marginBottom:48 }}>Core Values</h2>
          <div className="grid-3" style={{ gap:2 }}>
            {[["Intentional","Every decision has a reason. We don't do default."],["Structured","Good creative work has a logic underneath it."],["Direct","We say what we mean and mean what we say."],["Capable","We only offer what we can actually deliver."],["Curious","We're still learning. That's how it stays interesting."]].map(([t,d],i) => (
              <div key={i} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", padding:"36px 28px" }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:"rgba(255,45,120,.2)", lineHeight:1, display:"block", marginBottom:14 }}>0{i+1}</span>
                <h3 style={{ fontWeight:700, fontSize:19, color:"#fff", marginBottom:8 }}>{t}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", lineHeight:1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Contact() {
  const [form, setForm] = useState({ name:"", email:"", company:"", service:"", message:"" });
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section style={{ background:"var(--ink)", color:"#fff", paddingTop:160, paddingBottom:100 }}>
        <div className="wrap">
          <span className="label" style={{ color:"rgba(255,255,255,.35)" }}>Get In Touch</span>
          <h1 className="display" style={{ fontSize:"clamp(64px,10vw,130px)", marginTop:16 }}>Let's<br /><span style={{ color:"var(--pink)" }}>Talk.</span></h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,.55)", maxWidth:520, marginTop:32, lineHeight:1.8 }}>Tell us what you're working on. We'll tell you if we're the right fit.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap:80, alignItems:"start" }}>
            <div>
              <span className="label">Contact Details</span>
              <h2 className="display" style={{ fontSize:"clamp(36px,4vw,56px)", marginTop:12, marginBottom:40 }}>Find Us</h2>
              {[{ l:"Email", v:"hello@1204studios.com", i:"✉" }, { l:"Location", v:"Lagos, Nigeria", i:"◎" }, { l:"Working Hours", v:"Mon–Fri, 9am–6pm WAT", i:"◷" }].map((c,i) => (
                <div key={i} style={{ display:"flex", gap:18, marginBottom:28, alignItems:"center" }}>
                  <div style={{ width:44, height:44, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:16, flexShrink:0 }}>{c.i}</div>
                  <div>
                    <p style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--mid)", marginBottom:4 }}>{c.l}</p>
                    <p style={{ fontWeight:600, fontSize:15 }}>{c.v}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              {sent ? (
                <div style={{ background:"var(--ink)", color:"#fff", padding:56, textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
                  <h3 style={{ fontWeight:800, fontSize:24, marginBottom:12 }}>Message Sent</h3>
                  <p style={{ color:"rgba(255,255,255,.5)", fontSize:15, lineHeight:1.7 }}>We'll review your brief and get back to you within one business day.</p>
                </div>
              ) : (
                <div>
                  <span className="label">Send a Message</span>
                  <h2 className="display" style={{ fontSize:"clamp(36px,4vw,56px)", marginTop:12, marginBottom:40 }}>Start Here</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                      {[{ k:"name", l:"Full Name", p:"Your name" }, { k:"email", l:"Email", p:"hello@company.com" }].map(f => (
                        <div key={f.k}>
                          <label style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--mid)", display:"block", marginBottom:8 }}>{f.l}</label>
                          <input className="contact-input" placeholder={f.p} value={form[f.k]} onChange={e => setForm({...form,[f.k]:e.target.value})} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--mid)", display:"block", marginBottom:8 }}>Service Needed</label>
                      <select className="contact-input" value={form.service} onChange={e => setForm({...form,service:e.target.value})} style={{ cursor:"pointer" }}>
                        <option value="">Select a service</option>
                        {["Brand Design & Identity","Marketing & Campaigns","Print Media","Design & Web Tutoring","General Enquiry"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"var(--mid)", display:"block", marginBottom:8 }}>Your Brief</label>
                      <textarea className="contact-input" rows={5} placeholder="Tell us about your project — scope, timeline, and budget." value={form.message} onChange={e => setForm({...form,message:e.target.value})} style={{ resize:"vertical" }} />
                    </div>
                    <button onClick={() => { if(form.name&&form.email&&form.message) setSent(true); }} className="btn btn-dark" style={{ justifyContent:"center", padding:"18px", fontSize:15 }}>Send Brief →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════ */
function Footer({ setPage }) {
  const go = p => { setPage(p); window.scrollTo(0,0); };
  return (
    <footer style={{ background:"var(--ink)", color:"#fff", paddingTop:80, paddingBottom:40 }}>
      <div className="wrap">
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:40, paddingBottom:56, borderBottom:"1px solid rgba(255,255,255,.07)", flexWrap:"wrap" }}>
          <div>
            <button onClick={() => go("Home")} style={{ background:"none", border:"none", display:"flex", alignItems:"baseline", gap:1, marginBottom:16, cursor:"pointer" }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:1 }}>1204</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"var(--pink)", letterSpacing:1 }}>STUDIOS</span>
            </button>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.35)", lineHeight:1.8, maxWidth:240, marginBottom:28 }}>A creative and marketing studio in Lagos, Nigeria. Built for brands that move differently.</p>
            <div style={{ display:"flex", gap:10 }}>
              <input style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", padding:"10px 14px", fontFamily:"'Outfit',sans-serif", fontSize:13, outline:"none" }} placeholder="Subscribe to newsletter" />
              <button className="btn btn-pink" style={{ padding:"10px 18px" }}>→</button>
            </div>
          </div>
          {[
            { title:"Company", links:["About","Portfolio","Blog","Contact"] },
            { title:"Services", links:["Branding","Marketing","Print","Tutoring"] },
            { title:"Work", links:["Portfolio","Blog"] },
            { title:"Legal", links:["Privacy Policy","Terms of Use"] },
          ].map((col,i) => (
            <div key={i}>
              <h4 style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:18 }}>{col.title}</h4>
              {col.links.map(l => <button key={l} className="footer-link" onClick={() => go(l)}>{l}</button>)}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24, flexWrap:"wrap", gap:16 }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.2)" }}>© 2025 1204Studios. All rights reserved.</p>
          <div style={{ display:"flex", gap:20 }}>
            {["Instagram","Twitter","LinkedIn","Behance"].map(s => <button key={s} className="footer-link" style={{ marginBottom:0 }}>{s}</button>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("Home");
  const { brands, hero, brandBar, metrics, caseStudies, blogPosts, loaded } = useSharedData();

  if (!loaded) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--ink)", color:"#fff", fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:2 }}>
      1204STUDIOS
    </div>
  );

  const pageKey = page.startsWith("CaseStudy:") ? "CaseStudy" : page.startsWith("BlogPost:") ? "BlogPost" : page;
  const pageId = page.split(":")[1];

  const sharedProps = { setPage, caseStudies, blogPosts, brands, hero, brandBar, metrics };

  const pageMap = {
    Home: <Home {...sharedProps} />,
    Branding: <Branding setPage={setPage} />,
    Marketing: <Marketing setPage={setPage} />,
    Print: <Print setPage={setPage} />,
    Tutoring: <Tutoring setPage={setPage} />,
    About: <About setPage={setPage} />,
    Portfolio: <Portfolio setPage={setPage} caseStudies={caseStudies} />,
    Blog: <Blog setPage={setPage} blogPosts={blogPosts} />,
    Contact: <Contact />,
    CaseStudy: <CaseStudyDetail id={pageId} setPage={setPage} caseStudies={caseStudies} />,
    BlogPost: <BlogPostDetail id={pageId} setPage={setPage} blogPosts={blogPosts} />,
  };

  return (
    <>
      <GlobalStyles />
      <Nav page={pageKey} setPage={setPage} />
      {pageMap[pageKey] || pageMap.Home}
      <Footer setPage={setPage} />
    </>
  );
}
