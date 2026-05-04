/* site.js — shared behavior across pages
   - Back to top button
   - Mobile CTA bar
   - GA4 tracking: form submit, capabilities PDF, phone/email clicks
   - GA4 tracking: openTDA Viewer downloads (per platform)  [NEW]
   - GA4 tracking: outbound link clicks                      [NEW]
*/

(function () {
  // -------------------------------------------------------------------
  // Back to top
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // Mobile CTA show/hide
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // GA4 helper — reliable send via beacon
  // -------------------------------------------------------------------
  function trackEvent(name, params) {
    if (typeof gtag !== "function") return;
    gtag("event", name, Object.assign(
      { transport_type: "beacon" },
      params || {}
    ));
  }

  // Backwards-compatible 3-arg shim used by older code paths
  function trackLegacy(name, label, category) {
    trackEvent(name, {
      event_category: category || "lead",
      event_label: label || ""
    });
  }

  // -------------------------------------------------------------------
  // Contact form submit tracking (GA4)
  // -------------------------------------------------------------------
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", () => {
      // Capture which "Service of Interest" the lead picked, for funnel analysis
      const service = contactForm.querySelector('[name="service"]');
      trackEvent("contact_form_submit", {
        event_category: "lead",
        event_label: window.location.pathname || "contact.html",
        service_of_interest: service ? service.value : "(unknown)"
      });
    });
  }

  // -------------------------------------------------------------------
  // Capabilities PDF click tracking (GA4)
  // -------------------------------------------------------------------
  document.querySelectorAll(".capabilities-link").forEach(link => {
    link.addEventListener("click", () => {
      trackLegacy("capabilities_pdf_click", link.getAttribute("href") || "capabilities.pdf", "engagement");
    });
  });

  // -------------------------------------------------------------------
  // Email click tracking (GA4)
  // -------------------------------------------------------------------
  document.querySelectorAll(".track-email-info").forEach(link => {
    link.addEventListener("click", () => {
      trackLegacy("email_info_click", link.getAttribute("href") || "mailto:info", "lead");
    });
  });

  document.querySelectorAll(".track-email-susan").forEach(link => {
    link.addEventListener("click", () => {
      trackLegacy("email_susan_click", link.getAttribute("href") || "mailto:susan", "lead");
    });
  });

  // -------------------------------------------------------------------
  // openTDA Viewer download tracking (GA4)
  // -------------------------------------------------------------------
  // Any link with class="track-download" gets tracked. The data-platform
  // attribute identifies which build (macos-arm, macos-intel, windows, deb,
  // appimage). data-version optional (defaults to v0.3.1).
  document.querySelectorAll("a.track-download").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("software_download", {
        event_category: "conversion",
        event_label: link.getAttribute("data-platform") || "unknown",
        software_name: link.getAttribute("data-software") || "openTDA Viewer",
        software_version: link.getAttribute("data-version") || "v0.3.1",
        platform: link.getAttribute("data-platform") || "unknown",
        link_url: link.getAttribute("href") || ""
      });
    });
  });

  // -------------------------------------------------------------------
  // Outbound link tracking (GA4)
  // -------------------------------------------------------------------
  // Any <a> with target="_blank" pointing off-domain gets tracked.
  // Excludes mailto:, tel:, and the capabilities PDF (handled separately).
  const HOSTNAME = window.location.hostname;
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (link.classList.contains("capabilities-link")) return;
    if (link.classList.contains("track-download")) return; // already tracked above

    let outboundHost = "";
    try { outboundHost = new URL(href, window.location.href).hostname; } catch (_) { return; }
    if (!outboundHost || outboundHost === HOSTNAME) return;

    link.addEventListener("click", () => {
      trackEvent("outbound_click", {
        event_category: "engagement",
        event_label: href,
        outbound_host: outboundHost
      });
    });
  });

  // -------------------------------------------------------------------
  // Phone tap tracking (GA4) — mobile users tapping tel: links
  // -------------------------------------------------------------------
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener("click", () => {
      trackLegacy("phone_click", link.getAttribute("href") || "", "lead");
    });
  });

})();
