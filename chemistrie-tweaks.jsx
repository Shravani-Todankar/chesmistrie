/* global React, ReactDOM, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakSlider, TweakToggle, useTweaks */

const CHEMISTRIE_TWEAKS = /*EDITMODE-BEGIN*/{
  "palette": ["#1a3a2d", "#6c8f7b", "#c8aa7a", "#f9f4ed"],
  "motion": "normal",
  "displayWeight": 400,
  "darkHero": false
}/*EDITMODE-END*/;

const PALETTES = [
  ["#1a3a2d", "#6c8f7b", "#c8aa7a", "#f9f4ed"], // forest-first (default)
  ["#0e2118", "#3d6b54", "#d4b481", "#f3ecdf"], // deeper forest
  ["#2d4a3c", "#8aab98", "#dec39a", "#fefaf4"], // lighter sage
  ["#1a3a2d", "#c8aa7a", "#6c8f7b", "#f9f4ed"], // tan-led
  ["#0b1f15", "#1a3a2d", "#c8aa7a", "#e8dcc4"], // moody
];

function applyPalette(p) {
  const r = document.documentElement.style;
  r.setProperty("--c-forest",   p[0]);
  r.setProperty("--c-forest-2", shade(p[0], -0.18));
  r.setProperty("--c-sage",     p[1]);
  r.setProperty("--c-sage-2",   shade(p[1], 0.15));
  r.setProperty("--c-sage-3",   mix(p[1], p[3], 0.82));
  r.setProperty("--c-tan",      p[2]);
  r.setProperty("--c-tan-2",    shade(p[2], -0.18));
  r.setProperty("--c-tan-3",    mix(p[2], p[3], 0.75));
  r.setProperty("--c-cream",    p[3]);
  r.setProperty("--c-cream-2",  shade(p[3], -0.04));
  r.setProperty("--c-paper",    shade(p[3], 0.02));
  r.setProperty("--c-ink",      p[0]);
  r.setProperty("--c-ink-soft", hexA(p[0], 0.7));
  r.setProperty("--c-ink-mute", hexA(p[0], 0.5));
  r.setProperty("--c-line",     hexA(p[0], 0.16));
  r.setProperty("--c-line-soft",hexA(p[0], 0.08));
  r.setProperty("--grad-deep",
    `linear-gradient(135deg, ${p[0]} 0%, ${shade(p[0], -0.2)} 55%, ${p[0]} 100%)`);
}

/* ── small color utils ── */
function hex2rgb(h) {
  const c = h.replace("#", "");
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}
function rgb2hex(r,g,b) {
  return "#" + [r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,"0")).join("");
}
function shade(h, pct) {
  const [r,g,b] = hex2rgb(h);
  const t = pct < 0 ? 0 : 255, p = Math.abs(pct);
  return rgb2hex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}
function mix(a, b, w) {
  const [r1,g1,b1] = hex2rgb(a), [r2,g2,b2] = hex2rgb(b);
  return rgb2hex(r1*(1-w)+r2*w, g1*(1-w)+g2*w, b1*(1-w)+b2*w);
}
function hexA(h, a) {
  const [r,g,b] = hex2rgb(h);
  return `rgba(${r},${g},${b},${a})`;
}

function applyMotion(m) {
  /* expose via CSS var so transitions etc can scale */
  const root = document.documentElement;
  if (m === "subtle") root.style.setProperty("--motion-scale", "0.45");
  else if (m === "dramatic") root.style.setProperty("--motion-scale", "1.6");
  else root.style.setProperty("--motion-scale", "1");

  /* GSAP global timeScale */
  if (window.gsap) {
    if (m === "subtle") window.gsap.globalTimeline.timeScale(1.7);
    else if (m === "dramatic") window.gsap.globalTimeline.timeScale(0.7);
    else window.gsap.globalTimeline.timeScale(1);
  }
}

function applyHeroLayout(layout) {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.dataset.layout = layout;
}

function applyBottleVisible(v) {
  const b = document.querySelector(".hero__bottle");
  if (b) b.style.display = v ? "" : "none";
}

function applyDisplayWeight(w) {
  document.documentElement.style.setProperty("--display-weight", w);
}

function applyDarkHero(dark) {
  const hero = document.querySelector(".hero");
  if (hero) hero.classList.toggle("hero--dark", dark);
  const util = document.querySelector(".utility-strip");
  if (util) util.style.background = dark ? "#0b1f15" : "";
}

function applyHeroTitleSize(size) {
  /* size is the vw multiplier (default 17 means 17vw) */
  document.documentElement.style.setProperty("--hero-title-vw", `${size}vw`);
}

/* inject inline overrides we control */
const styleEl = document.createElement("style");
styleEl.textContent = `
  .display-h, .pillar__num, .pillar__title, .ritual-step__num, .ritual-step h3,
  .vision__words, .founders__sig, .proof__num, .nav__wordmark, .footer__wordmark, .footer__wordmark-huge,
  .testimonial blockquote, .testimonials__press em, .cta__sent, .product__price, .product__meta h3,
  .founders__lede, .vision__num, .marquee__group, .pillar__lede, .vision__cell h3 {
    font-weight: var(--display-weight, 400);
  }
  .hero--dark { background: #0b1f15 !important; }
  .hero--dark .hero__title-word, .hero--dark .hero__deck { color: var(--c-cream) !important; }
  .hero--dark .hero__title-word--stroke { -webkit-text-stroke-color: var(--c-cream) !important; }
  .hero--dark .hero__eyebrow { color: var(--c-tan) !important; }
  .hero--dark .hero__meta, .hero--dark .hero__scroll-cue { color: rgba(249,244,237,.7) !important; }
  .hero--dark .hero__live { background: rgba(14,33,24,.7) !important; border-color: rgba(249,244,237,.18) !important; }
  .hero--dark .hero__trust { border-top-color: rgba(249,244,237,.16) !important; }
  .hero--dark .hero__trust-num { color: var(--c-cream) !important; }
  .hero--dark .hero__cta-primary { background: var(--c-tan); color: var(--c-forest); }
  .hero--dark .hero__cta-secondary, .hero--dark .hero__cta-icon { color: var(--c-cream); border-color: rgba(249,244,237,.4); }
  .hero--dark .hero__spec-card { background: rgba(14,33,24,.7) !important; color: var(--c-cream) !important; border-color: rgba(249,244,237,.16) !important; }
  .hero--dark .hero__spec-value { color: var(--c-cream) !important; }
  .hero--dark .hero__grid-lines span { border-color: rgba(249,244,237,.06) !important; }
`;
document.head.appendChild(styleEl);

/* ───── React Tweaks app ───── */
function App() {
  const [t, setTweak] = useTweaks(CHEMISTRIE_TWEAKS);

  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => { applyMotion(t.motion); }, [t.motion]);
  React.useEffect(() => { applyDisplayWeight(t.displayWeight); }, [t.displayWeight]);
  React.useEffect(() => { applyDarkHero(t.darkHero); }, [t.darkHero]);

  return (
    <TweaksPanel title="Chemistrie Tweaks">
      <TweakSection label="Palette" />
      <TweakColor
        label="Brand palette"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak("palette", v)}
      />

      <TweakSection label="Hero" />
      <TweakToggle
        label="Dark hero"
        value={t.darkHero}
        onChange={(v) => setTweak("darkHero", v)}
      />

      <TweakSection label="Motion" />
      <TweakRadio
        label="Intensity"
        value={t.motion}
        options={["subtle", "normal", "dramatic"]}
        onChange={(v) => setTweak("motion", v)}
      />

      <TweakSection label="Typography" />
      <TweakRadio
        label="Display weight"
        value={t.displayWeight}
        options={[300, 400, 500, 600]}
        onChange={(v) => setTweak("displayWeight", v)}
      />
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById("tweaks-root"));
root.render(<App />);
