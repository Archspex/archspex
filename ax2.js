

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
  if(pushHistory) history.pushState({page}, '', '#'+page);
}

// Browser back/forward button support
window.addEventListener('popstate', function(e){
  const page = e.state?.page || 'home';
  showPage(page, false);
});

// Set initial history state
history.replaceState({page:'home'}, '', '#home');

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
  try {
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
  } catch(e) {
    console.warn('Products load error:', e.message);
    liveProducts = [];
  }
  renderDiscoverTab(window._discoverTab || 'featured');
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function prodCard(p){
  var pid = p.id || p.db_id;
  var pidStr = JSON.stringify(String(pid));
  if(!window._prodCache) window._prodCache = {};
  window._prodCache[String(pid)] = p;
  var img = p.img || p.image_url || '';
  var cat = p.cat || p.category || '';
  var brand = (p.brand||'') + ' · ' + (p.country||'');
  var pidSafe = "'" + String(pid) + "'";
  return '<div class="prod-card" onclick="openProduct(' + pidSafe + ')">'
    + '<div class="prod-img-wrap">'
    + '<img src="' + img + '" alt="" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\'">'
    + '<span class="prod-cat-tag">' + cat + '</span>'
    + '<button class="prod-wish" onclick="event.stopPropagation();handleWish(' + pidSafe + ',this)">♡</button>'
    + '</div>'
    + '<div class="prod-body">'
    + '<div class="prod-name">' + (p.name||'') + '</div>'
    + '<div class="prod-brand-row">' + brand + '</div>'
    + '<div class="prod-meta">' + (p.meta||'') + '</div>'
    + '<div class="prod-foot">'
    + '<button class="btn-sm-navy" onclick="event.stopPropagation();openReq(' + pidSafe + ')">Request Sample</button>'
    + '<button class="btn-sm-outline" onclick="event.stopPropagation();openProduct(' + pidSafe + ')">Spec ↓</button>'
    + '</div></div></div>';
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
  btn.innerHTML = '<svg width=12 height=12 viewBox="0 0 12 12"><path d="M6 10.5L1 5.5a3 3 0 115-4.5L6 1l.5-.5a3 3 0 115 4.5L6 10.5z" fill="#ef4444"></path></svg>';
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
  const data = {
    first_name: allInputs[0]?.value || '',
    last_name:  allInputs[1]?.value || '',
    company:    allInputs[2]?.value || '',
    job_title:  panel.querySelector('select')?.value || '',
    email:      allInputs[3]?.value || '',
    phone:      allInputs[4]?.value || '',
    address:    allInputs[5]?.value || '',
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
    document.getElementById('dashProfileType').textContent = isBrand ? '🏭 ' + profile.user_type : '🏛 ' + (profile.user_type||'Specifier');
    document.getElementById('dashProfileType').style.background = isBrand ? 'rgba(201,168,76,.2)' : 'rgba(79,142,247,.15)';
    document.getElementById('dashProfileType').style.color = isBrand ? 'var(--gold)' : '#4f8ef7';
  }

  // Load saved products
  const {data:saved, count:savedCount} = await sb.from('saved_products').select('*',{count:'exact'}).eq('user_id',currentUser.id);
  document.getElementById('dashSavedCount').textContent = savedCount||0;
  if(saved?.length){
    document.getElementById('dashSavedGrid').innerHTML = saved.map(p=>`
      <div class="prod-card" onclick="openProduct(${p.product_id})">
        <div class="prod-img-wrap"><img src="${p.image_url||''}" alt="${p.product_name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'">
          <span class="prod-cat-tag">Saved</span>
        </div>
        <div class="prod-body">
          <div class="prod-brand-row">${p.brand||'—'}</div>
          <div class="prod-name">${p.product_name||'—'}</div>
          <div class="prod-foot"><button class="btn-sm-navy" onclick="event.stopPropagation();removeSaved(${p.product_id},this)">Remove</button></div>
        </div>
      </div>`).join('');
  }

  // Load RFQ submissions by email
  const {data:rfqs, count:rfqCount} = await sb.from('rfq_submissions').select('*',{count:'exact'}).eq('email',currentUser.email).order('created_at',{ascending:false});
  document.getElementById('dashRfqCount2').textContent = rfqCount||0;
  document.getElementById('dashRfqList').innerHTML = rfqs?.length
    ? rfqs.slice(0,3).map(r=>`<div style="padding:10px 0;border-bottom:1px solid var(--border)"><div style="font-weight:600;color:var(--text)">${r.project_name||'Untitled Project'}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">${r.category||'—'} · ${new Date(r.created_at).toLocaleDateString('en-GB')}</div></div>`).join('')
    : '<div style="color:var(--muted);font-size:12px">No RFQ submissions yet. <span style="color:var(--navy);cursor:pointer;font-weight:600" onclick="showPage(\'rfq\')">Submit one →</span></div>';

  // Load sample requests by email
  const {data:samples, count:sampleCount} = await sb.from('sample_requests').select('*',{count:'exact'}).eq('email',currentUser.email).order('created_at',{ascending:false});
  document.getElementById('dashSampleCount2').textContent = sampleCount||0;
  document.getElementById('dashSampleList').innerHTML = samples?.length
    ? samples.slice(0,3).map(r=>`<div style="padding:10px 0;border-bottom:1px solid var(--border)"><div style="font-weight:600;color:var(--text)">${r.product_name||'Product Sample'}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">${r.company||'—'} · ${new Date(r.created_at).toLocaleDateString('en-GB')}</div></div>`).join('')
    : '<div style="color:var(--muted);font-size:12px">No sample requests yet.</div>';

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

  msg.textContent = '✓ Submitted! The Archspex team will review your listing within 24-48 hours.';
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

  msg.textContent = '✓ Resubmitted! The Archspex team will review your updated listing.';
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
    showToast('Saved to your dashboard ♡');
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
    ? '🏗 <span style="color:var(--navy);font-weight:800">Contractor Account</span><div style="font-size:11px;color:var(--muted);font-weight:500;margin-top:3px">Source products, compare brands, and connect directly with manufacturers on Archspex.</div>'
    : '🏛 <span style="color:var(--navy);font-weight:800">Design Professional Account</span><div style="font-size:11px;color:var(--muted);font-weight:500;margin-top:3px">Access products, BIM files, technical documents, and project tools on Archspex.</div>';
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
  if(tab==='loggedin' && currentUser){
    document.getElementById('welcomeMsg').textContent = 'Welcome back!';
    document.getElementById('loggedInEmail').textContent = currentUser.email;
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
        `<h3 style="color:#003366">New user registered on Archspex</h3>
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
        : '&#x2713; Welcome to Archspex! Your account is ready.', 'success');
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
  'Structure':   ['Structural Steel','Concrete Systems','Precast Elements','Timber Structures','Reinforcement Systems'],
  'Envelope':    ['Façade Systems','Curtain Wall Systems','Cladding Systems','External Wall Finishes','Roofing Systems','Waterproofing Systems','Insulation Systems','Windows & Glazing Systems','Doors & Entrance Systems','Shading & Louvers'],
  'Interiors':   ['Partition Systems','Wall Systems','Ceiling Systems','Raised Floor Systems','Acoustic Systems','Interior Doors','Glass Partitions','Joinery & Built-in Elements','Decorative Elements'],
  'Finishes':    ['Floor Finishes','Wall Finishes','Ceiling Finishes','Coatings & Paints','Surface Panels','Tiles & Stone Finishes','Wood & Veneer Finishes','Decorative Finishes'],
  'Furnishing':  ['Furniture','Lighting','Sanitaryware','Kitchens','Appliances','Fixtures','Equipment','Outdoor Furniture'],
  'Systems':     ['HVAC Systems','Electrical Systems','Plumbing Systems','Fire Protection Systems','Security Systems','Building Automation','Smart Systems','Elevators & Escalators','Energy Systems']
};

async function loadProductsFromDB(){
  try {
    var res = await sb.from('products').select('*').eq('status','approved').order('created_at',{ascending:false});
    var data = res.data; var error = res.error;
    if(!error && data && data.length > 0){
      var dbMapped = data.map(function(p){
        return { id:'db_'+p.id, db_id:p.id, name:p.name, brand:p.brand, cat:p.category, category:p.category, country:p.country||'', meta:p.meta||'', img:p.image_url||'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85', image_url:p.image_url, desc:p.description||'', description:p.description||'', specs:(function(){try{return JSON.parse(p.specs||'{}')}catch(e){return{}}})(), swatches:(function(){try{return JSON.parse(p.swatches||'[]')}catch(e){return[]}})(), fromDB:true };
      });
      liveProducts = [].concat(products||[], dbMapped);
      useDBProducts = true;
      return liveProducts;
    }
  } catch(e){ console.log('DB products not available'); }
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
  document.querySelectorAll('#filterSidebar input[type=checkbox]').forEach(function(c){ c.checked = false; });
  document.querySelectorAll('#filterSidebar input[type=radio]').forEach(function(r){ r.checked = (r.value==='all'); });
  buildFilterSidebar(liveProducts);
  applyAndRender();
}

function applyAndRender(){
  var prods = liveProducts || [];
  var view = window._prodView || 'all';
  var sort = window._prodSort || '';
  var filtered = prods.filter(function(p){
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
  if(titleEl) titleEl.textContent = title;
  var countEl = document.getElementById('prodCount');
  if(countEl) countEl.textContent = filtered.length + ' product' + (filtered.length!==1?'s':'');

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
    + '<div style="font-size:10px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Welcome to Archspex</div>'
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
    finalGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="font-size:40px;margin-bottom:12px">\uD83C\uDFED</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Manufacturers joining soon</div><div style="font-size:12px;color:var(--muted)">European brands are being onboarded to Archspex</div></div>';
    return;
  }

  var finalGrid = document.getElementById('mfgGrid');
  if(!finalGrid) return;
  window._mfgList = brands;
  window._mfgCardFn = function(b){
    var cats = (b.categories||[]).join(' \xb7 ');
    var initials = (b.name||'B').substring(0,2).toUpperCase();
    return '<div class="profile-card" style="cursor:pointer" onclick="openBrandProfile('+b.id+')">'
      + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">'
      + '<div style="width:56px;height:56px;border-radius:10px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:900;flex-shrink:0">' + initials + '</div>'
      + '<div><div class="profile-name">' + (b.name||'Brand') + '</div>'
      + '<div class="profile-type">' + (b.country||'') + (b.city ? ', ' + b.city : '') + '</div>'
      + (b.featured ? '<span style="font-size:9px;font-weight:700;color:var(--gold);background:rgba(201,168,76,.1);padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.5px">Featured</span>' : '')
      + '</div></div>'
      + '<div style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + (b.description||'') + '</div>'
      + '<div style="font-size:10px;color:var(--navy);font-weight:600;margin-bottom:14px">' + cats + '</div>'
      + '<div class="profile-actions">'
      + '<button class="btn-profile-primary" onclick="event.stopPropagation();openBrandProfile('+b.id+')">View Profile</button>'
      + '<button class="btn-profile-sec" onclick="event.stopPropagation();openReq(null)">Contact</button>'
      + '</div></div>';
  };
  finalGrid.innerHTML = brands.map(window._mfgCardFn).join('');
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
      + '<div style="font-size:11px;color:var(--muted);max-width:320px;line-height:1.65">The brand has not yet uploaded gallery imagery to their Archspex profile.</div>'
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
    + '<div style="font-size:12px;color:var(--muted);font-weight:500;line-height:1.65;max-width:340px;margin:0 auto">This brand has not added any products to their Archspex catalogue.</div>'
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
      <div style="font-size:40px;margin-bottom:12px">👷</div>
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Professionals joining soon</div>
      <div style="font-size:12px;color:var(--muted)">Architects and designers are registering on Archspex</div>
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
    <div style="font-size:40px;margin-bottom:12px">📖</div>
    <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Buying guides coming soon</div>
    <div style="font-size:12px;color:var(--muted)">Specification guides for UAE & GCC projects launching soon</div>
  </div>`;
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function doSearch(){
  const q=document.getElementById('navSearchInput').value.toLowerCase().trim();if(!q)return;
  showPage('products');
  setTimeout(()=>{
    const all=[...(liveProducts||[])];
    const f=all.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q)||(p.cat||p.category||'').toLowerCase().includes(q));
    document.getElementById('allProdGrid').innerHTML=f.length?f.map(prodCard).join(''):`<div style="grid-column:1/-1;text-align:center;padding:80px"><div style="font-size:36px;margin-bottom:12px">🔍</div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">No results for "${q}"</div><div style="font-size:12px;color:var(--muted)">Try a different search term or browse all products</div></div>`;
    document.getElementById('prodCount').textContent=f.length+' results for "'+q+'"';
  },80);
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

  msg.textContent = '✓ Application received! Archspex will contact you within 2 business days.';
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
    rfqSetStatus('✓ Your request was sent to '+brands.length+' brand'+(brands.length!==1?'s':'')+'. They\'ll respond directly through their Archspex dashboard.', 'success');
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
        from: 'Archspex Notifications <notifications@archspex.com>',
        to: [NOTIFY_EMAIL],
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#003366;padding:16px 24px;border-radius:8px 8px 0 0">
            <span style="color:white;font-size:16px;font-weight:700">Archspex</span>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            ${body}
          </div>
          <p style="color:#9ca3af;font-size:11px;margin-top:12px;text-align:center">Archspex.com · Dubai, UAE</p>
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

// ============ MANUFACTURER RFQ INBOX ============
async function renderBrandInbox(){
  const section = document.getElementById('brandInboxSection');
  const list = document.getElementById('brandInboxList');
  const countEl = document.getElementById('brandInboxCount');
  if(!section || !list || !currentUser) return;

  // Is this account a brand? Match the logged-in email to a manufacturer row.
  let brand;
  try {
    const r = await sb.from('manufacturers').select('id,name').eq('email', currentUser.email).limit(1);
    brand = (r.data || [])[0];
  } catch(e) {
    return; // table without email column / RLS issue → just hide
  }
  if(!brand){ section.style.display = 'none'; return; }
  section.style.display = 'block';

  let rfqs = [];
  try {
    const r = await sb.from('rfqs').select('*').eq('brand_id', brand.id).order('created_at',{ascending:false}).limit(50);
    rfqs = r.data || [];
  } catch(e) { console.error('Inbox load failed', e); }

  if(countEl) countEl.textContent = rfqs.length ? '(' + rfqs.length + ')' : '';

  if(!rfqs.length){
    list.innerHTML = '<div style="padding:24px;border:1px dashed var(--border);border-radius:12px;background:#fafbfd;color:var(--muted);font-size:13px;text-align:center">No RFQs received yet. New requests will appear here.</div>';
    return;
  }

  list.innerHTML = rfqs.map(function(r){
    const when = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
    const status = (r.status||'new').toUpperCase();
    const statusColor = status==='NEW' ? 'var(--gold)' : status==='REPLIED' ? '#059669' : 'var(--muted)';
    const submitter = ((r.submitter_first||'')+' '+(r.submitter_last||'')).trim() || '—';
    const meta = [r.project_type, r.project_location, r.required_by].filter(Boolean).join(' · ');
    return '<div style="background:white;border:1px solid var(--border);border-radius:14px;padding:20px 22px;display:flex;flex-direction:column;gap:10px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'
        + '<div>'
          + '<div style="font-family:Fraunces,serif;font-size:18px;color:var(--navy2);font-weight:400;line-height:1.25">' + (r.project_name||'Untitled project') + '</div>'
          + '<div style="font-size:11px;color:var(--muted);margin-top:3px">' + when + ' · From ' + submitter + (r.submitter_company ? ' (' + r.submitter_company + ')' : '') + '</div>'
        + '</div>'
        + '<span style="font-size:9px;font-weight:800;color:white;background:'+statusColor+';padding:4px 9px;border-radius:100px;text-transform:uppercase;letter-spacing:.8px;white-space:nowrap">' + status + '</span>'
      + '</div>'
      + (meta ? '<div style="font-size:12px;color:var(--text);font-weight:600">' + meta + '</div>' : '')
      + (r.message ? '<div style="font-size:13px;color:var(--text);line-height:1.65;background:var(--off);padding:12px 14px;border-radius:10px;white-space:pre-wrap">' + (r.message.length>320?r.message.substring(0,320)+'…':r.message) + '</div>' : '')
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-top:6px;border-top:1px solid var(--border)">'
        + '<a href="mailto:' + (r.submitter_email||'') + '?subject=Re: ' + encodeURIComponent(r.project_name||'Archspex RFQ') + '" style="background:var(--navy);color:white;font-size:11px;font-weight:700;padding:8px 14px;border-radius:8px;text-decoration:none">Reply by email →</a>'
        + (r.submitter_phone ? '<a href="tel:' + r.submitter_phone + '" style="background:white;color:var(--navy);border:1px solid var(--border);font-size:11px;font-weight:700;padding:8px 14px;border-radius:8px;text-decoration:none">Call ' + r.submitter_phone + '</a>' : '')
      + '</div>'
    + '</div>';
  }).join('');
}

// Hook renderBrandInbox into the existing dashboard render path
(function(){
  var _orig = window.renderDashboard;
  if(typeof _orig === 'function'){
    window.renderDashboard = async function(){
      var r = _orig.apply(this, arguments);
      try { await renderBrandInbox(); } catch(e){ console.error(e); }
      return r;
    };
  }
})();


// ============ EDIT PROFILE ============
async function openEditProfile(){
  if(!currentUser){ openRegModal('login'); return; }
  // Load existing profile values
  let prof = {};
  try {
    const r = await sb.from('profiles').select('full_name,company,job_title,country').eq('user_id', currentUser.id).single();
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
    const {error} = await sb.from('profiles').update({ full_name, company, job_title: jobtitle, country }).eq('user_id', currentUser.id);
    if(error) throw error;
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
  closeViewCollection();
  setTimeout(() => openEditCollection(window._currentCollection.id), 120);
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
    grid.innerHTML = '<div style="grid-column:1/-1;padding:32px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center"><div style="font-size:30px;margin-bottom:8px">\u{1F4C1}</div><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:4px">No collections yet</div><div style="font-size:12px;line-height:1.6;max-width:380px;margin:0 auto 14px">Group your saved products into named project folders.</div><button class="btn-ghost-sm" onclick="openCreateCollection()">+ Create your first collection</button></div>';
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
  document.getElementById('vcBody').innerHTML = '<div style="padding:24px;color:var(--muted);text-align:center">Loading\u2026</div>';
  document.getElementById('viewCollectionModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  let items = [];
  try {
    const r = await sb.from('saved_products').select('*').eq('user_id', currentUser.id).eq('collection_id', id);
    items = r.data || [];
  } catch(e) { console.error('Collection contents failed', e); }
  if(!items.length){
    document.getElementById('vcBody').innerHTML = '<div style="padding:36px 20px;border:1px dashed var(--border);border-radius:14px;background:#fafbfd;color:var(--muted);text-align:center"><div style="font-size:14px;font-weight:700;color:var(--navy2);margin-bottom:6px">No products in this collection yet</div><div style="font-size:12px;line-height:1.6">Open a saved product\u2019s \u2026 menu to add it to this collection.</div></div>';
    return;
  }
  document.getElementById('vcBody').innerHTML = '<div class="prod-grid">' + items.map(p =>
    '<div class="prod-card" onclick="openProduct('+ p.product_id +')">'
    + '<div class="prod-img-wrap"><img src="'+(p.image_url||'')+'" alt="'+(p.product_name||'')+'" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\'"><span class="prod-cat-tag">Saved</span></div>'
    + '<div class="prod-body">'
      + '<div class="prod-brand-row">'+(p.brand||'\u2014')+'</div>'
      + '<div class="prod-name">'+(p.product_name||'\u2014')+'</div>'
      + '<div class="prod-foot" style="display:flex;gap:6px">'
        + '<button class="btn-sm-navy" onclick="event.stopPropagation();moveSavedToCollection('+p.id+',null);openViewCollection('+id+')">Remove from collection</button>'
      + '</div>'
    + '</div>'
  + '</div>'
  ).join('') + '</div>';
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

