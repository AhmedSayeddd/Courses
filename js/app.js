// ── App Logic ────────────────────────────────────────────────
(function () {
  "use strict";

  const container = document.getElementById("courses-container");
  const overlay = document.getElementById("modal-overlay");
  const pills = document.querySelectorAll(".pill");
  if (!container) return;

  const icons = {
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`
  };
  const ll = ["", "Beginner", "Intermediate", "Advanced", "Expert", "Master"];

  // Language order & anchor IDs
  const langOrder = [
    { name: "C++", id: "cpp", featured: true },
    { name: "Python", id: "python" },
    { name: "JavaScript", id: "javascript" },
    { name: "Rust", id: "rust" },
    { name: "Java", id: "java" },
    { name: "SQL", id: "sql" }
  ];

  function buildCard(c, i) {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${c.title} curriculum`);
    card.style.setProperty("--card-color", c.color);
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon" style="background:${c.color}">${c.tag}</div>
        <span class="card-level" style="background:${c.bg};color:${c.color}">Lvl ${c.level} · ${ll[c.level]}</span>
      </div>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-desc">${c.desc}</p>
      <div class="card-topics">${c.topics.map(t => `<span class="topic-tag">${t}</span>`).join("")}</div>
      <div class="card-footer">
        <div class="card-meta">
          <span class="meta-item">${icons.clock} ${c.hours}h</span>
          <span class="meta-item">${icons.folder} ${c.projects} projects</span>
        </div>
        <span class="card-cta">View ${icons.arrow}</span>
      </div>`;
    card.addEventListener("click", () => openModal(c));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(c); }
    });
    return card;
  }

  function renderCourses(filter) {
    container.innerHTML = "";
    const langs = filter === "All" ? langOrder : langOrder.filter(l => l.name === filter);

    langs.forEach(lang => {
      const courses = COURSES.filter(c => c.lang === lang.name);
      if (!courses.length) return;

      const section = document.createElement("div");
      section.className = "lang-section" + (lang.featured ? " featured" : "");
      section.id = lang.id;

      const sample = courses[0];
      section.innerHTML = `
        <div class="lang-header">
          <div class="lang-icon" style="background:${sample.color}">${sample.tag}</div>
          <span class="lang-title">${lang.name}</span>
          ${lang.featured ? '<span class="featured-badge">★ FEATURED</span>' : ''}
          <span class="lang-count">${courses.length} level${courses.length > 1 ? 's' : ''} · ${courses.reduce((s, c) => s + c.hours, 0)} hours</span>
        </div>`;

      const grid = document.createElement("div");
      grid.className = "courses-grid";
      courses.forEach((c, i) => grid.appendChild(buildCard(c, i)));
      section.appendChild(grid);
      container.appendChild(section);
    });

    if (!container.children.length) {
      container.innerHTML = `<div class="empty-state"><p>No courses found</p><small>Try a different filter</small></div>`;
    }
  }

  // ── Modal ──
  function openModal(course) {
    const modal = overlay.querySelector(".modal");
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon" style="background:${course.color}">${course.tag}</div>
          <div class="modal-title-group">
            <div class="modal-title">${course.title}</div>
            <div class="modal-subtitle">${course.lang} · Level ${course.level} · ${ll[course.level]}</div>
          </div>
        </div>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-stats">
          <div class="stat-box"><div class="stat-value" style="color:${course.color}">${course.hours}</div><div class="stat-label">Hours</div></div>
          <div class="stat-box"><div class="stat-value" style="color:${course.color}">${course.projects}</div><div class="stat-label">Projects</div></div>
          <div class="stat-box"><div class="stat-value" style="color:${course.color}">${course.curriculum.length}</div><div class="stat-label">Lessons</div></div>
        </div>
        <div class="curriculum-label">Full Curriculum</div>
        <ol class="curriculum-list">
          ${course.curriculum.map((item, i) => `<li class="curriculum-item"><span class="curriculum-num">${String(i + 1).padStart(2, "0")}</span><span>${item}</span></li>`).join("")}
        </ol>
      </div>`;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
  }

  function closeModal() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("active")) closeModal(); });

  // ── Filters ──
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderCourses(pill.dataset.filter);
    });
  });

  // ── Init ──
  renderCourses("All");

  // Scroll to hash anchor on load
  if (window.location.hash) {
    setTimeout(() => {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }
})();
