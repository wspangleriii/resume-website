/* ================================
   STATE & SELECTORS
   ================================ */
const S = { view: null, data: null };
const ROLE_SLUG = window.ROLE_SLUG || null;   // used on role detail pages
const inDetailMode = !!ROLE_SLUG;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const els = {
  summary:   $("#summary-text"),
  location:  $("#location"),
  links:     $("#links"),
  skillsGrid: $("#skills-grid"),
  expList:   $("#experience-list"),
  year:      $("#year"),
  nameFoot:  $("#footer-name"),
  jsonld:    document.getElementById("ld+json"),
  contact:   $("#contact-slot"),
  // We intentionally do not wire any PDF button now (PDF downloads removed).
};

/* ================================
   HASH (deep links)
   ================================ */
function parseHash(){
  const raw = location.hash.slice(1);
  const p = new URLSearchParams(raw.includes("=") ? raw : `view=${raw}`);
  S.view = p.get("view") || null;
}
function updateHash(push = false){
  const p = new URLSearchParams();
  if (S.view) p.set("view", S.view);
  const h = p.toString();
  (push ? history.pushState : (u => (location.hash = u)))(null, "", h ? `#${h}` : "#");
}
addEventListener("hashchange", () => { parseHash(); renderAll(); });

/* ================================
   UTILITIES
   ================================ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso){
  if (!iso) return "";
  if (iso === "Present") return "Present";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function obfuscateEmail(email){
  const [u,h] = email.split("@");
  const disp = `${u} [at] ${h}`;
  const href = `mailto:${u.replaceAll(".","&#46;")}@${h}`;
  return { href, disp };
}
function tag(label){
  const s = document.createElement("span");
  s.className = "tag";
  s.textContent = label;
  return s;
}

/* ================================
   DATA LOADER
   ================================ */
async function loadData(){
  const path = inDetailMode ? "../resume.json" : "./resume.json";
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} loading resume.json`);
  S.data = await res.json();
  return S.data;
}

/* ================================
   BASIC DEV VALIDATION
   ================================ */
function devValidateBasic(){
  if (!(location.hostname === "localhost" || location.hostname === "127.0.0.1")) return;
  const d = S.data, errs = [];
  if (!d?.basics?.name) errs.push("Missing basics.name");
  if (!Array.isArray(d?.experience)) errs.push("experience must be an array");
  if (errs.length) console.warn("[resume.json warnings]", errs);
}

/* ================================
   RENDER BASICS & SUMMARY
   ================================ */
function renderBasics(){
  const b = S.data.basics || {};
  const nameEl = $("#site-name"); if (nameEl) nameEl.textContent = b.name || "";
  if (els.year) els.year.textContent = String(new Date().getFullYear());
  if (els.nameFoot) els.nameFoot.textContent = b.name || "";
  if (els.location) els.location.textContent = b.location || "";
  if (els.links){
    els.links.innerHTML = "";
    (b.links || []).forEach(l => {
      const a = document.createElement("a");
      a.href = l.url; a.target = "_blank"; a.rel = "me noopener";
      a.textContent = l.label;
      els.links.appendChild(a);
    });
  }
}
function renderSummary(){ if (els.summary) els.summary.textContent = S.data.summary || ""; }

/* ================================
   RENDER SKILLS
   ================================ */
function renderSkills(){
  const grid = els.skillsGrid; if (!grid) return;
  grid.innerHTML = "";
  (S.data.skills || []).forEach(cat => {
    const wrap = document.createElement("div"); wrap.className = "details";
    const det  = document.createElement("details");
    const sum  = document.createElement("summary"); sum.textContent = cat.category;
    const row  = document.createElement("div"); row.className = "chip-row"; row.style.marginTop = ".5rem";
    (cat.tags || []).forEach(t => row.appendChild(tag(t)));
    det.append(sum, row); wrap.appendChild(det); grid.appendChild(wrap);
  });
}

/* ================================
   EXPERIENCE (accordion)
   ================================ */
function detailsCard(item){
  const box = document.createElement("div"); box.className = "details";
  const det = document.createElement("details"); det.id = item.slug || "";

  // Summary (role + meta) with chevron
  const sum  = document.createElement("summary");
  const left = document.createElement("div"); left.className = "summary-title";
  const role = document.createElement("div"); role.className = "role"; role.textContent = item.role;
  const meta = document.createElement("div"); meta.className  = "org";
  const range = [fmtDate(item.start), (item.end === "Present" ? "Present" : fmtDate(item.end))]
                .filter(Boolean).join(" – ");
  meta.textContent = [item.company, item.location, range].filter(Boolean).join(" • ");
  left.append(role, meta);
  const caret = document.createElement("span"); caret.className = "caret"; caret.setAttribute("aria-hidden","true");
  sum.append(left, caret);

  // Body
  const inner = document.createElement("div"); inner.className = "stack small"; inner.style.marginTop = ".5rem";
  if (Array.isArray(item.highlights) && item.highlights.length){
    const ul = document.createElement("ul");
    item.highlights.forEach(h => { const li=document.createElement("li"); li.textContent=h; ul.appendChild(li); });
    inner.appendChild(ul);
  }
  if (item.summary){
    const p = document.createElement("p"); p.className = "context"; p.textContent = item.summary;
    inner.appendChild(p);
  }

  // Footer — tags only (no CTA)
  const footer = document.createElement("div"); footer.className = "footer-row";
  const tagsWrap = document.createElement("div"); tagsWrap.className = "chip-row";
  (item.tags || []).forEach(t => tagsWrap.appendChild(tag(t)));
  footer.appendChild(tagsWrap);

  det.append(sum, inner, footer); box.appendChild(det);
  return box;
}

/* ================================
   GENERIC ROLE ENHANCER (no charts)
   ================================ */
function enhanceGenericCard(cardEl, config) {
  const details = cardEl.querySelector("details");
  const stack   = details?.querySelector(".stack.small") || details;

  // Remove default content we don't want duplicated
  stack.querySelectorAll("ul, .context, .exp-summary, .kpi-strip, .skills-applied").forEach(n => n.remove());

  // Summary (1–2 sentences)
  if (config.summary) {
    const p = document.createElement("p");
    p.className = "exp-summary";
    p.textContent = config.summary;
    stack.appendChild(p);
  }

  // Key Functions (bolded lead + explanation)
  if (Array.isArray(config.functions) && config.functions.length) {
    const ul = document.createElement("ul");
    config.functions.forEach(f => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${f.bold}</strong> ${f.text}`;
      ul.appendChild(li);
    });
    stack.appendChild(ul);
  }

  // KPI tiles
  if (Array.isArray(config.kpis) && config.kpis.length) {
    const kpiStrip = document.createElement("div");
    kpiStrip.className = "kpi-strip";
    config.kpis.forEach(k => {
      const div = document.createElement("div");
      div.className = "kpi";
      div.innerHTML = `<div class="n">${k.n}</div><div class="t">${k.t}</div>`;
      kpiStrip.appendChild(div);
    });
    stack.appendChild(kpiStrip);
  }

  // Skills applied (unified footer row)
  const footer = cardEl.querySelector(".footer-row");
  if (footer) {
    footer.innerHTML = "";
    const skillsRow = document.createElement("div");
    skillsRow.className = "skills-applied";
    skillsRow.innerHTML = `<span class="skills-label">Skills applied:</span>`;
    const chips = document.createElement("div"); chips.className = "chip-row";
    (config.skills || []).forEach(t => {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = t;
      chips.appendChild(s);
    });
    skillsRow.appendChild(chips);
    footer.appendChild(skillsRow);
  }
}

/* ================================
   RENDER EXPERIENCE (apply enhancer)
   ================================ */
function renderExperience(){
  const root = els.expList; if (!root) return;
  root.innerHTML = "";
  let items = (S.data.experience || []);
  if (inDetailMode) items = items.filter(i => i.slug === ROLE_SLUG);

  items.forEach(i => {
    const cardEl = detailsCard(i);
    root.appendChild(cardEl);

    // Standardized, scannable snapshot for Head of Marketing
    if (i.slug === "mindful-care-head-of-marketing") {
      enhanceGenericCard(cardEl, {
        summary:
          "Built the marketing function and scaled multi-channel acquisition during multi-state expansion; supported Seed → Series B with rigorous performance and GTM execution.",
        functions: [
          { bold: "Directed multi-channel acquisition", text: "with seven-figure paid budgets across search, social, and programmatic to drive efficient pipeline growth." },
          { bold: "Launched GTM for new markets", text: "coordinating with operations to ensure capacity readiness and compliant service rollouts." },
          { bold: "Implemented CRM & automation", text: "establishing measurement, lead routing, and lifecycle workflows for full-funnel visibility." },
          { bold: "Built and led the team", text: "hiring 12+ marketers and managing agencies to deliver iterative creative, landing pages, and CRO improvements." },
          { bold: "Owned SEO/CRO & reporting", text: "publishing exec dashboards to track acquisition, conversion, and ROI." }
        ],
        kpis: [
          { n: "400%+", t: "revenue growth during tenure" },
          { n: "12+",   t: "internal team built (plus agencies)" },
          { n: "7",     t: "states launched (GTM support)" }
        ],
        skills: ["Growth", "Paid Search", "Paid Social", "SEO", "CRO", "Automation", "Attribution", "GTM", "Analytics"]
      });
    }

    // For other roles, leave default card for now (or call enhanceGenericCard with a role-specific config)
  });

  // Accordion: one open at a time; open first by default on homepage
  const all = Array.from(root.querySelectorAll("details"));
  all.forEach(d => d.addEventListener("toggle", () => { if (d.open) all.forEach(o => { if (o !== d) o.open = false; }); }));
  if (!inDetailMode && all[0]) all[0].open = true;
}

/* ================================
   CONTACT RENDERER
   ================================ */
function renderContact(){
  const slot = els.contact; if (!slot) return; slot.innerHTML = "";
  const m = S.data.meta || {}, b = S.data.basics || {};
  if ((m.contact || "mailto") === "mailto" && b.email){
    const { href, disp } = obfuscateEmail(b.email);
    const p = document.createElement("p"); p.innerHTML = `Email: <a href="${href}" rel="nofollow">${disp}</a>`;
    const a = document.createElement("a"); a.className = "btn"; a.href = href; a.rel = "nofollow"; a.textContent = "Email Me";
    slot.append(p, a);
  } else {
    slot.append(document.createTextNode("Contact method not configured."));
  }
}

/* ================================
   JSON-LD (Person)
   ================================ */
function injectJSONLD(){
  const b = S.data.basics || {};
  const ld = {
    "@context":"https://schema.org",
    "@type":"Person",
    "name": b.name,
    "description": b.tagline,
    "address": b.location,
    "email": b.email ? `mailto:${b.email}` : undefined,
    "url": "",                        // no PDF/resume URL
    "sameAs": (b.links || []).map(l => l.url)
  };
  if (els.jsonld) els.jsonld.textContent = JSON.stringify(ld, null, 2);
}

/* ================================
   NAV / SCROLL
   ================================ */
function wireControls(){
  $$("a[data-nav]").forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").replace("#", "");
      S.view = id; updateHash(true);
    });
  });
}
function handleDeepLinkScroll(){
  if (inDetailMode) return;
  if (S.view){
    const el = document.getElementById(S.view);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  }
}

/* ================================
   RENDER ALL + INIT
   ================================ */
function safe(name, fn){
  try { fn(); }
  catch(e){ console.error(`[Render error] ${name}`, e); throw new Error(`${name} failed: ${e.message}`); }
}
function renderAll(){
  safe("Basics",    renderBasics);
  safe("Summary",   renderSummary);
  safe("Skills",    renderSkills);
  safe("Experience",renderExperience);
  safe("Contact",   renderContact);
  safe("JSON-LD",   injectJSONLD);
  safe("Deep Link", handleDeepLinkScroll);

  if (inDetailMode){
    const role = (S.data.experience || []).find(i => i.slug === ROLE_SLUG);
    if (role) document.title = `Wes Spangler — ${role.role}`;
  }
}

(async function init(){
  parseHash(); wireControls();
  try{
    await loadData(); devValidateBasic(); renderAll();
  }catch(e){
    const msg = e?.message || "Could not load content.";
    const main = $("#main");
    if (main) main.innerHTML = `<section class="card"><h2>Oops</h2><p>${msg}</p></section>`;
  }
})();
