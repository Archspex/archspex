// ============================================================
//  link_shim.js — Universal "Open in new tab" support
// ------------------------------------------------------------
//  ZERO-INVASION event delegation. Does NOT add any DOM elements,
//  does NOT wrap anything, does NOT change z-index of existing content.
//  Just listens globally for middle-click / cmd-click / ctrl-click on
//  known routable elements and opens the corresponding hash URL in a
//  new tab. Plain left-click behaviour is left completely untouched.
//
//  Also converts specific non-card CTA buttons (Explore all products,
//  Submit RFQ, Request Sample, etc.) into real <a href> anchors so their
//  right-click "Open in New Tab" browser menu works natively.
// ============================================================
(function () {
  'use strict';

  // Onclick pattern → hash URL
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
    var oc = el && el.getAttribute && el.getAttribute('onclick');
    if (!oc) return null;
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = oc.match(PATTERNS[i].rx);
      if (m) {
        try { return PATTERNS[i].url(m); } catch (e) { return null; }
      }
    }
    return null;
  }

  var SELECTOR =
    '[onclick*="openProduct("], ' +
    '[onclick*="openBrandProfile("], ' +
    '[onclick*="openBrand("], ' +
    '[onclick*="openProjectDetail("], ' +
    '[onclick*="openProject("], ' +
    '[onclick*="openProfileDetail("], ' +
    '[onclick*="filterCatGo("], ' +
    '[onclick*="showPage("]';

  function findRoutableAncestor(node) {
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    while (node) {
      if (node.matches && node.matches(SELECTOR)) return node;
      // stop climbing out of the interactive card
      if (node === document.body) return null;
      node = node.parentElement;
    }
    return null;
  }

  // ── (1) Middle-click → new tab (auxclick fires reliably on mousedown/click for button 1)
  document.addEventListener('auxclick', function (e) {
    if (e.button !== 1) return; // middle only
    var t = findRoutableAncestor(e.target);
    if (!t) return;
    var url = extractUrl(t);
    if (!url) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank');
  }, true);

  // Some browsers don't fire auxclick reliably — belt-and-braces via mousedown
  document.addEventListener('mousedown', function (e) {
    if (e.button !== 1) return;
    var t = findRoutableAncestor(e.target);
    if (!t) return;
    e.preventDefault(); // suppress the default middle-click autoscroll cursor
  }, true);

  // ── (2) Cmd/Ctrl-click on left button → new tab (capture phase, before card's own click)
  document.addEventListener('click', function (e) {
    if (e.button !== 0) return;
    if (!(e.metaKey || e.ctrlKey)) return;
    var t = findRoutableAncestor(e.target);
    if (!t) return;
    // Don't hijack clicks that started on nested interactive elements the user
    // clearly meant to interact with (buttons, inputs, existing anchors)
    var inner = e.target.closest('button, a, input, select, textarea');
    if (inner && inner !== t && !inner.hasAttribute('data-ax-link-parent')) return;
    var url = extractUrl(t);
    if (!url) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank');
  }, true);

  // ── (3) Right-click support ONLY for a small allowlist of CTA buttons
  // For these specific buttons we convert them to real <a href> so the
  // browser's context menu shows "Open Link in New Tab" natively.
  // We restrict to buttons because divs already work in most browsers when
  // right-clicked (they show generic menu, no link items), and card divs
  // can't safely contain anchors.
  var CTA_BUTTON_TEXTS = [
    'Explore All Products',
    'Explore all products',
    'Browse All Products',
    'Browse all products',
    'Submit RFQ',
    'Request Sample',
    'Request a Sample',
    'View All Saved',
    'View All Brands',
    'View All Projects',
    'Browse Products',
    'View All',
  ];

  function upgradeButtonToLink(btn) {
    if (!btn || btn.tagName !== 'BUTTON') return;
    if (btn.getAttribute('data-ax-upgraded') === '1') return;
    var url = extractUrl(btn);
    if (!url) return;
    // Only upgrade CTA-style buttons matching one of our allowlisted texts
    var txt = (btn.textContent || '').trim();
    var isCta = false;
    for (var i = 0; i < CTA_BUTTON_TEXTS.length; i++) {
      if (txt.indexOf(CTA_BUTTON_TEXTS[i]) >= 0) { isCta = true; break; }
    }
    if (!isCta) return;
    // Convert <button> → <a href> keeping every attribute/class/style
    var a = document.createElement('a');
    a.href = url;
    a.setAttribute('data-ax-upgraded', '1');
    // Copy all attributes
    var attrs = btn.attributes;
    for (var j = 0; j < attrs.length; j++) {
      var at = attrs[j];
      if (at.name === 'type') continue; // skip button-specific
      a.setAttribute(at.name, at.value);
    }
    // Style anchor to render like the button (kill anchor defaults)
    var cs = window.getComputedStyle(btn);
    a.style.display = a.style.display || 'inline-flex';
    a.style.alignItems = a.style.alignItems || 'center';
    a.style.justifyContent = a.style.justifyContent || 'center';
    a.style.textDecoration = 'none';
    // Move the button's inner HTML into the anchor
    a.innerHTML = btn.innerHTML;
    // Plain click should still trigger the original onclick and NOT navigate
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // native new-tab
      e.preventDefault();
      // Fire the original onclick manually
      var oc = a.getAttribute('onclick');
      if (oc) {
        try { new Function('event', oc).call(a, e); } catch (err) {}
      }
    });
    btn.parentNode.replaceChild(a, btn);
  }

  function scanForCtaButtons(root) {
    (root || document).querySelectorAll('button[onclick]').forEach(upgradeButtonToLink);
  }

  function boot() {
    scanForCtaButtons(document);
    if (window.MutationObserver) {
      try {
        new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            for (var j = 0; j < muts[i].addedNodes.length; j++) {
              var n = muts[i].addedNodes[j];
              if (n && n.nodeType === 1) scanForCtaButtons(n);
            }
          }
        }).observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
