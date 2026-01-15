/* site.js - shared behavior across pages:
   - Back to top button
   - Mobile CTA bar (Option 1: appears after scroll)
*/

(function () {
  // Back to top
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      backToTopBtn.style.display =
        (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mobile CTA show/hide (Option 1)
  const ctaBar = document.querySelector(".mobile-cta");
  function toggleCTA() {
    if (!ctaBar) return;

    if (window.scrollY > 140 && window.innerWidth <= 700) {
      ctaBar.style.display = "block";
      document.body.classList.add("mobile-cta-on");
    } else {
      ctaBar.style.display = "none";
      document.body.classList.remove("mobile-cta-on");
    }
  }

  window.addEventListener("scroll", toggleCTA);
  window.addEventListener("resize", toggleCTA);
  toggleCTA();
})();