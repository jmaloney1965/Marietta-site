/* jargon-translator.js — Marietta Research Solutions
 *
 * Vanilla JS, no dependencies. Drop on any page with:
 *   <script src="jargon-translator.js?v=1" defer></script>
 *
 * Three behaviors:
 *   1. Auto-underlines glossary terms in <main> body content (dotted gold)
 *   2. Double-click any word -> popover with explanation
 *   3. Select 3+ chars of text -> floating "Explain that" button -> popover
 *
 * Data source order:
 *   a) Built-in static glossary (instant, no network)
 *   b) Claude API via window.claude.complete  -- gracefully no-ops if absent.
 *      On the live site, window.claude is NOT present, so AI fallback simply
 *      shows: "We don't have a glossary entry for that one."
 *      You can wire a real API call later by setting window.claude.complete.
 */
(function () {
  'use strict';

  // -------------------------------------------------------------------
  // Theme tokens (match site.css)
  // -------------------------------------------------------------------
  var NAVY = '#1f3a5f';
  var GOLD = '#E8B830';
  var INK = '#1a1a1a';
  var MUTE = '#6b7280';

  // -------------------------------------------------------------------
  // Static glossary
  // -------------------------------------------------------------------
  var GLOSSARY = {
    's11': {
      term: 'S11',
      plain: 'How much of the signal you put into the antenna bounces back instead of radiating. Lower (more negative dB) is better — it means more of your power is actually leaving the antenna.',
      deeper: 'S11 is the input port reflection coefficient, a complex-valued S-parameter. Typically reported in dB across frequency. Closely related to VSWR and return loss; all three describe the same physical mismatch in different units.',
      good_bad: 'Below −10 dB is the usual minimum bar (≈90% of power radiated). −15 dB or better is good; −20 dB is excellent.',
      matters: 'If the antenna in your product has poor S11, your range, battery life, and certification margin all suffer — even if the radio itself is fine.',
      related: ['VSWR', 'return loss', 'impedance match']
    },
    'vswr': {
      term: 'VSWR',
      plain: 'Voltage Standing Wave Ratio. Same idea as S11, just expressed as a ratio instead of dB. 1:1 is perfect; higher numbers mean worse mismatch.',
      deeper: 'VSWR = (1+|Γ|)/(1−|Γ|), where Γ is the reflection coefficient (S11 in linear units).',
      good_bad: 'VSWR ≤ 2.0:1 is the standard pass criterion (S11 ≤ −9.5 dB). ≤ 1.5:1 is good; ≤ 1.2:1 is excellent.',
      matters: 'Spec sheets and test labs both use VSWR. "VSWR < 2:1 over the band" means the antenna will work — barely. Push for tighter.',
      related: ['S11', 'return loss', 'matching network']
    },
    'return loss': {
      term: 'Return loss',
      plain: 'How much signal is lost back into the source because the antenna isn\'t a perfect match. Same physics as S11, expressed as a positive number.',
      deeper: 'Return loss = −S11 (in dB). A return loss of 10 dB means S11 is −10 dB.',
      good_bad: '10 dB minimum, 15+ dB good, 20+ dB excellent.',
      related: ['S11', 'VSWR']
    },
    'gain': {
      term: 'Gain',
      plain: 'How much an antenna concentrates the energy you give it in a particular direction, compared to a theoretical antenna that radiates equally in all directions. Measured in dBi.',
      deeper: 'Gain in dBi = directivity × radiation efficiency, in dB relative to an isotropic radiator. Distinct from amplifier gain; antennas don\'t add power, they reshape where it goes.',
      good_bad: 'Small chip antennas: 0–2 dBi. Patch antennas: 5–8 dBi. High-gain panels and dishes: 12–30+ dBi.',
      matters: 'More gain means more range in one direction — but less coverage everywhere else. Match the pattern to your use case, not to a number.',
      related: ['radiation pattern', 'directivity', 'efficiency']
    },
    'directivity': {
      term: 'Directivity',
      plain: 'How focused the antenna\'s radiation is, in its strongest direction, compared to one that radiates equally everywhere. Doesn\'t account for losses.',
      deeper: 'Ratio of radiation intensity in a given direction to the average over all directions. Gain = directivity × efficiency.',
      related: ['gain', 'radiation pattern', 'beamwidth']
    },
    'efficiency': {
      term: 'Antenna efficiency',
      plain: 'What fraction of the power you put into the antenna actually radiates as useful RF energy, instead of being lost as heat or reflected back.',
      deeper: 'Total efficiency = radiation efficiency × mismatch efficiency (1−|S11|²). Approaches the Chu limit for very small antennas.',
      good_bad: '50%+ workable for small antennas, 70%+ good, 90%+ excellent.',
      matters: 'Two antennas with the same gain spec can radiate very different amounts of power if their efficiencies differ. Always ask for both.',
      related: ['Chu limit', 'gain']
    },
    'chu limit': {
      term: 'Chu limit',
      plain: 'A fundamental physics bound on how efficient and how wideband a small antenna can be. The smaller the antenna, the harder it is to do both well — physics, not engineering, sets the ceiling.',
      deeper: 'L. J. Chu (1948), refined by Harrington, McLean. Relates the minimum achievable Q-factor to ka (electrical size). Lower Q = wider bandwidth × higher efficiency. As ka → 0, achievable Q → ∞.',
      matters: 'If a vendor claims a tiny antenna with high gain AND wide bandwidth AND high efficiency, the Chu limit lets you check whether they\'re telling the truth.',
      related: ['electrically small antenna', 'efficiency', 'Q-factor']
    },
    'electrically small antenna': {
      term: 'Electrically small antenna',
      plain: 'An antenna that\'s small compared to the wavelength it\'s transmitting at. The smaller it is, the harder it is to make efficient and wideband — that\'s the Chu limit.',
      deeper: 'ka < 1 (k=2π/λ, a is enclosing-sphere radius). Below ka ≈ 0.5 design becomes very challenging; below 0.3 you\'re fighting fundamental physics.',
      matters: 'Wearables, implantables, IoT sensors, cubesats are usually electrically small. Designing them well is a specialty — most generic antenna shops can\'t.',
      related: ['Chu limit', 'efficiency']
    },
    'fdtd': {
      term: 'FDTD',
      plain: 'Finite-Difference Time-Domain. A way of simulating electromagnetic fields by chopping space and time into a grid and solving Maxwell\'s equations step by step. Heavy compute, but accurate for complex 3D problems.',
      deeper: 'Yee\'s 1966 algorithm. Excellent for broadband (one run = full frequency response via FFT), arbitrary geometry, dispersive materials. Trade-off: large memory, fine timestep required by CFL stability.',
      matters: 'FDTD is what you want when frequency-domain solvers struggle — multiscale geometry, transient response, dispersive media. Marietta\'s solver is FDTD, written from scratch.',
      related: ['method of moments', 'CEM']
    },
    'fragmented aperture': {
      term: 'Fragmented aperture antenna',
      plain: 'An antenna whose conductive surface is broken into many small metal "pixels" arranged in a pattern optimized by computer. The pattern itself does the heavy lifting — wide bandwidth, multiple bands, or unusual radiation properties from a single flat surface.',
      deeper: 'Patented topology (US 6,323,809; 11,228,102; 11,937,270) combining genetic-algorithm optimization with FDTD evaluation. Yields wideband, multi-band, conformal, or low-RCS apertures unreachable by classical geometries.',
      matters: 'Best fit when off-the-shelf antennas can\'t cover your bands or fit your envelope. Dr. Maloney invented this; it\'s a core specialty.',
      related: ['genetic algorithm', 'aperture antenna', 'wideband antenna']
    },
    'phased array': {
      term: 'Phased array',
      plain: 'Many small antennas working together, with the relative timing of each one tweaked electronically to steer the combined beam without physically moving anything.',
      deeper: 'Beam steering via per-element phase (or true time delay) control. Each element\'s amplitude/phase weights determine the array factor.',
      matters: 'Phased arrays are increasingly common in radar, satcom, and 5G. They\'re also expensive and complex — design and calibration matter a lot.',
      related: ['beamforming', 'array factor']
    },
    'beamforming': {
      term: 'Beamforming',
      plain: 'Using a phased array to electronically point the radio beam where you want it — toward a satellite, away from interference, at a specific user.',
      deeper: 'Applies complex weights (amplitude + phase) per element to shape the radiation pattern. Analog (RF), digital (baseband), or hybrid implementations.',
      related: ['phased array', 'null steering']
    },
    'matching network': {
      term: 'Matching network',
      plain: 'A small circuit (usually 2–4 components) placed between the radio and the antenna to make their impedances agree, so power transfers efficiently instead of reflecting.',
      deeper: 'L, π, or T topologies of inductors and capacitors. Designed on a Smith chart to transform antenna impedance to 50 Ω at the design frequency.',
      matters: 'A poorly-tuned matching network is the #1 reason antennas underperform in real products. It\'s also the cheapest fix.',
      related: ['Smith chart', 'impedance match', 'S11']
    },
    'impedance match': {
      term: 'Impedance match',
      plain: 'When the antenna\'s impedance equals the radio\'s impedance (almost always 50 Ω), all the power transfers cleanly. Mismatch causes reflections, lost power, and weird behavior.',
      deeper: 'Conjugate match transfers maximum power. Practical "50 Ω match" treats source impedance as real.',
      related: ['matching network', 'S11', 'VSWR']
    },
    'rcs': {
      term: 'RCS',
      plain: 'Radar Cross Section. How visible an object is to radar. Measured in m² but usually expressed in dBsm. Lower is stealthier.',
      deeper: 'σ = lim(R→∞) 4πR² · |Es|²/|Ei|². Frequency-, aspect-, and polarization-dependent. Reduced by shaping, materials (RAM), and active means.',
      matters: 'For defense work, low RCS is often a hard requirement. Antennas are typically major RCS contributors and have to be designed with stealth in mind.',
      related: ['stealth', 'monostatic', 'bistatic']
    },
    'sbir': {
      term: 'SBIR',
      plain: 'Small Business Innovation Research. A US federal program that funds R&D at small businesses through Phase I (feasibility), II (development), and III (commercialization).',
      deeper: 'Set-aside across 11 federal agencies (DoD largest). Phase I ~$300K/6mo, Phase II ~$2M/2yr, Phase III commercialization (no $ cap, no special funding source).',
      related: ['STTR', 'Phase I/II/III']
    },
    'sttr': {
      term: 'STTR',
      plain: 'Small Business Technology Transfer. Like SBIR but requires partnering with a research institution (university, federal lab, nonprofit).',
      deeper: 'Same Phase I/II/III structure as SBIR. STTR requires ≥30% effort by a non-profit research partner; SBIR requires ≥66% effort by the small business.',
      related: ['SBIR']
    },
    'gerber': {
      term: 'Gerber files',
      plain: 'The standard file format used to manufacture printed circuit boards. Each layer (copper, soldermask, silkscreen) is one Gerber file. Hand these to a fab house and they make the board.',
      deeper: 'RS-274X (Extended Gerber) is the modern standard, with newer Gerber X2 adding metadata. Includes copper layers, drill files (Excellon), masks, silkscreen, board outline.',
      related: ['fabrication', 'PCB', 'RF laminate']
    },
    'fr4': {
      term: 'FR-4',
      plain: 'The cheap, ubiquitous green PCB material most electronics are built on. Works fine for low-frequency RF (under ~2.4 GHz). Above that, its losses get bad.',
      deeper: 'Woven fiberglass + epoxy. Dielectric constant ≈ 4.3, loss tangent ≈ 0.02. Switch to RF laminates (Rogers 4350, 4003C, RT/duroid) above ~3–5 GHz where loss matters.',
      related: ['Rogers', 'RF laminate', 'dielectric constant']
    }
  };

  var ALIASES = {
    'reflection coefficient': 's11',
    'antenna gain': 'gain',
    'antenna efficiency': 'efficiency',
    'radiation efficiency': 'efficiency',
    'electrically small': 'electrically small antenna',
    'esa': 'electrically small antenna',
    'finite-difference time-domain': 'fdtd',
    'fragmented aperture antenna': 'fragmented aperture',
    'phased arrays': 'phased array',
    'beam-forming': 'beamforming',
    'impedance matching': 'matching network',
    'l-network': 'matching network',
    'pi-network': 'matching network',
    'pi network': 'matching network',
    'radar cross section': 'rcs',
    'fr-4': 'fr4',
    'gerbers': 'gerber',
    'gerber file': 'gerber',
    'small business innovation research': 'sbir',
    'small business technology transfer': 'sttr'
  };

  // Words too short or too common to auto-underline (would create false positives)
  var IGNORE_AUTO = {
    'gain': true,    // verb collisions ("you'll gain ...")
    'matching': true,
    'array': true,
    'efficiency': true,
    'directivity': false // safe — rare outside RF
  };

  function normalize(t) {
    return String(t || '').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function lookup(term) {
    var n = normalize(term);
    if (GLOSSARY[n]) return GLOSSARY[n];
    if (ALIASES[n]) return GLOSSARY[ALIASES[n]];
    return null;
  }

  // -------------------------------------------------------------------
  // Inject CSS
  // -------------------------------------------------------------------
  var STYLE = [
    '.jt-term {',
    '  cursor: help;',
    '  text-decoration: underline dotted ' + GOLD + ';',
    '  text-decoration-thickness: 2px;',
    '  text-underline-offset: 3px;',
    '  transition: background-color 0.15s ease;',
    '}',
    '.jt-term:hover { background-color: rgba(232, 184, 48, 0.18); border-radius: 2px; }',
    '',
    '.jt-selection-btn {',
    '  position: fixed;',
    '  z-index: 9998;',
    '  background: ' + NAVY + ';',
    '  color: #fff;',
    '  border: none;',
    '  border-radius: 6px;',
    '  padding: 0.45rem 0.75rem;',
    '  font: 600 0.85rem -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;',
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.25);',
    '  cursor: pointer;',
    '  display: none;',
    '  align-items: center;',
    '  gap: 0.4rem;',
    '}',
    '.jt-selection-btn:hover { background: #16305a; }',
    '.jt-selection-btn::before {',
    '  content: "?";',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 16px;',
    '  height: 16px;',
    '  background: ' + GOLD + ';',
    '  color: ' + INK + ';',
    '  border-radius: 50%;',
    '  font-size: 0.75rem;',
    '  font-weight: 700;',
    '}',
    '',
    '.jt-popover {',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  z-index: 9999;',
    '  width: min(380px, calc(100vw - 24px));',
    '  background: #fff;',
    '  border: 1px solid rgba(0,0,0,0.08);',
    '  border-top: 3px solid ' + GOLD + ';',
    '  border-radius: 8px;',
    '  box-shadow: 0 12px 32px rgba(0,0,0,0.18);',
    '  padding: 1rem 1.1rem 1.1rem;',
    '  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;',
    '  color: ' + INK + ';',
    '}',
    '.jt-popover-header {',
    '  display: flex;',
    '  align-items: baseline;',
    '  justify-content: space-between;',
    '  gap: 0.75rem;',
    '  margin-bottom: 0.6rem;',
    '  padding-right: 1.75rem;',
    '}',
    '.jt-popover-term {',
    '  margin: 0;',
    '  color: ' + NAVY + ';',
    '  font-size: 1.05rem;',
    '  font-weight: 700;',
    '}',
    '.jt-popover-source {',
    '  font-size: 0.72rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.04em;',
    '  text-transform: uppercase;',
    '  color: ' + MUTE + ';',
    '}',
    '.jt-popover-close {',
    '  position: absolute;',
    '  top: 8px;',
    '  right: 10px;',
    '  background: transparent;',
    '  border: none;',
    '  font-size: 1.3rem;',
    '  line-height: 1;',
    '  color: ' + MUTE + ';',
    '  cursor: pointer;',
    '  padding: 4px 6px;',
    '}',
    '.jt-popover-close:hover { color: ' + INK + '; }',
    '.jt-popover p { margin: 0.45rem 0; }',
    '.jt-popover-plain { color: ' + INK + '; }',
    '.jt-popover-deeper {',
    '  margin-top: 0.55rem;',
    '  padding-top: 0.55rem;',
    '  border-top: 1px solid rgba(0,0,0,0.08);',
    '  color: #444;',
    '  font-size: 0.92em;',
    '}',
    '.jt-popover-meta {',
    '  margin-top: 0.55rem;',
    '  color: #444;',
    '  font-size: 0.92em;',
    '}',
    '.jt-popover-meta strong { color: ' + NAVY + '; }',
    '.jt-popover-related {',
    '  margin-top: 0.7rem;',
    '  padding-top: 0.55rem;',
    '  border-top: 1px solid rgba(0,0,0,0.08);',
    '  font-size: 0.85em;',
    '  color: ' + MUTE + ';',
    '}',
    '.jt-popover-related strong { color: ' + NAVY + '; }',
    '.jt-popover-related-tag {',
    '  display: inline-block;',
    '  margin: 0.15rem 0.3rem 0 0;',
    '  padding: 0.1rem 0.45rem;',
    '  background: rgba(31, 58, 95, 0.08);',
    '  color: ' + NAVY + ';',
    '  border-radius: 999px;',
    '  font-size: 0.85em;',
    '  cursor: pointer;',
    '}',
    '.jt-popover-related-tag:hover { background: rgba(31, 58, 95, 0.16); }',
    '.jt-popover-toggle {',
    '  background: transparent;',
    '  border: none;',
    '  color: ' + NAVY + ';',
    '  cursor: pointer;',
    '  font: 600 0.85rem inherit;',
    '  padding: 0.3rem 0;',
    '  text-decoration: underline;',
    '}',
    '.jt-popover-empty { color: ' + MUTE + '; font-style: italic; }'
  ].join('\n');

  function injectStyle() {
    if (document.getElementById('jt-style')) return;
    var s = document.createElement('style');
    s.id = 'jt-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  // -------------------------------------------------------------------
  // Auto-marker — wrap glossary terms in <main> with .jt-term spans
  // -------------------------------------------------------------------
  function buildPattern() {
    var keys = Object.keys(GLOSSARY).concat(Object.keys(ALIASES));
    keys = keys.filter(function (k) { return !IGNORE_AUTO[k]; });
    // Longest-first so multi-word terms match before single-word substrings
    keys.sort(function (a, b) { return b.length - a.length; });
    var escaped = keys.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    return new RegExp('\\b(' + escaped.join('|') + ')\\b', 'gi');
  }

  var SKIP_TAGS = {
    SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1, KBD: 1, SAMP: 1,
    A: 1, BUTTON: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1,
    H1: 1, H2: 1, H3: 1, H4: 1,
    NAV: 1, HEADER: 1, FOOTER: 1
  };

  function shouldSkipNode(node) {
    var p = node.parentNode;
    while (p && p !== document.body) {
      if (p.nodeType === 1) {
        if (SKIP_TAGS[p.tagName]) return true;
        if (p.classList && p.classList.contains('jt-term')) return true;
        if (p.classList && p.classList.contains('jt-popover')) return true;
        if (p.hasAttribute && p.hasAttribute('data-jt-skip')) return true;
      }
      p = p.parentNode;
    }
    return false;
  }

  function autoMark(root) {
    if (!root) return 0;
    var pattern = buildPattern();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkipNode(n)) return NodeFilter.FILTER_REJECT;
        if (!pattern.test(n.nodeValue)) { pattern.lastIndex = 0; return NodeFilter.FILTER_REJECT; }
        pattern.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var batch = [];
    var node;
    while ((node = walker.nextNode())) batch.push(node);

    var count = 0;
    batch.forEach(function (textNode) {
      var text = textNode.nodeValue;
      pattern.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var lastIdx = 0;
      var m;
      while ((m = pattern.exec(text))) {
        if (m.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
        }
        var span = document.createElement('span');
        span.className = 'jt-term';
        span.setAttribute('data-jt-term', m[0]);
        span.textContent = m[0];
        frag.appendChild(span);
        lastIdx = m.index + m[0].length;
        count++;
      }
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
      if (lastIdx > 0) textNode.parentNode.replaceChild(frag, textNode);
    });
    return count;
  }

  // -------------------------------------------------------------------
  // Popover
  // -------------------------------------------------------------------
  var activePopover = null;

  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
  }

  function escHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function buildPopoverHTML(data, source) {
    if (!data) {
      return '<button class="jt-popover-close" aria-label="Close">×</button>' +
             '<p class="jt-popover-empty">No explanation available.</p>';
    }
    var srcLabel = source === 'glossary' ? 'Glossary' : (source === 'ai' ? 'AI' : '');
    var html = '<button class="jt-popover-close" aria-label="Close">×</button>';
    html += '<div class="jt-popover-header">';
    html += '<h4 class="jt-popover-term">' + escHtml(data.term) + '</h4>';
    if (srcLabel) html += '<span class="jt-popover-source">' + srcLabel + '</span>';
    html += '</div>';
    html += '<p class="jt-popover-plain">' + escHtml(data.plain) + '</p>';

    if (data.good_bad) {
      html += '<p class="jt-popover-meta"><strong>Typical values: </strong>' + escHtml(data.good_bad) + '</p>';
    }
    if (data.matters) {
      html += '<p class="jt-popover-meta"><strong>Why it matters: </strong>' + escHtml(data.matters) + '</p>';
    }
    if (data.deeper) {
      html += '<button class="jt-popover-toggle" data-jt-toggle="deeper">Show technical detail ▾</button>';
      html += '<p class="jt-popover-deeper" data-jt-deeper hidden>' + escHtml(data.deeper) + '</p>';
    }
    if (data.related && data.related.length) {
      html += '<div class="jt-popover-related"><strong>Related:</strong> ';
      html += data.related.map(function (r) {
        return '<span class="jt-popover-related-tag" data-jt-related="' + escHtml(r) + '">' + escHtml(r) + '</span>';
      }).join('');
      html += '</div>';
    }
    return html;
  }

  function positionPopover(pop, anchorRect) {
    var popW = Math.min(380, window.innerWidth - 24);
    var margin = 8;
    pop.style.width = popW + 'px';

    // First measure
    var popH = pop.offsetHeight || 220;

    var top = anchorRect.bottom + margin + window.scrollY;
    if (anchorRect.bottom + popH + margin > window.innerHeight && anchorRect.top > popH + margin) {
      top = anchorRect.top - popH - margin + window.scrollY;
    }
    var left = anchorRect.left + window.scrollX;
    if (left + popW > window.innerWidth + window.scrollX - 12) {
      left = window.innerWidth + window.scrollX - popW - 12;
    }
    if (left < 12) left = 12;

    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function openPopover(anchorRect, term, contextText) {
    closePopover();
    var pop = document.createElement('div');
    pop.className = 'jt-popover';
    pop.setAttribute('data-jt-skip', '1');
    pop.innerHTML = '<button class="jt-popover-close" aria-label="Close">×</button>' +
                    '<p class="jt-popover-empty">Looking up "' + escHtml(term) + '"…</p>';
    document.body.appendChild(pop);
    activePopover = pop;
    positionPopover(pop, anchorRect);

    // Wire close
    pop.querySelector('.jt-popover-close').addEventListener('click', closePopover);

    // GA event
    if (typeof gtag === 'function') {
      gtag('event', 'jargon_lookup', {
        event_category: 'engagement',
        event_label: term,
        transport_type: 'beacon'
      });
    }

    var fromGlossary = lookup(term);
    if (fromGlossary) {
      renderInto(pop, fromGlossary, 'glossary', anchorRect);
      return;
    }

    // No glossary hit — try Claude if present, else show graceful empty
    if (window.claude && typeof window.claude.complete === 'function') {
      var prompt = 'Explain the RF/antenna engineering term "' + term + '" in 2 short sentences for a non-engineer. ' +
                   'If it is NOT an RF/electronics/antenna term, reply with exactly: NOT_RF.\n\n' +
                   (contextText ? ('Context: "' + contextText.slice(0, 300) + '"') : '');
      Promise.resolve(window.claude.complete(prompt))
        .then(function (text) {
          var t = String(text || '').trim();
          if (t.indexOf('NOT_RF') === 0) {
            renderInto(pop, {
              term: term,
              plain: 'This doesn\'t look like an RF or antenna term. Try selecting an engineering or RF-specific phrase.'
            }, 'ai', anchorRect);
          } else {
            renderInto(pop, { term: term, plain: t }, 'ai', anchorRect);
          }
        })
        .catch(function () {
          renderInto(pop, fallbackData(term), 'glossary', anchorRect);
        });
    } else {
      renderInto(pop, fallbackData(term), 'glossary', anchorRect);
    }
  }

  function fallbackData(term) {
    return {
      term: term,
      plain: 'We don\'t have a glossary entry for "' + term + '" yet. ' +
             'For a precise answer, contact us — we\'re happy to explain RF and antenna terminology in plain English.',
      related: ['Contact us']
    };
  }

  function renderInto(pop, data, source, anchorRect) {
    pop.innerHTML = buildPopoverHTML(data, source);
    positionPopover(pop, anchorRect);

    pop.querySelector('.jt-popover-close').addEventListener('click', closePopover);

    var toggle = pop.querySelector('[data-jt-toggle="deeper"]');
    var deeper = pop.querySelector('[data-jt-deeper]');
    if (toggle && deeper) {
      toggle.addEventListener('click', function () {
        if (deeper.hasAttribute('hidden')) {
          deeper.removeAttribute('hidden');
          toggle.textContent = 'Hide technical detail ▴';
        } else {
          deeper.setAttribute('hidden', '');
          toggle.textContent = 'Show technical detail ▾';
        }
        positionPopover(pop, anchorRect);
      });
    }

    Array.prototype.forEach.call(pop.querySelectorAll('[data-jt-related]'), function (tag) {
      tag.addEventListener('click', function () {
        var newTerm = tag.getAttribute('data-jt-related');
        var rect = pop.getBoundingClientRect();
        openPopover(rect, newTerm, '');
      });
    });
  }

  // -------------------------------------------------------------------
  // Click handler for auto-marked terms
  // -------------------------------------------------------------------
  function handleTermClick(e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains('jt-term')) return;
    e.preventDefault();
    e.stopPropagation();
    openPopover(t.getBoundingClientRect(), t.getAttribute('data-jt-term') || t.textContent, '');
  }

  // -------------------------------------------------------------------
  // Double-click any word
  // -------------------------------------------------------------------
  function handleDoubleClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.jt-popover')) return;
    if (t.closest('.jt-term')) return; // already handled
    if (t.closest('a, button, input, textarea, select, code, pre')) return;
    if (t.closest('nav, header, footer')) return;

    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    var word = sel.toString().trim();
    if (!word || word.length < 3 || word.length > 40) return;
    if (/\s/.test(word) || /^\d+$/.test(word)) return;

    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    // Get a small context snippet for AI fallback
    var contextEl = t.closest('p, li, td, div');
    var contextText = contextEl ? contextEl.textContent : '';
    openPopover(rect, word, contextText);
  }

  // -------------------------------------------------------------------
  // Selection -> floating "Explain that" button
  // -------------------------------------------------------------------
  var selectionBtn = null;

  function ensureSelectionBtn() {
    if (selectionBtn) return selectionBtn;
    selectionBtn = document.createElement('button');
    selectionBtn.className = 'jt-selection-btn';
    selectionBtn.setAttribute('data-jt-skip', '1');
    selectionBtn.textContent = 'Explain that';
    selectionBtn.addEventListener('mousedown', function (e) { e.preventDefault(); }); // don't lose selection
    selectionBtn.addEventListener('click', function () {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var phrase = sel.toString().trim();
      if (!phrase) return;
      var range = sel.getRangeAt(0);
      var rect = range.getBoundingClientRect();
      var contextEl = range.startContainer.parentElement
        ? range.startContainer.parentElement.closest('p, li, td, div')
        : null;
      var contextText = contextEl ? contextEl.textContent : '';
      hideSelectionBtn();
      openPopover(rect, phrase, contextText);
      sel.removeAllRanges();
    });
    document.body.appendChild(selectionBtn);
    return selectionBtn;
  }

  function showSelectionBtn(rect) {
    var btn = ensureSelectionBtn();
    btn.style.display = 'inline-flex';
    var top = rect.top - 44;
    if (top < 8) top = rect.bottom + 8;
    var left = rect.left + (rect.width / 2) - 60;
    if (left < 8) left = 8;
    if (left + 140 > window.innerWidth) left = window.innerWidth - 148;
    btn.style.top = top + 'px';
    btn.style.left = left + 'px';
  }

  function hideSelectionBtn() {
    if (selectionBtn) selectionBtn.style.display = 'none';
  }

  function handleSelectionChange() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      hideSelectionBtn();
      return;
    }
    var text = sel.toString().trim();
    if (text.length < 3 || text.length > 200) {
      hideSelectionBtn();
      return;
    }
    // Don't show inside form fields
    var range = sel.getRangeAt(0);
    var anchor = range.startContainer.parentElement;
    if (!anchor) { hideSelectionBtn(); return; }
    if (anchor.closest('input, textarea, select, .jt-popover')) {
      hideSelectionBtn();
      return;
    }
    if (!anchor.closest('main, .container, body')) {
      hideSelectionBtn();
      return;
    }
    var rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { hideSelectionBtn(); return; }
    showSelectionBtn(rect);
  }

  // -------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------
  function init() {
    injectStyle();

    // Auto-mark glossary terms in main content
    var root = document.querySelector('main') ||
               document.querySelector('.container') ||
               document.body;
    try { autoMark(root); } catch (err) { /* swallow */ }

    document.addEventListener('click', handleTermClick);
    document.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('selectionchange', handleSelectionChange);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopover();
        hideSelectionBtn();
      }
    });

    // Close on outside click
    document.addEventListener('mousedown', function (e) {
      if (activePopover && !activePopover.contains(e.target)) {
        var t = e.target;
        if (t && t.closest && (t.closest('.jt-term') || t.closest('.jt-selection-btn'))) return;
        closePopover();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
