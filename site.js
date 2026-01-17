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

// Contact form submit tracking (GA4) - tracks real submit attempt
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", () => {
    if (typeof gtag === "function") {
      gtag("event", "contact_form_submit", {
        event_category: "lead",
        event_label: window.location.pathname || "contact.html"
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

function trackEvent(name, label) {
  if (typeof gtag !== "function") return;

  gtag("event", name, {
    event_category: "lead",
    event_label: label,
    transport_type: "beacon"
  });
}

// Jim phone
document.querySelectorAll(".track-phone-jim").forEach(link => {
  link.addEventListener("click", () => {
    trackEvent("phone_jim_click", link.getAttribute("href") || "tel:jim");
  });
});

// Jim email
document.querySelectorAll(".track-email-jim").forEach(link => {
  link.addEventListener("click", () => {
    trackEvent("email_jim_click", link.getAttribute("href") || "mailto:jim");
  });
});

// Susan email
document.querySelectorAll(".track-email-susan").forEach(link => {
  link.addEventListener("click", () => {
    trackEvent("email_susan_click", link.getAttribute("href") || "mailto:susan");
  });
});