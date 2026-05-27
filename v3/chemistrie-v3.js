/* CHEMISTRIE v3 — Concierge interactions */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Lenis smooth scroll */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (lenis && window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Nav scroll state */
  const nav = $("#conNav");
  if (nav) {
    const onS = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onS, { passive: true });
    onS();
  }

  /* Reveal — IntersectionObserver (fires for in-view elements at load) */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    $$(".r").forEach((el) => io.observe(el));
  } else {
    $$(".r").forEach((el) => el.classList.add("is-in"));
  }

  if (window.gsap && window.ScrollTrigger) {

    /* Hero text reveal */
    gsap.from(".cin-hero__eyebrow", { opacity: 0, y: 20, duration: 1, ease: "power2.out", delay: 0.1 });
    gsap.from(".cin-hero__row > *", { opacity: 0, y: 20, duration: 1, ease: "power2.out", delay: 1.0, stagger: 0.15 });

    /* Hero bottle parallax */
    gsap.to(".cin-hero__bg svg", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: { trigger: ".cin-hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ──────── 03 · Skin Quiz ──────── */
  const summaries = {
    cleanseFor: {
      dry: "a milky cleanse that does not strip",
      oily: "a low-foam botanical cleanse for daily use",
      sensitive: "the Velvet Milk, fragrance-free and warm",
      combination: "a foaming cleanse with a softer evening rinse",
    },
    treatFor: {
      lines: "the Renewal Serum N°01 at 0.05% retinaldehyde",
      tone: "the Vitamin C Elixir N°02 with ferulic acid",
      texture: "the Clarifying Tonic at 8% mandelic, twice weekly",
      all: "a layered Renewal + Vitamin C protocol",
    },
    sealFor: {
      minutes: "the Velvet Cream, twice nightly",
      ritual: "Velvet Cream sealed with two drops of Golden Oil",
      gentle: "Calendula Balm for the seal",
      prescriptive: "Velvet Cream with the printed protocol card",
    },
  };

  $$(".quiz__options").forEach((group) => {
    group.addEventListener("click", (e) => {
      const opt = e.target.closest(".quiz__opt");
      if (!opt) return;
      $$(".quiz__opt", group).forEach((o) => o.classList.remove("is-selected"));
      opt.classList.add("is-selected");
      updateQuizResult();
    });
  });

  function updateQuizResult() {
    const sel1 = $(".quiz__options[data-step='1'] .quiz__opt.is-selected");
    const sel2 = $(".quiz__options[data-step='2'] .quiz__opt.is-selected");
    const sel3 = $(".quiz__options[data-step='3'] .quiz__opt.is-selected");
    const summary = $("#quizSummary");
    if (!summary) return;
    if (sel1 && sel2 && sel3) {
      const v1 = sel1.dataset.value, v2 = sel2.dataset.value, v3 = sel3.dataset.value;
      summary.innerHTML = `For her: ${summaries.cleanseFor[v1] || "a quiet cleanse"}, followed by ${summaries.treatFor[v2] || "the Renewal Serum"}, sealed with ${summaries.sealFor[v3] || "the Velvet Cream"}. A pharmacist will hand-sign your protocol card.`;
    }
  }

  /* ──────── 04 · Before / After Slider ──────── */
  const frame = $("#compareFrame");
  if (frame) {
    let dragging = false;

    function setPos(clientX) {
      const rect = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = (x / rect.width) * 100;
      frame.style.setProperty("--pos", pct + "%");
      frame.style.setProperty("--clip", (100 - pct) + "%");
    }

    frame.addEventListener("mousedown", (e) => { dragging = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener("mousemove", (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener("mouseup", () => { dragging = false; });

    frame.addEventListener("touchstart", (e) => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener("touchmove", (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener("touchend", () => { dragging = false; });

    /* small intro animation on enter view */
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: frame,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const obj = { v: 50 };
          gsap.to(obj, {
            v: 30, duration: 1.4, ease: "power2.inOut",
            onUpdate: () => {
              frame.style.setProperty("--pos", obj.v + "%");
              frame.style.setProperty("--clip", (100 - obj.v) + "%");
            },
            onComplete: () => {
              gsap.to(obj, {
                v: 70, duration: 1.4, ease: "power2.inOut",
                onUpdate: () => {
                  frame.style.setProperty("--pos", obj.v + "%");
                  frame.style.setProperty("--clip", (100 - obj.v) + "%");
                },
                onComplete: () => {
                  gsap.to(obj, {
                    v: 50, duration: 0.9, ease: "power2.out",
                    onUpdate: () => {
                      frame.style.setProperty("--pos", obj.v + "%");
                      frame.style.setProperty("--clip", (100 - obj.v) + "%");
                    },
                  });
                },
              });
            },
          });
        },
      });
    }
  }

  /* ──────── 05 · Ritual Builder ──────── */
  const board = $("#builderBoard");
  if (board) {
    board.addEventListener("click", (e) => {
      const pick = e.target.closest(".builder__pick");
      if (!pick) return;
      const slot = pick.closest(".builder__slot");
      $$(".builder__pick", slot).forEach((p) => p.classList.remove("is-selected"));
      pick.classList.add("is-selected");
      updateBuilderTotals();
    });
    updateBuilderTotals();
  }

  function updateBuilderTotals() {
    const sels = $$(".builder__pick.is-selected");
    if (sels.length === 0) return;
    let full = 0;
    const names = [];
    sels.forEach((s) => {
      full += parseInt(s.dataset.price || 0, 10);
      const n = s.querySelector(".builder__pick-info h4");
      if (n) names.push(n.textContent);
    });
    const discounted = Math.round(full * 0.85);
    const saved = full - discounted;
    const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setText("#builderFull", "$" + full);
    setText("#builderPrice", "$" + discounted);
    setText("#builderSavings", "$" + saved);
    setText("#builderNames", names.join(" · "));
  }

  /* ──────── 06 · Drop Countdown ──────── */
  const target = new Date();
  target.setDate(target.getDate() + 14);
  target.setHours(target.getHours() + 8);
  target.setMinutes(target.getMinutes() + 22);
  target.setSeconds(target.getSeconds() + 41);

  function tickClock() {
    const now = new Date();
    let diff = Math.max(0, target - now) / 1000;
    const d = Math.floor(diff / 86400); diff -= d * 86400;
    const h = Math.floor(diff / 3600);  diff -= h * 3600;
    const m = Math.floor(diff / 60);    diff -= m * 60;
    const s = Math.floor(diff);
    const pad = (n) => String(n).padStart(2, "0");
    const set = (unit, val) => {
      const el = document.querySelector(`.drop__time-n[data-unit="${unit}"]`);
      if (el) el.textContent = pad(val);
    };
    set("days", d);
    set("hours", h);
    set("minutes", m);
    set("seconds", s);
    const hero = $("#heroCountdown");
    if (hero) hero.textContent = `${d}d ${pad(h)}h`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ──────── 07 · Booking ──────── */
  const cal = $(".book__cal-grid");
  if (cal) {
    cal.addEventListener("click", (e) => {
      const day = e.target.closest(".book__day");
      if (!day || day.classList.contains("is-disabled") || day.classList.contains("is-other")) return;
      $$(".book__day.is-selected", cal).forEach((d) => d.classList.remove("is-selected"));
      day.classList.add("is-selected");
    });
  }
  const slots = $("#bookSlots");
  if (slots) {
    slots.addEventListener("click", (e) => {
      const slot = e.target.closest(".book__slot");
      if (!slot || slot.classList.contains("is-taken")) return;
      $$(".book__slot.is-selected", slots).forEach((s) => s.classList.remove("is-selected"));
      slot.classList.add("is-selected");
      const t = slot.textContent.trim();
      const meta = $(".book__confirm-meta");
      if (meta) {
        const day = $(".book__day.is-selected");
        const dayNum = day ? day.textContent.trim() : "31";
        meta.innerHTML = `You — with <strong>Dr. M</strong>, Sat ${dayNum} May at <strong>${t} CT</strong>.`;
      }
    });
  }

  /* ──────── Anchor scroll ──────── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(tgt, { offset: -80, duration: 1.4 });
      else tgt.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
