document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  syncSiteFontWithNavbar();
  initUnderlineAnimations(reducedMotion);
  initRevealAnimations(reducedMotion);
  initNavbarScrollState();
  initAnimatedBackgroundMedia();
  initThemeToggle();
});

function syncSiteFontWithNavbar() {
  const source = document.querySelector("#navbar-main .nav-link, #navbar-main .navbar-brand");
  if (!source) {
    return;
  }

  const navFont = window.getComputedStyle(source).fontFamily;
  if (navFont) {
    document.documentElement.style.setProperty("--site-font-family", navFont);
  }
}

function initUnderlineAnimations(reducedMotion) {
  const targets = document.querySelectorAll(
    "#navbar-main .nav-link, #navbar-main .navbar-brand, .section-heading h1, .section-heading h2, .section-heading h3",
  );

  targets.forEach((el) => {
    el.classList.add("underline-anim");

    if (reducedMotion) {
      return;
    }

    const animateIn = () => {
      el.classList.remove("anim-out");
      void el.offsetWidth;
      el.classList.add("anim-in");
    };

    const animateOut = () => {
      el.classList.remove("anim-in");
      void el.offsetWidth;
      el.classList.add("anim-out");
    };

    el.addEventListener("mouseenter", animateIn);
    el.addEventListener("mouseleave", animateOut);
    el.addEventListener("focusin", animateIn);
    el.addEventListener("focusout", animateOut);
  });
}

function initRevealAnimations(reducedMotion) {
  const revealTargets = document.querySelectorAll(
    ".home-section, .view-card, .hero-media, .section-heading, .people-person",
  );

  revealTargets.forEach((el, index) => {
    if (!el.classList.contains("js-reveal")) {
      el.classList.add("js-reveal");
    }
    el.style.setProperty("--reveal-delay", `${Math.min(index * 35, 220)}ms`);
  });

  if (!("IntersectionObserver" in window) || reducedMotion) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  revealTargets.forEach((el) => observer.observe(el));
}

function initNavbarScrollState() {
  const navbar = document.getElementById("navbar-main");
  const pageHeader = document.querySelector(".page-header");
  const pageWrapper = document.querySelector(".page-wrapper");
  const affiliationsBar = document.querySelector(".affiliations-bar");
  
  if (!navbar || !pageHeader) {
    return;
  }

  // Initialize navbar state based on page type
  const hasAffiliationsBar = !!affiliationsBar;
  
  if (!hasAffiliationsBar) {
    // Non-homepage pages: navbar fixed immediately
    pageHeader.classList.add("is-fixed");
    if (pageWrapper) {
      pageWrapper.classList.add("navbar-fixed-top");
    }
  }

  const toggleScrolled = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 18);
    
    // Homepage: make navbar fixed when affiliations bar scrolls out of view
    if (hasAffiliationsBar) {
      const affiliationsHeight = affiliationsBar.offsetHeight || 0;
      const shouldBeFixed = window.scrollY > affiliationsHeight;
      pageHeader.classList.toggle("is-fixed", shouldBeFixed);
      if (pageWrapper) {
        pageWrapper.classList.toggle("navbar-fixed-top", shouldBeFixed);
      }
    }
  };

  window.addEventListener("scroll", toggleScrolled, { passive: true });
}

function initAnimatedBackgroundMedia() {
  const media = document.querySelector(".animated-bg video");
  if (!media) {
    return;
  }

  const tryPlay = () => {
    const promise = media.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        // Ignore autoplay restrictions; user interaction can still start playback.
      });
    }
  };

  tryPlay();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tryPlay();
    }
  });
}

function initThemeToggle() {
  const themeToggleBtn = document.querySelector(".theme-toggle-btn");
  if (!themeToggleBtn) {
    return;
  }

  const sunIcon = themeToggleBtn.querySelector(".fa-sun");
  const moonIcon = themeToggleBtn.querySelector(".fa-moon");
  
  const updateThemeIcon = () => {
    const isDark = document.body.classList.contains("dark");
    if (isDark) {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    } else {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    }
  };

  themeToggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isDark = document.body.classList.contains("dark");
    
    // Toggle dark class on body
    document.body.classList.toggle("dark");
    
    // Save preference to localStorage
    const newTheme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("wc-theme", newTheme);
    
    updateThemeIcon();
  });

  // Update icon on page load
  updateThemeIcon();
}

