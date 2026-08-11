

// ── SUPABASE ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://jmmmexoykswsophzmytg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbW1leG95a3N3c29waHpteXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI4MjgsImV4cCI6MjA5MTkwODgyOH0.xnuesdbOt6rFYMFUxt3GVF034VdL7-FAOQWYbIrnxfw';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── DATA ──────────────────────────────────────────────────────────────────────
// ── DATA (loaded from Supabase) ──────────────────────────────────────────────
const brands = [];
const products = [];
const professionals = [];
const projects = [];
const news = [];
const guides = [];
const showroomData = {
  laminates:[], flooring:[], furniture:[], fitout:[], acoustic:[]
};


// ── STATE ─────────────────────────────────────────────────────────────────────
var activeCat='all',activeSubCat=null,activeHall='laminates',currentPage='home',slideIndex=0;
var activeFilters={cat:'all',subtype:[],application:[],brand:[],country:[],cert:[],material:[],specStage:[]};

// ── NAV SCROLL ────────────────────────────────────────────────────────────────
window.addEventListener('scroll',()=>document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>20));

// ── PAGE ROUTING ──────────────────────────────────────────────────────────────
// Pretty-URL mapping. Each of the 7 main nav pages has its own indexable URL
// so Google can rank them independently. Detail pages (product/*, brand-*),
// dashboards, and everything else continue to use hash routing — those aren't
// SEO-critical and pre-rendering each would be prohibitive.
//   page id  ↔  URL segment
//   'guides'    → '/resources/'   (page id kept for legacy renderGuides code)
//   'forbrands' → '/for-brands/'
//   'home'      → '/'
//   everything else → '/<page>/'
var _PAGE_TO_PATH = {
  home:          '/',
  products:      '/products/',
  manufacturers: '/manufacturers/',
  projects:      '/projects/',
  professionals: '/professionals/',
  guides:        '/resources/',
  forbrands:     '/for-brands/',
  news:          '/news/'
};
var _PATH_TO_PAGE = {};
Object.keys(_PAGE_TO_PATH).forEach(function(k){ _PATH_TO_PAGE[_PAGE_TO_PATH[k]] = k; });

function _urlForPage(page){
  // Known pretty routes → clean URL. Anything else stays on hash routing
  // so existing behaviour (dashboard, listbrand, product/xxx, brand-xxx …)
  // keeps working.
  return _PAGE_TO_PATH.hasOwnProperty(page) ? _PAGE_TO_PATH[page] : ('#' + page);
}

function showPage(page, pushHistory=true){
  document.querySelectorAll('[id^="page-"]').forEach(p=>p.style.display='none');
  const el = document.getElementById('page-'+page);
  if(el) el.style.display='block';
  document.querySelectorAll('.nav-link').forEach(function(l){
    var onclick = l.getAttribute('onclick') || '';
    var match = onclick.match(/(?:showPage|navTop)\('([^']+)'\)/);
    if(!match) { l.classList.remove('active'); return; }
    var btnPage = match[1];
    var isActive = btnPage === page ||
      (page === 'manufacturers' && btnPage === 'manufacturers') ||
      (page === 'guides' && btnPage === 'guides');
    l.classList.toggle('active', isActive);
  });
  currentPage=page;window.scrollTo(0,0);
  if(page==='products') renderAllProducts();
  if(page==='manufacturers') renderManufacturers();
  if(page==='professionals') renderProfessionals('all');
  if(page==='projects') renderProjects();
  if(page==='showroom') renderShowroom();
  if(page==='news') renderNews();
  if(page==='guides') renderGuides();
  if(page==='dashboard') renderDashboard();
  if(pushHistory) history.pushState({page}, '', _urlForPage(page));
}

// Browser back/forward button support — handles both pretty URLs (state.page
// present) and legacy hash URLs (fall back to pathname / hash parse).
window.addEventListener('popstate', function(e){
  var page = (e.state && e.state.page) || _PATH_TO_PAGE[location.pathname]
              || (location.hash || '').replace('#','') || 'home';
  showPage(page, false);
});

// ── INITIAL ROUTE RESOLUTION ─────────────────────────────────────────────────
// Priority order:
//   1. window._initialRoute — set by the pre-rendered per-route HTML files.
//      Zero-cost, no URL parsing, guaranteed correct.
//   2. location.pathname — user landed on a pretty URL directly (bookmark,
//      shared link, Google result).
//   3. location.hash — legacy link like archspex.com/#products. Upgraded to
//      the equivalent pretty URL via replaceState so subsequent shares use
//      the new form.
//   4. 'home' — plain archspex.com/
(function(){
  try{history.scrollRestoration='manual';}catch(e){}
  var page = null;

  // (1) Pre-rendered route hint.
  if(typeof window._initialRoute === 'string' && window._initialRoute){
    page = window._initialRoute;
  }
  // (2) Pretty URL pathname — BUT only when the pathname unambiguously
  //     identifies a page. `/` alone is ambiguous: it maps to 'home' in
  //     _PATH_TO_PAGE, but the URL might also be `/#dashboard`, `/#brand-12`,
  //     `/#listbrand`, etc. — hash-routed pages that live at pathname '/'.
  //     If a hash is present, defer to the hash-parsing step below instead of
  //     stamping 'home' here.
  // Also tolerate missing trailing slash — a URL like /for-brands (no slash)
  // should resolve the same as /for-brands/. Netlify may serve the root shell
  // for either, and without normalisation the no-slash form falls through to
  // 'home'.
  var _hasHash = !!(location.hash && location.hash.length > 1);
  var _pn = location.pathname || '';
  var _pnSlash = (_pn === '/' || _pn.slice(-1) === '/') ? _pn : (_pn + '/');
  if(!page && (_PATH_TO_PAGE.hasOwnProperty(_pn) || _PATH_TO_PAGE.hasOwnProperty(_pnSlash))){
    if(!(_pn === '/' && _hasHash)){
      page = _PATH_TO_PAGE[_pn] || _PATH_TO_PAGE[_pnSlash];
    }
  }
  // (2b) Detail-page pretty URLs (Netlify catch-all rewrites /product/*, /brand/*
  //      etc. → /index.html but the browser URL stays at the pretty path).
  //      Route these to the internal SPA page id so we don't fall through
  //      to 'home' — which would strand the product/brand skeleton showing
  //      a stuck loading state. prod_shim.js's handleInitialDeepLink also
  //      reads location.pathname and hydrates the data.
  var _detailPath = null;
  if(!page){
    var pn = location.pathname || '';
    if(pn.indexOf('/product/') === 0)  _detailPath = 'product';
    else if(pn.indexOf('/brand/') === 0 || pn.indexOf('/brand-') === 0) _detailPath = 'brandprofile';
    if(_detailPath) page = _detailPath;
  }
  // (3) Legacy hash — silently upgrade to pretty URL.
  if(!page && location.hash){
    var hp = location.hash.replace('#','');
    // Detail pages (product/xxx, brand-xxx) stay on hash — showPage handles them.
    if(_PAGE_TO_PATH.hasOwnProperty(hp)){
      page = hp;
      try { history.replaceState({page:page}, '', _PAGE_TO_PATH[page]); } catch(_){}
    } else if(hp.indexOf('product/') === 0){
      page = 'product'; // hash-style product deep-link
    } else if(hp.indexOf('brand-') === 0 || hp.indexOf('brand/') === 0){
      page = 'brandprofile';
    } else {
      page = hp;
    }
  }
  // (4) Default.
  if(!page) page = 'home';

  // Record state so back/forward works from first navigation.
  // Skip URL rewrite for detail pages — their pretty URL is already correct,
  // and _urlForPage('product') would return '#product' (wrong).
  try {
    if(_PAGE_TO_PATH.hasOwnProperty(page)){
      var url = _urlForPage(page);
      history.replaceState({page:page}, '', url);
    } else {
      history.replaceState({page:page}, '', location.href);
    }
  } catch(_){}

  if(page !== 'home'){
    setTimeout(function(){ showPage(page, false); window.scrollTo(0,0); }, 0);
  } else {
    window.scrollTo(0,0);
  }
})();

// ── RENDER HOME ───────────────────────────────────────────────────────────────
var TRENDING_CATS = [
  {name:'Flooring & Surfaces', cat:'Finishes', img:'https://images.unsplash.com/photo-1615873968403-89e068629265?w=700&q=85'},
  {name:'Facades & Cladding', cat:'Envelope', img:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=85'},
  {name:'Lighting & Systems', cat:'Systems', img:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=85'},
  {name:'Partition Systems', cat:'Interiors', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=85'},
  {name:'Furniture & FF&E', cat:'Furnishing', img:'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=700&q=85'},
  {name:'Structural Systems', cat:'Structure', img:'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=85'}
];

function renderDiscoverTab(tab){
  window._discoverTab = tab;
  var c = document.getElementById('discoverContent');
  if(!c) return;
  var cat = window._discoverCat || 'all';
  var list = (liveProducts||[]).slice();
  // Category pill filter (Structure/Envelope/.../All)
  if(cat !== 'all'){
    list = list.filter(function(p){
      var pc = (p.cat || p.category || '').trim();
      return pc === cat;
    });
  }
  // Tab-specific sort: New Arrivals = newest first; Most Specified = featured/popular first; Featured = default order
  if(tab==='newest'){
    list.sort(function(a,b){ return (b.db_id||0)-(a.db_id||0); });
  } else if(tab==='trending'){
    list.sort(function(a,b){
      var af = (a.featured||a.popular||a.most_specified)?1:0;
      var bf = (b.featured||b.popular||b.most_specified)?1:0;
      if(bf!==af) return bf-af;
      var as = (a.spec_count||a.views||0), bs = (b.spec_count||b.views||0);
      if(bs!==as) return bs-as;
      return (a.db_id||0)-(b.db_id||0);
    });
  }
  // Cap at exactly 5 cards per requirement
  list = list.slice(0,5);
  if(!list.length){
    var msg = (cat==='all') ? 'Products coming soon' : 'No '+cat+' products yet';
    c.innerHTML = '<div class="prod-grid"><div style="grid-column:1/-1;text-align:center;padding:60px 20px"><div style="font-size:40px;margin-bottom:16px">\u{1F3D7}</div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px">'+msg+'</div><div style="font-size:13px;color:var(--muted)">Try another category or check back soon.</div></div></div>';
    return;
  }
  c.innerHTML = '<div class="prod-grid">' + list.map(prodCard).join('') + '</div>';
}
function switchDiscoverTab(btn){
  document.querySelectorAll('.discover-tab').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  // Tabs reset the category filter to All (there is no explicit All pill).
  document.querySelectorAll('.discover-cat-pill').forEach(function(p){ p.classList.remove('active'); });
  window._discoverCat = 'all';
  renderDiscoverTab(btn.getAttribute('data-tab'));
}

// Filter the Discover grid by category (Structure/Envelope/.../All). Calls into renderDiscoverTab so it stays a single code path.
function pickDiscoverCat(btn){
  document.querySelectorAll('.discover-cat-pill').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  window._discoverCat = btn.getAttribute('data-cat');
  renderDiscoverTab(window._discoverTab || 'featured');
}

// Clear any selected category + reset to the Featured tab whenever the user navigates back to Home (logo / Home / navTop).
(function(){
  var orig = window.showPage;
  if(typeof orig !== 'function') return;
  window.showPage = function(page){
    if(page === 'home'){
      document.querySelectorAll('.discover-cat-pill').forEach(function(p){p.classList.remove('active');});
      window._discoverCat = 'all';
      document.querySelectorAll('.discover-tab').forEach(function(t){t.classList.remove('active');});
      var def = document.querySelector('.discover-tab[data-tab="featured"]');
      if(def) def.classList.add('active');
      window._discoverTab = 'featured';
      if(typeof renderDiscoverTab === 'function'){ setTimeout(function(){ renderDiscoverTab('featured'); }, 0); }
    }
    return orig.apply(this, arguments);
  };
})();


async function renderHome(){
  // Route through the same loader the Products page uses so any DB fallback
  // (no-status, RLS) applies here too. Prevents renderHome from stomping
  // liveProducts to [] when the DB has data but not with status='approved'.
  try {
    if(typeof loadProductsFromDB === 'function'){
      await loadProductsFromDB();
    } else {
      const {data:dbProds, error} = await sb.from('products').select('*').eq('status','approved').order('created_at',{ascending:false}).limit(60);
      if(error) throw error;
      if(dbProds && dbProds.length){
        liveProducts = dbProds.map(p=>({
          id:'db_'+p.id, db_id:p.id, name:p.name, brand:p.brand||'',
          cat:p.category||'', category:p.category||'', country:p.country||'',
          meta:p.meta||'', img:p.image_url||'', image_url:p.image_url||'',
          desc:p.description||'', description:p.description||'',
          specs:(()=>{try{return JSON.parse(p.specs||'{}')}catch(e){return{}}})(),
          swatches:(()=>{try{return JSON.parse(p.swatches||'[]')}catch(e){return[]}})(),
          fromDB:true
        }));
        useDBProducts = true;
      } else { liveProducts = []; }
    }
  } catch(e) {
    console.warn('Products load error:', e && e.message);
  }
  renderDiscoverTab(window._discoverTab || 'featured');
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
// Country → ISO code map for flagcdn PNG flags. Kept short — expandable as
// new brand countries appear in the catalogue.
var _CARD_ISO = {
  'united arab emirates':'ae','uae':'ae','saudi arabia':'sa','ksa':'sa','qatar':'qa','oman':'om','kuwait':'kw','bahrain':'bh',
  'austria':'at','germany':'de','italy':'it','france':'fr','spain':'es','portugal':'pt','netherlands':'nl','belgium':'be',
  'luxembourg':'lu','switzerland':'ch','denmark':'dk','sweden':'se','finland':'fi','norway':'no','ireland':'ie','dutch':'nl','holland':'nl',
  'united kingdom':'gb','uk':'gb','united states':'us','usa':'us','canada':'ca','japan':'jp','south korea':'kr','korea':'kr',
  'china':'cn','india':'in','australia':'au','new zealand':'nz','turkey':'tr','brazil':'br','mexico':'mx',
  'greece':'gr','poland':'pl','egypt':'eg','morocco':'ma','south africa':'za','singapore':'sg','malaysia':'my','thailand':'th','vietnam':'vn'
};
function _flagImgFor(country){
  var iso = _CARD_ISO[String(country||'').toLowerCase().trim()];
  if(!iso) return '';
  return '<img class="prod-flag" src="https://flagcdn.com/w20/'+iso+'.png" srcset="https://flagcdn.com/w40/'+iso+'.png 2x" alt="" loading="lazy" style="width:14px;height:auto;display:inline-block;vertical-align:middle;margin-left:6px;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.06)">';
}

function prodCard(p){
  var pid = p.id || p.db_id;
  var pidStr = JSON.stringify(String(pid));
  if(!window._prodCache) window._prodCache = {};
  window._prodCache[String(pid)] = p;
  var img = p.img || p.image_url || '';
  var cat = p.cat || p.category || '';
  // Title-case the country ('FINLAND' → 'Finland') so the manufacturer row reads KONE · Finland
  var countryTC = (function(raw){
    var lower = String(raw||'').toLowerCase().trim();
    if(!lower) return '';
    var CANON = {'dutch':'Netherlands','holland':'Netherlands','netherland':'Netherlands','england':'United Kingdom'};
    if(CANON[lower]) return CANON[lower];
    var ACR = {'usa':'USA','uae':'UAE','uk':'UK','ksa':'KSA','us':'USA'};
    if(ACR[lower]) return ACR[lower];
    return lower.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  })(p.country);
  var flagHtml = _flagImgFor(p.country);
  // Description used in list view's right-side column (hidden in grid view via CSS).
  var descText = (p.desc || p.description || '').toString().trim();
  // Full utility-icon pool — Datasheet, BIM, Certified, LEED, Fire Rated, Acoustic
  var _ICONS = {
    Datasheet:  {t:'Datasheet', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>'},
    BIM:        {t:'BIM', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'},
    Certified:  {t:'Certified', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>'},
    LEED:       {t:'LEED', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C10 4 4 10 4 20c0 0 6-1 10-5s6-11 6-11z"/><path d="M4 20c2-4 6-8 10-10"/></svg>'},
    Fire:       {t:'Fire Rated', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'},
    Acoustic:   {t:'Acoustic', s:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'}
  };
  // First priority: render icons for flags actually set on the product
  var icons = [];
  if(p.datasheet_url || p.has_datasheet) icons.push(_ICONS.Datasheet);
  if(p.bim_url       || p.has_bim)       icons.push(_ICONS.BIM);
  if(p.certified     || (p.certifications && p.certifications.length)) icons.push(_ICONS.Certified);
  if(p.leed)                             icons.push(_ICONS.LEED);
  if(p.fire_rated    || p.fire)          icons.push(_ICONS.Fire);
  if(p.acoustic)                         icons.push(_ICONS.Acoustic);
  // Placeholder set when the product has no flags yet: deterministically rotate 3 icons from the full pool per product,
  // so different cards show different combinations of Datasheet / BIM / Certified / LEED / Fire / Acoustic across the grid.
  if(!icons.length){
    var _pool = [_ICONS.Datasheet,_ICONS.BIM,_ICONS.Certified,_ICONS.LEED,_ICONS.Fire,_ICONS.Acoustic];
    var _seed = 0, _s = String(pid);
    for(var _i=0;_i<_s.length;_i++){ _seed = (_seed*31 + _s.charCodeAt(_i)) >>> 0; }
    var _n = _pool.length;
    icons = [ _pool[_seed % _n], _pool[(_seed + 2) % _n], _pool[(_seed + 4) % _n] ];
  }
  icons = icons.slice(0,3);
  // Custom fast tooltip via data-tt (no browser tooltip delay); label is styled via CSS to match the site (Manrope, navy chip)
  var iconsHtml = '<div class="prod-icons">' + icons.map(function(i){ return '<span class="prod-ic" data-tt="'+i.t+'">'+i.s+'</span>'; }).join('') + '</div>';
  var pidSafe = "'" + String(pid) + "'";
  // Real <a> so browser's native context menu offers "Open Link in New Tab".
  // Left-click is intercepted (preventDefault + openProduct) for SPA nav;
  // cmd/ctrl/shift/middle click bypasses the intercept and lets the browser
  // handle new-tab / new-window natively.
  var href = '#product/' + encodeURIComponent(String(pid));
  var guard = "if(event.metaKey||event.ctrlKey||event.shiftKey||event.button===1)return true;event.preventDefault();";
  return '<a class="prod-card" href="' + href + '" onclick="' + guard + 'openProduct(' + pidSafe + ')" style="text-decoration:none;color:inherit;display:block">'
    + '<div class="prod-img-wrap">'
    + '<img src="' + img + '" alt="" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\'">'
    + '<span class="prod-cat-tag">' + cat + '</span>'
    + '<button class="prod-wish" onclick="event.preventDefault();event.stopPropagation();handleWish(' + pidSafe + ',this)" data-tt="Save" style="color:var(--navy)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>'
    + '</div>'
    + '<div class="prod-body">'
    + '<div class="prod-name">' + (p.name||'') + '</div>'
    + '<div class="prod-type">' + (p.meta||'') + '</div>'
    + '<div class="prod-brand-row"><span class="prod-brand">' + (p.brand||'') + '</span>' + (countryTC ? ' · <span class="prod-country">' + countryTC + '</span>' + flagHtml : '') + '</div>'
    + iconsHtml
    + '<div class="prod-foot">'
    + '<button class="btn-sm-navy prod-view-btn" onclick="event.preventDefault();event.stopPropagation();openProduct(' + pidSafe + ')">View Product</button>'
    + '</div></div>'
    // List-view-only side panel — hidden in grid view via CSS. Shows product
    // overview text so the wide right-side space in list mode isn't empty.
    + '<div class="prod-desc-list">'
    + '<div class="prod-desc-label">Product Overview</div>'
    + '<div class="prod-desc-text">' + (descText || 'Full product specification, technical documentation and BIM files available. Click View Product for the complete overview.') + '</div>'
    + '</div>'
    + '</a>';
}

function handleWish(id, btn){
  if(!currentUser){ openRegModal('login'); showToast('Sign in to save products'); return; }
  const sid = String(id);
  const all = [...products, ...(liveProducts.filter(x=>x.fromDB))];
  const p = all.find(x => String(x.id) === sid);
  const name = p ? p.name : 'Product';
  const brand = p ? p.brand : '';
  const img = p ? (p.img||p.image_url||'').split('?')[0] : '';
  saveProduct_db(sid, name, brand, img);
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="var(--navy)" stroke="var(--navy)" stroke-width="1.8" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  btn.style.opacity = '1';
}

function newsCard(n){
  return `<div class="news-card">
    <div class="news-img"><img src="${n.img}" alt="${n.title}" loading="lazy"></div>
    <div class="news-body">
      <div class="news-tag">${n.tag}</div>
      <div class="news-title">${n.title}</div>
      <div class="news-desc">${n.desc}</div>
      <div class="news-date">${n.date}</div>
    </div>
  </div>`;
}

function guideCard(g){
  return `<div class="guide-card" onclick="showPage('guides')">
    <div class="guide-img"><img src="${g.img}" alt="${g.title}" loading="lazy"></div>
    <div class="guide-body">
      <div class="guide-cat">${g.cat}</div>
      <div class="guide-title">${g.title}</div>
      <div class="guide-desc">${g.desc}</div>
    </div>
  </div>`;
}

// ── SLIDER ────────────────────────────────────────────────────────────────────
function goSlide(i){
  slideIndex=i;
  document.getElementById('sliderTrack').style.transform=`translateX(-${i*100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}
function slideMove(dir){goSlide((slideIndex+dir+3)%3)}
setInterval(()=>slideMove(1),8000);

// ── PRODUCT MODAL ─────────────────────────────────────────────────────────────
async function openProduct(id){
  const modal = document.getElementById('prodModal');
  if(!modal) return;
  const sid = String(id);

  // Find product in cache or live list
  let p = (window._prodCache && window._prodCache[sid]) ||
          (liveProducts||[]).find(function(x){
            return String(x.id)===sid || String(x.db_id)===sid || 'db_'+String(x.db_id)===sid;
          });

  if(!p){
    // Fetch directly from Supabase
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    document.getElementById('modalTitle').textContent = 'Loading...';
    try {
      const dbId = sid.replace('db_','');
      const res = await fetch('https://jmmmexoykswsophzmytg.supabase.co/rest/v1/products?id=eq.'+dbId+'&select=*', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbW1leG95a3N3c29waHpteXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI4MjgsImV4cCI6MjA5MTkwODgyOH0.xnuesdbOt6rFYMFUxt3GVF034VdL7-FAOQWYbIrnxfw',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbW1leG95a3N3c29waHpteXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI4MjgsImV4cCI6MjA5MTkwODgyOH0.xnuesdbOt6rFYMFUxt3GVF034VdL7-FAOQWYbIrnxfw'
        }
      });
      const data = await res.json();
      if(data && data[0]){
        var d = data[0];
        p = {
          id:'db_'+d.id, db_id:d.id, name:d.name||'', brand:d.brand||'',
          cat:d.category||'', country:d.country||'', meta:d.meta||'',
          img:d.image_url||'', desc:d.description||'',
          specs:(function(){try{return JSON.parse(d.specs||'{}')}catch(e){return{}}})()
        };
      }
    } catch(e){ console.error(e); }
    if(!p){ document.getElementById('modalTitle').textContent = 'Could not load product.'; return; }
  }

  modal.classList.add('open');
  document.body.style.overflow='hidden';
  renderProductModal(p);
}

function renderProductModal(p){
  window._modalPid = p.id || p.db_id;
  var img = p.img || p.image_url || '';
  var cat = p.cat || p.category || '';
  var desc = p.desc || p.description || '';
  var meta = p.meta || '';
  var country = p.country || '';
  var el;
  var modalImg = document.getElementById('modalImg');
  if(modalImg){ modalImg.src = img || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'; modalImg.onerror = function(){ this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'; }; }
  var thumbsEl = document.getElementById('modalThumbs');
  if(thumbsEl){ thumbsEl.innerHTML=''; if(img){ var th=document.createElement('div'); th.className='modal-thumb active'; var ti=document.createElement('img'); ti.src=img; ti.alt=''; th.appendChild(ti); thumbsEl.appendChild(th); } }
  el=document.getElementById('modalBrand');
  if(el){ var _bn=(p.brand||''); el.textContent=_bn.toUpperCase(); if(_bn){ if(!document.getElementById('bp-brandlink-style')){ var _st=document.createElement('style'); _st.id='bp-brandlink-style'; _st.textContent='.modal-brand-row{gap:16px}.modal-brand-pill{font-size:12px;padding:5px 13px;border-radius:7px;transition:background .15s,color .15s,border-color .15s}#modalBrand.brand-link{cursor:pointer}#modalBrand.brand-link:hover{background:var(--navy);color:#fff;border-color:var(--navy)}'; document.head.appendChild(_st); } el.classList.add('brand-link'); el.title='View '+_bn+' profile'; el.onclick=function(){ openBrandByName(_bn); }; } else { el.classList.remove('brand-link'); el.onclick=null; } }
  el=document.getElementById('modalCat');    if(el) el.textContent=cat;
  el=document.getElementById('modalTitle');  if(el) el.textContent=p.name||'';
  el=document.getElementById('modalMeta');   if(el) el.textContent=meta;
  el=document.getElementById('modalDesc');   if(el) el.textContent=desc;
  el=document.getElementById('modalCountry');if(el) el.textContent=country;
  var cr=document.getElementById('modalCountryRow'); if(cr) cr.style.display=country?'flex':'none';
  var sw=document.getElementById('modalSpecsWrap'); var se=document.getElementById('modalSpecs');
  if(se&&sw){ var so=(typeof p.specs==='object'&&p.specs)?p.specs:{}; var en=Object.entries(so);
    if(en.length){ sw.style.display='block'; se.innerHTML=''; en.forEach(function(kv){ var r=document.createElement('div'); r.className='spec-row'; var k=document.createElement('div'); k.className='spec-k'; k.textContent=String(kv[0]).replace(/_/g,' '); var v=document.createElement('div'); v.className='spec-v'; v.textContent=kv[1]; r.appendChild(k); r.appendChild(v); se.appendChild(r); }); } else { sw.style.display='none'; } }
}
function switchModalImg(el, src){
  document.getElementById('modalImg').src = src;
  document.querySelectorAll('.modal-thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}

function closeModal(){document.getElementById('prodModal').classList.remove('open');document.body.style.overflow=''}
function closeModalBg(e){if(e.target===document.getElementById('prodModal'))closeModal()}

// ── REQUEST PANEL ─────────────────────────────────────────────────────────────
function openReq(pid){
  const all = [...products, ...(liveProducts||[])];
  const p = pid ? all.find(x=>String(x.id)===String(pid)||String(x.db_id)===String(pid)) : null;
  const card=document.getElementById('reqProdCard');
  if(p){card.innerHTML=`<div class="req-prod-img"><img src="${p.img}" alt=""></div><div><div class="req-prod-name">${p.name}</div><div class="req-prod-brand">${p.brand} · ${p.country}</div></div>`;card.style.display='flex'}
  else card.style.display='none';
  document.getElementById('reqForm').style.display='block';
  document.getElementById('reqSuccess').style.display='none';
  document.getElementById('reqPanel').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeReq(){document.getElementById('reqPanel').classList.remove('open');document.body.style.overflow=''}
async function submitReq(){
  // collect form values
  const inputs = document.getElementById('reqForm').querySelectorAll('input,select,textarea');
  const vals = {};
  inputs.forEach(i => { if(i.placeholder||i.tagName==='SELECT') vals[i.placeholder||i.name||i.className] = i.value });
  const panel = document.getElementById('reqForm');
  const allInputs = panel.querySelectorAll('input');
  const _addrParts = [allInputs[5]?.value || '', allInputs[6]?.value || '', allInputs[7]?.value || '', allInputs[8]?.value || '', allInputs[9]?.value || '', allInputs[10]?.value || ''];
  const _addrJoined = _addrParts.map(function(x){return (x||'').trim();}).filter(Boolean).join(', ');
  const data = {
    first_name: allInputs[0]?.value || '',
    last_name:  allInputs[1]?.value || '',
    company:    allInputs[2]?.value || '',
    job_title:  (document.getElementById('req-jobtitle')||{}).value || '',
    email:      allInputs[3]?.value || '',
    phone:      allInputs[4]?.value || '',
    address:    _addrJoined,
    notes:      panel.querySelector('textarea')?.value || '',
    product_name: document.getElementById('reqProdCard')?.querySelector('.req-prod-name')?.textContent || ''
  };
  try {
    const {error} = await sb.from('sample_requests').insert([data]);
    if(error) throw error;
  } catch(e) { console.error('Supabase error:',e); }
  document.getElementById('reqForm').style.display='none';
  document.getElementById('reqSuccess').style.display='block';
  setTimeout(closeReq,3500);
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
let currentUser = null;

// Check session on load
async function checkSession(){
  const {data:{session}} = await sb.auth.getSession();
  if(session?.user) setLoggedIn(session.user);
}

function setLoggedIn(user){
  currentUser = user;
  var topbarLogin = document.getElementById('topbarLogin');
  if(topbarLogin){ topbarLogin.textContent = 'My Dashboard'; topbarLogin.onclick = function(){ showPage('dashboard'); }; }
}

async function renderDashboard(){
  if(!currentUser){openRegModal('login');return;}

  // Load profile
  const {data:profile} = await sb.from('profiles').select('*').eq('user_id',currentUser.id).single();
  if(profile){
    const name = profile.full_name||currentUser.email;
    const isBrand = profile.user_type==='Manufacturer / Brand' || profile.user_type==='Distributor';
    document.getElementById('dashWelcomeTitle').textContent = 'Welcome back, '+(profile.full_name?.split(' ')[0]||'there');
    document.getElementById('dashAvatarLetter').textContent = name[0].toUpperCase();
    document.getElementById('dashAvatarLetter').style.background = isBrand ? 'var(--gold)' : '#4f8ef7';
    document.getElementById('dashProfileName').textContent = profile.full_name||'—';
    document.getElementById('dashProfileCompany').textContent = profile.company||currentUser.email;
    document.getElementById('dashProfileType').innerHTML = isBrand ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;display:inline-block"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M17 18h.01M12 18h.01M7 18h.01"/></svg>' + profile.user_type : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;display:inline-block"><path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/><line x1="9" y1="21" x2="9" y2="13"/><line x1="15" y1="21" x2="15" y2="13"/></svg>' + (profile.user_type||'Specifier');
    document.getElementById('dashProfileType').style.background = isBrand ? 'rgba(201,168,76,.2)' : 'rgba(79,142,247,.15)';
    document.getElementById('dashProfileType').style.color = isBrand ? 'var(--gold)' : '#4f8ef7';
  }

  // Load saved products
  const {data:saved, count:savedCount} = await sb.from('saved_products').select('*',{count:'exact'}).eq('user_id',currentUser.id);
  document.getElementById('dashSavedCount').textContent = savedCount||0;
  if(saved?.length){
    document.getElementById('dashSavedGrid').innerHTML = saved.slice(0,4).map(p=>`
      <a class="prod-card" href="#product/${encodeURIComponent(String(p.product_id))}" onclick="if(event.metaKey||event.ctrlKey||event.shiftKey||event.button===1)return true;event.preventDefault();openProduct('${p.product_id}')" style="text-decoration:none;color:inherit;display:block">
        <div class="prod-img-wrap"><img src="${p.image_url||''}" alt="${p.product_name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'">
          <span class="prod-cat-tag">Saved</span>
        </div>
        <div class="prod-body">
          <div class="prod-brand-row">${p.brand||'—'}</div>
          <div class="prod-name">${p.product_name||'—'}</div>
          <div class="prod-foot"><button class="btn-sm-navy" onclick="event.preventDefault();event.stopPropagation();removeSaved(${p.product_id},this)">Remove</button></div>
        </div>
      </a>`).join('');
  }

  // Load RFQ submissions by email
  const {data:rfqs, count:rfqCount} = await sb.from('rfqs').select('*',{count:'exact'}).eq('submitter_email',currentUser.email).order('created_at',{ascending:false});
  document.getElementById('dashRfqCount2').textContent = rfqCount||0;
  document.getElementById('dashRfqList').innerHTML = rfqs?.length
    ? (window._sortByActivity&&window._sortByActivity(rfqs),window._allRfqs=rfqs,window.__updateViewAll&&window.__updateViewAll(),rfqs.slice(0,6).map(r=>window.renderSubmissionCard(r,'rfq')).join(''))
    : '<div style="color:var(--muted);font-size:12px">No RFQ submissions yet. <span style="color:var(--navy);cursor:pointer;font-weight:600" onclick="showPage(\'rfq\')">Submit one →</span></div>';

  // Load sample requests by email
  const {data:samples, count:sampleCount} = await sb.from('sample_requests').select('*',{count:'exact'}).eq('email',currentUser.email).order('created_at',{ascending:false});
  document.getElementById('dashSampleCount2').textContent = sampleCount||0;
  document.getElementById('dashSampleList').innerHTML = samples?.length
    ? (window._sortByActivity&&window._sortByActivity(samples),window._allSamples=samples,window.__updateViewAll&&window.__updateViewAll(),samples.slice(0,6).map(r=>window.renderSubmissionCard(r,'sample')).join(''))
    : '<div style="color:var(--muted);font-size:12px">No sample requests yet. <span style="color:var(--navy);cursor:pointer;font-weight:600" onclick="showPage(\'samplerequest\')">Submit one →</span></div>';

  // Show Submit Listing section only for Manufacturer / Brand accounts
  const {data:prof} = await sb.from('profiles').select('user_type').eq('user_id',currentUser.id).single();
  const isBrand = prof && (prof.user_type==='Manufacturer / Brand' || prof.user_type==='Distributor');
  const listingSection = document.getElementById('submitListingSection');
  if(listingSection) listingSection.style.display = isBrand ? 'block' : 'none';
  if(isBrand) loadMyListings();
}

function toggleListingForm(){
  const f = document.getElementById('listingForm');
  f.style.display = f.style.display==='none' ? 'block' : 'none';
  document.getElementById('listingSubmitMsg').style.display = 'none';
}

function previewListingImg(url){
  const preview = document.getElementById('imgPreview');
  const img = document.getElementById('imgPreviewImg');
  if(url && url.startsWith('http')){
    img.src = url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

async function submitListing(){
  if(!currentUser){openRegModal('login');return;}
  const name = document.getElementById('sl-name').value.trim();
  const brand = document.getElementById('sl-brand').value.trim();
  const category = document.getElementById('sl-category').value;
  const country = document.getElementById('sl-country').value.trim();
  const meta = document.getElementById('sl-meta').value.trim();
  const desc = document.getElementById('sl-desc').value.trim();
  const img = document.getElementById('sl-img').value.trim();
  const specsRaw = document.getElementById('sl-specs').value.trim();
  const notes = document.getElementById('sl-notes').value.trim();

  const msg = document.getElementById('listingSubmitMsg');

  if(!name||!brand||!category||!desc||!img){
    msg.textContent = '⚠ Please fill in all required fields — name, brand, category, description and image URL.';
    msg.style.display = 'block';
    msg.style.background = '#fef2f2';
    msg.style.color = '#dc2626';
    return;
  }

  // Parse specs
  const specsObj = {};
  specsRaw.split('\n').forEach(line=>{
    const [k,...v] = line.split(':');
    if(k&&v.length) specsObj[k.trim()] = v.join(':').trim();
  });

  const btn = document.querySelector('#listingForm .btn-sm-navy');
  btn.textContent = 'Submitting…'; btn.disabled = true;

  const {error} = await sb.from('products').insert({
    name, brand, category, country, meta,
    description: desc,
    image_url: img.split('?')[0],
    specs: JSON.stringify(specsObj),
    swatches: '[]',
    featured: 'false',
    status: 'pending',
    submitted_by: currentUser.id,
    reviewer_notes: notes
  });

  btn.textContent = 'Submit for Review →'; btn.disabled = false;

  if(error){
    msg.textContent = '⚠ Error: ' + error.message;
    msg.style.display = 'block';
    msg.style.background = '#fef2f2';
    msg.style.color = '#dc2626';
    return;
  }

  msg.textContent = '✓ Submitted! The ArchSpex team will review your listing within 24-48 hours.';
  msg.style.display = 'block';
  msg.style.background = '#d1fae5';
  msg.style.color = '#065f46';

  // Clear form
  ['sl-name','sl-brand','sl-country','sl-meta','sl-desc','sl-img','sl-specs','sl-notes'].forEach(id=>{
    document.getElementById(id).value='';
  });
  document.getElementById('sl-category').selectedIndex=0;
  document.getElementById('imgPreview').style.display='none';
  loadMyListings();
}

async function loadMyListings(){
  if(!currentUser) return;
  const {data} = await sb.from('products').select('*').eq('submitted_by',currentUser.id).order('created_at',{ascending:false});
  const el = document.getElementById('myListingsTable');
  if(!el) return;
  if(!data||!data.length){
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">No listings submitted yet. Click &quot;+ Submit New Product&quot; to get started.</div>';
    return;
  }
  const statusColors = {pending:'#fef3c7',approved:'#d1fae5',rejected:'#fef2f2',changes:'#ffedd5'};
  const statusText = {pending:'#92400e',approved:'#065f46',rejected:'#dc2626',changes:'#c2410c'};
  const statusLabels = {pending:'Pending Review',approved:'✓ Approved — Live',rejected:'✕ Rejected',changes:'✏ Changes Requested'};
  el.innerHTML = `<table style="width:100%;border-collapse:collapse">
    <thead><tr style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;background:var(--off)">
      <th style="text-align:left;padding:10px 14px">Product</th>
      <th style="text-align:left;padding:10px 14px">Category</th>
      <th style="text-align:left;padding:10px 14px">Status</th>
      <th style="text-align:left;padding:10px 14px">Submitted</th>
      <th style="text-align:left;padding:10px 14px">Reviewer Feedback</th>
      <th style="text-align:left;padding:10px 14px">Action</th>
    </tr></thead>
    <tbody>${data.map(p=>`
    <tr style="border-top:1px solid var(--border);${p.status==='changes'?'background:#fffbeb':''}">
      <td style="padding:12px 14px;font-weight:700;font-size:12px">${p.name}</td>
      <td style="padding:12px 14px;font-size:11px;color:var(--muted)">${p.category||'—'}</td>
      <td style="padding:12px 14px"><span style="background:${statusColors[p.status]||'#f3f4f6'};color:${statusText[p.status]||'#374151'};padding:4px 11px;border-radius:100px;font-size:10px;font-weight:700;white-space:nowrap">${statusLabels[p.status]||p.status||'pending'}</span></td>
      <td style="padding:12px 14px;font-size:11px;color:var(--muted);white-space:nowrap">${new Date(p.created_at).toLocaleDateString('en-GB')}</td>
      <td style="padding:12px 14px;font-size:11px;${p.status==='changes'?'color:#c2410c;font-weight:600':'color:var(--muted)'};max-width:200px">${p.reviewer_notes||'—'}</td>
      <td style="padding:12px 14px">
        ${(p.status==='changes'||p.status==='rejected') ? `<button onclick="openEditListing(${p.id})" style="background:#003366;color:white;border:none;border-radius:7px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:Manrope,sans-serif;white-space:nowrap">✏ Edit & Resubmit</button>` : ''}
        ${p.status==='pending' ? '<span style="font-size:10px;color:var(--muted)">Under review</span>' : ''}
        ${p.status==='approved' ? '<span style="font-size:10px;color:#059669">Live ✓</span>' : ''}
      </td>
    </tr>
    <!-- Inline edit form (hidden by default) -->
    <tr id="edit-row-${p.id}" style="display:none;background:#f0f4ff">
      <td colspan="6" style="padding:20px 14px">
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:4px">Edit Listing — ${p.name}</div>
        ${p.reviewer_notes&&p.status==='changes'?`<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px 14px;font-size:12px;color:#c2410c;font-weight:600;margin-bottom:14px">✏ Reviewer feedback: ${p.reviewer_notes}</div>`:''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div><label class="f-label">Product Name</label><input class="f-inp" id="edit-name-${p.id}" value="${(p.name||'').replace(/"/g,'&quot;')}"></div>
          <div><label class="f-label">Brand</label><input class="f-inp" id="edit-brand-${p.id}" value="${(p.brand||'').replace(/"/g,'&quot;')}"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px">
          <div><label class="f-label">Category</label>
            <select class="f-sel" id="edit-category-${p.id}">
              <option ${p.category==='Wall & Floor'?'selected':''}>Wall & Floor</option>
              <option ${p.category==='Furnishing'?'selected':''}>Furnishing</option>
              <option ${p.category==='Building Elements'?'selected':''}>Building Elements</option>
              <option ${p.category==='Fit-Out'?'selected':''}>Fit-Out</option>
              <option ${p.category==='Kitchen & Bath'?'selected':''}>Kitchen & Bath</option>
              <option ${p.category==='Lighting'?'selected':''}>Lighting</option>
            </select>
          </div>
          <div><label class="f-label">Country</label><input class="f-inp" id="edit-country-${p.id}" value="${(p.country||'').replace(/"/g,'&quot;')}"></div>
          <div><label class="f-label">Spec Line</label><input class="f-inp" id="edit-meta-${p.id}" value="${(p.meta||'').replace(/"/g,'&quot;')}"></div>
        </div>
        <div style="margin-bottom:10px"><label class="f-label">Description</label><textarea class="f-ta" id="edit-desc-${p.id}" style="min-height:80px">${p.description||''}</textarea></div>
        <div style="margin-bottom:10px"><label class="f-label">Image URL</label><input class="f-inp" id="edit-img-${p.id}" value="${(p.image_url||'').replace(/"/g,'&quot;')}"></div>
        <div style="margin-bottom:14px"><label class="f-label">Specifications (Key: Value, one per line)</label>
          <textarea class="f-ta" id="edit-specs-${p.id}" style="min-height:80px">${Object.entries(JSON.parse(p.specs||'{}')).map(([k,v])=>k+': '+v).join('\n')}</textarea>
        </div>
        <div style="display:flex;gap:10px">
          <button onclick="resubmitListing(${p.id})" style="background:#003366;color:white;border:none;border-radius:8px;padding:10px 22px;font-size:12px;font-weight:800;cursor:pointer;font-family:Manrope,sans-serif">Resubmit for Review →</button>
          <button onclick="document.getElementById('edit-row-${p.id}').style.display='none'" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:10px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:Manrope,sans-serif;color:var(--muted)">Cancel</button>
        </div>
        <div id="edit-msg-${p.id}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600"></div>
      </td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function openEditListing(id){
  // Hide all other edit rows first
  document.querySelectorAll('[id^="edit-row-"]').forEach(r=>r.style.display='none');
  const row = document.getElementById('edit-row-'+id);
  if(row) row.style.display='table-row';
  row?.scrollIntoView({behavior:'smooth',block:'center'});
}

async function resubmitListing(id){
  const name = document.getElementById('edit-name-'+id)?.value.trim();
  const brand = document.getElementById('edit-brand-'+id)?.value.trim();
  const category = document.getElementById('edit-category-'+id)?.value;
  const country = document.getElementById('edit-country-'+id)?.value.trim();
  const meta = document.getElementById('edit-meta-'+id)?.value.trim();
  const desc = document.getElementById('edit-desc-'+id)?.value.trim();
  const img = document.getElementById('edit-img-'+id)?.value.trim();
  const specsRaw = document.getElementById('edit-specs-'+id)?.value.trim();
  const msg = document.getElementById('edit-msg-'+id);

  if(!name||!brand||!category||!desc){
    msg.textContent = '⚠ Please fill in name, brand, category and description.';
    msg.style.display='block';msg.style.background='#fef2f2';msg.style.color='#dc2626';
    return;
  }

  const specsObj = {};
  specsRaw.split('\n').forEach(line=>{
    const [k,...v] = line.split(':');
    if(k&&v.length) specsObj[k.trim()] = v.join(':').trim();
  });

  const btn = document.querySelector('#edit-row-'+id+' button');
  if(btn){btn.textContent='Resubmitting…';btn.disabled=true;}

  const {error} = await sb.from('products').update({
    name, brand, category, country, meta,
    description: desc,
    image_url: img.split('?')[0],
    specs: JSON.stringify(specsObj),
    status: 'pending',
    reviewer_notes: ''
  }).eq('id', id);

  if(btn){btn.textContent='Resubmit for Review →';btn.disabled=false;}

  if(error){
    msg.textContent = '⚠ Error: '+error.message;
    msg.style.display='block';msg.style.background='#fef2f2';msg.style.color='#dc2626';
    return;
  }

  msg.textContent = '✓ Resubmitted! The ArchSpex team will review your updated listing.';
  msg.style.display='block';msg.style.background='#d1fae5';msg.style.color='#065f46';
  setTimeout(()=>loadMyListings(), 2000);
}

async function saveProduct_db(productId, productName, brand, imageUrl){
  if(!currentUser){openRegModal('login');return;}
  // Clean the image URL - just use the base without query params for storage
  const cleanImg = imageUrl ? imageUrl.split('?')[0] : '';
  const {data, error} = await sb.from('saved_products').insert({
    user_id: currentUser.id,
    product_id: String(productId),
    product_name: productName,
    brand: brand,
    image_url: cleanImg
  });
  if(!error){
    showToast('Saved to your dashboard');
  } else {
    console.error('Save error:', JSON.stringify(error));
    showToast('Error: ' + (error.message||error.code||'Unknown error'));
  }
}

async function removeSaved(productId, btn){
  if(!currentUser) return;
  await sb.from('saved_products').delete().eq('user_id',currentUser.id).eq('product_id',productId);
  btn.closest('.prod-card').remove();
  const count = parseInt(document.getElementById('dashSavedCount').textContent||'0');
  document.getElementById('dashSavedCount').textContent = Math.max(0,count-1);
  showToast('Product removed');
}

function setLoggedOut(){
  currentUser = null;
  var topbarLogin = document.getElementById('topbarLogin');
  if(topbarLogin){ topbarLogin.textContent = 'Log In'; topbarLogin.onclick = function(){ openRegModal('login'); }; }
}

function openRegModal(tab='register'){
  // If already logged in show account state
  if(currentUser){
    switchAuthTab('loggedin');
  } else {
    switchAuthTab(tab);
  }
  document.getElementById('regModal').classList.add('open');
  document.body.style.overflow='hidden';
  clearAuthMsg();
}

function closeRegModal(){
  document.getElementById('regModal').classList.remove('open');
  document.body.style.overflow='';
}
function closeRegIfBg(e){if(e.target===document.getElementById('regModal'))closeRegModal()}

// Account path selection
let selectedAccountPath = 'specifier';
let selectedUserType = 'Architect / Designer';

function selectAccountPath(path){
  selectedAccountPath = path;
  const isContractor = path === 'contractor';
  document.getElementById('pathSpecifier').style.borderColor = path==='specifier' ? 'var(--navy)' : 'var(--border)';
  document.getElementById('pathSpecifier').style.background = path==='specifier' ? '#f0f4ff' : 'white';
  document.getElementById('pathContractor').style.borderColor = isContractor ? 'var(--navy)' : 'var(--border)';
  document.getElementById('pathContractor').style.background = isContractor ? '#f0f4ff' : 'white';
  selectedUserType = isContractor ? 'Contractor / Installer' : 'Architect / Designer';
  document.getElementById('accountTypeStep').style.display = 'none';
  document.getElementById('regFields').style.display = 'block';
  document.getElementById('selectedPathLabel').innerHTML = isContractor
    ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;display:inline-block"><path d="M2 18h20"/><path d="M3 18v-2a9 9 0 0 1 18 0v2"/><path d="M8 8.5V7a4 4 0 0 1 8 0v1.5"/></svg><span style="color:var(--navy);font-weight:800">Contractor Account</span><div style="font-size:11px;color:var(--muted);font-weight:500;margin-top:3px">Source products, compare brands, and connect directly with manufacturers on ArchSpex.</div>'
    : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;display:inline-block"><path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/><line x1="9" y1="21" x2="9" y2="13"/><line x1="15" y1="21" x2="15" y2="13"/></svg><span style="color:var(--navy);font-weight:800">Design Professional Account</span><div style="font-size:11px;color:var(--muted);font-weight:500;margin-top:3px">Access products, BIM files, technical documents, and project tools on ArchSpex.</div>';
  var vals = isContractor ? ['Source & compare products','Submit RFQs to multiple brands','Request samples & quotations'] : ['Save & organize products','Request samples & RFQs','Download BIM & technical files'];
  var vl = document.getElementById('reg-valuelines');
  if(vl){ vl.style.display='block'; vl.innerHTML = vals.map(function(v,i){ return '<div style="font-size:11px;color:var(--text);'+(i<vals.length-1?'margin-bottom:5px':'')+'">\u2713 '+v+'</div>'; }).join(''); }
  var roles = isContractor ? ['Contractor','Installer','Buyer','Procurement Specialist'] : ['Architect','Interior Designer','Project Developer'];
  var rm = document.getElementById('reg-role-menu');
  if(rm){ rm.innerHTML = roles.map(function(r){ return '<button type="button" class="form-dd-opt" onclick="pickFormDDOpt(this)">'+r+'</button>'; }).join(''); }
  var rlbl = document.querySelector('#reg-role-dd .form-dd-label'); if(rlbl){ rlbl.textContent='Professional Role'; rlbl.classList.add('form-dd-placeholder'); }
  var rinp = document.getElementById('reg-jobtitle'); if(rinp) rinp.value='';
  var pf = document.getElementById('reg-procurement-dd'); if(pf) pf.style.display = isContractor ? 'block' : 'none';
  var pfl = document.querySelector('#reg-procurement-dd .form-dd-label'); if(pfl){ pfl.textContent='Procurement Focus'; pfl.classList.add('form-dd-placeholder'); }
  var pfi = document.getElementById('reg-procurement'); if(pfi) pfi.value='';
  var cl = document.querySelector('#reg-country-dd .form-dd-label'); if(cl){ cl.textContent='Country'; cl.classList.add('form-dd-placeholder'); }
  var ci = document.getElementById('reg-country'); if(ci) ci.value='';
  document.getElementById('regSubmitBtn').textContent = 'Create Professional Account →';
}

function backToAccountType(){
  document.getElementById('accountTypeStep').style.display = 'block';
  document.getElementById('regFields').style.display = 'none';
  clearAuthMsg();
}

function switchAuthTab(tab){
  document.getElementById('registerForm').style.display = tab==='register'?'block':'none';
  document.getElementById('loginForm').style.display = tab==='login'?'block':'none';
  document.getElementById('loggedInState').style.display = tab==='loggedin'?'block':'none';
  document.getElementById('tabRegister').style.background = tab==='register'?'var(--navy)':'white';
  document.getElementById('tabRegister').style.color = tab==='register'?'white':'var(--muted)';
  document.getElementById('tabLogin').style.background = tab==='login'?'var(--navy)':'white';
  document.getElementById('tabLogin').style.color = tab==='login'?'white':'var(--muted)';
  // Reset to path selection when opening register
  if(tab==='register'){
    document.getElementById('accountTypeStep').style.display = 'block';
    document.getElementById('regFields').style.display = 'none';
    document.getElementById('pathSpecifier').style.borderColor = 'var(--border)';
    document.getElementById('pathSpecifier').style.background = 'white';
    document.getElementById('pathContractor').style.borderColor = 'var(--border)';
    document.getElementById('pathContractor').style.background = 'white';
  }
  // Hide the Create-Account / Sign-In tab switcher AND swap the modal title when logged in
  var _authTabs = document.getElementById('authTabs');
  if(_authTabs) _authTabs.style.display = (tab==='loggedin') ? 'none' : 'flex';
  var _authTitle = document.getElementById('authModalTitle');
  if(_authTitle) _authTitle.textContent = (tab==='loggedin') ? 'Your Account' : 'Join ArchSpex';
  if(tab==='loggedin' && currentUser){
    document.getElementById('loggedInEmail').textContent = currentUser.email;
    // Populate avatar with initials + name from cached profile (or fetch once)
    var _setLoggedInIdentity = function(profile){
      var full = (profile && profile.full_name) || currentUser.email.split('@')[0] || '';
      var av = document.getElementById('loggedInAvatar');
      if(av){
        var parts = full.trim().split(/\s+/);
        var initials = ((parts[0]||'')[0] || '').toUpperCase() + ((parts.length>1 ? parts[parts.length-1][0] : '') || '').toUpperCase();
        av.textContent = initials || (currentUser.email[0] || '?').toUpperCase();
      }
      var nm = document.getElementById('loggedInName');
      if(nm){ nm.textContent = full ? ('Welcome back, ' + (parts[0]||full)) : 'Welcome back'; }
    };
    if(window._userProfile){
      _setLoggedInIdentity(window._userProfile);
    } else {
      _setLoggedInIdentity(null);
      if(typeof loadUserProfileForAutofill === 'function'){
        loadUserProfileForAutofill().then(function(p){ _setLoggedInIdentity(p); });
      }
    }
  }
  clearAuthMsg();
}

function selectUserType(btn){
  document.querySelectorAll('.user-type-select-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function showAuthMsg(msg, type='error'){
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.background = type==='success'?'#d1fae5':'#fef2f2';
  el.style.color = type==='success'?'#065f46':'#dc2626';
  el.style.border = type==='success'?'1px solid #6ee7b7':'1px solid #fecaca';
}

function clearAuthMsg(){
  document.getElementById('authMsg').style.display='none';
}

async function doRegister(){
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName = document.getElementById('reg-lastname').value.trim();
  const company = document.getElementById('reg-company').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const jobTitle = document.getElementById('reg-jobtitle')?.value.trim() || '';
  const userType = selectedUserType || 'Architect / Designer';
  const country = document.getElementById('reg-country') ? document.getElementById('reg-country').value : '';
  const phone = document.getElementById('reg-phone') ? document.getElementById('reg-phone').value.trim() : '';
  const procurement = document.getElementById('reg-procurement') ? document.getElementById('reg-procurement').value : '';
  const newsletter = document.getElementById('reg-newsletter') ? document.getElementById('reg-newsletter').checked : false;

  if(!firstName||!email||!password){showAuthMsg('Please fill in your name, email and password.');return;}
  if(password.length<8){showAuthMsg('Password must be at least 8 characters.');return;}
  const passwordConfirm = document.getElementById('reg-password-confirm').value;
  if(password !== passwordConfirm){showAuthMsg('Passwords do not match. Please try again.');return;}

  const btn = document.getElementById('regSubmitBtn');
  btn.textContent='Creating account…';btn.disabled=true;

  try {
    const {data, error} = await sb.auth.signUp({email, password});
    if(error) throw error;

    if(data.user){
      await sb.from('profiles').insert([{
        user_id: data.user.id,
        full_name: firstName+' '+lastName,
        company, job_title: jobTitle||userType,
        country, user_type: userType
      }]);
      setLoggedIn(data.user);
      const isBrand = selectedAccountPath === 'brand';
      sendNotification(`New ${isBrand?'Brand':'Specifier'} Registration — ${firstName}`,
        `<h3 style="color:#003366">New user registered on ArchSpex</h3>
         <p><strong>Name:</strong> ${firstName} ${lastName||''}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Account type:</strong> ${userType}</p>
         <p><strong>Company:</strong> ${company||'—'}</p>
         <p><strong>Country:</strong> ${country||'—'}</p>
         <p><strong>Phone:</strong> ${phone||'—'}</p>
         <p><strong>Procurement Focus:</strong> ${procurement||'—'}</p>
         <p><strong>Newsletter:</strong> ${newsletter?'Yes':'No'}</p>`
      );
      showAuthMsg(isBrand
        ? '&#x2713; Brand account created! Our team will review and activate your listing access shortly.'
        : '&#x2713; Welcome to ArchSpex! Your account is ready.', 'success');
      if(isBrand){
        setTimeout(function(){ closeRegModal(); showPage('forbrands'); }, 2000);
      } else {
        // Show welcome onboarding
        setTimeout(function(){
          closeRegModal();
          showWelcomeOnboarding(firstName);
        }, 1500);
      }
    }
  } catch(e){
    showAuthMsg(e.message||'Something went wrong. Please try again.');
  }
  btn.textContent='Create Free Account →';btn.disabled=false;
}

async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if(!email||!password){showAuthMsg('Please enter your email and password.');return;}

  const btn = document.getElementById('loginSubmitBtn');
  btn.textContent='Signing in…';btn.disabled=true;

  try {
    const {data, error} = await sb.auth.signInWithPassword({email, password});
    if(error) throw error;
    setLoggedIn(data.user);
    showAuthMsg('Welcome back!', 'success');
    setTimeout(closeRegModal, 1500);
  } catch(e){
    showAuthMsg('Incorrect email or password. Please try again.');
  }
  btn.textContent='Sign In →';btn.disabled=false;
}

async function doSignOut(){
  await sb.auth.signOut();
  setLoggedOut();
  closeRegModal();
  showToast('Signed out successfully');
}

function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;t.style.display='block';
  setTimeout(()=>t.style.display='none',2500);
}

// ── SIDE MENU ─────────────────────────────────────────────────────────────────
function openSideMenu(){
  document.getElementById('sideMenu').classList.add('open');
  document.getElementById('sideMenuOverlay').classList.add('open');
  var sbw = window.innerWidth - document.documentElement.clientWidth;
  if(sbw>0) document.body.style.paddingRight = sbw+'px';
  document.body.style.overflow='hidden';
}
function closeSideMenu(){
  document.getElementById('sideMenu').classList.remove('open');
  document.getElementById('sideMenuOverlay').classList.remove('open');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}

// ── PRODUCTS PAGE ─────────────────────────────────────────────────────────────
var liveProducts = [];
var useDBProducts = false;

var subtypeMap = {
  'Structure':   ['Concrete Systems','Precast Elements','Reinforcement Systems','Structural Steel','Timber Structures'],
  'Envelope':    ['Architectural Glass','Cladding Systems','Curtain Wall Systems','Doors & Entrance Systems','Façade Systems','Insulation Systems','Roofing Systems','Shading Systems','Waterproofing Systems','Windows & Glazing Systems'],
  'Interiors':   ['Acoustic Systems','Ceiling Systems','Interior Doors','Joinery & Built-in Elements','Partition Systems','Raised Floor Systems','Wall Systems'],
  'Finishes':    ['Adhesives & Sealants','Ceiling Finishes','Floor Finishes','Paints & Coatings','Surface Materials','Wall Finishes'],
  'Furnishing':  ['Appliances','Bathroom Furniture','Bathroom Taps','Bathrooms','Furniture','Kitchens','Lighting','Outdoor Furniture','Showers & Bathtubs'],
  'Systems':     ['Building Automation','Electrical Systems','Fire Protection Systems','HVAC Systems','Plumbing Systems','Renewable Energy','Security Systems','Smart Systems','Vertical Transportation']
};

async function loadProductsFromDB(){
  // Map helper so the two query paths (with/without status filter) stay in sync.
  function _mapRows(rows){
    return rows.map(function(p){
      return { id:'db_'+p.id, db_id:p.id, name:p.name, brand:p.brand, cat:p.category, category:p.category, country:p.country||'', meta:p.meta||'', img:p.image_url||'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85', image_url:p.image_url, desc:p.description||'', description:p.description||'', specs:(function(){try{return JSON.parse(p.specs||'{}')}catch(e){return{}}})(), swatches:(function(){try{return JSON.parse(p.swatches||'[]')}catch(e){return[]}})(), fromDB:true };
    });
  }
  try {
    // (1) Preferred query: only status='approved'.
    var res = await sb.from('products').select('*').eq('status','approved').order('created_at',{ascending:false});
    var data = res.data; var error = res.error;
    if(error){ try{ console.warn('[products] approved query error:', error.message||error); }catch(_){} }
    if(!error && data && data.length > 0){
      console.log('[products] loaded', data.length, 'approved rows');
      liveProducts = [].concat(products||[], _mapRows(data));
      useDBProducts = true;
      return liveProducts;
    }
    // (2) Fallback: no rows with status='approved'. Try WITHOUT the status
    //     filter — covers the case where the status column was renamed,
    //     dropped, or all rows are still in a pre-approval state. This is
    //     safer than showing an empty page and confusing the user.
    var res2 = await sb.from('products').select('*').order('created_at',{ascending:false});
    var data2 = res2.data; var error2 = res2.error;
    if(!error2 && data2 && data2.length > 0){
      try{ console.warn('[products] no approved rows — using all', data2.length, 'rows as fallback'); }catch(_){}
      liveProducts = [].concat(products||[], _mapRows(data2));
      useDBProducts = true;
      return liveProducts;
    }
    if(error2){ try{ console.warn('[products] fallback query error:', error2.message||error2); }catch(_){} }
    try{ console.warn('[products] DB returned 0 rows — check RLS policy or table content'); }catch(_){}
  } catch(e){
    try{ console.warn('[products] DB load threw:', e && e.message); }catch(_){}
  }
  useDBProducts = false;
  liveProducts = [].concat(products||[]);
  return liveProducts;
}

async function renderAllProducts(){
  var grid = document.getElementById('allProdGrid');
  if(grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="width:24px;height:24px;border:2px solid var(--border);border-top-color:var(--navy);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px"></div><div style="font-size:12px;color:var(--muted)">Loading products\u2026</div></div>';
  var prods = await loadProductsFromDB();
  buildFilterSidebar(prods);
  applyAndRender();
}

function buildFilterSidebar(prods){
  // Category radio buttons
  var catsEl = document.getElementById('sb-cats');
  if(catsEl){
    catsEl.innerHTML = '';
    var cats = ['all','Structure','Envelope','Interiors','Finishes','Furnishing','Systems'];
    cats.forEach(function(c){
      var label = document.createElement('label');
      label.className = 'filter-check';
      var inp = document.createElement('input');
      inp.type = 'radio'; inp.name = 'cat-filter'; inp.value = c;
      inp.checked = (c === activeFilters.cat);
      inp.onchange = function(){ activeFilters.cat = c; activeFilters.subtype = []; buildSubtypes(); applyAndRender(); };
      var span = document.createElement('span');
      span.textContent = c === 'all' ? 'All Products' : c === 'Furnishing' ? 'FF&E' : c;
      label.appendChild(inp); label.appendChild(span);
      catsEl.appendChild(label);
    });
  }

  // Brands
  var brands = [];
  var seen = {};
  (prods||[]).forEach(function(p){ if(p.brand && !seen[p.brand]){ seen[p.brand]=1; brands.push(p.brand); } });
  brands.sort();
  var brandsEl = document.getElementById('sb-brands');
  if(brandsEl){
    brandsEl.innerHTML = '';
    brands.forEach(function(b){
      var label = document.createElement('label');
      label.className = 'filter-check';
      label.dataset.brand = b.toLowerCase();
      var inp = document.createElement('input');
      inp.type = 'checkbox'; inp.value = b;
      inp.checked = activeFilters.brand.indexOf(b) >= 0;
      inp.onchange = function(){ applyCheckFilter('brand', inp); };
      var span = document.createElement('span'); span.textContent = b;
      label.appendChild(inp); label.appendChild(span);
      brandsEl.appendChild(label);
    });
  }

  // Countries
  var countries = [];
  var seenC = {};
  (prods||[]).forEach(function(p){ if(p.country && !seenC[p.country]){ seenC[p.country]=1; countries.push(p.country); } });
  countries.sort();
  var countriesEl = document.getElementById('sb-countries');
  if(countriesEl){
    countriesEl.innerHTML = '';
    countries.forEach(function(c){
      var label = document.createElement('label');
      label.className = 'filter-check';
      var inp = document.createElement('input');
      inp.type = 'checkbox'; inp.value = c;
      inp.checked = activeFilters.country.indexOf(c) >= 0;
      inp.onchange = function(){ applyCheckFilter('country', inp); };
      var span = document.createElement('span'); span.textContent = c;
      label.appendChild(inp); label.appendChild(span);
      countriesEl.appendChild(label);
    });
  }

  buildSubtypes();
}

function buildSubtypes(){
  var wrap = document.getElementById('filter-subtypes-wrap');
  var container = document.getElementById('filter-subtypes');
  var labelEl = document.getElementById('filter-subtypes-label');
  if(!wrap||!container) return;
  var subtypes = subtypeMap[activeFilters.cat];
  if(!subtypes){ wrap.style.display='none'; return; }
  wrap.style.display = 'block';
  if(labelEl) labelEl.textContent = (activeFilters.cat === 'Furnishing' ? 'FF&E' : activeFilters.cat) + ' — Product Type';
  container.innerHTML = '';
  subtypes.forEach(function(s){
    var lbl = document.createElement('label');
    lbl.className = 'filter-check';
    var inp = document.createElement('input');
    inp.type = 'checkbox'; inp.value = s;
    inp.checked = activeFilters.subtype.indexOf(s) >= 0;
    inp.onchange = function(){ applyCheckFilter('subtype', inp); };
    var span = document.createElement('span'); span.textContent = s;
    lbl.appendChild(inp); lbl.appendChild(span);
    container.appendChild(lbl);
  });
}

function applyCheckFilter(type, inp){
  var val = inp.value;
  var arr = activeFilters[type];
  if(inp.checked){ if(arr.indexOf(val)<0) arr.push(val); }
  else { var i=arr.indexOf(val); if(i>=0) arr.splice(i,1); }
  applyAndRender();
}

function filterBrandList(query){
  var labels = document.querySelectorAll('#sb-brands .filter-check');
  labels.forEach(function(l){
    l.style.display = (!query || l.dataset.brand.indexOf(query.toLowerCase())>=0) ? '' : 'none';
  });
}

function clearAllFilters(){
  activeFilters = { cat:'all', subtype:[], application:[], brand:[], country:[], cert:[], material:[], specStage:[] };
  // Preserve _activeSearchQ if doSearch just set it (within the last 500ms) —
  // otherwise Enter in the nav search bar gets undone by link_shim's reset
  // wrapper calling us right after doSearch runs.
  var _sAge = window._activeSearchTs ? (Date.now() - window._activeSearchTs) : Infinity;
  if(_sAge > 500){
    window._activeSearchQ = '';
    window._activeSearchTs = 0;
  }
  document.querySelectorAll('#filterSidebar input[type=checkbox]').forEach(function(c){ c.checked = false; });
  document.querySelectorAll('#filterSidebar input[type=radio]').forEach(function(r){ r.checked = (r.value==='all'); });
  buildFilterSidebar(liveProducts);
  applyAndRender();
}

function applyAndRender(){
  var prods = liveProducts || [];
  var view = window._prodView || 'all';
  var sort = window._prodSort || '';
  // Search takes priority — if the user has entered a search query, filter
  // by that FIRST (across name/brand/cat/subtype/country/description) and
  // skip the sidebar-based filter application. This makes the search sticky
  // even when other code re-triggers applyAndRender.
  var searchQ = (window._activeSearchQ || '').toString().toLowerCase().trim();
  var filtered;
  if(searchQ){
    // Match ONLY on name + brand — same fields as liveSearch. Broader fields
    // (description/category/subtype) pulled in unrelated products that looked
    // like stale results, and made the card set change dramatically between
    // live-as-you-type and Enter.
    var terms = searchQ.split(/\s+/).filter(Boolean);
    filtered = prods.filter(function(p){
      var hay = ((p.name||'') + ' ' + (p.brand||'')).toLowerCase();
      return terms.every(function(t){ return hay.indexOf(t) >= 0; });
    });
  } else filtered = prods.filter(function(p){
    var pcat = p.cat || p.category || '';
    if(activeFilters.cat !== 'all' && pcat !== activeFilters.cat) return false;
    if(activeFilters.subtype.length){
      var pmeta = p.meta || p.subtype || '';
      var match = false;
      activeFilters.subtype.forEach(function(s){ if(pmeta.toLowerCase().indexOf(s.toLowerCase())>=0) match=true; });
      if(!match) return false;
    }
    if(activeFilters.brand.length && activeFilters.brand.indexOf(p.brand)<0) return false;
    if(activeFilters.country.length && activeFilters.country.indexOf(p.country)<0) return false;
    return true;
  });

  if(sort==='az') filtered.sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
  else if(sort==='brand') filtered.sort(function(a,b){ return (a.brand||'').localeCompare(b.brand||''); });
  else if(sort==='newest' || (sort==='' && view==='new')) filtered.sort(function(a,b){ return (b.db_id||0)-(a.db_id||0); });

  var catLabel = activeFilters.cat==='Furnishing' ? 'FF&E' : activeFilters.cat;
  var title;
  if(view==='featured') title='Featured Products';
  else if(view==='new') title='New Products';
  else title = activeFilters.cat!=='all' ? catLabel : 'All Products';
  var titleEl = document.getElementById('prodPageTitle');
  if(titleEl) titleEl.textContent = searchQ ? ('Search: ' + searchQ) : title;
  var countEl = document.getElementById('prodCount');
  if(countEl) countEl.textContent = searchQ
    ? (filtered.length + ' result' + (filtered.length!==1?'s':'') + ' for "' + searchQ + '"')
    : (filtered.length + ' product' + (filtered.length!==1?'s':''));

  var catSec = document.getElementById('sb-cat-section');
  if(catSec) catSec.style.display = (view==='all') ? '' : 'none';
  var subWrap = document.getElementById('filter-subtypes-wrap');
  if(subWrap && view!=='all') subWrap.style.display = 'none';

  renderActiveTags();
  renderSubcatPills();

  var grid = document.getElementById('allProdGrid');
  if(!grid) return;
  if(!filtered.length){
    var label = activeFilters.cat==='all' ? 'this selection' : catLabel;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--muted)"><div style="font-size:36px;margin-bottom:12px">\u{1F4E6}</div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">No products in '+label+' yet</div><div style="font-size:12px">Check back soon as we onboard more brands</div></div>';
    return;
  }
  grid.innerHTML = filtered.map(prodCard).join('');
}

function renderSubcatPills(){
  var wrap = document.getElementById('subcatPills');
  if(!wrap) return;
  var view = window._prodView || 'all';
  if(view==='featured' || view==='new'){
    var cats = [['all','All'],['Structure','Structure'],['Envelope','Envelope'],['Interiors','Interiors'],['Finishes','Finishes'],['Furnishing','FF&E'],['Systems','Systems']];
    wrap.innerHTML = cats.map(function(c){
      var active = (activeFilters.cat===c[0]) ? ' active' : '';
      return '<button class="subcat-pill'+active+'" onclick="toggleCatPill(\''+c[0]+'\')">'+c[1]+'</button>';
    }).join('');
    return;
  }
  wrap.innerHTML='';
}

function toggleCatPill(cat){
  activeFilters.cat = cat; activeFilters.subtype = [];
  applyAndRender();
}

function toggleSubcatPill(sub){
  var i = activeFilters.subtype.indexOf(sub);
  if(i>=0) activeFilters.subtype.splice(i,1); else activeFilters.subtype.push(sub);
  buildSubtypes();
  applyAndRender();
}

function navTop(page){
  // Top-nav label click -> always return to the general overview, no filters.
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  activeFilters = { cat:'all', subtype:[], application:[], brand:[], country:[], cert:[], material:[], specStage:[] };
  window._prodView='all'; window._prodSort=''; window._brandView='all';
  if(typeof brandPageFilters!=='undefined') brandPageFilters = { cat:'all', cert:[], country:[] };
  if(typeof resActiveCat!=='undefined') resActiveCat='all';
  if(typeof resSubtypeSel!=='undefined') resSubtypeSel=[];
  var pg=document.getElementById('page-'+page);
  if(pg){
    pg.querySelectorAll('input[type=checkbox]').forEach(function(c){ c.checked=false; });
    pg.querySelectorAll('input[type=radio]').forEach(function(r){ r.checked=(r.value==='all'); });
    pg.querySelectorAll('input[type=text]').forEach(function(t){ t.value=''; });
  }
  if(page==='products' && typeof applySortViewOptions==='function') applySortViewOptions('all');
  if(page==='guides'){ try{ renderResSubtypes(); renderResSubcatPills(); }catch(e){} }
  document.querySelectorAll('#filterSidebar, .pg-sidebar').forEach(function(s){ s.scrollTop = 0; });
  if(page==='home'){
    window._discoverTab='featured';
    document.querySelectorAll('.discover-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab')==='featured'); });
    if(typeof renderDiscoverTab==='function') renderDiscoverTab('featured');
    if(typeof slideIndex!=='undefined'){ slideIndex=0; var _st=document.getElementById('sliderTrack'); if(_st) _st.style.transform='translateX(0%)'; }
  }
  showPage(page);
}

function filterCheckList(inp){
  var v = (inp.value||'').toLowerCase().trim();
  var c = inp.nextElementSibling || (inp.parentNode && inp.parentNode.nextElementSibling);
  if(!c) return;
  c.querySelectorAll('label').forEach(function(l){
    l.style.display = (!v || l.textContent.toLowerCase().indexOf(v)>=0) ? '' : 'none';
  });
}

function clearSidebarFilters(btn){
  var sb = btn.closest('.pg-sidebar') || btn.closest('#filterSidebar');
  if(!sb) return;
  sb.querySelectorAll('input[type=checkbox]').forEach(function(c){ c.checked = false; });
  sb.querySelectorAll('input[type=radio]').forEach(function(r){ r.checked = (r.value === 'all'); });
  sb.querySelectorAll('input[type=text],input[type=search],input[type=tel],input[type=email]').forEach(function(t){ t.value = ''; });
  sb.querySelectorAll('label').forEach(function(l){ l.style.display = ''; });
}

function gotoProductView(view){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  window._prodView = view;
  window._prodSort = (view==='new') ? 'newest' : '';
  activeFilters.cat = 'all'; activeFilters.subtype = [];
  applySortViewOptions(view);
  showPage('products');
}

function applySortViewOptions(view){
  var dd = document.getElementById('prodSortDD');
  if(!dd) return;
  var opts = dd.querySelectorAll('.sort-dd-opt');
  opts.forEach(function(o){
    var v = o.getAttribute('data-val');
    var hide = (view==='new' && v==='') || (view==='featured' && v==='newest');
    o.style.display = hide ? 'none' : '';
    o.classList.remove('selected');
  });
  var defVal = (view==='new') ? 'newest' : '';
  var cur = dd.querySelector('.sort-dd-opt[data-val="'+defVal+'"]');
  if(cur){ cur.classList.add('selected'); var c=dd.querySelector('.sort-dd-cur'); if(c) c.textContent=cur.textContent; }
}

function gotoProfFiltered(type){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  showPage('professionals');
}

function gotoBrandsFiltered(cat){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  window._brandView = 'all';
  brandPageFilters.cat = cat;
  showPage('manufacturers');
  setTimeout(function(){
    var r = document.querySelector('[name="brand-cat"][value="'+cat+'"]');
    if(r) r.checked = true;
  }, 60);
}

function gotoBrandView(view){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  window._brandView = view;
  brandPageFilters.cat = 'all';
  showPage('manufacturers');
  setTimeout(function(){
    var r = document.querySelector('[name="brand-cat"][value="all"]');
    if(r) r.checked = true;
  }, 60);
}

// ── CUSTOM DROPDOWN + VIEW TOGGLE HELPERS ──
function setListView(gridId, mode, btn){
  var grid = document.getElementById(gridId);
  if(grid){
    if(mode==='list') grid.classList.add('list-view'); else grid.classList.remove('list-view');
  }
  var tg = btn.parentNode;
  tg.querySelectorAll('.view-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
}

function toggleSortDD(btn){
  var dd = btn.parentNode, open = dd.classList.contains('open');
  document.querySelectorAll('.sort-dd.open').forEach(function(d){ d.classList.remove('open'); });
  if(!open) dd.classList.add('open');
}

function pickSortOpt(opt){
  var menu = opt.parentNode, dd = menu.parentNode;
  menu.querySelectorAll('.sort-dd-opt').forEach(function(o){ o.classList.remove('selected'); });
  opt.classList.add('selected');
  var cur = dd.querySelector('.sort-dd-cur');
  if(cur) cur.textContent = opt.textContent;
  dd.classList.remove('open');
  var fn = dd.getAttribute('data-fn');
  if(fn && typeof window[fn]==='function') window[fn](opt.getAttribute('data-val'));
}

function toggleFormDD(btn){
  var dd = btn.parentNode, open = dd.classList.contains('open');
  document.querySelectorAll('.form-dd.open').forEach(function(d){ d.classList.remove('open'); });
  if(!open) dd.classList.add('open');
}

function pickFormDDOpt(opt){
  var menu = opt.parentNode, dd = menu.parentNode;
  menu.querySelectorAll('.form-dd-opt').forEach(function(o){ o.classList.remove('selected'); });
  opt.classList.add('selected');
  var lbl = dd.querySelector('.form-dd-label');
  if(lbl){ lbl.textContent = opt.textContent; lbl.classList.remove('form-dd-placeholder'); }
  var inp = dd.querySelector('input');
  if(inp) inp.value = opt.getAttribute('data-val') || opt.textContent;
  dd.classList.remove('open');
}

function selectBrandTier(el){
  document.querySelectorAll('.tier-opt').forEach(function(t){ t.classList.remove('selected'); });
  el.classList.add('selected');
  window._brandTier = el.getAttribute('data-tier');
}

document.addEventListener('click', function(e){
  if(!e.target.closest('.sort-dd')) document.querySelectorAll('.sort-dd.open').forEach(function(d){ d.classList.remove('open'); });
  if(!e.target.closest('.form-dd')) document.querySelectorAll('.form-dd.open').forEach(function(d){ d.classList.remove('open'); });
});

function renderActiveTags(){
  var row = document.getElementById('activeFiltersRow');
  if(!row) return;
  var tags = [];
  if(activeFilters.cat !== 'all') tags.push({label: activeFilters.cat==='Furnishing'?'FF&E':activeFilters.cat, key:'cat'});
  activeFilters.brand.forEach(function(b){ tags.push({label:'Brand: '+b, key:'brand', val:b}); });
  activeFilters.country.forEach(function(c){ tags.push({label:c, key:'country', val:c}); });
  activeFilters.subtype.forEach(function(s){ tags.push({label:s, key:'subtype', val:s}); });
  (activeFilters.application||[]).forEach(function(a){ tags.push({label:'Application: '+a, key:'application', val:a}); });
  (activeFilters.material||[]).forEach(function(m){ tags.push({label:'Material: '+m, key:'material', val:m}); });
  (activeFilters.cert||[]).forEach(function(c){ tags.push({label:'Certification: '+c, key:'cert', val:c}); });
  (activeFilters.specStage||[]).forEach(function(s){ tags.push({label:'Stage: '+s, key:'specStage', val:s}); });
  row.style.display = tags.length ? 'flex' : 'none';
  window._filterTags = tags;
  row.innerHTML = tags.map(function(t,i){
    return '<span class="filter-tag">'+t.label+'<button onclick="clearTag('+i+')">&#215;</button></span>';
  }).join('');
}

function clearTag(i){
  var tags = window._filterTags;
  if(!tags||!tags[i]) return;
  var t = tags[i];
  if(t.key==='cat'){ activeFilters.cat='all'; activeFilters.subtype=[]; buildFilterSidebar(liveProducts); }
  else if(t.val !== undefined){
    var arr = activeFilters[t.key];
    var idx = arr.indexOf(t.val);
    if(idx>=0) arr.splice(idx,1);
    // Sync the sidebar checkbox visual state
    document.querySelectorAll('#filterSidebar input[type=checkbox]').forEach(function(cb){
      if(cb.value === t.val) cb.checked = false;
    });
    buildFilterSidebar(liveProducts);
  }
  applyAndRender();
}

function filterCatGo(cat){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  window._prodView = 'all'; window._prodSort = '';
  activeFilters.cat = cat; activeFilters.subtype = [];
  showPage('products');
}

function filterSubCat(cat, sub){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  window._prodView = 'all'; window._prodSort = '';
  activeFilters.cat = cat; activeFilters.subtype = [sub];
  showPage('products');
}

function sortProds(val){
  window._prodSort = (val==='featured' || val==='') ? '' : (val||'');
  applyAndRender();
}

function getActiveProducts(){ return liveProducts; }

// ── BRANDS PAGE ───────────────────────────────────────────────────────────────
var brandPageFilters = { cat: 'all', cert: [], country: [] };


function filterCheckList(input){
  var wrap = input.parentElement && input.parentElement.parentElement;
  if(!wrap) return;
  var list = wrap.querySelector('.filter-list-cap') || wrap.querySelector('[id$="-filters"]') || wrap.querySelector('[id$="countries"]');
  if(!list) return;
  var q = (input.value||'').toLowerCase().trim();
  list.querySelectorAll('label').forEach(function(label){
    var text = label.textContent.toLowerCase();
    label.style.display = (text.indexOf(q) >= 0) ? '' : 'none';
  });
}
function filterBrandsPage(type, val){
  if(type === 'cat') brandPageFilters.cat = val;
  else if(type === 'country'){ var _ci=brandPageFilters.country.indexOf(val); if(_ci>=0) brandPageFilters.country.splice(_ci,1); else brandPageFilters.country.push(val); }
  else if(type === 'cert'){
    var i = brandPageFilters.cert.indexOf(val);
    if(i >= 0) brandPageFilters.cert.splice(i, 1);
    else brandPageFilters.cert.push(val);
  }
  renderManufacturers();
}

function clearBrandFilters(){
  brandPageFilters = { cat: 'all', cert: [], country: [] };
  document.querySelectorAll('[name="brand-cat"]').forEach(function(r){ r.checked = r.value === 'all'; });
  document.querySelectorAll('#brand-country-filters input').forEach(function(c){ c.checked = false; });
  document.querySelectorAll('#page-manufacturers .pg-sidebar input[type=checkbox]').forEach(function(c){ c.checked = false; });
  document.querySelectorAll('#page-manufacturers .pg-sidebar input[type=text]').forEach(function(t){ t.value = ''; });
  renderManufacturers();
}

// ── WELCOME ONBOARDING ────────────────────────────────────────────────────────
function showWelcomeOnboarding(firstName){
  var existing = document.getElementById('welcomeOnboarding');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'welcomeOnboarding';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,10,30,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px';

  overlay.innerHTML = '<div style="background:white;border-radius:8px;padding:48px;max-width:520px;width:100%;text-align:center;position:relative">'
    + '<div style="font-size:36px;margin-bottom:16px">&#x1F44B;</div>'
    + '<div style="font-size:10px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Welcome to ArchSpex</div>'
    + '<div style="font-family:\'Fraunces\',serif;font-size:28px;font-weight:300;color:var(--text);margin-bottom:8px">Hi ' + (firstName||'there') + '!</div>'
    + '<p style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:28px">Your professional account is ready. Start exploring verified building materials, download BIM files, and connect with manufacturers across the GCC.</p>'
    + '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px">'
    + '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--off);border-radius:6px;text-align:left"><div style="font-size:20px">&#x1F4E6;</div><div><div style="font-size:12px;font-weight:700;color:var(--text)">Browse Products</div><div style="font-size:11px;color:var(--muted)">Explore verified building materials by category</div></div></div>'
    + '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--off);border-radius:6px;text-align:left"><div style="font-size:20px">&#x1F4BE;</div><div><div style="font-size:12px;font-weight:700;color:var(--text)">Download BIM & Technical Files</div><div style="font-size:11px;color:var(--muted)">Access specification-ready resources</div></div></div>'
    + '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--off);border-radius:6px;text-align:left"><div style="font-size:20px">&#x1F4CB;</div><div><div style="font-size:12px;font-weight:700;color:var(--text)">Request Samples & RFQs</div><div style="font-size:11px;color:var(--muted)">Connect directly with brand representatives</div></div></div>'
    + '</div>'
    + '<div style="display:flex;gap:10px;justify-content:center">'
    + '<button onclick="document.getElementById(\'welcomeOnboarding\').remove();showPage(\'products\')" style="background:var(--navy);color:white;border:none;border-radius:6px;padding:12px 28px;font-size:12px;font-weight:800;cursor:pointer;font-family:Manrope,sans-serif">Explore Products &#x2192;</button>'
    + '<button onclick="document.getElementById(\'welcomeOnboarding\').remove();showPage(\'dashboard\')" style="background:white;color:var(--navy);border:1.5px solid var(--border);border-radius:6px;padding:12px 28px;font-size:12px;font-weight:700;cursor:pointer;font-family:Manrope,sans-serif">My Dashboard</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
}

// ── MANUFACTURERS ─────────────────────────────────────────────────────────────
async function renderManufacturers(){
  var bview = window._brandView || 'all';
  var _bcs = document.getElementById('sb-brand-cat-section'); if(_bcs) _bcs.style.display = (bview==='all') ? '' : 'none';
  var _bsp = document.getElementById('brandSubcatPills');
  if(_bsp){
    if(bview==='featured' || bview==='new'){
      var _bcats = [['all','All'],['Structure','Structure'],['Envelope','Envelope'],['Interiors','Interiors'],['Finishes','Finishes'],['Furnishing','FF&E'],['Systems','Systems']];
      _bsp.innerHTML = _bcats.map(function(c){ var ac = ((typeof brandPageFilters!=='undefined' && brandPageFilters.cat)===c[0]) ? ' active' : ''; return `<button class="subcat-pill${ac}" onclick="filterBrandsPage('cat','${c[0]}')">${c[1]}</button>`; }).join('');
    } else { _bsp.innerHTML=''; }
  }
  var btitleEl = document.getElementById('brandsPageTitle') || document.getElementById('brandsCount');
  const grid = document.getElementById('mfgGrid');
  if(grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Loading...</div>';

  var query = sb.from('manufacturers').select('*').eq('status','active').order('featured',{ascending:false}).order('name',{ascending:true});
  if(bview === 'featured') query = query.eq('featured', true);

  const {data, error} = await query;
  var brands = data || [];
  var _bcat = (typeof brandPageFilters!=='undefined' && brandPageFilters.cat) || 'all';
  if(_bcat !== 'all') brands = brands.filter(function(b){ return (b.categories||[]).indexOf(_bcat)>=0; });
  var _allBrands = data || [];
  if(brandPageFilters.country && brandPageFilters.country.length) brands = brands.filter(function(b){ return brandPageFilters.country.indexOf(b.country) >= 0; });
  if(brandPageFilters.cert && brandPageFilters.cert.length) brands = brands.filter(function(b){ return brandPageFilters.cert.every(function(c){ return (b.certifications||[]).includes(c); }); });

  if(btitleEl) btitleEl.textContent = bview==='featured' ? 'Featured Brands' : bview==='new' ? 'New Brands' : 'All Brands';
  var _bcEl = document.getElementById('brandsCount'); if(_bcEl) _bcEl.textContent = brands.length + ' brand' + (brands.length !== 1 ? 's' : '');

  // Also build country filters from data
  var countryEl = document.getElementById('brand-country-filters');
  if(countryEl && _allBrands.length && countryEl.children.length === 0){
    var countries = [...new Set(_allBrands.map(function(b){return b.country;}).filter(Boolean))].sort();
    countryEl.innerHTML = countries.map(function(c){
      return '<label class="filter-check"><input type="checkbox" onchange="filterBrandsPage(\'country\',\''+c+'\')" value="'+c+'"><span>'+c+'</span></label>';
    }).join('');
  }

  var finalGrid = document.getElementById('mfgGrid');
  if(!finalGrid) return;
  if(!brands.length){
    finalGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="font-size:40px;margin-bottom:12px">\uD83C\uDFED</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Manufacturers joining soon</div><div style="font-size:12px;color:var(--muted)">European brands are being onboarded to ArchSpex</div></div>';
    return;
  }

  var finalGrid = document.getElementById('mfgGrid');
  if(!finalGrid) return;
  window._mfgList = brands;
  window._mfgCardFn = _brandCardV2;
  finalGrid.innerHTML = brands.map(window._mfgCardFn).join('');
}

// ── BRAND CARD v2 ─────────────────────────────────────────────────────────────
// New card design per user mockup (hero product image, floating logo tile,
// category pills, market availability, stat tiles, dual action row).
// Placeholder data (hero image, focus line, markets, stats) is derived from
// the brand row until the manufacturers table is extended with real values.
//
// CSS is injected here (not in the HTML) so a single ax2.js swap is enough
// to ship visual updates — no need to also touch index.html + every subroute
// pre-render.
(function _injectBrandCardV2CSS(){
  if(document.getElementById('_ax-brand-card-v3')) return;
  // Design-system tokens (CI reference):
  //   colors:  navy #003366, navy-deep #001A3D, gold #C9A84C
  //            ink #0A1A2C, ink-2 #4B5566, muted #7A8496
  //            border #CBD5E1, border-soft #E5E7EB, success #059669
  //   sizes:   10 / 12 / 14 / 16 / 20 / 24 / 32 / 48
  //   weights: 400 / 500 / 600 / 800
  //   radius:  4 / 8 / 12 / 100
  //   shadow:  sm=0 1px 2px rgba(0,15,40,.04),0 1px 3px rgba(0,15,40,.06)
  //            md=0 4px 12px rgba(0,15,40,.08),0 2px 4px rgba(0,15,40,.04)
  //   trans:   fast 150ms cubic-bezier(.4,0,.2,1); smooth 300ms cubic-bezier(.22,1,.36,1)
  var css = ''
    + '#mfgGrid.profiles-grid{grid-template-columns:repeat(2,1fr) !important;gap:24px !important}'
    + '@media(max-width:780px){#mfgGrid.profiles-grid{grid-template-columns:1fr !important}}'
    // ── Card shell ──────────────────────────────────────────────
    + '.brand-card-v2{position:relative;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform 300ms cubic-bezier(.22,1,.36,1),box-shadow 300ms cubic-bezier(.22,1,.36,1),border-color 150ms cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:Manrope,sans-serif;color:#0A1A2C;box-shadow:0 1px 2px rgba(0,15,40,.04),0 1px 3px rgba(0,15,40,.06)}'
    + '.brand-card-v2:hover{transform:translateY(-4px);box-shadow:0 4px 12px rgba(0,15,40,.08),0 2px 4px rgba(0,15,40,.04);border-color:transparent}'
    + '.brand-card-v2 *{box-sizing:border-box}'
    // ── Hero image ──────────────────────────────────────────────
    + '.bcv2-hero{position:relative;background:#F8FAFC;aspect-ratio:16/10;overflow:hidden}'
    + '.bcv2-hero-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 300ms cubic-bezier(.22,1,.36,1)}'
    + '.brand-card-v2:hover .bcv2-hero-img{transform:scale(1.04)}'
    + '.bcv2-icon-btn{position:absolute;right:12px;width:32px;height:32px;border-radius:8px;background:#FFFFFF;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 2px rgba(0,15,40,.04),0 1px 3px rgba(0,15,40,.06);transition:background 150ms cubic-bezier(.4,0,.2,1)}'
    + '.bcv2-icon-btn svg{width:16px;height:16px;color:#003366;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
    + '.bcv2-bookmark{top:12px}'
    + '.bcv2-bookmark:hover{background:#F8FAFC}'
    + '.bcv2-bookmark.is-saved svg{fill:#003366;stroke:#003366}'
    + '.bcv2-star{top:52px;pointer-events:none}'
    + '.bcv2-star svg{width:16px;height:16px}'
    // ── Body layout ─────────────────────────────────────────────
    + '.bcv2-body{padding:0 24px 24px 24px;display:flex;flex-direction:column;gap:16px;flex:1;position:relative}'
    // ── Floating logo + brand head ──────────────────────────────
    + '.bcv2-logo-row{display:flex;align-items:flex-start;gap:20px;margin-top:-48px}'
    + '.bcv2-logo{width:96px;height:96px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 1px 2px rgba(0,15,40,.04),0 1px 3px rgba(0,15,40,.06);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;color:#003366;font-size:16px;font-weight:800}'
    + '.bcv2-logo img{max-width:80%;max-height:80%;object-fit:contain;display:block}'
    + '.bcv2-head{flex:1 !important;min-width:0;padding-top:60px !important}'
    + '.bcv2-name{font-size:24px;font-weight:800;color:#003366;line-height:1.1;letter-spacing:-.4px;margin:0 0 2px 0}'
    + '.bcv2-country{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#0A1A2C;line-height:1.3;margin:0}'
    + '.bcv2-country img.prod-flag{margin-left:0 !important}'
    + '.bcv2-focus{font-size:12px;font-weight:800;color:#C9A84C;letter-spacing:0;line-height:1.3;margin-top:2px}'
    // ── Description ─────────────────────────────────────────────
    + '.bcv2-desc{font-size:12px;line-height:1.5;color:#4B5566;font-weight:500;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    // ── Category pills ──────────────────────────────────────────
    + '.bcv2-cats{display:flex;flex-wrap:wrap;gap:8px}'
    + '.bcv2-cat-pill{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#003366;background:#FFFFFF;border:1px solid #CBD5E1;padding:6px 10px 6px 8px;border-radius:8px;letter-spacing:0;line-height:1.3;white-space:nowrap}'
    + '.bcv2-cat-pill.bcv2-more{background:#003366;color:#FFFFFF;border-color:#003366;padding:6px 10px}'
    + '.bcv2-cat-ico{display:inline-flex;width:12px;height:12px;color:#003366}'
    + '.bcv2-cat-ico svg{width:12px;height:12px;display:block;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
    // ── Dividers ────────────────────────────────────────────────
    + '.bcv2-divider{height:1px;background:#E5E7EB;margin:0}'
    // ── Market availability ─────────────────────────────────────
    + '.bcv2-mrk-label{font-size:10px;font-weight:800;color:#7A8496;text-transform:uppercase;letter-spacing:1.5px;line-height:1.3;margin:0}'
    + '.bcv2-markets{display:flex;flex-wrap:nowrap;align-items:center;gap:0}'
    + '.bcv2-market{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;color:#003366;background:transparent;border:none;padding:4px 10px;line-height:1.3;flex:1;min-width:0;white-space:nowrap}'
    + '.bcv2-market + .bcv2-market{border-left:1px solid #E5E7EB}'
    + '.bcv2-market img{width:16px;height:auto;border-radius:4px;box-shadow:0 0 0 1px rgba(0,15,40,.08);display:block;flex-shrink:0}'
    + '.bcv2-market-name{}'
    + '.bcv2-check{width:14px;height:14px;flex-shrink:0}'
    // ── Stat tiles ──────────────────────────────────────────────
    + '.bcv2-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}'
    + '.bcv2-stat{display:flex;align-items:center;gap:8px;padding:0;min-width:0}'
    + '.bcv2-stat-ico{width:28px;height:28px;border-radius:8px;background:#F8FAFC;color:#003366;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.bcv2-stat-ico svg{width:14px;height:14px;display:block;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
    + '.bcv2-stat-txt{display:flex;flex-direction:column;line-height:1.1;min-width:0}'
    + '.bcv2-stat-txt b{font-size:16px;font-weight:800;color:#003366;line-height:1.1;white-space:nowrap}'
    + '.bcv2-stat-txt span{font-size:12px;font-weight:600;color:#7A8496;letter-spacing:0;margin-top:2px;line-height:1.3;white-space:nowrap}'
    // ── Actions ─────────────────────────────────────────────────
    + '.bcv2-actions{display:grid;grid-template-columns:1.5fr 1fr;gap:8px;margin-top:0}'
    + '.bcv2-view,.bcv2-contact{display:inline-flex;align-items:center;justify-content:center;gap:4px;font-family:Manrope,sans-serif;font-size:14px;font-weight:800;border-radius:8px;padding:10px 14px;cursor:pointer;letter-spacing:0;line-height:1.3;transition:background 150ms cubic-bezier(.4,0,.2,1),border-color 150ms cubic-bezier(.4,0,.2,1)}'
    + '.bcv2-view{background:#003366;color:#FFFFFF;border:1px solid #003366}'
    + '.bcv2-view:hover{background:#001A3D;border-color:#001A3D}'
    + '.bcv2-view svg{width:14px;height:14px;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
    + '.bcv2-contact{background:#FFFFFF;color:#003366;border:1px solid #CBD5E1;font-weight:600}'
    + '.bcv2-contact:hover{border-color:#003366}'
    + '.bcv2-contact svg{width:14px;height:14px;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}';
  var s = document.createElement('style');
  s.id = '_ax-brand-card-v3';
  s.textContent = css;
  // Append at end of <body> so we WIN source-order vs the stale
  // _ax-brand-card-v2 block that patch_modals.py used to inject before </body>.
  function _bcAppend(){ (document.body || document.documentElement).appendChild(s); }
  if(document.body) _bcAppend(); else document.addEventListener('DOMContentLoaded', _bcAppend);
})();
var _BRAND_HERO_POOL = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=900&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80'
];
var _BRAND_HERO_OVERRIDES = {
  'egger':          'https://images.unsplash.com/photo-1615873968403-89e068629265?w=900&q=80',
  'kone':           'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80',
  'daikin':         'https://images.unsplash.com/photo-1631545308456-8b9e3f4d8e2f?w=900&q=80',
  'guardian glass': 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80',
  'schueco':        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80',
  'marazzi':        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&q=80',
  'arcelormittal':  'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=900&q=80',
  'geberit':        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80'
};
var _BRAND_FOCUS_BY_CAT = {
  'Structure':  'Structural Systems & Framing',
  'Envelope':   'Building Envelope Solutions',
  'Interiors':  'Interior Building Materials',
  'Finishes':   'Surface Finishes & Materials',
  'Furnishing': 'Furniture, Fixtures & Equipment',
  'FF&E':       'Furniture, Fixtures & Equipment',
  'Systems':    'Mechanical & Electrical Systems'
};
function _brandNameHash(s){
  var h = 0; s = String(s||'');
  for(var i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function _brandCountryTC(raw){
  var lower = String(raw||'').toLowerCase().trim();
  if(!lower) return '';
  var CANON = {'dutch':'Netherlands','holland':'Netherlands','netherland':'Netherlands','england':'United Kingdom'};
  if(CANON[lower]) return CANON[lower];
  var ACR = {'usa':'USA','uae':'UAE','uk':'UK','ksa':'KSA','us':'USA'};
  if(ACR[lower]) return ACR[lower];
  return lower.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
}
function _brandCardV2(b){
  var bid = b.id;
  var name = b.name || 'Brand';
  var country = b.country || '';
  var countryTC = _brandCountryTC(country);
  var flagBig = _flagImgFor(country);
  var initials = (name||'B').substring(0,2).toUpperCase();
  var logoHTML = b.logo_url
    ? '<img src="'+b.logo_url+'" alt="'+name.replace(/"/g,'&quot;')+'" onerror="this.replaceWith(document.createTextNode(\''+initials+'\'))">'
    : initials;

  var key = name.toLowerCase().trim();
  var hero = _BRAND_HERO_OVERRIDES[key] || _BRAND_HERO_POOL[_brandNameHash(name) % _BRAND_HERO_POOL.length];

  var cats = (b.categories||[]).filter(Boolean);
  var catsShown = cats.slice(0,3);
  var catsMore  = Math.max(0, cats.length - 3);
  var catPills  = catsShown.map(function(c){
    return '<span class="bcv2-cat-pill">'+_catIconSVG(c)+'<span>'+c+'</span></span>';
  }).join('');
  if(catsMore > 0) catPills += '<span class="bcv2-cat-pill bcv2-more">+'+catsMore+'</span>';

  var focus = b.focus_line || (cats[0] && _BRAND_FOCUS_BY_CAT[cats[0]]) || 'Premium Building Materials';

  var markets = [
    {code:'ae', name:'UAE'},
    {code:'sa', name:'KSA'},
    {code:'qa', name:'Qatar'},
    {code:'om', name:'Oman'}
  ];
  var marketHTML = markets.map(function(m){
    return '<span class="bcv2-market">'
      + '<img src="https://flagcdn.com/w20/'+m.code+'.png" srcset="https://flagcdn.com/w40/'+m.code+'.png 2x" alt="" loading="lazy">'
      + '<span class="bcv2-market-name">'+m.name+'</span>'
      + '<svg class="bcv2-check" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="7.5 12 11 15.5 16.5 9.5"/></svg>'
      + '</span>';
  }).join('');

  var h = _brandNameHash(name);
  var stats = [
    {n: 40 + (h % 120),          l:'Products',  ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/></svg>'},
    {n: 10 + ((h>>4)  % 30),     l:'BIM Files', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9h16M9 4v16"/></svg>'},
    {n: 50 + ((h>>8)  % 150),    l:'Documents', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>'},
    {n: 8  + ((h>>12) % 22),     l:'Projects',  ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/></svg>'}
  ];
  var statsHTML = stats.map(function(s){
    return '<div class="bcv2-stat"><span class="bcv2-stat-ico">'+s.ico+'</span>'
      + '<span class="bcv2-stat-txt"><b>'+s.n+'</b><span>'+s.l+'</span></span></div>';
  }).join('');

  return '<article class="brand-card-v2" onclick="openBrandProfile('+bid+')">'
    + '<div class="bcv2-hero">'
    +   '<img class="bcv2-hero-img" src="'+hero+'" alt="'+name.replace(/"/g,'&quot;')+'" loading="lazy">'
    +   '<button type="button" class="bcv2-icon-btn bcv2-bookmark" onclick="event.stopPropagation();_brandBookmarkToggle(this,'+bid+')" title="Save brand" aria-label="Save brand">'
    +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
    +   '</button>'
    +   (b.featured ? '<div class="bcv2-icon-btn bcv2-star" title="Featured Brand" aria-label="Featured Brand"><svg viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12,2 15,9 22,9.5 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.5 9,9"/></svg></div>' : '')
    + '</div>'
    + '<div class="bcv2-body">'
    +   '<div class="bcv2-logo-row">'
    +     '<div class="bcv2-logo">'+logoHTML+'</div>'
    +     '<div class="bcv2-head">'
    +       '<div class="bcv2-name">'+name+'</div>'
    +       '<div class="bcv2-country">'+ (flagBig ? flagBig : '') +'<span>'+countryTC+'</span></div>'
    +       '<div class="bcv2-focus">'+focus+'</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="bcv2-desc">'+(b.description||'Premium manufacturer serving the GCC & Middle East market.')+'</div>'
    +   (catPills ? '<div class="bcv2-cats">'+catPills+'</div>' : '')
    +   '<div class="bcv2-divider"></div>'
    +   '<div class="bcv2-mrk-label">Market Availability</div>'
    +   '<div class="bcv2-markets">'+marketHTML+'</div>'
    +   '<div class="bcv2-divider"></div>'
    +   '<div class="bcv2-stats">'+statsHTML+'</div>'
    +   '<div class="bcv2-actions">'
    +     '<button type="button" class="bcv2-view" onclick="event.stopPropagation();openBrandProfile('+bid+')">View Brand</button>'
    +     '<button type="button" class="bcv2-contact" onclick="event.stopPropagation();openReq(null)">Contact</button>'
    +   '</div>'
    + '</div>'
    + '</article>';
}
function _catIconSVG(cat){
  var C = {
    'Structure':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-7h6v7"/></svg>',
    'Envelope':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><polyline points="3 7 12 13 21 7"/></svg>',
    'Interiors':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6"/><path d="M4 18h16"/><path d="M6 18v2M18 18v2"/></svg>',
    'Finishes':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M10 4v16"/></svg>',
    'Furnishing': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 18v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M4 22v-4M20 22v-4"/></svg>',
    'FF&E':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 18v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M4 22v-4M20 22v-4"/></svg>',
    'Systems':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>'
  };
  return '<span class="bcv2-cat-ico">'+(C[cat] || C['Interiors'])+'</span>';
}
// Local-only bookmark visual toggle (no backend). Real save flow to be wired.
function _brandBookmarkToggle(el, id){
  el.classList.toggle('is-saved');
  try{
    var k = '_bmk_brands';
    var s = JSON.parse(localStorage.getItem(k) || '[]');
    var i = s.indexOf(id);
    if(i>=0) s.splice(i,1); else s.push(id);
    localStorage.setItem(k, JSON.stringify(s));
  }catch(e){}
}

function sortMfgList(val){
  var list = (window._mfgList||[]).slice();
  if(val === 'az'){
    list.sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
  } else if(val === 'newest'){
    list.sort(function(a,b){ return (b.id||0) - (a.id||0); });
  } else {
    list.sort(function(a,b){
      var af = a.featured ? 1 : 0, bf = b.featured ? 1 : 0;
      if(bf !== af) return bf - af;
      return (a.name||'').localeCompare(b.name||'');
    });
  }
  var grid = document.getElementById('mfgGrid');
  if(grid && window._mfgCardFn) grid.innerHTML = list.map(window._mfgCardFn).join('');
}

async function openBrandProfile(id){
  const {data:brand} = await sb.from('manufacturers').select('*').eq('id',id).single();
  if(!brand) return;
  const {data:prods} = await sb.from('products').select('*').eq('brand', brand.name).eq('status','approved');
  var list = prods||[];
  window._bpProds = list;

  var page = document.getElementById('page-brandprofile');
  if(!page){
    page = document.createElement('div');
    page.id = 'page-brandprofile';
    page.style.display = 'none';
    var ref = document.getElementById('page-manufacturers');
    if(ref){ ref.insertAdjacentElement('afterend', page); } else { document.body.appendChild(page); }
  }

  // ─── Inject brand-profile CSS once ─────────────────────────────────────────
  if(!document.getElementById('bp-styles-v2')){
    var st = document.createElement('style');
    st.id = 'bp-styles-v2';
    st.textContent = ''
      + '#page-brandprofile .bp-tab{position:relative;display:inline-flex;align-items:center;gap:6px;padding:18px 4px;font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;transition:color .15s;cursor:pointer}'
      + '#page-brandprofile .bp-tab:hover{color:var(--navy)}'
      + '#page-brandprofile .bp-tab.active{color:var(--navy)}'
      + '#page-brandprofile .bp-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--gold);border-radius:2px}'
      + '#page-brandprofile .bp-stat-tile{padding:20px 24px;background:rgba(0,15,40,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}'
      + '#page-brandprofile .bp-cta-primary{transition:transform .15s,box-shadow .15s}'
      + '#page-brandprofile .bp-cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(201,168,76,.42)}'
      + '#page-brandprofile .bp-gallery-tile{transition:transform .25s ease,box-shadow .25s ease}'
      + '#page-brandprofile .bp-gallery-tile:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(0,15,40,.12)}'
      + '@media(max-width:980px){#page-brandprofile .bp-stats-row{grid-template-columns:repeat(2,1fr) !important}#page-brandprofile .bp-hero-main{flex-direction:column;align-items:flex-start !important}#page-brandprofile .bp-cta-stack{width:100%;flex-direction:row !important}#page-brandprofile .bp-cta-stack>*{flex:1}}'
      + '@media(max-width:560px){#page-brandprofile .bp-stats-row{grid-template-columns:1fr !important}#page-brandprofile .bp-hero-h1{font-size:34px !important}#page-brandprofile .bp-padx{padding-left:24px !important;padding-right:24px !important}}';
    document.head.appendChild(st);
  }

  var initials = (brand.name||'B').substring(0,2).toUpperCase();
  var locParts = [brand.city, brand.country].filter(Boolean);
  var loc = locParts.join(', ');
  var cats = brand.categories || [];
  var catChips = cats.map(function(c){
    return '<span style="display:inline-block;font-size:10px;font-weight:700;color:var(--gold);border:1px solid rgba(201,168,76,.42);background:rgba(201,168,76,.08);padding:5px 12px;border-radius:6px;text-transform:uppercase;letter-spacing:.7px;line-height:1.2">' + c + '</span>';
  }).join('');

  var imgs = (brand.images || brand.gallery || []);
  var galleryTiles;
  if(imgs.length){
    galleryTiles = imgs.map(function(u){
      return '<div class="bp-gallery-tile" style="aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--off);box-shadow:0 4px 14px rgba(0,15,40,.06);cursor:pointer"><img src="' + u + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
    }).join('');
  } else {
    galleryTiles = ''
      + '<div style="grid-column:1/-1;padding:64px 24px;border-radius:16px;border:1px dashed rgba(201,168,76,.42);background:linear-gradient(135deg,rgba(201,168,76,.05),rgba(0,51,102,.02));display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--muted);text-align:center">'
      + '<div style="width:52px;height:52px;border-radius:50%;background:rgba(201,168,76,.12);display:flex;align-items:center;justify-content:center;color:var(--gold)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>'
      + '<div style="font-size:13px;font-weight:700;color:var(--navy)">Company photos coming soon</div>'
      + '<div style="font-size:11px;color:var(--muted);max-width:320px;line-height:1.65">The brand has not yet uploaded gallery imagery to their ArchSpex profile.</div>'
      + '</div>';
  }

  var bpToolbar = `<div class="list-ctrls"><div class="view-toggle"><button class="view-btn active" title="Grid view" onclick="setListView('bpProdGrid','grid',this)"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></button><button class="view-btn" title="List view" onclick="setListView('bpProdGrid','list',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg></button></div><div class="sort-wrap"><span class="sort-label-mini">Sort By</span><div class="sort-dd" data-fn="sortBrandProds"><button type="button" class="sort-dd-btn" onclick="toggleSortDD(this)"><span class="sort-dd-cur">Featured</span><svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l4 4 4-4"/></svg></button><div class="sort-dd-menu"><button type="button" class="sort-dd-opt selected" data-val="" onclick="pickSortOpt(this)">Featured</button><button type="button" class="sort-dd-opt" data-val="az" onclick="pickSortOpt(this)">Name A\u2013Z</button><button type="button" class="sort-dd-opt" data-val="newest" onclick="pickSortOpt(this)">Newest</button></div></div></div></div>`;

  var prodGridInner = list.length ? list.map(prodCard).join('') : bpEmpty();

  page.innerHTML =
    // ═══ HERO ═══════════════════════════════════════════════════════
    '<div style="background:linear-gradient(135deg,#001a3d 0%,#003366 55%,#00254d 100%);position:relative;overflow:hidden">'
      // gold radial glow
      + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 88% -10%,rgba(201,168,76,.30) 0%,transparent 65%);pointer-events:none"></div>'
      // subtle dot pattern
      + '<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);background-size:26px 26px;opacity:.45;pointer-events:none"></div>'

      // Top bar — Back to Brands + Featured/Verified pills (right side)
      + '<div class="bp-padx" style="max-width:1180px;margin:0 auto;padding:20px 48px 0;position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'
        + '<button onclick="backToBrands()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;gap:8px;transition:background .15s,border-color .15s" onmouseover="this.style.background=\'rgba(255,255,255,.14)\';this.style.borderColor=\'rgba(255,255,255,.22)\'" onmouseout="this.style.background=\'rgba(255,255,255,.08)\';this.style.borderColor=\'rgba(255,255,255,.14)\'">'
          + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'
          + 'Back to Brands'
        + '</button>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
          + (brand.featured ? '<span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:var(--navy);background:var(--gold);padding:6px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:1px"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279L0 9.306l8.332-1.151z"/></svg>Featured Partner</span>' : '')
          + '<span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:rgba(255,255,255,.92);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:6px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified Brand</span>'
        + '</div>'
      + '</div>'

      // Main hero row: logo / info / CTA stack
      + '<div class="bp-padx bp-hero-main" style="max-width:1180px;margin:0 auto;padding:22px 48px 22px;position:relative;display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap">'
        // Logo box
        + '<div style="width:96px;height:96px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:var(--navy);flex-shrink:0;box-shadow:0 14px 34px rgba(0,0,0,.40),inset 0 0 0 3px rgba(201,168,76,.20);letter-spacing:-1px">' + initials + '</div>'

        // Info column
        + '<div style="flex:1;min-width:280px">'
          // Brand name
          + '<h1 class="bp-hero-h1" style="font-family:Fraunces,serif;font-size:40px;font-weight:300;color:#fff;line-height:1.05;margin:0 0 10px;letter-spacing:-1px">' + (brand.name||'') + '</h1>'
          // Location + Founded row with icons
          + '<div style="display:flex;align-items:center;gap:14px;font-size:13px;color:rgba(255,255,255,.72);margin-bottom:12px;flex-wrap:wrap">'
            + (loc ? '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + loc + '</span>' : '')
            + (loc && brand.founded ? '<span style="opacity:.35">\u2022</span>' : '')
            + (brand.founded ? '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Established ' + brand.founded + '</span>' : '')
          + '</div>'
          // Category chips
          + (catChips ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' + catChips + '</div>' : '')
        + '</div>'

        // CTA stack
        + '<div class="bp-cta-stack" style="display:flex;flex-direction:column;gap:10px;align-items:stretch">'
          + (brand.website ? '<a href="' + brand.website + '" target="_blank" rel="noopener" class="bp-cta-primary" style="background:var(--gold);color:var(--navy);font-size:13px;font-weight:800;padding:13px 28px;border-radius:9px;text-decoration:none;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 26px rgba(201,168,76,.32)">Visit Website<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></a>' : '')
          + '<button onclick="openReq(null)" style="background:rgba(255,255,255,.06);color:#fff;font-size:12px;font-weight:700;padding:12px 26px;border-radius:9px;border:1px solid rgba(255,255,255,.20);cursor:pointer;font-family:Manrope,sans-serif;white-space:nowrap;transition:background .15s,border-color .15s;display:inline-flex;align-items:center;justify-content:center;gap:7px" onmouseover="this.style.background=\'rgba(255,255,255,.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,.06)\'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Request Information</button>'
        + '</div>'
      + '</div>'

      // Quick stats row (glass tiles)
      + '<div class="bp-padx" style="max-width:1180px;margin:0 auto;padding:0 48px 26px;position:relative">'
        + '<div class="bp-stats-row" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.10);border-radius:14px;overflow:hidden">'
          + '<div class="bp-stat-tile"><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Products</div><div style="font-size:22px;font-weight:300;color:#fff;font-family:Fraunces,serif;line-height:1">' + list.length + '</div></div>'
          + '<div class="bp-stat-tile"><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Founded</div><div style="font-size:22px;font-weight:300;color:#fff;font-family:Fraunces,serif;line-height:1">' + (brand.founded||'\u2014') + '</div></div>'
          + '<div class="bp-stat-tile"><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Employees</div><div style="font-size:22px;font-weight:300;color:#fff;font-family:Fraunces,serif;line-height:1">' + (brand.employees||'\u2014') + '</div></div>'
          + '<div class="bp-stat-tile"><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Headquarters</div><div style="font-size:13px;font-weight:600;color:#fff;line-height:1.35">' + (loc||'\u2014') + '</div></div>'
        + '</div>'
      + '</div>'
    + '</div>'

    // ═══ ABOUT ══════════════════════════════════════════════════════
    + '<div id="bp-about" class="bp-padx" style="background:#f8f9fc;padding:56px 48px">'
      + '<div style="max-width:1180px;margin:0 auto">'
        + '<div style="font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px">About the Brand</div>'
        + '<h2 style="font-family:Fraunces,serif;font-size:30px;font-weight:300;color:var(--navy);line-height:1.2;margin:0 0 24px;max-width:760px">Get to know ' + (brand.name||'this brand') + '</h2>'
        + '<p style="font-size:15px;color:var(--text);line-height:1.85;margin:0;max-width:820px">' + (brand.description||'No description provided yet.') + '</p>'
      + '</div>'
    + '</div>'

    // ═══ GALLERY ════════════════════════════════════════════════════
    + '<div id="bp-gallery" class="bp-padx" style="background:white;padding:56px 48px">'
      + '<div style="max-width:1180px;margin:0 auto">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:12px">'
          + '<div>'
            + '<div style="font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Visual Reference</div>'
            + '<h2 style="font-family:Fraunces,serif;font-size:26px;font-weight:300;color:var(--navy);margin:0">Gallery</h2>'
          + '</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' + galleryTiles + '</div>'
      + '</div>'
    + '</div>'

    // ═══ PRODUCTS ═══════════════════════════════════════════════════
    + '<div id="bp-products" class="bp-padx" style="background:#f8f9fc;padding:56px 48px 80px">'
      + '<div style="max-width:1180px;margin:0 auto">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:16px">'
          + '<div>'
            + '<div style="font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Product Catalogue</div>'
            + '<h2 style="font-family:Fraunces,serif;font-size:30px;font-weight:300;color:var(--navy);margin:0 0 4px">Products by ' + (brand.name||'this brand') + '</h2>'
            + '<div style="font-size:12px;color:var(--muted)">' + list.length + ' product' + (list.length!==1?'s':'') + (cats.length ? ' \u00b7 ' + cats.join(', ') : '') + '</div>'
          + '</div>'
          + bpToolbar
        + '</div>'
        + '<div class="prod-grid" id="bpProdGrid">' + prodGridInner + '</div>'
      + '</div>'
    + '</div>';

  showPage('brandprofile');
  if(typeof closeModal==='function') closeModal();
}

function bpEmpty(){
  return ''
    + '<div style="grid-column:1/-1;text-align:center;padding:60px 24px;border:1px dashed var(--border);border-radius:16px;background:#fafbfd">'
    + '<div style="width:56px;height:56px;border-radius:50%;background:rgba(0,51,102,.06);display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;color:var(--navy)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div>'
    + '<div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:6px">No products listed yet</div>'
    + '<div style="font-size:12px;color:var(--muted);font-weight:500;line-height:1.65;max-width:340px;margin:0 auto">This brand has not added any products to their ArchSpex catalogue.</div>'
    + '</div>';
}

function sortBrandProds(val){
  var list = (window._bpProds||[]).slice();
  if(val==='az') list.sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
  else if(val==='newest') list.sort(function(a,b){ return (b.id||0)-(a.id||0); });
  var grid = document.getElementById('bpProdGrid');
  if(grid) grid.innerHTML = list.length ? list.map(prodCard).join('') : bpEmpty();
}

function backToBrands(){ if(typeof navTop==='function'){ navTop('manufacturers'); } else { showPage('manufacturers'); } }

function bpScrollTo(targetId, btn){
  try {
    document.querySelectorAll('#page-brandprofile .bp-tab').forEach(function(t){ t.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var el = document.getElementById(targetId);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  } catch(e){}
}

function statRow(label, val){
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'
    + '<span style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">' + label + '</span>'
    + '<span style="font-size:15px;font-weight:800;color:var(--navy);text-align:right">' + val + '</span></div>';
}

async function openBrandByName(name){
  if(!name) return;
  const {data} = await sb.from('manufacturers').select('id').eq('name', name).limit(1);
  if(data && data.length){ openBrandProfile(data[0].id); }
  else { if(typeof closeModal==='function') closeModal(); showPage('manufacturers'); }
}


function filterBrand(brandName){
  activeFilters.brand=[brandName];
  showPage('products');
}

// ── PROFESSIONALS ─────────────────────────────────────────────────────────────
async function renderProfessionals(type){
  const {data} = await sb.from('profiles').select('*').in('user_type',['Architect / Designer','Contractor / Buyer']).order('created_at',{ascending:false});
  const filtered = type==='all' ? (data||[]) : (data||[]).filter(p=>p.user_type===type);
  const grid = document.getElementById('profsGrid');
  if(filtered.length){
    grid.innerHTML = filtered.map(p=>`
      <div class="profile-card">
        <div class="profile-av" style="background:var(--light);color:var(--navy)">${(p.full_name||'?')[0]}</div>
        <div class="profile-name">${p.full_name||'Professional'}</div>
        <div class="profile-type">${p.user_type||'—'} · ${p.country||'UAE'}</div>
        <div class="profile-desc">${p.company||''}</div>
        <div class="profile-actions">
          <button class="btn-profile-primary">View Profile</button>
          <button class="btn-profile-sec">Connect</button>
        </div>
      </div>`).join('');
  } else {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px">
      <div style="margin-bottom:12px;display:flex;justify-content:center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M3 18v-2a9 9 0 0 1 18 0v2"/><path d="M8 8.5V7a4 4 0 0 1 8 0v1.5"/></svg></div>
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Professionals joining soon</div>
      <div style="font-size:12px;color:var(--muted)">Architects and designers are registering on ArchSpex</div>
    </div>`;
  }
}
function filterProf(type){renderProfessionals(type)}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
async function renderProjects(){
  var grid = document.getElementById('projectsGrid');
  if(grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Loading...</div>';
  const {data, error} = await sb.from('projects').select('*').eq('status','active').order('featured',{ascending:false}).order('created_at',{ascending:false});
  var projects = data || [];
  var _pc = document.getElementById('projCount'); if(_pc) _pc.textContent = projects.length + ' project' + (projects.length!==1?'s':'');
  if(!grid) return;
  if(!projects.length){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="font-size:40px;margin-bottom:12px">\uD83C\uDFD9</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Projects coming soon</div><div style="font-size:12px;color:var(--muted)">UAE & GCC project gallery launching soon</div></div>';
    return;
  }
  grid.innerHTML = projects.map(function(p){
    var brands = (p.featured_brands||[]).slice(0,3).join(' \xb7 ');
    return '<div class="proj-card" onclick="openProjectDetail('+p.id+')" style="cursor:pointer">'
      + '<div class="proj-img" style="background-image:url('+(p.image_url||'')+');position:relative">'
      + (p.featured ? '<span style="position:absolute;top:12px;left:12px;background:var(--gold);color:var(--navy);font-size:9px;font-weight:800;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px">Featured</span>' : '')
      + '</div>'
      + '<div class="proj-body">'
      + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
      + '<span style="font-size:9px;font-weight:700;color:var(--gold);background:rgba(201,168,76,.1);padding:2px 8px;border-radius:100px;text-transform:uppercase">'+(p.sector||'')+'</span>'
      + '<span style="font-size:10px;color:var(--muted)">'+(p.year||'')+'</span>'
      + '</div>'
      + '<div class="proj-name">'+(p.name||'')+'</div>'
      + '<div class="proj-loc">'+(p.location||'')+'</div>'
      + (p.architect ? '<div style="font-size:11px;color:var(--muted);margin-top:4px">Architect: '+p.architect+'</div>' : '')
      + (brands ? '<div style="font-size:10px;color:var(--navy);font-weight:600;margin-top:8px">'+ brands +'</div>' : '')
      + '<button style="margin-top:12px;background:var(--navy);color:white;border:none;border-radius:6px;padding:7px 16px;font-size:11px;font-weight:700;cursor:pointer;font-family:Manrope,sans-serif">View Project \u2192</button>'
      + '</div></div>';
  }).join('');
}

async function openProjectDetail(id){
  const {data:proj} = await sb.from('projects').select('*').eq('id',id).single();
  if(!proj) return;
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:6000;background:rgba(0,10,30,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.onclick = function(e){ if(e.target===overlay) overlay.remove(); };
  var brands = (proj.featured_brands||[]).map(function(b){ return '<span style="background:var(--light);color:var(--navy);font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px">'+b+'</span>'; }).join('');
  overlay.innerHTML = '<div style="background:white;border-radius:8px;max-width:680px;width:100%;max-height:88vh;overflow-y:auto;position:relative">'
    + '<div style="height:280px;background-image:url('+(proj.image_url||'')+');background-size:cover;background-position:center;border-radius:8px 8px 0 0;position:relative">'
    + '<button onclick="this.closest(\'div\').parentElement.parentElement.remove()" style="position:absolute;top:16px;right:16px;background:rgba(0,0,0,.4);border:none;color:white;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer">\u00d7</button>'
    + '<div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(to top,rgba(0,0,0,.7),transparent)">'
    + '<div style="font-size:9px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+(proj.sector||'')+'</div>'
    + '<div style="font-family:Fraunces,serif;font-size:24px;font-weight:300;color:white">'+(proj.name||'')+'</div>'
    + '</div></div>'
    + '<div style="padding:28px">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">'
    + '<div><div style="font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">Location</div><div style="font-size:12px;font-weight:600;color:var(--text)">'+(proj.location||'')+'</div></div>'
    + '<div><div style="font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">Architect</div><div style="font-size:12px;font-weight:600;color:var(--text)">'+(proj.architect||'—')+'</div></div>'
    + '<div><div style="font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">Year</div><div style="font-size:12px;font-weight:600;color:var(--text)">'+(proj.year||'—')+'</div></div>'
    + '</div>'
    + '<div style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:20px">'+(proj.description||'')+'</div>'
    + (brands ? '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Featured Brands</div><div style="display:flex;flex-wrap:wrap;gap:6px">'+brands+'</div>' : '')
    + '</div></div>';
  document.body.appendChild(overlay);
}

// ── SHOWROOM ──────────────────────────────────────────────────────────────────
function renderShowroom(){
  const labels={laminates:'Laminates & Boards',flooring:'Floor & Wall',acoustic:'Acoustic',furniture:'Furniture',fitout:'Fit-Out'};
  document.getElementById('hallTabs').innerHTML=Object.entries(labels).map(([k,v])=>`<button class="hall-tab ${k===activeHall?'active':''}" onclick="switchHall('${k}')">${v}</button>`).join('');
  renderBooths();
}
function switchHall(h){
  activeHall=h;
  const bc=document.getElementById('hallBooths');
  bc.style.opacity='0';bc.style.transform='translateY(12px)';
  setTimeout(()=>{renderBooths();bc.style.transition='all .4s ease';bc.style.opacity='1';bc.style.transform='translateY(0)'},180);
  const labels={laminates:'Laminates & Boards',flooring:'Floor & Wall',acoustic:'Acoustic',furniture:'Furniture',fitout:'Fit-Out'};
  document.querySelectorAll('.hall-tab').forEach(t=>t.classList.toggle('active',t.textContent.trim()===labels[h]));
}
function renderBooths(){
  const hallData = showroomData[activeHall]||[];
  const el = document.getElementById('hallBooths');
  if(hallData.length){
    el.innerHTML=hallData.map(b=>`
      <div class="booth" onclick="showBoothPopup('${b.n}','${b.c}')">
        <div class="booth-flag"><div class="flag-pole"></div><div class="flag-tag">${b.f}</div></div>
        <div class="booth-body">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="opacity:.7"><rect x="2" y="4" width="18" height="2.5" rx=".5" stroke="rgba(201,168,76,.9)" stroke-width="1.2"></rect><rect x="2" y="8.5" width="18" height="2.5" rx=".5" stroke="rgba(201,168,76,.9)" stroke-width="1.2"></rect><rect x="2" y="13" width="18" height="2.5" rx=".5" stroke="rgba(201,168,76,.9)" stroke-width="1.2"></rect></svg>
          <div class="booth-name">${b.n}</div><div class="booth-country">${b.c}</div>
        </div>
        <div class="booth-base" style="width:130px"></div>
      </div>`).join('');
  } else {
    el.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.4);font-size:13px">No brands in this hall yet</div>`;
  }
  document.getElementById('hallHint').style.display = hallData.length ? 'block' : 'none';
}
function showBoothPopup(name,country){
  document.getElementById('hallHint').style.display='none';
  document.getElementById('boothPopupBox')?.remove();
  const box=document.createElement('div');
  box.id='boothPopupBox';box.className='booth-popup';
  box.innerHTML=`<div class="booth-popup-cat">${country} · Brand Showroom</div><div class="booth-popup-name">${name}</div><div class="booth-popup-btns"><button class="bp-btn-gold" onclick="showPage('products')">View Products</button><button class="bp-btn-ghost" onclick="openReq(null)">Request Sample</button><button class="bp-close" onclick="this.closest('.booth-popup').remove();document.getElementById('hallHint').style.display='block'">✕</button></div>`;
  document.querySelector('.showroom-hall').appendChild(box);
}

// ── NEWS ──────────────────────────────────────────────────────────────────────
function newsCard(p){
  var date = p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
  var img = p.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';
  return '<div class="news-card" style="cursor:pointer" onclick="openNewsPost(' + p.id + ')">'
    + '<div class="news-img" style="background-image:url(' + img + ')"></div>'
    + '<div class="news-body">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:9px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1px;background:rgba(201,168,76,.1);padding:3px 8px;border-radius:100px">' + (p.category||'News') + '</span><span style="font-size:10px;color:var(--muted)">' + date + '</span></div>'
    + '<div class="news-title">' + (p.title||'') + '</div>'
    + '<div class="news-sub">' + (p.summary||'') + '</div>'
    + '</div></div>';
}

async function renderNews(){
  var grid = document.getElementById('newsPageGrid');
  if(grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Loading...</div>';
  try {
    var res = await sb.from('news_posts').select('*').order('created_at',{ascending:false});
    var posts = res.data || [];
    if(grid){
      grid.innerHTML = posts.length ? posts.map(newsCard).join('') :
        '<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="font-size:40px;margin-bottom:12px">\uD83D\uDCF0</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">News &amp; insights coming soon</div><div style="font-size:12px;color:var(--muted)">Industry news, CPD sessions and trend reports launching soon</div></div>';
    }
    // Also update home news section
    var homeGrid = document.getElementById('homeNewsGrid');
    if(homeGrid && posts.length){
      homeGrid.innerHTML = posts.slice(0,3).map(newsCard).join('');
    }
  } catch(e){ console.error(e); }
}

async function loadHomeNews(){
  try {
    var res = await sb.from('news_posts').select('*').order('created_at',{ascending:false}).limit(3);
    var posts = res.data || [];
    var homeGrid = document.getElementById('homeNewsGrid');
    if(homeGrid){
      homeGrid.innerHTML = posts.length ? posts.map(newsCard).join('') :
        '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-size:12px">News and insights coming soon</div>';
    }
  } catch(e){}
}

function openNewsPost(id){
  // For now just go to news page — full article view can be added later
  showPage('news');
}

// ── GUIDES ────────────────────────────────────────────────────────────────────
function renderGuides(){
  document.getElementById('guidesPageGrid').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px">
    <div style="margin-bottom:12px;display:flex;justify-content:center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
    <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Buying guides coming soon</div>
    <div style="font-size:12px;color:var(--muted)">Specification guides for UAE & GCC projects launching soon</div>
  </div>`;
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function doSearch(){
  // Read from the CURRENTLY FOCUSED input first — that's the one the user
  // just hit Enter in. Falling back to first-with-value made hero win when
  // it still held a stale query from a previous search.
  const heroEl = document.getElementById('heroSearchInput');
  const navEl  = document.getElementById('navSearchInput');
  const active = document.activeElement;
  var rawQ = '';
  if(active === navEl && navEl && navEl.value)      rawQ = navEl.value;
  else if(active === heroEl && heroEl && heroEl.value) rawQ = heroEl.value;
  else rawQ = ((heroEl && heroEl.value) || (navEl && navEl.value) || '');
  rawQ = rawQ.trim();
  const q = rawQ.toLowerCase();
  if(!q) return;
  // Keep both inputs in sync so the user sees the same query wherever they look.
  if(heroEl) heroEl.value = rawQ;
  if(navEl)  navEl.value  = rawQ;
  // Set search state FIRST so any downstream renders see it immediately.
  window._searchInProgress = true;
  window._activeSearchQ = q;
  window._activeSearchTs = Date.now(); // timestamp guard for link_shim's reset
  setTimeout(function(){ window._searchInProgress = false; }, 200);
  // Only navigate + trigger renderAllProducts (which shows the loader
  // spinner + refetches DB) when we AREN'T already on Products. Searching
  // from the nav bar while already on Products should just re-filter
  // in-place — otherwise the user sees a flash of the loading state.
  if(currentPage !== 'products'){
    showPage('products');
  }
  // Re-render with the new search filter — instant, no DB fetch.
  if(typeof applyAndRender === 'function' && Array.isArray(liveProducts) && liveProducts.length){
    applyAndRender();
  }
}
function heroGo(){const q=document.getElementById('heroSearchInput').value;document.getElementById('navSearchInput').value=q;doSearch()}
function liveSearch(v){if(currentPage==='products'&&v.length>1){const all=[...(liveProducts||[])];const f=all.filter(p=>(p.name||'').toLowerCase().includes(v.toLowerCase())||(p.brand||'').toLowerCase().includes(v.toLowerCase()));document.getElementById('allProdGrid').innerHTML=f.map(prodCard).join('');document.getElementById('prodCount').textContent=f.length+' products'}}

// ── CAT FILTER ────────────────────────────────────────────────────────────────
function filterCat(cat,el){
  activeCat=cat;
  document.querySelectorAll('.cat-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  if(currentPage==='products') renderFiltered();
  else showPage('products');
}
function toggleCatDrop(id, btn){
  // Close all other dropdowns
  document.querySelectorAll('.cat-subdrop').forEach(d=>{
    if(d.id !== id) d.classList.remove('open');
  });
  document.getElementById(id).classList.toggle('open');
  // Close on outside click
  setTimeout(()=>{
    document.addEventListener('click', function closeDrop(e){
      if(!e.target.closest('.cat-dropdown-wrap')){
        document.querySelectorAll('.cat-subdrop').forEach(d=>d.classList.remove('open'));
        document.removeEventListener('click', closeDrop);
      }
    });
  }, 10);
}

// ── BRAND APPLICATION MODAL ───────────────────────────────────────────────────
function openBrandModal(){
  document.getElementById('brandModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('brandFormMsg').style.display = 'none';
}
function closeBrandModal(){
  document.getElementById('brandModal').style.display = 'none';
  document.body.style.overflow = '';
}

async function submitBrandApplication(){
  const company = document.getElementById('ba-company').value.trim();
  const name = document.getElementById('ba-name').value.trim();
  const email = document.getElementById('ba-email').value.trim();
  const phone = document.getElementById('ba-phone').value.trim();
  const category = document.getElementById('ba-category').value;
  const country = document.getElementById('ba-country').value.trim();
  var message = document.getElementById('ba-message').value.trim();
  const tier = window._brandTier || '';
  if(tier) message = message + (message ? '\n\n' : '') + '[Membership tier requested: ' + tier + ']';
  var _bapt = Array.from(document.querySelectorAll('#ba-producttypes input:checked')).map(function(c){return c.value;});
  if(_bapt.length) message = message + (message ? '\n' : '') + '[Primary product types: ' + _bapt.join(', ') + ']';
  var _bamk = Array.from(document.querySelectorAll('#ba-markets input:checked')).map(function(c){return c.value;});
  if(_bamk.length) message = message + (message ? '\n' : '') + '[Preferred GCC markets: ' + _bamk.join(', ') + ']';
  const msg = document.getElementById('brandFormMsg');

  if(!company||!name||!email){
    msg.textContent = '⚠ Please fill in company name, contact name and email.';
    msg.style.display = 'block';
    msg.style.background = '#fef2f2';
    msg.style.color = '#dc2626';
    return;
  }

  const btn = document.getElementById('baSubmitBtn');
  btn.textContent = 'Sending…'; btn.disabled = true;

  const {error} = await sb.from('brand_applications').insert({
    company, name, email, category: category||'General',
    phone, country, message
  });

  btn.textContent = 'Submit Brand Application →'; btn.disabled = false;

  if(error){
    msg.textContent = '⚠ Error: ' + error.message;
    msg.style.display = 'block';
    msg.style.background = '#fef2f2';
    msg.style.color = '#dc2626';
    return;
  }

  msg.textContent = '✓ Application received! ArchSpex will contact you within 2 business days.';
  msg.style.display = 'block';
  msg.style.background = '#d1fae5';
  msg.style.color = '#065f46';
  sendNotification(`New Brand Application — ${company}`,
    `<h3 style="color:#003366">New brand application received</h3>
     <p><strong>Company:</strong> ${company}</p>
     <p><strong>Contact:</strong> ${name}</p>
     <p><strong>Email:</strong> ${email}</p>
     <p><strong>Phone:</strong> ${phone||'—'}</p>
     <p><strong>Country:</strong> ${country||'—'}</p>
     <p><strong>Category:</strong> ${category||'—'}</p>
     <p><strong>Message:</strong><br>${(message||'—').replace(/\n/g,'<br>')}</p>`
  );
  ['ba-company','ba-name','ba-email','ba-phone','ba-country','ba-message'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  var bacat = document.getElementById('ba-category'); if(bacat) bacat.value = '';
  var bacatDD = document.getElementById('ba-category-dd');
  if(bacatDD){ var l=bacatDD.querySelector('.form-dd-label'); if(l){ l.textContent='Select main category'; l.classList.add('form-dd-placeholder'); } bacatDD.querySelectorAll('.form-dd-opt').forEach(function(o){o.classList.remove('selected')}); }
  document.querySelectorAll('.tier-opt').forEach(function(t){t.classList.remove('selected')});
  document.querySelectorAll('#ba-producttypes input:checked, #ba-markets input:checked').forEach(function(c){c.checked=false;});
  window._brandTier = '';
  setTimeout(closeBrandModal, 3000);
}

// ── SUPABASE FORM SUBMISSIONS ─────────────────────────────────────────────────
function getVal(form, placeholder) {
  const el = Array.from(form.querySelectorAll('input,textarea')).find(i => i.placeholder && i.placeholder.toLowerCase().includes(placeholder.toLowerCase()));
  return el ? el.value.trim() : '';
}
function getSelect(form, index) {
  const sels = form.querySelectorAll('select');
  return sels[index] ? sels[index].value : '';
}

// ============ MULTI-BRAND RFQ ============
// State: list of all brands (loaded once), set of selected brand ids, current search query.
window._rfqAllBrands = window._rfqAllBrands || [];
window._rfqSelected  = window._rfqSelected  || [];   // array of {id, name, country, city}
window._rfqMaxBrands = 5;

async function rfqLoadBrands(){
  if(window._rfqAllBrands.length) return window._rfqAllBrands;
  try {
    const {data, error} = await sb.from('manufacturers').select('id,name,country,city,categories,featured').eq('status','active').order('featured',{ascending:false}).order('name',{ascending:true});
    if(error) throw error;
    window._rfqAllBrands = data || [];
  } catch(e){
    console.error('Brand load failed', e);
    window._rfqAllBrands = [];
  }
  return window._rfqAllBrands;
}

function rfqInitials(n){ return (n||'B').substring(0,2).toUpperCase(); }

function rfqRenderChips(){
  const chips = document.getElementById('rfqChips');
  if(!chips) return;
  chips.innerHTML = window._rfqSelected.map(function(b){
    return '<span class="rfq-chip" data-id="'+b.id+'">'+ b.name +
           '<button type="button" class="rfq-chip-x" onclick="rfqRemoveBrand('+b.id+');event.stopPropagation()" aria-label="Remove">×</button></span>';
  }).join('');
  // Update helper text
  const help = document.getElementById('rfqBrandHelp');
  if(help){
    const n = window._rfqSelected.length;
    help.classList.remove('error');
    help.textContent = n===0 ? 'Pick 1 to 5 manufacturers to send your request to.'
                     : n>=window._rfqMaxBrands ? 'You\'ve reached the maximum of 5 brands.'
                     : (n+' selected · up to '+(window._rfqMaxBrands-n)+' more');
  }
}

function rfqAddBrand(b){
  if(window._rfqSelected.length >= window._rfqMaxBrands) return;
  if(window._rfqSelected.some(function(x){ return x.id===b.id; })) return;
  window._rfqSelected.push(b);
  rfqRenderChips();
  const inp = document.getElementById('rfqBrandSearch');
  if(inp){ inp.value=''; rfqSearchBrands(''); inp.focus(); }
}

function rfqRemoveBrand(id){
  window._rfqSelected = window._rfqSelected.filter(function(b){ return b.id !== id; });
  rfqRenderChips();
}

function rfqFocusSearch(e){
  if(e && e.target && e.target.closest && e.target.closest('.rfq-chip')) return;
  const inp = document.getElementById('rfqBrandSearch');
  if(inp) inp.focus();
}

async function rfqOpenResults(){
  const picker = document.getElementById('rfqBrandPicker');
  if(!picker) return;
  picker.classList.add('focus','open');
  await rfqLoadBrands();
  rfqSearchBrands(document.getElementById('rfqBrandSearch').value||'');
}

function rfqCloseResults(){
  const picker = document.getElementById('rfqBrandPicker');
  if(picker) picker.classList.remove('open','focus');
}

// Use mousedown (not click) so we capture the target BEFORE rfqAddBrand / rfqSearchBrands
// re-render the result list and detach the clicked node from the DOM.
document.addEventListener('mousedown', function(e){
  const picker = document.getElementById('rfqBrandPicker');
  if(!picker) return;
  if(!picker.contains(e.target)) rfqCloseResults();
});

function rfqSearchBrands(q){
  const list = document.getElementById('rfqResults');
  if(!list) return;
  const all = window._rfqAllBrands || [];
  q = (q||'').toLowerCase().trim();
  const selectedIds = new Set(window._rfqSelected.map(function(b){ return b.id; }));
  const matched = all.filter(function(b){
    if(!q) return true;
    return (b.name||'').toLowerCase().indexOf(q) >= 0 ||
           (b.country||'').toLowerCase().indexOf(q) >= 0 ||
           (b.city||'').toLowerCase().indexOf(q) >= 0 ||
           (b.categories||[]).join(' ').toLowerCase().indexOf(q) >= 0;
  }).slice(0, 30);
  if(!matched.length){
    list.innerHTML = '<div class="rfq-result-empty">No brands match “'+(q||'…')+'”</div>';
    return;
  }
  list.innerHTML = matched.map(function(b){
    const taken = selectedIds.has(b.id);
    const loc = [b.city, b.country].filter(Boolean).join(', ');
    const cats = (b.categories||[]).slice(0,2).join(' · ');
    const meta = [loc, cats].filter(Boolean).join(' — ');
    return '<div class="rfq-result'+(taken?' disabled':'')+'" '+
           (taken?'':'onmousedown="event.preventDefault();event.stopPropagation();rfqPickBrand('+b.id+')"')+'>'+
           '<div class="rfq-result-init">'+rfqInitials(b.name)+'</div>'+
           '<div><div class="rfq-result-name">'+(b.name||'')+(b.featured?' <span style=\'color:var(--gold);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-left:4px\'>Featured</span>':'')+'</div>'+
           '<div class="rfq-result-meta">'+(meta||'—')+'</div></div></div>';
  }).join('');
}

function rfqPickBrand(id){
  const b = (window._rfqAllBrands||[]).find(function(x){ return x.id===id; });
  if(b) rfqAddBrand(b);
}

function rfqPickerKey(e){
  // Backspace on empty input removes last chip
  const inp = e.target;
  if(e.key === 'Backspace' && !inp.value && window._rfqSelected.length){
    rfqRemoveBrand(window._rfqSelected[window._rfqSelected.length-1].id);
  } else if(e.key === 'Escape'){
    rfqCloseResults();
  }
}

function rfqClearForm(){
  window._rfqSelected = [];
  rfqRenderChips();
  ['rfqFirst','rfqLast','rfqEmail','rfqPhone','rfqCompany','rfqProjectName','rfqProjectLocation','rfqRequiredBy','rfqMessage','rfqRole','rfqProjectType'].forEach(function(id){
    const el = document.getElementById(id); if(el) el.value='';
  });
  // Reset the two custom dropdowns (Job title + Project type) back to their placeholder state
  [['rfqRole-dd','Job title'],['rfqProjectType-dd','Project type']].forEach(function(pair){
    const dd = document.getElementById(pair[0]); if(!dd) return;
    dd.classList.remove('open');
    const lbl = dd.querySelector('.form-dd-label');
    if(lbl){ lbl.textContent = pair[1]; lbl.classList.add('form-dd-placeholder'); }
    const sel = dd.querySelector('.form-dd-opt.selected'); if(sel) sel.classList.remove('selected');
  });
  const s = document.getElementById('rfqStatus'); if(s){ s.style.display='none'; s.textContent=''; }
}

function rfqSetStatus(msg, type){
  const el = document.getElementById('rfqStatus');
  if(!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  el.style.color = type==='error' ? '#fca5a5' : type==='success' ? 'var(--gold)' : 'rgba(255,255,255,.85)';
}

async function submitRFQ(){
  const first   = (document.getElementById('rfqFirst')||{}).value || '';
  const last    = (document.getElementById('rfqLast')||{}).value || '';
  const email   = (document.getElementById('rfqEmail')||{}).value || '';
  const phone   = (document.getElementById('rfqPhone')||{}).value || '';
  const company = (document.getElementById('rfqCompany')||{}).value || '';
  const role    = (document.getElementById('rfqRole')||{}).value || '';
  const pname   = (document.getElementById('rfqProjectName')||{}).value || '';
  const ptype   = (document.getElementById('rfqProjectType')||{}).value || '';
  const ploc    = (document.getElementById('rfqProjectLocation')||{}).value || '';
  const reqby   = (document.getElementById('rfqRequiredBy')||{}).value || '';
  const message = (document.getElementById('rfqMessage')||{}).value || '';
  const brands  = window._rfqSelected || [];
  const btn = document.querySelector('#page-rfq .btn-rfq-submit');

  if(!brands.length){
    rfqSetStatus('⚠ Please select at least one manufacturer.', 'error');
    return;
  }
  if(!first.trim() || !last.trim() || !email.trim() || !phone.trim() || !company.trim() || !role || !pname.trim() || !ptype || !ploc.trim() || !reqby.trim() || !message.trim()){
    rfqSetStatus('⚠ Please complete all fields before sending.', 'error');
    return;
  }

  if(btn){ btn.textContent='Sending…'; btn.disabled=true; }
  rfqSetStatus('Sending your request to '+brands.length+' brand'+(brands.length!==1?'s':'')+'…');

  // Build one row per selected brand so each brand sees their own RFQ in their dashboard
  const rows = brands.map(function(b){
    return {
      brand_id:        b.id,
      brand_name:      b.name,
      submitter_first: first.trim(),
      submitter_last:  last.trim(),
      submitter_email: email.trim(),
      submitter_phone: phone.trim(),
      submitter_company: company.trim(),
      submitter_role:  role,
      project_name:    pname.trim(),
      project_type:    ptype,
      project_location: ploc.trim(),
      required_by:     reqby.trim(),
      message:         message.trim(),
      status:          'new'
    };
  });

  try {
    const {error} = await sb.from('rfqs').insert(rows);
    if(error) throw error;
    rfqSetStatus('✓ Your request was sent to '+brands.length+' brand'+(brands.length!==1?'s':'')+'. They\'ll respond directly through their ArchSpex dashboard.', 'success');
    if(btn){ btn.textContent='Sent ✓'; btn.style.background='#059669'; }
    setTimeout(function(){
      rfqClearForm();
      if(btn){ btn.textContent='Send Request to Selected Brands →'; btn.style.background=''; btn.disabled=false; }
    }, 4500);
  } catch(e) {
    console.error('RFQ error:', e);
    rfqSetStatus('⚠ Something went wrong: '+(e.message||'Please try again.'), 'error');
    if(btn){ btn.textContent='Send Request to Selected Brands →'; btn.disabled=false; }
  }
}

// On every navigation to the RFQ page: wipe whatever was previously entered so the user
// lands on a fresh form, then preload the brand list so the search is instant.
(function(){
  var _orig = window.showPage;
  if(typeof _orig !== 'function') return;
  window.showPage = function(p){
    var r = _orig.apply(this, arguments);
    if(p === 'rfq'){
      try { rfqClearForm(); } catch(e){}
      try { rfqLoadBrands(); } catch(e){}
    }
    return r;
  };
})();


async function submitBrandApp(form) {
  const inputs = form.querySelectorAll('input');
  const sel = form.querySelector('select');
  const data = {
    company:  inputs[0]?.value || '',
    name:     inputs[1]?.value || '',
    email:    inputs[2]?.value || '',
    category: sel?.value || ''
  };
  if(!data.email){alert('Please enter your email address.');return;}
  const btn = form.querySelector('.cta-submit');
  if(btn){btn.textContent='Sending…';btn.disabled=true;}
  try {
    const {error} = await sb.from('brand_applications').insert([data]);
    if(error) throw error;
    if(btn){btn.textContent="Received! We'll contact you shortly ✓";btn.style.background='#059669';}
    setTimeout(()=>{
      if(btn){btn.textContent='Request a Listing →';btn.style.background='';btn.disabled=false;}
      form.querySelectorAll('input').forEach(i=>i.value='');
    }, 4000);
  } catch(e) {
    console.error('Brand app error:',e);
    if(btn){btn.textContent='Request a Listing →';btn.disabled=false;}
    alert('Something went wrong — ' + e.message);
  }
}

// ── EMAIL NOTIFICATIONS (Resend) ───────────────────────────────────────────────
// To enable: get a free API key from resend.com, add your domain, replace the key below
const RESEND_KEY = ''; // Add your Resend API key here e.g. 're_xxxxx'
const NOTIFY_EMAIL = 'info@archspex.com';

async function sendNotification(subject, body){
  if(!RESEND_KEY) return; // Silent if no key configured
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':`Bearer ${RESEND_KEY}`},
      body: JSON.stringify({
        from: 'ArchSpex Notifications <notifications@archspex.com>',
        to: [NOTIFY_EMAIL],
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#003366;padding:16px 24px;border-radius:8px 8px 0 0">
            <span style="color:white;font-size:16px;font-weight:700">ArchSpex</span>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            ${body}
          </div>
          <p style="color:#9ca3af;font-size:11px;margin-top:12px;text-align:center">ArchSpex.com · Dubai, UAE</p>
        </div>`
      })
    });
  } catch(e){ console.log('Email notification failed:', e.message); }
}

async function submitContact(){
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value;
  const msg = document.getElementById('contact-msg').value.trim();
  const status = document.getElementById('contact-msg-status');
  if(!name||!email||!subject||!msg){status.style.display='block';status.style.color='#e55';status.textContent='Please fill in all fields.';return;}
  try {
    const {error} = await sb.from('rfq_submissions').insert([{name, email, project: subject, notes: msg, category: 'Contact Form'}]);
    if(error) throw error;
    sendNotification(`New Contact Message — ${subject}`,
      `<h3 style="color:#003366">New message from ${name}</h3>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <p><strong>Message:</strong><br>${msg.replace(/\n/g,'<br>')}</p>`
    );
    status.style.display='block';status.style.color='var(--gold)';status.textContent='Message sent! We\'ll get back to you within 24 hours.';
    document.getElementById('contact-name').value='';
    document.getElementById('contact-email').value='';
    document.getElementById('contact-subject').value='';
    document.getElementById('contact-msg').value='';
  } catch(e){
    status.style.display='block';status.style.color='#e55';status.textContent='Something went wrong. Please email us directly at info@archspex.com';
  }
}

// Nav search toggle
function toggleNavSearch(){
  var expand = document.getElementById('navSearchExpand');
  var inp = document.getElementById('navSearchInput');
  if(!expand||!inp) return;
  var isOpen = expand.style.width !== '0px' && expand.style.width !== '' && expand.style.width !== '0';
  if(isOpen){
    expand.style.width='0';
    expand.style.padding='0';
    inp.blur();
  } else {
    expand.style.width='240px';
    expand.style.padding='0 14px';
    setTimeout(function(){ inp.focus(); }, 260);
  }
}
document.addEventListener('click',function(e){
  var wrap=document.getElementById('navSearchWrap');
  var expand=document.getElementById('navSearchExpand');
  if(expand && wrap && !wrap.contains(e.target)){
    expand.style.width='0';
    expand.style.padding='0';
  }
});

// ── INIT ──────────────────────────────────────────────────────────────────────
renderHome();
checkSession();

// Cookie banner
function closeCookieBanner(){
  document.getElementById('cookieBanner').style.display='none';
  localStorage.setItem('cookieOk','1');
}
if(localStorage.getItem('cookieOk')) document.getElementById('cookieBanner').style.display='none';

// Add toast element
const _toast = document.createElement('div');
_toast.id='toast';
_toast.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--navy);color:white;padding:12px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:9999;display:none;box-shadow:0 8px 24px rgba(0,0,0,.2)';
document.body.appendChild(_toast);



// ── RESOURCES SUBCATEGORY FILTER (mirrors products page) ──
var resActiveCat = 'all', resSubtypeSel = [];
function resPickCat(cat){
  resActiveCat = cat; resSubtypeSel = [];
  var r = document.querySelector('[name="res-cat"][value="'+cat+'"]');
  if(r) r.checked = true;
  renderResSubtypes(); renderResSubcatPills();
}
function toggleResSubtype(s){
  var i = resSubtypeSel.indexOf(s);
  if(i>=0) resSubtypeSel.splice(i,1); else resSubtypeSel.push(s);
  renderResSubtypes(); renderResSubcatPills();
}
function renderResSubtypes(){
  var wrap = document.getElementById('res-subtypes-wrap');
  var cont = document.getElementById('res-subtypes');
  var lbl  = document.getElementById('res-subtypes-label');
  if(!wrap || !cont) return;
  var subs = subtypeMap[resActiveCat];
  if(!subs){ wrap.style.display='none'; cont.innerHTML=''; return; }
  wrap.style.display = 'block';
  if(lbl) lbl.textContent = (resActiveCat==='Furnishing'?'FF&E':resActiveCat) + ' \u2014 Product Type';
  cont.innerHTML = '';
  subs.forEach(function(s){
    var lab = document.createElement('label'); lab.className = 'filter-check';
    var inp = document.createElement('input'); inp.type = 'checkbox';
    inp.checked = resSubtypeSel.indexOf(s) >= 0;
    inp.onchange = function(){ toggleResSubtype(s); };
    var sp = document.createElement('span'); sp.textContent = s;
    lab.appendChild(inp); lab.appendChild(sp); cont.appendChild(lab);
  });
}
function renderResSubcatPills(){
  var wrap = document.getElementById('resSubcatPills');
  if(!wrap) return;
  var subs = subtypeMap[resActiveCat];
  wrap.innerHTML = '';
  if(!subs) return;
  subs.forEach(function(s){
    var b = document.createElement('button');
    b.className = 'subcat-pill' + (resSubtypeSel.indexOf(s)>=0 ? ' active' : '');
    b.textContent = s;
    b.onclick = function(){ toggleResSubtype(s); };
    wrap.appendChild(b);
  });
}

// ============ BRAND DASHBOARD (renders for any account whose email matches a manufacturers row) ============
window._brandMe = window._brandMe || null;

async function detectBrandAccount(){
  if(!currentUser) return null;
  try {
    const r = await sb.from('manufacturers').select('*').eq('email', currentUser.email).limit(1);
    return (r.data || [])[0] || null;
  } catch(e){ return null; }
}

function setSpecSectionsVisibility(show){
  // Profile Card row (contains dashAvatarLetter)
  var av = document.getElementById('dashAvatarLetter');
  if(av){
    var grid = av.closest('div[style*="grid-template-columns:1fr 2fr"]');
    if(grid) grid.style.display = show ? '' : 'none';
  }
  // Collections section
  var col = document.getElementById('collectionsSection');
  if(col) col.style.display = show ? '' : 'none';
  // Saved Products section (parent of dashSavedGrid)
  var sg = document.getElementById('dashSavedGrid');
  if(sg){
    var sec = sg.parentElement;
    if(sec) sec.style.display = show ? '' : 'none';
  }
  // My Submissions (RFQ + Sample) section
  var sub = document.getElementById('dashSubmissionsGrid');
  if(sub){
    var sec = sub.parentElement;
    if(sec) sec.style.display = show ? '' : 'none';
  }
  // Quick Actions section
  document.querySelectorAll('#page-dashboard .sec-label').forEach(function(el){
    if(el.textContent.trim().toLowerCase() === 'quick actions'){
      var sec = el.closest('div[style*="margin-bottom:40px"]');
      if(sec) sec.style.display = show ? '' : 'none';
    }
  });
  // Submit a Listing section (legacy; Manage Products replaces it for brands)
  var sl = document.getElementById('submitListingSection');
  if(sl) sl.style.display = show ? '' : 'none';
}

async function renderBrandDashboard(){
  const wrap = document.getElementById('brandDashSection');
  if(!wrap || !currentUser) return;
  const brand = await detectBrandAccount();
  window._brandMe = brand;
  if(!brand){
    wrap.style.display = 'none';
    setSpecSectionsVisibility(true);
    return;
  }
  wrap.style.display = 'block';
  setSpecSectionsVisibility(false);

  // --- Brand profile preview card ---
  const logoEl = document.getElementById('brandProfileLogo');
  if(logoEl){
    const initials = (brand.name||'B').substring(0,2).toUpperCase();
    if(brand.logo_url){
      logoEl.innerHTML = '<img src="'+brand.logo_url+'" alt="'+brand.name+'" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML=\''+ initials +'\'">';
    } else {
      logoEl.textContent = initials;
    }
  }
  document.getElementById('brandProfileName').textContent = brand.name || 'Your brand';
  const locParts = [brand.city, brand.country].filter(Boolean);
  const metaBits = [locParts.join(', '), brand.founded ? 'Est. ' + brand.founded : '', (brand.categories||[]).slice(0,3).join(' · ')].filter(Boolean);
  document.getElementById('brandProfileMeta').textContent = metaBits.join(' · ') || '—';

  // --- Render sub-sections in parallel ---
  await Promise.all([renderManageProducts(), renderBrandInbox(brand), renderBrandSampleInbox(brand)]);
}

// ---------- MANAGE PRODUCTS ----------
async function renderManageProducts(){
  const list = document.getElementById('brandProductsList');
  const countEl = document.getElementById('brandProductsCount');
  const brand = window._brandMe;
  if(!list || !brand) return;
  let prods = [];
  try {
    const r = await sb.from('products').select('*').eq('brand', brand.name).order('created_at',{ascending:false});
    prods = r.data || [];
  } catch(e){ console.error('Brand products fetch failed', e); }
  if(countEl) countEl.textContent = prods.length ? '(' + prods.length + ')' : '';
  if(!prods.length){
    list.innerHTML = '<div style="padding:28px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);font-size:13px;text-align:center"><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:6px">No products listed yet</div><div style="font-size:12px;margin-bottom:14px;line-height:1.6">Click + Add Product to create your first listing.</div><button class="btn-ghost-sm" onclick="openAddProduct()">+ Add your first product</button></div>';
    return;
  }
  list.innerHTML = prods.map(function(p){
    const img = p.image_url || '';
    const statusColor = p.status==='approved' ? '#059669' : p.status==='rejected' ? '#dc2626' : 'var(--gold)';
    const stockTag = p.out_of_stock
      ? '<span style="font-size:9px;font-weight:800;color:white;background:#dc2626;padding:3px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.6px">Out of stock</span>'
      : '<span style="font-size:9px;font-weight:800;color:var(--navy2);background:rgba(0,51,102,.08);padding:3px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.6px">In stock</span>';
    return '<div style="background:white;border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">'
      + '<div style="width:60px;height:60px;border-radius:8px;background:var(--off);overflow:hidden;flex-shrink:0">'
        + (img ? '<img src="'+img+'" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">' : '')
      + '</div>'
      + '<div style="flex:1;min-width:180px">'
        + '<div style="font-size:13px;font-weight:700;color:var(--navy2);line-height:1.3">' + (p.name||'—') + '</div>'
        + '<div style="font-size:11px;color:var(--muted);margin-top:3px">' + (p.category||'—') + (p.meta?' · '+p.meta:'') + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">'
          + stockTag
          + '<span style="font-size:9px;font-weight:800;color:white;background:'+statusColor+';padding:3px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.6px">' + (p.status||'pending') + '</span>'
        + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;align-items:center">'
        + '<button onclick="openEditProduct('+p.id+')" class="btn-sm-navy" style="background:white;color:var(--navy);border:1.5px solid var(--border)">Edit</button>'
        + '<button onclick="toggleProductStock('+p.id+','+(p.out_of_stock?'false':'true')+')" class="btn-sm-navy" style="background:white;color:var(--navy);border:1.5px solid var(--border)">' + (p.out_of_stock?'Mark in stock':'Mark out of stock') + '</button>'
      + '</div>'
    + '</div>';
  }).join('');
}

async function toggleProductStock(id, outOfStock){
  try {
    const {error} = await sb.from('products').update({out_of_stock: outOfStock}).eq('id', id);
    if(error) throw error;
    await renderManageProducts();
  } catch(e){ alert('Could not update: ' + (e.message||e)); }
}

// ---------- EDIT / ADD PRODUCT ----------
function openAddProduct(){
  const brand = window._brandMe;
  if(!brand){ return; }
  document.getElementById('editProductTitle').textContent = 'Add new product';
  document.getElementById('ep-id').value = '';
  ['ep-name','ep-meta','ep-description','ep-image','ep-specs','ep-country','ep-category'].forEach(function(id){
    const el = document.getElementById(id); if(el) el.value = '';
  });
  document.getElementById('ep-outofstock').checked = false;
  // Reset category dropdown label
  const dd = document.getElementById('ep-category-dd');
  if(dd){
    const lbl = dd.querySelector('.form-dd-label');
    if(lbl){ lbl.textContent = 'Select category'; lbl.classList.add('form-dd-placeholder'); }
    const sel = dd.querySelector('.form-dd-opt.selected'); if(sel) sel.classList.remove('selected');
  }
  document.getElementById('epSaveProductBtn').textContent = 'Create product';
  document.getElementById('epDeleteProductBtn').style.display = 'none';
  const m = document.getElementById('editProductMsg'); if(m){ m.style.display='none'; m.textContent=''; }
  document.getElementById('editProductModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

async function openEditProduct(id){
  let p;
  try {
    const r = await sb.from('products').select('*').eq('id', id).single();
    p = r.data;
  } catch(e){ return; }
  if(!p) return;
  document.getElementById('editProductTitle').textContent = 'Edit product';
  document.getElementById('ep-id').value = p.id;
  document.getElementById('ep-name').value = p.name || '';
  document.getElementById('ep-meta').value = p.meta || '';
  document.getElementById('ep-description').value = p.description || '';
  document.getElementById('ep-image').value = p.image_url || '';
  document.getElementById('ep-country').value = p.country || '';
  document.getElementById('ep-outofstock').checked = !!p.out_of_stock;
  // Specs: JSON or text — show as Key: Value lines
  let specsText = '';
  if(p.specs){
    try {
      const obj = typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs;
      specsText = Object.keys(obj).map(function(k){ return k + ': ' + obj[k]; }).join('\n');
    } catch(e){ specsText = String(p.specs); }
  }
  document.getElementById('ep-specs').value = specsText;
  // Category dropdown
  const dd = document.getElementById('ep-category-dd');
  const hidden = document.getElementById('ep-category');
  if(dd){
    const lbl = dd.querySelector('.form-dd-label');
    if(lbl){
      if(p.category){ lbl.textContent = p.category; lbl.classList.remove('form-dd-placeholder'); }
      else { lbl.textContent = 'Select category'; lbl.classList.add('form-dd-placeholder'); }
    }
    if(hidden) hidden.value = p.category || '';
  }
  document.getElementById('epSaveProductBtn').textContent = 'Save changes';
  document.getElementById('epDeleteProductBtn').style.display = 'inline-block';
  const m = document.getElementById('editProductMsg'); if(m){ m.style.display='none'; m.textContent=''; }
  document.getElementById('editProductModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditProduct(){
  document.getElementById('editProductModal').style.display = 'none';
  document.body.style.overflow = '';
}

async function saveProductRow(){
  const brand = window._brandMe; if(!brand) return;
  const id    = (document.getElementById('ep-id').value || '').trim();
  const name  = document.getElementById('ep-name').value.trim();
  const cat   = document.getElementById('ep-category').value.trim();
  const country = document.getElementById('ep-country').value.trim();
  const meta  = document.getElementById('ep-meta').value.trim();
  const desc  = document.getElementById('ep-description').value.trim();
  const img   = document.getElementById('ep-image').value.trim();
  const specsRaw = document.getElementById('ep-specs').value.trim();
  const outOfStock = document.getElementById('ep-outofstock').checked;
  const msg = document.getElementById('editProductMsg');
  const showMsg = function(t, err){ if(!msg) return; msg.textContent = t; msg.style.display='block'; msg.style.background = err?'#fef2f2':'#d1fae5'; msg.style.color = err?'#dc2626':'#065f46'; };
  if(!name || !cat || !desc){ showMsg('\u26a0 Name, category and description are required.', true); return; }
  const specsObj = {};
  specsRaw.split('\n').forEach(function(line){
    const idx = line.indexOf(':');
    if(idx > 0){ specsObj[line.substring(0,idx).trim()] = line.substring(idx+1).trim(); }
  });
  const payload = {
    name, category: cat, brand: brand.name, country: country || brand.country || '',
    meta, description: desc, image_url: img,
    specs: Object.keys(specsObj).length ? JSON.stringify(specsObj) : null,
    out_of_stock: outOfStock
  };
  const btn = document.getElementById('epSaveProductBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Saving\u2026'; }
  try {
    if(id){
      const {error} = await sb.from('products').update(payload).eq('id', id);
      if(error) throw error;
    } else {
      payload.status = 'pending';
      const {error} = await sb.from('products').insert([payload]);
      if(error) throw error;
    }
    closeEditProduct();
    await renderManageProducts();
  } catch(e){
    console.error('Save product failed', e);
    showMsg('\u26a0 ' + (e.message || 'Could not save.'), true);
  }
  if(btn){ btn.disabled = false; btn.textContent = id ? 'Save changes' : 'Create product'; }
}

async function deleteProductRow(){
  const id = (document.getElementById('ep-id').value || '').trim();
  if(!id) return;
  if(!confirm('Delete this product? This cannot be undone.')) return;
  try {
    const {error} = await sb.from('products').delete().eq('id', id);
    if(error) throw error;
    closeEditProduct();
    await renderManageProducts();
  } catch(e){ alert('Could not delete: ' + (e.message||e)); }
}

// ---------- EDIT BRAND PROFILE ----------
function openEditBrandProfile(){
  const b = window._brandMe; if(!b) return;
  document.getElementById('eb-name').value        = b.name || '';
  document.getElementById('eb-description').value = b.description || '';
  document.getElementById('eb-country').value     = b.country || '';
  document.getElementById('eb-city').value        = b.city || '';
  document.getElementById('eb-founded').value     = b.founded || '';
  document.getElementById('eb-employees').value   = b.employees || '';
  document.getElementById('eb-website').value     = b.website || '';
  document.getElementById('eb-logo').value        = b.logo_url || '';
  document.getElementById('eb-gallery').value     = ((b.images||b.gallery||[])).join('\n');
  // Build category checkboxes
  const cats = ['Structure','Envelope','Interiors','Finishes','Furnishing','Systems'];
  const selected = b.categories || [];
  document.getElementById('eb-categories').innerHTML = cats.map(function(c){
    const chk = selected.indexOf(c) >= 0 ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text);cursor:pointer"><input type="checkbox" value="'+c+'" '+chk+' style="margin:0"><span>'+c+'</span></label>';
  }).join('');
  const m = document.getElementById('editBrandMsg'); if(m){ m.style.display='none'; m.textContent=''; }
  document.getElementById('editBrandModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditBrand(){
  document.getElementById('editBrandModal').style.display = 'none';
  document.body.style.overflow = '';
}

async function saveBrandProfile(){
  const b = window._brandMe; if(!b) return;
  const cats = Array.from(document.querySelectorAll('#eb-categories input:checked')).map(function(c){return c.value;});
  const gallery = (document.getElementById('eb-gallery').value || '').split('\n').map(function(l){return l.trim();}).filter(Boolean);
  const payload = {
    name:        document.getElementById('eb-name').value.trim(),
    description: document.getElementById('eb-description').value.trim(),
    country:     document.getElementById('eb-country').value.trim(),
    city:        document.getElementById('eb-city').value.trim(),
    founded:     document.getElementById('eb-founded').value.trim(),
    employees:   document.getElementById('eb-employees').value.trim(),
    website:     document.getElementById('eb-website').value.trim(),
    logo_url:    document.getElementById('eb-logo').value.trim(),
    images:      gallery,
    categories:  cats
  };
  const msg = document.getElementById('editBrandMsg');
  const showMsg = function(t, err){ if(!msg) return; msg.textContent = t; msg.style.display='block'; msg.style.background=err?'#fef2f2':'#d1fae5'; msg.style.color=err?'#dc2626':'#065f46'; };
  if(!payload.name){ showMsg('\u26a0 Brand name is required.', true); return; }
  const btn = document.getElementById('ebSaveBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Saving\u2026'; }
  try {
    const {error} = await sb.from('manufacturers').update(payload).eq('id', b.id);
    if(error) throw error;
    showMsg('\u2713 Brand profile saved.');
    window._brandMe = Object.assign({}, b, payload);
    setTimeout(function(){ closeEditBrand(); renderBrandDashboard(); }, 700);
  } catch(e){
    console.error('Save brand failed', e);
    showMsg('\u26a0 ' + (e.message || 'Could not save.'), true);
  }
  if(btn){ btn.disabled = false; btn.textContent = 'Save brand profile'; }
}

// ---------- RFQ INBOX ----------
async function renderBrandInbox(brand){
  brand = brand || window._brandMe;
  const list = document.getElementById('brandInboxList');
  const countEl = document.getElementById('brandInboxCount');
  if(!list || !brand) return;
  let rfqs = [];
  try {
    const r = await sb.from('rfqs').select('*').eq('brand_id', brand.id).order('created_at',{ascending:false}).limit(100);
    rfqs = r.data || [];
  } catch(e){ console.error('RFQs fetch failed', e); }
  if(countEl) countEl.textContent = rfqs.length ? '(' + rfqs.length + ')' : '';
  if(!rfqs.length){
    list.innerHTML = '<div style="padding:24px;border:1px dashed var(--border);border-radius:12px;background:#fafbfd;color:var(--muted);font-size:13px;text-align:center">No RFQs received yet.</div>';
    return;
  }
  list.innerHTML = rfqs.map(function(r){ return inboxCardHtml(r, 'rfq'); }).join('');
}

// ---------- SAMPLE REQUEST INBOX ----------
async function renderBrandSampleInbox(brand){
  brand = brand || window._brandMe;
  const list = document.getElementById('brandSampleInboxList');
  const countEl = document.getElementById('brandSampleCount3');
  if(!list || !brand) return;
  let samples = [];
  try {
    // Two cases: legacy rows where manufacturer_id is null but product_name starts with "Sample Request — <brand>"
    // and new rows with manufacturer_id set. Fetch both.
    const r1 = await sb.from('sample_requests').select('*').eq('manufacturer_id', brand.id).order('created_at',{ascending:false}).limit(100);
    samples = r1.data || [];
    if(samples.length < 100){
      const r2 = await sb.from('sample_requests').select('*').is('manufacturer_id', null).like('product_name', 'Sample Request — '+brand.name+'%').order('created_at',{ascending:false}).limit(50);
      samples = samples.concat(r2.data || []);
    }
  } catch(e){ console.error('Sample requests fetch failed', e); }
  if(countEl) countEl.textContent = samples.length ? '(' + samples.length + ')' : '';
  if(!samples.length){
    list.innerHTML = '<div style="padding:24px;border:1px dashed var(--border);border-radius:12px;background:#fafbfd;color:var(--muted);font-size:13px;text-align:center">No sample requests received yet.</div>';
    return;
  }
  list.innerHTML = samples.map(function(r){ return inboxCardHtml(r, 'sample'); }).join('');
}

// Renders a single inbox row (RFQ or sample). Compact one-line layout with a status dot on the left,
// title + sender + date in the middle, and a single "View & reply" button on the right.
// Status is computed from the brand's POV: NEW if the submitter sent the latest message; REPLIED if the brand did.
function inboxCardHtml(r, kind){
  const when = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
  const rawStatus = (r.status||'new').toLowerCase();
  const last = (r.last_actor || 'submitter').toLowerCase();
  let status;
  if(rawStatus === 'closed'){ status = 'closed'; }
  else { status = (last === 'brand') ? 'replied' : 'new'; }
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const statusColor = status==='new' ? 'var(--gold)' : status==='replied' ? '#059669' : '#9ca3af';
  const submitter = kind === 'rfq'
    ? ((r.submitter_first||'') + ' ' + (r.submitter_last||'')).trim()
    : ((r.first_name||'') + ' ' + (r.last_name||'')).trim();
  const submitterCompany = kind==='rfq' ? r.submitter_company : r.company;
  const title = kind==='rfq' ? (r.project_name || 'Untitled project') : (r.product_name || 'Sample request');
  const subline = [submitter || '\u2014', submitterCompany, when].filter(Boolean).join(' \u00b7 ');
  return '<div style="background:white;border:1px solid var(--border);border-radius:10px;padding:12px 14px 12px 18px;display:flex;align-items:center;gap:12px;position:relative;cursor:pointer;transition:border-color .15s,box-shadow .15s" '
    + 'onmouseover="this.style.borderColor=\'var(--navy)\';this.style.boxShadow=\'0 4px 14px rgba(0,15,40,.06)\'" '
    + 'onmouseout="this.style.borderColor=\'var(--border)\';this.style.boxShadow=\'\'" '
    + 'onclick="openInboxReply(\''+kind+'\','+r.id+')">'
    // Status dot on left
    + '<div style="width:8px;height:8px;border-radius:50%;background:'+statusColor+';flex-shrink:0" title="'+status+'"></div>'
    // Title + subline
    + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:700;color:var(--navy2);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + title + '</div>'
      + '<div style="font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + subline + '</div>'
    + '</div>'
    // Status pill + view button
    + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      + '<span style="font-size:9px;font-weight:800;color:'+statusColor+';background:transparent;border:1px solid '+statusColor+';padding:3px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.6px">' + statusLabel + '</span>'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
    + '</div>'
  + '</div>';
}

// ---------- INBOX REPLY MODAL (shared by RFQ + sample, both directions) ----------
window._irRow = null;
window._irKind = null;
window._irRole = null;  // 'brand' or 'submitter'

// Compute a viewer-aware status.
//   For the submitter:
//     • If the brand hasn't engaged at all yet → 'sent'
//     • If the brand sent the latest message → 'new'
//     • If you (the submitter) replied to their reply → 'replied'
//   For the brand:
//     • If the submitter sent the latest → 'new'
//     • If the brand replied → 'replied'
//   'closed' overrides everything when set explicitly.
function computeStatus(row, role){
  var rawStatus = (row.status||'new').toLowerCase();
  if(rawStatus === 'closed') return 'closed';
  var last = (row.last_actor || 'submitter').toLowerCase();
  var msgs = Array.isArray(row.messages) ? row.messages : [];
  var brandEngaged = msgs.some(function(m){ return m.from === 'brand'; }) || !!(row.reply && row.reply.trim());
  if(role === 'brand'){
    return last === 'brand' ? 'replied' : 'new';
  } else {
    if(!brandEngaged && last === 'submitter') return 'sent';
    return last === 'submitter' ? 'replied' : 'new';
  }
}

async function openInboxReply(kind, id){
  let row;
  try {
    const table = kind === 'rfq' ? 'rfqs' : 'sample_requests';
    const r = await sb.from(table).select('*').eq('id', id).single();
    row = r.data;
  } catch(e){ alert('Could not load: ' + (e.message||e)); return; }
  if(!row) return;
  // Detect viewer role: is the current user the brand owner or the submitter?
  var role = 'submitter';
  var brand = window._brandMe;
  if(brand && (row.brand_id === brand.id || row.manufacturer_id === brand.id)){
    role = 'brand';
  } else {
    var subEmail = kind === 'rfq' ? row.submitter_email : row.email;
    if(currentUser && subEmail && currentUser.email && currentUser.email.toLowerCase() === subEmail.toLowerCase()){
      role = 'submitter';
    } else if(brand){
      role = 'brand';
    }
  }
  window._irRow = row;
  window._irKind = kind;
  window._irRole = role;

  document.getElementById('irKind').textContent = kind === 'rfq' ? 'RFQ' : 'Sample Request';
  const title = kind==='rfq' ? (row.project_name||'Untitled') : (row.product_name||'Sample');
  document.getElementById('irTitle').textContent = title;
  const submitter = kind==='rfq'
    ? ((row.submitter_first||'')+' '+(row.submitter_last||'')).trim()
    : ((row.first_name||'')+' '+(row.last_name||'')).trim();
  const company = kind==='rfq' ? row.submitter_company : row.company;
  const email   = kind==='rfq' ? row.submitter_email   : row.email;
  const phone   = kind==='rfq' ? row.submitter_phone   : row.phone;
  const when    = row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
  document.getElementById('irSubmitter').textContent = (submitter||'\u2014') + (company?' \u00b7 '+company:'') + (when?' \u00b7 '+when:'');

  const message = kind==='rfq' ? (row.message||'') : (row.notes||'');
  const initials = (submitter || 'U').substring(0,2).toUpperCase();

  // Sender card — avatar, name, company, contact actions
  const senderCard = '<div style="display:flex;align-items:center;gap:12px;background:var(--off);border-radius:12px;padding:14px 16px">'
    + '<div style="width:42px;height:42px;border-radius:50%;background:var(--navy);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">'+initials+'</div>'
    + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:700;color:var(--navy2)">' + (submitter||'\u2014') + '</div>'
      + '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + (company||'\u2014') + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-shrink:0">'
      + (email ? '<a href="mailto:'+email+'" title="Email" style="width:32px;height:32px;border-radius:8px;background:white;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--navy);text-decoration:none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></a>' : '')
      + (phone ? '<a href="tel:'+phone+'" title="Call" style="width:32px;height:32px;border-radius:8px;background:white;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--navy);text-decoration:none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>' : '')
    + '</div>'
  + '</div>';

  // Structured details grid (kind-specific)
  const details = kind==='rfq'
    ? [['Project type', row.project_type], ['Location', row.project_location], ['Required by', row.required_by], ['Brand requested', row.brand_name]]
    : [['Product', row.product_name], ['Brand', row.brand_name], ['Delivery to', row.address], ['Job title', row.job_title]];
  const detailsGrid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 18px">'
    + details.filter(function(d){ return d[1]; }).map(function(d){
        return '<div><div style="font-size:9px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">'+d[0]+'</div>'
          + '<div style="font-size:13px;color:var(--navy2);font-weight:600">'+d[1]+'</div></div>';
      }).join('')
    + '</div>';

  // Build the conversation thread
  // Bubble: who said it (brand or submitter), text, when. Original request is the first bubble.
  const messages = Array.isArray(row.messages) ? row.messages : [];
  function bubble(side, text, when, who){
    var isMine = (side === window._irRole);
    var bg = isMine ? 'var(--navy)' : '#fafbfd';
    var color = isMine ? 'white' : 'var(--text)';
    var border = isMine ? 'none' : '1px solid var(--border)';
    var label = side === 'brand' ? (who || 'Brand') : (who || 'Submitter');
    var alignSelf = isMine ? 'flex-end' : 'flex-start';
    return '<div style="display:flex;flex-direction:column;align-self:'+alignSelf+';max-width:85%;gap:4px">'
      + '<div style="font-size:9px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;padding:0 4px">' + label + (when?' \u00b7 '+when:'') + '</div>'
      + '<div style="font-size:13px;color:'+color+';line-height:1.7;background:'+bg+';border:'+border+';padding:12px 16px;border-radius:14px;white-space:pre-wrap">' + text + '</div>'
    + '</div>';
  }

  var thread = '<div style="display:flex;flex-direction:column;gap:14px">';
  // Original request as the first bubble
  if(message){
    var firstName = kind==='rfq' ? row.submitter_first : row.first_name;
    var lastName  = kind==='rfq' ? row.submitter_last  : row.last_name;
    var submitterName = ((firstName||'')+' '+(lastName||'')).trim() || 'Submitter';
    thread += bubble('submitter', message, when, submitterName);
  }
  // Subsequent messages
  messages.forEach(function(m){
    var w = m.at ? new Date(m.at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
    var who = m.from === 'brand' ? (row.brand_name || 'Brand') : 'You';
    thread += bubble(m.from, m.text || '', w, who);
  });
  // Backwards compat: if no messages but there is a legacy `reply` field, surface it
  if(!messages.length && row.reply){
    var rw = row.replied_at ? new Date(row.replied_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
    thread += bubble('brand', row.reply, rw, row.brand_name || 'Brand');
  }
  thread += '</div>';

  const threadBlock = '<div><div style="font-size:9px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Conversation</div>' + thread + '</div>';

  document.getElementById('irBody').innerHTML = senderCard + detailsGrid; document.getElementById('irThread').innerHTML = thread;

  document.getElementById('ir-reply').value = '';
  // Architects don't need the status dropdown — it's a brand-side workflow control
  var statusWrap = document.getElementById('ir-status-dd');
  if(statusWrap){
    var ctrl = statusWrap.parentElement;
    if(ctrl) ctrl.style.display = (window._irRole === 'brand') ? '' : 'none';
  }
  // Set status dropdown (Capitalized label, lowercase value)
  const dd = document.getElementById('ir-status-dd');
  if(dd){
    const cur = (row.status || 'new').toLowerCase();
    const curLabel = cur.charAt(0).toUpperCase() + cur.slice(1);
    const lbl = dd.querySelector('.form-dd-label');
    if(lbl){ lbl.textContent = curLabel; lbl.classList.remove('form-dd-placeholder'); }
    document.getElementById('ir-status').value = cur;
    dd.querySelectorAll('.form-dd-opt').forEach(function(o){ o.classList.toggle('selected', o.textContent.trim().toLowerCase() === cur); });
  }
  const m = document.getElementById('irMsg'); if(m){ m.style.display='none'; m.textContent=''; }
  document.getElementById('inboxReplyModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Mark "viewed" if currently "new"
  if((row.status||'new') === 'new'){
    try { await sb.from(kind==='rfq'?'rfqs':'sample_requests').update({status:'viewed'}).eq('id', row.id); } catch(e){}
  }
}

function closeInboxReply(){
  document.getElementById('inboxReplyModal').style.display = 'none';
  document.body.style.overflow = '';
  window._irRow = null;
}

async function saveInboxReply(){
  const row = window._irRow;
  const kind = window._irKind;
  const role = window._irRole || 'brand';
  if(!row || !kind) return;
  const replyText = document.getElementById('ir-reply').value.trim();
  if(!replyText){
    const msg = document.getElementById('irMsg');
    if(msg){ msg.textContent = '\u26a0 Write a reply before sending.'; msg.style.display='block'; msg.style.background='#fef2f2'; msg.style.color='#dc2626'; }
    return;
  }
  // Append the new message to the existing thread
  const existing = Array.isArray(row.messages) ? row.messages.slice() : [];
  existing.push({ from: role, text: replyText, at: new Date().toISOString() });
  // Compute the status the brand wants to set (only relevant when brand is replying)
  const explicit = (document.getElementById('ir-status').value || '').toLowerCase();
  let newStatus;
  if(role === 'brand'){
    newStatus = explicit || 'replied';
  } else {
    // Architect replying: leave brand's explicit status alone, but if it was 'closed' don't reopen.
    newStatus = (row.status||'new');
    if(newStatus === 'closed') newStatus = 'replied';
  }
  const payload = {
    status: newStatus,
    messages: existing,
    last_actor: role,
    reply: replyText,
    replied_at: new Date().toISOString()
  };
  const msg = document.getElementById('irMsg');
  const showMsg = function(t, err){ if(!msg) return; msg.textContent = t; msg.style.display='block'; msg.style.background=err?'#fef2f2':'#d1fae5'; msg.style.color=err?'#dc2626':'#065f46'; };
  const btn = document.getElementById('irSaveBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Sending\u2026'; }
  try {
    const table = kind === 'rfq' ? 'rfqs' : 'sample_requests';
    const {error} = await sb.from(table).update(payload).eq('id', row.id);
    if(error) throw error;
    showMsg('\u2713 Reply sent.');
    setTimeout(function(){
      closeInboxReply();
      // Refresh whichever dashboard the user is looking at
      if(role === 'brand'){
        if(kind === 'rfq') renderBrandInbox(); else renderBrandSampleInbox();
      } else if(typeof renderDashboard === 'function') {
        renderDashboard();
      }
    }, 700);
  } catch(e){
    console.error('Reply save failed', e);
    showMsg('\u26a0 ' + (e.message || 'Could not send.'), true);
  }
  if(btn){ btn.disabled = false; btn.innerHTML = 'Send Reply <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'; }
}

// Hook into the existing dashboard render path
(function(){
  var _orig = window.renderDashboard;
  if(typeof _orig === 'function'){
    window.renderDashboard = async function(){
      var r = _orig.apply(this, arguments);
      try { await renderBrandDashboard(); } catch(e){ console.error(e); }
      return r;
    };
  }
})();


// ============ EDIT PROFILE ============
async function openEditProfile(){
  if(!currentUser){ openRegModal('login'); return; }
  // Load existing profile values (now also fetching firm_id)
  let prof = {};
  try {
    const r = await sb.from('profiles').select('full_name,company,job_title,country,phone,firm_id').eq('user_id', currentUser.id).single();
    prof = r.data || {};
  } catch(e) {}
  const full = (prof.full_name || '').trim();
  const sp = full.indexOf(' ');
  const first = sp > 0 ? full.substring(0, sp) : full;
  const last  = sp > 0 ? full.substring(sp + 1) : '';
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v || ''; };
  set('ep-firstname', first);
  set('ep-lastname',  last);
  set('ep-company',   prof.company);
  set('ep-jobtitle',  prof.job_title);
  set('ep-country',   prof.country);
  // Firm linking display
  const firmIdInput = document.getElementById('ep-firm-id');
  const firmDisplay = document.getElementById('ep-firm-display');
  const unlinkBtn = document.getElementById('ep-unlinkFirmBtn');
  if(firmIdInput) firmIdInput.value = prof.firm_id || '';
  if(prof.firm_id){
    try {
      const fr = await sb.from('firms').select('id,name,city,country').eq('id', prof.firm_id).single();
      if(fr.data){
        var loc = [fr.data.city, fr.data.country].filter(Boolean).join(', ');
        if(firmDisplay) firmDisplay.textContent = fr.data.name + (loc ? ' \u00b7 ' + loc : '');
        if(unlinkBtn) unlinkBtn.style.display = '';
      }
    } catch(e){
      if(firmDisplay) firmDisplay.textContent = 'Linked firm not found';
      if(unlinkBtn) unlinkBtn.style.display = '';
    }
  } else {
    if(firmDisplay) firmDisplay.textContent = 'Not linked';
    if(unlinkBtn) unlinkBtn.style.display = 'none';
  }
  const m = document.getElementById('editProfileMsg'); if(m){ m.style.display = 'none'; m.textContent = ''; }
  const modal = document.getElementById('editProfileModal');
  if(modal){ modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeEditProfile(){
  const modal = document.getElementById('editProfileModal');
  if(modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function saveEditProfile(){
  if(!currentUser) return;
  const first = (document.getElementById('ep-firstname')||{}).value.trim() || '';
  const last  = (document.getElementById('ep-lastname')||{}).value.trim() || '';
  const company = (document.getElementById('ep-company')||{}).value.trim() || '';
  const jobtitle = (document.getElementById('ep-jobtitle')||{}).value.trim() || '';
  const country = (document.getElementById('ep-country')||{}).value.trim() || '';
  const msg = document.getElementById('editProfileMsg');
  const btn = document.getElementById('epSaveBtn');
  const showMsg = (text, error) => {
    if(!msg) return;
    msg.textContent = text;
    msg.style.display = 'block';
    msg.style.background = error ? '#fef2f2' : '#d1fae5';
    msg.style.color = error ? '#dc2626' : '#065f46';
  };
  if(!first || !last || !company || !jobtitle || !country){
    showMsg('\u26a0 Please fill in all fields.', true);
    return;
  }
  if(btn){ btn.textContent = 'Saving\u2026'; btn.disabled = true; }
  try {
    const full_name = (first + ' ' + last).trim();
    const firmIdVal = (document.getElementById('ep-firm-id')||{}).value || null;
    const payload = { full_name, company, job_title: jobtitle, country };
    payload.firm_id = firmIdVal ? Number(firmIdVal) : null;
    const {error} = await sb.from('profiles').update(payload).eq('user_id', currentUser.id);
    if(error) throw error;
    // Invalidate the autofill cache so the next page-entry sees the new values
    window._userProfile = null;
    showMsg('\u2713 Profile updated.');
    // Re-render the dashboard so the new values show up immediately
    if(typeof renderDashboard === 'function') renderDashboard();
    setTimeout(closeEditProfile, 900);
  } catch(e) {
    console.error('Profile save failed', e);
    showMsg('\u26a0 ' + (e.message || 'Could not save. Please try again.'), true);
    if(btn){ btn.textContent = 'Save changes'; btn.disabled = false; }
    return;
  }
  if(btn){ btn.textContent = 'Save changes'; btn.disabled = false; }
}

// ============ COLLECTIONS ============
window._collectionsCache = window._collectionsCache || [];
window._currentCollection = null;

function openCreateCollection(){
  if(!currentUser){ openRegModal('login'); return; }
  document.getElementById('cm-id').value = '';
  document.getElementById('cm-name').value = '';
  document.getElementById('cm-desc').value = '';
  document.getElementById('collectionModalTitle').textContent = 'New collection';
  document.getElementById('cmSaveBtn').textContent = 'Create';
  document.getElementById('cmDeleteBtn').style.display = 'none';
  const msg = document.getElementById('collectionModalMsg'); if(msg){ msg.style.display = 'none'; msg.textContent = ''; }
  document.getElementById('collectionModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function openEditCollection(id){
  const c = (window._collectionsCache || []).find(x => x.id === id);
  if(!c) return;
  document.getElementById('cm-id').value = c.id;
  document.getElementById('cm-name').value = c.name || '';
  document.getElementById('cm-desc').value = c.description || '';
  document.getElementById('collectionModalTitle').textContent = 'Edit collection';
  document.getElementById('cmSaveBtn').textContent = 'Save changes';
  document.getElementById('cmDeleteBtn').style.display = 'inline-block';
  const msg = document.getElementById('collectionModalMsg'); if(msg){ msg.style.display = 'none'; msg.textContent = ''; }
  document.getElementById('collectionModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function editCurrentCollection(){
  if(!window._currentCollection) return;
  // Capture the id BEFORE closeViewCollection nulls out _currentCollection
  var _capturedId = window._currentCollection.id;
  closeViewCollection();
  setTimeout(function(){ openEditCollection(_capturedId); }, 120);
}

function closeCollectionModal(){
  document.getElementById('collectionModal').style.display = 'none';
  if(document.getElementById('viewCollectionModal').style.display !== 'flex') document.body.style.overflow = '';
}

async function saveCollection(){
  if(!currentUser) return;
  const id = (document.getElementById('cm-id').value || '').trim();
  const name = document.getElementById('cm-name').value.trim();
  const desc = document.getElementById('cm-desc').value.trim();
  const msg = document.getElementById('collectionModalMsg');
  const btn = document.getElementById('cmSaveBtn');
  const showMsg = (text, error) => {
    if(!msg) return;
    msg.textContent = text;
    msg.style.display = 'block';
    msg.style.background = error ? '#fef2f2' : '#d1fae5';
    msg.style.color = error ? '#dc2626' : '#065f46';
  };
  if(!name){ showMsg('\u26a0 Give your collection a name.', true); return; }
  if(btn){ btn.disabled = true; btn.textContent = 'Saving\u2026'; }
  try {
    if(id){
      const {error} = await sb.from('collections').update({ name, description: desc || null }).eq('id', id);
      if(error) throw error;
    } else {
      const {error} = await sb.from('collections').insert([{ user_id: currentUser.id, name, description: desc || null }]);
      if(error) throw error;
    }
    closeCollectionModal();
    await renderCollections();
  } catch(e) {
    console.error('Collection save failed', e);
    showMsg('\u26a0 ' + (e.message || 'Could not save.'), true);
  }
  if(btn){ btn.disabled = false; btn.textContent = id ? 'Save changes' : 'Create'; }
}

async function deleteCollection(){
  const id = (document.getElementById('cm-id').value || '').trim();
  if(!id) return;
  if(!confirm('Delete this collection? Saved products inside it will move back to "All Saved".')) return;
  try {
    const {error} = await sb.from('collections').delete().eq('id', id);
    if(error) throw error;
    closeCollectionModal();
    await renderCollections();
    if(typeof renderDashboard === 'function') renderDashboard();
  } catch(e) {
    console.error('Collection delete failed', e);
    alert('Could not delete: ' + (e.message || e));
  }
}

async function renderCollections(){
  if(!currentUser) return;
  const grid = document.getElementById('collectionsGrid');
  if(!grid) return;
  let collections = [];
  try {
    const r = await sb.from('collections').select('id,name,description,created_at').eq('user_id', currentUser.id).order('created_at',{ascending:false});
    collections = r.data || [];
  } catch(e) {
    console.error('Collections fetch failed', e);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--muted);font-size:12px">Could not load collections.</div>';
    return;
  }
  window._collectionsCache = collections;
  // Fetch product counts per collection in one go
  let counts = {};
  try {
    const r = await sb.from('saved_products').select('collection_id').eq('user_id', currentUser.id);
    (r.data || []).forEach(s => { if(s.collection_id){ counts[s.collection_id] = (counts[s.collection_id] || 0) + 1; } });
  } catch(e) {}
  if(!collections.length){
    grid.innerHTML = '<div style="grid-column:1/-1;padding:32px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center"><div style="margin-bottom:10px;color:var(--muted);display:flex;justify-content:center"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:4px">No collections yet</div><div style="font-size:12px;line-height:1.6;max-width:380px;margin:0 auto 14px">Group your saved products into named project folders.</div><button class="btn-ghost-sm" onclick="openCreateCollection()">+ Create your first collection</button></div>';
    return;
  }
  grid.innerHTML = collections.map(c => {
    const n = counts[c.id] || 0;
    const desc = (c.description || '').replace(/</g,'&lt;');
    const created = new Date(c.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
    return '<div style="background:white;border:1px solid var(--border);border-radius:14px;padding:20px 22px;cursor:pointer;transition:box-shadow .2s,transform .15s" onclick="openViewCollection('+c.id+')" onmouseover="this.style.boxShadow=\'0 10px 26px rgba(0,15,40,.08)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px">'
        + '<div style="width:36px;height:36px;border-radius:8px;background:rgba(201,168,76,.14);color:var(--gold);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>'
        + '<span style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.7px">' + n + ' product' + (n !== 1 ? 's' : '') + '</span>'
      + '</div>'
      + '<div style="font-family:Fraunces,serif;font-size:18px;font-weight:400;color:var(--navy2);line-height:1.25;margin-bottom:4px">' + (c.name || 'Untitled') + '</div>'
      + (desc ? '<div style="font-size:12px;color:var(--muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px">' + desc + '</div>' : '<div style="height:6px"></div>')
      + '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;font-weight:600">Created ' + created + '</div>'
    + '</div>';
  }).join('');
}

// ============ VIEW COLLECTION ============
async function openViewCollection(id){
  const c = (window._collectionsCache || []).find(x => x.id === id);
  if(!c) return;
  window._currentCollection = c;
  document.getElementById('vcTitle').textContent = c.name || 'Untitled';
  document.getElementById('vcDesc').textContent = c.description || '';
  // Make sure the Edit-collection button is visible (it may have been hidden by openAllSavedModal)
  var _vcEdit = document.getElementById('vcEditWrap');
  if(_vcEdit) _vcEdit.style.display = 'flex';
  document.getElementById('vcBody').innerHTML = '<div style="padding:24px;color:var(--muted);text-align:center">Loading\u2026</div>';
  document.getElementById('viewCollectionModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  await refreshViewCollectionBody(id);
}

// ============ ALL SAVED PRODUCTS MODAL ============
// Reuses the View Collection modal shell but renders ALL saved products (no collection filter)
// with a plain Remove button on each.
async function openAllSavedModal(){
  if(!currentUser){ openRegModal('login'); return; }
  window._currentCollection = null;
  document.getElementById('vcTitle').textContent = 'All Saved Products';
  document.getElementById('vcDesc').textContent = 'Everything you\u2019ve saved to your dashboard.';
  // Hide the Edit-collection button — irrelevant in "all saved" mode
  var _vcEdit = document.getElementById('vcEditWrap');
  if(_vcEdit) _vcEdit.style.display = 'none';
  document.getElementById('vcBody').innerHTML = '<div style="padding:24px;color:var(--muted);text-align:center">Loading\u2026</div>';
  document.getElementById('viewCollectionModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  await refreshAllSavedBody();
}

async function refreshAllSavedBody(){
  if(!currentUser) return;
  let saved = [];
  try {
    const r = await sb.from('saved_products').select('*').eq('user_id', currentUser.id).order('created_at',{ascending:false});
    saved = r.data || [];
  } catch(e) { console.error('All saved fetch failed', e); }
  // Dedupe: keep only the most-recent row per product_id (older duplicates exist from before the idempotent save fix)
  const _seen = new Set();
  saved = saved.filter(function(p){
    const key = String(p.product_id);
    if(_seen.has(key)) return false;
    _seen.add(key);
    return true;
  });
  // Map collection_id -> collection name for the badge on each saved card
  const collections = window._collectionsCache || [];
  const colNameById = {};
  collections.forEach(function(c){ colNameById[c.id] = c.name; });
  document.getElementById('vcDesc').textContent = saved.length + ' product' + (saved.length !== 1 ? 's' : '') + ' saved';
  if(!saved.length){
    document.getElementById('vcBody').innerHTML = '<div style="padding:36px 20px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center"><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:6px">No saved products yet</div><div style="font-size:12px;line-height:1.6">Browse products and click the bookmark on any card to save it here.</div></div>';
    return;
  }
  document.getElementById('vcBody').innerHTML = '<div class="prod-grid">' + saved.map(function(p){
    var pidJs = "'" + String(p.product_id).replace(/'/g, "\\'") + "'";
    // Always show "Saved" on the All Saved view — collection membership is implied by the cards in the My Collections section
    var inColTag = '<span class="prod-cat-tag">Saved</span>';
    var pidHref = '#product/' + encodeURIComponent(String(p.product_id));
    var guard = "if(event.metaKey||event.ctrlKey||event.shiftKey||event.button===1)return true;event.preventDefault();";
    return '<a class="prod-card" href="' + pidHref + '" onclick="' + guard + 'openProduct(' + pidJs + ')" style="text-decoration:none;color:inherit;display:block">'
      + '<div class="prod-img-wrap"><img src="' + (p.image_url||'') + '" alt="' + (p.product_name||'') + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\'">' + inColTag + '</div>'
      + '<div class="prod-body">'
        + '<div class="prod-brand-row">' + (p.brand||'\u2014') + '</div>'
        + '<div class="prod-name">' + (p.product_name||'\u2014') + '</div>'
        + '<div class="prod-foot" style="display:flex;gap:6px"><button class="btn-sm-navy" onclick="event.preventDefault();event.stopPropagation();allSavedRemove(' + p.id + ')">Remove</button></div>'
      + '</div>'
    + '</a>';
  }).join('') + '</div>';
}

// Helper used by All Saved modal — deletes the saved_products row and re-renders the body
async function allSavedRemove(savedRowId){
  if(!currentUser) return;
  try {
    const {error} = await sb.from('saved_products').delete().eq('id', savedRowId);
    if(error) throw error;
    await refreshAllSavedBody();
    if(typeof renderDashboard === 'function') renderDashboard();
  } catch(e){
    console.error('Saved remove failed', e);
    alert('Could not remove: ' + (e.message || e));
  }
}

// Re-renders the body of the View Collection modal. Called on open and after every add/remove.
async function refreshViewCollectionBody(id){
  if(!currentUser) return;
  let saved = [];
  try {
    const r = await sb.from('saved_products').select('*').eq('user_id', currentUser.id);
    saved = r.data || [];
  } catch(e) { console.error('Saved products fetch failed', e); }
  const inCol  = saved.filter(p => p.collection_id === id);
  const outCol = saved.filter(p => p.collection_id !== id);

  function card(p, isIn){
    const action = isIn
      ? '<button class="btn-sm-navy" style="background:white;color:var(--navy);border:1.5px solid var(--border)" onclick="event.stopPropagation();toggleSavedInCollection('+p.id+','+id+',false)">Remove</button>'
      : '<button class="btn-sm-navy" onclick="event.stopPropagation();toggleSavedInCollection('+p.id+','+id+',true)">+ Add</button>';
    // Quote the product_id so values like "db_12345" don't get read as undefined variables
    var pidJs = "'" + String(p.product_id).replace(/'/g, "\\'") + "'";
    var pidHref = '#product/' + encodeURIComponent(String(p.product_id));
    var guard = "if(event.metaKey||event.ctrlKey||event.shiftKey||event.button===1)return true;event.preventDefault();";
    return '<a class="prod-card" href="' + pidHref + '" onclick="' + guard + 'openProduct(' + pidJs + ')" style="text-decoration:none;color:inherit;display:block">'
      + '<div class="prod-img-wrap"><img src="'+(p.image_url||'')+'" alt="'+(p.product_name||'')+'" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\'">'
        + (isIn ? '<span class="prod-cat-tag" style="background:rgba(0,51,102,.85)">In collection</span>' : '<span class="prod-cat-tag">Saved</span>')
      + '</div>'
      + '<div class="prod-body">'
        + '<div class="prod-brand-row">'+(p.brand||'\u2014')+'</div>'
        + '<div class="prod-name">'+(p.product_name||'\u2014')+'</div>'
        + '<div class="prod-foot" style="display:flex;gap:6px">' + action + '</div>'
      + '</div>'
    + '</a>';
  }

  let html = '';

  // Section: products currently in the collection
  if(inCol.length){
    html += '<div style="font-size:10px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">In this collection (' + inCol.length + ')</div>';
    html += '<div class="prod-grid" style="margin-bottom:30px">' + inCol.map(p => card(p, true)).join('') + '</div>';
  }

  // Section: saved products NOT yet in this collection (the easy "Add" zone)
  if(outCol.length){
    html += '<div style="font-size:10px;font-weight:800;color:var(--navy);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Add from your saved products</div>';
    html += '<div class="prod-grid">' + outCol.map(p => card(p, false)).join('') + '</div>';
  } else if(!saved.length){
    // User has zero saved products at all
    html += '<div style="padding:32px 20px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center"><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:6px">No saved products yet</div><div style="font-size:12px;line-height:1.6">Browse products and click the bookmark on any product card to save it, then come back here to add it to this collection.</div></div>';
  } else {
    // All saved products are already in this collection
    html += '<div style="padding:24px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center;font-size:12px">All your saved products are already in this collection. Save more products to grow it.</div>';
  }

  document.getElementById('vcBody').innerHTML = html;
}

// One-click toggle from inside the view collection modal
async function toggleSavedInCollection(savedRowId, collectionId, addToCollection){
  await moveSavedToCollection(savedRowId, addToCollection ? collectionId : null);
  await refreshViewCollectionBody(collectionId);
}

function closeViewCollection(){
  const m = document.getElementById('viewCollectionModal');
  if(m) m.style.display = 'none';
  document.body.style.overflow = '';
  window._currentCollection = null;
}

// ============ MOVE-TO-COLLECTION ON SAVED PRODUCTS ============
async function moveSavedToCollection(savedRowId, collectionId){
  if(!currentUser) return;
  try {
    const {error} = await sb.from('saved_products').update({ collection_id: collectionId || null }).eq('id', savedRowId);
    if(error) throw error;
    await renderCollections();
    if(typeof renderDashboard === 'function') renderDashboard();
  } catch(e) {
    console.error('Move failed', e);
    alert('Could not move: ' + (e.message || e));
  }
}

// Open a small floating picker over the clicked card to choose a collection
function showMoveToMenu(btn, savedRowId){
  // Remove any existing menu
  document.querySelectorAll('.move-to-menu').forEach(m => m.remove());
  const list = window._collectionsCache || [];
  const menu = document.createElement('div');
  menu.className = 'move-to-menu';
  menu.style.cssText = 'position:absolute;background:white;border:1px solid var(--border);border-radius:10px;box-shadow:0 12px 28px rgba(0,15,40,.16);padding:6px;z-index:200;min-width:200px;font-size:12px';
  menu.innerHTML = '<div style="font-size:9px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px;padding:6px 10px 4px">Move to</div>'
    + '<button onmousedown="event.preventDefault();event.stopPropagation();moveSavedToCollection('+savedRowId+',null);document.querySelectorAll(\'.move-to-menu\').forEach(m=>m.remove())" style="display:block;width:100%;text-align:left;background:transparent;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-family:Manrope,sans-serif;font-weight:600;color:var(--text)">Unfiled (All Saved)</button>'
    + (list.length ? list.map(c => '<button onmousedown="event.preventDefault();event.stopPropagation();moveSavedToCollection('+savedRowId+','+c.id+');document.querySelectorAll(\'.move-to-menu\').forEach(m=>m.remove())" style="display:block;width:100%;text-align:left;background:transparent;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-family:Manrope,sans-serif;font-weight:600;color:var(--text)">'+(c.name||'Untitled')+'</button>').join('') : '<div style="padding:8px 10px;color:var(--muted);font-size:11px">No collections yet. <span style="color:var(--navy);cursor:pointer;font-weight:700" onmousedown="event.preventDefault();document.querySelectorAll(\'.move-to-menu\').forEach(m=>m.remove());openCreateCollection()">Create one →</span></div>');
  // Position near the button
  const r = btn.getBoundingClientRect();
  document.body.appendChild(menu);
  menu.style.left = Math.min(r.left, window.innerWidth - menu.offsetWidth - 12) + 'px';
  menu.style.top  = (r.bottom + window.scrollY + 4) + 'px';
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('mousedown', function _outside(e){
      if(!menu.contains(e.target)){ menu.remove(); document.removeEventListener('mousedown', _outside); }
    });
  }, 0);
}

// ============ HOOK INTO renderDashboard ============
// After the existing renderDashboard runs, decorate saved products with a "Move to" button
// and render the collections section.
(function(){
  const _orig = window.renderDashboard;
  if(typeof _orig === 'function'){
    window.renderDashboard = async function(){
      const r = _orig.apply(this, arguments);
      try { await renderCollections(); } catch(e){ console.error(e); }
      // Decorate saved products with a Move-to button (the existing render is in ax2.js so we patch the DOM)
      setTimeout(() => {
        document.querySelectorAll('#dashSavedGrid .prod-card').forEach((card) => {
          if(card.querySelector('.move-to-btn')) return; // already decorated
          const foot = card.querySelector('.prod-foot');
          if(!foot) return;
          // Pull the product_id from the remove button so we can match the saved_products row
          const removeBtn = foot.querySelector('button[onclick*="removeSaved"]');
          if(!removeBtn) return;
          const m = removeBtn.getAttribute('onclick').match(/removeSaved\((\d+)/);
          if(!m) return;
          const productId = m[1];
          // Fetch the saved_products row id lazily on click
          const btn = document.createElement('button');
          btn.className = 'btn-sm-navy move-to-btn';
          btn.style.cssText = 'background:white;color:var(--navy);border:1.5px solid var(--border)';
          btn.textContent = 'Move to\u2026';
          btn.onclick = async function(e){
            e.stopPropagation();
            // Resolve the saved_products row id (we only have product_id in the DOM)
            try {
              const r = await sb.from('saved_products').select('id').eq('user_id', currentUser.id).eq('product_id', productId).limit(1);
              const row = (r.data || [])[0];
              if(!row) return;
              showMoveToMenu(btn, row.id);
            } catch(e) { console.error('Resolve saved id failed', e); }
          };
          foot.style.display = 'flex';
          foot.style.gap = '6px';
          foot.style.flexWrap = 'wrap';
          foot.insertBefore(btn, foot.firstChild);
        });
      }, 50);
      return r;
    };
  }
})();


window._firmCache = window._firmCache || [];

async function loadFirms(){
  if(window._firmCache.length) return window._firmCache;
  try {
    var r = await sb.from('firms').select('id,name,country,city,categories,featured').eq('status','active').order('featured',{ascending:false}).order('name',{ascending:true});
    window._firmCache = r.data || [];
  } catch(e){ console.error('Firms load failed', e); window._firmCache = []; }
  return window._firmCache;
}

async function openLinkFirm(){
  document.getElementById('lf-search').value = '';
  document.getElementById('lf-results').innerHTML = '<div style="padding:20px;color:var(--muted);font-size:12px;text-align:center">Loading firms\u2026</div>';
  document.getElementById('linkFirmModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  await loadFirms();
  searchFirms('');
}

function closeLinkFirm(){
  document.getElementById('linkFirmModal').style.display = 'none';
  if(document.getElementById('editProfileModal').style.display !== 'flex') document.body.style.overflow = '';
}

function searchFirms(q){
  var list = document.getElementById('lf-results');
  if(!list) return;
  var all = window._firmCache || [];
  q = (q||'').toLowerCase().trim();
  var matched = all.filter(function(f){
    if(!q) return true;
    return (f.name||'').toLowerCase().indexOf(q) >= 0
      || (f.country||'').toLowerCase().indexOf(q) >= 0
      || (f.city||'').toLowerCase().indexOf(q) >= 0;
  }).slice(0, 30);
  if(!matched.length){
    list.innerHTML = '<div style="padding:24px;color:var(--muted);font-size:12px;text-align:center;border:1px dashed var(--border);border-radius:10px">No firms match your search. The firm may not be registered on ArchSpex yet.</div>';
    return;
  }
  list.innerHTML = matched.map(function(f){
    var loc = [f.city, f.country].filter(Boolean).join(', ');
    var initials = (f.name||'F').substring(0,2).toUpperCase();
    return '<div onclick="pickFirm('+f.id+')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s" onmouseover="this.style.borderColor=\'var(--navy)\';this.style.boxShadow=\'0 4px 14px rgba(0,15,40,.06)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.boxShadow=\'\'">'
      + '<div style="width:36px;height:36px;border-radius:8px;background:var(--navy);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0">'+initials+'</div>'
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:700;color:var(--navy2)">'+(f.name||'')+(f.featured?' <span style="color:var(--gold);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-left:4px">Featured</span>':'')+'</div>'
        + '<div style="font-size:11px;color:var(--muted);margin-top:2px">'+(loc||'\u2014')+'</div>'
      + '</div>'
    + '</div>';
  }).join('');
}

function pickFirm(id){
  var f = (window._firmCache || []).find(function(x){ return x.id === id; });
  if(!f) return;
  document.getElementById('ep-firm-id').value = f.id;
  var loc = [f.city, f.country].filter(Boolean).join(', ');
  document.getElementById('ep-firm-display').textContent = f.name + (loc ? ' \u00b7 ' + loc : '');
  document.getElementById('ep-unlinkFirmBtn').style.display = '';
  closeLinkFirm();
}

function unlinkFirm(){
  if(!confirm('Unlink your profile from this firm?')) return;
  document.getElementById('ep-firm-id').value = '';
  document.getElementById('ep-firm-display').textContent = 'Not linked';
  document.getElementById('ep-unlinkFirmBtn').style.display = 'none';
}


window._savedProductIds = window._savedProductIds || new Set();
window._BOOKMARK_FILLED_HTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="var(--navy)" stroke="var(--navy)" stroke-width="1.8" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

async function loadSavedProductIds(){
  if(!currentUser){ window._savedProductIds = new Set(); return; }
  try {
    const r = await sb.from('saved_products').select('product_id').eq('user_id', currentUser.id);
    window._savedProductIds = new Set((r.data||[]).map(function(x){ return String(x.product_id); }));
  } catch(e){ console.error('Saved IDs load failed', e); window._savedProductIds = new Set(); }
}

function refreshBookmarkStates(){
  // If the current user is a brand, saving products doesn't make sense — hide the bookmark entirely.
  if(window._brandMe){
    document.querySelectorAll('.prod-wish').forEach(function(btn){ btn.style.display = 'none'; });
    return;
  } else {
    // Specifier viewing — make sure any previously-hidden bookmark is visible again
    document.querySelectorAll('.prod-wish').forEach(function(btn){ if(btn.style.display === 'none') btn.style.display = ''; });
  }
  var ids = window._savedProductIds || new Set();
  if(!ids.size) return;
  document.querySelectorAll('.prod-wish').forEach(function(btn){
    var oc = btn.getAttribute('onclick') || '';
    var m = oc.match(/handleWish\(([^,)]+)/);
    if(!m) return;
    var idStr = m[1].replace(/['"]/g,'').trim();
    if(ids.has(idStr) || ids.has(String(parseInt(idStr,10)))){
      btn.innerHTML = window._BOOKMARK_FILLED_HTML;
      btn.style.opacity = '1';
      btn.setAttribute('data-saved','1');
    }
  });
}

// Idempotent save: clicking an already-saved bookmark is a no-op (prevents duplicate rows)
(function(){
  var _origWish = window.handleWish;
  if(typeof _origWish !== 'function') return;
  window.handleWish = function(id, btn){
    if(!currentUser){ return _origWish.apply(this, arguments); }
    // Brand accounts can't save products — the feature is specifier-only
    if(window._brandMe){
      if(btn) btn.style.display = 'none';
      return;
    }
    var idStr = String(id);
    var ids = window._savedProductIds || new Set();
    if(ids.has(idStr) || (btn && btn.getAttribute('data-saved')==='1')){
      // already saved — show filled state and toast, but don't double-insert
      btn.innerHTML = window._BOOKMARK_FILLED_HTML;
      btn.style.opacity = '1';
      btn.setAttribute('data-saved','1');
      if(typeof showToast === 'function') showToast('Already saved');
      return;
    }
    ids.add(idStr);
    btn.setAttribute('data-saved','1');
    return _origWish.apply(this, arguments);
  };
})();

// Hook into showPage so every navigation refreshes saved IDs + repaints bookmarks
(function(){
  var _orig = window.showPage;
  if(typeof _orig !== 'function') return;
  window.showPage = function(){
    var r = _orig.apply(this, arguments);
    if(currentUser){
      loadSavedProductIds().then(function(){
        setTimeout(refreshBookmarkStates, 80);
        setTimeout(refreshBookmarkStates, 400);   // catch async re-renders
        setTimeout(refreshBookmarkStates, 1200);
      });
    }
    return r;
  };
})();

// Also run after setLoggedIn so a fresh session immediately reflects saved state
(function(){
  var _orig = window.setLoggedIn;
  if(typeof _orig !== 'function') return;
  window.setLoggedIn = function(){
    var r = _orig.apply(this, arguments);
    loadSavedProductIds().then(function(){ setTimeout(refreshBookmarkStates, 200); });
    return r;
  };
  // If we're already logged in when this script runs, fire once now
  if(window.currentUser){
    loadSavedProductIds().then(function(){ setTimeout(refreshBookmarkStates, 200); });
  }
})();


(function(){
  var _origIn = window.setLoggedIn;
  var _origOut = window.setLoggedOut;
  if(typeof _origIn !== 'function' || typeof _origOut !== 'function') return;

  function closeAccountMenu(){
    document.querySelectorAll('.account-menu').forEach(function(m){ m.remove(); });
  }
  window.closeAccountMenu = closeAccountMenu;

  function showAccountMenu(btn){
    closeAccountMenu();
    var email = (window.currentUser && window.currentUser.email) || '';
    var menu = document.createElement('div');
    menu.className = 'account-menu';
    menu.style.cssText = 'position:absolute;background:white;border:1px solid var(--border);border-radius:10px;box-shadow:0 14px 32px rgba(0,15,40,.18);padding:6px;z-index:9000;min-width:220px;font-family:Manrope,sans-serif';
    menu.innerHTML = ''
      + '<div style="padding:10px 12px;border-bottom:1px solid var(--border);margin-bottom:4px">'
        + '<div style="font-size:9px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Signed in</div>'
        + '<div style="font-size:12px;font-weight:700;color:var(--navy2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + email + '</div>'
      + '</div>'
      + '<button onmousedown="event.preventDefault();event.stopPropagation();closeAccountMenu();showPage(\'dashboard\')" style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:transparent;border:none;padding:9px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--text)" onmouseover="this.style.background=\'var(--off)\';this.style.color=\'var(--navy)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--text)\'">'
        + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>My Dashboard'
      + '</button>'
      + '<button onmousedown="event.preventDefault();event.stopPropagation();closeAccountMenu();openEditProfile()" style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:transparent;border:none;padding:9px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--text)" onmouseover="this.style.background=\'var(--off)\';this.style.color=\'var(--navy)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--text)\'">'
        + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit Profile'
      + '</button>'
      + '<div style="height:1px;background:var(--border);margin:4px 0"></div>'
      + '<button onmousedown="event.preventDefault();event.stopPropagation();closeAccountMenu();doSignOut()" style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:transparent;border:none;padding:9px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:#dc2626" onmouseover="this.style.background=\'#fef2f2\'" onmouseout="this.style.background=\'transparent\'">'
        + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out'
      + '</button>';
    document.body.appendChild(menu);
    var r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + window.scrollY + 6) + 'px';
    menu.style.right = (window.innerWidth - r.right) + 'px';
    setTimeout(function(){
      document.addEventListener('mousedown', function _outside(e){
        if(!menu.contains(e.target)){ closeAccountMenu(); document.removeEventListener('mousedown', _outside); }
      });
    }, 0);
  }

  function hideRegister(hide){
    var reg = document.getElementById('topbarRegister');
    if(!reg) return;
    reg.style.display = hide ? 'none' : '';
    // Also hide the divider between Log In and Register Free so we don't leave a dangling line
    var div = reg.previousElementSibling;
    if(div && div.classList && div.classList.contains('topbar-divider')) div.style.display = hide ? 'none' : '';
  }

  window.setLoggedIn = function(user){
    var r = _origIn.apply(this, arguments);
    var btn = document.getElementById('topbarLogin');
    if(btn){
      btn.innerHTML = 'My Account <span style="font-size:9px;margin-left:3px;opacity:.7">\u25BE</span>';
      btn.onclick = function(e){ e && e.stopPropagation && e.stopPropagation(); showAccountMenu(btn); };
    }
    hideRegister(true);
    return r;
  };

  window.setLoggedOut = function(){
    var r = _origOut.apply(this, arguments);
    hideRegister(false);
    closeAccountMenu();
    // If the user signed out while on the dashboard (or any account-only page), bounce back to home
    try {
      // Post-pushState: currentPage is the source of truth. Fall back to
      // pathname or hash for pre-migration links people may still hold.
      var p = (window.currentPage) ||
              (_PATH_TO_PAGE && _PATH_TO_PAGE[location.pathname]) ||
              (location.hash || '').replace('#','') || '';
      if(p === 'dashboard' || p === 'brandprofile') { if(typeof showPage === 'function') showPage('home'); }
    } catch(e){}
    return r;
  };

  // If we loaded this script AFTER the auth check already ran (currentUser already set),
  // run the visual update once.
  if(window.currentUser){
    try { window.setLoggedIn(window.currentUser); } catch(e){}
  }
})();


// ============ SINGLE-BRAND + SINGLE-PRODUCT SAMPLE REQUEST ============
window._srAllBrands   = window._srAllBrands   || [];
window._srAllProducts = window._srAllProducts || [];
window._srBrand       = window._srBrand       || null;
window._srProduct     = window._srProduct     || null;

async function srLoadBrands(){
  if((window._rfqAllBrands||[]).length){ window._srAllBrands = window._rfqAllBrands; return window._srAllBrands; }
  if(window._srAllBrands.length) return window._srAllBrands;
  try {
    const {data, error} = await sb.from('manufacturers').select('id,name,country,city,categories,featured').eq('status','active').order('featured',{ascending:false}).order('name',{ascending:true});
    if(error) throw error;
    window._srAllBrands = data || [];
    window._rfqAllBrands = window._srAllBrands;
  } catch(e){ console.error('Brand load failed', e); window._srAllBrands = []; }
  return window._srAllBrands;
}

async function srLoadProductsForBrand(brandName){
  try {
    const {data, error} = await sb.from('products').select('id,name,brand,category,image_url').eq('brand', brandName).eq('status','approved').order('name',{ascending:true});
    if(error) throw error;
    window._srAllProducts = data || [];
  } catch(e){ console.error('Products load failed', e); window._srAllProducts = []; }
  return window._srAllProducts;
}

function srInitials(n){ return (n||'B').substring(0,2).toUpperCase(); }

// ---- Brand chip rendering (single) ----
function srRenderBrandChip(){
  const chips = document.getElementById('srChips');
  const input = document.getElementById('srBrandSearch');
  if(!chips) return;
  if(window._srBrand){
    chips.innerHTML = '<span class="rfq-chip">'+ window._srBrand.name +
      '<button type="button" class="rfq-chip-x" onclick="srClearBrand();event.stopPropagation()" aria-label="Remove">\u00d7</button></span>';
    if(input){ input.style.display = 'none'; }
  } else {
    chips.innerHTML = '';
    if(input){ input.style.display = ''; input.value = ''; }
  }
}

async function srPickBrand(id){
  const b = (window._srAllBrands||[]).find(function(x){ return x.id===id; });
  if(!b) return;
  window._srBrand = b;
  window._srProduct = null;
  srRenderBrandChip();
  srCloseResults();
  // Reveal the product picker and load this brand's products
  const wrap = document.getElementById('srProductWrap');
  if(wrap) wrap.style.display = '';
  srRenderProductChip();
  await srLoadProductsForBrand(b.name);
  const pInput = document.getElementById('srProductSearch');
  if(pInput){ pInput.value = ''; setTimeout(function(){ pInput.focus(); }, 50); }
}

function srClearBrand(){
  window._srBrand = null;
  window._srProduct = null;
  window._srAllProducts = [];
  srRenderBrandChip();
  const wrap = document.getElementById('srProductWrap');
  if(wrap) wrap.style.display = 'none';
  srRenderProductChip();
  const inp = document.getElementById('srBrandSearch');
  if(inp) setTimeout(function(){ inp.focus(); }, 50);
}

function srFocusSearch(e){
  if(e && e.target && e.target.closest && e.target.closest('.rfq-chip')) return;
  const inp = document.getElementById('srBrandSearch');
  if(inp && inp.style.display !== 'none') inp.focus();
}

async function srOpenResults(){
  if(window._srBrand) return;
  const picker = document.getElementById('srBrandPicker');
  if(!picker) return;
  picker.classList.add('focus','open');
  await srLoadBrands();
  srSearchBrands(document.getElementById('srBrandSearch').value||'');
}

function srCloseResults(){
  const picker = document.getElementById('srBrandPicker');
  if(picker) picker.classList.remove('open','focus');
}

function srSearchBrands(q){
  const list = document.getElementById('srResults');
  if(!list) return;
  const all = window._srAllBrands || [];
  q = (q||'').toLowerCase().trim();
  const matched = all.filter(function(b){
    if(!q) return true;
    return (b.name||'').toLowerCase().indexOf(q) >= 0 ||
           (b.country||'').toLowerCase().indexOf(q) >= 0 ||
           (b.city||'').toLowerCase().indexOf(q) >= 0 ||
           (b.categories||[]).join(' ').toLowerCase().indexOf(q) >= 0;
  }).slice(0, 30);
  if(!matched.length){
    list.innerHTML = '<div class="rfq-result-empty">No brands match &ldquo;'+(q||'\u2026')+'&rdquo;</div>';
    return;
  }
  list.innerHTML = matched.map(function(b){
    const loc = [b.city, b.country].filter(Boolean).join(', ');
    const cats = (b.categories||[]).slice(0,2).join(' \u00b7 ');
    const meta = [loc, cats].filter(Boolean).join(' \u2014 ');
    return '<div class="rfq-result" onmousedown="event.preventDefault();event.stopPropagation();srPickBrand('+b.id+')">'+
           '<div class="rfq-result-init">'+srInitials(b.name)+'</div>'+
           '<div><div class="rfq-result-name">'+(b.name||'')+(b.featured?' <span style=\'color:var(--gold);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-left:4px\'>Featured</span>':'')+'</div>'+
           '<div class="rfq-result-meta">'+(meta||'\u2014')+'</div></div></div>';
  }).join('');
}

function srPickerKey(e){
  const inp = e.target;
  if(e.key === 'Backspace' && !inp.value && window._srBrand){ srClearBrand(); }
  else if(e.key === 'Escape'){ srCloseResults(); }
}

// ---- Product chip rendering (single) ----
function srRenderProductChip(){
  const chips = document.getElementById('srProductChips');
  const input = document.getElementById('srProductSearch');
  const help  = document.getElementById('srProductHelp');
  if(!chips) return;
  if(window._srProduct){
    chips.innerHTML = '<span class="rfq-chip">'+ window._srProduct.name +
      '<button type="button" class="rfq-chip-x" onclick="srClearProduct();event.stopPropagation()" aria-label="Remove">\u00d7</button></span>';
    if(input){ input.style.display = 'none'; }
    if(help){ help.textContent = 'Product selected. Fill in the details below.'; }
  } else {
    chips.innerHTML = '';
    if(input){ input.style.display = ''; input.value = ''; }
    if(help){
      const n = (window._srAllProducts||[]).length;
      help.textContent = n ? 'Pick from ' + n + ' product' + (n!==1?'s':'') + ' available from this brand.'
                           : 'No products are listed for this brand yet.';
    }
  }
}

function srPickProduct(id){
  const p = (window._srAllProducts||[]).find(function(x){ return x.id===id; });
  if(!p) return;
  window._srProduct = p;
  srRenderProductChip();
  srCloseProductResults();
}

function srClearProduct(){
  window._srProduct = null;
  srRenderProductChip();
  const inp = document.getElementById('srProductSearch');
  if(inp) setTimeout(function(){ inp.focus(); }, 50);
}

function srFocusProductSearch(e){
  if(e && e.target && e.target.closest && e.target.closest('.rfq-chip')) return;
  const inp = document.getElementById('srProductSearch');
  if(inp && inp.style.display !== 'none') inp.focus();
}

async function srOpenProductResults(){
  if(window._srProduct) return;
  const picker = document.getElementById('srProductPicker');
  if(!picker) return;
  picker.classList.add('focus','open');
  // Products already loaded when brand was picked
  srSearchProducts(document.getElementById('srProductSearch').value||'');
}

function srCloseProductResults(){
  const picker = document.getElementById('srProductPicker');
  if(picker) picker.classList.remove('open','focus');
}

document.addEventListener('mousedown', function(e){
  const picker = document.getElementById('srBrandPicker');
  if(picker && !picker.contains(e.target)) srCloseResults();
  const ppicker = document.getElementById('srProductPicker');
  if(ppicker && !ppicker.contains(e.target)) srCloseProductResults();
});

function srSearchProducts(q){
  const list = document.getElementById('srProductResults');
  if(!list) return;
  const all = window._srAllProducts || [];
  q = (q||'').toLowerCase().trim();
  const matched = all.filter(function(p){
    if(!q) return true;
    return (p.name||'').toLowerCase().indexOf(q) >= 0 ||
           (p.category||'').toLowerCase().indexOf(q) >= 0;
  }).slice(0, 30);
  if(!matched.length){
    list.innerHTML = '<div class="rfq-result-empty">' + (all.length ? 'No products match &ldquo;'+(q||'\u2026')+'&rdquo;' : 'This brand has no products listed yet.') + '</div>';
    return;
  }
  list.innerHTML = matched.map(function(p){
    return '<div class="rfq-result" onmousedown="event.preventDefault();event.stopPropagation();srPickProduct('+p.id+')">'+
           '<div class="rfq-result-init" style="background:var(--off);overflow:hidden">' +
             (p.image_url ? '<img src="'+p.image_url+'" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">' : srInitials(p.name)) +
           '</div>'+
           '<div><div class="rfq-result-name">'+(p.name||'')+'</div>'+
           '<div class="rfq-result-meta">'+(p.category||'\u2014')+'</div></div></div>';
  }).join('');
}

function srProductPickerKey(e){
  const inp = e.target;
  if(e.key === 'Backspace' && !inp.value && window._srProduct){ srClearProduct(); }
  else if(e.key === 'Escape'){ srCloseProductResults(); }
}

// ---- Form helpers ----
function srClearForm(){
  window._srBrand = null;
  window._srProduct = null;
  window._srAllProducts = [];
  srRenderBrandChip();
  const wrap = document.getElementById('srProductWrap');
  if(wrap) wrap.style.display = 'none';
  srRenderProductChip();
  ['srFirst','srLast','srEmail','srPhone','srCompany','srAddrBuilding','srAddrUnit','srAddrStreet','srAddrArea','srAddrCity','srAddrCountry','srNotes','srRole'].forEach(function(id){
    const el = document.getElementById(id); if(el) el.value='';
  });
  const dd = document.getElementById('srRole-dd');
  if(dd){
    dd.classList.remove('open');
    const lbl = dd.querySelector('.form-dd-label');
    if(lbl){ lbl.textContent = 'Job Title'; lbl.classList.add('form-dd-placeholder'); }
    const sel = dd.querySelector('.form-dd-opt.selected'); if(sel) sel.classList.remove('selected');
  }
  const s = document.getElementById('srStatus'); if(s){ s.style.display='none'; s.textContent=''; }
}

function srSetStatus(msg, type){
  const el = document.getElementById('srStatus');
  if(!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  el.style.color = type==='error' ? '#fca5a5' : type==='success' ? 'var(--gold)' : 'rgba(255,255,255,.85)';
}

async function submitSR(){
  const first   = (document.getElementById('srFirst')||{}).value || '';
  const last    = (document.getElementById('srLast')||{}).value || '';
  const email   = (document.getElementById('srEmail')||{}).value || '';
  const phone   = (document.getElementById('srPhone')||{}).value || '';
  const company = (document.getElementById('srCompany')||{}).value || '';
  const role    = (document.getElementById('srRole')||{}).value || '';
  const _addrBld = (document.getElementById('srAddrBuilding')||{}).value || '';
  const _addrUn = (document.getElementById('srAddrUnit')    ||{}).value || '';
  const _addrSt  = (document.getElementById('srAddrStreet')  ||{}).value || '';
  const _addrAr  = (document.getElementById('srAddrArea')    ||{}).value || '';
  const _addrCi  = (document.getElementById('srAddrCity')    ||{}).value || '';
  const _addrCo  = (document.getElementById('srAddrCountry') ||{}).value || '';
  const addr    = [_addrBld, _addrUn, _addrSt, _addrAr, _addrCi, _addrCo].map(function(x){return (x||'').trim();}).filter(Boolean).join(', ');
  const _addrValid = _addrBld.trim() && _addrUn.trim() && _addrSt.trim() && _addrAr.trim() && _addrCi.trim() && _addrCo.trim();
  const notes   = (document.getElementById('srNotes')||{}).value || '';
  const brand   = window._srBrand;
  const product = window._srProduct;
  const btn = document.querySelector('#page-samplerequest .btn-rfq-submit');

  if(!brand){
    srSetStatus('\u26a0 Please choose a manufacturer.', 'error');
    return;
  }
  if(!product){
    srSetStatus('\u26a0 Please pick the product you want a sample of.', 'error');
    return;
  }
  if(!first.trim() || !last.trim() || !email.trim() || !phone.trim() || !company.trim() || !role || !_addrValid || !notes.trim()){
    srSetStatus('\u26a0 Please complete all fields before sending.', 'error');
    return;
  }

  if(btn){ btn.textContent='Sending\u2026'; btn.disabled=true; }
  srSetStatus('Sending your sample request to ' + brand.name + '\u2026');

  const row = {
    first_name: first.trim(),
    last_name:  last.trim(),
    company:    company.trim(),
    job_title:  role,
    email:      email.trim(),
    phone:      phone.trim(),
    address:    addr.trim(),
    notes:      '[Brand: ' + brand.name + ']\n\n' + notes.trim(),
    product_name: product.name,
    // Wire the request to the brand so it lands in their inbox
    manufacturer_id: brand.id,
    brand_name: brand.name,
    status: 'new'
  };

  try {
    const {error} = await sb.from('sample_requests').insert([row]);
    if(error) throw error;
    srSetStatus('\u2713 Sample request sent to ' + brand.name + '. They\'ll ship the sample directly to your address.', 'success');
    if(btn){ btn.textContent='Sent \u2713'; btn.style.background='#059669'; }
    setTimeout(function(){
      srClearForm();
      if(btn){ btn.textContent='Send Sample Request \u2192'; btn.style.background=''; btn.disabled=false; }
    }, 4500);
  } catch(e){
    console.error('Sample request error:', e);
    srSetStatus('\u26a0 Something went wrong: '+(e.message||'Please try again.'), 'error');
    if(btn){ btn.textContent='Send Sample Request \u2192'; btn.disabled=false; }
  }
}

// Reset and preload brand cache when the user lands on this page
(function(){
  var _orig = window.showPage;
  if(typeof _orig !== 'function') return;
  window.showPage = function(p){
    var r = _orig.apply(this, arguments);
    if(p === 'samplerequest'){
      try { srClearForm(); } catch(e){}
      try { srLoadBrands(); } catch(e){}
    }
    return r;
  };
})();


// ============ SUBMISSION CARD RENDERER + ALL SUBMISSIONS MODAL ============
// Shared markup for the My Submissions cards (both inline dashboard and modal view).
window.renderSubmissionCard = function(r, kind){
  var msgs = Array.isArray(r.messages) ? r.messages : [];
  var brandEngaged = msgs.some(function(m){return m.from === 'brand';}) || !!(r.reply && r.reply.trim());
  var st = (r.last_actor === 'brand') ? 'new' : (!brandEngaged ? 'sent' : 'replied');
  if ((r.status || '').toLowerCase() === 'closed') st = 'closed';
  var stColor = st === 'new' ? 'var(--gold)' :
                st === 'replied' ? '#059669' :
                st === 'sent' ? '#4f8ef7' : '#9ca3af';
  var stLabel = st.charAt(0).toUpperCase() + st.slice(1);
  var lastBrand = null;
  for (var i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].from === 'brand') { lastBrand = msgs[i]; break; }
  }
  if (!lastBrand && r.reply) lastBrand = {text: r.reply};
  var reply = lastBrand ? (lastBrand.text || '').trim() : '';
  var title    = kind === 'rfq' ? (r.project_name || 'Untitled Project') : (r.product_name || 'Product Sample');
  var subtitle = kind === 'rfq' ? (r.brand_name   || r.project_type || '\u2014') : (r.company || '\u2014');
  var date     = new Date(r.created_at).toLocaleDateString('en-GB');
  var replyFrom = kind === 'rfq' ? (r.brand_name || 'brand') : (r.brand_name || 'brand');

  return '<div onclick="openInboxReply(\''+kind+'\','+r.id+')" style="padding:14px 16px;background:white;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s;display:flex;flex-direction:column;gap:10px" '
       +   'onmouseover="this.style.borderColor=\'var(--navy)\';this.style.boxShadow=\'0 4px 14px rgba(0,15,40,.06)\'" '
       +   'onmouseout="this.style.borderColor=\'var(--border)\';this.style.boxShadow=\'none\'">'
       +   '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">'
       +     '<div style="flex:1;min-width:0">'
       +       '<div style="font-weight:700;color:var(--navy2);font-size:14px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+title+'</div>'
       +       '<div style="font-size:11px;color:var(--muted);margin-top:4px;font-weight:500">'+subtitle+' \u00b7 '+date+'</div>'
       +     '</div>'
       +     '<span style="font-size:9px;font-weight:800;color:'+stColor+';border:1px solid '+stColor+';padding:4px 9px;border-radius:100px;text-transform:uppercase;letter-spacing:.6px;white-space:nowrap;flex-shrink:0">'+stLabel+'</span>'
       +   '</div>'
       +   (reply
          ? '<div style="font-size:12px;color:var(--text);padding:10px 12px;background:#f0fdf4;border-left:3px solid #059669;border-radius:6px;line-height:1.5">'
          +   '<div style="font-size:9px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px">Reply from '+replyFrom+'</div>'
          +   (reply.length > 140 ? reply.substring(0, 140) + '\u2026' : reply)
          + '</div>'
          : '')
       + '</div>';
};

// Sort a list of submissions in place so freshly-replied items bump to the top.
// Activity timestamp = the latest message's "at" field, or fall back to created_at.
window._sortByActivity = function(arr){
  if (!Array.isArray(arr)) return;
  arr.sort(function(a, b){
    var aMsgs = Array.isArray(a.messages) ? a.messages : [];
    var bMsgs = Array.isArray(b.messages) ? b.messages : [];
    var aT = (aMsgs.length && aMsgs[aMsgs.length - 1].at) || a.replied_at || a.created_at;
    var bT = (bMsgs.length && bMsgs[bMsgs.length - 1].at) || b.replied_at || b.created_at;
    return new Date(bT) - new Date(aT);
  });
};

// Toggle the "View all \u2192" buttons after every dashboard refresh.
// Also: if the All Submissions modal is open, re-render its body in place so
// status pills, new messages, and re-ordered cards appear without close/reopen.
window.__updateViewAll = function(){
  var rfqBtn = document.getElementById('dashRfqViewAll');
  if (rfqBtn) rfqBtn.style.display = (window._allRfqs && window._allRfqs.length > 6) ? 'block' : 'none';
  var sBtn = document.getElementById('dashSampleViewAll');
  if (sBtn) sBtn.style.display = (window._allSamples && window._allSamples.length > 6) ? 'block' : 'none';

  var asModal = document.getElementById('allSubsModal');
  if (asModal && asModal.style.display && asModal.style.display !== 'none' && window._asKind){
    var kind = window._asKind;
    var list = kind === 'rfq' ? (window._allRfqs || []) : (window._allSamples || []);
    var asTitle = document.getElementById('asTitle');
    var asDesc  = document.getElementById('asDesc');
    var asBody  = document.getElementById('asBody');
    if (asTitle) asTitle.textContent = kind === 'rfq' ? 'All RFQ Submissions' : 'All Sample Requests';
    if (asDesc)  asDesc.textContent  = list.length + (kind === 'rfq' ? ' RFQ submission' : ' sample request') + (list.length === 1 ? '' : 's');
    if (asBody)  asBody.innerHTML    = list.map(function(r){ return window.renderSubmissionCard(r, kind); }).join('');
  }
};

window.openAllSubmissions = function(kind){
  window._asKind = kind;
  var list = kind === 'rfq' ? (window._allRfqs || []) : (window._allSamples || []);
  var modal = document.getElementById('allSubsModal');
  if (!modal) return;
  document.getElementById('asTitle').textContent = kind === 'rfq' ? 'All RFQ Submissions' : 'All Sample Requests';
  document.getElementById('asDesc').textContent  = list.length + (kind === 'rfq' ? ' RFQ submission' : ' sample request') + (list.length === 1 ? '' : 's');
  document.getElementById('asBody').innerHTML = list.map(function(r){
    return window.renderSubmissionCard(r, kind);
  }).join('');
  modal.style.display = 'flex';
};

window.closeAllSubmissions = function(){
  window._asKind = null;
  var m = document.getElementById('allSubsModal');
  if (m) m.style.display = 'none';
};


(function(){
  var _origOpenReq = window.openReq;
  if(typeof _origOpenReq !== 'function') return;
  window.openReq = async function(){
    var r = _origOpenReq.apply(this, arguments);
    if(currentUser){
      await loadUserProfileForAutofill();
      setTimeout(function(){
        var p = window._userProfile || {};
        var full = (p && p.full_name) || '';
        var sp = full.indexOf(' ');
        var first = sp > 0 ? full.substring(0, sp) : full;
        var last  = sp > 0 ? full.substring(sp + 1) : '';
        var inputs = document.querySelectorAll('#reqForm input:not([type=hidden])');
        // Layout: First, Last, Company, Email, Phone, Delivery Address
        if(inputs[0] && !inputs[0].value) inputs[0].value = first;
        if(inputs[1] && !inputs[1].value) inputs[1].value = last;
        if(inputs[2] && !inputs[2].value) inputs[2].value = p.company || '';
        if(inputs[3] && !inputs[3].value) inputs[3].value = currentUser.email || '';
        if(inputs[4] && !inputs[4].value) inputs[4].value = p.phone || '';
        // Country into the 6th address field (inputs[10]) if present
        if(inputs[10] && !inputs[10].value) inputs[10].value = p.country || '';
        // Job title: write to the hidden input AND show the value in the .form-dd-label
        var _jt = (p && p.job_title) || '';
        if(_jt){
          var _jh = document.getElementById('req-jobtitle');
          if(_jh && !_jh.value){
            _jh.value = _jt;
            var _jd = document.getElementById('req-jobtitle-dd');
            if(_jd){
              var _jl = _jd.querySelector('.form-dd-label');
              if(_jl){ _jl.textContent = _jt; _jl.classList.remove('form-dd-placeholder'); }
              _jd.querySelectorAll('.form-dd-opt').forEach(function(o){
                if((o.textContent||'').trim().toLowerCase() === _jt.trim().toLowerCase()) o.classList.add('selected');
              });
            }
          }
        }
      }, 80);
    }
    return r;
  };
})();


// ============ GENERIC PROFILE AUTOFILL ============
// Loads the current user's profile once and pre-fills any matching field
// on any form: RFQ, Sample Request, slide-out, Contact, etc.
window._userProfile = window._userProfile || null;

async function loadUserProfileForAutofill(){
  if(!currentUser) return null;
  if(window._userProfile) return window._userProfile;
  try {
    var r = await sb.from('profiles').select('full_name,company,job_title,country,phone').eq('user_id', currentUser.id).single();
    window._userProfile = r.data || {};
  } catch(e){ window._userProfile = {}; }
  return window._userProfile;
}

async function autofillForm(idMap){
  if(!currentUser) return;
  var p = await loadUserProfileForAutofill();
  var full = (p && p.full_name) || '';
  var sp = full.indexOf(' ');
  var first = sp > 0 ? full.substring(0, sp) : full;
  var last  = sp > 0 ? full.substring(sp + 1) : '';
  var values = {
    first:    first,
    last:     last,
    fullname: full,
    email:    currentUser.email || '',
    phone:    (p && p.phone) || '',
    company:  (p && p.company) || '',
    job:      (p && p.job_title) || '',
    country:  (p && p.country) || ''
  };
  Object.keys(idMap).forEach(function(domId){
    var key = idMap[domId];
    var val = values[key];
    if(!val) return;
    var el = document.getElementById(domId);
    if(!el) return;
    if(el.value) return;
    // Custom dropdown: the target is a hidden <input> inside .form-dd. Set its value
    // AND update the visible .form-dd-label so the user sees the populated choice.
    var dd = el.closest && el.closest('.form-dd');
    if(dd){
      el.value = val;
      var lbl = dd.querySelector('.form-dd-label');
      if(lbl){ lbl.textContent = val; lbl.classList.remove('form-dd-placeholder'); }
      // Mark the matching option as selected (best-effort, case-insensitive)
      var opts = dd.querySelectorAll('.form-dd-opt');
      opts.forEach(function(o){
        if((o.textContent||'').trim().toLowerCase() === String(val).trim().toLowerCase()) o.classList.add('selected');
      });
      return;
    }
    el.value = val;
  });
}

(function(){
  var _orig = window.showPage;
  if(typeof _orig !== 'function') return;
  window.showPage = function(p){
    var r = _orig.apply(this, arguments);
    if(currentUser){
      if(p === 'rfq'){
        setTimeout(function(){ autofillForm({
          rfqFirst:'first', rfqLast:'last', rfqEmail:'email', rfqPhone:'phone',
          rfqCompany:'company'
        }); }, 80);
      }
      if(p === 'samplerequest'){
        setTimeout(function(){ autofillForm({
          srFirst:'first', srLast:'last', srEmail:'email', srPhone:'phone',
          srCompany:'company', srRole:'job', srAddrCountry:'country'
        }); }, 80);
      }
      if(p === 'contact'){
        setTimeout(function(){ autofillForm({
          'contact-name':'fullname', 'contact-email':'email'
        }); }, 80);
      }
    }
    return r;
  };
})();


(function(){
  var GCC = ['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman'];
  function sync(){
    var box = document.getElementById('ba-markets');
    if(!box) return;
    var wide = box.querySelector('input[type=checkbox][value="GCC-wide"]');
    var on = !!(wide && wide.checked);
    box.querySelectorAll('input[type=checkbox]').forEach(function(b){
      if(GCC.indexOf(b.value) === -1) return;
      var lbl = b.closest('label');
      if(on){
        b.checked = true;
        b.disabled = true;
        if(lbl) lbl.classList.add('auto-selected');
      } else {
        b.disabled = false;
        if(lbl) lbl.classList.remove('auto-selected');
      }
    });
  }
  document.addEventListener('change', function(e){
    var box = document.getElementById('ba-markets');
    if(!box || !box.contains(e.target)) return;
    if(e.target.value === 'GCC-wide') sync();
  });
  // Apply once on load in case GCC-wide is pre-checked
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', sync);
  } else { sync(); }
})();

// ── Copy-link (Share) button on the product page ─────────────────────────
// The old inline injection stopped matching after ppSubmitReq was rewritten
// to async in another patch. Ship ppShare in the external ax2.js so it's
// always defined regardless of build-seo.js inline-script stripping.
(function(){
  if(window.ppShare) return;
  window.ppShare = function(){
    var url = (typeof location !== 'undefined') ? location.href : '';
    function done(){ try{ if(typeof showToast === 'function') showToast('Link copied to clipboard'); }catch(e){} }
    function fallback(){
      try{
        var ta = document.createElement('textarea');
        ta.value = url; ta.setAttribute('readonly','');
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }catch(e){}
    }
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done, function(){ fallback(); done(); });
        return;
      }
    }catch(e){}
    fallback(); done();
  };
})();
