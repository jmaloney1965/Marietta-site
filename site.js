/* site.js - shared behavior across pages:
   - Back to top button
   - Mobile CTA bar (Option 1: appears after scroll)
   - GA4 click tracking for Capabilities PDF
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

// Contact form submit tracking (GA4)
const contactSubmitBtn = document.getElementById("contactSubmitBtn") || document.getElementById("submitBtn");

if (contactSubmitBtn) {
  contactSubmitBtn.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", "contact_form_submit", {
        event_category: "lead",
        event_label: "contact.html"
      });
    }
  });
}

  // Capabilities PDF click tracking (GA4)
  // Use this class on any link you want to track:
  // <a class="capabilities-link" href="capabilities.pdf" ...>Capabilities (PDF)</a>
  document.querySelectorAll(".capabilities-link").forEach(link => {
    link.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "capabilities_pdf_click", {
          event_category: "engagement",
          event_label: "capabilities.pdf"
        });
      }
    });
  });
})();