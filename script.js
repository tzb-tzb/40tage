
(() => {
  const START = new Date(2026, 7, 23); // 23.08.2026, lokale Zeit
  START.setHours(0,0,0,0);
  const TOTAL = 40;

  const $ = (id) => document.getElementById(id);
  const beforeStart = $("beforeStart");
  const todayCard = $("todayCard");
  const gallerySection = $("gallerySection");
  const finishedCard = $("finishedCard");
  const progressBar = $("progressBar");
  const progressText = $("progressText");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((today - START) / 86400000);
  let unlocked = diffDays + 1;
  if (unlocked < 0) unlocked = 0;
  if (unlocked > TOTAL) unlocked = TOTAL;

  progressBar.style.width = `${(unlocked / TOTAL) * 100}%`;
  progressText.textContent = unlocked === 0
    ? "Noch nicht gestartet"
    : `${unlocked} von ${TOTAL} Erinnerungen geöffnet`;

  if (today < START) {
    beforeStart.classList.remove("hidden");
    const ms = START - today;
    const days = Math.ceil(ms / 86400000);
    $("countdownText").textContent = days === 1
      ? "Morgen geht es los."
      : `Noch ${days} Tage bis zur ersten Überraschung.`;
    return;
  }

  const currentDay = Math.min(unlocked, TOTAL);
  renderToday(currentDay);
  renderGallery(unlocked);

  if (unlocked >= TOTAL) finishedCard.classList.remove("hidden");

  function imagePath(day) {
    return `bilder/tag${String(day).padStart(2,"0")}.jpg`;
  }

  function renderToday(day) {
    todayCard.classList.remove("hidden");
    const item = window.KALENDER_TEXTE[day - 1];
    $("dayPill").textContent = `Tag ${day} von ${TOTAL}`;
    $("todayTitle").textContent = item.titel;
    $("todayText").textContent = item.text;

    const img = $("todayImage");
    const fallback = $("imageFallback");
    $("fallbackName").textContent = imagePath(day);
    img.src = imagePath(day);
    img.onload = () => {
      img.classList.remove("hidden");
      fallback.classList.add("hidden");
    };
    img.onerror = () => {
      img.classList.add("hidden");
      fallback.classList.remove("hidden");
    };

    if (day === 1) {
      $("giftBox").classList.remove("hidden");
      $("homeHint").classList.remove("hidden");
    }
  }

  function renderGallery(count) {
    if (count <= 0) return;
    gallerySection.classList.remove("hidden");
    $("galleryHint").textContent = count < TOTAL
      ? "Jeden Tag kommt eine weitere Erinnerung dazu."
      : "Alle 40 Erinnerungen sind jetzt geöffnet.";

    const gallery = $("gallery");
    gallery.innerHTML = "";
    for (let day = 1; day <= count; day++) {
      const item = window.KALENDER_TEXTE[day - 1];
      const card = document.createElement("button");
      card.className = "gallery-item";
      card.type = "button";
      card.setAttribute("aria-label", `Tag ${day}: ${item.titel}`);

      const img = document.createElement("img");
      img.src = imagePath(day);
      img.alt = `Erinnerungsfoto Tag ${day}`;

      const label = document.createElement("span");
      label.className = "gallery-label";
      label.textContent = `Tag ${day}`;

      const missing = document.createElement("div");
      missing.className = "gallery-missing hidden";
      missing.textContent = `Foto ${String(day).padStart(2,"0")} fehlt`;

      img.onload = () => { img.classList.remove("hidden"); missing.classList.add("hidden"); };
      img.onerror = () => { img.classList.add("hidden"); missing.classList.remove("hidden"); };

      card.append(img, missing, label);
      card.addEventListener("click", () => openLightbox(day, item));
      gallery.appendChild(card);
    }
  }

  function openLightbox(day, item) {
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Schließen">×</button>
      <div class="lightbox-inner">
        <img src="${imagePath(day)}" alt="Erinnerungsfoto Tag ${day}">
        <div class="lightbox-caption">
          <strong>Tag ${day} · ${escapeHtml(item.titel)}</strong>
          <div>${escapeHtml(item.text)}</div>\n          <div class="lightbox-quote">“${escapeHtml(item.zitat)}”</div>
        </div>
      </div>`;
    overlay.querySelector(".lightbox-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.addEventListener("keydown", function esc(e){
      if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", esc); }
    });
    document.body.appendChild(overlay);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[ch]);
  }
})();
