/**
 * Scripts to remove — tracking, analytics, and heavyweight unused bundles.
 * Matched against src attribute substrings.
 */
const BLOCKED_SCRIPT_SRCS = [
  "googletagmanager.com",
  "google-analytics.com",
  "analytics.js",
  "gtag",
  "facebook.net",
  "connect.facebook",
  "fbevents.js",
  "whatsapp",
  "wa.me",
  "elementor",
  "woocommerce",
  "wp-embed",
];

/** Inline script content substrings that identify tracking code to remove. */
const BLOCKED_INLINE_PATTERNS = [
  "GoogleTagManager",
  "gtag(",
  "ga(",
  "fbq(",
  "facebook",
  "_gaq",
  "whatsapp",
];

/** Mobile CSS injected into every page to fix edX/WordPress desktop layouts. */
const MOBILE_CSS = `
/* ── Madrasa Mobile Overrides ── */
:root { --mobile-nav-h: 64px; }

/* Base mobile reset */
html, body {
  max-width: 100vw !important;
  overflow-x: hidden !important;
  -webkit-text-size-adjust: 100%;
}

/* Viewport fix for edX */
.window-wrap, #main, .container, .course-index, .courseware-wrapper {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  box-sizing: border-box !important;
}

/* Hide edX desktop sidebars and nav */
.course-tabs, .courseware-bookmarks-button,
.courseware-seq-nav-btn-list, #global-navigation,
.learning-header, .learning-header__logo,
footer.wrapper-footer, .nav-skip { display: none !important; }

/* edX video player — full width */
.video, .video-wrapper, .xblock-student_view-video {
  width: 100% !important;
  max-width: 100% !important;
}

/* Typography */
body { font-size: 16px !important; line-height: 1.6 !important; }
h1 { font-size: 1.5rem !important; }
h2 { font-size: 1.25rem !important; }

/* Buttons — minimum touch target */
button, .btn, a.button, input[type="submit"] {
  min-height: 44px !important;
  min-width: 44px !important;
}

/* WordPress/Elementor layout cleanup */
.elementor-section, .wp-block-group {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.elementor-column { width: 100% !important; float: none !important; }

/* Safe area padding */
body { padding-bottom: env(safe-area-inset-bottom) !important; }
`;

class ScriptRemover implements HTMLRewriterElementContentHandlers {
  element(element: Element) {
    const src = element.getAttribute("src") ?? "";
    const type = element.getAttribute("type") ?? "";

    // Remove external tracking scripts
    if (src && BLOCKED_SCRIPT_SRCS.some((b) => src.includes(b))) {
      element.remove();
      return;
    }

    // Inline scripts are filtered by content in text() below
    void (src || type); // used above
  }

  text(text: Text) {
    if (BLOCKED_INLINE_PATTERNS.some((p) => text.text.includes(p))) {
      text.remove();
    }
  }
}

class MobileCSSInjector implements HTMLRewriterElementContentHandlers {
  element(element: Element) {
    element.append(`<style id="madrasa-mobile">${MOBILE_CSS}</style>`, { html: true });
  }
}

class ViewportFixer implements HTMLRewriterElementContentHandlers {
  element(element: Element) {
    if (element.getAttribute("name") === "viewport") {
      element.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
    }
  }
}

class ViewportInserter implements HTMLRewriterElementContentHandlers {
  element(element: Element) {
    element.prepend(
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
      { html: true }
    );
  }
}

/** Apply all transforms to a Response using Cloudflare HTMLRewriter. */
export function transformResponse(response: Response): Response {
  return new HTMLRewriter()
    .on("script", new ScriptRemover())
    .on("head", new MobileCSSInjector())
    .on('meta[name="viewport"]', new ViewportFixer())
    .on("head", new ViewportInserter())
    .transform(response);
}
