import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   ⚙️  PASTE YOUR SUPABASE CREDENTIALS HERE
═══════════════════════════════════════════════════════ */
const SUPABASE_URL  = "https://YOUR_PROJECT.supabase.co";   // ← replace
const SUPABASE_KEY  = "YOUR_ANON_PUBLIC_KEY";               // ← replace

/* ═══════════════════════════════════════════════════════
   SUPABASE CLIENT (no npm needed — raw fetch)
═══════════════════════════════════════════════════════ */
let _authToken = null;

const sb = {
  headers(extra = {}) {
    return {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${_authToken || SUPABASE_KEY}`,
      "Prefer": "return=representation",
      ...extra,
    };
  },

  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (d.access_token) { _authToken = d.access_token; return { ok: true, user: d.user }; }
    return { ok: false, error: d.error_description || d.msg || "Login failed" };
  },

  async signOut() { _authToken = null; },

  async refreshSession(refreshToken) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const d = await r.json();
    if (d.access_token) { _authToken = d.access_token; return d; }
    return null;
  },

  // ── REST helpers ──
  async select(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: this.headers() });
    return r.json();
  },

  async upsert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: this.headers({ "Prefer": "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify(Array.isArray(data) ? data : [data]),
    });
    return r.json();
  },

  async update(table, match, data) {
    const q = Object.entries(match).map(([k,v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${q}`, {
      method: "PATCH", headers: this.headers(),
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async delete(table, match) {
    const q = Object.entries(match).map(([k,v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${q}`, {
      method: "DELETE", headers: this.headers(),
    });
    return r.ok;
  },

  async uploadLogo(filename, base64Data, mimeType) {
    // Convert base64 to blob
    const byteString = atob(base64Data.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeType });

    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/brand-logos/${filename}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${_authToken || SUPABASE_KEY}`, "Content-Type": mimeType },
      body: blob,
    });
    if (r.ok) return `${SUPABASE_URL}/storage/v1/object/public/brand-logos/${filename}`;
    return null;
  },

  getPublicUrl(path) {
    return `${SUPABASE_URL}/storage/v1/object/public/brand-logos/${path}`;
  },
};

/* ═══════════════════════════════════════════════════════
   LOCAL SESSION PERSISTENCE
═══════════════════════════════════════════════════════ */
function saveSession(data) {
  try { sessionStorage.setItem("sb_session", JSON.stringify(data)); } catch(e) {}
}
function loadSession() {
  try { const s = sessionStorage.getItem("sb_session"); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}
function clearSession() {
  try { sessionStorage.removeItem("sb_session"); } catch(e) {}
}

/* ═══════════════════════════════════════════════════════
   DEFAULTS (shown before DB loads)
═══════════════════════════════════════════════════════ */
const DEF_HERO = { headline:"Built for brands that move differently.", subtext:"A Lagos-based creative and marketing studio.", cta1:"Start a Project →", cta2:"See Our Work" };
const DEF_BB   = { heading:"The brands who taught us greatness", sub:"Big brands who accidentally trained their future competition" };
const DEF_METRICS = [
  { id:"m1",service:"Brand Design & Identity",accent:"#ff2d78",headline:"Identity systems that hold up everywhere.",body:"From startups to institutions.",stats:[{value:"200+",label:"Brands Built"},{value:"98%",label:"Client Retention"},{value:"6wks",label:"Avg. Delivery"},{value:"40+",label:"Industries Served"}] },
  { id:"m2",service:"Marketing & Campaigns",accent:"#ffe600",headline:"Campaigns built to move people, not just metrics.",body:"Strategy-led creative.",stats:[{value:"50M+",label:"Impressions"},{value:"3.2x",label:"Avg. ROAS"},{value:"₦2B+",label:"Media Managed"},{value:"120+",label:"Campaigns"}] },
  { id:"m3",service:"Print Media",accent:"#00c8e0",headline:"Print that commands attention.",body:"Every material produced with rigour.",stats:[{value:"500+",label:"Print Projects"},{value:"12",label:"SKUs Packaged"},{value:"18%",label:"Cost Reduction"},{value:"100%",label:"End-to-End"}] },
  { id:"m4",service:"Design & Web Tutoring",accent:"#a855f7",headline:"The next generation of creative talent.",body:"Practical. Structured. Future-ready.",stats:[{value:"300+",label:"Students"},{value:"4",label:"Courses"},{value:"92%",label:"Completion"},{value:"15+",label:"Schools"}] },
];

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
function Styles() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --bg:#080808;--sf:#111;--s2:#181818;--s3:#222;
          --bd:rgba(255,255,255,0.07);--mid:rgba(255,255,255,0.4);
          --pink:#ff2d78;--yellow:#ffe600;--green:#00c875;--cyan:#00c8e0;--purple:#a855f7;
        }
        html,body{background:var(--bg);color:#fff;font-family:'Outfit',sans-serif;min-height:100vh;}
        button,input,textarea,select{font-family:'Outfit',sans-serif;color:#fff;}
        .dn{font-family:'Bebas Neue',sans-serif;letter-spacing:.02em;}
        ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:#2a2a2a;}

        /* sidebar */
        .sl{display:flex;align-items:center;gap:11px;padding:10px 18px;cursor:pointer;font-size:13.5px;color:var(--mid);background:none;border:none;border-left:3px solid transparent;width:100%;text-align:left;transition:all .18s;}
        .sl:hover{color:#fff;background:rgba(255,255,255,.03);}
        .sl.on{color:#fff;background:rgba(255,45,120,.08);border-left-color:var(--pink);}

        /* form */
        .f{display:flex;flex-direction:column;gap:5px;margin-bottom:16px;}
        .f label{font-size:10.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--mid);}
        .fi{background:rgba(255,255,255,.04);border:1px solid var(--bd);color:#fff;padding:11px 13px;font-size:13.5px;outline:none;transition:border-color .2s;width:100%;resize:vertical;}
        .fi:focus{border-color:var(--pink);}
        .fi::placeholder{color:rgba(255,255,255,.18);}
        .fi option{background:#222;color:#fff;}

        /* buttons */
        .ba{background:none;border:1px solid var(--bd);color:var(--mid);padding:5px 12px;font-size:12px;transition:all .2s;cursor:pointer;}
        .ba:hover{border-color:rgba(255,255,255,.25);color:#fff;}
        .ba.red:hover{border-color:var(--pink);color:var(--pink);}
        .bp{background:var(--pink);color:#fff;border:none;padding:11px 26px;font-weight:600;font-size:13.5px;transition:background .2s;cursor:pointer;}
        .bp:hover{background:#e0235f;}
        .bp:disabled{opacity:.5;cursor:not-allowed;}
        .bs{background:rgba(255,255,255,.05);color:#fff;border:1px solid var(--bd);padding:11px 26px;font-size:13.5px;cursor:pointer;transition:all .2s;}
        .bs:hover{background:rgba(255,255,255,.09);}

        /* tables */
        .cd{background:var(--sf);border:1px solid var(--bd);padding:22px;}
        .row{display:grid;align-items:center;padding:12px 18px;border-bottom:1px solid var(--bd);transition:background .15s;}
        .row:hover{background:rgba(255,255,255,.02);}
        .th{padding:9px 18px;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:var(--mid);border-bottom:1px solid var(--bd);}

        /* badges */
        .bdg{display:inline-block;padding:3px 10px;font-size:10.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
        .bg{background:rgba(0,200,117,.1);color:var(--green);}
        .by{background:rgba(255,230,0,.1);color:var(--yellow);}
        .bp2{background:rgba(255,45,120,.12);color:var(--pink);}
        .bm{background:rgba(255,255,255,.05);color:var(--mid);}

        /* toggle */
        .tog{position:relative;width:42px;height:23px;cursor:pointer;flex-shrink:0;}
        .tog input{opacity:0;width:0;height:0;position:absolute;}
        .tog-s{position:absolute;inset:0;background:rgba(255,255,255,.1);transition:.25s;border-radius:23px;}
        .tog-s::before{content:'';position:absolute;width:17px;height:17px;left:3px;top:3px;background:#fff;transition:.25s;border-radius:50%;}
        .tog input:checked+.tog-s{background:var(--pink);}
        .tog input:checked+.tog-s::before{transform:translateX(19px);}

        /* upload zone */
        .uz{border:1.5px dashed rgba(255,255,255,.12);background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;cursor:pointer;transition:all .2s;text-align:center;}
        .uz:hover{border-color:var(--pink);background:rgba(255,45,120,.04);}

        @keyframes fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .fa{animation:fi .22s ease both;}
        @keyframes si{from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:translateX(0);}}
        .sa{animation:si .28s ease both;}

        /* login */
        .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
        .login-card{background:var(--sf);border:1px solid var(--bd);padding:48px 40px;width:100%;max-width:400px;}
      `}</style>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════ */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    if (!email || !pass) { setErr("Enter your email and password."); return; }
    setBusy(true); setErr("");
    const res = await sb.signIn(email, pass);
    setBusy(false);
    if (res.ok) onLogin(res.user);
    else setErr(res.error);
  };

  return (
    <div className="login-wrap">
      <div className="login-card fa">
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:1, marginBottom:6 }}>
            <span className="dn" style={{ fontSize:28, letterSpacing:1 }}>1204</span>
            <span className="dn" style={{ fontSize:28, color:"var(--pink)", letterSpacing:1 }}>ADMIN</span>
          </div>
          <p style={{ fontSize:13, color:"var(--mid)" }}>Sign in to manage your website content</p>
        </div>
        {err && (
          <div style={{ background:"rgba(255,45,120,.1)", border:"1px solid rgba(255,45,120,.3)", padding:"10px 14px", marginBottom:16, fontSize:13, color:"var(--pink)" }}>
            {err}
          </div>
        )}
        <div className="f"><label>Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="hello@1204studios.com" onKeyDown={e=>e.key==="Enter"&&submit()} /></div>
        <div className="f"><label>Password</label><input className="fi" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} /></div>
        <button className="bp" style={{ width:"100%", justifyContent:"center", marginTop:8, padding:"14px" }} onClick={submit} disabled={busy}>
          {busy ? "Signing in..." : "Sign In →"}
        </button>
        <p style={{ fontSize:11.5, color:"var(--mid)", marginTop:20, lineHeight:1.6, textAlign:"center" }}>
          Forgot password? Go to Supabase Dashboard →<br />Authentication → Users → Reset password
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MODAL + TOAST
═══════════════════════════════════════════════════════ */
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fa" style={{ background:"var(--sf)",border:"1px solid var(--bd)",width:"100%",maxWidth:wide?820:520,maxHeight:"92vh",display:"flex",flexDirection:"column" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid var(--bd)",flexShrink:0 }}>
          <h3 style={{ fontWeight:700,fontSize:16 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--mid)",fontSize:19,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:24,overflowY:"auto",flex:1 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  const bc = type==="error"?"rgba(255,45,120,.5)":type==="success"?"rgba(0,200,117,.3)":"rgba(255,230,0,.3)";
  const ic = type==="error"?"✕":type==="success"?"✓":"◈";
  return (
    <div className="fa" style={{ position:"fixed",bottom:24,right:24,background:"var(--sf)",border:`1px solid ${bc}`,padding:"13px 20px",zIndex:2000,display:"flex",gap:10,alignItems:"center",maxWidth:320 }}>
      <span style={{ fontSize:14 }}>{ic}</span>
      <span style={{ fontSize:13.5,fontWeight:500 }}>{msg}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGO UPLOADER
═══════════════════════════════════════════════════════ */
function LogoUploader({ value, onChange, name, onUpload }) {
  const ref = useRef();
  const handleFile = async (file) => {
    if (!file) return;
    if (!["image/png","image/svg+xml"].includes(file.type)) { alert("PNG or SVG only."); return; }
    if (file.size > 2_000_000) { alert("Max file size is 2MB."); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      // Try to upload to Supabase Storage
      if (onUpload) {
        const ext = file.type === "image/svg+xml" ? "svg" : "png";
        const fname = `${Date.now()}-${name.toLowerCase().replace(/\s+/g,"_")}.${ext}`;
        const publicUrl = await onUpload(fname, dataUrl, file.type);
        if (publicUrl) { onChange(publicUrl); return; }
      }
      // Fallback: store as base64
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {value ? (
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid var(--bd)" }}>
          <div style={{ width:88,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",padding:6,flexShrink:0 }}>
            <img src={value} alt={name} style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain" }} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13,fontWeight:600 }}>{name}</p>
            <p style={{ fontSize:11,color:"var(--mid)",marginTop:2 }}>Logo uploaded</p>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button className="ba" onClick={()=>ref.current.click()}>Replace</button>
            <button className="ba red" onClick={()=>onChange("")}>Remove</button>
          </div>
        </div>
      ) : (
        <div className="uz" onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} onDragOver={e=>e.preventDefault()} onClick={()=>ref.current.click()}>
          <div style={{ fontSize:26,opacity:.25 }}>⬆</div>
          <p style={{ fontSize:13,color:"var(--mid)" }}>Drop PNG or SVG, or <span style={{ color:"var(--pink)" }}>click to browse</span></p>
          <p style={{ fontSize:11,color:"rgba(255,255,255,.18)" }}>PNG · SVG · Max 2MB</p>
        </div>
      )}
      <input ref={ref} type="file" accept=".png,.svg,image/png,image/svg+xml" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STAT EDITOR
═══════════════════════════════════════════════════════ */
function StatEditor({ stats, onChange }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
      {stats.map((s,i) => (
        <div key={i} style={{ background:"var(--s2)",border:"1px solid var(--bd)",padding:12 }}>
          <p style={{ fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--mid)",marginBottom:8 }}>Stat {i+1}</p>
          <input className="fi" value={s.value} onChange={e=>{const u=[...stats];u[i]={...u[i],value:e.target.value};onChange(u);}} placeholder="200+" style={{ marginBottom:6 }} />
          <input className="fi" value={s.label} onChange={e=>{const u=[...stats];u[i]={...u[i],label:e.target.value};onChange(u);}} placeholder="Brands Built" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ADMIN APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]           = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab]             = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data state
  const [brands, setBrands]       = useState([]);
  const [hero, setHero]           = useState(DEF_HERO);
  const [brandBar, setBrandBar]   = useState(DEF_BB);
  const [metrics, setMetrics]     = useState(DEF_METRICS);
  const [caseStudies, setCS]      = useState([]);
  const [blogPosts, setBP]        = useState([]);
  const [loading, setLoading]     = useState(true);

  const [modal, setModal]         = useState(null);
  const [toast, setToast]         = useState(null);
  const [saving, setSaving]       = useState(false);

  const toast_ = (msg, type="success") => { setToast({ msg,type }); setTimeout(()=>setToast(null),3000); };

  // ── AUTH: restore session ──
  useEffect(() => {
    const sess = loadSession();
    if (sess?.access_token) {
      _authToken = sess.access_token;
      setUser(sess.user);
    }
    setAuthChecked(true);
  }, []);

  // ── LOAD ALL DATA ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, br, cs, bp] = await Promise.all([
        sb.select("site_config", "select=key,value"),
        sb.select("brands", "select=*&order=display_order.asc"),
        sb.select("case_studies", "select=*&order=display_order.asc"),
        sb.select("blog_posts", "select=*&order=display_order.asc"),
      ]);
      // Parse site_config rows
      if (Array.isArray(cfg)) {
        cfg.forEach(row => {
          if (row.key === "hero") setHero(row.value);
          if (row.key === "brand_bar") setBrandBar(row.value);
          if (row.key === "metrics") setMetrics(row.value);
        });
      }
      if (Array.isArray(br)) setBrands(br.map(b=>({ id:b.id,name:b.name,logoUrl:b.logo_url,order:b.display_order })));
      if (Array.isArray(cs)) setCS(cs.map(c=>({ id:c.id,title:c.title,category:c.category,year:c.year,hero:c.hero_color,summary:c.summary,challenge:c.challenge,approach:c.approach,result:c.result,tags:c.tags||[],featured:c.featured,order:c.display_order })));
      if (Array.isArray(bp)) setBP(bp.map(b=>({ id:b.id,title:b.title,tag:b.tag,date:b.date,readTime:b.read_time,summary:b.summary,content:b.content,featured:b.featured,order:b.display_order })));
    } catch(e) { toast_("Failed to load data","error"); }
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user]);

  // ── SAVE HELPERS ──
  const saveConfig = async (key, value, label) => {
    setSaving(true);
    const ok = await sb.upsert("site_config", { key, value });
    setSaving(false);
    if (!ok?.error) toast_(`${label} updated — live on website ✓`);
    else toast_("Save failed: " + (ok.message||ok.error),"error");
  };

  const saveBrands = async () => {
    setSaving(true);
    try {
      for (const b of brands) {
        await sb.upsert("brands", { id:b.id, name:b.name, logo_url:b.logoUrl||"", display_order:b.order||0 });
      }
      toast_("Brand logos updated on website ✓");
    } catch(e) { toast_("Save failed","error"); }
    setSaving(false);
  };

  const uploadLogo = async (filename, dataUrl, mimeType) => {
    return await sb.uploadLogo(filename, dataUrl, mimeType);
  };

  // CASE STUDIES
  const toggleCSFeat = async (id) => {
    const item = caseStudies.find(c=>c.id===id);
    const others = caseStudies.filter(c=>c.featured&&c.id!==id).length;
    if (!item.featured && others>=4) { toast_("Max 4 featured. Unfeature one first.","error"); return; }
    const newVal = !item.featured;
    const updated = caseStudies.map(c=>c.id===id?{...c,featured:newVal}:c);
    setCS(updated);
    await sb.update("case_studies",{id},{featured:newVal});
    toast_(newVal?"Case study featured on homepage ✓":"Removed from homepage");
  };

  const saveCS = async (cs) => {
    setSaving(true);
    const row = { id:cs.id,title:cs.title,category:cs.category,year:cs.year,hero_color:cs.hero,summary:cs.summary,challenge:cs.challenge,approach:cs.approach,result:cs.result,tags:cs.tags,featured:cs.featured,display_order:cs.order||0 };
    const r = await sb.upsert("case_studies",row);
    setSaving(false);
    if (!r?.[0]?.id && r?.error) { toast_("Save failed","error"); return; }
    await loadAll(); setModal(null);
    toast_("Case study saved ✓");
  };

  const deleteCS = async (id) => {
    if (!confirm("Delete this case study?")) return;
    await sb.delete("case_studies",{id});
    setCS(prev=>prev.filter(c=>c.id!==id));
    toast_("Case study deleted");
  };

  // BLOG
  const toggleBPFeat = async (id) => {
    const item = blogPosts.find(b=>b.id===id);
    const others = blogPosts.filter(b=>b.featured&&b.id!==id).length;
    if (!item.featured && others>=4) { toast_("Max 4 featured. Unfeature one first.","error"); return; }
    const newVal = !item.featured;
    setBP(prev=>prev.map(b=>b.id===id?{...b,featured:newVal}:b));
    await sb.update("blog_posts",{id},{featured:newVal});
    toast_(newVal?"Post featured on homepage ✓":"Removed from homepage");
  };

  const saveBP = async (bp) => {
    setSaving(true);
    const row = { id:bp.id,title:bp.title,tag:bp.tag,date:bp.date,read_time:bp.readTime,summary:bp.summary,content:bp.content,featured:bp.featured,display_order:bp.order||0 };
    const r = await sb.upsert("blog_posts",row);
    setSaving(false);
    if (!r?.[0]?.id && r?.error) { toast_("Save failed","error"); return; }
    await loadAll(); setModal(null);
    toast_("Post saved ✓");
  };

  const deleteBP = async (id) => {
    if (!confirm("Delete this post?")) return;
    await sb.delete("blog_posts",{id});
    setBP(prev=>prev.filter(b=>b.id!==id));
    toast_("Post deleted");
  };

  const TABS = [
    { id:"dashboard",icon:"⬛",label:"Dashboard" },
    { id:"hero",icon:"◈",label:"Hero Section" },
    { id:"brandbar",icon:"◉",label:"Brand Bar" },
    { id:"metrics",icon:"▣",label:"Metrics" },
    { id:"casestudies",icon:"🗂",label:"Case Studies" },
    { id:"blog",icon:"📝",label:"Blog Posts" },
    { id:"settings",icon:"⚙️",label:"Settings" },
  ];

  // ── NOT YET AUTH CHECKED ──
  if (!authChecked) return null;

  // ── LOGIN SCREEN ──
  if (!user) return (
    <>
      <Styles />
      <Login onLogin={(u) => { setUser(u); saveSession({ access_token: _authToken, user: u }); }} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );

  const featCS = caseStudies.filter(c=>c.featured).length;
  const featBP = blogPosts.filter(b=>b.featured).length;

  return (
    <>
      <Styles />
      <div style={{ display:"flex",minHeight:"100vh" }}>

        {/* SIDEBAR */}
        <aside style={{ width:sidebarOpen?232:52,background:"var(--sf)",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",transition:"width .25s",overflow:"hidden" }}>
          <div style={{ padding:"18px 16px 14px",borderBottom:"1px solid var(--bd)",display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:232 }}>
            {sidebarOpen && (
              <div>
                <div style={{ display:"flex",alignItems:"baseline",gap:1 }}>
                  <span className="dn" style={{ fontSize:20,letterSpacing:1 }}>1204</span>
                  <span className="dn" style={{ fontSize:20,color:"var(--pink)",letterSpacing:1 }}>ADMIN</span>
                </div>
                <p style={{ fontSize:10,color:"var(--mid)",letterSpacing:1.5,textTransform:"uppercase",marginTop:2 }}>Content Manager</p>
              </div>
            )}
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:"none",border:"none",color:"var(--mid)",fontSize:16,cursor:"pointer",marginLeft:"auto" }}>
              {sidebarOpen?"◂":"▸"}
            </button>
          </div>
          <nav style={{ flex:1,paddingTop:6 }}>
            {TABS.map(t=>(
              <button key={t.id} className={`sl ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)} title={t.label}>
                <span style={{ fontSize:14,flexShrink:0 }}>{t.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace:"nowrap" }}>{t.label}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding:"14px 16px",borderTop:"1px solid var(--bd)",minWidth:232 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <div style={{ width:30,height:30,background:"var(--pink)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0 }}>
                {user?.email?.[0]?.toUpperCase()||"A"}
              </div>
              {sidebarOpen && <div><p style={{ fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",maxWidth:140 }}>{user?.email}</p></div>}
            </div>
            {sidebarOpen && (
              <button className="ba" style={{ width:"100%",textAlign:"center",fontSize:12 }} onClick={()=>{ sb.signOut(); clearSession(); setUser(null); }}>
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1,overflow:"auto",minWidth:0 }}>
          <div style={{ height:56,borderBottom:"1px solid var(--bd)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,background:"rgba(8,8,8,.96)",backdropFilter:"blur(12px)",zIndex:10 }}>
            <h1 style={{ fontWeight:700,fontSize:16 }}>{TABS.find(t=>t.id===tab)?.label}</h1>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              {saving && <span style={{ fontSize:12,color:"var(--mid)" }}>Saving...</span>}
              <span style={{ fontSize:11.5,color:"var(--mid)",background:"rgba(255,255,255,.04)",padding:"4px 12px",border:"1px solid var(--bd)" }}>
                {featCS}/4 CS · {featBP}/4 Posts featured
              </span>
              <button className="ba" onClick={loadAll} style={{ fontSize:12 }}>↻ Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh" }}>
              <p style={{ color:"var(--mid)",fontSize:14 }}>Loading from Supabase...</p>
            </div>
          ) : (
          <div style={{ padding:28 }}>

            {/* ── DASHBOARD ── */}
            {tab==="dashboard" && (
              <div className="sa">
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:32 }}>
                  {[
                    { l:"Brand Logos",v:brands.length,s:"in marquee bar",a:"var(--pink)" },
                    { l:"Case Studies",v:caseStudies.length,s:`${featCS} on homepage`,a:"var(--yellow)" },
                    { l:"Blog Posts",v:blogPosts.length,s:`${featBP} on homepage`,a:"var(--cyan)" },
                    { l:"Metric Cards",v:metrics.length,s:"service impact stats",a:"var(--purple)" },
                  ].map((s,i)=>(
                    <div key={i} className="cd">
                      <div className="dn" style={{ fontSize:40,color:s.a,lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:13.5,fontWeight:600,marginTop:8 }}>{s.l}</div>
                      <div style={{ fontSize:11.5,color:"var(--mid)",marginTop:3 }}>{s.s}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"14px 20px",background:"rgba(0,200,117,.05)",border:"1px solid rgba(0,200,117,.15)",marginBottom:24 }}>
                  <p style={{ fontSize:13,color:"rgba(255,255,255,.7)" }}>
                    ✓ <strong style={{ color:"var(--green)" }}>Connected to Supabase.</strong> All changes save to your database and reflect on the website in real time.
                  </p>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                  <div className="cd">
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                      <h3 style={{ fontWeight:700,fontSize:14 }}>Featured Case Studies</h3>
                      <button className="ba" onClick={()=>setTab("casestudies")}>Manage →</button>
                    </div>
                    {caseStudies.filter(c=>c.featured).map(c=>(
                      <div key={c.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--bd)" }}>
                        <div><p style={{ fontWeight:600,fontSize:12.5 }}>{c.title}</p><p style={{ fontSize:11.5,color:"var(--mid)",marginTop:1 }}>{c.category}</p></div>
                        <span className="bdg bp2">Featured</span>
                      </div>
                    ))}
                    {featCS===0 && <p style={{ fontSize:12.5,color:"var(--mid)",padding:"16px 0",textAlign:"center" }}>None featured</p>}
                  </div>
                  <div className="cd">
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                      <h3 style={{ fontWeight:700,fontSize:14 }}>Featured Blog Posts</h3>
                      <button className="ba" onClick={()=>setTab("blog")}>Manage →</button>
                    </div>
                    {blogPosts.filter(b=>b.featured).map(b=>(
                      <div key={b.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--bd)" }}>
                        <div><p style={{ fontWeight:600,fontSize:12.5,lineHeight:1.3 }}>{b.title}</p><p style={{ fontSize:11.5,color:"var(--mid)",marginTop:1 }}>{b.date}</p></div>
                        <span className="bdg by">Featured</span>
                      </div>
                    ))}
                    {featBP===0 && <p style={{ fontSize:12.5,color:"var(--mid)",padding:"16px 0",textAlign:"center" }}>None featured</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── HERO ── */}
            {tab==="hero" && (
              <div className="sa" style={{ maxWidth:720 }}>
                <div className="cd" style={{ marginBottom:20 }}>
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:20 }}>Hero Text</h3>
                  <div className="f"><label>Main Headline</label><textarea className="fi" rows={2} value={hero.headline} onChange={e=>setHero({...hero,headline:e.target.value})} /></div>
                  <div className="f"><label>Subtext</label><textarea className="fi" rows={3} value={hero.subtext} onChange={e=>setHero({...hero,subtext:e.target.value})} /></div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    <div className="f"><label>Primary CTA</label><input className="fi" value={hero.cta1} onChange={e=>setHero({...hero,cta1:e.target.value})} /></div>
                    <div className="f"><label>Secondary CTA</label><input className="fi" value={hero.cta2} onChange={e=>setHero({...hero,cta2:e.target.value})} /></div>
                  </div>
                </div>
                <div style={{ background:"var(--s2)",border:"1px solid var(--bd)",padding:24,marginBottom:20 }}>
                  <p style={{ fontSize:10.5,color:"var(--mid)",letterSpacing:2,textTransform:"uppercase",marginBottom:14 }}>Preview</p>
                  <p className="dn" style={{ fontSize:38,color:"#fff",lineHeight:.95,marginBottom:12 }}>{hero.headline}</p>
                  <p style={{ fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.7,maxWidth:400,marginBottom:14 }}>{hero.subtext}</p>
                  <div style={{ display:"flex",gap:10 }}>
                    <span style={{ background:"var(--pink)",color:"#fff",padding:"8px 18px",fontSize:13,fontWeight:600 }}>{hero.cta1}</span>
                    <span style={{ border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)",padding:"8px 18px",fontSize:13 }}>{hero.cta2}</span>
                  </div>
                </div>
                <button className="bp" disabled={saving} onClick={()=>saveConfig("hero",hero,"Hero section")}>
                  {saving?"Saving...":"Save Hero to Website →"}
                </button>
              </div>
            )}

            {/* ── BRAND BAR ── */}
            {tab==="brandbar" && (
              <div className="sa" style={{ maxWidth:900 }}>
                <div className="cd" style={{ marginBottom:20 }}>
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:20 }}>Bar Text</h3>
                  <div className="f"><label>Heading</label><input className="fi" value={brandBar.heading} onChange={e=>setBrandBar({...brandBar,heading:e.target.value})} /></div>
                  <div className="f"><label>Subheading</label><input className="fi" value={brandBar.sub} onChange={e=>setBrandBar({...brandBar,sub:e.target.value})} /></div>
                  <button className="bp" style={{ marginTop:4 }} disabled={saving} onClick={()=>saveConfig("brand_bar",brandBar,"Brand bar text")}>Save Text</button>
                </div>
                <div className="cd" style={{ marginBottom:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div>
                      <h3 style={{ fontWeight:700,fontSize:15 }}>Brand Logos ({brands.length})</h3>
                      <p style={{ fontSize:12,color:"var(--mid)",marginTop:3 }}>PNG or SVG. Logos stored in Supabase Storage.</p>
                    </div>
                    <button className="bp" style={{ padding:"9px 18px",fontSize:12.5 }} onClick={()=>setModal({ type:"addBrand",item:{ id:"b"+Date.now(),name:"",logoUrl:"",order:brands.length } })}>+ Add Brand</button>
                  </div>
                  {/* Preview on white */}
                  <div style={{ background:"#fff",padding:"10px 0",overflow:"hidden",marginBottom:20 }}>
                    <p style={{ fontSize:10,color:"#aaa",letterSpacing:2,textTransform:"uppercase",padding:"0 16px",marginBottom:8 }}>Preview</p>
                    <div style={{ display:"flex",overflowX:"auto",gap:0 }}>
                      {brands.map((b,i)=>(
                        <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"0 28px",borderRight:"1px solid #eee",minWidth:110,height:48,flexShrink:0 }}>
                          {b.logoUrl ? <img src={b.logoUrl} alt={b.name} style={{ maxHeight:32,maxWidth:80,objectFit:"contain",opacity:.55 }} />
                            : <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#ccc" }}>{b.name||"?"}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12 }}>
                    {brands.map((b,i)=>(
                      <div key={b.id} style={{ background:"var(--s2)",border:"1px solid var(--bd)",padding:14 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                          <p style={{ fontWeight:600,fontSize:13 }}>{b.name||<span style={{ color:"var(--mid)",fontStyle:"italic" }}>Unnamed</span>}</p>
                          <div style={{ display:"flex",gap:6 }}>
                            <button className="ba" onClick={()=>setModal({ type:"editBrand",item:{...b},index:i })}>Edit</button>
                            <button className="ba red" onClick={async()=>{ await sb.delete("brands",{id:b.id}); setBrands(prev=>prev.filter(x=>x.id!==b.id)); toast_("Brand removed"); }}>✕</button>
                          </div>
                        </div>
                        <div style={{ height:48,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:6 }}>
                          {b.logoUrl ? <img src={b.logoUrl} alt={b.name} style={{ maxHeight:36,maxWidth:"100%",objectFit:"contain" }} />
                            : <span style={{ fontSize:11,color:"#bbb",fontStyle:"italic" }}>No logo</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="bp" style={{ marginTop:20 }} disabled={saving} onClick={saveBrands}>Save All Logos to Website →</button>
                </div>
              </div>
            )}

            {/* ── METRICS ── */}
            {tab==="metrics" && (
              <div className="sa">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <p style={{ fontSize:13,color:"var(--mid)" }}>4 service metric cards — auto-advancing carousel on the website.</p>
                  <button className="bp" disabled={saving} onClick={()=>saveConfig("metrics",metrics,"Metrics")}>Save All Metrics →</button>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:16 }}>
                  {metrics.map((m)=>(
                    <div key={m.id} className="cd" style={{ borderTop:`3px solid ${m.accent}` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                        <span style={{ fontSize:12,fontWeight:600,color:m.accent }}>{m.service}</span>
                        <div className="f" style={{ marginBottom:0,width:80 }}>
                          <label style={{ fontSize:9 }}>Accent</label>
                          <input type="color" value={m.accent} onChange={e=>setMetrics(prev=>prev.map(x=>x.id===m.id?{...x,accent:e.target.value}:x))} style={{ width:"100%",height:26,background:"none",border:"1px solid var(--bd)",cursor:"pointer",padding:2 }} />
                        </div>
                      </div>
                      <div className="f"><label>Headline</label><input className="fi" value={m.headline} onChange={e=>setMetrics(prev=>prev.map(x=>x.id===m.id?{...x,headline:e.target.value}:x))} /></div>
                      <div className="f"><label>Body</label><textarea className="fi" rows={2} value={m.body} onChange={e=>setMetrics(prev=>prev.map(x=>x.id===m.id?{...x,body:e.target.value}:x))} /></div>
                      <p style={{ fontSize:10.5,color:"var(--mid)",letterSpacing:2,textTransform:"uppercase",marginBottom:10 }}>4 Stats</p>
                      <StatEditor stats={m.stats} onChange={s=>setMetrics(prev=>prev.map(x=>x.id===m.id?{...x,stats:s}:x))} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:20,display:"flex",justifyContent:"flex-end" }}>
                  <button className="bp" disabled={saving} onClick={()=>saveConfig("metrics",metrics,"Metrics")}>Save All Metrics →</button>
                </div>
              </div>
            )}

            {/* ── CASE STUDIES ── */}
            {tab==="casestudies" && (
              <div className="sa">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <p style={{ fontSize:13,color:"var(--mid)" }}>{caseStudies.length} total · <span style={{ color:"var(--pink)" }}>{featCS}/4 featured</span></p>
                  <button className="bp" onClick={()=>setModal({ type:"editCS",item:{ id:"cs"+Date.now(),title:"",category:"",year:new Date().getFullYear().toString(),hero:"#1a1a1a",summary:"",challenge:"",approach:"",result:"",tags:[],featured:false,order:caseStudies.length } })}>+ Add Case Study</button>
                </div>
                <div className="cd" style={{ padding:0 }}>
                  <div className="th" style={{ display:"grid",gridTemplateColumns:"1fr 130px 70px 110px 110px" }}>
                    <span>Project</span><span>Category</span><span>Year</span><span>Homepage</span><span>Actions</span>
                  </div>
                  {caseStudies.map(cs=>(
                    <div key={cs.id} className="row" style={{ gridTemplateColumns:"1fr 130px 70px 110px 110px" }}>
                      <div><p style={{ fontWeight:600,fontSize:13.5 }}>{cs.title}</p><p style={{ fontSize:12,color:"var(--mid)",marginTop:2 }}>{cs.summary?.substring(0,48)}…</p></div>
                      <span className="bdg bm">{cs.category}</span>
                      <span style={{ fontSize:13,color:"var(--mid)" }}>{cs.year}</span>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <label className="tog"><input type="checkbox" checked={cs.featured} onChange={()=>toggleCSFeat(cs.id)}/><span className="tog-s"/></label>
                        {cs.featured && <span className="bdg bp2" style={{ fontSize:10 }}>Live</span>}
                      </div>
                      <div style={{ display:"flex",gap:6 }}>
                        <button className="ba" onClick={()=>setModal({ type:"editCS",item:{...cs,tags:[...(cs.tags||[])] } })}>Edit</button>
                        <button className="ba red" onClick={()=>deleteCS(cs.id)}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BLOG ── */}
            {tab==="blog" && (
              <div className="sa">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <p style={{ fontSize:13,color:"var(--mid)" }}>{blogPosts.length} posts · <span style={{ color:"var(--yellow)" }}>{featBP}/4 featured</span></p>
                  <button className="bp" onClick={()=>setModal({ type:"editBP",item:{ id:"bp"+Date.now(),title:"",tag:"",date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),readTime:"5 min read",summary:"",content:"",featured:false,order:blogPosts.length } })}>+ New Post</button>
                </div>
                <div className="cd" style={{ padding:0 }}>
                  <div className="th" style={{ display:"grid",gridTemplateColumns:"1fr 90px 110px 110px 110px" }}>
                    <span>Title</span><span>Tag</span><span>Date</span><span>Homepage</span><span>Actions</span>
                  </div>
                  {blogPosts.map(bp=>(
                    <div key={bp.id} className="row" style={{ gridTemplateColumns:"1fr 90px 110px 110px 110px" }}>
                      <div><p style={{ fontWeight:600,fontSize:13.5 }}>{bp.title}</p><p style={{ fontSize:12,color:"var(--mid)",marginTop:2 }}>{bp.readTime}</p></div>
                      <span className="bdg by">{bp.tag}</span>
                      <span style={{ fontSize:12.5,color:"var(--mid)" }}>{bp.date}</span>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <label className="tog"><input type="checkbox" checked={bp.featured} onChange={()=>toggleBPFeat(bp.id)}/><span className="tog-s"/></label>
                        {bp.featured && <span className="bdg by" style={{ fontSize:10 }}>Live</span>}
                      </div>
                      <div style={{ display:"flex",gap:6 }}>
                        <button className="ba" onClick={()=>setModal({ type:"editBP",item:{...bp} })}>Edit</button>
                        <button className="ba red" onClick={()=>deleteBP(bp.id)}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab==="settings" && (
              <div className="sa" style={{ maxWidth:520 }}>
                <div className="cd" style={{ marginBottom:20 }}>
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:16 }}>Supabase Connection</h3>
                  <div style={{ padding:"14px 16px",background:"rgba(0,200,117,.05)",border:"1px solid rgba(0,200,117,.2)" }}>
                    <p style={{ fontSize:13,color:"var(--green)",fontWeight:600 }}>✓ Connected</p>
                    <p style={{ fontSize:12,color:"var(--mid)",marginTop:4 }}>{SUPABASE_URL}</p>
                  </div>
                </div>
                <div className="cd" style={{ marginBottom:20 }}>
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:16 }}>Admin Account</h3>
                  <p style={{ fontSize:13,color:"var(--mid)",marginBottom:12 }}>Logged in as: <strong style={{ color:"#fff" }}>{user?.email}</strong></p>
                  <button className="ba" onClick={()=>{ sb.signOut(); clearSession(); setUser(null); }}>Sign Out</button>
                </div>
                <div className="cd">
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:16 }}>Need to add another admin?</h3>
                  <p style={{ fontSize:13,color:"var(--mid)",lineHeight:1.7 }}>
                    Go to your Supabase Dashboard → Authentication → Users → Invite User.<br/>
                    They'll receive an email to set their password.
                  </p>
                </div>
              </div>
            )}

          </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {(modal?.type==="addBrand"||modal?.type==="editBrand") && (
        <Modal title={modal.type==="addBrand"?"Add Brand Logo":"Edit Brand Logo"} onClose={()=>setModal(null)}>
          <div className="f"><label>Brand Name</label><input className="fi" value={modal.item.name} onChange={e=>setModal({...modal,item:{...modal.item,name:e.target.value}})} placeholder="e.g. Netflix" /></div>
          <div className="f">
            <label>Logo File (PNG or SVG)</label>
            <LogoUploader value={modal.item.logoUrl} name={modal.item.name||"brand"} onUpload={uploadLogo}
              onChange={url=>setModal({...modal,item:{...modal.item,logoUrl:url}})} />
          </div>
          <div style={{ display:"flex",gap:10,marginTop:8 }}>
            <button className="bp" onClick={async()=>{
              if(!modal.item.name.trim()){ toast_("Enter a brand name","error"); return; }
              if(modal.type==="addBrand"){
                await sb.upsert("brands",{ id:modal.item.id,name:modal.item.name,logo_url:modal.item.logoUrl||"",display_order:modal.item.order||0 });
                setBrands(prev=>[...prev,modal.item]);
              } else {
                await sb.upsert("brands",{ id:modal.item.id,name:modal.item.name,logo_url:modal.item.logoUrl||"",display_order:modal.item.order||0 });
                setBrands(prev=>prev.map((b,i)=>i===modal.index?modal.item:b));
              }
              toast_("Brand saved ✓"); setModal(null);
            }}>Save Brand</button>
            <button className="bs" onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {modal?.type==="editCS" && (
        <Modal title={caseStudies.find(c=>c.id===modal.item.id)?"Edit Case Study":"New Case Study"} onClose={()=>setModal(null)} wide>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div className="f" style={{ gridColumn:"1/-1" }}><label>Project Title</label><input className="fi" value={modal.item.title} onChange={e=>setModal({...modal,item:{...modal.item,title:e.target.value}})} /></div>
            <div className="f"><label>Category</label>
              <select className="fi" value={modal.item.category} onChange={e=>setModal({...modal,item:{...modal.item,category:e.target.value}})}>
                <option value="">Select...</option>
                {["Brand Identity","Marketing Campaign","Print Media","Digital","Strategy"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="f"><label>Year</label><input className="fi" value={modal.item.year} onChange={e=>setModal({...modal,item:{...modal.item,year:e.target.value}})} /></div>
            <div className="f"><label>Hero Colour</label><input type="color" className="fi" value={modal.item.hero} onChange={e=>setModal({...modal,item:{...modal.item,hero:e.target.value}})} style={{ height:44,padding:4,cursor:"pointer" }} /></div>
            <div className="f"><label>Tags (comma separated)</label><input className="fi" value={Array.isArray(modal.item.tags)?modal.item.tags.join(", "):""} onChange={e=>setModal({...modal,item:{...modal.item,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)}})} /></div>
            <div className="f" style={{ gridColumn:"1/-1" }}><label>Summary</label><textarea className="fi" rows={2} value={modal.item.summary} onChange={e=>setModal({...modal,item:{...modal.item,summary:e.target.value}})} /></div>
            <div className="f" style={{ gridColumn:"1/-1" }}><label>The Challenge</label><textarea className="fi" rows={3} value={modal.item.challenge} onChange={e=>setModal({...modal,item:{...modal.item,challenge:e.target.value}})} /></div>
            <div className="f" style={{ gridColumn:"1/-1" }}><label>Our Approach</label><textarea className="fi" rows={3} value={modal.item.approach} onChange={e=>setModal({...modal,item:{...modal.item,approach:e.target.value}})} /></div>
            <div className="f" style={{ gridColumn:"1/-1" }}><label>The Result</label><textarea className="fi" rows={3} value={modal.item.result} onChange={e=>setModal({...modal,item:{...modal.item,result:e.target.value}})} /></div>
            <div className="f" style={{ gridColumn:"1/-1" }}>
              <label>Feature on Homepage</label>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:4 }}>
                <label className="tog"><input type="checkbox" checked={modal.item.featured} onChange={e=>setModal({...modal,item:{...modal.item,featured:e.target.checked}})}/><span className="tog-s"/></label>
                <span style={{ fontSize:13,color:"var(--mid)" }}>{modal.item.featured?"Will show in Featured Case Studies":"Not featured on homepage"}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:10,marginTop:8 }}>
            <button className="bp" disabled={saving} onClick={()=>{ if(!modal.item.title){ toast_("Title required","error"); return; } saveCS(modal.item); }}>
              {saving?"Saving...":"Save Case Study"}
            </button>
            <button className="bs" onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {modal?.type==="editBP" && (
        <Modal title={blogPosts.find(b=>b.id===modal.item.id)?"Edit Blog Post":"New Blog Post"} onClose={()=>setModal(null)} wide>
          <div className="f"><label>Post Title</label><input className="fi" value={modal.item.title} onChange={e=>setModal({...modal,item:{...modal.item,title:e.target.value}})} /></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
            <div className="f"><label>Tag</label>
              <select className="fi" value={modal.item.tag} onChange={e=>setModal({...modal,item:{...modal.item,tag:e.target.value}})}>
                <option value="">Select...</option>
                {["Marketing","Design","Branding","Technology","Print","Process","Business"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="f"><label>Date</label><input className="fi" value={modal.item.date} onChange={e=>setModal({...modal,item:{...modal.item,date:e.target.value}})} /></div>
            <div className="f"><label>Read Time</label><input className="fi" value={modal.item.readTime} onChange={e=>setModal({...modal,item:{...modal.item,readTime:e.target.value}})} /></div>
          </div>
          <div className="f"><label>Summary</label><textarea className="fi" rows={2} value={modal.item.summary} onChange={e=>setModal({...modal,item:{...modal.item,summary:e.target.value}})} /></div>
          <div className="f"><label>Full Article Content</label><textarea className="fi" rows={10} value={modal.item.content} onChange={e=>setModal({...modal,item:{...modal.item,content:e.target.value}})} placeholder="Write the full article. Double line break = new paragraph. **bold text** for emphasis." style={{ lineHeight:1.7 }} /></div>
          <div className="f">
            <label>Feature on Homepage</label>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:4 }}>
              <label className="tog"><input type="checkbox" checked={modal.item.featured} onChange={e=>setModal({...modal,item:{...modal.item,featured:e.target.checked}})}/><span className="tog-s"/></label>
              <span style={{ fontSize:13,color:"var(--mid)" }}>{modal.item.featured?"Will appear in From the Blog section":"Not featured on homepage"}</span>
            </div>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button className="bp" disabled={saving} onClick={()=>{ if(!modal.item.title){ toast_("Title required","error"); return; } saveBP(modal.item); }}>
              {saving?"Saving...":"Save Post"}
            </button>
            <button className="bs" onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
