/* site.js - shared behavior across pages:
   - Back to top button
   - Mobile CTA bar (Option 1: appears after scroll)
   - GA4 tracking: form submit, capabilities PDF, phone/email clicks
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

  // Helper: reliable GA send on mobile (beacon)
  function trackEvent(name, label, category) {
    if (typeof gtag !== "function") return;
    gtag("event", name, {
      event_category: category || "lead",
      event_label: label || "",
      transport_type: "beacon"
    });
  }

  // Contact form submit tracking (GA4) - tracks real submit attempt
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", () => {
      trackEvent(
        "contact_form_submit",
        window.location.pathname || "contact.html",
        "lead"
      );
    });
  }

  // Capabilities PDF click tracking (GA4)
  document.querySelectorAll(".capabilities-link").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("capabilities_pdf_click", link.getAttribute("href") || "capabilities.pdf", "engagement");
    });
  });

  // info email
  document.querySelectorAll(".track-email-info").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("email_info_click", link.getAttribute("href") || "mailto:info", "lead");
    });
  });

  // Susan email
  document.querySelectorAll(".track-email-susan").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("email_susan_click", link.getAttribute("href") || "mailto:susan", "lead");
    });
  });

})();