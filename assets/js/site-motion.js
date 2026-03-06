document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navbarFontSource = document.querySelector(
    "#navbar-main .nav-link, #navbar-main .navbar-brand",
  );
  if (navbarFontSource) {
    const navFont = window.getComputedStyle(navbarFontSource).fontFamily;
    if (navFont) {
      document.documentElement.style.setProperty("--site-font-family", navFont);
    }
  }

  const underlineTargets = [
    ...document.querySelectorAll(
      "#navbar-main .nav-link, #navbar-main .navbar-brand, .section-heading h1, .section-heading h2, .section-heading h3",
    ),
  ];

  underlineTargets.forEach((el) => {
    el.classList.add("underline-anim");
    if (reducedMotion) {
      return;
    }

    const runIn = () => {
      el.classList.remove("anim-out");
      // Restart keyframe when quickly re-hovering.
      void el.offsetWidth;
      el.classList.add("anim-in");
    };

    const runOut = () => {
      el.classList.remove("anim-in");
      void el.offsetWidth;
      el.classList.add("anim-out");
    };

    el.addEventListener("mouseenter", runIn);
    el.addEventListener("mouseleave", runOut);
    el.addEventListener("focusin", runIn);
    el.addEventListener("focusout", runOut);
  });

  const revealTargets = [
    ...document.querySelectorAll(".home-section, .view-card, .hero-media, .section-heading"),
  ];

  revealTargets.forEach((el, index) => {
    if (el.classList.contains("js-reveal")) {
      return;
    }
    el.classList.add("js-reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index * 40, 220)}ms`);
  });

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  const navbar = document.getElementById("navbar-main");
  if (navbar) {
    const toggleScrolled = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 18);
    };
    toggleScrolled();
    window.addEventListener("scroll", toggleScrolled, { passive: true });
  }
});
