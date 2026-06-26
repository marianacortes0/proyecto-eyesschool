"use client";

/**
 * EyeSchool synthwave landing — ported from the Claude Design handoff
 * "Retrofuturismo synthwave vectorial" (EyeSchool.dc.html).
 *
 * The prototype markup is injected verbatim (see eyeschoolMarkup.ts) and driven
 * by the imperative engine below — a faithful port of the design's DCLogic class.
 * Element wiring is done through the data-ref / data-act / data-* attributes that
 * the generator left in place, so the rendered output matches the design 1:1.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/auth/actions";
import { notifySuccess, notifyInfo } from "@/lib/toast";
import { LANDING_MARKUP } from "./eyeschoolMarkup";
import SignupModal from "./SignupModal";

type LandingHandlers = {
  onLogin: (correo: string, password: string) => Promise<{ error?: string } | void>;
  navigate: (path: string) => void;
  onSignup: () => void;
  onReady?: (api: { openLogin: () => void; closeLogin: () => void }) => void;
};

const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@500;600;700&family=Caveat:wght@600&display=swap');
.eyeschool-root, .eyeschool-root *{box-sizing:border-box;}
.eyeschool-root{background:#140e2c;}
@keyframes mote{0%,100%{transform:translateY(0);opacity:.25;}50%{transform:translateY(-16px);opacity:.8;}}
@keyframes padpulse{0%,100%{opacity:.85;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05);}}
@keyframes padspin{from{transform:translate(-50%,-50%) rotate(0);}to{transform:translate(-50%,-50%) rotate(360deg);}}
@keyframes chevbob{0%,100%{transform:translateX(-50%);opacity:.5;}50%{transform:translate(-50%,7px);opacity:1;}}
@keyframes flick{0%,100%{opacity:.85;}48%{opacity:.6;}52%{opacity:.95;}}
@keyframes twinkle{0%,100%{opacity:.25;transform:scale(.8);}50%{opacity:1;transform:scale(1.15);}}
@keyframes fadeup{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
@keyframes appearvanish{0%{opacity:0;transform:translateY(22px) scale(.94);}10%{opacity:1;transform:translateY(0) scale(1);}72%{opacity:1;transform:translateY(0) scale(1);}88%{opacity:0;transform:translateY(-18px) scale(.96);}100%{opacity:0;transform:translateY(-18px) scale(.96);}}
@keyframes spinline{to{transform:rotate(360deg);}}
@keyframes auraPulse{0%,100%{opacity:.55;transform:scale(1);}50%{opacity:.85;transform:scale(1.06);}}
@keyframes benfloatA{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
@keyframes benfloatB{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
@keyframes benfloatC{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
@keyframes arrowNudge{0%,100%{transform:translateY(-50%) translateX(0);}50%{transform:translateY(-50%) translateX(6px);}}
@keyframes arrowNudgeUp{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(-6px);}}
@keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
`;

type AnyEl = HTMLElement;

function createEngine(root: HTMLElement, handlers: LandingHandlers) {
  const props = { neon: "mint", speed: 1, characterScale: 1 };
  const q = <T extends Element = AnyEl>(sel: string) =>
    root.querySelector(sel) as T | null;
  const qa = (sel: string) =>
    Array.prototype.slice.call(root.querySelectorAll(sel)) as AnyEl[];

  const cleanups: Array<() => void> = [];
  const on = (
    el: EventTarget | null,
    type: string,
    fn: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions
  ) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    cleanups.push(() => el.removeEventListener(type, fn, opts));
  };

  const wrapEl = q('[data-ref="wrap"]');
  const scene = q('[data-ref="scene"]');
  let scaleEl = q('[data-ref="scale"]');
  const stage = q('[data-ref="stage"]');

  // ---- scene sizing + neon palette --------------------------------------
  const applyScene = () => {
    if (wrapEl) wrapEl.style.height = window.innerHeight + "px";
    if (scene) {
      scene.style.height = window.innerHeight + "px";
      const map: Record<string, [string, string]> = {
        mint: ["#9b6bff", "#4df0c8"],
        cyan: ["#9b6bff", "#38e8ff"],
        magenta: ["#ff5cc8", "#9b6bff"],
        gold: ["#ff8e5c", "#ffd36b"],
      };
      const [n1, n2] = map[props.neon] || map.mint;
      scene.style.setProperty("--neon", n1);
      scene.style.setProperty("--neon2", n2);
    }
  };

  // ---- navigation -------------------------------------------------------
  const scrollToEl = (id: string) => {
    if (!wrapEl) return;
    const s = wrapEl.querySelector("#" + id);
    if (!s) return;
    const wr = wrapEl.getBoundingClientRect();
    const sr = s.getBoundingClientRect();
    wrapEl.scrollTo({ top: wrapEl.scrollTop + (sr.top - wr.top), behavior: "smooth" });
  };
  const actions: Record<string, () => void> = {
    scrollDown: () => wrapEl && wrapEl.scrollTo({ top: window.innerHeight, behavior: "smooth" }),
    goInicio: () => wrapEl && wrapEl.scrollTo({ top: 0, behavior: "smooth" }),
    goNosotros: () => {
      state.benOpen = false;
      scrollToEl("nosotros");
    },
    goBeneficios: () => {
      scrollToEl("nosotros");
      setTimeout(() => (state.benOpen = true), 650);
    },
    goSoporte: () => {
      scrollToEl("resenas");
      setTimeout(() => (state.sopOpen = true), 650);
    },
    openLogin: () => {
      state.loginOpen = true;
      setupLogin();
    },
  };
  qa("[data-act]").forEach((el) => {
    const fn = actions[el.dataset.act as string];
    if (fn) on(el, "click", fn);
  });

  // ---- shared animation state ------------------------------------------
  const state = {
    benOpen: false,
    benCur: 0,
    ben2Open: false,
    ben2Cur: 0,
    sopOpen: false,
    sopCur: 0,
    cardOpen: false,
    cardCur: 0,
    loginOpen: false,
    loginCur: 0,
  };

  // ---- videos (play only the visible section) ---------------------------
  let vids: HTMLVideoElement[] = [];
  let parallaxVid: HTMLElement | null = null;
  let resSec: HTMLElement | null = null;
  let resVisible = false;
  let sopTimer: ReturnType<typeof setInterval> | null = null;

  const setResVisible = (v: boolean) => {
    if (v === resVisible) return;
    resVisible = v;
    if (v) {
      state.sopOpen = false;
      if (sopTimer) clearInterval(sopTimer);
      sopTimer = setInterval(() => (state.sopOpen = !state.sopOpen), 7500);
    } else {
      state.sopOpen = false;
      if (sopTimer) {
        clearInterval(sopTimer);
        sopTimer = null;
      }
    }
  };

  const updateVideos = () => {
    if (!vids.length || !wrapEl) return;
    const wrapR = wrapEl.getBoundingClientRect();
    const vh = wrapEl.clientHeight || 1;
    vids.forEach((el) => {
      const sec = (el.closest("section") || el.parentElement) as HTMLElement;
      const r = sec.getBoundingClientRect();
      const top = r.top - wrapR.top;
      const bottom = top + r.height;
      const visible = Math.max(0, Math.min(bottom, vh) - Math.max(top, 0));
      const ratio = visible / vh;
      if (ratio >= 0.5) {
        (el as AnyEl & { _active?: boolean })._active = true;
        if (el.paused) {
          const p = el.play();
          if (p && p.catch) p.catch(() => {});
        }
        if (el.dataset.parallax != null) setResVisible(true);
      } else {
        (el as AnyEl & { _active?: boolean })._active = false;
        if (!el.paused) el.pause();
        if (el.dataset.parallax != null) setResVisible(false);
      }
    });
  };

  const updateParallax = () => {
    if (!parallaxVid || !resSec || !wrapEl) return;
    const wrapR = wrapEl.getBoundingClientRect();
    const vh = wrapEl.clientHeight || 1;
    const r = resSec.getBoundingClientRect();
    const top = r.top - wrapR.top;
    const prog = (vh - top) / (vh + r.height);
    const shift = (Math.max(0, Math.min(1, prog)) - 0.5) * 90;
    parallaxVid.style.transform =
      "translate(-50%, calc(-50% + " + shift.toFixed(1) + "px)) scale(1.02)";
  };

  let scrollBound = false;
  const bindScroll = () => {
    if (scrollBound || !wrapEl) return;
    scrollBound = true;
    parallaxVid = wrapEl.querySelector("[data-parallax]");
    resSec = wrapEl.querySelector("#resenas");
    const onScroll = () => {
      updateVideos();
      updateParallax();
    };
    on(wrapEl, "scroll", onScroll, { passive: true });
    on(window, "resize", onScroll);
  };

  const setupVideo = () => {
    const els = qa("video") as HTMLVideoElement[];
    if (!els.length) return;
    els.forEach((el) => {
      const m = el as HTMLVideoElement & { _setup?: boolean; _active?: boolean };
      if (m._setup) return;
      m._setup = true;
      el.muted = true;
      el.defaultMuted = true;
      el.loop = true;
      el.playsInline = true;
      el.setAttribute("muted", "");
      el.setAttribute("loop", "");
      on(el, "ended", () => {
        el.currentTime = 0;
        if (m._active) {
          const p = el.play();
          if (p && p.catch) p.catch(() => {});
        }
      });
      el.pause();
    });
    vids = els;
    bindScroll();
    updateVideos();
    requestAnimationFrame(() => updateVideos());
    setTimeout(() => updateVideos(), 300);
    setTimeout(() => updateVideos(), 900);
  };

  // ---- plataforma carousel (feature cards) ------------------------------
  let platTimer: ReturnType<typeof setInterval> | null = null;

  const setupPlataforma = () => {
    const track = q("[data-plat-track]");
    const dotWrap = q("[data-plat-dots]");
    if (!track) return;
    const slides = 2;
    const dots = dotWrap
      ? (Array.prototype.slice.call(dotWrap.querySelectorAll("span")) as AnyEl[])
      : [];
    let idx = 0;
    const show = (i: number) => {
      track.style.transition = "transform .6s cubic-bezier(.4,0,.2,1)";
      track.style.transform = "translateX(-" + i * 50 + "%)";
      dots.forEach((d, k) => {
        const active = k === i;
        d.style.opacity = active ? "1" : ".35";
        d.style.width = active ? "22px" : "8px";
        d.style.borderRadius = active ? "4px" : "50%";
      });
    };
    show(0);
    dots.forEach((d, k) =>
      on(d, "click", () => {
        idx = k;
        show(idx);
      })
    );
    platTimer = setInterval(() => {
      idx = (idx + 1) % slides;
      show(idx);
    }, 5200);
  };

  // ---- reseñas rotation -------------------------------------------------
  let reviewTimer: ReturnType<typeof setInterval> | null = null;
  let sopPanel: HTMLElement | null = null;
  let resContent: HTMLElement | null = null;

  const setupReviews = () => {
    const els = qa("[data-review]");
    const dotWrap = q("[data-review-dots]");
    if (els.length < 3) return;
    const rs = q("#resenas");
    if (rs) {
      sopPanel = rs.querySelector("[data-sop-panel]");
      resContent = rs.querySelector("[data-res-content]");
    }
    const dots = dotWrap ? (Array.prototype.slice.call(dotWrap.querySelectorAll("span")) as AnyEl[]) : [];
    const show = (i: number) => {
      els.forEach((el, k) => {
        const active = k === i;
        el.style.opacity = active ? "1" : "0";
        el.style.transform = active ? "translateY(0)" : "translateY(16px)";
      });
      dots.forEach((d, k) => {
        const active = k === i;
        d.style.opacity = active ? "1" : ".3";
        d.style.width = active ? "22px" : "8px";
        d.style.borderRadius = active ? "4px" : "50%";
      });
    };
    show(0);
    let idx = 0;
    reviewTimer = setInterval(() => {
      idx = (idx + 1) % els.length;
      show(idx);
    }, 4200);
  };

  // ---- nosotros: orbit ring, head frames, cards, beneficios -------------
  const topics = [
    { icon: "🎯", title: "Misión", desc: "Hacer simple la gestión académica para cada institución del mundo." },
    { icon: "👁️", title: "Visión", desc: "Ser la plataforma educativa de referencia en Latinoamérica." },
    { icon: "💎", title: "Valores", desc: "Cercanía, innovación y transparencia en todo lo que hacemos." },
    { icon: "🚀", title: "Historia", desc: "Nacimos en 2024 con un sueño: devolverle tiempo a docentes y directivos." },
    { icon: "🤝", title: "Equipo", desc: "Educadores, diseñadores e ingenieros unidos por la misma misión." },
    { icon: "🌎", title: "Impacto", desc: "+200 instituciones y miles de estudiantes ya confían en EyeSchool." },
  ];
  let headEls: AnyEl[] = [];
  const headSeq = [
    { i: 0, d: 1500 }, { i: 1, d: 140 }, { i: 0, d: 520 },
    { i: 2, d: 300 }, { i: 3, d: 150 }, { i: 2, d: 240 }, { i: 3, d: 150 }, { i: 2, d: 220 },
    { i: 0, d: 820 },
  ];
  const headTotal = headSeq.reduce((a, s) => a + s.d, 0);
  let headT0 = 0;
  let headCur = -1;
  let ring: HTMLElement | null = null;
  let orbitIcons: AnyEl[] = [];
  let orbitBase: number[] = [];
  let orbitAng = 0;
  let orbitPaused = false;
  let benPanel: HTMLElement | null = null;
  let ben2Panel: HTMLElement | null = null;
  let cardOverlay: HTMLElement | null = null;
  let cardEl: HTMLElement | null = null;

  const showCard = (i: number) => {
    const sec = q("#nosotros");
    if (!sec) return;
    const t = topics[i];
    if (!t) return;
    (sec.querySelector("[data-card-icon]") as AnyEl).textContent = t.icon;
    (sec.querySelector("[data-card-title]") as AnyEl).textContent = t.title;
    (sec.querySelector("[data-card-desc]") as AnyEl).textContent = t.desc;
    state.cardOpen = true;
  };
  const hideCard = () => (state.cardOpen = false);

  const setupNosotros = () => {
    const sec = q("#nosotros");
    if (!sec) return;

    // starfield
    const sl = sec.querySelector("[data-nstars]");
    if (sl && !sl.childElementCount) {
      for (let i = 0; i < 64; i++) {
        const s = document.createElement("span");
        const sz = Math.random() < 0.3 ? 2.5 : 1.5;
        s.style.cssText =
          "position:absolute;border-radius:50%;width:" + sz + "px;height:" + sz +
          "px;background:#cfe0ff;left:" + (Math.random() * 100).toFixed(1) +
          "%;top:" + (Math.random() * 100).toFixed(1) + "%;opacity:" +
          (0.3 + Math.random() * 0.6).toFixed(2) + ";box-shadow:0 0 " + sz * 2 +
          "px #cfe0ff;animation:twinkle " + (2 + Math.random() * 4).toFixed(1) +
          "s ease-in-out infinite " + (Math.random() * 3).toFixed(1) + "s;";
        sl.appendChild(s);
      }
    }

    headEls = Array.prototype.slice.call(sec.querySelectorAll("[data-head]"));
    headT0 = performance.now();

    ring = sec.querySelector("[data-ring]");
    if (ring) {
      const icons = Array.prototype.slice.call(ring.querySelectorAll("[data-topic]")) as AnyEl[];
      const n = icons.length;
      orbitIcons = icons;
      orbitBase = icons.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n);
      on(ring, "mouseenter", () => (orbitPaused = true));
      on(ring, "mouseleave", () => (orbitPaused = false));
      icons.forEach((el) => on(el, "click", () => showCard(+(el.dataset.topic as string))));
    }

    benPanel = sec.querySelector("[data-ben-panel]");
    on(sec.querySelector("[data-ben-open]"), "click", () => (state.benOpen = true));
    on(sec.querySelector("[data-ben-close]"), "click", () => (state.benOpen = false));

    ben2Panel = sec.querySelector("[data-ben2-panel]");
    on(sec.querySelector("[data-ben2-open]"), "click", () => (state.ben2Open = true));
    on(sec.querySelector("[data-ben2-close]"), "click", () => (state.ben2Open = false));

    cardOverlay = sec.querySelector("[data-card-overlay]");
    cardEl = sec.querySelector("[data-card]");
    on(sec.querySelector("[data-card-backdrop]"), "click", hideCard);
    on(sec.querySelector("[data-card-close]"), "click", hideCard);
  };

  // ---- login overlay ----------------------------------------------------
  let loginOv: HTMLElement | null = null;
  let loginCard: HTMLElement | null = null;
  let loginBound = false;
  const setupLogin = () => {
    if (loginBound) return;
    loginOv = q("[data-login-overlay]");
    loginCard = q("[data-login-card]");
    if (!loginOv) return;
    loginBound = true;
    on(q("[data-login-backdrop]"), "click", () => (state.loginOpen = false));
    on(q("[data-login-close]"), "click", () => (state.loginOpen = false));
    on(window, "keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") state.loginOpen = false;
    });
    const loginView = loginCard?.querySelector('[data-view="login"]') as HTMLElement | null;

    // El registro inline no captura documento/rol que el backend exige →
    // "Regístrate" lleva a la página de registro real.
    on(loginCard?.querySelector("[data-go-signup]") ?? null, "click", () => {
      state.loginOpen = false;
      handlers.onSignup();
    });
    on(loginCard?.querySelector("[data-go-login]") ?? null, "click", () =>
      handlers.navigate("/?login=1")
    );

    if (!loginView) return;
    const emailInput = loginView.querySelector('input[type="email"]') as HTMLInputElement | null;
    const passInput = loginView.querySelector('input[type="password"]') as HTMLInputElement | null;
    const submitBtn = loginView.querySelector("button") as HTMLButtonElement | null;

    // Mensaje de error bajo el formulario
    const errEl = document.createElement("p");
    errEl.style.cssText =
      "margin:12px 0 0;font-size:12px;line-height:1.4;color:#ff8a8a;text-align:center;";
    submitBtn?.insertAdjacentElement("beforebegin", errEl);

    // "¿Olvidaste tu contraseña?" → página real
    const forgot = (Array.prototype.slice.call(loginView.querySelectorAll("span")) as HTMLElement[]).find(
      (s) => /olvidaste/i.test(s.textContent || "")
    );
    if (forgot) on(forgot, "click", () => handlers.navigate("/forgot-password"));

    let busy = false;
    const submit = async () => {
      if (busy || !submitBtn) return;
      const correo = (emailInput?.value || "").trim();
      const password = passInput?.value || "";
      if (!correo || !password) {
        errEl.textContent = "Ingresa tu correo y contraseña.";
        return;
      }
      busy = true;
      errEl.textContent = "";
      const original = submitBtn.textContent;
      submitBtn.textContent = "ENTRANDO…";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.pointerEvents = "none";
      try {
        const res = await handlers.onLogin(correo, password);
        // En éxito, el server action redirige; aquí solo manejamos el error.
        if (res && res.error) errEl.textContent = res.error;
      } catch {
        errEl.textContent = "No se pudo iniciar sesión. Intenta de nuevo.";
      } finally {
        busy = false;
        submitBtn.textContent = original;
        submitBtn.style.opacity = "";
        submitBtn.style.pointerEvents = "";
      }
    };
    if (submitBtn) on(submitBtn, "click", submit);
    const onEnter = (e: Event) => {
      if ((e as KeyboardEvent).key === "Enter") submit();
    };
    if (emailInput) on(emailInput, "keydown", onEnter);
    if (passInput) on(passInput, "keydown", onEnter);
  };

  // ---- floating dust motes ---------------------------------------------
  const makeMotes = () => {
    const layer = scene && scene.querySelector("[data-motes]");
    if (!layer || layer.childElementCount) return;
    const tint = ["#ffe6a6", "#bfe8ff", "#d8c4ff", "#9fffe6"];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      const sz = Math.random() < 0.3 ? 3 : 2;
      const c = tint[(Math.random() * tint.length) | 0];
      s.style.cssText =
        "position:absolute;border-radius:50%;width:" + sz + "px;height:" + sz +
        "px;background:" + c + ";left:" + (Math.random() * 100).toFixed(2) +
        "%;top:" + (Math.random() * 78).toFixed(2) + "%;opacity:.5;box-shadow:0 0 " +
        sz * 3 + "px " + c + ";animation:mote " + (4 + Math.random() * 5).toFixed(2) +
        "s ease-in-out infinite " + (Math.random() * 5).toFixed(2) + "s;";
      layer.appendChild(s);
    }
  };

  // ---- character animation ---------------------------------------------
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  type Seg = { dur: number; fn: (lt: number) => { key: string; ty?: number; sy?: number; sx?: number; rot?: number; tx?: number } };
  let frames: Record<string, HTMLElement> = {};
  let curKey = "f01";
  let segs: Seg[] = [];
  let TOTAL = 1;
  const NB = 2;
  let t0 = 0;
  let raf = 0;
  let lastNow = 0;
  let booted = false;

  const setFrame = (key: string) => {
    if (key === curKey) return;
    const p = frames[curKey];
    const nx = frames[key];
    if (p) p.style.opacity = "0";
    if (nx) nx.style.opacity = "1";
    curKey = key;
  };

  const boot = () => {
    if (booted || !stage) return;
    booted = true;
    frames = {};
    stage.querySelectorAll("img[data-key]").forEach((im) => {
      frames[(im as HTMLElement).dataset.key as string] = im as HTMLElement;
    });
    curKey = "f01";
    scaleEl = scaleEl || (stage.parentElement as HTMLElement);
    if (scaleEl) scaleEl.style.transformOrigin = "top center";
    applyScene();
    makeMotes();

    segs = [
      { dur: 1.3, fn: () => ({ key: "f01" }) },
      { dur: 0.07, fn: () => ({ key: "f06" }) },
      { dur: 0.1, fn: () => ({ key: "f07" }) },
      { dur: 0.07, fn: () => ({ key: "f06" }) },
      { dur: 0.55, fn: () => ({ key: "f01" }) },
      { dur: 0.24, fn: (lt) => ({ key: "f12", rot: -2 * easeOut(lt) }) },
      {
        dur: 0.96,
        fn: (lt) => {
          const seq = ["f15", "f16", "f17", "f16"];
          const k = seq[((lt * 8) | 0) % seq.length];
          return { key: k, rot: -2 + Math.sin(lt * Math.PI * 6) * 2.3 };
        },
      },
      { dur: 0.18, fn: (lt) => ({ key: "f12", rot: -2 * (1 - easeInOut(lt)) }) },
      { dur: 0.55, fn: () => ({ key: "f01" }) },
      { dur: 0.18, fn: (lt) => { const e = easeInOut(lt); return { key: "f20", ty: 10 * e, sy: 1 - 0.09 * e, sx: 1 + 0.06 * e }; } },
      { dur: 0.12, fn: (lt) => { const e = easeOut(lt); return { key: "f21", ty: 10 - 30 * e, sy: 0.91 + 0.12 * e, sx: 1.06 - 0.08 * e }; } },
      {
        dur: 0.42,
        fn: (lt) => {
          const H = 176;
          const ty = -30 - (H - 30) * Math.sin(Math.min(1, lt) * Math.PI * 0.85);
          const k = lt < 0.5 ? "f22" : "f23";
          return { key: k, ty, sy: 1.04, sx: 0.98, rot: Math.sin(lt * Math.PI) * 4 };
        },
      },
      { dur: 0.12, fn: (lt) => { const e = easeOut(lt); return { key: "f21", ty: -30 * (1 - e) + 8, sy: 1.02, sx: 0.99 }; } },
      { dur: 0.12, fn: () => ({ key: "f20", ty: 10, sy: 0.84, sx: 1.13 }) },
      { dur: 0.2, fn: (lt) => { const e = easeOut(lt); return { key: "f24", ty: 10 * (1 - e), sy: 0.84 + 0.16 * e, sx: 1.13 - 0.13 * e }; } },
      { dur: 1.2, fn: () => ({ key: "f01" }) },
    ];
    TOTAL = segs.reduce((a, s) => a + s.dur, 0);
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const tick = (now: number) => {
    const speed = props.speed != null ? props.speed : 1;
    let te = ((now - t0) / 1000) * speed;
    te %= TOTAL;
    if (te < 0) te += TOTAL;

    if (scaleEl) {
      const cs = props.characterScale != null ? props.characterScale : 1;
      const innerH = window.innerHeight;
      const innerW = window.innerWidth;
      const baseY = innerH * 0.64;
      const baseFit = Math.min((innerW - 40) / 600, (baseY - 72) / 483, 1.45);
      const scale = Math.max(0.2, baseFit) * cs;
      const top = baseY - 610 * scale;
      const tf = "translateX(-50%) scale(" + scale.toFixed(3) + ")";
      if (scaleEl.style.left !== "50%") scaleEl.style.left = "50%";
      const ts = top.toFixed(1) + "px";
      if (scaleEl.style.top !== ts) scaleEl.style.top = ts;
      if (scaleEl.style.transform !== tf) scaleEl.style.transform = tf;
    }

    if (stage) {
      let acc = 0;
      let seg = segs[0];
      let lt = 0;
      for (const s of segs) {
        if (te < acc + s.dur) {
          seg = s;
          lt = (te - acc) / s.dur;
          break;
        }
        acc += s.dur;
      }
      const b = seg.fn(Math.min(Math.max(lt, 0), 1)) || { key: "f01" };
      const baseTy = b.ty || 0;
      const baseSy = b.sy != null ? b.sy : 1;
      const baseSx = b.sx != null ? b.sx : 1;
      const baseRot = b.rot || 0;
      const baseTx = b.tx || 0;

      const ph = te / TOTAL;
      const br = Math.sin(ph * Math.PI * 2 * NB);
      const sway = Math.sin(ph * Math.PI * 2) * 1.2;
      const micro = Math.sin(ph * Math.PI * 2 * 3) * 1.0;
      const floaty = Math.sin(ph * Math.PI * 2) * -4;
      const ty = baseTy + br * -2.4 + floaty;
      const sy = baseSy * (1 + br * 0.016);
      const sx = baseSx * (1 - br * 0.011);
      stage.style.transform =
        "translate(" + (baseTx + micro).toFixed(2) + "px," + ty.toFixed(2) +
        "px) rotate(" + (baseRot + sway).toFixed(2) + "deg) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
      setFrame(b.key || "f01");
    }

    // cyclops head frame cycle
    if (headEls.length) {
      let teh = (now - headT0) % headTotal;
      if (teh < 0) teh += headTotal;
      let acc = 0;
      let idx = 0;
      for (const s of headSeq) {
        if (teh < acc + s.d) {
          idx = s.i;
          break;
        }
        acc += s.d;
      }
      if (idx !== headCur) {
        for (let k = 0; k < headEls.length; k++) headEls[k].style.opacity = k === idx ? "1" : "0";
        headCur = idx;
      }
    }

    // orbiting ring
    if (orbitIcons.length && ring) {
      const dnow = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
      if (!orbitPaused) orbitAng += dnow * 0.16;
      const S = ring.clientWidth || 400;
      const R = S * 0.47;
      for (let i = 0; i < orbitIcons.length; i++) {
        const a = orbitBase[i] + orbitAng;
        orbitIcons[i].style.transform =
          "translate(-50%,-50%) translate(" + (Math.cos(a) * R).toFixed(1) + "px," + (Math.sin(a) * R).toFixed(1) + "px)";
      }
      ring.style.opacity = "1";
    }

    // card overlay
    if (cardOverlay) {
      const tgt = state.cardOpen ? 1 : 0;
      state.cardCur += (tgt - state.cardCur) * 0.22;
      if (Math.abs(state.cardCur - tgt) < 0.006) state.cardCur = tgt;
      cardOverlay.style.opacity = state.cardCur.toFixed(3);
      cardOverlay.style.pointerEvents = state.cardOpen ? "auto" : "none";
      if (cardEl) cardEl.style.transform = "scale(" + (0.9 + 0.1 * state.cardCur).toFixed(3) + ")";
    }
    lastNow = now;

    // Beneficios slide panel
    if (benPanel) {
      const tg = state.benOpen ? 1 : 0;
      state.benCur += (tg - state.benCur) * 0.16;
      if (Math.abs(state.benCur - tg) < 0.004) state.benCur = tg;
      benPanel.style.transform = "translateX(" + (100 * (1 - state.benCur)).toFixed(2) + "%)";
    }
    if (ben2Panel) {
      const tg2 = state.ben2Open ? 1 : 0;
      state.ben2Cur += (tg2 - state.ben2Cur) * 0.16;
      if (Math.abs(state.ben2Cur - tg2) < 0.004) state.ben2Cur = tg2;
      ben2Panel.style.transform = "translateX(" + (100 * (1 - state.ben2Cur)).toFixed(2) + "%)";
    }

    // Soporte slide-up panel + reseñas content
    if (sopPanel) {
      const tg = state.sopOpen ? 1 : 0;
      state.sopCur += (tg - state.sopCur) * 0.16;
      if (Math.abs(state.sopCur - tg) < 0.004) state.sopCur = tg;
      sopPanel.style.transform = "translateY(" + (100 * (1 - state.sopCur)).toFixed(2) + "%)";
      if (resContent) resContent.style.transform = "translateY(" + (-100 * state.sopCur).toFixed(2) + "%)";
    }

    // login overlay fade
    if (loginOv) {
      const tg = state.loginOpen ? 1 : 0;
      state.loginCur += (tg - state.loginCur) * 0.25;
      if (Math.abs(state.loginCur - tg) < 0.006) state.loginCur = tg;
      loginOv.style.opacity = state.loginCur.toFixed(3);
      loginOv.style.pointerEvents = state.loginOpen ? "auto" : "none";
      if (loginCard)
        loginCard.style.transform =
          "scale(" + (0.92 + 0.08 * state.loginCur).toFixed(3) + ") translateY(" + (10 * (1 - state.loginCur)).toFixed(1) + "px)";
    }

    raf = requestAnimationFrame(tick);
  };

  // ---- hover / focus polish (style-hover / style-focus attributes) ------
  const applyDecls = (el: HTMLElement, decls: string, store: Map<string, string>) => {
    decls.split(";").forEach((d) => {
      const idx = d.indexOf(":");
      if (idx < 0) return;
      const k = d.slice(0, idx).trim();
      const v = d.slice(idx + 1).trim();
      if (!k) return;
      if (!store.has(k)) store.set(k, el.style.getPropertyValue(k));
      el.style.setProperty(k, v);
    });
  };
  const revertDecls = (el: HTMLElement, store: Map<string, string>) => {
    store.forEach((v, k) => {
      if (v) el.style.setProperty(k, v);
      else el.style.removeProperty(k);
    });
    store.clear();
  };
  qa("[style-hover]").forEach((el) => {
    const decls = el.getAttribute("style-hover") as string;
    const store = new Map<string, string>();
    on(el, "mouseenter", () => applyDecls(el, decls, store));
    on(el, "mouseleave", () => revertDecls(el, store));
  });
  qa("[style-focus]").forEach((el) => {
    const decls = el.getAttribute("style-focus") as string;
    const store = new Map<string, string>();
    on(el, "focus", () => applyDecls(el, decls, store));
    on(el, "blur", () => revertDecls(el, store));
  });

  // ---- boot -------------------------------------------------------------
  applyScene();
  on(window, "resize", applyScene);
  setupVideo();
  setupPlataforma();
  setupReviews();
  setupNosotros();
  boot();

  // Expone control del overlay de login a React (para el modal de registro).
  handlers.onReady?.({
    openLogin: actions.openLogin,
    closeLogin: () => {
      state.loginOpen = false;
    },
  });

  // Abre el modal de login al llegar con ?login=1 (redirecciones de auth y botón "Entrar").
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") {
      actions.openLogin();
    }
    const registered = params.get("registered");
    if (registered) {
      const rol = params.get("rol") ?? "usuario";
      if (registered === "pending") {
        notifyInfo(`Solicitud de registro enviada como ${rol}. Espere la aprobación del administrador.`);
      } else if (registered === "true") {
        notifySuccess(`Usuario registrado exitosamente como ${rol}`);
      }
      // Limpia los parámetros para no repetir el toast al refrescar.
      try {
        window.history.replaceState({}, "", window.location.pathname);
      } catch { /* noop */ }
    }
  } catch {
    /* noop */
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    if (platTimer) clearInterval(platTimer);
    if (reviewTimer) clearInterval(reviewTimer);
    if (sopTimer) clearInterval(sopTimer);
    cleanups.forEach((fn) => fn());
  };
}

export default function EyeSchoolLanding() {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [signupOpen, setSignupOpen] = useState(false);
  const openLoginRef = useRef<() => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const handlers: LandingHandlers = {
      onLogin: async (correo, password) => {
        const fd = new FormData();
        fd.set("email", correo);
        fd.set("password", password);
        // Server action: setea cookies httpOnly y redirige en éxito; retorna { error } si falla.
        return await login(undefined, fd);
      },
      navigate: (path) => router.push(path),
      onSignup: () => setSignupOpen(true),
      onReady: ({ openLogin }) => {
        openLoginRef.current = openLogin;
      },
    };
    const destroy = createEngine(host, handlers);
    return destroy;
  }, [router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        ref={hostRef}
        className="eyeschool-root"
        dangerouslySetInnerHTML={{ __html: LANDING_MARKUP }}
      />
      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          openLoginRef.current();
        }}
      />
    </>
  );
}
