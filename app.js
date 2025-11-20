/* =============================================================================
   Wes Spangler — Resume Site (Final v9)
   ============================================================================= */

const S = { view: null, data: null };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const els = {
  summary: $("#summary-text"),
  summaryMeta: $("#basics-meta"),
  highlightsList: $("#highlights-list"),
  skillsGrid: $("#skills-grid"),
  expList: $("#experience-list"),
  earlyCareerList: $("#early-career-list"),
  year: $("#year"),
  nameFoot: $("#footer-name"),
  jsonld: document.getElementById("ld+json"),
  contact: $("#contact-slot"),
  toast: $("#toast")
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* --- ICONS --- */
const ICONS = {
  map: `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  link: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
  github: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.68 9.68 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`,
  caret: `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6 6 1.41-1.41z"/></svg>`,
  email: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
  
  // Experience Role Icons
  globe: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  health: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  activity: `<svg viewBox="0 0 24 24"><path d="M19 13c.7 0 1.37.13 1.97.35l1.3-1.52c-.91-.55-2-1-3.27-1-1.95 0-3.63 1.01-4.66 2.52l-1.1-1.84-.85.5c.24.38.49.75.74 1.13.37.58.72 1.15.98 1.76 1.12 2.67 1.31 4.44 1.34 5.09h2.01c-.06-1.35-.32-2.95-1.24-5.25C16.86 13.73 17.86 13 19 13zM8 11l4.34 1.45-1.03 2.91-2.15-.72L12.02 22h-2.1l-1.85-5.2L3.9 18.3l-.6-1.79 9.45-3.2zM7.5 3C9.43 3 11 4.57 11 6.5S9.43 10 7.5 10 4 8.43 4 6.5 5.57 3 7.5 3z"/></svg>`
};

/* --- UTILS --- */
function fmtDate(iso) {
  if (!iso || iso === "Present") return "Present";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function getRoleIcon(slug) {
  // Select icon based on slug/keywords
  if (slug.includes("consultant") || slug.includes("freelance")) return ICONS.globe;
  if (slug.includes("metro")) return ICONS.activity;
  return ICONS.health; // Default for Mindful Care
}

function createEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
}

function createTag(label) {
  return createEl("span", "tag", label);
}

function showToast(msg) {
  const t = els.toast;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

/* --- DATA --- */
async function loadData() {
  const res = await fetch("./resume.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load resume data");
  S.data = await res.json();
  return S.data;
}

/* --- SCROLL SPY --- */
function setupScrollSpy() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        $$("nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
      }
    });
  }, { threshold: 0.3 });
  $$("section[id]").forEach(sec => observer.observe(sec));
}

/* --- RENDERERS --- */
function renderBasics() {
  const b = S.data.basics || {};
  $("#site-name").textContent = b.name || "";
  if (els.year) els.year.textContent = new Date().getFullYear();
  if (els.nameFoot) els.nameFoot.textContent = b.name;

  const meta = els.summaryMeta;
  meta.innerHTML = "";
  if (b.location) {
    const loc = createEl("div", "icon-link");
    loc.innerHTML = `${ICONS.map} <span>${b.location}</span>`;
    meta.appendChild(loc);
  }
  (b.links || []).forEach(l => {
    const a = createEl("a", "icon-link", "");
    a.href = l.url; a.target = "_blank"; a.rel = "me noopener";
    let icon = ICONS.link;
    if (l.label.toLowerCase().includes("linkedin")) icon = ICONS.linkedin;
    if (l.label.toLowerCase().includes("github")) icon = ICONS.github;
    a.innerHTML = `${icon} <span>${l.label}</span>`;
    meta.appendChild(a);
  });
}

function renderSummary() {
  if (els.summary) els.summary.textContent = S.data.summary || "";
}

/* --- SEGMENTED HIGHLIGHTS (Collapsible) --- */
function renderHighlights() {
  const root = els.highlightsList;
  if (!root || !S.data.highlight_categories) return;
  root.innerHTML = "";

  S.data.highlight_categories.forEach((cat, index) => {
    const card = createEl("details", "skill-card"); // Reusing skill-card styles for accordions
    if (index === 0) card.open = true;

    const header = createEl("summary", "skill-header");
    header.innerHTML = `<span>${cat.title}</span> <span class="caret">${ICONS.caret}</span>`;

    const body = createEl("div", "skill-body");
    // Create the 3-column grid inside the accordion
    const innerGrid = createEl("div", "grid-3");
    innerGrid.style.width = "100%"; // Ensure grid takes full width

    cat.items.forEach(item => {
      const highlight = createEl("div", "highlight-card");
      highlight.innerHTML = `
        <div>
          <div class="highlight-stat">${item.stat}</div>
          <div class="highlight-org">${item.org}</div>
          <div class="highlight-title">${item.title}</div>
          <div class="highlight-desc">${item.desc}</div>
        </div>
      `;
      innerGrid.appendChild(highlight);
    });

    body.appendChild(innerGrid);
    card.append(header, body);
    root.appendChild(card);
  });

  // Logic to close others
  const allAccordions = Array.from(root.querySelectorAll("details"));
  allAccordions.forEach(d => {
    d.addEventListener("toggle", () => {
      if (d.open) allAccordions.forEach(o => { if (o !== d) o.open = false; });
    });
  });
}

function renderSkills() {
  const grid = els.skillsGrid;
  if (!grid) return;
  grid.innerHTML = "";
  
  (S.data.skills || []).forEach((cat, index) => {
    const card = createEl("details", "skill-card");
    if (index === 0) card.open = true;

    const header = createEl("summary", "skill-header");
    header.innerHTML = `<span>${cat.category}</span> <span class="caret">${ICONS.caret}</span>`;
    
    const body = createEl("div", "skill-body");
    (cat.tags || []).forEach(t => body.appendChild(createTag(t)));
    
    card.append(header, body);
    grid.appendChild(card);
  });

  const allSkills = Array.from(grid.querySelectorAll("details"));
  allSkills.forEach(d => {
    d.addEventListener("toggle", () => {
      if (d.open) allSkills.forEach(o => { if (o !== d) o.open = false; });
    });
  });
}

function renderExperienceCard(item) {
  const box = createEl("div", "details");
  const det = createEl("details");
  det.id = item.slug || "";

  const sum = createEl("summary");
  const headerGrid = createEl("div", "exp-header");
  
  // REPLACED initials with Icon Logic
  const avatar = createEl("div", "company-avatar");
  // Use white text for icons, slightly transparent bg
  avatar.style.background = "var(--surface)"; 
  avatar.style.color = "var(--primary)";
  avatar.innerHTML = getRoleIcon(item.slug);
  
  const titleBlock = createEl("div", "exp-title-block");
  titleBlock.append(createEl("div", "role", item.role));
  const company = createEl("div", "company-line");
  company.innerHTML = `<span>${item.company}</span> <span class="dot">•</span> <span>${item.location}</span>`;
  titleBlock.append(company);

  const metaBlock = createEl("div", "exp-meta");
  const start = fmtDate(item.start);
  const end = fmtDate(item.end);
  const isPresent = end === "Present";
  const datePill = createEl("div", `date-pill ${isPresent ? "present" : ""}`, `${start} – ${end}`);
  const caret = createEl("div", "caret");
  caret.innerHTML = ICONS.caret;

  metaBlock.append(datePill, caret);
  headerGrid.append(avatar, titleBlock, metaBlock);
  sum.appendChild(headerGrid);

  const body = createEl("div", "exp-body");
  if (item.summary) body.appendChild(createEl("p", "exp-summary", item.summary));

  if (item.kpis && item.kpis.length) {
    const kpiStrip = createEl("div", "kpi-strip");
    item.kpis.forEach(k => {
      const kEl = createEl("div", "kpi");
      kEl.innerHTML = `<span class="n">${k.value}</span><span class="t">${k.label}</span>`;
      kpiStrip.appendChild(kEl);
    });
    body.appendChild(kpiStrip);
  }

  if (item.highlights) {
    const ul = createEl("ul");
    item.highlights.forEach(h => ul.appendChild(createEl("li", "", h)));
    body.appendChild(ul);
  }

  if (item.tags && item.tags.length) {
    const footer = createEl("div", "footer-row");
    footer.innerHTML = `<span class="skills-label">Skills:</span>`;
    item.tags.forEach(t => footer.appendChild(createTag(t)));
    body.appendChild(footer);
  }

  det.append(sum, body);
  box.appendChild(det);
  return box;
}

function renderExperience() {
  const root = els.expList;
  if (!root) return;
  root.innerHTML = "";
  (S.data.experience || []).forEach(item => root.appendChild(renderExperienceCard(item)));

  const allDetails = $$("details", root);
  allDetails.forEach(d => {
    d.addEventListener("toggle", () => {
      if (d.open) allDetails.forEach(o => { if (o !== d) o.open = false; });
    });
  });
  if (allDetails[0]) allDetails[0].open = true;
}

function renderEarlyCareer() {
  const list = els.earlyCareerList;
  if (!list || !S.data.early_career) return;
  list.innerHTML = "";
  S.data.early_career.forEach(item => {
    const row = createEl("div", "compact-item");
    row.innerHTML = `
      <div class="compact-details">
        <span class="compact-role">${item.role}</span>
        <span class="dot">·</span>
        <span class="compact-company">${item.company}</span>
      </div>
      <div class="compact-year">${item.year}</div>
    `;
    list.appendChild(row);
  });
}

function renderContact() {
  const slot = els.contact;
  if (!slot) return;
  slot.innerHTML = "";
  const b = S.data.basics || {};
  
  if (b.email) {
    const [u, h] = b.email.split("@");
    const fullEmail = `${u}@${h}`;
    const disp = `${u} [at] ${h}`;

    const p = createEl("p");
    p.style.marginBottom = "1.5rem";
    p.style.fontSize = "1.1rem";
    p.innerHTML = `Email: <strong style="color:var(--text)">${disp}</strong>`;
    
    const btnRow = createEl("div", "", "");
    btnRow.style.display = "flex";
    btnRow.style.gap = "1rem";
    btnRow.style.flexWrap = "wrap";

    const btnMail = createEl("a", "btn primary", "");
    btnMail.href = `mailto:${fullEmail}`;
    btnMail.innerHTML = `${ICONS.email} <span>Send Email</span>`;

    const btnCopy = createEl("button", "btn secondary", "");
    btnCopy.innerHTML = `${ICONS.copy} <span>Copy</span>`;
    
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(fullEmail).then(() => {
        showToast("Email copied to clipboard!");
        const original = btnCopy.innerHTML;
        btnCopy.innerHTML = `<span>Copied!</span>`;
        btnCopy.style.borderColor = "var(--success)";
        btnCopy.style.color = "var(--success)";
        setTimeout(() => {
          btnCopy.innerHTML = original;
          btnCopy.style.borderColor = "";
          btnCopy.style.color = "";
        }, 2000);
      });
    });

    btnRow.append(btnMail, btnCopy);
    slot.append(p, btnRow);
  }
}

/* --- INIT --- */
async function init() {
  try {
    await loadData();
    renderBasics();
    renderSummary();
    renderHighlights();
    renderExperience();
    renderEarlyCareer();
    renderSkills();
    renderContact();
    setupScrollSpy();
    
    const hash = location.hash.slice(1).replace("view=", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 200);
    }

  } catch (e) {
    console.error(e);
    $("#main").innerHTML = `<p style="color:red; padding:2rem;">Error loading resume data.</p>`;
  }
}

init();