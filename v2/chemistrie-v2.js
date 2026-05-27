/* CHEMISTRIE v2 — editorial scroll & motion */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Lenis */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  if (!window.gsap) return;
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  if (lenis && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
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

  /* Hero title fade-in */
  const heroTitle = $(".mag-hero__title");
  if (heroTitle) {
    gsap.from(heroTitle, { opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.1 });
  }

  /* Hero photo parallax */
  if (window.ScrollTrigger) {
    gsap.to(".mag-hero__photo svg", {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: ".mag-hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* TOC — staggered row reveal as user scrolls through the list */
  if (window.ScrollTrigger) {
    gsap.from(".mag-toc__row", {
      opacity: 0, x: -20, duration: 0.9, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".mag-toc__list", start: "top 80%" },
    });
  }

  /* Anatomy — annotations fade in left/right with scroll */
  if (window.ScrollTrigger) {
    gsap.from(".mag-anatomy__notes--left .mag-anatomy__note", {
      opacity: 0, x: -40, duration: 1, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".mag-anatomy__board", start: "top 70%" },
    });
    gsap.from(".mag-anatomy__notes--right .mag-anatomy__note", {
      opacity: 0, x: 40, duration: 1, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".mag-anatomy__board", start: "top 70%" },
    });
    gsap.from(".mag-anatomy__bottle svg", {
      opacity: 0, y: 40, scale: 0.96, duration: 1.4, ease: "power3.out",
      scrollTrigger: { trigger: ".mag-anatomy__board", start: "top 75%" },
    });
    /* slight scroll-driven sway on the bottle */
    gsap.to(".mag-anatomy__bottle svg", {
      yPercent: -8, ease: "none",
      scrollTrigger: { trigger: ".mag-anatomy", start: "top bottom", end: "bottom top", scrub: 1 },
    });
  }

  /* Essay frames — alternating reveal */
  if (window.ScrollTrigger) {
    $$(".mag-essay__frame").forEach((f, i) => {
      gsap.from(f, {
        opacity: 0, y: 60, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: f, start: "top 85%" },
      });
      gsap.to(f.querySelector(".mag-essay__photo svg"), {
        yPercent: i % 2 ? 8 : -8,
        ease: "none",
        scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    });
  }

  /* Glossary index entries — cascade in */
  if (window.ScrollTrigger) {
    gsap.from(".mag-index__column", {
      opacity: 0, y: 30, duration: 1, ease: "power3.out", stagger: 0.15,
      scrollTrigger: { trigger: ".mag-index__columns", start: "top 80%" },
    });
  }

  /* Subscriber card — parallax tilt */
  if (window.ScrollTrigger) {
    gsap.fromTo(".mag-subscriber__card",
      { rotate: -8, y: 60, opacity: 0 },
      {
        rotate: -4, y: 0, opacity: 1,
        duration: 1.6, ease: "power3.out",
        scrollTrigger: { trigger: ".mag-subscriber", start: "top 70%" },
      });
  }

  /* Anchor scroll */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(tgt, { offset: -60, duration: 1.4 });
      else tgt.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

})();
