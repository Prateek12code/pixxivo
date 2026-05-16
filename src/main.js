import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import confetti from "canvas-confetti";
import { supabase } from "./supabaseClient";

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const page = body.dataset.page || "home";

const SELECTORS = {
  menuBtn: "[data-menu-btn], .menu-btn",
  mobileMenu: "[data-mobile-menu], .mobile-menu",
  openHype: "[data-open-hype]",
  closeHype: "[data-close-hype]",
  hypeModal: "[data-hype-modal], .hype-modal",
  hypeCard: ".hype-card",
  hypeForm: "[data-hype-form]",
  hypeStatus: "[data-hype-status]",
  hypeCount: "[data-hype-count], [data-hype-mini]",
  wallTotal: "[data-wall-total]",
  supporterGrid: "[data-supporter-grid], [data-supporter-wall]",
  searchWall: "[data-search-wall], [data-wall-search]",
  searchStatus: "[data-search-status], [data-wall-count]",
  contactForm: "#contactForm, .contact-form",
  verifyModal: "[data-verify-modal], .verify-modal",
  closeVerify: "[data-close-verify]",
  verifyCard: ".verify-card",
};

const STORAGE_KEYS = {
  hypeDraft: "pixxivo-hype-draft",
};

const lenis = new Lenis({
  duration: 1.12,
  smoothWheel: true,
  wheelMultiplier: 0.78,
  touchMultiplier: 1.15,
  easing: (t) => 1 - Math.pow(1 - t, 4),
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function cleanText(value, maxLength = 120) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function containsSpam(text) {
  const value = String(text || "").toLowerCase();

  const blocked = [
    "http://",
    "https://",
    "www.",
    "<script",
    "casino",
    "crypto",
    "betting",
    "porn",
    "telegram",
    "whatsapp link",
  ];

  return blocked.some((word) => value.includes(word));
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function setStatus(form, message) {
  const status = qs(SELECTORS.hypeStatus, form) || qs(SELECTORS.hypeStatus);
  if (status) status.textContent = message;
}

function showToast(message) {
  let toast = qs(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function openHypeModal() {
  const modal = qs(SELECTORS.hypeModal);
  if (!modal) return;

  modal.classList.add("active");
  body.classList.add("modal-open", "hype-open");

  const card = qs(SELECTORS.hypeCard, modal);

  if (card) {
    gsap.fromTo(
      card,
      { y: 34, opacity: 0, scale: 0.94, rotateX: 8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.48,
        ease: "expo.out",
      },
    );
  }
}

function closeHypeModal() {
  const modal = qs(SELECTORS.hypeModal);
  if (!modal) return;

  modal.classList.remove("active");
  body.classList.remove("modal-open", "hype-open");
}

function openVerifyModal() {
  const modal = qs(SELECTORS.verifyModal);
  if (!modal) return;

  modal.classList.add("active");
  body.classList.add("modal-open", "verify-open");

  const card = qs(SELECTORS.verifyCard, modal);

  if (card) {
    gsap.fromTo(
      card,
      {
        y: 34,
        opacity: 0,
        scale: 0.94,
        rotateX: 8,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.48,
        ease: "expo.out",
      },
    );
  }
}

function closeVerifyModal() {
  const modal = qs(SELECTORS.verifyModal);
  if (!modal) return;

  modal.classList.remove("active");
  body.classList.remove("modal-open", "verify-open");
}

async function refreshSignalStats() {
  const hypeEls = qsa(SELECTORS.hypeCount);
  const wallTotal = qs(SELECTORS.wallTotal);

  const { data, error } = await supabase.rpc("get_signal_stats");

  if (error) {
    console.error(error);
    hypeEls.forEach((el) => (el.textContent = "0"));
    if (wallTotal) wallTotal.textContent = "0";
    return;
  }

  const total = Number(data?.[0]?.total_supporters || 0);
  const formatted = total.toLocaleString("en-IN");

  hypeEls.forEach((el) => {
    el.textContent = formatted;
  });

  if (wallTotal) wallTotal.textContent = formatted;
}

async function getSignalWall() {
  const { data, error } = await supabase.rpc("get_signal_wall");

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

async function renderWall(list = null) {
  const grid = qs(SELECTORS.supporterGrid);
  if (!grid) return;

  const supporters = list || (await getSignalWall());

  grid.innerHTML = "";

  if (!supporters.length) {
    grid.innerHTML = `
      <div class="empty-wall">
        <h3>No supporter found.</h3>
        <p>Try another name or join the Signal Wall.</p>
      </div>
    `;
    return;
  }

  supporters.forEach((supporter) => {
    const card = document.createElement("article");
    card.className = "supporter-card reveal-card";

    const signalNumber = String(supporter.signal_number).padStart(3, "0");
    const displayName = supporter.display_name || "Anonymous Supporter";
    const date = formatDate(supporter.created_at);
    const message = supporter.message || "Hyped Pixxivo’s mission.";

    card.innerHTML = `
      <div class="supporter-top">
        <span>SIGNAL #${signalNumber}</span>
        <small>${escapeHTML(date)}</small>
      </div>
      <h3>${escapeHTML(displayName)}</h3>
      <p>${escapeHTML(message)}</p>
    `;

    grid.appendChild(card);
  });

  animateSupporterCards();
}

async function filterWall(query) {
  const supporters = await getSignalWall();
  const search = cleanText(query, 100).toLowerCase();

  if (!search) {
    await renderWall(supporters);
    updateSearchStatus("Showing all supporters");
    return;
  }

  const filtered = supporters.filter((supporter) => {
    const name = String(supporter.display_name || "").toLowerCase();
    const message = String(supporter.message || "").toLowerCase();
    return name.includes(search) || message.includes(search);
  });

  await renderWall(filtered);
  updateSearchStatus(
    `${filtered.length} result${filtered.length === 1 ? "" : "s"} found`,
  );
}

function updateSearchStatus(text) {
  qsa(SELECTORS.searchStatus).forEach((el) => {
    el.textContent = text;
  });
}

function createHypeDraftFromForm(form) {
  const formData = new FormData(form);

  const displayName =
    cleanText(formData.get("displayName"), 40) ||
    cleanText(formData.get("name"), 40);

  const message = cleanText(formData.get("message"), 120);
  const email = cleanText(formData.get("email"), 120).toLowerCase();

  const isAnonymous =
    formData.get("anonymous") === "on" || formData.get("isAnonymous") === "on";

  if (displayName.length < 2) {
    return {
      ok: false,
      error: "Enter a display name with at least 2 characters.",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      ok: false,
      error: "Email verification is required to keep hype real.",
    };
  }

  if (containsSpam(displayName) || containsSpam(message)) {
    return { ok: false, error: "Links or spam-like text are not allowed." };
  }

  return {
    ok: true,
    draft: {
      displayName,
      message,
      email,
      isAnonymous,
      createdAt: new Date().toISOString(),
    },
  };
}

async function handleHypeSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const result = createHypeDraftFromForm(form);

  if (!result.ok) {
    setStatus(form, result.error);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.hypeDraft, JSON.stringify(result.draft));

  setStatus(form, "Sending verification email...");

  const redirectTo = `${window.location.origin}/support.html?verified=1`;

  const { error } = await supabase.auth.signInWithOtp({
    email: result.draft.email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error(error);
    setStatus(
      form,
      "Could not send verification email. Check Supabase Auth settings.",
    );
    return;
  }

  setStatus(form, "Verification email sent.");

  form.reset();

  closeHypeModal();

  setTimeout(() => {
    openVerifyModal();
  }, 260);

  showToast("Verification email sent.");
}

async function handleVerifiedDraft() {
  const draftRaw = localStorage.getItem(STORAGE_KEYS.hypeDraft);
  if (!draftRaw) return;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(sessionError);
    return;
  }

  if (!session?.user) return;

  let draft;

  try {
    draft = JSON.parse(draftRaw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.hypeDraft);
    return;
  }

  const displayName = cleanText(draft.displayName, 40);
  const message = cleanText(draft.message, 120);
  const isAnonymous = Boolean(draft.isAnonymous);

  if (!displayName || displayName.length < 2) {
    localStorage.removeItem(STORAGE_KEYS.hypeDraft);
    return;
  }

  const { error } = await supabase.from("supporters").insert({
    user_id: session.user.id,
    display_name: displayName,
    message,
    is_anonymous: isAnonymous,
    status: "verified",
  });

  if (error) {
    const text = String(error.message || "").toLowerCase();

    if (text.includes("duplicate") || text.includes("unique")) {
      localStorage.removeItem(STORAGE_KEYS.hypeDraft);
      showToast("You are already on the Signal Wall.");
      await refreshSignalStats();
      if (page === "support") await renderWall();
      return;
    }

    console.error(error);
    showToast("Could not add you to the wall. Try again.");
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.hypeDraft);

  confetti({
    particleCount: 82,
    spread: 72,
    origin: { y: 0.72 },
    scalar: 0.88,
  });

  showToast("You are now on the Signal Wall.");

  await refreshSignalStats();

  if (page === "support") await renderWall();
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const name = cleanText(formData.get("name"), 60);
  const email = cleanText(formData.get("email"), 120);
  const reason = cleanText(formData.get("reason"), 80);
  const message = cleanText(formData.get("message"), 2000);

  if (!name || !email || !reason || message.length < 10) {
    showToast("Please fill the form properly.");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  const oldHTML = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = "Sending...";
  }

  const { error: dbError } = await supabase.from("contact_messages").insert({
    name,
    email,
    reason,
    message,
  });

  if (dbError) console.error(dbError);

  const { data, error } = await supabase.functions.invoke("contact-email", {
    body: { name, email, reason, message },
  });

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.innerHTML = oldHTML || "Send message";
  }

  if (error || data?.error) {
    console.error(error || data);
    showToast("Message saved, but email failed. Check Edge Function setup.");
    return;
  }

  form.reset();
  showToast("Message sent. Auto-reply delivered.");
}

function onWindowReady(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback, { once: true });
  }
}

function initLoader() {
  const loader = qs(".loader");

  if (!loader) {
    runIntro();
    return;
  }

  const FULL_LOADER_KEY = "pixxivo-full-loader-seen";

  const shouldShowFullLoader =
    page === "home" && localStorage.getItem(FULL_LOADER_KEY) !== "true";

  if (shouldShowFullLoader) {
    runFullHomeLoader(loader, FULL_LOADER_KEY);
  } else {
    runMinimalLoader(loader);
  }
}

function runFullHomeLoader(loader, storageKey) {
  gsap.set(body, { overflow: "hidden" });

  gsap.set(".px-loader", {
    opacity: 1,
    scale: 0.96,
  });

  gsap.set(".px-signal-lines span", {
    xPercent: -140,
    opacity: 0,
  });

  gsap.set(".px-path", {
    strokeDasharray: 2200,
    strokeDashoffset: 2200,
    fill: "rgba(255,255,255,0)",
    stroke: "rgba(255,255,255,0.9)",
  });

  gsap.set(".px-loader-svg", {
    scale: 0.88,
    opacity: 0,
    rotate: -2,
  });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  tl.to(".px-loader-svg", {
    scale: 1,
    opacity: 1,
    rotate: 0,
    duration: 0.5,
    ease: "expo.out",
  })
    .to(
      ".px-signal-lines span",
      {
        xPercent: 140,
        opacity: 1,
        duration: 0.72,
        stagger: 0.1,
        ease: "power2.inOut",
      },
      "-=0.15",
    )
    .to(
      ".px-path",
      {
        strokeDashoffset: 0,
        duration: 1.25,
        stagger: 0.08,
        ease: "power2.inOut",
      },
      "-=0.42",
    )
    .to(".px-path", {
      fill: "rgba(255,255,255,0.94)",
      stroke: "rgba(255,255,255,0.22)",
      duration: 0.45,
      ease: "power2.out",
    })
    .to(".px-loader-svg", {
      scale: 1.035,
      filter:
        "drop-shadow(0 0 24px rgba(255,255,255,0.18)) drop-shadow(0 34px 90px rgba(0,0,0,0.65))",
      duration: 0.28,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });

  onWindowReady(() => {
    tl.eventCallback("onComplete", () => {
      localStorage.setItem(storageKey, "true");

      const exit = gsap.timeline({
        defaults: { ease: "expo.inOut" },
        onComplete: () => {
          loader.style.display = "none";
          gsap.set(body, { overflow: "" });
          runIntro();
          ScrollTrigger.refresh();
        },
      });

      exit
        .to(".px-loader", {
          y: -28,
          opacity: 0,
          scale: 0.92,
          duration: 0.55,
        })
        .to(
          loader,
          {
            yPercent: -100,
            duration: 0.9,
          },
          "-=0.08",
        );
    });
  });
}

function runMinimalLoader(loader) {
  loader.classList.add("is-minimal");

  gsap.set(body, { overflow: "hidden" });

  gsap.set(".px-signal-lines span", {
    display: "none",
  });

  gsap.set(".px-path", {
    strokeDasharray: 2200,
    strokeDashoffset: 2200,
    fill: "rgba(255,255,255,0)",
    stroke: "rgba(255,255,255,0.84)",
  });

  gsap.set(".px-loader-svg", {
    scale: 0.9,
    opacity: 0,
  });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  tl.to(".px-loader-svg", {
    scale: 1,
    opacity: 1,
    duration: 0.22,
  })
    .to(
      ".px-path",
      {
        strokeDashoffset: 0,
        duration: 0.42,
        stagger: 0.025,
        ease: "power2.out",
      },
      "-=0.08",
    )
    .to(".px-path", {
      fill: "rgba(255,255,255,0.94)",
      stroke: "rgba(255,255,255,0.18)",
      duration: 0.18,
    })
    .to(".px-loader-svg", {
      scale: 1.025,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
    });

  onWindowReady(() => {
    tl.eventCallback("onComplete", () => {
      const exit = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          loader.style.display = "none";
          gsap.set(body, { overflow: "" });
          runIntro();
          ScrollTrigger.refresh();
        },
      });

      exit
        .to(".px-loader", {
          opacity: 0,
          scale: 0.96,
          duration: 0.22,
        })
        .to(
          loader,
          {
            opacity: 0,
            duration: 0.28,
          },
          "-=0.05",
        );
    });
  });
}

function runIntro() {
  const nav = qs(".nav");
  if (nav) {
    gsap.from(nav, {
      y: -28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }

  if (qs(".split .split-word")) {
    gsap.from(".split .split-word", {
      yPercent: 115,
      opacity: 0,
      duration: 0.95,
      stagger: 0.018,
      ease: "expo.out",
    });
  }

  const heroIntroElements = qsa(
    ".hero-kicker, .hero-copy p, .hero-actions, .hero-proof",
  );

  if (heroIntroElements.length) {
    gsap.from(heroIntroElements, {
      y: 26,
      opacity: 0,
      duration: 0.72,
      stagger: 0.075,
      delay: 0.12,
      ease: "power3.out",
    });
  }

  const heroMediaElements = qsa(".hero-device-main, .x1-main-img");

  if (heroMediaElements.length) {
    gsap.from(heroMediaElements, {
      y: 44,
      scale: 0.94,
      opacity: 0,
      duration: 1,
      delay: 0.22,
      ease: "expo.out",
    });
  }

  const heroExtraElements = qsa(
    ".hero-device-left, .hero-device-right, .floating-chip, .product-badge, .signal-count-card, .trust-panel",
  );

  if (heroExtraElements.length) {
    gsap.from(heroExtraElements, {
      y: 34,
      scale: 0.94,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      delay: 0.35,
      ease: "expo.out",
    });
  }
}

function initNavigation() {
  const menuBtn = qs(SELECTORS.menuBtn);
  const mobileMenu = qs(SELECTORS.mobileMenu);

  menuBtn?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("active");
    body.classList.toggle("menu-open");
    menuBtn.classList.toggle("active");
  });

  qsa(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu?.classList.remove("active");
      body.classList.remove("menu-open");
      menuBtn?.classList.remove("active");
    });
  });

  qsa(SELECTORS.openHype).forEach((button) => {
    button.addEventListener("click", () => {
      mobileMenu?.classList.remove("active");
      body.classList.remove("menu-open");
      menuBtn?.classList.remove("active");
      openHypeModal();
    });
  });

  qsa(SELECTORS.closeHype).forEach((button) => {
    button.addEventListener("click", closeHypeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHypeModal();
      closeVerifyModal();
    }
  });

  qsa(SELECTORS.closeVerify).forEach((button) => {
    button.addEventListener("click", closeVerifyModal);
  });
}

function initHype() {
  qsa(SELECTORS.hypeForm).forEach((form) => {
    form.addEventListener("submit", handleHypeSubmit);
  });
}

function initSearch() {
  const searchInput = qs(SELECTORS.searchWall);

  searchInput?.addEventListener("input", () => {
    filterWall(searchInput.value);
  });

  if (page === "support") updateSearchStatus("Showing all supporters");
}

function initContactForm() {
  qsa(SELECTORS.contactForm).forEach((form) => {
    form.addEventListener("submit", handleContactSubmit);
  });
}

function initSplitText() {
  qsa(".split, .reveal-title").forEach((element) => {
    if (element.dataset.splitDone === "true") return;

    new SplitType(element, {
      types: "lines, words",
      lineClass: "split-line",
      wordClass: "split-word",
    });

    element.dataset.splitDone = "true";
  });
}

function initScrollAnimations() {
  qsa(".reveal-card, .section-head, .dark-head, .contact-info").forEach(
    (element) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
        },
        y: 42,
        opacity: 0,
        duration: 0.78,
        ease: "power3.out",
      });
    },
  );

  qsa(".reveal-title .split-word").forEach((word) => {
    gsap.from(word, {
      scrollTrigger: {
        trigger: word,
        start: "top 90%",
      },
      yPercent: 105,
      opacity: 0,
      duration: 0.7,
      ease: "expo.out",
    });
  });

  qsa("[data-speed]").forEach((element) => {
    const speed = Number(element.dataset.speed || 0.12);

    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
      y: () => window.innerHeight * speed,
      ease: "none",
    });
  });

  const heroDeviceWrap = qs(".hero-device-wrap");

  if (heroDeviceWrap) {
    const heroLeft = qs(".hero-device-left");
    const heroRight = qs(".hero-device-right");

    if (heroLeft) {
      gsap.to(heroLeft, {
        scrollTrigger: {
          trigger: heroDeviceWrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        x: -54,
        y: 24,
        rotate: -18,
        ease: "none",
      });
    }

    if (heroRight) {
      gsap.to(heroRight, {
        scrollTrigger: {
          trigger: heroDeviceWrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        x: 54,
        y: 22,
        rotate: 18,
        ease: "none",
      });
    }
  }

  const stars = qs(".stars");

  if (stars) {
    gsap.to(stars, {
      backgroundPosition: "240px 190px",
      duration: 18,
      repeat: -1,
      ease: "none",
    });
  }
}

function initCursorGlow() {
  const glow = qs(".cursor-glow");
  if (!glow) return;

  window.addEventListener("pointermove", (event) => {
    gsap.to(glow, {
      x: event.clientX,
      y: event.clientY,
      duration: 0.45,
      ease: "power3.out",
    });
  });
}

function initCardHover() {
  qsa(".reveal-card, .feature-card, .signal-tile, .supporter-card").forEach(
    (card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -7,
          scale: 1.01,
          duration: 0.25,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.34,
          ease: "power2.out",
        });
      });
    },
  );
}

function initTilt() {
  qsa(
    ".hero-device-main, .x1-main-img, .story-card img, .compare-card img",
  ).forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = gsap.utils.mapRange(0, rect.width, -4, 4, x);
      const rotateX = gsap.utils.mapRange(0, rect.height, 4, -4, y);

      gsap.to(element, {
        rotateX,
        rotateY,
        transformPerspective: 900,
        duration: 0.35,
        ease: "power3.out",
      });
    });

    element.addEventListener("pointerleave", () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.55,
        ease: "power3.out",
      });
    });
  });
}

function animateSupporterCards() {
  qsa(".supporter-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        delay: Math.min(index * 0.035, 0.3),
        ease: "power3.out",
      },
    );
  });
}

function initVideoCards() {
  qsa("video").forEach((video) => {
    video.addEventListener("mouseenter", () => {
      video.play().catch(() => {});
    });
  });
}

function initAssetsFallback() {
  qsa("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.background = "#f1eee7";
      img.style.objectFit = "contain";
      img.alt = `${img.alt || "Image"} missing. Check asset path.`;
    });
  });
}

async function initPage() {
  initNavigation();
  initHype();
  initSearch();
  initContactForm();
  initSplitText();
  initLoader();
  initScrollAnimations();
  initCursorGlow();
  initCardHover();
  initTilt();
  initVideoCards();
  initAssetsFallback();

  if (window.innerWidth <= 720) {
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
  }

  await refreshSignalStats();
  await handleVerifiedDraft();

  if (page === "support") await renderWall();

  ScrollTrigger.refresh();
}

initPage();
