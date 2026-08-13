// ---- Brand profile: EGGER-style redesign (v3) ----
// Overrides window.openBrandProfile with a full light-theme layout matching
// the reference mockup: clean hero card with photo strip, horizontal stats
// bar, tab-underline nav, About with Read-more, Browse by Type pills,
// Featured Products, Projects, Specification Resources, Brand Resources
// and GCC Presence panel with map.
(function(){
  var STYLE_ID = 'bp3-styles';
  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = ''
      + '#page-brandprofile{background:#f7f8fb}'
      + '#page-brandprofile .bp3-wrap{max-width:1180px;margin:0 auto;padding:0 32px}'
      + '#page-brandprofile .bp3-hero{background:#fff;border-bottom:1px solid #eceff5}'
      + '#page-brandprofile .bp3-backbar{background:#fff;border-bottom:1px solid #eceff5}'
      + '#page-brandprofile .bp3-backbar > .bp3-wrap{padding:16px 20px 12px;max-width:none}'
      + '#page-brandprofile .bp3-backbar .bp3-back{padding:0}'
      + '#page-brandprofile .bp3-photo{height:450px;background:#eaeef4 center/cover no-repeat;position:relative}'
      + '#page-brandprofile .bp3-photo::after{content:"";position:absolute;inset:auto 0 0 0;height:40px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.25))}'
      + '#page-brandprofile .bp3-headcard{display:flex;align-items:flex-start;gap:28px;padding:22px 0 26px;flex-wrap:wrap;position:relative}'
      + '#page-brandprofile .bp3-logo{width:129px;height:129px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Fraunces,serif;font-weight:700;font-size:30px;color:var(--navy);box-shadow:0 8px 26px rgba(0,15,40,.16);border:1px solid #edeff5;margin-top:-78px;flex-shrink:0;overflow:hidden}'
      + '#page-brandprofile .bp3-logo img{max-width:78%;max-height:78%;object-fit:contain}'
      + '#page-brandprofile .bp3-title-block{flex:1;min-width:260px;padding-top:2px}'
      + '#page-brandprofile .bp3-name{font-family:Fraunces,serif;font-size:32px;font-weight:400;color:var(--navy);margin:0 0 6px;line-height:1.05;display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-name-text{display:inline-block}'
      + '#page-brandprofile .bp3-tag{font-size:13px;color:var(--muted);margin:0 0 10px;line-height:1.5;max-width:420px}'
      + '#page-brandprofile .bp3-loc{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:#4b5566}'
      + '#page-brandprofile .bp3-flag{display:inline-flex;align-items:center;justify-content:center;width:18px;height:12px;border-radius:2px;background:#ccc;overflow:hidden;vertical-align:middle;box-shadow:0 0 0 1px rgba(0,0,0,.06) inset}'
      + '#page-brandprofile .bp3-flag svg,#page-brandprofile .bp3-flag img{width:100%;height:100%;display:block;object-fit:cover}'
      + '#page-brandprofile .bp3-cta{display:flex;flex-direction:column;gap:8px;align-items:flex-end;min-width:210px}'
      + '#page-brandprofile .bp3-btn-primary{background:var(--navy);color:#fff;font-size:12px;font-weight:700;padding:11px 22px;border-radius:8px;border:none;cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:190px;transition:background .15s;text-decoration:none}'
      + '#page-brandprofile .bp3-btn-primary:hover{background:#001a3d}'
      + '#page-brandprofile .bp3-btn-outline{background:#fff;color:var(--navy);font-size:12px;font-weight:700;padding:10px 22px;border-radius:8px;border:1px solid var(--navy);cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:190px;transition:background .15s;text-decoration:none}'
      + '#page-brandprofile .bp3-btn-outline:hover{background:#f2f5fa}'
      + '#page-brandprofile .bp3-iconrow{display:flex;gap:16px;margin-top:2px}'
      + '#page-brandprofile .bp3-ibtn{background:none;border:none;font-size:11px;font-weight:600;color:#4b5566;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:4px 0;font-family:Manrope,sans-serif}'
      + '#page-brandprofile .bp3-ibtn:hover{color:var(--navy)}'
      + '#page-brandprofile .bp3-stats{display:grid;grid-template-columns:repeat(6,1fr);background:#fff;border:1px solid #eceff5;border-radius:14px;overflow:hidden;margin:0 0 6px;box-shadow:0 1px 3px rgba(0,15,40,.03)}'
      + '#page-brandprofile .bp3-stat{padding:16px 18px;border-right:1px solid #eceff5;display:flex;flex-direction:column;gap:2px}'
      + '#page-brandprofile .bp3-stat:last-child{border-right:none}'
      + '#page-brandprofile .bp3-stat-ic{width:22px;height:22px;color:var(--navy);margin-bottom:6px}'
      + '#page-brandprofile .bp3-stat-lbl{font-size:10px;font-weight:700;color:#7a8496;text-transform:uppercase;letter-spacing:.6px}'
      + '#page-brandprofile .bp3-stat-val{font-size:14px;font-weight:700;color:var(--navy);margin-top:2px;line-height:1.25}'
      + '#page-brandprofile .bp3-stat-val small{font-size:11px;font-weight:600;color:#4b5566;display:block;line-height:1.35}'
      + '#page-brandprofile .bp3-tabs{background:#fff;border-bottom:1px solid #eceff5}'
      + '#page-brandprofile .bp3-tabs-inner{display:flex;gap:28px;overflow:auto;padding:2px 0}'
      + '#page-brandprofile .bp3-tab{position:relative;padding:14px 2px 14px;font-size:13px;font-weight:600;color:#7a8496;cursor:pointer;background:none;border:none;font-family:Manrope,sans-serif;white-space:nowrap;transition:color .15s}'
      + '#page-brandprofile .bp3-tab:hover{color:var(--navy)}'
      + '#page-brandprofile .bp3-tab.active{color:var(--navy)}'
      + '#page-brandprofile .bp3-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--navy);border-radius:2px}'
      + '#page-brandprofile .bp3-section{background:#fff;padding:34px 0;border-bottom:1px solid #eceff5}'
      + '#page-brandprofile .bp3-h2{font-family:Fraunces,serif;font-size:22px;font-weight:400;color:var(--navy);margin:0 0 6px}'
      + '#page-brandprofile .bp3-secthead{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:22px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-viewall{font-size:12px;font-weight:600;color:var(--navy);text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:opacity .15s}'
      + '#page-brandprofile .bp3-viewall:hover{opacity:.7}'
      + '#page-brandprofile .bp3-about-p{font-size:14px;color:#374050;line-height:1.75;margin:0 0 12px;max-width:820px}'
      + '#page-brandprofile .bp3-readmore{font-size:12px;font-weight:600;color:var(--navy);background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:Manrope,sans-serif}'
      + '#page-brandprofile .bp3-pills{display:flex;gap:8px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-pill{padding:8px 14px;border-radius:100px;font-size:12px;font-weight:600;background:#fff;border:1px solid #e2e6ef;color:#4b5566;cursor:pointer;font-family:Manrope,sans-serif;transition:background .15s,color .15s,border-color .15s;white-space:nowrap}'
      + '#page-brandprofile .bp3-pill:hover{border-color:var(--navy);color:var(--navy)}'
      + '#page-brandprofile .bp3-pill.active{background:var(--navy);color:#fff;border-color:var(--navy)}'
      + '#page-brandprofile .bp3-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}'
      + '#page-brandprofile .bp3-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}'
      + '#page-brandprofile .bp3-grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}'
      + '#page-brandprofile .bp3-prodcard{background:#fff;border:1px solid #eceff5;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s}'
      + '#page-brandprofile .bp3-prodcard:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,15,40,.10)}'
      + '#page-brandprofile .bp3-prodimg{width:100%;height:130px;background:#eef1f6 center/cover no-repeat}'
      + '#page-brandprofile .bp3-prodbody{padding:12px 14px 14px}'
      + '#page-brandprofile .bp3-prodname{font-size:13px;font-weight:700;color:var(--navy);margin:0 0 2px;line-height:1.3}'
      + '#page-brandprofile .bp3-prodsub{font-size:11px;color:#7a8496;font-weight:600}'
      + '#page-brandprofile .bp3-projcard{background:#fff;border:1px solid #eceff5;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s}'
      + '#page-brandprofile .bp3-projcard:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,15,40,.10)}'
      + '#page-brandprofile .bp3-projimg{width:100%;height:150px;background:#eef1f6 center/cover no-repeat}'
      + '#page-brandprofile .bp3-projbody{padding:14px 16px}'
      + '#page-brandprofile .bp3-projname{font-size:13px;font-weight:700;color:var(--navy);margin:0 0 3px}'
      + '#page-brandprofile .bp3-projloc{font-size:11px;color:#7a8496;font-weight:600}'
      + '#page-brandprofile .bp3-res-tile{background:#fff;border:1px solid #eceff5;border-radius:12px;padding:18px 16px;text-align:left;cursor:pointer;transition:transform .15s,box-shadow .15s,border-color .15s}'
      + '#page-brandprofile .bp3-res-tile:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,15,40,.10);border-color:#dde3ee}'
      + '#page-brandprofile .bp3-res-ic{width:34px;height:34px;border-radius:9px;background:rgba(0,51,102,.06);color:var(--navy);display:flex;align-items:center;justify-content:center;margin-bottom:12px}'
      + '#page-brandprofile .bp3-res-name{font-size:13px;font-weight:700;color:var(--navy);margin:0 0 2px}'
      + '#page-brandprofile .bp3-res-sub{font-size:11px;color:#7a8496;font-weight:600}'
      + '#page-brandprofile .bp3-gcc{background:#f2f5fa;border:1px solid #e2e6ef;border-radius:16px;padding:28px 36px;display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;position:relative;overflow:hidden}'
      + '#page-brandprofile .bp3-gcc-h{font-family:Fraunces,serif;font-size:20px;font-weight:600;color:var(--navy);margin:0 0 18px}'
      + '#page-brandprofile .bp3-gcc-country{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:10px 0;font-size:12px}'
      + '#page-brandprofile .bp3-gcc-flag{width:28px;height:20px;border-radius:4px;overflow:hidden;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,15,40,.10);display:inline-flex;align-items:center;justify-content:center;background:#eef1f6}'
      + '#page-brandprofile .bp3-gcc-flag svg,#page-brandprofile .bp3-gcc-flag img{width:100%;height:100%;display:block;object-fit:cover}'
      + '#page-brandprofile .bp3-gcc-country-name{font-weight:600;color:var(--navy);font-size:12.5px}'
      + '#page-brandprofile .bp3-gcc-country-status{font-size:11px;color:#7a8496;font-weight:600}'
      + '#page-brandprofile .bp3-gcc-right{position:relative;z-index:1}'
      + '#page-brandprofile .bp3-gcc-detail{padding:10px 0;position:relative}'
      + '#page-brandprofile .bp3-gcc-detail-lbl{font-size:12px;font-weight:700;color:var(--navy);margin:0 0 3px}'
      + '#page-brandprofile .bp3-gcc-detail-val{font-size:12px;color:#4b5566;font-weight:500;line-height:1.5}'
      + '#page-brandprofile .bp3-gcc-map{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:220px;height:290px;opacity:.32;pointer-events:none;color:var(--navy);z-index:0}'
      + '#page-brandprofile .bp3-gcc-cta{grid-column:1/-1;display:flex;justify-content:center;margin-top:8px;padding-top:16px;border-top:1px solid #e2e6ef}'
      + '#page-brandprofile .bp3-gcc-cta button{background:#fff;color:var(--navy);border:1px solid var(--navy);min-width:280px;padding:12px 26px;border-radius:8px;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s,color .15s}'
      + '#page-brandprofile .bp3-gcc-cta button:hover{background:var(--navy);color:#fff}'
      + '#page-brandprofile .bp3-back{background:transparent !important;border:none !important;box-shadow:none !important;border-radius:0 !important;outline:none;color:var(--navy);font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:Manrope,sans-serif;padding:0;transition:color .15s,transform .15s}'
      + '#page-brandprofile .bp3-back:hover{color:var(--gold);transform:translateX(-2px)}'
      + '#page-brandprofile .bp3-back svg{width:13px;height:13px;flex-shrink:0}'
      + '#page-brandprofile .bp3-partner-pill{display:inline-flex;align-items:center;gap:6px;font-family:Manrope,sans-serif;font-size:11px;font-weight:800;color:var(--navy);background:var(--gold);padding:6px 14px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;line-height:1;box-shadow:0 2px 8px rgba(201,168,76,.25)}'
      + '#page-brandprofile .bp3-partner-pill svg{width:11px;height:11px}'
      + '@media(max-width:900px){#page-brandprofile .bp3-stats{grid-template-columns:repeat(3,1fr)}#page-brandprofile .bp3-stat:nth-child(3){border-right:none}#page-brandprofile .bp3-grid4{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-grid5{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-grid3{grid-template-columns:1fr}#page-brandprofile .bp3-gcc{grid-template-columns:1fr}#page-brandprofile .bp3-cta{align-items:stretch;width:100%}}'
      + '@media(max-width:560px){#page-brandprofile .bp3-stats{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-name{font-size:26px}}';
    document.head.appendChild(st);
  }

  // ─── ICON HELPERS ─────────────────────────────────────────────────
  function ico(path, size){
    size = size || 22;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="'+size+'" height="'+size+'">'+path+'</svg>';
  }
  var ICONS = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    bag:      '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    grid:     '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    globe:    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    check:    '<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    share:    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    ext:      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    msg:      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    back:     '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    bim:      '<path d="M12 2L2 7v10l10 5 10-5V7z"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="2" y1="7" x2="12" y2="12"/><line x1="22" y1="7" x2="12" y2="12"/>',
    cad:      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    doc:      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
    cert:     '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    guide:    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    catalogue:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    company:  '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h1M9 12h1M9 15h1M14 9h1M14 12h1M14 15h1"/>',
    video:    '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
    folder:   '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'
  };
  function icon(name, size){ return ico(ICONS[name]||'', size||16); }

  // ─── FLAG HELPERS ────────────────────────────────────────────────
  var FLAGS = {
    'united arab emirates':['#00732F','#fff','#000','#CE1126'],
    'uae':['#00732F','#fff','#000','#CE1126'],
    'saudi arabia':['#006C35','#006C35','#006C35','#fff'],
    'ksa':['#006C35','#006C35','#006C35','#fff'],
    'qatar':['#8A1538','#fff','#8A1538','#8A1538'],
    'oman':['#DB161B','#fff','#008000','#DB161B'],
    'kuwait':['#007A3D','#fff','#CE1126','#000'],
    'bahrain':['#fff','#CE1126','#CE1126','#CE1126'],
    'austria':['#ED2939','#fff','#ED2939','#ED2939'],
    'germany':['#000','#DD0000','#FFCE00','#FFCE00'],
    'italy':['#009246','#fff','#CE2B37','#CE2B37'],
    'france':['#0055A4','#fff','#EF4135','#EF4135'],
    'usa':['#3C3B6E','#B22234','#fff','#B22234'],
    'united kingdom':['#012169','#fff','#C8102E','#012169'],
    'uk':['#012169','#fff','#C8102E','#012169'],
    'luxembourg':['#ED2939','#fff','#00A1DE','#00A1DE'],
    'china':['#DE2910','#DE2910','#DE2910','#FFDE00'],
    'spain':['#AA151B','#F1BF00','#F1BF00','#AA151B'],
    'turkey':['#E30A17','#E30A17','#E30A17','#fff']
  };
  // ─── COUNTRY → ISO 3166-1 alpha-2 lookup ────────────────────────
  // Fed into https://flagcdn.com/{code}.svg for perfect-fidelity flag rendering.
  var COUNTRY_ISO = {
    // GCC + Middle East
    'united arab emirates':'ae','uae':'ae','emirates':'ae',
    'saudi arabia':'sa','ksa':'sa','saudi':'sa',
    'qatar':'qa','oman':'om','kuwait':'kw','bahrain':'bh',
    'egypt':'eg','jordan':'jo','iraq':'iq','iran':'ir',
    'lebanon':'lb','syria':'sy','yemen':'ye','israel':'il',
    'palestine':'ps','turkey':'tr','turkiye':'tr',
    // Europe
    'united kingdom':'gb','uk':'gb','britain':'gb','great britain':'gb','england':'gb','scotland':'gb',
    'ireland':'ie','france':'fr','germany':'de','italy':'it','spain':'es',
    'portugal':'pt','netherlands':'nl','holland':'nl','belgium':'be',
    'luxembourg':'lu','switzerland':'ch','austria':'at','denmark':'dk',
    'sweden':'se','norway':'no','finland':'fi','iceland':'is',
    'poland':'pl','czech republic':'cz','czechia':'cz','slovakia':'sk',
    'hungary':'hu','romania':'ro','bulgaria':'bg','greece':'gr',
    'ukraine':'ua','russia':'ru','belarus':'by','estonia':'ee',
    'latvia':'lv','lithuania':'lt','slovenia':'si','croatia':'hr',
    'serbia':'rs','bosnia':'ba','bosnia and herzegovina':'ba',
    'montenegro':'me','north macedonia':'mk','macedonia':'mk',
    'albania':'al','moldova':'md','cyprus':'cy','malta':'mt',
    'monaco':'mc','andorra':'ad','san marino':'sm','vatican':'va','liechtenstein':'li',
    // Americas
    'united states':'us','usa':'us','united states of america':'us','america':'us',
    'canada':'ca','mexico':'mx','brazil':'br','argentina':'ar',
    'chile':'cl','peru':'pe','colombia':'co','venezuela':'ve',
    'ecuador':'ec','bolivia':'bo','uruguay':'uy','paraguay':'py',
    'guatemala':'gt','honduras':'hn','panama':'pa','costa rica':'cr',
    'nicaragua':'ni','el salvador':'sv','cuba':'cu','jamaica':'jm',
    'dominican republic':'do','haiti':'ht','puerto rico':'pr',
    // Asia
    'china':'cn','japan':'jp','south korea':'kr','korea':'kr','north korea':'kp',
    'india':'in','pakistan':'pk','bangladesh':'bd','sri lanka':'lk',
    'nepal':'np','bhutan':'bt','maldives':'mv','afghanistan':'af',
    'thailand':'th','vietnam':'vn','philippines':'ph','indonesia':'id',
    'malaysia':'my','singapore':'sg','myanmar':'mm','burma':'mm',
    'cambodia':'kh','laos':'la','mongolia':'mn','taiwan':'tw',
    'hong kong':'hk','macau':'mo','macao':'mo',
    'kazakhstan':'kz','uzbekistan':'uz','turkmenistan':'tm',
    'tajikistan':'tj','kyrgyzstan':'kg','azerbaijan':'az','armenia':'am','georgia':'ge',
    // Africa
    'south africa':'za','nigeria':'ng','kenya':'ke','ethiopia':'et',
    'morocco':'ma','algeria':'dz','tunisia':'tn','libya':'ly',
    'sudan':'sd','south sudan':'ss','ghana':'gh','tanzania':'tz',
    'uganda':'ug','rwanda':'rw','angola':'ao','mozambique':'mz',
    'zimbabwe':'zw','zambia':'zm','botswana':'bw','namibia':'na',
    'senegal':'sn','ivory coast':"ci",'cote d\'ivoire':'ci','mali':'ml',
    'somalia':'so','madagascar':'mg','cameroon':'cm','congo':'cg',
    'democratic republic of the congo':'cd','drc':'cd',
    // Oceania
    'australia':'au','new zealand':'nz','fiji':'fj','papua new guinea':'pg'
  };
  function isoCode(country){
    if(!country) return '';
    var k = String(country).toLowerCase().trim();
    return COUNTRY_ISO[k] || '';
  }
  function cdnFlag(country, size){
    var iso = isoCode(country);
    if(!iso) return '';
    // Use PNG endpoint with explicit width for reliable rendering (SVGs from
    // flagcdn sometimes lack a fixed viewBox and misalign inside object-fit:cover).
    var w = size || 80;
    return '<img src="https://flagcdn.com/w'+w+'/'+iso+'.png" srcset="https://flagcdn.com/w'+(w*2)+'/'+iso+'.png 2x" alt="'+country+'" loading="lazy">';
  }

  function flag(country){
    if(!country) return '';
    var key = String(country).toLowerCase().trim();
    var cdn = cdnFlag(country);
    if(cdn){
      return '<span class="bp3-flag" title="'+country+'">'+cdn+'</span>';
    }
    // Offline fallback — hand-drawn SVG if present
    var svg = FLAG_SVG[key];
    if(svg){
      return '<span class="bp3-flag" title="'+country+'">'+svg+'</span>';
    }
    // Last resort tri-band gradient
    var c = FLAGS[key] || ['#c8ccd4','#e0e3ea','#c8ccd4','#c8ccd4'];
    return '<span class="bp3-flag" title="'+country+'" style="background:linear-gradient(to bottom,'+c[0]+' 33%,'+c[1]+' 33% 66%,'+c[2]+' 66%)"></span>';
  }
  // Circular flag icon for the GCC Presence list — proper SVG per-country flags.
  // ViewBox is 20×20 (square) so `width:100%;height:100%` fills the round wrapper
  // with no letter-boxing or slice-crop; each flag design is drawn to work at 1:1.
  var FLAG_SVG = {
    'united arab emirates': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="5" y="0"  width="15" height="6.67" fill="#00732F"/>'
      + '<rect x="5" y="6.67" width="15" height="6.66" fill="#fff"/>'
      + '<rect x="5" y="13.33" width="15" height="6.67" fill="#000"/>'
      + '<rect x="0" y="0"  width="5"  height="20"   fill="#CE1126"/></svg>',
    'saudi arabia': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#006C35"/>'
      + '<rect x="3" y="12" width="14" height="1" fill="#fff"/></svg>',
    'qatar': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#8A1538"/>'
      + '<polygon fill="#fff" points="0,0 5,0 7,2 5,4 7,6 5,8 7,10 5,12 7,14 5,16 7,18 5,20 0,20"/></svg>',
    'oman': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="5" y="0"     width="15" height="6.67" fill="#fff"/>'
      + '<rect x="5" y="6.67"  width="15" height="6.66" fill="#DB161B"/>'
      + '<rect x="5" y="13.33" width="15" height="6.67" fill="#008000"/>'
      + '<rect x="0" y="0"     width="5"  height="20"   fill="#DB161B"/></svg>',
    'kuwait': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0"     width="20" height="6.67" fill="#007A3D"/>'
      + '<rect x="0" y="6.67"  width="20" height="6.66" fill="#fff"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#CE1126"/>'
      + '<polygon points="0,0 6,5 6,15 0,20" fill="#000"/></svg>',
    'bahrain': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#CE1126"/>'
      + '<polygon fill="#fff" points="0,0 5,0 3,2 5,4 3,6 5,8 3,10 5,12 3,14 5,16 3,18 5,20 0,20"/></svg>',
    // ─── Non-GCC countries (used for the small location flag on the brand hero) ───
    'denmark': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#C60C30"/>'
      + '<rect x="6.5" y="0" width="3" height="20" fill="#fff"/>'
      + '<rect x="0" y="8.5" width="20" height="3" fill="#fff"/></svg>',
    'spain': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="5" fill="#AA151B"/>'
      + '<rect x="0" y="5" width="20" height="10" fill="#F1BF00"/>'
      + '<rect x="0" y="15" width="20" height="5" fill="#AA151B"/></svg>',
    'austria': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="6.67" fill="#ED2939"/>'
      + '<rect x="0" y="6.67" width="20" height="6.66" fill="#fff"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#ED2939"/></svg>',
    'germany': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="6.67" fill="#000"/>'
      + '<rect x="0" y="6.67" width="20" height="6.66" fill="#DD0000"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#FFCE00"/></svg>',
    'italy': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="6.67" height="20" fill="#009246"/>'
      + '<rect x="6.67" y="0" width="6.66" height="20" fill="#fff"/>'
      + '<rect x="13.33" y="0" width="6.67" height="20" fill="#CE2B37"/></svg>',
    'france': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="6.67" height="20" fill="#0055A4"/>'
      + '<rect x="6.67" y="0" width="6.66" height="20" fill="#fff"/>'
      + '<rect x="13.33" y="0" width="6.67" height="20" fill="#EF4135"/></svg>',
    'usa': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<rect x="0" y="0"     width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="3.08"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="6.16"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="9.24"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="12.32" width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="15.4"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="18.48" width="20" height="1.52" fill="#B22234"/>'
      + '<rect x="0" y="0" width="8" height="10.78" fill="#3C3B6E"/></svg>',
    'united states': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<rect x="0" y="0"     width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="3.08"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="6.16"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="9.24"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="12.32" width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="15.4"  width="20" height="1.55" fill="#B22234"/>'
      + '<rect x="0" y="18.48" width="20" height="1.52" fill="#B22234"/>'
      + '<rect x="0" y="0" width="8" height="10.78" fill="#3C3B6E"/></svg>',
    'united kingdom': '<svg viewBox="0 0 60 30" preserveAspectRatio="none">'
      + '<rect width="60" height="30" fill="#012169"/>'
      + '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>'
      + '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2.5"/>'
      + '<rect x="26" y="0" width="8" height="30" fill="#fff"/>'
      + '<rect x="0" y="11" width="60" height="8" fill="#fff"/>'
      + '<rect x="28" y="0" width="4" height="30" fill="#C8102E"/>'
      + '<rect x="0" y="13" width="60" height="4" fill="#C8102E"/></svg>',
    'uk': '<svg viewBox="0 0 60 30" preserveAspectRatio="none">'
      + '<rect width="60" height="30" fill="#012169"/>'
      + '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>'
      + '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2.5"/>'
      + '<rect x="26" y="0" width="8" height="30" fill="#fff"/>'
      + '<rect x="0" y="11" width="60" height="8" fill="#fff"/>'
      + '<rect x="28" y="0" width="4" height="30" fill="#C8102E"/>'
      + '<rect x="0" y="13" width="60" height="4" fill="#C8102E"/></svg>',
    'luxembourg': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="6.67" fill="#ED2939"/>'
      + '<rect x="0" y="6.67" width="20" height="6.66" fill="#fff"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#00A1DE"/></svg>',
    'finland': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<rect x="6" y="0" width="4" height="20" fill="#003580"/>'
      + '<rect x="0" y="8" width="20" height="4" fill="#003580"/></svg>',
    'sweden': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#006AA7"/>'
      + '<rect x="6" y="0" width="4" height="20" fill="#FECC00"/>'
      + '<rect x="0" y="8" width="20" height="4" fill="#FECC00"/></svg>',
    'norway': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#BA0C2F"/>'
      + '<rect x="6" y="0" width="4" height="20" fill="#fff"/>'
      + '<rect x="0" y="8" width="20" height="4" fill="#fff"/>'
      + '<rect x="7" y="0" width="2" height="20" fill="#00205B"/>'
      + '<rect x="0" y="9" width="20" height="2" fill="#00205B"/></svg>',
    'netherlands': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="6.67" fill="#AE1C28"/>'
      + '<rect x="0" y="6.67" width="20" height="6.66" fill="#fff"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#21468B"/></svg>',
    'belgium': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="6.67" height="20" fill="#000"/>'
      + '<rect x="6.67" y="0" width="6.66" height="20" fill="#FDDA24"/>'
      + '<rect x="13.33" y="0" width="6.67" height="20" fill="#EF3340"/></svg>',
    'switzerland': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#DA291C"/>'
      + '<rect x="8" y="4" width="4" height="12" fill="#fff"/>'
      + '<rect x="4" y="8" width="12" height="4" fill="#fff"/></svg>',
    'china': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#DE2910"/>'
      + '<polygon fill="#FFDE00" points="5,4 5.9,6.8 8.9,6.8 6.5,8.6 7.4,11.5 5,9.7 2.6,11.5 3.5,8.6 1.1,6.8 4.1,6.8"/></svg>',
    'turkey': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#E30A17"/>'
      + '<circle cx="7.5" cy="10" r="3.2" fill="#fff"/>'
      + '<circle cx="8.6" cy="10" r="2.7" fill="#E30A17"/></svg>',
    'japan': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<circle cx="10" cy="10" r="6" fill="#BC002D"/></svg>',
    'south korea': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<circle cx="10" cy="10" r="4" fill="#CD2E3A"/>'
      + '<path d="M10,6 A2,2 0 0 1 10,10 A2,2 0 0 0 10,14 A4,4 0 0 1 10,6 Z" fill="#0047A0"/></svg>',
    'india': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="20" height="6.67" fill="#FF9933"/>'
      + '<rect x="0" y="6.67" width="20" height="6.66" fill="#fff"/>'
      + '<rect x="0" y="13.33" width="20" height="6.67" fill="#138808"/>'
      + '<circle cx="10" cy="10" r="1.7" fill="none" stroke="#000080" stroke-width=".6"/></svg>',
    'brazil': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#009C3B"/>'
      + '<polygon fill="#FFDF00" points="10,3 17,10 10,17 3,10"/>'
      + '<circle cx="10" cy="10" r="2.5" fill="#002776"/></svg>',
    'canada': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="5" height="20" fill="#D80621"/>'
      + '<rect x="5" y="0" width="10" height="20" fill="#fff"/>'
      + '<rect x="15" y="0" width="5" height="20" fill="#D80621"/>'
      + '<path fill="#D80621" d="M10,5 L10.6,7.2 L12.6,6.6 L11.5,8.6 L13,10 L10.9,10.4 L11.2,12.3 L10,11.4 L8.8,12.3 L9.1,10.4 L7,10 L8.5,8.6 L7.4,6.6 L9.4,7.2 Z"/></svg>',
    'australia': '<svg viewBox="0 0 60 30" preserveAspectRatio="none">'
      + '<rect width="60" height="30" fill="#012169"/>'
      + '<path d="M0,0 L30,15 M30,0 L0,15" stroke="#fff" stroke-width="3"/>'
      + '<path d="M0,0 L30,15 M30,0 L0,15" stroke="#C8102E" stroke-width="1.4"/>'
      + '<rect x="13" y="0" width="4" height="15" fill="#fff"/>'
      + '<rect x="0" y="5.5" width="30" height="4" fill="#fff"/>'
      + '<rect x="14" y="0" width="2" height="15" fill="#C8102E"/>'
      + '<rect x="0" y="6.5" width="30" height="2" fill="#C8102E"/></svg>',
    'portugal': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect x="0" y="0" width="8" height="20" fill="#006600"/>'
      + '<rect x="8" y="0" width="12" height="20" fill="#FF0000"/></svg>',
    'greece': '<svg viewBox="0 0 20 20" preserveAspectRatio="none">'
      + '<rect width="20" height="20" fill="#fff"/>'
      + '<rect x="0" y="0"    width="20" height="2.22" fill="#0D5EAF"/>'
      + '<rect x="0" y="4.44" width="20" height="2.22" fill="#0D5EAF"/>'
      + '<rect x="0" y="8.88" width="8"  height="2.22" fill="#0D5EAF"/>'
      + '<rect x="0" y="13.32" width="20" height="2.22" fill="#0D5EAF"/>'
      + '<rect x="0" y="17.76" width="20" height="2.24" fill="#0D5EAF"/>'
      + '<rect x="0" y="0"    width="8"  height="11.1" fill="#0D5EAF"/>'
      + '<rect x="3" y="0"    width="2"  height="11.1" fill="#fff"/>'
      + '<rect x="0" y="4.44" width="8"  height="2.22" fill="#fff"/></svg>'
  };
  function flagCircle(country){
    if(!country) return '<span class="bp3-gcc-flag"></span>';
    var key = String(country).toLowerCase().trim();
    var cdn = cdnFlag(country);
    if(cdn){
      return '<span class="bp3-gcc-flag" title="'+country+'">'+cdn+'</span>';
    }
    // Offline fallback — inline SVG
    var svg = FLAG_SVG[key];
    if(svg){
      return '<span class="bp3-gcc-flag" title="'+country+'">'+svg+'</span>';
    }
    var c = FLAGS[key] || ['#c8ccd4','#e0e3ea','#c8ccd4','#c8ccd4'];
    return '<span class="bp3-gcc-flag" title="'+country+'" style="background:linear-gradient(to bottom,'+c[0]+' 33%,'+c[1]+' 33% 66%,'+c[2]+' 66%)"></span>';
  }

  // ─── PLACEHOLDER IMAGES ──────────────────────────────────────────
  var STOCK_HEROS = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80'
  ];
  var STOCK_PROJ = [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=900&q=80'
  ];
  function pickPhoto(list, seed){
    var i = 0;
    var s = String(seed||'').split('');
    for(var k=0;k<s.length;k++) i = (i + s[k].charCodeAt(0)) % list.length;
    return list[i];
  }

  // ─── PRODUCT TYPES (derived from products list) ─────────────────
  function deriveTypes(list){
    var m = {};
    (list||[]).forEach(function(p){
      var t = p.subtype || p.type || p.category || 'General';
      m[t] = (m[t]||0) + 1;
    });
    var arr = Object.keys(m).map(function(k){ return {name:k, count:m[k]}; });
    arr.sort(function(a,b){ return b.count - a.count; });
    return arr;
  }

  // ─── GCC AVAILABILITY (best-effort from brand data) ─────────────
  function deriveGcc(brand){
    var gcc = ['United Arab Emirates','Saudi Arabia','Qatar','Oman','Kuwait'];
    // Some accounts store availability as brand.gcc_countries or brand.markets
    var have = (brand.gcc_countries || brand.markets || brand.availability || []);
    if(typeof have === 'string') have = have.split(/[,;]/).map(function(s){return s.trim();});
    var haveL = have.map(function(s){ return String(s).toLowerCase(); });
    return gcc.map(function(c){
      var l = c.toLowerCase();
      var short = c==='United Arab Emirates'?'UAE':c==='Saudi Arabia'?'Saudi Arabia':c;
      var status = 'Available';
      if(!haveL.length){
        // no data: assume all Available except UAE (defaults to Local Stock for GCC-based brands)
        if(l==='united arab emirates') status = 'Local Stock';
      } else {
        if(haveL.indexOf(l) === -1) status = 'On Request';
        else if(l==='united arab emirates') status = 'Local Stock';
      }
      return {country:c, short:short, status:status};
    });
  }

  // ─── PRODUCT CARDS RENDER ────────────────────────────────────────
  // Delegate to ax2.js's own prodCard() when available so we get real images,
  // brand chips, save/compare buttons, etc.  Fallback to a slim inline card.
  function renderProdCard(p){
    if(typeof prodCard === 'function'){
      try { return prodCard(p); } catch(e){ /* fall through */ }
    }
    var img = p.image_url || p.img || (p.images && p.images[0]) || '';
    var name = p.name || p.product_name || 'Product';
    var sub = p.subtype || p.series || p.collection || p.type || p.category || '';
    return '<div class="bp3-prodcard" onclick="if(typeof openProduct===\'function\')openProduct(&quot;'+String(p.id).replace(/"/g,'&quot;')+'&quot;)">'
      + (img ? '<div class="bp3-prodimg" style="background-image:url(\''+img+'\')"></div>' : '<div class="bp3-prodimg"></div>')
      + '<div class="bp3-prodbody">'
        + '<div class="bp3-prodname">'+name+'</div>'
        + (sub ? '<div class="bp3-prodsub">'+sub+'</div>' : '')
      + '</div>'
    + '</div>';
  }

  function renderProjCard(name, loc, img){
    return '<div class="bp3-projcard">'
      + '<div class="bp3-projimg" style="background-image:url(\''+img+'\')"></div>'
      + '<div class="bp3-projbody">'
        + '<div class="bp3-projname">'+name+'</div>'
        + '<div class="bp3-projloc">'+loc+'</div>'
      + '</div>'
    + '</div>';
  }

  function renderResTile(iconName, name, sub){
    return '<div class="bp3-res-tile">'
      + '<div class="bp3-res-ic">'+icon(iconName, 20)+'</div>'
      + '<div class="bp3-res-name">'+name+'</div>'
      + '<div class="bp3-res-sub">'+sub+'</div>'
    + '</div>';
  }

  // ─── MAIN RENDERER ───────────────────────────────────────────────
  window.openBrandProfile = async function(id){
    injectStyles();
    if(typeof sb === 'undefined'){ console.warn('openBrandProfile: supabase not ready'); return; }
    var brand=null, prods=[];
    try {
      var r1 = await sb.from('manufacturers').select('*').eq('id',id).single();
      brand = r1.data;
      if(!brand){ console.warn('brand not found id='+id); return; }
      var r2 = await sb.from('products').select('*').eq('brand', brand.name).eq('status','approved');
      prods = r2.data || [];
    } catch(e){ console.warn('openBrandProfile fetch', e); return; }

    window._bpProds = prods;

    var page = document.getElementById('page-brandprofile');
    if(!page){
      page = document.createElement('div');
      page.id = 'page-brandprofile';
      page.style.display = 'none';
      var ref = document.getElementById('page-manufacturers');
      if(ref) ref.insertAdjacentElement('afterend', page);
      else document.body.appendChild(page);
    }

    var name = brand.name || 'Brand';
    var country = brand.country || '';
    var city = brand.city || '';
    var loc = [city, country].filter(Boolean).join(', ');
    var tagline = brand.tagline || brand.slogan || (brand.categories && brand.categories.length ? brand.categories[0] + ' for better living.' : '');
    var founded = brand.founded || '—';
    var desc = brand.description || 'No description provided yet.';
    var website = brand.website || '';
    var initials = (name.substring(0,2)).toUpperCase();
    // Only use an explicit logo_url field — avoid picking up any generic `logo` field
    // in the DB which may hold placeholder/stock imagery. Fall back to initials.
    var logoImg = (brand.logo_url && String(brand.logo_url).trim()) ? brand.logo_url : '';
    var featured = !!brand.featured;
    var heroPhoto = brand.hero_image || pickPhoto(STOCK_HEROS, name);

    var types = deriveTypes(prods);
    var typeCount = types.length || (brand.categories||[]).length || 0;

    var gcc = deriveGcc(brand);
    var gccAvailShort = gcc.filter(function(c){ return c.status!=='On Request'; })
                          .map(function(c){ return c.short==='Saudi Arabia'?'KSA':c.short; }).slice(0,3).join(', ') || 'On request';

    // ═══ HERO ═══════════════════════════════════════════════════════
    var heroHtml =
      '<div class="bp3-hero">'
        + '<div class="bp3-backbar"><div class="bp3-wrap"><button class="bp3-back" onclick="typeof backToBrands===\'function\'?backToBrands():showPage(\'manufacturers\')">'+icon('back',14)+' Back</button></div></div>'
        + '<div class="bp3-photo" style="background-image:url(\''+heroPhoto+'\')"></div>'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-headcard">'
            + '<div class="bp3-logo">' + (logoImg ? '<img src="'+logoImg+'" alt="'+name+'">' : initials) + '</div>'
            + '<div class="bp3-title-block">'
              + '<h1 class="bp3-name"><span class="bp3-name-text">'+name+'</span>' + (featured ? '<span class="bp3-partner-pill"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279L0 9.306l8.332-1.151z"/></svg>Featured Partner</span>' : '') + '</h1>'
              + (tagline ? '<p class="bp3-tag">'+tagline+'</p>' : '')
              + '<div class="bp3-loc">'+icon('pin',13)+' '+ (loc || '—') +' ' + flag(country) + '</div>'
            + '</div>'
            + '<div class="bp3-cta">'
              + '<button class="bp3-btn-primary" onclick="typeof openReq===\'function\'?openReq(null):null">'+icon('msg',14)+' Request Information</button>'
              + (website ? '<a class="bp3-btn-outline" href="'+website+'" target="_blank" rel="noopener">Visit Website '+icon('ext',13)+'</a>' : '<button class="bp3-btn-outline" disabled style="opacity:.5;cursor:not-allowed">Visit Website '+icon('ext',13)+'</button>')
              + '<div class="bp3-iconrow">'
                + '<button class="bp3-ibtn" onclick="typeof toggleSaveBrand===\'function\'?toggleSaveBrand('+id+'):null">'+icon('bookmark',13)+' Save Brand</button>'
                + '<button class="bp3-ibtn" onclick="typeof shareBrand===\'function\'?shareBrand('+id+'):navigator.clipboard&&navigator.clipboard.writeText(location.href)">'+icon('share',13)+' Share</button>'
              + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ STATS STRIP ════════════════════════════════════════════════
    var statsHtml =
      '<div class="bp3-wrap" style="padding-top:22px">'
        + '<div class="bp3-stats">'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('calendar',22)+'</div><div class="bp3-stat-lbl">Founded</div><div class="bp3-stat-val">'+founded+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('pin',22)+'</div><div class="bp3-stat-lbl">Headquarters</div><div class="bp3-stat-val">'+ (country||'—') +'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('bag',22)+'</div><div class="bp3-stat-lbl">Products</div><div class="bp3-stat-val">'+prods.length+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('grid',22)+'</div><div class="bp3-stat-lbl">Product Types</div><div class="bp3-stat-val">'+typeCount+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('globe',22)+'</div><div class="bp3-stat-lbl">GCC Availability</div><div class="bp3-stat-val"><small>'+gccAvailShort+'</small></div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic" style="color:#0F9D58">'+icon('check',22)+'</div><div class="bp3-stat-lbl">Spec Ready</div><div class="bp3-stat-val">Yes</div></div>'
        + '</div>'
      + '</div>';

    // ═══ TABS ═══════════════════════════════════════════════════════
    var tabDefs = [
      {id:'overview', label:'Overview'},
      {id:'products', label:'Products'},
      {id:'projects', label:'Projects'},
      {id:'resources', label:'Resources'},
      {id:'about', label:'About'},
      {id:'contact', label:'Contact'}
    ];
    var tabsHtml =
      '<div class="bp3-tabs">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-tabs-inner">'
            + tabDefs.map(function(t,i){
              return '<button class="bp3-tab'+(i===0?' active':'')+'" onclick="bp3Tab(this,\''+t.id+'\')">'+t.label+'</button>';
            }).join('')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ ABOUT ══════════════════════════════════════════════════════
    var shortDesc = desc.length > 260 ? desc.substring(0,260) + '…' : desc;
    var aboutHtml =
      '<div class="bp3-section" id="bp3-about-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">About '+name+'</h2>'
          + '<p class="bp3-about-p" id="bp3-about-p" data-full="'+String(desc).replace(/"/g,'&quot;')+'" data-short="'+String(shortDesc).replace(/"/g,'&quot;')+'">'+shortDesc+'</p>'
          + (desc.length > 260 ? '<button class="bp3-readmore" id="bp3-readmore" onclick="bp3ToggleRead(this)">Read more '+icon('arrow',12)+'</button>' : '')
        + '</div>'
      + '</div>';

    // ═══ BROWSE BY TYPE ═════════════════════════════════════════════
    var typePills = [{name:'All Products', count: prods.length, key:''}].concat(types.slice(0,7).map(function(t){ return {name:t.name, count:t.count, key:t.name}; }));
    if(types.length > 7) typePills.push({name:'More ▾', count:'', key:'more'});
    var browseGridInner = prods.length
      ? prods.map(renderProdCard).join('')
      : '<div style="grid-column:1/-1;padding:36px;text-align:center;background:#f7f8fb;border-radius:12px;color:#7a8496;font-size:13px">No products listed yet.</div>';
    var browseHtml =
      '<div class="bp3-section" id="bp3-products-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Browse Products by Type</h2>'
          + '<div class="bp3-pills" style="margin-top:14px">'
            + typePills.map(function(p,i){
              var lbl = p.name + (p.count!=='' ? ' <span style="opacity:.7">('+p.count+')</span>' : '');
              return '<button class="bp3-pill'+(i===0?' active':'')+'" onclick="bp3FilterType(this,\''+String(p.key).replace(/'/g,"\\'")+'\')">'+lbl+'</button>';
            }).join('')
          + '</div>'
          + '<div class="prod-grid" id="bp3-browse-grid" style="margin-top:22px">'+browseGridInner+'</div>'
        + '</div>'
      + '</div>';

    // ═══ FEATURED PRODUCTS ═════════════════════════════════════════
    var featuredList = prods.slice(0,4);
    var featuredHtml =
      '<div class="bp3-section">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-secthead">'
            + '<h2 class="bp3-h2">Featured Products</h2>'
            + '<a class="bp3-viewall" href="#products" onclick="event.preventDefault();typeof showPage===\'function\'?showPage(\'products\'):null">View all products '+icon('arrow',12)+'</a>'
          + '</div>'
          + (featuredList.length
              ? '<div class="bp3-grid4">'+featuredList.map(renderProdCard).join('')+'</div>'
              : '<div style="padding:36px;text-align:center;background:#f7f8fb;border-radius:12px;color:#7a8496;font-size:13px">No products listed yet.</div>')
        + '</div>'
      + '</div>';

    // ═══ PROJECTS ═══════════════════════════════════════════════════
    var projects = brand.projects || [
      {name:'The Royal Atlantis Resort', loc:'Dubai, UAE', img:STOCK_PROJ[0]},
      {name:'KAUST University',          loc:'Thuwal, KSA', img:STOCK_PROJ[1]},
      {name:'Al Maryah Office Tower',    loc:'Abu Dhabi, UAE', img:STOCK_PROJ[2]}
    ];
    var projectsHtml =
      '<div class="bp3-section" id="bp3-projects-section">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-secthead">'
            + '<h2 class="bp3-h2">Projects Using '+name+'</h2>'
            + '<a class="bp3-viewall" href="#projects" onclick="event.preventDefault();typeof showPage===\'function\'?showPage(\'projects\'):null">View all projects '+icon('arrow',12)+'</a>'
          + '</div>'
          + '<div class="bp3-grid3">'+projects.slice(0,3).map(function(p){ return renderProjCard(p.name, p.loc, p.img); }).join('')+'</div>'
        + '</div>'
      + '</div>';

    // ═══ SPECIFICATION RESOURCES ═══════════════════════════════════
    var specResourcesHtml =
      '<div class="bp3-section" id="bp3-resources-section">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-secthead">'
            + '<h2 class="bp3-h2">Specification Resources</h2>'
            + '<a class="bp3-viewall" href="#resources" onclick="event.preventDefault()">View all resources '+icon('arrow',12)+'</a>'
          + '</div>'
          + '<div class="bp3-grid5">'
            + renderResTile('bim',   'BIM Objects',        'Revit, IFC')
            + renderResTile('cad',   'CAD Files',          'DWG, DXF')
            + renderResTile('doc',   'Datasheets',         'Technical Docs')
            + renderResTile('cert',  'Certificates',       'EPD, FSC, PEFC')
            + renderResTile('guide', 'Installation Guides','PDF')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ BRAND RESOURCES ═══════════════════════════════════════════
    var brandResourcesHtml =
      '<div class="bp3-section">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-secthead">'
            + '<h2 class="bp3-h2">Brand Resources</h2>'
            + '<a class="bp3-viewall" href="#brand-resources" onclick="event.preventDefault()">View all resources '+icon('arrow',12)+'</a>'
          + '</div>'
          + '<div class="bp3-grid4">'
            + renderResTile('catalogue','Catalogues',      '18 files')
            + renderResTile('company',  'Company Profile', 'PDF')
            + renderResTile('video',    'Brand Videos',    'Watch now')
            + renderResTile('folder',   'Collections',     '8 collections')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ GCC PRESENCE ══════════════════════════════════════════════
    var gccCountryRows = gcc.map(function(c){
      var short = c.country==='United Arab Emirates' ? 'UAE' : c.country;
      return '<div class="bp3-gcc-country">'
        + flagCircle(c.country)
        + '<span class="bp3-gcc-country-name">'+short+'</span>'
        + '<span class="bp3-gcc-country-status">'+c.status+'</span>'
      + '</div>';
    }).join('');
    // Map removed — hand-drawn outlines weren't reading as the Arabian Peninsula.
    // The country flags + names on the left already convey geographic context; a
    // decorative element can be added later once a proper region SVG is sourced.
    var arabianMap = '';
    var gccHtml =
      '<div class="bp3-section" id="bp3-contact-section" style="border-bottom:none;padding-bottom:60px">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-gcc">'
            + '<div>'
              + '<h3 class="bp3-gcc-h">GCC Presence</h3>'
              + gccCountryRows
            + '</div>'
            + '<div class="bp3-gcc-right">'
              + arabianMap
              + '<div class="bp3-gcc-detail"><div class="bp3-gcc-detail-lbl">Local Partner</div><div class="bp3-gcc-detail-val">'+(brand.local_partner||'Al Ghurair Building Materials')+'</div></div>'
              + '<div class="bp3-gcc-detail"><div class="bp3-gcc-detail-lbl">Samples</div><div class="bp3-gcc-detail-val">Available on request</div></div>'
              + '<div class="bp3-gcc-detail"><div class="bp3-gcc-detail-lbl">Technical Support</div><div class="bp3-gcc-detail-val">Local specification support</div></div>'
            + '</div>'
            + '<div class="bp3-gcc-cta">'
              + '<button onclick="typeof openReq===\'function\'?openReq(null):null">Contact Local Representative</button>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>';

    page.innerHTML = heroHtml + statsHtml + tabsHtml + aboutHtml + browseHtml + featuredHtml + projectsHtml + specResourcesHtml + brandResourcesHtml + gccHtml;

    if(typeof showPage === 'function') showPage('brandprofile');
    if(typeof closeModal === 'function') closeModal();
    try{ window.scrollTo({top:0, behavior:'instant'}); }catch(e){ window.scrollTo(0,0); }
    // Update the URL hash to include the brand id so a browser refresh
    // restores the same brand profile instead of dumping the user on the home page.
    try {
      var wantHash = '#brand/' + id;
      if(location.hash !== wantHash){
        history.replaceState({page:'brandprofile', brand:id}, '', wantHash);
      }
    } catch(e){}
  };

  // ─── DEEP LINK: brand restore on page load ─────────────────────────────
  // Handles BOTH URL shapes:
  //   Legacy hash:  archspex.com/#brand/12
  //   Pretty path:  archspex.com/brand/12  (Netlify _redirects rewrites
  //                 /brand/* → /index.html; browser URL stays at pathname)
  // Without the pathname check, refreshing at a pretty brand URL bounces
  // the user to home because ax2.js's init routes to page-brandprofile but
  // nothing hydrates it (page-brandprofile only exists after openBrandProfile
  // runs — that's what this handler triggers).
  function handleBrandDeepLink(){
    var raw = '';
    var h = location.hash || '';
    var p = location.pathname || '';
    if(h.indexOf('#brand/') === 0){
      raw = h.replace('#brand/', '');
    } else if(p.indexOf('/brand/') === 0){
      raw = p.replace('/brand/', '').replace(/\/$/, '');
    } else if(p.indexOf('/brand-') === 0){
      // Alternate pretty pattern some links use (brand-12 rather than brand/12).
      raw = p.replace('/brand-', '').replace(/\/$/, '');
    }
    if(!raw) return;
    var bid = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
    var tries = 0;
    (function attempt(){
      tries++;
      if(typeof window.openBrandProfile === 'function' && typeof sb !== 'undefined'){
        try { window.openBrandProfile(bid); } catch(e){ console.warn('deep-link brand failed', e); }
      } else if(tries < 60){
        setTimeout(attempt, 50);
      }
    })();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', handleBrandDeepLink);
  } else {
    // Defer one frame so ax2.js's boot code runs first
    setTimeout(handleBrandDeepLink, 0);
  }

  // Browser back/forward: route between brand profile and other pages by URL.
  window.addEventListener('popstate', function(){
    var raw = '';
    var h = location.hash || '';
    var p = location.pathname || '';
    if(h.indexOf('#brand/') === 0)      raw = h.replace('#brand/', '');
    else if(p.indexOf('/brand/') === 0) raw = p.replace('/brand/', '').replace(/\/$/, '');
    else if(p.indexOf('/brand-') === 0) raw = p.replace('/brand-', '').replace(/\/$/, '');
    if(!raw) return;
    var bid = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
    if(bid && typeof window.openBrandProfile === 'function'){
      window.openBrandProfile(bid);
    }
  });

  // Read more / Read less
  window.bp3ToggleRead = function(btn){
    var p = document.getElementById('bp3-about-p');
    if(!p) return;
    var expanded = btn.getAttribute('data-open') === '1';
    if(expanded){
      p.textContent = p.getAttribute('data-short') || '';
      btn.innerHTML = 'Read more ' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      btn.setAttribute('data-open','0');
    } else {
      p.textContent = p.getAttribute('data-full') || '';
      btn.innerHTML = 'Read less';
      btn.setAttribute('data-open','1');
    }
  };

  // Tab scroll
  window.bp3Tab = function(btn, id){
    try {
      document.querySelectorAll('#page-brandprofile .bp3-tab').forEach(function(t){ t.classList.remove('active'); });
      btn.classList.add('active');
      var map = {
        overview:'bp3-about-section',
        products:'bp3-products-section',
        projects:'bp3-projects-section',
        resources:'bp3-resources-section',
        about:'bp3-about-section',
        contact:'bp3-contact-section'
      };
      var el = document.getElementById(map[id]);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    } catch(e){}
  };

  // Filter pill click — filters the Browse-by-Type grid in place
  window.bp3FilterType = function(btn, key){
    var siblings = btn.parentNode.querySelectorAll('.bp3-pill');
    siblings.forEach(function(s){ s.classList.remove('active'); });
    btn.classList.add('active');
    var grid = document.getElementById('bp3-browse-grid');
    if(!grid) return;
    var list = window._bpProds || [];
    var filtered = list;
    if(key && key !== 'more'){
      filtered = list.filter(function(p){
        var t = p.subtype || p.type || p.category || 'General';
        return String(t).toLowerCase() === String(key).toLowerCase();
      });
    }
    // Reuse the same renderer used at initial paint
    var html = filtered.length
      ? filtered.map(function(p){
          if(typeof prodCard === 'function'){ try { return prodCard(p); } catch(e){} }
          var img = p.image_url || p.img || '';
          var name = p.name || p.product_name || 'Product';
          var sub = p.subtype || p.series || p.collection || p.type || p.category || '';
          return '<div class="bp3-prodcard" onclick="if(typeof openProduct===\'function\')openProduct(&quot;'+String(p.id).replace(/"/g,'&quot;')+'&quot;)">'
            + (img ? '<div class="bp3-prodimg" style="background-image:url(\''+img+'\')"></div>' : '<div class="bp3-prodimg"></div>')
            + '<div class="bp3-prodbody"><div class="bp3-prodname">'+name+'</div>'+(sub?'<div class="bp3-prodsub">'+sub+'</div>':'')+'</div></div>';
        }).join('')
      : '<div style="grid-column:1/-1;padding:36px;text-align:center;background:#f7f8fb;border-radius:12px;color:#7a8496;font-size:13px">No products in this category.</div>';
    grid.innerHTML = html;
  };

})();
