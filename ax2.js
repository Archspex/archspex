

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
var activeFilters={cat:'all',subtype:[],application:[],brand:[],country:[],cert:[]};

// ── NAV SCROLL ────────────────────────────────────────────────────────────────
window.addEventListener('scroll',()=>document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>20));

// ── PAGE ROUTING ──────────────────────────────────────────────────────────────
function showPage(page, pushHistory=true){
  document.querySelectorAll('[id^="page-"]').forEach(p=>p.style.display='none');
  const el = document.getElementById('page-'+page);
  if(el) el.style.display='block';
  document.querySelectorAll('.nav-link').forEach(function(l){
    var onclick = l.getAttribute('onclick') || '';
    var match = onclick.match(/showPage\('([^']+)'\)/);
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
async function renderHome(){
  const homeProdGrid = document.getElementById('homeProdGrid');
  if(homeProdGrid){
    homeProdGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="width:24px;height:24px;border:2px solid var(--border);border-top-color:var(--navy);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px"></div><div style="font-size:12px;color:var(--muted)">Loading products…</div></div>`;
  }
  try {
    const {data:dbProds, error} = await sb.from('products').select('*').eq('status','approved').order('created_at',{ascending:false}).limit(10);
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
  } catch(e) { console.warn('Products load error:', e.message); liveProducts = liveProducts || []; }
  renderDiscoverTab(window._discoverTab || 'featured');
}

// ── DISCOVER TABS ─────────────────────────────────────────────────────────────
var TRENDING_CATS = [
  {name:'Structure',  cat:'Structure',  meta:'Foundations & systems',     img:'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=900&q=85'},
  {name:'Envelope',   cat:'Envelope',   meta:'Facades & glazing',          img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85'},
  {name:'Interiors',  cat:'Interiors',  meta:'Partitions & ceilings',      img:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=85'},
  {name:'Finishes',   cat:'Finishes',   meta:'Flooring & surfaces',        img:'https://images.unsplash.com/photo-1615873968403-89e068629265?w=900&q=85'},
  {name:'FF&E',       cat:'Furnishing', meta:'Furniture & equipment',      img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85'},
  {name:'Systems',    cat:'Systems',    meta:'Lighting, HVAC & electrical',img:'https://images.unsplash.com/photo-1565793979206-6ab2d6dbe9f1?w=900&q=85'}
];
function renderDiscoverTab(tab){
  var content = document.getElementById('discoverContent');
  if(!content) return;
  var emptyHtml = `<div style="text-align:center;padding:60px 20px"><div style="font-size:40px;margin-bottom:16px">🏗</div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px">Products coming soon</div><div style="font-size:13px;color:var(--muted)">Our team is onboarding European brands. Check back soon.</div></div>`;
  if(tab === 'trending'){
    content.innerHTML = '<div class="trending-cats">' + TRENDING_CATS.map(function(c){
      return '<div class="trending-cat" onclick="filterCatGo(\''+c.cat+'\')"><img src="'+c.img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'"><div class="trending-cat-info"><div class="trending-cat-meta">'+c.meta+'</div><div class="trending-cat-name">'+c.name+'</div></div></div>';
    }).join('') + '</div>';
    return;
  }
  if(!liveProducts || !liveProducts.length){
    content.innerHTML = '<div class="prod-grid" id="homeProdGrid">'+emptyHtml+'</div>';
    return;
  }
  var list = liveProducts.slice();
  if(tab === 'newest') list.sort(function(a,b){ return (b.db_id||0) - (a.db_id||0); });
  content.innerHTML = '<div class="prod-grid" id="homeProdGrid">' + list.map(prodCard).join('') + '</div>';
}
function switchDiscoverTab(btn){
  if(!btn) return;
  var tab = btn.dataset.tab;
  window._discoverTab = tab;
  var tabs = btn.parentElement;
  if(tabs) tabs.querySelectorAll('.discover-tab').forEach(function(t){ t.classList.remove('active'); });
  btn.classList.add('active');
  renderDiscoverTab(tab);
}
function gotoProductView(view){
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  document.querySelectorAll('.nav-link-arrow').forEach(function(a){ a.style.transform=''; });
  window._prodView = view;
  window._prodSort = '';
  activeFilters.cat = 'all';
  activeFilters.subtype = [];
  showPage('products');
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
    + '<div class="prod-brand-row">' + brand + '</div>'
    + '<div class="prod-name">' + (p.name||'') + '</div>'
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
setInterval(()=>slideMove(1),5000);

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
  el=document.getElementById('modalBrand');  if(el) el.textContent=(p.brand||'').toUpperCase();
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
    ? '🏗 <span style="color:var(--navy)">Contractor Account</span> — Source materials & submit RFQs'
    : '🏛 <span style="color:var(--navy)">Specifier Account</span> — Free access to all products';
  document.getElementById('regSubmitBtn').textContent = 'Create Free Account →';
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

  if(!firstName||!email||!password){showAuthMsg('Please fill in your name, email and password.');return;}
  if(password.length<6){showAuthMsg('Password must be at least 6 characters.');return;}
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
         <p><strong>Country:</strong> ${country||'—'}</p>`
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
  document.body.style.overflow='hidden';
}
function closeSideMenu(){
  document.getElementById('sideMenu').classList.remove('open');
  document.getElementById('sideMenuOverlay').classList.remove('open');
  document.body.style.overflow='';
}

// ── PRODUCTS PAGE ─────────────────────────────────────────────────────────────
var liveProducts = [];
var useDBProducts = false;

var subtypeMap = {
  'Structure':   ['Foundations','Structural Systems','Columns & Beams','Slabs & Decking','Structural Components','Reinforcement Systems'],
  'Envelope':    ['Facades & Cladding','Curtain Wall Systems','Windows & Glazing','External Doors & Gates','Roofing Systems','Insulation Systems','Waterproofing Systems','Shading Systems'],
  'Interiors':   ['Partition Systems','Wall Systems (Internal)','Ceiling Systems','Raised Floor Systems','Stair Systems','Doors (Internal)','Acoustic Systems'],
  'Finishes':    ['Flooring','Wall Finishes','Ceiling Finishes','Surface Materials','Decorative Panels','Coatings & Paints','Stone & Tiles'],
  'Furnishing':  ['Furniture','Kitchen Systems','Bathroom Fixtures','Wardrobes & Storage','Outdoor Furniture','Accessories'],
  'Systems':     ['Lighting','Electrical Fixtures','Smart Systems & Automation','HVAC','Sanitary Systems','Fire & Safety Systems','Security Systems']
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
  activeFilters = { cat:'all', subtype:[], application:[], brand:[], country:[], cert:[] };
  buildFilterSidebar(liveProducts);
  applyAndRender();
}

function applyAndRender(){
  var prods = liveProducts || [];
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

  var sort = window._prodSort || '';
  var view = window._prodView || 'all';
  if(sort==='az') filtered.sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
  else if(sort==='brand') filtered.sort(function(a,b){ return (a.brand||'').localeCompare(b.brand||''); });
  else if(sort==='newest' || (sort==='' && view==='new')) filtered.sort(function(a,b){ return (b.db_id||0)-(a.db_id||0); });

  var titleEl = document.getElementById('prodPageTitle');
  if(titleEl){
    if(activeFilters.cat!=='all') titleEl.textContent = activeFilters.cat==='Furnishing'?'FF&E':activeFilters.cat;
    else if(view==='featured') titleEl.textContent = 'Featured Products';
    else if(view==='new') titleEl.textContent = 'New Products';
    else titleEl.textContent = 'All Products';
  }
  var countEl = document.getElementById('prodCount');
  if(countEl) countEl.textContent = filtered.length + ' product' + (filtered.length!==1?'s':'');

  renderActiveTags();
  renderSubcatPills();

  var grid = document.getElementById('allProdGrid');
  if(!grid) return;
  if(!filtered.length){
    var label = activeFilters.cat==='all' ? 'this selection' : activeFilters.cat==='Furnishing'?'FF&E':activeFilters.cat;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--muted)"><div style="font-size:36px;margin-bottom:12px">\u{1F4E6}</div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">No products in '+label+' yet</div><div style="font-size:12px">Check back soon as we onboard more brands</div></div>';
    return;
  }
  grid.innerHTML = filtered.map(prodCard).join('');
}

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
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  document.querySelectorAll('.nav-link-arrow').forEach(function(a){ a.style.transform=''; });
  window._prodView = 'all';
  activeFilters.cat = cat;
  activeFilters.subtype = [];
  showPage('products');
}

function filterSubCat(cat, sub){
  document.querySelectorAll('.cat-subdrop').forEach(function(d){ d.classList.remove('open'); });
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  window._prodView = 'all';
  if(cat && typeof sub !== 'undefined'){
    activeFilters.cat = cat;
    activeFilters.subtype = [sub];
  } else {
    activeFilters.subtype = [cat];
  }
  showPage('products');
}

function gotoProfFiltered(type){
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  document.querySelectorAll('.nav-link-arrow').forEach(function(a){ a.style.transform=''; });
  showPage('professionals');
  setTimeout(function(){
    var radio = document.querySelector('input[name="prof-type"][value="'+type+'"]');
    if(radio) radio.checked = true;
    renderProfessionals(type);
  }, 0);
}
function gotoBrandsFiltered(cat){
  document.querySelectorAll('.mega-drop').forEach(function(d){ d.classList.remove('open'); });
  document.querySelectorAll('.nav-link-arrow').forEach(function(a){ a.style.transform=''; });
  brandPageFilters.cat = cat;
  showPage('manufacturers');
  setTimeout(function(){
    var radio = document.querySelector('input[name="brand-cat"][value="'+cat+'"]');
    if(radio) radio.checked = true;
    renderManufacturers();
  }, 0);
}

// ── SUBCATEGORY PILLS ─────────────────────────────────────────────────────────
function renderSubcatPills(){
  var wrap = document.getElementById('subcatPills');
  if(!wrap) return;
  var subs = subtypeMap[activeFilters.cat];
  if(!subs){ wrap.innerHTML = ''; return; }
  wrap.innerHTML = subs.map(function(s){
    var active = activeFilters.subtype.indexOf(s) >= 0 ? ' active' : '';
    var safe = s.replace(/'/g, "\\'");
    return '<button class="subcat-pill'+active+'" onclick="toggleSubcatPill(\''+safe+'\')">'+s+'</button>';
  }).join('');
}
function toggleSubcatPill(sub){
  var arr = activeFilters.subtype;
  var i = arr.indexOf(sub);
  if(i >= 0) arr.splice(i,1);
  else arr.push(sub);
  var box = document.querySelector('#filter-subtypes input[value="'+sub.replace(/"/g,'\\"')+'"]');
  if(box) box.checked = arr.indexOf(sub) >= 0;
  applyAndRender();
}

function sortProds(val){
  window._prodSort = (val==='featured') ? '' : (val||'');
  applyAndRender();
}

// ── GRID / LIST VIEW TOGGLE ──────────────────────────────────────────────────
function setListView(gridId, mode, btn){
  var grid = document.getElementById(gridId);
  if(!grid) return;
  grid.classList.toggle('list-view', mode === 'list');
  if(btn && btn.parentElement){
    btn.parentElement.querySelectorAll('.view-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
  }
}

// ── CUSTOM SORT + FORM DROPDOWNS ─────────────────────────────────────────────
function toggleSortDD(btn){
  var dd = btn.closest('.sort-dd'); if(!dd) return;
  var wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.sort-dd, .form-dd').forEach(function(d){ d.classList.remove('open'); });
  if(!wasOpen) dd.classList.add('open');
}
function pickSortOpt(opt){
  var dd = opt.closest('.sort-dd'); if(!dd) return;
  var label = dd.querySelector('.sort-dd-label');
  if(label) label.textContent = opt.textContent;
  dd.querySelectorAll('.sort-dd-opt').forEach(function(o){ o.classList.remove('selected'); });
  opt.classList.add('selected');
  dd.classList.remove('open');
  var fn = dd.dataset.fn;
  if(fn && typeof window[fn] === 'function') window[fn](opt.dataset.val || '');
}
function toggleFormDD(btn){
  var dd = btn.closest('.form-dd'); if(!dd) return;
  var wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.sort-dd, .form-dd').forEach(function(d){ d.classList.remove('open'); });
  if(!wasOpen) dd.classList.add('open');
}
function pickFormDDOpt(opt){
  var dd = opt.closest('.form-dd'); if(!dd) return;
  var label = dd.querySelector('.form-dd-label');
  if(label){ label.textContent = opt.textContent; label.classList.remove('form-dd-placeholder'); }
  dd.querySelectorAll('.form-dd-opt').forEach(function(o){ o.classList.remove('selected'); });
  opt.classList.add('selected');
  dd.classList.remove('open');
  var targetId = dd.dataset.target;
  if(targetId){
    var input = document.getElementById(targetId);
    if(input) input.value = opt.dataset.val || opt.textContent.trim();
  }
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.sort-dd') && !e.target.closest('.form-dd')){
    document.querySelectorAll('.sort-dd.open, .form-dd.open').forEach(function(d){ d.classList.remove('open'); });
  }
});

function getActiveProducts(){ return liveProducts; }

// ── BRANDS PAGE ───────────────────────────────────────────────────────────────
var brandPageFilters = { cat: 'all', cert: [] };

function filterBrandsPage(type, val){
  if(type === 'cat') brandPageFilters.cat = val;
  else if(type === 'cert'){
    var i = brandPageFilters.cert.indexOf(val);
    if(i >= 0) brandPageFilters.cert.splice(i, 1);
    else brandPageFilters.cert.push(val);
  }
  renderManufacturers();
}

function clearBrandFilters(){
  brandPageFilters = { cat: 'all', cert: [] };
  document.querySelectorAll('[name="brand-cat"]').forEach(function(r){ r.checked = r.value === 'all'; });
  document.querySelectorAll('#brand-country-filters input').forEach(function(c){ c.checked = false; });
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
  const {data} = await sb.from('profiles').select('*').eq('user_type','Manufacturer / Brand').order('created_at',{ascending:false});
  const grid = document.getElementById('mfgGrid');
  if(data && data.length){
    grid.innerHTML = data.map(b=>`
      <div class="profile-card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:48px;height:48px;border-radius:10px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:900;flex-shrink:0">${(b.company||b.full_name||'B').substring(0,3).toUpperCase()}</div>
          <div>
            <div class="profile-name">${b.company||b.full_name||'Brand'}</div>
            <div class="profile-type">${b.country||'—'} · Manufacturer</div>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn-profile-primary" onclick="showPage('products')">View Products</button>
          <button class="btn-profile-sec" onclick="openReq(null)">Contact</button>
        </div>
      </div>`).join('');
  } else {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px">
      <div style="font-size:40px;margin-bottom:12px">🏭</div>
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Manufacturers joining soon</div>
      <div style="font-size:12px;color:var(--muted)">European brands are being onboarded to Archspex</div>
    </div>`;
  }
  document.getElementById('cataloguesGrid').innerHTML = '';
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
function renderProjects(){
  document.getElementById('projectsGrid').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px">
    <div style="font-size:40px;margin-bottom:12px">🏙</div>
    <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Projects coming soon</div>
    <div style="font-size:12px;color:var(--muted)">UAE & GCC project gallery launching soon</div>
  </div>`;
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
function selectBrandTier(el){
  document.querySelectorAll('#brandModal .tier-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('ba-tier').value = el.dataset.tier;
}

async function submitBrandApplication(){
  const company = document.getElementById('ba-company').value.trim();
  const name = document.getElementById('ba-name').value.trim();
  const email = document.getElementById('ba-email').value.trim();
  const phone = document.getElementById('ba-phone').value.trim();
  const category = document.getElementById('ba-category').value;
  const country = document.getElementById('ba-country').value.trim();
  const message = document.getElementById('ba-message').value.trim();
  const tier = document.getElementById('ba-tier').value;
  const msg = document.getElementById('brandFormMsg');

  if(!company||!name||!email){
    msg.textContent = '⚠ Please fill in company name, contact name and email.';
    msg.style.display = 'block';
    msg.style.background = '#fef2f2';
    msg.style.color = '#dc2626';
    return;
  }

  if(!tier){
    msg.textContent = '⚠ Please select a membership tier.';
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

  btn.textContent = 'Send Application →'; btn.disabled = false;

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
     <p><strong>Membership tier:</strong> ${tier}</p>
     <p><strong>Message:</strong><br>${(message||'—').replace(/\n/g,'<br>')}</p>`
  );
  ['ba-company','ba-name','ba-email','ba-phone','ba-country','ba-message','ba-tier','ba-category'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.querySelectorAll('#brandModal .tier-opt').forEach(o=>o.classList.remove('selected'));
  document.querySelectorAll('#brandModal .form-dd .form-dd-opt.selected').forEach(o=>o.classList.remove('selected'));
  var baCatLabel = document.querySelector('#brandModal .form-dd[data-target="ba-category"] .form-dd-label');
  if(baCatLabel){ baCatLabel.textContent = 'Select main category'; baCatLabel.classList.add('form-dd-placeholder'); }
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

async function submitRFQ(form) {
  const email = getVal(form, 'email') || getVal(form, 'Email');
  if(!email){alert('Please enter your email address.');return;}
  const data = {
    name:         getVal(form,'name') || getVal(form,'Your name'),
    company:      getVal(form,'company') || getVal(form,'Company'),
    email:        email,
    phone:        getVal(form,'phone') || getVal(form,'Phone'),
    project_name: getVal(form,'project') || getVal(form,'Project'),
    project_type: getSelect(form, 0),
    category:     getSelect(form, 1) || getSelect(form, 0),
    message:      form.querySelector('textarea')?.value.trim() || ''
  };
  const btn = form.querySelector('.btn-rfq-submit');
  if(btn){btn.textContent='Sending…';btn.disabled=true;}
  try {
    const {error} = await sb.from('rfq_submissions').insert([data]);
    if(error) throw error;
    if(btn){btn.textContent='Sent! ✓';btn.style.background='#059669';}
    setTimeout(()=>{
      if(btn){btn.textContent='Submit RFQ →';btn.style.background='';btn.disabled=false;}
      form.querySelectorAll('input,textarea').forEach(i=>i.value='');
    }, 3000);
  } catch(e) {
    console.error('RFQ error:',e);
    if(btn){btn.textContent='Submit RFQ →';btn.disabled=false;}
    alert('Something went wrong — ' + e.message);
  }
}

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

