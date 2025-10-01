/* =============================================================
   Resume experience renderer
   ============================================================= */
const S = { view: null, data: null };
const ROLE_SLUG = window.ROLE_SLUG || null;
const inDetailMode = Boolean(ROLE_SLUG);

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const els = {
  summary:    $("#summary-text"),
  location:   $("#location"),
  links:      $("#links"),
  skillsGrid: $("#skills-grid"),
  expList:    $("#experience-list"),
  year:       $("#year"),
  nameFoot:   $("#footer-name"),
  jsonld:     document.getElementById("ld+json"),
  contact:    $("#contact-slot")
};

/* =============================================================
   Deep link helpers
   ============================================================= */
function parseHash() {
  const raw = location.hash.slice(1);
  const params = new URLSearchParams(raw.includes("=") ? raw : `view=${raw}`);
  S.view = params.get("view") || null;
}

function updateHash(push = false) {
  const params = new URLSearchParams();
  if (S.view) params.set("view", S.view);
  const hash = params.toString();
  const go = push ? history.pushState.bind(history) : ((_, __, h) => { location.hash = h; });
  go(null, "", hash ? `#${hash}` : "#");
}

addEventListener("hashchange", () => {
  parseHash();
  renderAll();
});

/* =============================================================
   Utilities
   ============================================================= */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso) {
  if (!iso) return "";
  if (iso === "Present") return "Present";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function obfuscateEmail(email) {
  const [user, host] = email.split("@");
  const display = `${user} [at] ${host}`;
  const href = `mailto:${user.replaceAll(".", "&#46;")}@${host}`;
  return { href, display };
}

function makeTag(label) {
  const el = document.createElement("span");
  el.className = "tag";
  el.textContent = label;
  return el;
}

function makeMetaPill(text, icon) {
  if (!text) return null;
  const pill = document.createElement("span");
  pill.className = "meta-pill";

  if (icon) {
    const glyph = document.createElement("span");
    glyph.className = "pill-icon";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = icon;
    pill.appendChild(glyph);
  }

  const copy = document.createElement("span");
  copy.className = "pill-text";
  copy.textContent = text;
  pill.appendChild(copy);

  return pill;
}

/* =============================================================
   Data loader & validation
   ============================================================= */
async function loadData() {
  const path = inDetailMode ? "../resume.json" : "./resume.json";
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} loading resume.json`);
  const json = await res.json();
  S.data = json;
  return json;
}

function devValidateBasic() {
  if (!(location.hostname === "localhost" || location.hostname === "127.0.0.1")) return;
  const d = S.data;
  const errs = [];
  if (!d?.basics?.name) errs.push("Missing basics.name");
  if (!Array.isArray(d?.experience)) errs.push("experience must be an array");
  if (errs.length) console.warn("[resume.json warnings]", errs);
}

/* =============================================================
   Render basics & summary
   ============================================================= */
function renderBasics() {
  const basics = S.data.basics || {};
  const name = $("#site-name");
  if (name) name.textContent = basics.name || "";
  if (els.year) els.year.textContent = String(new Date().getFullYear());
  if (els.nameFoot) els.nameFoot.textContent = basics.name || "";
  if (els.location) els.location.textContent = basics.location || "";

  if (els.links) {
    els.links.innerHTML = "";
    (basics.links || []).forEach(link => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "me noopener";
      a.textContent = link.label;
      els.links.appendChild(a);
    });
  }
}

function renderSummary() {
  if (els.summary) els.summary.textContent = S.data.summary || "";
}

/* =============================================================
   Render skills
   ============================================================= */
function renderSkills() {
  const grid = els.skillsGrid;
  if (!grid) return;
  grid.innerHTML = "";

  (S.data.skills || []).forEach(category => {
    const wrapper = document.createElement("div");
    wrapper.className = "details";

    const det = document.createElement("details");
    const sum = document.createElement("summary");
    sum.textContent = category.category;

    const chipRow = document.createElement("div");
    chipRow.className = "chip-row";
    chipRow.style.marginTop = ".5rem";

    (category.tags || []).forEach(t => chipRow.appendChild(makeTag(t)));

    det.append(sum, chipRow);
    wrapper.appendChild(det);
    grid.appendChild(wrapper);
  });
}

/* =============================================================
   Experience cards
   ============================================================= */
function detailsCard(item) {
  const card = document.createElement("div");
  card.className = "details";

  const det = document.createElement("details");
  det.id = item.slug || "";

  const summary = document.createElement("summary");
  const left = document.createElement("div");
  left.className = "summary-title";

  const role = document.createElement("div");
  role.className = "role";
  role.textContent = item.role;
  left.appendChild(role);

  const meta = document.createElement("div");
  meta.className = "summary-meta";
  const range = [fmtDate(item.start), item.end === "Present" ? "Present" : fmtDate(item.end)]
    .filter(Boolean)
    .join(" – ");

  [
    makeMetaPill(item.company, "🏢"),
    makeMetaPill(item.location, "📍"),
    makeMetaPill(range, "🗓")
  ].filter(Boolean).forEach(pill => meta.appendChild(pill));

  if (meta.children.length) left.appendChild(meta);

  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");

  summary.append(left, caret);

  const body = document.createElement("div");
  body.className = "stack small";
  body.style.marginTop = ".5rem";

  if (Array.isArray(item.highlights) && item.highlights.length) {
    const ul = document.createElement("ul");
    item.highlights.forEach(point => {
      const li = document.createElement("li");
      li.textContent = point;
      ul.appendChild(li);
    });
    body.appendChild(ul);
  }

  if (item.summary) {
    const p = document.createElement("p");
    p.className = "context";
    p.textContent = item.summary;
    body.appendChild(p);
  }

  const footer = document.createElement("div");
  footer.className = "footer-row";
  const tags = document.createElement("div");
  tags.className = "chip-row";
  (item.tags || []).forEach(t => tags.appendChild(makeTag(t)));
  footer.appendChild(tags);

  det.append(summary, body, footer);
  card.appendChild(det);
  return card;
}

function enhanceGenericCard(cardEl, config) {
  const details = cardEl.querySelector("details");
  const stack = details?.querySelector(".stack.small") || details;

  stack.querySelectorAll("ul, .context, .exp-summary, .kpi-strip, .skills-applied").forEach(node => node.remove());

  if (config.summary) {
    const summary = document.createElement("p");
    summary.className = "exp-summary";
    summary.textContent = config.summary;
    stack.appendChild(summary);
  }

  if (Array.isArray(config.functions) && config.functions.length) {
    const ul = document.createElement("ul");
    config.functions.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.bold}</strong> ${item.text}`;
      ul.appendChild(li);
    });
    stack.appendChild(ul);
  }

  if (Array.isArray(config.kpis) && config.kpis.length) {
    const strip = document.createElement("div");
    strip.className = "kpi-strip";
    config.kpis.forEach(kpi => {
      const tile = document.createElement("div");
      tile.className = "kpi";
      tile.innerHTML = `<div class="n">${kpi.n}</div><div class="t">${kpi.t}</div>`;
      strip.appendChild(tile);
    });
    stack.appendChild(strip);
  }

  const footer = cardEl.querySelector(".footer-row");
  if (footer) {
    footer.innerHTML = "";

    const skillsRow = document.createElement("div");
    skillsRow.className = "skills-applied";
    skillsRow.innerHTML = `<span class="skills-label">Skills applied:</span>`;

    const chips = document.createElement("div");
    chips.className = "chip-row";
    (config.skills || []).forEach(skill => chips.appendChild(makeTag(skill)));

    skillsRow.appendChild(chips);
    footer.appendChild(skillsRow);
  }
}

function renderExperience() {
  const root = els.expList;
  if (!root) return;
  root.innerHTML = "";

  let items = S.data.experience || [];
  if (inDetailMode) items = items.filter(item => item.slug === ROLE_SLUG);

  items.forEach(item => {
    const card = detailsCard(item);
    root.appendChild(card);

    if (item.slug === "mindful-care-head-of-marketing") {
      enhanceGenericCard(card, {
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
  });

  const all = Array.from(root.querySelectorAll("details"));
  all.forEach(d => d.addEventListener("toggle", () => {
    if (!d.open) return;
    all.forEach(other => { if (other !== d) other.open = false; });
  }));

  if (!inDetailMode && all[0]) all[0].open = true;
}

/* =============================================================
   Contact & structured data
   ============================================================= */
function renderContact() {
  const slot = els.contact;
  if (!slot) return;
  slot.innerHTML = "";

  const meta = S.data.meta || {};
  const basics = S.data.basics || {};

  if ((meta.contact || "mailto") === "mailto" && basics.email) {
    const { href, display } = obfuscateEmail(basics.email);

    const p = document.createElement("p");
    p.innerHTML = `Email: <a href="${href}" rel="nofollow">${display}</a>`;

    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.rel = "nofollow";
    a.textContent = "Email Me";

    slot.append(p, a);
  } else {
    slot.append(document.createTextNode("Contact method not configured."));
  }
}

function injectJSONLD() {
  const basics = S.data.basics || {};
  const ld = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": basics.name,
    "description": basics.tagline,
    "address": basics.location,
    "email": basics.email ? `mailto:${basics.email}` : undefined,
    "url": "",
    "sameAs": (basics.links || []).map(l => l.url)
  };

  if (els.jsonld) els.jsonld.textContent = JSON.stringify(ld, null, 2);
}

/* =============================================================
   Navigation helpers
   ============================================================= */
function wireControls() {
  $$('a[data-nav]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const id = anchor.getAttribute('href').replace('#', '');
      S.view = id;
      updateHash(true);
    });
  });
}

function handleDeepLinkScroll() {
  if (inDetailMode) return;
  if (!S.view) return;
  const el = document.getElementById(S.view);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =============================================================
   Render orchestration
   ============================================================= */
function safe(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[Render error] ${name}`, err);
    throw new Error(`${name} failed: ${err.message}`);
  }
}

function renderAll() {
  safe("Basics", renderBasics);
  safe("Summary", renderSummary);
  safe("Skills", renderSkills);
  safe("Experience", renderExperience);
  safe("Contact", renderContact);
  safe("JSON-LD", injectJSONLD);
  safe("Deep Link", handleDeepLinkScroll);

  if (inDetailMode) {
    const match = (S.data.experience || []).find(item => item.slug === ROLE_SLUG);
    if (match) document.title = `Wes Spangler — ${match.role}`;
  }
}

(async function init() {
  parseHash();
  wireControls();
  try {
    await loadData();
    devValidateBasic();
    renderAll();
  } catch (err) {
    const msg = err?.message || "Could not load content.";
    const main = $("#main");
    if (main) main.innerHTML = `<section class="card"><h2>Oops</h2><p>${msg}</p></section>`;
  }
})();
