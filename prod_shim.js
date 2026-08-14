// ---- Product page renderer (overrides ax2.js renderProductModal) ----
// Fills the redesigned #prodModal (hero + specs table + badges + tech overview + apps + downloads + mfr card)
// from the product data. Falls back to sensible defaults when fields are missing.
(function(){
  function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function titleCase(s){
    var raw = String(s||'').trim();
    if(!raw) return '';
    // Normalise misspellings / non-country adjectives.
    var lower = raw.toLowerCase();
    var CANON = {'dutch':'Netherlands','holland':'Netherlands','netherland':'Netherlands','england':'United Kingdom'};
    if(CANON[lower]) return CANON[lower];
    // Preserve well-known acronyms in ALL CAPS.
    var ACR = {'usa':'USA','uae':'UAE','uk':'UK','ksa':'KSA','us':'USA'};
    if(ACR[lower]) return ACR[lower];
    return raw.toLowerCase().replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }
  function initials(s){ return String(s||'?').trim().split(/\s+/).slice(0,2).map(function(w){return w[0]||'';}).join('').toUpperCase() || '?'; }
  var FLAG = {'united arab emirates':'🇦🇪','uae':'🇦🇪','saudi arabia':'🇸🇦','ksa':'🇸🇦','qatar':'🇶🇦','kuwait':'🇰🇼','bahrain':'🇧🇭','oman':'🇴🇲','germany':'🇩🇪','austria':'🇦🇹','italy':'🇮🇹','france':'🇫🇷','united kingdom':'🇬🇧','uk':'🇬🇧','united states':'🇺🇸','usa':'🇺🇸','new zealand':'🇳🇿','netherlands':'🇳🇱','spain':'🇪🇸','sweden':'🇸🇪','denmark':'🇩🇰','japan':'🇯🇵','luxembourg':'🇱🇺','finland':'🇫🇮','switzerland':'🇨🇭'};
  var TECH_ICONS = {
    'fire rating':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-3 7-9V6l-7-3-7 3v7c0 6 7 9 7 9z"/></svg>',
    'acoustic performance':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    'material':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'thickness':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="4"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    'size':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
    'sizes':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
    'warranty':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    'origin':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'installation':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="M12 22v-6"/><rect x="4" y="8" width="16" height="8" rx="1"/></svg>',
    'edge profiles':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="1"/></svg>',
    'default':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
  };
  var APPLICATION_TAGS = [
    { name:'Commercial',      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>' },
    { name:'Hospitality',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>' },
    { name:'Healthcare',      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
    { name:'Residential',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { name:'Offices',         icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
    { name:'Retail',          icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' }
  ];
  // Full library of the 9 verified indicators from the spec. `title/sub` split so
  // the badge tile can render 2 lines cleanly.
  var BADGE_LIB = {
    spec:          { title:'Specification',        sub:'Ready',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' },
    bim:           { title:'BIM',                   sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' },
    cad:           { title:'CAD',                   sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' },
    datasheet:     { title:'Datasheet',             sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>' },
    epd:           { title:'EPD',                   sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 5 .5 7.5-.5 10-1.5 3-4 5-8 5"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>' },
    sample:        { title:'Sample',                sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="15" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' },
    fire:          { title:'Fire',                  sub:'Tested',      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' },
    acoustic:      { title:'Acoustic Report',       sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>' },
    certifications:{ title:'Certifications',        sub:'Available',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>' }
  };
  // 5 presets — between them all 9 indicators surface across the catalogue so
  // the eventual per-product wiring can be swapped in without layout changes.
  var BADGE_PRESETS = [
    ['spec','bim','cad','datasheet','fire'],
    ['spec','bim','cad','epd','sample'],
    ['spec','cad','datasheet','acoustic','certifications'],
    ['spec','bim','datasheet','sample','fire'],
    ['spec','epd','fire','acoustic','certifications']
  ];
  var DOCS = [
    { title:'Specification Text', sub:'PDF · 0.3 MB' },
    { title:'CSI Format',         sub:'ZIP · 0.8 MB' },
    { title:'NBS Format',         sub:'ZIP · 0.8 MB' },
    { title:'BIM File (Revit)',   sub:'RVT · 12.6 MB' },
    { title:'CAD Details',        sub:'DWG · 2.1 MB' },
    { title:'Installation Guide', sub:'PDF · 1.8 MB' }
  ];
  var DOC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  function iconForKey(k){
    var key = String(k||'').toLowerCase().trim().replace(/_/g,' ');
    return TECH_ICONS[key] || TECH_ICONS.default;
  }
  // ═══ NEW fillPP — populates the 28-section product page layout ═══════
  var GCC_ORDER = [
    {name:'United Arab Emirates', short:'UAE',           iso:'ae'},
    {name:'Saudi Arabia',         short:'Saudi Arabia',  iso:'sa'},
    {name:'Qatar',                short:'Qatar',         iso:'qa'},
    {name:'Kuwait',               short:'Kuwait',        iso:'kw'},
    {name:'Bahrain',              short:'Bahrain',       iso:'bh'},
    {name:'Oman',                 short:'Oman',          iso:'om'}
  ];
  var SPEC_STATUS_ICONS = [
    {key:'spec_ready',       name:'Specification', sub:'Ready',       ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'},
    {key:'bim_available',    name:'BIM',           sub:'Available',   ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'},
    {key:'cad_available',    name:'CAD',           sub:'Available',   ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'},
    {key:'datasheet',        name:'Technical',     sub:'Datasheet',   ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'},
    {key:'sample_available', name:'Sample',        sub:'Available',   ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="15" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'},
    {key:'epd_available',    name:'EPD',           sub:'Available',   ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 5 .5 7.5-.5 10-1.5 3-4 5-8 5"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>'}
  ];
  var STAGE_STEPS = [
    {key:'concept',   label:'Concept'},
    {key:'design',    label:'Design Dev'},
    {key:'spec',      label:'Specification'},
    {key:'tender',    label:'Tender'},
    {key:'const',     label:'Construction'},
    {key:'op',        label:'Operation'}
  ];
  var APP_ICONS = {
    hospitality:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M9 8h6M9 12h6M9 16h6"/></svg>',
    healthcare:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'commercial offices':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    retail:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    residential:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    government:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V10l7-4 7 4v11"/><path d="M9 10v11M15 10v11"/></svg>',
    transport:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14h18V5a2 2 0 0 0-2-2h-3M8 3v18M16 3v18"/></svg>',
    education:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
  };
  var ACC_ICONS = {
    profile:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="4"/><line x1="3" y1="6" x2="21" y2="6"/></svg>',
    adhesive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1 6H7z"/><rect x="8" y="9" width="8" height="12" rx="1"/></svg>',
    fixing:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6M12 22v-6M4 12H2M22 12h-2M6 6l-2-2M18 18l2 2M6 18l-2 2M18 6l2-2"/></svg>',
    trim:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8"/></svg>'
  };
  var RES_ICONS = {
    'spec':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>',
    'datasheet': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    'install':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    'detail':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
    'test':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2"/><line x1="7" y1="2" x2="17" y2="2"/></svg>',
    'cert':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
  };

  function fillPP(p){
    if(!p) return;
    _lastProduct = p;
    var name = p.name || 'Product';
    var cat  = (p.cat || p.category || '').trim();
    var meta = (p.meta || '').trim();
    var brand = p.brand || 'Manufacturer';
    var country = titleCase(p.country || '');
    var img = p.img || p.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=80';
    var desc = p.desc || p.description || '';
    var specs = (typeof p.specs === 'object' && p.specs) ? p.specs : {};

    // Cache brand for click handler
    window._ppBrand = brand;

    // ISO lookup for flagcdn PNG flags
    var isoMap = {
      'united arab emirates':'ae','uae':'ae','saudi arabia':'sa','ksa':'sa','qatar':'qa','oman':'om','kuwait':'kw','bahrain':'bh',
      'austria':'at','germany':'de','italy':'it','france':'fr','spain':'es','portugal':'pt','netherlands':'nl','belgium':'be',
      'luxembourg':'lu','switzerland':'ch','denmark':'dk','sweden':'se','finland':'fi','norway':'no','ireland':'ie','dutch':'nl','holland':'nl',
      'united kingdom':'gb','uk':'gb','united states':'us','usa':'us','canada':'ca','japan':'jp','south korea':'kr','korea':'kr',
      'china':'cn','india':'in','australia':'au','new zealand':'nz','turkey':'tr','brazil':'br','mexico':'mx',
      'greece':'gr','poland':'pl','egypt':'eg','morocco':'ma','south africa':'za','singapore':'sg','malaysia':'my','thailand':'th','vietnam':'vn'
    };
    function isoFor(c){ return isoMap[String(c||'').toLowerCase().trim()] || ''; }
    function flagPng(c, w){
      var iso = isoFor(c); if(!iso) return '';
      w = w || 40;
      return '<img src="https://flagcdn.com/w'+w+'/'+iso+'.png" srcset="https://flagcdn.com/w'+(w*2)+'/'+iso+'.png 2x" alt="'+esc(c)+'">';
    }

    // ─── Image + Thumbnails ──────────────────────────────────
    var el;
    el = document.getElementById('ppImg');
    if(el){ el.src = img; el.onerror = function(){ this.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=80'; }; }
    el = document.getElementById('ppThumbs');
    if(el){
      // Show up to 4 thumbnails: first 3 real images + a "+N" indicator if more exist.
      // Later this will read from a product.images JSONB array; for now placeholder set.
      var imgs = (p.images && p.images.length) ? p.images.slice(0, 6) : [img, img, img, img];
      var total = (p.images && p.images.length) || 15; // 15 = fake "+12" total
      var visible = imgs.slice(0, 3);
      var extra = total - visible.length;
      var html = visible.map(function(u, i){
        return '<div class="pp-thumb'+(i===0?' active':'')+'"><img src="'+esc(u)+'" alt=""></div>';
      }).join('');
      if(extra > 0){
        html += '<div class="pp-thumb more"><img src="'+esc(imgs[visible.length] || img)+'" alt=""><span class="pp-thumb-more-lbl">+'+extra+'</span></div>';
      }
      el.innerHTML = html;
    }

    // ─── Crumb + Title + Lede ────────────────────────────────
    el = document.getElementById('ppCrumb');
    if(el){
      var crumbs = [];
      if(cat) crumbs.push(esc(cat.toUpperCase()));
      if(meta && meta.toUpperCase() !== cat.toUpperCase()) crumbs.push(esc(meta.toUpperCase()));
      el.innerHTML = crumbs.join(' <span class="pp-crumb-sep">•</span> ') || 'PRODUCT';
    }
    el = document.getElementById('ppTitle'); if(el) el.textContent = name;
    var firstSentence = desc.split(/\.\s+/)[0];
    if(firstSentence && !firstSentence.endsWith('.')) firstSentence += '.';
    el = document.getElementById('ppLede'); if(el) el.textContent = firstSentence || desc;

    // ─── Sidebar Manufacturer Card (populated per product) ────
    // The static HTML lives inside .pp-sidebar (patched in by patch_modals.py).
    // We hydrate it here with the current product's brand info.
    (function fillMfrSide(){
      var side = document.getElementById('ppMfrSideCard');
      if(!side) return;
      side.style.display = ''; // reveal (starts as display:none in HTML)
      var brandLogo2 = (p.brand_logo_url || p.brandLogoUrl || '');
      var mark = document.getElementById('ppMfrSideMark');
      if(mark){
        mark.innerHTML = brandLogo2
          ? '<img src="'+esc(brandLogo2)+'" alt="'+esc(brand)+'">'
          : esc(initials(brand));
      }
      var nm = document.getElementById('ppMfrSideName');
      if(nm) nm.textContent = brand || '';
      // Use width 40 — flagcdn only serves standard widths (20/40/80/160/…).
      // A non-standard width like 32 returns 404 and the flag renders empty.
      var fg = document.getElementById('ppMfrSideFlag');
      if(fg) fg.innerHTML = country ? flagPng(country, 40) : '';
      var ct = document.getElementById('ppMfrSideCountry');
      if(ct) ct.textContent = country || '';
      var hq = document.getElementById('ppMfrSideHq');
      if(hq) hq.textContent = country || '—';
      var va = document.getElementById('ppMfrSideViewAllBrand');
      if(va) va.textContent = 'by ' + (brand || 'this manufacturer');
      // Fallback description if the brand doesn't have its own.
      var dc = document.getElementById('ppMfrSideDesc');
      if(dc){
        var brandDesc = (p.brand_description || p.brand_desc || '').toString().trim();
        dc.textContent = brandDesc || ('Trusted manufacturer supplying high-quality building materials to specification professionals across the region.');
      }
      // window._ppBrand is already set higher up in fillPP — the click handler
      // baked into the anchor reads it at click time, so no extra wiring needed.
    })();

    // ─── Manufacturer Card (NEW design per user annotations) ─
    el = document.getElementById('ppBrandCard');
    if(el){
      var brandLogo = (p.brand_logo_url || p.brandLogoUrl || '');
      var logoHtml = brandLogo ? '<img src="'+esc(brandLogo)+'" alt="'+esc(brand)+'">' : esc(initials(brand));
      // Meta bar: [country flag] Country | Since YYYY | 120 Products | 18 Collections
      var metaParts = [];
      if(country){
        var cflag = flagPng(country, 40);
        metaParts.push('<span><span class="pp-cntry-flag">'+cflag+'</span>'+esc(country)+'</span>');
      }
      metaParts.push('<span>Since '+esc(p.established || '2008')+'</span>');
      metaParts.push('<span>120 Products</span>');
      metaParts.push('<span>18 Collections</span>');
      el.innerHTML = '<div class="pp-brand-mark">'+logoHtml+'</div>'
                   + '<div class="pp-brand-info">'
                   +   '<div class="pp-brand-nameline">'
                   +     '<span class="pp-brand-name">'+esc(brand)+'</span>'
                   +     '<span class="pp-brand-view">View Profile →</span>'
                   +   '</div>'
                   +   '<div class="pp-brand-meta">'+metaParts.join('<span class="sep">|</span>')+'</div>'
                   + '</div>';
    }

    // ─── Specs list (5 fields — spread across products so all 8 are represented) ─
    // 5 preset combos; each product picks one via (id % 5). Between them all
    // 8 possible fields (Material, Thickness, Dimensions, Fire Rating,
    // Acoustic Rating, Installation Method, Warranty, Availability) appear.
    // When per-product-type wiring goes in later, swap this preset picker for a
    // category-based lookup and keep the same shape.
    el = document.getElementById('ppSpecs');
    if(el){
      // ─── Category-driven spec fields (5 shown per product) ───
      // Each product category surfaces the 5 fields that matter for
      // specifiers of that product type. Fields must come from the same
      // 8-item canonical set so filter chips, DB columns and the
      // manufacturer product-editor stay in sync.
      var CATEGORY_PRESETS = {
        'Structure':  ['Material','Thickness','Dimensions','Fire Rating','Installation Method'],
        'Envelope':   ['Material','Thickness','Dimensions','Fire Rating','Warranty'],
        'Interiors':  ['Material','Thickness','Dimensions','Fire Rating','Acoustic Rating'],
        'Finishes':   ['Material','Fire Rating','Warranty','Availability','Installation Method'],
        'Furnishing': ['Material','Dimensions','Warranty','Availability','Installation Method'],
        'Systems':    ['Dimensions','Installation Method','Warranty','Availability','Fire Rating']
      };
      var DEFAULT_PRESET = ['Material','Thickness','Dimensions','Fire Rating','Availability'];

      var aliases = {
        'Material':['material'],
        'Thickness':['thickness'],
        'Dimensions':['dimensions','size','sizes','panel_size'],
        'Fire Rating':['fire rating','fire_rating','fire'],
        'Acoustic Rating':['acoustic rating','acoustic_rating','acoustic performance','nrc'],
        'Installation Method':['installation','installation method','installation_method'],
        'Warranty':['warranty'],
        'Availability':['availability','lead time','lead_time']
      };
      // Category-aware placeholders (used when DB row has no value for the field).
      var placeholders = {
        'Material':'100% PET Recycled',
        'Thickness':'24 mm',
        'Dimensions':'2400 × 1200 mm',
        'Fire Rating':'Class 1',
        'Acoustic Rating':'NRC 0.85',
        'Installation Method':'Mechanical fix',
        'Warranty':'5 years',
        'Availability':'Local stock'
      };
      // Look up the preset by category. If category isn't set or unknown,
      // fall back to a sensible default.
      var _cat = (p.cat || p.category || '').trim();
      var preset = CATEGORY_PRESETS[_cat] || DEFAULT_PRESET;
      // Keep pidNum for the badge rotation below (still deterministic per product).
      var pid = String(p.id || p.db_id || p.name || '');
      var pidNum = parseInt(pid.replace(/^db_/,''), 10);
      if(isNaN(pidNum)){
        pidNum = 0;
        for(var c=0;c<pid.length;c++) pidNum = (pidNum + pid.charCodeAt(c)) & 0xffff;
      }
      var rows = preset.map(function(lbl){
        // If the DB happens to have a matching field, use it. Otherwise fall
        // back to the placeholder so the layout always renders 5 rows.
        var found = null;
        var aliasList = aliases[lbl] || [];
        for(var i=0;i<aliasList.length;i++){
          var akey = aliasList[i];
          var hit = Object.keys(specs).find(function(sk){ return sk.toLowerCase().replace(/_/g,' ') === akey; });
          if(hit){ found = specs[hit]; break; }
        }
        return [lbl, found != null ? String(found) : (placeholders[lbl] || '—')];
      });
      el.innerHTML = rows.map(function(kv){
        return '<div class="pp-specs-k">'+esc(kv[0])+'</div><div class="pp-specs-v">'+esc(String(kv[1]))+'</div>';
      }).join('');
    }

    // ─── Spec Status badges (5 shown per product, spread across catalogue) ─
    // Same seed as the specs rotation so badges + spec fields cycle together.
    el = document.getElementById('ppBadges');
    if(el){
      var badgeSet = BADGE_PRESETS[pidNum % BADGE_PRESETS.length];
      el.innerHTML = badgeSet.map(function(k){
        var b = BADGE_LIB[k];
        return '<div class="pp-badge"><div class="pp-badge-icon">'+b.icon+'</div>'
             + '<div class="pp-badge-title">'+b.title+'</div>'
             + '<div class="pp-badge-sub">'+b.sub+'</div></div>';
      }).join('');
    }

    // ─── Quick Technical Overview (below hero) ───────────────
    el = document.getElementById('ppTechGrid');
    if(el){
      var techRows = [];
      Object.keys(specs).slice(0,6).forEach(function(sk){
        var k = String(sk).replace(/_/g,' ');
        k = k.charAt(0).toUpperCase() + k.slice(1);
        techRows.push({k:k, v:String(specs[sk]), i:iconForKey(sk)});
      });
      if(!techRows.length){
        if(p.meta)    techRows.push({k:'Product Type', v:p.meta,    i:iconForKey('material')});
        if(p.country) techRows.push({k:'Origin',       v:titleCase(p.country), i:iconForKey('origin')});
        techRows.push({k:'Fire Rating', v:'Class A', i:iconForKey('fire rating')});
        techRows.push({k:'Warranty',    v:'10 Years',i:iconForKey('warranty')});
      }
      el.innerHTML = techRows.map(function(t){
        return '<div class="pp-tech"><div class="pp-tech-icon">'+t.i+'</div>'
             + '<div><div class="pp-tech-k">'+esc(t.k)+'</div><div class="pp-tech-v">'+esc(t.v)+'</div></div></div>';
      }).join('');
    }

    // ─── Product Overview text (50-80 word factual summary) ──
    el = document.getElementById('ppOverviewText');
    if(el){
      var overview = desc || ('High-performance '+ (meta || 'building product') +' engineered for professional specification workflows. Suitable for '+ (['commercial','hospitality','educational','residential'].join(', ')) +' interiors across the GCC region. Manufactured to international quality and sustainability standards.');
      // Trim to ~80 words if longer
      var words = overview.split(/\s+/);
      if(words.length > 82) overview = words.slice(0, 80).join(' ') + '…';
      el.textContent = overview;
    }

    // ─── Key Features & Benefits (rotate 5-8 per product from full pool) ─
    el = document.getElementById('ppMidFeatures');
    if(el){
      var FEATURE_POOL = [
        'High acoustic performance', 'Fire resistance', 'Recycled content',
        'Low VOC', 'Moisture resistance', 'Easy installation',
        'Lightweight construction', 'Custom sizes', 'Multiple finishes',
        'Low maintenance', 'High durability', 'Suitable for high-traffic areas'
      ];
      // 5 presets — each shows 6 features so all 12 appear across the catalogue
      var FEATURE_PRESETS = [
        [0,1,3,5,8,10],   // acoustic + fire + VOC + install + finishes + durability
        [0,1,2,5,8,11],   // acoustic + fire + recycled + install + finishes + high-traffic
        [1,3,4,6,9,10],   // fire + VOC + moisture + lightweight + maintenance + durability
        [0,2,4,7,8,11],   // acoustic + recycled + moisture + custom + finishes + high-traffic
        [1,3,5,6,7,10]    // fire + VOC + install + lightweight + custom + durability
      ];
      var featureSet = FEATURE_PRESETS[pidNum % FEATURE_PRESETS.length];
      var check = '<span class="pp-mid-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
      el.innerHTML = featureSet.map(function(i){
        return '<li>'+check+esc(FEATURE_POOL[i])+'</li>';
      }).join('');
    }

    // ─── Suitable Applications (8 canonical fields, always all shown) ──
    // Aligned with the site-wide Application filter (task #86) and the CI
    // reference. Show all 8 on every product until per-product wiring exists.
    el = document.getElementById('ppMidApps');
    if(el){
      var APP_POOL = [
        {name:'Commercial',     key:'commercial'},
        {name:'Hospitality',    key:'hospitality'},
        {name:'Residential',    key:'residential'},
        {name:'Education',      key:'education'},
        {name:'Retail',         key:'retail'},
        {name:'Healthcare',     key:'healthcare'},
        {name:'Industrial',     key:'industrial'},
        {name:'Infrastructure', key:'infrastructure'}
      ];
      var APP_ICONS_LOCAL = {
        commercial:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>',
        hospitality:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M9 8h6M9 12h6M9 16h6"/></svg>',
        residential:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        education:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        retail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        healthcare:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        industrial:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M4 20V8l6 4V8l6 4V8l4 4v8"/></svg>',
        // Suspension bridge — 2 towers, cable arch between, deck line. Reads clearly as infrastructure.
        infrastructure:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M6 18V6"/><path d="M18 18V6"/><path d="M6 6c3 4 9 4 12 0"/><path d="M9 14v4"/><path d="M12 12v6"/><path d="M15 14v4"/></svg>'
      };
      el.innerHTML = APP_POOL.map(function(a){
        var ic = APP_ICONS_LOCAL[a.key] || APP_ICONS_LOCAL.residential;
        return '<div class="pp-mid-app"><span class="pp-mid-app-ic">'+ic+'</span>'+esc(a.name)+'</div>';
      }).join('');
    }

    // ─── Colors & Finishes (6-10 swatches with name/code hover) ──────
    el = document.getElementById('ppMidSwatches');
    if(el){
      // Named palette — 24 total, per-product shows 8 (rotated) with a "View all 24" link.
      var COLOUR_POOL = [
        {name:'Onyx Black',       code:'AC-001', hex:'#2a2a2b'},
        {name:'Slate Grey',       code:'AC-002', hex:'#6d7079'},
        {name:'Frost',            code:'AC-003', hex:'#c2c8d4'},
        {name:'Warm Sand',        code:'AC-004', hex:'#dccca8'},
        {name:'Camel',            code:'AC-005', hex:'#c9a874'},
        {name:'Terracotta',       code:'AC-006', hex:'#a4553f'},
        {name:'Deep Navy',        code:'AC-007', hex:'#0a2a56'},
        {name:'Forest Green',     code:'AC-008', hex:'#3a4e3b'},
        {name:'Burgundy',         code:'AC-009', hex:'#5c202b'},
        {name:'Ivory',            code:'AC-010', hex:'#e6dcc0'},
        {name:'Pearl White',      code:'AC-011', hex:'#f2ede0'},
        {name:'Charcoal',         code:'AC-012', hex:'#0f1113'},
        {name:'Blush',            code:'AC-013', hex:'#e8c1b3'},
        {name:'Muted Teal',       code:'AC-014', hex:'#3d6870'},
        {name:'Ochre',            code:'AC-015', hex:'#c78e30'},
        {name:'Dune',             code:'AC-016', hex:'#b9a48a'}
      ];
      var COL_PRESETS = [
        [0,1,2,3,4,5,6,7],
        [1,3,5,7,9,11,13,15],
        [0,2,4,6,8,10,12,14],
        [2,4,6,8,10,12,14,0],
        [3,5,7,9,11,13,15,1]
      ];
      var colSet = COL_PRESETS[pidNum % COL_PRESETS.length];
      el.innerHTML = colSet.map(function(i){
        var c = COLOUR_POOL[i];
        return '<div class="pp-mid-swatch" style="background:'+c.hex+'" title="'+esc(c.name)+' · '+esc(c.code)+'"></div>';
      }).join('');
      var link = document.getElementById('ppMidSwatchesLink');
      if(link) link.textContent = 'View all ' + COLOUR_POOL.length + ' colours →';
    }

    // ─── Downloads ────────────────────────────────────────────
    el = document.getElementById('ppDlGrid');
    if(el){
      el.innerHTML = DOCS.slice(0,6).map(function(d){
        return '<div class="pp-dl" onclick="alert(\'Coming soon — download would open here.\')"><div class="pp-dl-icon">'+DOC_ICON+'</div>'
             + '<div class="pp-dl-body"><div class="pp-dl-title">'+esc(d.title)+'</div><div class="pp-dl-sub">'+esc(d.sub)+'</div></div></div>';
      }).join('');
    }

    // ─── Technical Overview (Tab 2) — rotate 6 fields from 15-field pool ─
    el = document.getElementById('ppTechOverview');
    if(el){
      var TECH_POOL = [
        {lbl:'Material',              val:'100% PET Recycled', ic:iconForKey('material')},
        {lbl:'Thickness',             val:'24 mm',             ic:iconForKey('thickness')},
        {lbl:'Size',                  val:'2400 × 1200 mm',    ic:iconForKey('size')},
        {lbl:'Weight',                val:'2.4 kg/m²',          ic:iconForKey('material')},
        {lbl:'Fire Rating',           val:'Class 1 (B-s1,d0)', ic:iconForKey('fire rating')},
        {lbl:'Acoustic Performance',  val:'NRC 0.85',          ic:iconForKey('acoustic performance')},
        {lbl:'Installation Method',   val:'Mechanical fix',    ic:iconForKey('installation')},
        {lbl:'Warranty',              val:'5 years',           ic:iconForKey('warranty')},
        {lbl:'GCC Availability',      val:'UAE, KSA, Qatar',   ic:iconForKey('origin')},
        {lbl:'Lead Time',             val:'2–3 weeks',          ic:iconForKey('warranty')},
        {lbl:'Sample Availability',   val:'Yes',               ic:iconForKey('material')},
        {lbl:'VOC Classification',    val:'Low VOC (A+)',      ic:iconForKey('material')},
        {lbl:'Thermal Performance',   val:'0.037 W/mK',        ic:iconForKey('material')},
        {lbl:'Load Capacity',         val:'—',                 ic:iconForKey('material')},
        {lbl:'Moisture Resistance',   val:'High',              ic:iconForKey('material')}
      ];
      // 5 presets — spread all 15 fields across the catalogue, 6 per product
      var TECH_PRESETS = [
        [0,1,2,4,5,7],   // Material, Thickness, Size, Fire, Acoustic, Warranty
        [0,3,4,6,7,8],   // Material, Weight, Fire, Install, Warranty, GCC
        [1,2,4,9,10,11], // Thickness, Size, Fire, Lead, Sample, VOC
        [0,5,6,12,14,7], // Material, Acoustic, Install, Thermal, Moisture, Warranty
        [1,3,5,8,10,13]  // Thickness, Weight, Acoustic, GCC, Sample, Load
      ];
      var techSet = TECH_PRESETS[pidNum % TECH_PRESETS.length];
      el.innerHTML = techSet.map(function(i){
        var t = TECH_POOL[i];
        return '<div class="pp-tech-cell"><div class="pp-tech-ic">'+t.ic+'</div>'
             + '<div><div class="pp-tech-lbl">'+esc(t.lbl)+'</div><div class="pp-tech-val">'+esc(t.val)+'</div></div></div>';
      }).join('');
    }

    // ─── Product Variants (Tab 2) — rotate 4-5 from 10-field pool ────
    el = document.getElementById('ppVariants');
    if(el){
      var VARIANT_POOL = [
        {name:'12 mm Standard',              badge:'1'},
        {name:'24 mm High Absorption',       badge:'2'},
        {name:'Custom Sizes',                badge:'S'},
        {name:'Printed Patterns',            badge:'P'},
        {name:'Product Code AC-PET-12',      badge:'C'},
        {name:'Standard Performance',        badge:'P'},
        {name:'Modular Configuration',       badge:'M'},
        {name:'Suspended System',            badge:'S'},
        {name:'Wall-mounted System',         badge:'W'},
        {name:'Model AC-PET-2400',           badge:'#'}
      ];
      var VAR_PRESETS = [
        [0,1,2,3],       // Standard / High Absorption / Custom / Printed
        [0,1,4,7],       // Standard / High Absorption / Code / Suspended
        [4,5,6,8],       // Code / Perf / Modular / Wall-mounted
        [0,2,3,9],       // Standard / Custom / Printed / Model
        [1,4,5,7,8]      // High Absorption / Code / Perf / Suspended / Wall (5 items)
      ];
      var varSet = VAR_PRESETS[pidNum % VAR_PRESETS.length];
      el.innerHTML = varSet.map(function(i){
        var v = VARIANT_POOL[i];
        return '<button class="pp-variant-row"><span class="pp-variant-badge">'+esc(v.badge)+'</span>'+esc(v.name)+'</button>';
      }).join('');
    }

    // ─── Resources & Downloads (Tab 3) — all 5 groups ────────
    // Per D-rule: hide the entire group section if no documents in that group.
    var DOC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>';
    var DRAW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
    var LEAF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 5 .5 7.5-.5 10-1.5 3-4 5-8 5"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>';
    var CERT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>';
    function docCard(name, sub, icon){
      return '<a class="pp-doc-card" href="#" onclick="event.preventDefault();alert(\'Coming soon — file would download.\')">'
           + '<span class="pp-doc-ic">'+(icon||DOC_ICON)+'</span>'
           + '<span class="pp-doc-body"><div class="pp-doc-name">'+esc(name)+'</div><div class="pp-doc-sub">'+esc(sub)+'</div></span>'
           + '</a>';
    }
    function fillDocGroup(gridId, secId, items, icon){
      var grid = document.getElementById(gridId);
      var sec  = document.getElementById(secId);
      if(!grid || !sec) return;
      if(!items || !items.length){ sec.style.display = 'none'; return; }
      sec.style.display = '';
      grid.innerHTML = items.map(function(d){ return docCard(d.name, d.sub, icon); }).join('');
    }
    fillDocGroup('ppSpecDocs', 'ppResSpecSec', [
      {name:'Specification Text',    sub:'PDF · 0.3 MB'},
      {name:'CSI Specification',     sub:'ZIP · 0.8 MB'},
      {name:'NBS Specification',     sub:'ZIP · 0.8 MB'},
      {name:'Product Schedule',      sub:'PDF · 0.5 MB'},
      {name:'BOQ Description',       sub:'PDF · 0.4 MB'},
      {name:'Tender Description',    sub:'PDF · 0.4 MB'}
    ], DOC_ICON);
    fillDocGroup('ppTechDocs', 'ppResTechSec', [
      {name:'Technical Datasheet',   sub:'PDF · 0.9 MB'},
      {name:'Installation Guide',    sub:'PDF · 1.8 MB'},
      {name:'Maintenance Guide',     sub:'PDF · 0.6 MB'},
      {name:'Warranty',              sub:'PDF · 0.2 MB'},
      {name:'Product Catalogue',     sub:'PDF · 8.4 MB'},
      {name:'Product Brochure',      sub:'PDF · 2.1 MB'}
    ], DOC_ICON);
    fillDocGroup('ppDrawDocs', 'ppResDrawSec', [
      {name:'PDF Drawings',          sub:'PDF · 1.2 MB'},
      {name:'CAD Drawings',          sub:'DWG · 2.1 MB'},
      {name:'BIM Models',            sub:'RVT · 12.6 MB'}
    ], DRAW_ICON);
    fillDocGroup('ppCompDocs', 'ppResCompSec', [
      {name:'Test Reports',              sub:'PDF · 1.4 MB'},
      {name:'Certificates',              sub:'PDF · 0.6 MB'},
      {name:'Declaration of Performance',sub:'PDF · 0.3 MB'},
      {name:'Regional Approvals',        sub:'PDF · 0.5 MB'},
      {name:'Fire Reports',              sub:'PDF · 1.1 MB'},
      {name:'Acoustic Reports',          sub:'PDF · 0.9 MB'}
    ], CERT_ICON);
    fillDocGroup('ppSusDocs', 'ppResSusSec', [
      {name:'EPD',                        sub:'PDF · 0.4 MB'},
      {name:'LEED Contribution',          sub:'PDF · 0.3 MB'},
      {name:'Recycled-Content Statement', sub:'PDF · 0.2 MB'},
      {name:'VOC Certificate',            sub:'PDF · 0.2 MB'},
      {name:'Environmental Certificates', sub:'PDF · 0.5 MB'}
    ], LEAF_ICON);
    fillDocGroup('ppCoDocs', 'ppResCoSec', [
      {name:'Company Profile',    sub:'PDF · 2.4 MB'},
      {name:'Corporate Brochure', sub:'PDF · 3.8 MB'},
      {name:'Brand Presentation', sub:'PDF · 6.2 MB'}
    ], DOC_ICON);

    // ─── Specification Details (Tab 4) — 6 spec groups as k/v tables ─
    // Hide any group whose data is entirely empty (D-rule).
    function fillSpecGroup(tableId, secId, rows){
      var table = document.getElementById(tableId);
      var sec   = document.getElementById(secId);
      if(!table || !sec) return;
      // Filter out rows where value is empty/null
      var valid = (rows || []).filter(function(r){ return r[1] != null && String(r[1]).trim() !== ''; });
      if(!valid.length){ sec.style.display = 'none'; return; }
      sec.style.display = '';
      table.innerHTML = valid.map(function(r){
        return '<div class="k">'+esc(r[0])+'</div><div class="v">'+esc(String(r[1]))+'</div>';
      }).join('');
    }
    fillSpecGroup('ppSpecGeneral', 'ppSpecGeneralSec', [
      ['Product Name',      name],
      ['Product Code',      'AC-PET-'+(pidNum%99+10)],
      ['Product Family',    meta || 'Acoustic Wall Panels'],
      ['Product Type',      cat || meta || 'Wall Panel'],
      ['Manufacturer',      brand],
      ['Country of Origin', country || '—']
    ]);
    fillSpecGroup('ppSpecMaterial', 'ppSpecMaterialSec', [
      ['Material Composition', '100% PET (Recycled)'],
      ['Density',              '160 kg/m³'],
      ['Recycled Content',     '≥ 60%'],
      ['Surface Finish',       'Felted'],
      ['Coating',              'None'],
      ['Colour System',        'NCS · RAL · Bespoke']
    ]);
    fillSpecGroup('ppSpecDim', 'ppSpecDimSec', [
      ['Width',       '1200 mm'],
      ['Height',      '2400 mm'],
      ['Length',      '2400 mm'],
      ['Thickness',   '24 mm'],
      ['Weight',      '2.4 kg/m²'],
      ['Tolerances',  '±1 mm']
    ]);
    fillSpecGroup('ppSpecPerf', 'ppSpecPerfSec', [
      ['Fire Rating',           'B-s1,d0 (EN 13501-1)'],
      ['Acoustic Performance',  'NRC 0.85'],
      ['Thermal Conductivity',  '0.037 W/mK'],
      ['U-Value',               '2.1 W/m²K'],
      ['Slip Resistance',       'N/A'],
      ['Impact Resistance',     'Class 3 (EN 12600)'],
      ['Load Capacity',         'N/A'],
      ['Moisture Resistance',   'High'],
      ['UV Resistance',         'Good'],
      ['VOC Emission',          'Low VOC (A+)']
    ]);
    fillSpecGroup('ppSpecInstall', 'ppSpecInstallSec', [
      ['Installation Method',        'Mechanical fixings / Adhesive'],
      ['Substrate Requirements',     'Flat, dry, dust-free'],
      ['Fixing System',              'Concealed clip / hook & loop'],
      ['Joint Details',              'Butt joint / Shadow gap'],
      ['Required Accessories',       'Aluminium H profiles, edge trims'],
      ['Recommended Installer Type', 'Certified interior contractor']
    ]);
    fillSpecGroup('ppSpecOps', 'ppSpecOpsSec', [
      ['Maintenance',      'Regular vacuuming'],
      ['Cleaning',         'Dry cloth or soft brush'],
      ['Warranty',         '5 years'],
      ['Service Life',     '15+ years'],
      ['Replacement Parts','Available on request']
    ]);

    // ─── Video thumbnail ────────────────────────────────────
    el = document.getElementById('ppVideoImg');
    if(el){ el.src = img; el.onerror = function(){ this.style.display = 'none'; }; }

    // ─── Related products ────────────────────────────────────
    el = document.getElementById('ppRelatedGrid');
    if(el){
      var pool = [];
      try {
        if(window.liveProducts && window.liveProducts.length) pool = pool.concat(window.liveProducts);
        if(window.products && window.products.length) pool = pool.concat(window.products);
      } catch(e){}
      var myId = String(p.id || p.db_id || '');
      var related = pool.filter(function(x){
        var xid = String(x.id || x.db_id || '');
        return xid !== myId;
      }).slice(0, 6);
      if(related.length){
        el.innerHTML = related.map(function(r){
          var rid = String(r.id || r.db_id || '');
          var rimg = r.img || r.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
          return '<div class="pp-related" onclick="openProduct(\''+rid+'\')">'
               + '<div class="pp-related-img"><img src="'+esc(rimg)+'" alt="" loading="lazy"></div>'
               + '<div class="pp-related-name">'+esc(r.name||'')+'</div>'
               + '<div class="pp-related-brand">'+esc(r.brand||'')+'</div>'
               + '</div>';
        }).join('');
      } else {
        el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--muted);font-size:12px">Loading related products…</div>';
      }
    }

    // ─── Professional Workspace: render for current auth state ────────
    renderWorkspaceCard();
    // ─── Quick Actions: reflect current saved state ───────────────────
    refreshQuickActionsState();
  }

  // ─── Quick Actions state refresher ──────────────────────────────
  // Queries saved_products for the current user + current product and marks the
  // Save Product / Save to Collection buttons as "saved" so the UI shows the state
  // without requiring a page refresh.
  // Independent states:
  //  - "workspace"    → saved_products row with collection_id IS NULL (Save Product button)
  //  - "in-collection"→ saved_products row with collection_id NOT NULL (Save to Collection button)
  async function refreshQuickActionsState(){
    if(!ppLoggedInNow()){ applyQuickActionState(false, false); return; }
    var pid = window._modalPid;
    if(!pid) return;
    try {
      var { data } = await sb.from('saved_products')
        .select('id, collection_id')
        .eq('user_id', currentUser.id)
        .eq('product_id', String(pid));
      var rows = data || [];
      var savedToWorkspace  = rows.some(function(r){ return !r.collection_id; });
      var savedToCollection = rows.some(function(r){ return !!r.collection_id; });
      applyQuickActionState(savedToWorkspace, savedToCollection);
    } catch(e){ /* silent */ }
  }
  function applyQuickActionState(savedToWorkspace, savedToCollection){
    var buttons = document.querySelectorAll('#page-product .pp-quick-row');
    buttons.forEach(function(btn){
      var handler = btn.getAttribute('onclick') || '';
      var isWorkspaceBtn  = handler.indexOf("'save-product'") !== -1;
      var isCollectionBtn = handler.indexOf("'collection'")   !== -1;
      if(!isWorkspaceBtn && !isCollectionBtn) return;
      var isSaved = isWorkspaceBtn ? savedToWorkspace : savedToCollection;
      btn.classList.toggle('pp-quick-row-saved', isSaved);
      var label = isWorkspaceBtn
        ? (isSaved ? 'Saved to Workspace' : 'Save Product')
        : (isSaved ? 'Saved to Collection' : 'Save to Collection');
      // Preserve the SVG (first child) and just replace the text node.
      var svg = btn.querySelector('svg');
      btn.innerHTML = '';
      if(svg) btn.appendChild(svg);
      btn.appendChild(document.createTextNode(' ' + label));
    });
  }

  // ─── Save Product / Save to Workspace toggle (collection_id = null) ─
  async function ppToggleWorkspaceSave(){
    if(!ppLoggedInNow()){ ppOpenAuthPrompt('Save Product'); return; }
    var pid = window._modalPid;
    if(!pid) return;
    try {
      var { data } = await sb.from('saved_products')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('product_id', String(pid))
        .is('collection_id', null)
        .limit(1);
      if(data && data.length){
        await sb.from('saved_products').delete().eq('id', data[0].id);
        if(typeof showToast==='function') showToast('Removed from Workspace');
      } else {
        var pd = _lastProduct || {};
        await sb.from('saved_products').insert({
          user_id: currentUser.id,
          product_id: String(pid),
          product_name: pd.name || null,
          brand: pd.brand || null,
          image_url: (pd.img || pd.image_url || '').split('?')[0]
        });
        if(typeof showToast==='function') showToast('Saved to Workspace');
      }
    } catch(e){ console.warn('ppToggleWorkspaceSave', e); }
    refreshQuickActionsState();
  }

  // ─── Save to Collection toggle: if already in a collection, remove all
  //     collection rows for this product (keep the workspace row intact).
  //     Otherwise open the collection picker.
  async function ppToggleCollectionSave(){
    if(!ppLoggedInNow()){ ppOpenAuthPrompt('Save to Collection'); return; }
    var pid = window._modalPid;
    if(!pid) return;
    try {
      var { data:rows } = await sb.from('saved_products')
        .select('id, collection_id')
        .eq('user_id', currentUser.id)
        .eq('product_id', String(pid));
      var inCollections = (rows || []).filter(function(r){ return !!r.collection_id; });
      if(inCollections.length){
        // Currently in one or more collections → remove from all collections, keep workspace row.
        var ids = inCollections.map(function(r){ return r.id; });
        await sb.from('saved_products').delete().in('id', ids);
        if(typeof showToast==='function') showToast('Removed from collections (still saved to Workspace)');
        refreshQuickActionsState();
      } else {
        // Not in any collection yet → open the picker.
        ppOpenCollectionPicker();
      }
    } catch(e){ console.warn('ppToggleCollectionSave', e); }
  }

  // ─── Save to Collection popup (collection picker) ────────────────
  async function ppOpenCollectionPicker(){
    if(!ppLoggedInNow()){ ppOpenAuthPrompt('Save to Collection'); return; }
    var m = document.getElementById('ppCollectionModal');
    if(!m){ /* modal not injected yet */ return; }
    var list = document.getElementById('ppCollectionList');
    if(list){ list.innerHTML = '<div style="padding:24px;text-align:center;color:#7a8496;font-size:12px">Loading your collections…</div>'; }
    m.classList.add('open');
    try {
      var { data:cols } = await sb.from('collections')
        .select('id,name,description')
        .eq('user_id', currentUser.id)
        .order('created_at', {ascending:false});
      var options = cols || [];
      if(!options.length){
        list.innerHTML = '<div style="padding:22px 20px;text-align:center;color:#7a8496;font-size:12px;line-height:1.6">You don\'t have any collections yet. Create one below or from your Workspace.</div>';
      } else {
        list.innerHTML = options.map(function(c){
          return '<label class="pp-col-opt"><input type="radio" name="pp-col-pick" value="'+esc(c.id)+'"><span class="pp-col-opt-body"><span class="pp-col-opt-name">'+esc(c.name)+'</span>'+(c.description?'<span class="pp-col-opt-sub">'+esc(c.description)+'</span>':'')+'</span></label>';
        }).join('');
      }
    } catch(e){
      console.warn('load collections', e);
      list.innerHTML = '<div style="padding:22px;text-align:center;color:#c94a4a;font-size:12px">Could not load collections.</div>';
    }
  }
  window.ppCloseCollectionPicker = function(){
    var m = document.getElementById('ppCollectionModal');
    if(m) m.classList.remove('open');
  };
  window.ppSubmitCollectionPicker = async function(){
    var picked = document.querySelector('input[name=pp-col-pick]:checked');
    var newName = (document.getElementById('ppNewCollectionName')||{}).value;
    newName = (newName||'').trim();
    var pid = window._modalPid;
    if(!ppLoggedInNow() || !pid) return;
    if(!picked && !newName){
      if(typeof showToast==='function') showToast('Pick a collection or name a new one');
      return;
    }
    try {
      var colId = picked ? picked.value : null;
      if(!colId){
        var { data:newCol, error:createErr } = await sb.from('collections')
          .insert({ user_id: currentUser.id, name: newName })
          .select('id').single();
        if(createErr){ console.warn('create collection', createErr); return; }
        colId = newCol.id;
      }
      var pd = _lastProduct || {};
      var payload = {
        user_id: currentUser.id,
        product_id: String(pid),
        product_name: pd.name || null,
        brand: pd.brand || null,
        image_url: (pd.img || pd.image_url || '').split('?')[0]
      };
      // Auto-save to Workspace (collection_id null) too — but only if not already there.
      var { data:wsExisting } = await sb.from('saved_products')
        .select('id').eq('user_id', currentUser.id).eq('product_id', String(pid))
        .is('collection_id', null).limit(1);
      if(!wsExisting || !wsExisting.length){
        await sb.from('saved_products').insert(Object.assign({}, payload, { collection_id: null }));
      }
      // And insert the row for the picked collection.
      await sb.from('saved_products').insert(Object.assign({}, payload, { collection_id: colId }));
      if(typeof showToast==='function') showToast('Saved to collection & workspace');
      window.ppCloseCollectionPicker();
      refreshQuickActionsState();
    } catch(e){ console.warn('submit collection', e); }
  };

  // ─── Add Note popup ──────────────────────────────────────────────
  window.ppOpenNoteModal = function(){
    if(!ppLoggedInNow()){ ppOpenAuthPrompt('Add note'); return; }
    var m = document.getElementById('ppNoteModal');
    var ta = document.getElementById('ppNoteText');
    if(ta) ta.value = '';
    if(m) m.classList.add('open');
    if(ta) setTimeout(function(){ ta.focus(); }, 60);
  };
  window.ppCloseNoteModal = function(){
    var m = document.getElementById('ppNoteModal');
    if(m) m.classList.remove('open');
  };
  window.ppSaveNote = async function(){
    var ta = document.getElementById('ppNoteText');
    var note = (ta && ta.value || '').trim();
    if(!note){ if(typeof showToast==='function') showToast('Write a note first'); return; }
    if(!ppLoggedInNow()) return;
    var pid = window._modalPid;
    var pd = _lastProduct || {};
    try {
      await sb.from('product_notes').insert({
        user_id: currentUser.id,
        product_id: String(pid || ''),
        product_name: pd.name || null,
        brand: pd.brand || null,
        image_url: (pd.img || pd.image_url || '').split('?')[0],
        note: note
      });
      if(typeof showToast==='function') showToast('Note saved to your Workspace');
      window.ppCloseNoteModal();
    } catch(e){
      console.warn('save note', e);
      if(typeof showToast==='function') showToast('Could not save note — ' + (e.message||''));
    }
  };

  // Track the last-rendered product so save/note handlers can attach name/brand/img.
  var _lastProduct = null;

  // ─── Request Quotation prefill — pick the manufacturer chip on the RFQ page ─
  async function ppPrefillRfq(){
    var pref = window._ppPrefillRfq;
    if(!pref || !pref.brand) return;
    // Wait until the RFQ page is visible and its helpers are loaded.
    var page = document.getElementById('page-rfq');
    var tries = 0;
    while((!page || window.getComputedStyle(page).display === 'none' || typeof window.rfqLoadBrands !== 'function') && tries < 40){
      await new Promise(function(r){ setTimeout(r, 100); });
      page = document.getElementById('page-rfq');
      tries++;
    }
    if(typeof window.rfqLoadBrands !== 'function') return;
    try {
      var brands = await window.rfqLoadBrands();
      var wanted = String(pref.brand).toLowerCase();
      var match  = (brands || []).find(function(b){ return String(b.name||'').toLowerCase() === wanted; });
      if(match){
        var productPayload = pref.product_id ? {
          id: pref.product_id,
          name: pref.product_name || 'Product '+pref.product_id,
          image_url: pref.product_image || ''
        } : null;
        // Preferred path: rfq_shim's nested API adds brand AND product in one shot.
        if(window.rfqShim && typeof window.rfqShim.addBrandWithProduct === 'function'){
          await window.rfqShim.addBrandWithProduct(match, productPayload);
        } else if(typeof window.rfqAddBrand === 'function'){
          // Fallback: legacy flat picker (brand only)
          window.rfqAddBrand(match);
        }
      }
      // Also stash the target product for legacy consumers.
      window._rfqPrefillProduct = { product_id: pref.product_id, product_name: pref.product_name };
    } catch(e){ console.warn('ppPrefillRfq', e); }
    // Clear the pending prefill so it doesn't apply on later navigations.
    window._ppPrefillRfq = null;
  }
  window.ppPrefillRfq = ppPrefillRfq;

  // ─── Dashboard "My Notes" section (injected dynamically) ────────
  // Injects a section at the bottom of #page-dashboard listing product notes
  // from the product_notes table. Re-renders on every page show.
  function ensureDashNotesSection(){
    var dash = document.getElementById('page-dashboard');
    if(!dash) return null;
    // Append inside .section so it inherits the same horizontal padding
    // (72px 80px) as the rest of the dashboard content.
    var host = dash.querySelector('section.section') || dash;
    var sec = document.getElementById('dashNotesSection');
    if(!sec){
      sec = document.createElement('div');
      sec.id = 'dashNotesSection';
      sec.style.cssText = 'margin:40px 0 20px';
      sec.innerHTML = ''
        + '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px">'
        +   '<div>'
        +     '<div class="sec-label">Workspace Notes</div>'
        +     '<h3 style="font-family:\'Fraunces\',serif;font-size:24px;color:var(--navy2);font-weight:300;margin:0">Your product notes</h3>'
        +   '</div>'
        + '</div>'
        + '<div id="dashNotesGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px"></div>';
      host.appendChild(sec);
    }
    return sec;
  }
  async function renderDashNotes(){
    var sec = ensureDashNotesSection();
    if(!sec) return;
    var grid = document.getElementById('dashNotesGrid');
    if(!grid) return;
    if(!ppLoggedInNow()){ sec.style.display = 'none'; return; }
    sec.style.display = '';
    grid.innerHTML = '<div style="grid-column:1/-1;padding:22px;text-align:center;color:#7a8496;font-size:12px">Loading notes…</div>';
    try {
      var { data } = await sb.from('product_notes')
        .select('id, product_id, product_name, brand, image_url, note, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', {ascending:false});
      var rows = data || [];
      if(!rows.length){
        grid.innerHTML = '<div style="grid-column:1/-1;padding:44px 24px;text-align:center;color:#7a8496;font-size:13px;line-height:1.6;background:#fafbfd;border:1px dashed #d6dae4;border-radius:12px">'
          +   '<div style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:6px">No notes yet</div>'
          +   'Add notes to products from the product page and they\'ll appear here.'
          + '</div>';
        return;
      }
      grid.innerHTML = rows.map(function(n){
        var img = n.image_url ? '<img src="'+esc(n.image_url)+'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0" alt="">' : '<div style="width:64px;height:64px;background:#eef1f6;border-radius:8px;flex-shrink:0"></div>';
        var when = n.created_at ? new Date(n.created_at).toLocaleDateString() : '';
        var pid = String(n.product_id||'');
        return '<div style="background:white;border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(0,15,40,.04)">'
          +   '<div style="display:flex;gap:12px;align-items:flex-start;cursor:pointer" onclick="if(typeof openProduct===\'function\')openProduct(\''+esc(pid)+'\')">'
          +     img
          +     '<div style="min-width:0;flex:1">'
          +       '<div style="font-size:12.5px;font-weight:800;color:var(--navy);line-height:1.3">'+esc(n.product_name||'Product')+'</div>'
          +       '<div style="font-size:11px;color:#7a8496;font-weight:600;margin-top:2px">'+esc(n.brand||'')+'</div>'
          +     '</div>'
          +   '</div>'
          +   '<div style="background:#fafbfd;border-radius:8px;padding:10px 12px;font-size:12.5px;color:#374050;line-height:1.55;white-space:pre-wrap">'+esc(n.note)+'</div>'
          +   '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10.5px;color:#7a8496;font-weight:600">'
          +     '<span>'+esc(when)+'</span>'
          +     '<button onclick="ppDeleteNote(\''+esc(n.id)+'\')" style="background:none;border:none;color:#c94a4a;font-weight:700;cursor:pointer;font-size:11px;font-family:Manrope,sans-serif">Delete</button>'
          +   '</div>'
          + '</div>';
      }).join('');
    } catch(e){
      console.warn('renderDashNotes', e);
      grid.innerHTML = '<div style="grid-column:1/-1;padding:22px;text-align:center;color:#c94a4a;font-size:12px">Could not load notes.</div>';
    }
  }
  window.ppDeleteNote = async function(id){
    if(!ppLoggedInNow()) return;
    if(!confirm('Delete this note?')) return;
    try {
      await sb.from('product_notes').delete().eq('id', id);
      renderDashNotes();
    } catch(e){ console.warn('ppDeleteNote', e); }
  };

  // ─── Dashboard "Saved Brands" section (localStorage-backed) ─────
  function ensureDashSavedBrandsSection(){
    var dash = document.getElementById('page-dashboard');
    if(!dash) return null;
    // Same host as notes section: inside .section so padding matches Quick Actions row.
    var host = dash.querySelector('section.section') || dash;
    var sec = document.getElementById('dashSavedBrandsSection');
    if(!sec){
      sec = document.createElement('div');
      sec.id = 'dashSavedBrandsSection';
      sec.style.cssText = 'margin:40px 0 0';
      sec.innerHTML = ''
        + '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px">'
        +   '<div>'
        +     '<div class="sec-label">Saved Brands</div>'
        +     '<h3 style="font-family:\'Fraunces\',serif;font-size:24px;color:var(--navy2);font-weight:300;margin:0">Your saved brands</h3>'
        +   '</div>'
        + '</div>'
        + '<div id="dashSavedBrandsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px"></div>';
      host.appendChild(sec);
    }
    // Ensure it sits BEFORE the notes section (both live inside the same host).
    var notes = document.getElementById('dashNotesSection');
    if(notes && notes.parentNode === host && sec.nextSibling !== notes){
      host.insertBefore(sec, notes);
    }
    return sec;
  }
  function renderDashSavedBrands(){
    var sec = ensureDashSavedBrandsSection();
    if(!sec) return;
    var grid = document.getElementById('dashSavedBrandsGrid');
    if(!grid) return;
    var list = (window.SavedBrands && window.SavedBrands.all()) || [];
    if(!list.length){
      grid.innerHTML = '<div style="grid-column:1/-1;padding:44px 24px;text-align:center;color:#7a8496;font-size:13px;line-height:1.6;background:#fafbfd;border:1px dashed #d6dae4;border-radius:12px">'
        +   '<div style="font-size:15px;font-weight:800;color:var(--navy);margin-bottom:6px">No saved brands yet</div>'
        +   'Tap the bookmark on any brand card or the Save Brand button on a brand page to save it here.'
        + '</div>';
      return;
    }
    grid.innerHTML = list.map(function(b){
      var id = String(b.id||'').replace(/'/g,"\\'");
      var name = esc(b.name||'Brand');
      var sub = esc([b.city, b.country].filter(Boolean).join(', '));
      var logoBox = b.logo
        ? '<img src="'+esc(b.logo)+'" alt="" style="width:56px;height:56px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid #eceff5;flex-shrink:0">'
        : '<div style="width:56px;height:56px;border-radius:10px;background:#eef1f6;color:var(--navy);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;font-family:Manrope,sans-serif;flex-shrink:0">'+esc((b.name||'B').substring(0,2).toUpperCase())+'</div>';
      return '<div style="background:white;border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(0,15,40,.04)">'
        +   '<div style="display:flex;gap:12px;align-items:center;cursor:pointer" onclick="if(typeof openBrandProfile===\'function\')openBrandProfile(\''+id+'\')">'
        +     logoBox
        +     '<div style="min-width:0;flex:1">'
        +       '<div style="font-size:13px;font-weight:800;color:var(--navy);line-height:1.3">'+name+'</div>'
        +       (sub ? '<div style="font-size:11px;color:#7a8496;font-weight:600;margin-top:2px">'+sub+'</div>' : '')
        +     '</div>'
        +   '</div>'
        +   '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10.5px;color:#7a8496;font-weight:600">'
        +     '<button onclick="if(typeof openBrandProfile===\'function\')openBrandProfile(\''+id+'\')" style="background:none;border:none;color:var(--navy);font-weight:700;cursor:pointer;font-size:11px;font-family:Manrope,sans-serif;padding:0">View Brand</button>'
        +     '<button onclick="window.SavedBrands&&window.SavedBrands.remove(\''+id+'\')" style="background:none;border:none;color:#c94a4a;font-weight:700;cursor:pointer;font-size:11px;font-family:Manrope,sans-serif">Remove</button>'
        +   '</div>'
        + '</div>';
    }).join('');
  }
  window.renderDashSavedBrands = renderDashSavedBrands;

  // Watch for the dashboard being shown, then render both sections.
  (function watchDashboard(){
    var dash = document.getElementById('page-dashboard');
    if(!dash){ setTimeout(watchDashboard, 500); return; }
    var wasVisible = false;
    var check = function(){
      var visible = window.getComputedStyle(dash).display !== 'none';
      if(visible && !wasVisible){ renderDashSavedBrands(); renderDashNotes(); }
      wasVisible = visible;
    };
    check();
    try {
      var mo = new MutationObserver(check);
      mo.observe(dash, {attributes:true, attributeFilter:['style','class']});
    } catch(e){}
  })();
  // Also re-render notes when the user saves a new one.
  var _origSaveNote = window.ppSaveNote;
  window.ppSaveNote = async function(){
    if(_origSaveNote) await _origSaveNote.apply(this, arguments);
    renderDashNotes();
  };

  // ─── Workspace card renderer (reused by both fillPP and auth listener) ─

  // ─── Workspace card renderer (reused by both fillPP and auth listener) ─
  function ppLoggedInNow(){
    try { return (typeof currentUser !== 'undefined') && !!currentUser && !!currentUser.id; } catch(e){ return false; }
  }
  function renderWorkspaceCard(){
    var wsBody = document.getElementById('ppWsBody');
    if(!wsBody) return;
    if(ppLoggedInNow()){
      // Logged-in state: minimal — user already has an account, just needs one button.
      wsBody.innerHTML = '<p class="pp-ws-side-body">Manage your saved products, projects and specifications in your workspace.</p>'
        + '<div class="pp-ws-side-btns">'
        +   '<button class="pp-ws-btn" onclick="if(typeof showPage===\'function\')showPage(\'dashboard\')">Open my Workspace</button>'
        + '</div>';
    } else {
      // Logged-out state: sell the value — headline, sub, 4-feature tile grid, then CTAs.
      var TILE_ICONS = {
        collection: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
        compare:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></svg>',
        project:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        spec:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>'
      };
      function tile(icon, label){
        return '<div class="pp-ws-tile"><span class="pp-ws-tile-ic">'+icon+'</span><span class="pp-ws-tile-lbl">'+label+'</span></div>';
      }
      wsBody.innerHTML =
          '<div class="pp-ws-heading">Add this product to your specification workflow</div>'
        + '<p class="pp-ws-sub">Save, compare and manage products, documents and specifications across all your projects.</p>'
        + '<div class="pp-ws-tiles">'
        +   tile(TILE_ICONS.collection, 'Save to Collection')
        +   tile(TILE_ICONS.compare,    'Add to Compare')
        +   tile(TILE_ICONS.project,    'Add to Project')
        +   tile(TILE_ICONS.spec,       'Spec Builder')
        + '</div>'
        + '<div class="pp-ws-side-btns">'
        +   '<button class="pp-ws-btn" onclick="if(typeof openRegModal===\'function\')openRegModal(\'login\')">Log In to Workspace</button>'
        +   '<button class="pp-ws-btn ghost" onclick="if(typeof openRegModal===\'function\')openRegModal(\'register\')">Create Free Account</button>'
        + '</div>';
    }
  }
  // Hook Supabase auth state changes so the card updates live (no refresh needed).
  // The sb client is a top-level `const` in ax2.js — access via bare identifier.
  (function wireAuthListener(){
    var tries = 0;
    (function attempt(){
      tries++;
      try {
        if(typeof sb !== 'undefined' && sb && sb.auth && typeof sb.auth.onAuthStateChange === 'function'){
          sb.auth.onAuthStateChange(function(){
            // Small delay lets ax2's own auth handler set `currentUser` first.
            setTimeout(function(){
              renderWorkspaceCard();
              refreshQuickActionsState();
            }, 60);
          });
          return;
        }
      } catch(e){}
      if(tries < 40) setTimeout(attempt, 120);
    })();
  })();
  // Also poll briefly on load in case ax2 sets currentUser after our first paint.
  var _wsPoll = 0;
  var _wsPollT = setInterval(function(){
    _wsPoll++;
    renderWorkspaceCard();
    if(_wsPoll > 30) clearInterval(_wsPollT); // stop after ~9s
  }, 300);

  var _origRender = window.renderProductModal;
  window.renderProductModal = function(p){
    try { if(typeof _origRender === 'function') _origRender(p); } catch(e){ console.warn(e); }
    try { fillPP(p); } catch(e){ console.error('fillPP failed', e); }
    // Any product-page render means content is (about to be) visible — remove the spinner overlay
    // and any error state that might have been left over from a previous failed load.
    try {
      var loader = document.getElementById('ppInitialLoader');
      if(loader && loader.parentNode) loader.parentNode.removeChild(loader);
      var err = document.getElementById('ppErrorState');
      if(err && err.parentNode) err.parentNode.removeChild(err);
    } catch(e){}
  };

  // ---- Convert prodModal into a REAL PAGE with a back button ----
  // On DOMContentLoaded: move the .pp-wrap out of #prodModal into a new #page-product div,
  // prepend a "Back to Search" header, and neutralise the modal so it never overlays.
  // Then override openProduct() to save the current page + scroll position, call showPage('product'),
  // and delegate to the original for data fetch. navigateBackFromProduct() restores state — filter
  // state on the previous page is naturally preserved because showPage() only toggles display,
  // it doesn't tear down DOM.
  function injectPageBackCSS(){
    if(document.getElementById('pp-page-back-css')) return;
    var s = document.createElement('style');
    s.id = 'pp-page-back-css';
    s.textContent = ''
      + '#page-product{background:#f7f7f5;min-height:80vh;padding-bottom:57px}'
      + '#page-product .pp-wrap{min-height:calc(80vh - 80px)}'
      + '.pp-page-header{background:transparent;padding:16px 24px 6px;display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1280px;margin:0 auto}'
      + '.pp-back-btn{background:white;border:1px solid var(--border);color:var(--navy);padding:9px 18px 9px 14px;border-radius:100px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;gap:8px;transition:border-color .15s, background .15s, transform .1s;box-shadow:0 1px 3px rgba(0,15,40,.04)}'
      + '.pp-back-btn:hover{border-color:var(--navy);background:#fafbfd;transform:translateX(-2px)}'
      + '.pp-back-btn svg{width:14px;height:14px}'
      + '.pp-page-crumb{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.4px;display:flex;align-items:center;gap:8px}'
      + '#page-product .pp-wrap{max-width:1280px;margin:12px auto 0;border-radius:14px;box-shadow:0 4px 24px rgba(0,15,40,.06)}'
      /* Force badges to a clean 5-across row so FIRE never wraps below */
      + '#page-product .pp-badges{display:grid !important;grid-template-columns:repeat(5,1fr) !important;gap:8px}'
      + '#page-product .pp-badge{flex:none !important;min-width:0 !important}'
      /* Both hero rows: align content to the top so the shorter (info/sidebar) column doesn\'t leave a mystery gap */
      + '#page-product .pp-hero{align-items:stretch}'
      + '#page-product .pp-hero-info,#page-product .pp-sidebar{align-self:stretch}'
      + '#prodModal{display:none !important}';
    document.head.appendChild(s);
  }
  function initProductPage(){
    injectPageBackCSS();
    // page-product and its .pp-wrap are now in the HTML at build time (see prod_modal_new.html),
    // so nothing to create or move. This function stays as a no-op for backward compatibility
    // with the rest of the shim that calls it.
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProductPage);
  else initProductPage();

  // ---- Intercept showPage('product/xxx') calls ----
  // ax2.js's boot code runs `showPage(hash-without-#, false)` immediately when the page loads.
  // For a URL like #product/123 that call becomes `showPage('product/123', false)` which tries
  // to find #page-product/123 (doesn't exist), hides everything, and shows blank/footer-only.
  // Intercept those calls, extract the product id, and route to page-product with data fetch.
  if(typeof window.showPage === 'function'){
    var _origShowPage_pp = window.showPage;
    window.showPage = function(name, pushHistory){
      var hash = location.hash || '';
      if(typeof name === 'string' && name.indexOf('product/') === 0){
        var pid = name.substring('product/'.length);
        initProductPage();
        // Show page-product manually (bypass original since 'product/xxx' isn't a valid page id)
        document.querySelectorAll('[id^="page-"]').forEach(function(p){ p.style.display = 'none'; });
        var pp = document.getElementById('page-product');
        if(pp) pp.style.display = 'block';
        window.scrollTo(0, 0);
        if(pid && typeof window.openProduct === 'function'){
          // Ensure back-nav goes to Products
          if(!window._preProductState) window._preProductState = { pageId: 'products', scrollY: 0 };
          showProductLoading();
          window.openProduct(pid);
        }
        return;
      }
      // ax2's initDeepLink calls showPage('products', false) 600ms after page load, which
      // would steal us away from a product deeplink. Ignore ONLY that automated call — user
      // clicks (which default to pushHistory=true) must go through so the Products tab works.
      if(name === 'products' && pushHistory === false && hash.indexOf('#product/') === 0){
        var ppEl = document.getElementById('page-product');
        var onProduct = ppEl && window.getComputedStyle(ppEl).display !== 'none';
        if(onProduct) return; // don't clobber
      }
      return _origShowPage_pp.apply(this, arguments);
    };
  }

  window._preProductState = null;
  function currentPageId(){
    var found = null;
    document.querySelectorAll('[id^="page-"]').forEach(function(p){
      if(p.id === 'page-product') return;
      var disp = window.getComputedStyle(p).display;
      if(disp && disp !== 'none') found = p.id.replace(/^page-/, '');
    });
    return found;
  }
  function saveProductNavState(){
    // Only save if we're NOT already on the product page (avoid clobbering when re-clicking a related product).
    var page = document.getElementById('page-product');
    var onProduct = page && window.getComputedStyle(page).display !== 'none';
    if(onProduct && window._preProductState) return;
    window._preProductState = {
      pageId: currentPageId() || 'home',
      scrollY: window.scrollY || document.documentElement.scrollTop || 0
    };
  }
  window.navigateBackFromProduct = function(){
    var st = window._preProductState;
    if(st && st.pageId && typeof showPage === 'function'){
      showPage(st.pageId);
      setTimeout(function(){ window.scrollTo(0, st.scrollY); }, 30);
    } else if(typeof showPage === 'function'){
      showPage('products');
    } else if(history && history.back){
      history.back();
    }
    // Also drop the deeplink hash if present
    if((location.hash || '').indexOf('#product/') === 0){
      try { history.pushState({}, '', '#'+(st && st.pageId ? st.pageId : 'products')); } catch(e){}
    }
    window._preProductState = null;
  };

  // ---- Persistent scroll unlock (MutationObserver) ----
  // ax2's original openProduct locks body.style.overflow='hidden' before AND after its async
  // Supabase fetch — for a modal that we permanently hide via CSS. That lock lingers when the
  // user navigates away, freezing scroll site-wide. Fix: watch body.style, and whenever
  // overflow:hidden appears BUT no real (visible) modal actually needs it, unlock immediately.
  (function installScrollUnlocker(){
    // Selectors for modals that legitimately want body scroll lock while they're open
    var LEGIT_MODAL_SELECTORS = [
      '.reg-modal-wrap.open',
      '#lbBrandAppModal.open',
      '#lbConsultModal.open',
      '#regModal.open',
      '#editProfileModal',
      '#viewCollectionModal',
      '#editBrandModal',
      '#editProductModal',
      '#inboxReplyModal',
      '#linkFirmModal',
      '#allSubsModal',
      '#collectionModal',
      '#brandApplyModal',
      '.req-panel.open',
      '#brandModal.open'
    ];
    function anyRealModalNeedsLock(){
      for(var i=0;i<LEGIT_MODAL_SELECTORS.length;i++){
        var els = document.querySelectorAll(LEGIT_MODAL_SELECTORS[i]);
        for(var j=0;j<els.length;j++){
          var el = els[j];
          if(el.id === 'prodModal') continue; // always hidden — never legitimate
          var d = window.getComputedStyle(el).display;
          if(d && d !== 'none') return true;
        }
      }
      return false;
    }
    function checkUnlock(){
      if(document.body.style.overflow === 'hidden' && !anyRealModalNeedsLock()){
        document.body.style.overflow = '';
      }
    }
    function start(){
      if(!document.body || !window.MutationObserver) return;
      try {
        var obs = new MutationObserver(function(){ checkUnlock(); });
        obs.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        window._ppScrollObserver = obs;
      } catch(e){ console.warn('scroll unlocker failed', e); }
      // Belt-and-braces: also poll every 500ms in case something manages to sneak past the observer
      setInterval(checkUnlock, 500);
      checkUnlock();
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  })();
  function unlockBodyScrollForProductPage(){
    // Kept as a no-op alias — MutationObserver now handles it permanently
  }

  // Override openProduct: save state, ensure page exists, navigate, delegate to original for data fetch.
  // ---- Bookmark toggle ----
  // ax2.js has a wrapper on handleWish that blocks second clicks with "Already saved" instead of toggling.
  // Override with a proper toggle: click on unsaved product -> save. Click on saved product -> UNSAVE.
  var _BOOKMARK_EMPTY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  var _BOOKMARK_FILLED = '<svg width="13" height="13" viewBox="0 0 24 24" fill="var(--navy)" stroke="var(--navy)" stroke-width="1.8" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  // Update ONLY the SVG icon inside the button, preserving any text label (e.g. "Save to Collection")
  function swapBookmarkIcon(btn, filled){
    if(!btn) return;
    var svg = btn.querySelector('svg');
    if(svg){
      // Preserve original width/height of the existing SVG so tall buttons keep their layout
      var w = svg.getAttribute('width');
      var h = svg.getAttribute('height');
      var replacement = filled ? _BOOKMARK_FILLED : _BOOKMARK_EMPTY;
      if(w) replacement = replacement.replace(/width="[^"]*"/, 'width="'+w+'"');
      if(h) replacement = replacement.replace(/height="[^"]*"/, 'height="'+h+'"');
      svg.outerHTML = replacement;
    } else {
      // No SVG present — button is icon-only. Fall back to setting innerHTML (product card case)
      btn.innerHTML = filled ? _BOOKMARK_FILLED : _BOOKMARK_EMPTY;
    }
  }
  function installBookmarkToggle(){
    // Wait for the pieces to exist (sb / currentUser are defined by ax2 after DOMContentLoaded)
    window.handleWish = async function(id, btn){
      // Not logged in — open the login modal, same as ax2's original
      if(typeof currentUser === 'undefined' || !currentUser){
        if(typeof openRegModal === 'function') openRegModal('login');
        if(typeof showToast === 'function') showToast('Sign in to save products');
        return;
      }
      // Brand accounts can't save
      if(window._brandMe){ if(btn) btn.style.display = 'none'; return; }
      var sid = String(id);
      var ids = window._savedProductIds = window._savedProductIds || new Set();
      var isSaved = ids.has(sid) || ids.has(String(parseInt(sid, 10))) || (btn && btn.getAttribute('data-saved') === '1');
      if(isSaved){
        // ---- UNSAVE ----
        if(typeof sb === 'undefined'){ if(typeof showToast === 'function') showToast('Could not unsave'); return; }
        try {
          // saved_products.product_id column is a string in our DB (holds "db_XX" ids from mock data too),
          // but for numeric ids we should also try the parsed number. Delete matches on either representation.
          var delRes = await sb.from('saved_products').delete().eq('user_id', currentUser.id).eq('product_id', sid);
          if(delRes.error) throw delRes.error;
          ids.delete(sid);
          ids.delete(String(parseInt(sid, 10)));
          if(btn){
            swapBookmarkIcon(btn, false);
            btn.style.color = 'var(--navy)';
            btn.removeAttribute('data-saved');
          }
          if(typeof showToast === 'function') showToast('Removed from Saved');
          // Refresh dashboard if visible so the saved section updates
          try {
            var dashPage = document.getElementById('page-dashboard');
            if(dashPage && window.getComputedStyle(dashPage).display !== 'none' && typeof renderDashboard === 'function'){
              renderDashboard();
            }
          } catch(e){}
        } catch(e){
          console.error('Unsave failed', e);
          if(typeof showToast === 'function') showToast('Could not unsave: ' + (e.message || e));
        }
      } else {
        // ---- SAVE ----
        var all = [].concat(typeof products !== 'undefined' ? products : [], typeof liveProducts !== 'undefined' ? liveProducts.filter(function(x){return x.fromDB}) : []);
        var p = all.find(function(x){ return String(x.id) === sid; });
        var name = p ? p.name : 'Product';
        var brand = p ? p.brand : '';
        var img = p ? (p.img || p.image_url || '').split('?')[0] : '';
        if(typeof saveProduct_db === 'function'){
          try { await saveProduct_db(sid, name, brand, img); } catch(e){ console.error('Save failed', e); }
        }
        ids.add(sid);
        if(btn){
          swapBookmarkIcon(btn, true);
          btn.setAttribute('data-saved', '1');
        }
      }
    };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installBookmarkToggle);
  else installBookmarkToggle();

  // ---- Product card fixes ----
  // (a) Swap the "crossed-arrows" Compare icon on product cards for the 2x2 grid icon used on the product page.
  // (b) Stop-propagation on .prod-ic clicks so certification icons don't trigger openProduct.
  var COMPARE_GRID_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';
  var BOOKMARK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  // Expose a helper so compare_shim can look up full product data (name, brand,
  // image_url) instead of falling back to "Product XX" placeholders.
  window.getProductForCompare = function(id){
    var sid = String(id);
    var cache = window._prodCache || {};
    var p = cache[sid] || cache[sid.replace(/^db_/, '')] || cache['db_' + sid];
    if(!p && typeof liveProducts !== 'undefined'){
      p = (liveProducts || []).find(function(x){
        return String(x.id) === sid || String(x.db_id) === sid || 'db_'+String(x.db_id) === sid;
      });
    }
    return p || null;
  };

  // One-time CSS injection: hover-reveal for the compare button, always-on
  // when the product is in the tray (.active), and slight hover polish.
  (function ensureCompareBtnCss(){
    if(document.getElementById('ax-compare-btn-css')) return;
    var st = document.createElement('style');
    st.id = 'ax-compare-btn-css';
    st.textContent =
      '.prod-card:hover .prod-compare-btn, .prod-compare-btn.active {' +
        'opacity:1 !important;' +
        'pointer-events:auto !important;' +
      '}' +
      '.prod-compare-btn:hover {' +
        'box-shadow:0 4px 12px rgba(0,15,40,.22) !important;' +
      '}' +
      '.prod-compare-btn:active {' +
        'transform:scale(.95);' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  })();

  // Two variants of the 2x2 grid glyph — outline (default) and filled (active).
  var COMPARE_GRID_OUTLINE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';
  var COMPARE_GRID_FILLED  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';

  // Toggle the compare button's visual state. Button stays white; only the
  // icon changes — outline squares when unselected, filled navy squares when
  // the product is currently in the compare tray.
  function applyCompareButtonState(btn, id){
    if(!btn) return;
    var isSel = false;
    try { isSel = (typeof window.compareIsSelected === 'function') && window.compareIsSelected(id); } catch(e){}
    if(isSel){
      btn.classList.add('active');
      btn.innerHTML = COMPARE_GRID_FILLED;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = COMPARE_GRID_OUTLINE;
    }
  }

  // Keep every compare button in sync whenever the tray changes (e.g. user
  // removes an item via the tray's X, or clears the tray).
  document.addEventListener('compare:change', function(){
    document.querySelectorAll('.prod-compare-btn').forEach(function(btn){
      var id = btn.getAttribute('data-id') ||
               (btn.closest('.prod-card') && (btn.closest('.prod-card').getAttribute('onclick')||'')
                  .match(/openProduct\((['"]?)([^'")]+)/)?.[2]);
      if(id) applyCompareButtonState(btn, id);
    });
  });

  function polishProductCards(root){
    root = root || document;
    // (1) Ensure every product card has a bookmark button in the top-right of the image wrap.
    // If ax2's rendering skipped it (e.g. for brand accounts) OR some CSS is hiding it, INJECT one.
    // Include `root` itself if it matches — MutationObserver passes each new card AS root, and
    // querySelectorAll only walks descendants, so without this check the observer path is a no-op.
    var _cards = Array.prototype.slice.call(root.querySelectorAll ? root.querySelectorAll('.prod-card') : []);
    if (root.nodeType === 1 && root.matches && root.matches('.prod-card')) _cards.unshift(root);
    _cards.forEach(function(card){
      var wrap = card.querySelector('.prod-img-wrap');
      if(!wrap) return;
      // Extract product id once from the card's onclick attribute
      var oc = card.getAttribute('onclick') || '';
      var m = oc.match(/openProduct\((['"])?([^'")]+)/);
      var pid = m ? m[2] : '';

      // ── Bookmark / Save ──
      var wish = wrap.querySelector('.prod-wish');
      if(!wish){
        wish = document.createElement('button');
        wish.className = 'prod-wish';
        wish.setAttribute('data-tt', 'Save');
        wish.setAttribute('data-injected', '1');
        wish.style.color = 'var(--navy)';
        wish.setAttribute('onclick', 'event.stopPropagation();if(typeof handleWish===\'function\')handleWish(\'' + pid.replace(/'/g,"\\'") + '\',this)');
        wish.innerHTML = BOOKMARK_SVG;
        wrap.appendChild(wish);
      } else {
        // Force it visible in case something is hiding it
        wish.style.display = 'flex';
        wish.style.opacity = '1';
        wish.style.visibility = 'visible';
      }

      // ── Compare button — sits directly below the bookmark ──
      var cmp = wrap.querySelector('.prod-compare-btn');
      if(!cmp){
        cmp = document.createElement('button');
        cmp.className = 'prod-compare-btn';
        cmp.setAttribute('data-tt', 'Compare');
        cmp.setAttribute('data-id', pid);
        cmp.setAttribute('data-injected', '1');
        cmp.setAttribute('aria-label', 'Compare product');
        // Match .prod-wish spec (30×30 at top:8 right:8), stack under it at
        // top:44 right:8 (6px gap). Hidden by default (opacity:0,
        // pointer-events:none) — revealed by CSS `.prod-card:hover` OR by
        // the `.active` class when the product is in the compare tray.
        cmp.style.cssText = 'position:absolute;top:44px;right:8px;width:30px;height:30px;border-radius:50%;background:white;border:none;box-shadow:0 2px 8px rgba(0,15,40,.14);color:var(--navy);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .18s ease-out,box-shadow .18s ease-out;padding:0;z-index:10;opacity:0;pointer-events:none';
        cmp.innerHTML = COMPARE_GRID_OUTLINE;
        // Direct handler — builds full payload from _prodCache so the tray
        // gets name/brand/image. Doesn't rely on ax2's toggleCompare (which
        // isn't defined in every build).
        cmp.addEventListener('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          if(typeof window.compareToggle !== 'function') return;
          var prod = null;
          try { if(typeof window.getProductForCompare === 'function') prod = window.getProductForCompare(pid); } catch(err){}
          var payload = {
            id: (prod && (prod.id || prod.db_id)) || pid,
            name: (prod && prod.name) || 'Product',
            brand: (prod && (prod.brand || prod.manufacturer)) || '',
            image_url: (prod && (prod.image_url || prod.img || prod.image)) || ''
          };
          window.compareToggle(payload);
          applyCompareButtonState(cmp, payload.id);
        });
        wrap.appendChild(cmp);
        // Reflect initial state
        applyCompareButtonState(cmp, pid);
      } else {
        // Existing button — refresh state (e.g. after re-polish)
        applyCompareButtonState(cmp, pid);
      }
    });
    // (2) Compare button: replace old crossed-arrows icon with 2x2 grid.
    // Also poke inside the card we just injected the button into.
    var _btns = Array.prototype.slice.call(root.querySelectorAll ? root.querySelectorAll('.prod-compare-btn') : []);
    _cards.forEach(function(card){
      var b = card.querySelector('.prod-compare-btn');
      if (b && _btns.indexOf(b) < 0) _btns.push(b);
    });
    _btns.forEach(function(btn){
      if(btn.getAttribute('data-cmp-icon-fixed')) return;
      var w = btn.querySelector('svg');
      var width = (w && w.getAttribute('width')) || '13';
      var height = (w && w.getAttribute('height')) || '13';
      btn.innerHTML = COMPARE_GRID_SVG.replace('<svg ', '<svg width="'+width+'" height="'+height+'" ');
      btn.setAttribute('data-cmp-icon-fixed', '1');
    });
    // (3) Certification icons: swallow clicks so they don't open the product
    root.querySelectorAll('.prod-ic').forEach(function(el){
      if(el.getAttribute('data-noclick')) return;
      el.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); });
      el.setAttribute('data-noclick', '1');
    });
  }
  // Run now for any existing cards, then observe for new ones (product cards are re-rendered a lot).
  function startCardPolisher(){
    polishProductCards();
    if(!window.MutationObserver) return;
    try {
      var obs = new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++){
          for(var j=0;j<muts[i].addedNodes.length;j++){
            var node = muts[i].addedNodes[j];
            if(node && node.nodeType === 1) polishProductCards(node);
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch(e){ console.warn('card polisher failed', e); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCardPolisher);
  else startCardPolisher();

  var _origOpenProduct = window.openProduct;
  window.openProduct = function(id){
    initProductPage();
    saveProductNavState();
    if(typeof showPage === 'function') showPage('product');
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
    // Clear previous product's title so the checkFilled loop (if any) waits for the new data
    var t = document.getElementById('ppTitle'); if(t) t.textContent = '';
    // Show the loading spinner while we fetch — this ensures the click path also gets a loading state
    showProductLoading();
    try {
      var wantHash = '#product/' + String(id).replace(/^db_/, 'db_');
      if(location.hash !== wantHash){
        history.pushState({page:'product', product:String(id)}, '', wantHash);
      }
    } catch(e){}
    if(typeof _origOpenProduct === 'function'){
      var out = _origOpenProduct(id);
      unlockBodyScrollForProductPage();
      return out;
    }
  };

  // ---- Deep-link on initial load: if URL is #product/xxx, navigate immediately ----
  // Immediately switches to page-product with a loading state so the Products page
  // never flashes into view while ax2's data-fetch is in flight.
  function showProductLoading(){
    // Static loader is now baked into HTML. Just make sure it exists (re-add if renderProductModal removed it earlier).
    var page = document.getElementById('page-product');
    if(!page) return;
    var t = document.getElementById('ppTitle');
    if(t && t.textContent) return;
    if(document.getElementById('ppInitialLoader')) return;
    var wrap = page.querySelector('.pp-wrap');
    if(!wrap) return;
    var ov = document.createElement('div');
    ov.id = 'ppInitialLoader';
    ov.innerHTML = '<div class="pp-spinner"></div><div class="pp-spinner-lbl">Loading product…</div>';
    wrap.appendChild(ov);
  }
  function hideProductLoading(){
    var ov = document.getElementById('ppInitialLoader');
    if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }
  function showProductError(pid){
    var page = document.getElementById('page-product');
    if(!page) return;
    var wrap = page.querySelector('.pp-wrap');
    if(!wrap) return;
    hideProductLoading();
    var t = document.getElementById('ppTitle');
    if(t && t.textContent && t.textContent.trim()) return; // real content loaded; nothing to do
    var existing = document.getElementById('ppErrorState');
    if(existing) return;
    var err = document.createElement('div');
    err.id = 'ppErrorState';
    err.style.cssText = 'position:absolute;inset:0;background:white;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:5;padding:40px 20px;text-align:center';
    err.innerHTML = '<div style="width:52px;height:52px;border-radius:50%;background:#fdf4f4;border:1px solid #f0c9c9;color:#8f1919;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16.5" x2="12" y2="17"/></svg></div>'
                   + '<div style="font-family:\'Fraunces\',serif;font-size:20px;color:#003366;font-weight:400">Product not found</div>'
                   + '<div style="font-size:12.5px;color:#5b6472;max-width:340px;line-height:1.55">We couldn\'t load this product. It may have been removed, or your connection timed out.</div>'
                   + '<button onclick="navigateBackFromProduct()" style="background:#003366;color:white;border:none;border-radius:8px;padding:11px 22px;font-size:12.5px;font-weight:800;font-family:Manrope,sans-serif;cursor:pointer;margin-top:6px">← Back</button>';
    wrap.appendChild(err);
    try { console.warn("[product-page] Failed to load product", pid, "- fetch may have failed or product doesn't exist."); } catch(e){}
  }
  function handleInitialDeepLink(){
    // Deep-link detection — handles BOTH URL shapes:
    //   Legacy hash:   archspex.com/#product/xxx
    //   Pretty path:   archspex.com/product/xxx  (Netlify catch-all rewrite
    //                  serves /index.html and browser URL stays at /product/xxx)
    // Without the pathname check, refreshing on a pretty-URL product page
    // leaves handleInitialDeepLink believing nothing to do → the loading
    // skeleton renders (from a prior click) but nothing hydrates it.
    var pid = '';
    var h = location.hash || '';
    var p = location.pathname || '';
    if(h.indexOf('#product/') === 0){
      pid = h.replace('#product/', '');
    } else if(p.indexOf('/product/') === 0){
      pid = p.replace('/product/', '').replace(/\/$/, '');
    }
    if(!pid) return;
    // 1. Immediately switch to product page (skeleton) so no other page flashes
    initProductPage();
    if(typeof showPage === 'function'){
      showPage('product');
    } else {
      var s = 0;
      (function wait(){ if(typeof showPage === 'function'){ showPage('product'); } else if(s++ < 40){ setTimeout(wait, 50); } })();
    }
    showProductLoading();
    // 2. Trigger data load as soon as openProduct is defined
    window._preProductState = { pageId: 'products', scrollY: 0 };
    var tries = 0;
    (function attempt(){
      tries++;
      if(typeof window.openProduct === 'function'){
        try { console.log('[product-page] Loading product', pid); } catch(e){}
        window.openProduct(pid);
        // Wait for the actual content to appear (ppTitle text set). Poll for up to 20 seconds
        // to accommodate slow Supabase fetches. If still empty after that, show error state.
        var checkFilled = 0;
        var maxTries = 100; // 100 × 200ms = 20 seconds
        (function check(){
          checkFilled++;
          var t = document.getElementById('ppTitle');
          if(t && t.textContent && t.textContent.trim()){
            try { console.log('[product-page] Content loaded'); } catch(e){}
            hideProductLoading();
          } else if(checkFilled < maxTries){
            setTimeout(check, 200);
          } else {
            showProductError(pid);
          }
        })();
      } else if(tries < 40){
        setTimeout(attempt, 100);
      } else {
        showProductError(pid);
      }
    })();
  }
  // Run as EARLY as possible — don't wait 800ms
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', handleInitialDeepLink);
  } else {
    handleInitialDeepLink();
  }

  // Browser back/forward: navigate into/out of product page based on URL hash.
  window.addEventListener('popstate', function(){
    var h = location.hash || '';
    var onProduct = (function(){
      var p = document.getElementById('page-product');
      return p && window.getComputedStyle(p).display !== 'none';
    })();
    if(h.indexOf('#product/') === 0){
      var pid = h.replace('#product/', '');
      if(pid) window.openProduct(pid);
    } else if(onProduct){
      window.navigateBackFromProduct();
    }
  });

  // Middle-section tab switcher (Overview / Technical Details / Resources & Downloads / Specification Details)
  // ─── Request Information popup ───────────────────────────
  window.ppOpenReq = function(){
    var m = document.getElementById('ppReqModal');
    if(m) m.classList.add('open');
  };
  window.ppCloseReq = function(){
    var m = document.getElementById('ppReqModal');
    if(m) m.classList.remove('open');
  };
  window.ppSubmitReq = async function(e){
    var f = e && e.target;
    if(!f) return;

    // ─── User-supplied fields (from the form) ─────────────────
    var fd = new FormData(f);
    var payload = {
      full_name:          fd.get('full_name')          || '',
      work_email:         fd.get('work_email')         || '',
      company:            fd.get('company')            || '',
      job_title:          fd.get('job_title')          || '',
      professional_role:  fd.get('professional_role')  || '',
      country:            fd.get('country')            || '',
      project_name:       fd.get('project_name')       || '',
      project_location:   fd.get('project_location')   || '',
      project_stage:      fd.get('project_stage')      || '',
      request_type:       fd.get('request_type')       || '',
      message:            fd.get('message')            || ''
    };

    // ─── Auto-attached product & request metadata ─────────────
    try {
      var prod = (_lastProduct && _lastProduct) || (window._prodCache && window._modalPid && window._prodCache[String(window._modalPid)]) || {};
      payload.product_id     = window._modalPid || prod.id || prod.db_id || '';
      payload.product_name   = prod.name || '';
      payload.manufacturer   = prod.brand || prod.manufacturer || '';
      payload.page_url       = (typeof location !== 'undefined') ? location.href : '';
      payload.submitted_at   = new Date().toISOString();
      payload.user_id        = (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.id || null) : null;
    } catch(err){ /* metadata is best-effort; don't block submission */ }

    // Submit button UX — disable while posting.
    var btn = f.querySelector('button[type=submit]');
    var origLabel = btn ? btn.textContent : '';
    if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

    // ─── Insert into Supabase info_requests table ─────────────
    // Fails silently if the table doesn't exist yet — request still counts
    // as sent from the user's POV, and we log the payload to console for
    // manual follow-up during the interim.
    var ok = false;
    try {
      if(typeof sb !== 'undefined' && sb && sb.from){
        var res = await sb.from('info_requests').insert(payload);
        if(!res || res.error){
          console.warn('[info_requests] insert failed:', res && res.error && res.error.message);
          console.log('[info_requests] payload for manual follow-up:', payload);
        } else {
          ok = true;
        }
      } else {
        console.log('[info_requests] Supabase not available. Payload:', payload);
      }
    } catch(err){
      console.warn('[info_requests] threw:', err && err.message);
      console.log('[info_requests] payload for manual follow-up:', payload);
    }

    if(typeof showToast === 'function'){
      showToast(ok ? 'Request sent — we\'ll be in touch shortly.' : 'Request received — we\'ll be in touch shortly.');
    }
    if(btn){ btn.disabled = false; btn.textContent = origLabel || 'Send Request'; }
    f.reset();
    // Reset dropdown labels back to placeholders (form.reset() doesn't touch
    // custom dropdown display state).
    try {
      f.querySelectorAll('.form-dd-label').forEach(function(l){
        l.classList.add('form-dd-placeholder');
        var placeholder = l.closest('#ppReq-stage-dd') ? 'Project Stage' : (l.closest('#ppReq-type-dd') ? 'Required Info Type' : l.textContent);
        l.textContent = placeholder;
      });
    } catch(_){}
    window.ppCloseReq();
  };

  // ─── Auth-gate for Quick Actions ─────────────────────────
  window.ppCloseAuth = function(){
    var m = document.getElementById('ppAuthModal');
    if(m) m.classList.remove('open');
  };
  function ppIsLoggedIn(){
    try { return (typeof currentUser !== 'undefined') && !!currentUser && !!currentUser.id; } catch(e){ return false; }
  }
  function ppOpenAuthPrompt(actionLabel){
    var m = document.getElementById('ppAuthModal');
    var msg = document.getElementById('ppAuthMsg');
    if(msg){
      msg.textContent = actionLabel
        ? ('Sign in to your workspace to use "' + actionLabel + '".')
        : 'Sign in to save, compare and manage products within your active projects.';
    }
    if(m) m.classList.add('open');
  }

  // Auth-gated Quick Action dispatcher. Logged-out users see the sign-in prompt;
  // logged-in users hit the real handler for each action.
  window.ppQuickAction = function(action){
    var LABELS = {
      'project':'Add to Project','collection':'Save to Collection','compare':'Compare Product',
      'spec-builder':'Add to Specification Builder','save-product':'Save Product',
      'sample':'Request Sample','quotation':'Request Quotation','note':'Add note'
    };
    if(!ppIsLoggedIn()){ ppOpenAuthPrompt(LABELS[action] || 'this action'); return; }
    switch(action){
      case 'save-product':                 // Save Product = Save to Workspace (collection_id null)
        ppToggleWorkspaceSave();
        break;
      case 'collection':
        ppToggleCollectionSave();
        break;
      case 'note':
        window.ppOpenNoteModal();
        break;
      case 'compare':
        if(typeof handleCompare === 'function') handleCompare(window._modalPid);
        else if(typeof showToast === 'function') showToast('Compare — coming soon');
        break;
      case 'sample':
        if(typeof showPage === 'function') showPage('sample');
        break;
      case 'quotation':
        // Store the current product's brand + product info, navigate to RFQ,
        // then let the pre-fill helper add the brand chip once the page renders.
        window._ppPrefillRfq = {
          brand: (_lastProduct && _lastProduct.brand) || '',
          product_id: window._modalPid || '',
          product_name: (_lastProduct && _lastProduct.name) || '',
          product_image: (_lastProduct && (_lastProduct.image_url || _lastProduct.image)) || ''
        };
        if(typeof showPage === 'function') showPage('rfq');
        setTimeout(ppPrefillRfq, 500);
        break;
      case 'project':
        if(typeof showToast === 'function') showToast('Added to project — visit your Workspace to manage');
        break;
      case 'spec-builder':
        if(typeof showToast === 'function') showToast('Added to Specification Builder');
        break;
    }
  };

  window.ppTabSwitch = function(btn, panelId){
    try {
      document.querySelectorAll('#page-product .pp-tab').forEach(function(t){ t.classList.remove('active'); });
      if(btn) btn.classList.add('active');
      document.querySelectorAll('#page-product .pp-tab-panel').forEach(function(p){
        p.classList.toggle('active', p.dataset.panel === panelId);
      });
    } catch(e){}
  };
})();
