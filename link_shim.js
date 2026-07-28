// ============================================================
//  link_shim.js — Universal "Open in new tab" support
// ------------------------------------------------------------
//  Non-invasive shim. Adds a full-card invisible <a href="#..."> overlay to
//  every clickable card/tile that opens a route (product, brand, project,
//  professional, category, page). The overlay gives the browser:
//    - right-click "Open in Link in New Tab" native menu
//    - cmd/ctrl-click → new tab
//    - middle-click → new tab
//    - shift-click → new window
//  Plain left-click is intercepted (preventDefault) and the underlying
//  element's original onclick is invoked, so SPA nav behaviour is preserved.
//
//  Child interactive elements (buttons, inputs, anchors) inside the card get
//  z-index bumped so their own clicks still work.
// ============================================================
(function () {
  'use strict';

  // Patterns: each entry maps an onclick pattern to a URL hash.
  // The regex captures the id (group 2 usually; group 1 is optional quote).
  var PATTERNS = [
    { rx: /openProduct\((['"]?)([^'")]+)/,       url: function(m){ return '#product/' + encodeURIComponent(m[2]); } },
    { rx: /openBrandProfile\((['"]?)([^'")]+)/,  url: function(m){ return '#brand-' + encodeURIComponent(m[2]); } },
    { rx: /openBrand\((['"]?)([^'")]+)/,         url: function(m){ return '#brand-' + encodeURIComponent(m[2]); } },
    { rx: /openProjectDetail\((['"]?)([^'")]+)/, url: function(m){ return '#project/' + encodeURIComponent(m[2]); } },
    { rx: /openProject\((['"]?)([^'")]+)/,       url: function(m){ return '#project/' + encodeURIComponent(m[2]); } },
    { rx: /openProfileDetail\((['"]?)([^'")]+)/, url: function(m){ return '#professional/' + encodeURIComponent(m[2]); } },
    { rx: /filterCatGo\((['"]?)([^'")]+)/,       url: function(m){ return '#products'; } },
    { rx: /showPage\((['"])([^'"]+)\2\s*\)/,     url: function(m){ return '#' + m[2]; } },
  ];

  function extractUrl(el) {
    var oc = el.getAttribute('onclick');
    if (!oc) return null;
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = oc.match(PATTERNS[i].rx);
      if (m) {
        try { return PATTERNS[i].url(m); } catch (e) { return null; }
      }
    }
    return null;
  }

  function addOverlay(el) {
    if (!el || el.nodeType !== 1) return;
    // Skip if already an anchor, or already processed, or is itself inside an overlay
    if (el.tagName === 'A') return;
    if (el.getAttribute('data-ax-linkable') === '1') return;
    if (el.closest('.__ax_link_overlay')) return;
    // Skip elements the user clearly doesn't want linked (dropdowns, toolbar buttons)
    if (el.classList.contains('nav-link')) return; // topbar nav is already an anchor via patch
    if (el.classList.contains('sec-tab')) return;
    if (el.classList.contains('subcat-pill')) return;
    if (el.classList.contains('cat-strip-item')) return;
    if (el.classList.contains('side-item')) return;

    var url = extractUrl(el);
    if (!url) return;

    // Give the card a positioning context if it's static.
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { cs = null; }
    if (cs && cs.position === 'static') el.style.position = 'relative';

    // Build the overlay <a>.
    var a = document.createElement('a');
    a.className = '__ax_link_overlay';
    a.href = url;
    a.setAttribute('aria-hidden', 'true');
    a.setAttribute('tabindex', '-1');
    // Sits above card background, below interactive children (which we bump to z-index:2).
    a.style.cssText = 'position:absolute;inset:0;z-index:1;display:block;color:transparent;text-decoration:none;background:transparent;border-radius:inherit';

    // Plain click: preventDefault + fire the original onclick from the card.
    a.addEventListener('click', function (e) {
      // Modifier / middle-click → let browser open in new tab/window naturally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      // Fire the underlying card's onclick as if it were clicked directly
      try {
        var oc = el.getAttribute('onclick');
        if (oc) new Function('event', oc).call(el, e);
        else if (typeof el.onclick === 'function') el.onclick(e);
      } catch (err) {
        try { console.warn('[link_shim] failed to invoke onclick:', err); } catch (e2) {}
      }
    });

    el.appendChild(a);
    el.setAttribute('data-ax-linkable', '1');

    // Bump z-index of interactive children so they stay clickable above the overlay.
    // Only touch children that haven't already been positioned.
    var kids = el.querySelectorAll('button, a:not(.__ax_link_overlay), input, select, textarea, [role="button"]');
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      var ks;
      try { ks = window.getComputedStyle(k); } catch (e) { continue; }
      // Only set z-index if not already positioned above 1
      if (!ks || (parseInt(ks.zIndex, 10) || 0) < 2) {
        if (ks && ks.position === 'static') k.style.position = 'relative';
        k.style.zIndex = '2';
      }
    }
  }

  // Selector for anything that COULD be routable. We still gate via extractUrl().
  var SELECTOR =
    '[onclick*="openProduct("], ' +
    '[onclick*="openBrandProfile("], ' +
    '[onclick*="openBrand("], ' +
    '[onclick*="openProjectDetail("], ' +
    '[onclick*="openProject("], ' +
    '[onclick*="openProfileDetail("], ' +
    '[onclick*="filterCatGo("]';

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 1) {
      // check the node itself if it matches
      if (root.matches && root.matches(SELECTOR)) addOverlay(root);
      // then its descendants
      if (root.querySelectorAll) {
        var els = root.querySelectorAll(SELECTOR);
        for (var i = 0; i < els.length; i++) addOverlay(els[i]);
      }
    }
  }

  function boot() {
    scan(document.body);
    if (window.MutationObserver) {
      try {
        var obs = new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            for (var j = 0; j < m.addedNodes.length; j++) scan(m.addedNodes[j]);
          }
        });
        obs.observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
