# SEO Audit — Server-Side Fixes

The DeepAudit AI report (May 23 2026) flagged **5 issues that cannot be fixed in
HTML/CSS** — they require changes to your web server's HTTP response headers.
Since you deploy on **GitHub Pages**, you have two options:

1. **Easiest:** put the site behind a CDN proxy (Cloudflare free plan) and add the
   headers as a Cloudflare Transform Rule. ~10 minutes.
2. **Self-hosted:** if you migrate to a custom server (Nginx, Apache, Netlify,
   Vercel, etc.), use the snippets below.

> **Why these matter:** Search engines, browsers, and AI crawlers use these
> headers as trust signals. Missing them won't break the site, but they lower
> the security/quality grade Google and others assign you.

---

## 1. HSTS (Strict-Transport-Security) — ISSUE

Tells browsers to only ever load your site over HTTPS. Adds preload eligibility.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Cloudflare:** Dashboard → SSL/TLS → Edge Certificates → Enable HSTS.

**Nginx:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Apache (.htaccess):**
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

---

## 2. Content Security Policy — WARNING

Mitigates XSS. Start permissive and tighten later.

```
Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none';
```

---

## 3. X-Content-Type-Options — WARNING

Stops MIME-sniffing attacks.

```
X-Content-Type-Options: nosniff
```

---

## 4. Clickjacking protection — WARNING

Use the modern CSP `frame-ancestors` directive (already in #2) *and* the legacy
header for old browsers:

```
X-Frame-Options: DENY
```

---

## 5. Referrer-Policy — WARNING

Strip referrer info on cross-origin navigations.

```
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Cloudflare Transform Rule (recommended) — all five at once

In Cloudflare → Rules → Transform Rules → "Modify Response Header":

| Action | Header name                  | Value                                                                 |
|--------|------------------------------|-----------------------------------------------------------------------|
| Set    | `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains`                                 |
| Set    | `X-Content-Type-Options`     | `nosniff`                                                             |
| Set    | `X-Frame-Options`            | `DENY`                                                                |
| Set    | `Referrer-Policy`            | `strict-origin-when-cross-origin`                                     |
| Set    | `Content-Security-Policy`    | *(see #2 above)*                                                      |

Apply the rule to `(http.request.uri.path matches ".*")`.

After deploying, re-run the audit — Security should jump from **67 → 95+**.
