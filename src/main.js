import "./style.css";
import "./pixxivo-extended.css";
import "./pixxivo-motion.css";
import "./pixxivo-v4.css";
import "./pixxivo-v5.css";
import "./pixxivo-v6.css";
import "./pixxivo-v7.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import { supabase, hasSupabaseConfig } from "./supabaseClient.js";

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const page = body.dataset.page || "home";

const SELECTORS = {menuBtn:'[data-menu-btn], .menu-btn',mobileMenu:'[data-mobile-menu], .mobile-menu',contactForm:'#contactForm, .contact-form'};

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

function showToast(message) {
 let toast=qs('.toast');
 if(!toast){toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');document.body.append(toast);}
 toast.textContent=message; toast.classList.add('show');
 setTimeout(()=>toast.classList.remove('show'),3800);
}
async function handleContactSubmit(event){
 event.preventDefault();const form=event.currentTarget;
 const fd=new FormData(form);const name=cleanText(fd.get('name'),60),email=cleanText(fd.get('email'),120),reason=cleanText(fd.get('reason'),80),message=cleanText(fd.get('message'),2000);
 if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!reason||message.length<10){showToast('Please complete the contact form.');return;}
 if(!hasSupabaseConfig){showToast('Contact form needs Supabase configuration.');return;}
 const button=form.querySelector('button[type="submit"]');const old=button?.innerHTML;
 if(button){button.disabled=true;button.textContent='Sending…';}
 try{
  const turnstileToken=form.querySelector('[name="cf-turnstile-response"]')?.value||'';
  const {data,error}=await supabase.functions.invoke('contact-email',{body:{name,email,reason,message,turnstileToken}});
  if(error||data?.error)throw new Error(data?.error||error?.message||'Could not deliver message.');
  form.reset();showToast('Message delivered. Thank you!');
 }catch(error){showToast('Could not send. Please try again later.');}
 finally{if(button){button.disabled=false;button.innerHTML=old;}if(window.turnstile)try{window.turnstile.reset();}catch{}}
}

function onWindowReady(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback, { once: true });
  }
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

function initNavigation(){
 const btn=qs(SELECTORS.menuBtn),menu=qs(SELECTORS.mobileMenu);
 btn?.addEventListener('click',()=>{const open=menu?.classList.toggle('active');body.classList.toggle('menu-open',Boolean(open));btn.classList.toggle('active',Boolean(open));btn.setAttribute('aria-expanded',String(Boolean(open)));});
 qsa('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>{menu?.classList.remove('active');body.classList.remove('menu-open');btn?.classList.remove('active');btn?.setAttribute('aria-expanded','false');}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('active');body.classList.remove('menu-open');btn?.classList.remove('active');btn?.setAttribute('aria-expanded','false');}});
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

function initPage(){
 initNavigation();initContactForm();initSplitText();runIntro();initScrollAnimations();initCursorGlow();initCardHover();initTilt();initVideoCards();initAssetsFallback();
 if(window.innerWidth<=720)ScrollTrigger.config({ignoreMobileResize:true});
 ScrollTrigger.refresh();
}
initPage();
