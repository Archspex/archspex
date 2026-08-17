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
      + '#page-brandprofile{background:#f7f8fb;padding-bottom:57px}'
      // Outer shell — mirrors product page's .pp-wrap: white card, 1280px, rounded, subtle shadow
      // overflow:clip (not overflow:hidden) — clips to border-radius without creating a scroll container so position:sticky on .bp3-tabs still binds to the viewport.
      + '#page-brandprofile .bp3-shell{background:#fff;max-width:1280px;margin:6px auto 0;border-radius:16px;overflow:clip;box-shadow:0 4px 20px rgba(0,15,40,.04)}'
      // Secondary shells for spun-out sections (Projects, etc.) sit BELOW the main shell with a grey gap in between.
      + '#page-brandprofile .bp3-shell-secondary{margin-top:24px}'
      // Kill the border-bottom on the last section inside a shell so it doesn't cut across the rounded corner.
      + '#page-brandprofile .bp3-shell > .bp3-section:last-child{border-bottom:0}'
      // Inside the shell, .bp3-wrap is a content constrainer with horizontal padding only.
      + '#page-brandprofile .bp3-wrap{max-width:none;margin:0;padding:0 32px}'
      + '#page-brandprofile .bp3-hero{background:#fff;border-bottom:1px solid #eceff5}'
      // Backbar sits OUTSIDE the shell on grey — mirrors product page .pp-page-header EXACTLY.
      // Product page effective style: max-width:none, margin:0, padding:16px 20px 12px, full-viewport-wide, so Back/crumb hug the viewport edges (not the shell edges).
      + '#page-brandprofile .bp3-backbar{background:transparent;max-width:none;margin:0;padding:16px 20px 6px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-backbar .bp3-back{padding:0}'
      // Right-side crumb — mirrors product page's #page-product .pp-page-crumb (which wins over the later .pp-page-crumb rule via specificity, so it's uppercased with letter-spacing).
      + '#page-brandprofile .bp3-crumb{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.8px;text-transform:uppercase}'
      // Hero photo fills the shell horizontally with no extra rounding/margin (shell already provides the rounded corners at top).
      + '#page-brandprofile .bp3-photo{height:428px;background:#eaeef4 center/cover no-repeat;position:relative;overflow:hidden;margin:0}'
      + '#page-brandprofile .bp3-photo::after{content:"";position:absolute;inset:auto 0 0 0;height:40px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.25))}'
      // Headcard is a flex row: logo | title-block | CTA. CTA is pushed down via padding-top so it aligns vertically with the tagline line (below the H1 name).
      + '#page-brandprofile .bp3-headcard{display:flex;align-items:flex-start;gap:28px;padding:22px 0 26px;flex-wrap:wrap;position:relative}'
      + '#page-brandprofile .bp3-logo{width:129px;height:129px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Fraunces,serif;font-weight:700;font-size:30px;color:var(--navy);box-shadow:0 8px 26px rgba(0,15,40,.16);border:1px solid #edeff5;margin-top:-78px;flex-shrink:0;overflow:hidden}'
      + '#page-brandprofile .bp3-logo img{width:100%;height:100%;object-fit:cover}'
      + '#page-brandprofile .bp3-title-block{flex:1;min-width:260px;padding-top:2px}'
      + '#page-brandprofile .bp3-name{font-family:Fraunces,serif;font-size:32px;font-weight:400;color:var(--navy);margin:0 0 6px;line-height:1.05;display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-name-text{display:inline-block}'
      + '#page-brandprofile .bp3-tag{font-size:13px;color:var(--muted);margin:0 0 10px;line-height:1.5;max-width:420px}'
      + '#page-brandprofile .bp3-loc{display:inline-flex;align-items:center;gap:14px;font-size:13px;color:#374050;font-weight:500}'
      + '#page-brandprofile .bp3-loc-item{display:inline-flex;align-items:center;gap:8px}'
      + '#page-brandprofile .bp3-loc-sep{width:1px;height:16px;background:#d6dae4;display:inline-block}'
      + '#page-brandprofile .bp3-loc-featured{font-weight:600;color:#374050}'
      + '#page-brandprofile .bp3-flag{display:inline-flex;align-items:center;justify-content:center;width:18px;height:12px;border-radius:2px;background:#ccc;overflow:hidden;vertical-align:middle;box-shadow:0 0 0 1px rgba(0,0,0,.06) inset}'
      + '#page-brandprofile .bp3-flag svg,#page-brandprofile .bp3-flag img{width:100%;height:100%;display:block;object-fit:cover}'
      // CTA sits in the right column of the headcard row. padding-top pushes it down so the top of the buttons aligns with the tagline line (below the H1 name).
      + '#page-brandprofile .bp3-cta{display:flex;flex-wrap:wrap;gap:10px 10px;align-items:center;justify-content:flex-end;padding-top:44px}'
      + '#page-brandprofile .bp3-btn-primary{background:var(--navy);color:#fff;font-size:13px;font-weight:800;padding:13px 22px;border-radius:10px;border:none;cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:190px;transition:background .15s;text-decoration:none}'
      + '#page-brandprofile .bp3-btn-primary:hover{background:#001a3d}'
      + '#page-brandprofile .bp3-btn-outline{background:#fff;color:var(--navy);font-size:13px;font-weight:800;padding:12px 22px;border-radius:10px;border:1.5px solid var(--navy);cursor:pointer;font-family:Manrope,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:190px;transition:background .15s;text-decoration:none}'
      + '#page-brandprofile .bp3-btn-outline:hover{background:#f2f5fa}'
      + '#page-brandprofile .bp3-iconrow{display:flex;gap:16px;margin-top:2px;width:100%;justify-content:flex-end}'
      + '#page-brandprofile .bp3-ibtn{background:none;border:none;font-size:11px;font-weight:600;color:#4b5566;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:4px 0;font-family:Manrope,sans-serif}'
      + '#page-brandprofile .bp3-ibtn:hover{color:var(--navy)}'
      // Compact stat tiles — fixed-width columns; container shrinks to fit the columns so it doesn't stretch to full row width (which was making the last cell look extra-wide).
      + '#page-brandprofile .bp3-stats{display:grid;grid-template-columns:repeat(6,140px);width:fit-content;background:#fff;border:1px solid #eceff5;border-radius:12px;overflow:hidden;margin:0 0 6px;box-shadow:0 1px 3px rgba(0,15,40,.03)}'
      + '#page-brandprofile .bp3-stat{padding:10px 14px;border-right:1px solid #eceff5;display:flex;flex-direction:column;gap:1px}'
      + '#page-brandprofile .bp3-stat:last-child{border-right:none}'
      + '#page-brandprofile .bp3-stat-ic{width:16px;height:16px;color:var(--navy);margin-bottom:4px}'
      + '#page-brandprofile .bp3-stat-lbl{font-size:9px;font-weight:700;color:#7a8496;text-transform:uppercase;letter-spacing:.5px}'
      + '#page-brandprofile .bp3-stat-val{font-size:12.5px;font-weight:700;color:var(--navy);margin-top:1px;line-height:1.25}'
      + '#page-brandprofile .bp3-stat-val small{font-size:10.5px;font-weight:600;color:#4b5566;display:block;line-height:1.3}'
      + '#page-brandprofile .bp3-tabs{background:#fff;border-bottom:1px solid #eceff5;position:sticky;top:0;z-index:100}'
      + '#page-brandprofile .bp3-grid4 .prod-desc-list,#page-brandprofile .bp3-grid3 .prod-desc-list,#page-brandprofile .prod-grid .prod-desc-list{display:none !important}'
      + '#page-brandprofile .bp3-tabs-inner{display:flex;gap:28px;overflow:auto;padding:2px 0}'
      + '#page-brandprofile .bp3-tab{position:relative;padding:14px 2px 14px;font-size:13px;font-weight:600;color:#7a8496;cursor:pointer;background:none;border:none;font-family:Manrope,sans-serif;white-space:nowrap;transition:color .15s}'
      + '#page-brandprofile .bp3-tab:hover{color:var(--navy)}'
      + '#page-brandprofile .bp3-tab.active{color:var(--navy)}'
      + '#page-brandprofile .bp3-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--navy);border-radius:2px}'
      + '#page-brandprofile .bp3-section{background:#fff;padding:34px 0;border-bottom:1px solid #eceff5}'
      // Section headers → gold caps (matches product page .sec-label style)
      + '#page-brandprofile .bp3-h2{font-family:Manrope,sans-serif;font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px}'
      + '#page-brandprofile .bp3-secthead{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:22px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-viewall{font-size:12px;font-weight:600;color:var(--navy);text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:opacity .15s}'
      + '#page-brandprofile .bp3-viewall:hover{opacity:.7}'
      + '#page-brandprofile .bp3-about-p{font-size:14px;color:#374050;line-height:1.75;margin:0 0 12px;max-width:820px}'
      + '#page-brandprofile .bp3-readmore{font-size:12px;font-weight:600;color:var(--navy);background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:Manrope,sans-serif}'
      + '#page-brandprofile .bp3-pills{display:flex;gap:8px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-pill{padding:6px 14px;border-radius:100px;font-size:10px;font-weight:800;background:#fff;border:1px solid #e2e6ef;color:#4b5566;cursor:pointer;font-family:Manrope,sans-serif;transition:background .15s,color .15s,border-color .15s;white-space:nowrap}'
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
      // Project cards inside the detached shell — flat image + title + location (no border, no card bg), matching product-page "Recently Used In Projects".
      + '#page-brandprofile .bp3-projcard{background:transparent;border:none;border-radius:0;overflow:visible;cursor:pointer;transition:transform .15s;padding:0}'
      + '#page-brandprofile .bp3-projcard:hover{transform:translateY(-2px);box-shadow:none}'
      + '#page-brandprofile .bp3-projimg{width:100%;height:200px;background:#eef1f6 center/cover no-repeat;border-radius:10px}'
      + '#page-brandprofile .bp3-projbody{padding:14px 0 0}'
      + '#page-brandprofile .bp3-projname{font-size:15px;font-weight:800;color:var(--navy);margin:0 0 4px}'
      + '#page-brandprofile .bp3-projloc{font-size:12.5px;color:#7a8496;font-weight:600}'
      // Uppercase "View All Projects" link mirroring product-page gold caps eyebrow style
      + '#page-brandprofile .bp3-viewall-caps{font-family:Manrope,sans-serif;font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px}'
      + '#page-brandprofile .bp3-viewall-caps:hover{opacity:.7}'
      // Projects grid uses same responsive rules as bp3-grid4 (already handled) but always 4-col on wide viewports.
      + '#page-brandprofile .bp3-proj-grid{gap:20px}'
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
      + '#page-brandprofile .bp3-gcc-cta button{background:#fff;color:var(--navy);border:1.5px solid var(--navy);min-width:280px;padding:12px 22px;border-radius:10px;font-family:Manrope,sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:background .15s,color .15s}'
      + '#page-brandprofile .bp3-gcc-cta button:hover{background:var(--navy);color:#fff}'
      + '#page-brandprofile .bp3-back{background:transparent !important;border:none !important;box-shadow:none !important;border-radius:0 !important;outline:none;color:var(--navy);font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:Manrope,sans-serif;padding:0;transition:color .15s,transform .15s}'
      + '#page-brandprofile .bp3-back:hover{color:var(--gold);transform:translateX(-2px)}'
      + '#page-brandprofile .bp3-back svg{width:13px;height:13px;flex-shrink:0}'
      + '#page-brandprofile .bp3-partner-pill{display:inline-flex;align-items:center;gap:6px;font-family:Manrope,sans-serif;font-size:10px;font-weight:800;color:var(--navy);background:var(--gold);padding:6px 14px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;line-height:1;box-shadow:0 2px 8px rgba(201,168,76,.25)}'
      + '#page-brandprofile .bp3-partner-pill svg{width:11px;height:11px}'
      // ── PRODUCTS TAB ─────────────────────────────────────────────────
      + '#page-brandprofile .bp3-po-intro{font-size:13.5px;color:#4b5566;line-height:1.6;margin:6px 0 0;max-width:900px;font-weight:500}'
      // Category tiles row
      + '#page-brandprofile .bp3-cat-tiles{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}'
      + '#page-brandprofile .bp3-cat-tile{display:inline-flex;align-items:center;gap:12px;padding:12px 18px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;font-family:Manrope,sans-serif;cursor:pointer;transition:border-color .15s,background .15s;text-align:left}'
      + '#page-brandprofile .bp3-cat-tile:hover{border-color:var(--navy)}'
      + '#page-brandprofile .bp3-cat-tile.active{border-color:var(--navy);background:#f0f4fa;box-shadow:inset 0 0 0 1px var(--navy)}'
      + '#page-brandprofile .bp3-cat-tile-ic{width:38px;height:38px;border-radius:8px;background:#f0f4fa;color:var(--navy);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-cat-tile.active .bp3-cat-tile-ic{background:var(--navy);color:#fff}'
      + '#page-brandprofile .bp3-cat-tile-body{display:flex;flex-direction:column;gap:2px;line-height:1.2}'
      + '#page-brandprofile .bp3-cat-tile-name{font-size:12px;font-weight:700;color:var(--navy);white-space:nowrap}'
      + '#page-brandprofile .bp3-cat-tile-count{font-size:14px;font-weight:800;color:var(--navy)}'
      // Toolbar row
      + '#page-brandprofile .bp3-prods-toolbar{display:flex;align-items:center;gap:12px;margin-top:22px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-prods-search{position:relative;flex:1;min-width:220px}'
      + '#page-brandprofile .bp3-prods-search input{width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px 12px 42px;font-family:Manrope,sans-serif;font-size:13px;color:var(--navy);outline:none;transition:border-color .15s}'
      + '#page-brandprofile .bp3-prods-search input:focus{border-color:var(--navy)}'
      + '#page-brandprofile .bp3-prods-search-ic{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#7a8496;pointer-events:none;display:inline-flex}'
      + '#page-brandprofile .bp3-prods-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
      // Custom dropdown (matches site style — white pill trigger + panel with active row)
      + '#page-brandprofile .bp3-dd{position:relative;font-family:Manrope,sans-serif}'
      + '#page-brandprofile .bp3-dd-trigger{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:11px 16px;font-family:Manrope,sans-serif;font-size:12.5px;font-weight:700;color:var(--navy);cursor:pointer;outline:none;display:inline-flex;align-items:center;gap:8px;transition:border-color .15s;min-width:160px}'
      + '#page-brandprofile .bp3-dd-trigger:hover{border-color:var(--navy)}'
      + '#page-brandprofile .bp3-dd.open .bp3-dd-trigger{border-color:var(--navy)}'
      + '#page-brandprofile .bp3-dd-chev{margin-left:auto;color:var(--navy);flex-shrink:0;transition:transform .15s}'
      + '#page-brandprofile .bp3-dd.open .bp3-dd-chev{transform:rotate(180deg)}'
      + '#page-brandprofile .bp3-dd-panel{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 8px 24px rgba(0,15,40,.08);padding:6px;display:none;z-index:50;min-width:200px}'
      + '#page-brandprofile .bp3-dd.open .bp3-dd-panel{display:block}'
      + '#page-brandprofile .bp3-dd-opt{display:block;width:100%;text-align:left;background:transparent;border:none;padding:10px 12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:12.5px;font-weight:600;color:var(--navy);cursor:pointer;transition:background .1s}'
      + '#page-brandprofile .bp3-dd-opt:hover{background:#f0f4fa}'
      + '#page-brandprofile .bp3-dd-opt.active{background:#f0f4fa;font-weight:800}'
      + '#page-brandprofile .bp3-prods-check{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--navy);cursor:pointer;user-select:none}'
      + '#page-brandprofile .bp3-prods-check input{accent-color:var(--navy);width:16px;height:16px;cursor:pointer}'
      + '#page-brandprofile .bp3-prods-count{font-size:11.5px;color:#7a8496;font-weight:600;margin-top:14px}'
      // Pagination
      + '#page-brandprofile .bp3-pagination{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:28px}'
      + '#page-brandprofile .bp3-page-btn{width:34px;height:34px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;color:var(--navy);font-family:Manrope,sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s}'
      + '#page-brandprofile .bp3-page-btn:hover{border-color:var(--navy)}'
      + '#page-brandprofile .bp3-page-btn.active{background:var(--navy);color:#fff;border-color:var(--navy)}'
      + '#page-brandprofile .bp3-page-btn.disabled{opacity:.4;cursor:not-allowed;pointer-events:none}'
      + '#page-brandprofile .bp3-page-dots{color:#7a8496;font-weight:700;padding:0 4px}'
      // Contact tab — Company info tiles, Contact person cards, Office cards, Need help strip
      + '#page-brandprofile .bp3-cinfo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}'
      + '#page-brandprofile .bp3-cinfo-item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px}'
      + '#page-brandprofile .bp3-cinfo-ic{width:38px;height:38px;border-radius:8px;background:#f4f5f7;color:var(--navy);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-cinfo-body{min-width:0;flex:1}'
      + '#page-brandprofile .bp3-cinfo-lbl{font-size:12px;font-weight:800;color:var(--navy);line-height:1.3;margin-bottom:2px}'
      + '#page-brandprofile .bp3-cinfo-val{font-size:11.5px;font-weight:500;color:#4b5566;line-height:1.5}'
      + '#page-brandprofile .bp3-cinfo-link{font-size:11.5px;font-weight:500;color:var(--navy);text-decoration:none;line-height:1.5;word-break:break-word}'
      + '#page-brandprofile .bp3-cinfo-link:hover{text-decoration:underline}'
      + '#page-brandprofile .bp3-cperson-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}'
      + '#page-brandprofile .bp3-cperson-card{background:#fff;border:1px solid #eceff5;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}'
      + '#page-brandprofile .bp3-cperson-top{display:flex;gap:12px;align-items:flex-start}'
      + '#page-brandprofile .bp3-cperson-ic{width:36px;height:36px;border-radius:8px;background:#f4f5f7;color:var(--gold);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-cperson-titles{min-width:0;flex:1}'
      + '#page-brandprofile .bp3-cperson-role{font-size:11px;font-weight:800;color:var(--navy);letter-spacing:.2px}'
      + '#page-brandprofile .bp3-cperson-name{font-size:14px;font-weight:800;color:var(--navy);margin-top:2px}'
      + '#page-brandprofile .bp3-cperson-title{font-size:11px;font-weight:600;color:#7a8496;margin-top:2px;line-height:1.4}'
      + '#page-brandprofile .bp3-cperson-line{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#4b5566;font-weight:500;line-height:1.4}'
      + '#page-brandprofile .bp3-cperson-line a{color:var(--navy);text-decoration:none;word-break:break-word}'
      + '#page-brandprofile .bp3-cperson-line a:hover{text-decoration:underline}'
      + '#page-brandprofile .bp3-cperson-lineic{color:#7a8496;display:inline-flex;flex-shrink:0}'
      + '#page-brandprofile .bp3-office-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}'
      + '#page-brandprofile .bp3-office-card{background:#fff;border:1px solid #eceff5;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px}'
      + '#page-brandprofile .bp3-office-head{display:flex;gap:12px;align-items:flex-start}'
      + '#page-brandprofile .bp3-office-ic{width:32px;height:32px;border-radius:8px;background:#f4f5f7;color:var(--gold);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-office-name{font-size:14px;font-weight:800;color:var(--navy);line-height:1.3}'
      + '#page-brandprofile .bp3-office-addr{font-size:11.5px;color:#7a8496;font-weight:500;margin-top:4px;line-height:1.5}'
      + '#page-brandprofile .bp3-office-contacts{display:flex;flex-direction:column;gap:6px;padding-top:2px}'
      + '#page-brandprofile .bp3-needhelp{margin-top:24px;background:#f4f5f7;border-radius:12px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}'
      + '#page-brandprofile .bp3-needhelp-left{display:flex;align-items:center;gap:14px;min-width:0}'
      + '#page-brandprofile .bp3-needhelp-ic{width:46px;height:46px;border-radius:10px;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-needhelp-title{font-size:14px;font-weight:800;color:var(--navy);line-height:1.3}'
      + '#page-brandprofile .bp3-needhelp-sub{font-size:11.5px;color:#4b5566;font-weight:500;line-height:1.5;margin-top:2px}'
      + '#page-brandprofile .bp3-needhelp-btn{background:var(--navy);color:#fff;border:none;border-radius:10px;padding:13px 22px;font-family:Manrope,sans-serif;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background .15s}'
      + '#page-brandprofile .bp3-needhelp-btn:hover{background:#001a3d}'
      // Resources tab — grouped sections with gold caps labels + 2-col icon+meta cards
      + '#page-brandprofile .bp3-res-group{margin-top:28px}'
      + '#page-brandprofile .bp3-res-group:first-of-type{margin-top:22px}'
      + '#page-brandprofile .bp3-res-group-lbl{font-family:Manrope,sans-serif;font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;padding-bottom:14px;border-top:1px solid #eceff5;padding-top:20px}'
      + '#page-brandprofile .bp3-res-group:first-of-type .bp3-res-group-lbl{border-top:none;padding-top:0}'
      + '#page-brandprofile .bp3-res-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}'
      + '#page-brandprofile .bp3-res-item{display:inline-flex;align-items:center;gap:14px;padding:12px 16px;background:#fff;border:1px solid #eceff5;border-radius:10px;font-family:Manrope,sans-serif;cursor:pointer;text-align:left;transition:border-color .15s,box-shadow .15s}'
      + '#page-brandprofile .bp3-res-item:hover{border-color:var(--navy);box-shadow:0 2px 8px rgba(0,15,40,.04)}'
      + '#page-brandprofile .bp3-res-ic{width:36px;height:36px;border-radius:8px;background:#f4f5f7;color:var(--navy);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-res-body{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}'
      + '#page-brandprofile .bp3-res-name{font-size:12.5px;font-weight:800;color:var(--navy);line-height:1.3}'
      + '#page-brandprofile .bp3-res-meta{font-size:10.5px;font-weight:600;color:#7a8496;letter-spacing:.2px}'
      // Product Portfolio — 4-col grid of image + title + description cards.
      + '#page-brandprofile .bp3-portfolio-sub{font-size:13px;color:#4b5566;margin:4px 0 0;font-weight:500;line-height:1.5}'
      + '#page-brandprofile .bp3-portfolio-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:18px}'
      + '#page-brandprofile .bp3-port-card{background:#fff;border:1px solid #eceff5;border-radius:12px;overflow:hidden;text-align:left;cursor:pointer;padding:0;transition:border-color .15s,transform .15s,box-shadow .15s;font-family:Manrope,sans-serif;display:flex;flex-direction:column}'
      + '#page-brandprofile .bp3-port-card:hover{border-color:var(--navy);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,15,40,.08)}'
      + '#page-brandprofile .bp3-port-img{height:130px;background:#eaeef4 center/cover no-repeat}'
      + '#page-brandprofile .bp3-port-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1;position:relative}'
      + '#page-brandprofile .bp3-port-name{font-size:14px;font-weight:800;color:var(--navy);line-height:1.3}'
      + '#page-brandprofile .bp3-port-desc{font-size:11.5px;color:#4b5566;font-weight:500;line-height:1.5}'
      + '#page-brandprofile .bp3-port-arrow{position:absolute;bottom:14px;right:14px;color:var(--navy);display:inline-flex}'
      // Typical Applications tiles — 3-col grid of icon+label pills.
      + '#page-brandprofile .bp3-apps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}'
      + '#page-brandprofile .bp3-app-tile{display:inline-flex;align-items:center;gap:10px;padding:14px 16px;background:#fff;border:1px solid #eceff5;border-radius:10px;font-size:13px;font-weight:600;color:var(--navy);transition:border-color .15s,background .15s;cursor:default}'
      + '#page-brandprofile .bp3-app-tile:hover{border-color:var(--navy);background:#fafbfd}'
      + '#page-brandprofile .bp3-app-tile svg{color:var(--navy);flex-shrink:0}'
      // Why Specify list — 2-column grid of icon-chip + label.
      + '#page-brandprofile .bp3-why-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 24px;margin-top:14px}'
      + '#page-brandprofile .bp3-why-item{display:inline-flex;align-items:center;gap:12px;padding:8px 0;font-size:13px;font-weight:600;color:var(--navy)}'
      + '#page-brandprofile .bp3-why-ic{width:32px;height:32px;border-radius:8px;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '#page-brandprofile .bp3-why-ic svg{color:#fff}'
      + '@media(max-width:900px){#page-brandprofile .bp3-stats{grid-template-columns:repeat(3,1fr)}#page-brandprofile .bp3-stat:nth-child(3){border-right:none}#page-brandprofile .bp3-grid4{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-grid5{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-grid3{grid-template-columns:1fr}#page-brandprofile .bp3-gcc{grid-template-columns:1fr}#page-brandprofile .bp3-cta{align-items:stretch;width:100%}#page-brandprofile .bp3-apps-grid{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-why-grid{grid-template-columns:1fr}#page-brandprofile .bp3-portfolio-grid{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-res-grid{grid-template-columns:1fr}#page-brandprofile .bp3-cinfo-grid{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-cperson-grid{grid-template-columns:repeat(2,1fr)}#page-brandprofile .bp3-office-grid{grid-template-columns:1fr}}'
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
    arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    // Application icons (Typical Applications section)
    building: '<path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h1M9 12h1M9 15h1M14 9h1M14 12h1M14 15h1"/>',
    book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    factory:  '<path d="M2 20h20"/><path d="M4 20V9l6 4V9l6 4V4h4v16"/><path d="M7 20v-4h2v4M12 20v-4h2v4M17 20v-4h2v4"/>',
    bed:      '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 16h20"/><path d="M6 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/>',
    cart:     '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    bridge:   '<path d="M2 12h20"/><path d="M4 12v6M20 12v6"/><path d="M2 8s2-4 10-4 10 4 10 4"/><path d="M8 12v3M12 12v4M16 12v3"/>',
    home:     '<path d="M3 12l9-9 9 9"/><path d="M5 10v11h5v-6h4v6h5V10"/>',
    heart:    '<path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z" transform="translate(-1 0)"/><path d="M12 8v6M9 11h6" stroke-width="1.5"/>',
    leaf:     '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.6.66c.29 3.42.09 6.2-1.6 9.42-1.87 3.57-5.6 6.03-9.44 6.03z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
    // Contact-tab icons
    phone:    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    envelope: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    headset:  '<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'
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
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=900&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&q=80'
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
    window._bpBrand = brand;
    // Reset Products-tab state on every brand open so filters/paging start fresh.
    window._bp3ProdsState = { cat:'', app:'', spec:false, sort:'relevant', page:1, perPage:12 };

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
    // Location line shows country only (per CI — city is used elsewhere e.g. Headquarters stat).
    var loc = country;
    var tagline = brand.tagline || brand.slogan || (brand.categories && brand.categories.length ? brand.categories[0] + ' for better living.' : '');
    var founded = brand.founded || '—';
    var desc = brand.description || 'No description provided yet.';
    var website = brand.website || '';
    var initials = (name.substring(0,2)).toUpperCase();
    // Only use an explicit logo_url field — avoid picking up any generic `logo` field
    // in the DB which may hold placeholder/stock imagery. Fall back to initials.
    var logoImg = (typeof window._brandLogoPlaceholder === 'function') ? window._brandLogoPlaceholder(name) : ((brand.logo_url && String(brand.logo_url).trim()) ? brand.logo_url : '');
    var featured = !!brand.featured;
    var heroPhoto = brand.hero_image || pickPhoto(STOCK_HEROS, name);

    var types = deriveTypes(prods);
    var typeCount = types.length || (brand.categories||[]).length || 0;

    var gcc = deriveGcc(brand);
    var gccAvailShort = gcc.filter(function(c){ return c.status!=='On Request'; })
                          .map(function(c){ return c.short==='Saudi Arabia'?'KSA':c.short; }).slice(0,3).join(', ') || 'On request';

    // ═══ BACK BAR (sits OUTSIDE the white shell, on the grey page bg — mirrors product page's .pp-page-header) ═══
    var backbarHtml =
      '<div class="bp3-backbar"><button class="bp3-back" onclick="typeof backToBrands===\'function\'?backToBrands():showPage(\'manufacturers\')">'+icon('back',14)+' Back</button><span class="bp3-crumb">Brand Details</span></div>';

    // ═══ HERO ═══════════════════════════════════════════════════════
    var heroHtml =
      '<div class="bp3-hero">'
        + '<div class="bp3-photo" style="background-image:url(\''+heroPhoto+'\')"></div>'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-headcard">'
            + '<div class="bp3-logo">' + (logoImg ? '<img src="'+logoImg+'" alt="'+name+'">' : initials) + '</div>'
            + '<div class="bp3-title-block">'
              + '<h1 class="bp3-name"><span class="bp3-name-text">'+name+'</span></h1>'
              + (tagline ? '<p class="bp3-tag">'+tagline+'</p>' : '')
              + '<div class="bp3-loc">'
                + '<span class="bp3-loc-item">'+icon('pin',13)+' '+ flag(country) + ' ' + (loc || '—') +'</span>'
                + (featured ? '<span class="bp3-loc-sep"></span><span class="bp3-loc-item bp3-loc-featured"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="color:#C9A84C"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279L0 9.306l8.332-1.151z"/></svg> Featured Partner</span>' : '')
              + '</div>'
            + '</div>'
            + '<div class="bp3-cta">'
              + '<button class="bp3-btn-primary" onclick="typeof openReq===\'function\'?openReq(null):null">Request Information</button>'
              + (website ? '<a class="bp3-btn-outline" href="'+website+'" target="_blank" rel="noopener">Visit Website</a>' : '<button class="bp3-btn-outline" disabled style="opacity:.5;cursor:not-allowed">Visit Website</button>')
              + '<div class="bp3-iconrow">'
                + (function(){
                    var isSaved = !!(window.SavedBrands && window.SavedBrands.has(id));
                    return '<button class="bp3-ibtn'+(isSaved?' is-saved':'')+'" data-save-brand-btn="'+id+'" onclick="typeof toggleSaveBrand===\'function\'?toggleSaveBrand('+id+'):null">'+icon('bookmark',13)+' <span class="save-brand-lbl">'+(isSaved?'Saved':'Save Brand')+'</span></button>';
                  })()
                + '<button class="bp3-ibtn" onclick="typeof shareBrand===\'function\'?shareBrand('+id+'):null">'+icon('share',13)+' Share</button>'
              + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ STATS STRIP ════════════════════════════════════════════════
    var statsHtml =
      '<div class="bp3-wrap" style="padding-top:22px">'
        + '<div class="bp3-stats">'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('calendar',16)+'</div><div class="bp3-stat-lbl">Founded</div><div class="bp3-stat-val">'+founded+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('pin',16)+'</div><div class="bp3-stat-lbl">Headquarters</div><div class="bp3-stat-val">'+ (country||'—') +'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('bag',16)+'</div><div class="bp3-stat-lbl">Products</div><div class="bp3-stat-val">'+prods.length+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('grid',16)+'</div><div class="bp3-stat-lbl">Product Types</div><div class="bp3-stat-val">'+typeCount+'</div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic">'+icon('globe',16)+'</div><div class="bp3-stat-lbl">GCC Availability</div><div class="bp3-stat-val"><small>'+gccAvailShort+'</small></div></div>'
          + '<div class="bp3-stat"><div class="bp3-stat-ic" style="color:#0F9D58">'+icon('check',16)+'</div><div class="bp3-stat-lbl">Spec Ready</div><div class="bp3-stat-val">Yes</div></div>'
        + '</div>'
      + '</div>';

    // ═══ TABS ═══════════════════════════════════════════════════════
    var tabDefs = [
      {id:'overview', label:'Overview'},
      {id:'products', label:'Products'},
      {id:'resources', label:'Resources'},
      {id:'contact', label:'Contact'}
    ];
    var tabsHtml =
      '<div class="bp3-tabs">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-tabs-inner">'
            + tabDefs.map(function(t,i){
              return '<button class="bp3-tab'+(i===0?' active':'')+'" data-bp3-tab="'+t.id+'" onclick="bp3Tab(this,\''+t.id+'\')">'+t.label+'</button>';
            }).join('')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ COMPANY INTRODUCTION ═══════════════════════════════════════
    // Uses a template that mentions worldwide leadership, primary sectors, GCC
    // presence and specification-ready backing — then appends any brand-specific
    // description from the DB. Falls back to a purely generic version if none.
    var _primarySector = (brand.categories && brand.categories[0]) || (types[0] && types[0].name) || 'building materials';
    var _companyIntro = _esc(name) + ' is one of the world\'s leading manufacturers, supplying '+_esc(String(_primarySector).toLowerCase())+' solutions for commercial, industrial and infrastructure projects worldwide. '
      + 'The company has extensive experience in the GCC region and provides specification-ready products supported by comprehensive technical documentation.'
      + (desc && String(desc).trim() ? ' ' + _esc(desc) : '');
    var aboutHtml =
      '<div class="bp3-section" id="bp3-about-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Company Introduction</h2>'
          + '<p class="bp3-about-p" id="bp3-about-p">'+_companyIntro+'</p>'
        + '</div>'
      + '</div>';

    // Local esc helper (defensive — used below in innerHTML strings)
    function _esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    var esc = _esc;
    // Chevron SVG helper for custom dropdown triggers
    function _bpChev(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="bp3-dd-chev"><polyline points="6 9 12 15 18 9"/></svg>'; }
    window._bpChev = _bpChev;

    // ═══ PRODUCT PORTFOLIO ══════════════════════════════════════════
    // 4 category cards derived from the brand's product types. Each card
    // shows image, category name, short description, and an arrow that
    // filters the Browse-by-Type grid to that type.
    var PORTFOLIO_STOCK = [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1523419409543-8c1a04d5d1a5?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=800&q=80&auto=format',
      'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&q=80&auto=format'
    ];
    var portfolioCats = types.slice(0,4);
    // Pad up to 4 with the brand's declared categories if we don't have enough product-derived types.
    if(portfolioCats.length < 4){
      (brand.categories||[]).forEach(function(c){
        if(portfolioCats.length < 4 && !portfolioCats.some(function(p){ return p.name === c; })){
          portfolioCats.push({name:c, count:0});
        }
      });
    }
    // Final fallback — always show 4 cards using the site's core sector taxonomy as placeholders.
    var PLACEHOLDER_CATS = ['Structure','Envelope','Interiors','Finishes','Furnishing','Systems'];
    if(portfolioCats.length < 4){
      PLACEHOLDER_CATS.forEach(function(c){
        if(portfolioCats.length < 4 && !portfolioCats.some(function(p){ return String(p.name).toLowerCase() === c.toLowerCase(); })){
          portfolioCats.push({name:c, count:0});
        }
      });
    }
    var portfolioHtml = '';
    if(portfolioCats.length){
      portfolioHtml =
        '<div class="bp3-section" id="bp3-portfolio-section">'
          + '<div class="bp3-wrap">'
            + '<div class="bp3-secthead">'
              + '<div>'
                + '<h2 class="bp3-h2">Product Portfolio</h2>'
                + '<p class="bp3-portfolio-sub">A comprehensive range of solutions for construction and infrastructure projects.</p>'
              + '</div>'
              + '<a class="bp3-viewall" href="#products" onclick="event.preventDefault();var el=document.getElementById(\'bp3-products-section\');if(el)el.scrollIntoView({behavior:\'smooth\'})">View all products '+icon('arrow',12)+'</a>'
            + '</div>'
            + '<div class="bp3-portfolio-grid">'
              + portfolioCats.map(function(c,i){
                  var img = PORTFOLIO_STOCK[i % PORTFOLIO_STOCK.length];
                  var descText = 'Specification-ready ' + String(c.name).toLowerCase() + ' solutions for GCC construction projects.';
                  return '<button class="bp3-port-card" onclick="(function(){if(typeof bp3Tab===\'function\'){bp3Tab(null,\'products\');}setTimeout(function(){var tile=document.querySelector(\'#page-brandprofile .bp3-cat-tile[data-cat=\\\"'+String(c.name).replace(/"/g,'&quot;')+'\\\"]\');if(tile&&typeof bp3SelectCategory===\'function\')bp3SelectCategory(tile);var el=document.getElementById(\'bp3-products-section\');if(el)el.scrollIntoView({behavior:\'smooth\'});},60);})()">'
                    + '<div class="bp3-port-img" style="background-image:url(\''+img+'\')"></div>'
                    + '<div class="bp3-port-body">'
                    +   '<div class="bp3-port-name">'+esc(c.name)+'</div>'
                    +   '<div class="bp3-port-desc">'+descText+'</div>'
                    +   '<span class="bp3-port-arrow">'+icon('arrow',14)+'</span>'
                    + '</div>'
                  + '</button>';
                }).join('')
            + '</div>'
          + '</div>'
        + '</div>';
    }

    // ═══ PRODUCTS TAB CONTENT ═══════════════════════════════════════
    // Product Overview + Categories + Toolbar + Grid + Pagination.
    // Icon per category (falls back to grid icon).
    var CAT_ICON = {
      'Structural Steel':'company','Structure':'company',
      'Reinforcement':'grid','Reinforcement Systems':'grid',
      'Precast Elements':'building','Precast':'building',
      'Plates & Sheets':'catalogue','Plates':'catalogue',
      'Hollow Sections':'company',
      'Accessories':'bag',
      'Envelope':'catalogue',
      'Interiors':'home',
      'Finishes':'catalogue',
      'Furnishing':'bed','FF&E':'bed',
      'Systems':'grid'
    };
    var catTiles = [{name:'All Products', count: prods.length, key:'', ic:'grid'}]
      .concat(types.map(function(t){ return {name:t.name, count:t.count, key:t.name, ic:CAT_ICON[t.name]||'grid'}; }));
    // Cache the full list on window so the filter/sort/paginate helpers can reach it.
    window._bp3AllProds = prods;
    window._bp3ProdsBrandName = name;
    // Toolbar: search + Applications dropdown + Spec Ready + Sort.
    var APPLICATIONS = ['Hospitality','Residential','Healthcare','Education','Retail','Commercial','Industrial','Infrastructure'];
    var browseHtml =
      '<div class="bp3-section" id="bp3-products-section">'
        + '<div class="bp3-wrap">'
          // Product Overview intro
          + '<h2 class="bp3-h2">Product Overview</h2>'
          + '<p class="bp3-po-intro">Explore the complete product portfolio of '+esc(name)+'. Browse products by category, compare technical specifications, and access specification-ready resources for your projects.</p>'
          // Categories
          + '<h2 class="bp3-h2" style="margin-top:32px">Categories</h2>'
          + '<div class="bp3-cat-tiles">'
            + catTiles.map(function(c,i){
                return '<button type="button" class="bp3-cat-tile'+(i===0?' active':'')+'" data-cat="'+String(c.key).replace(/"/g,'&quot;')+'" onclick="bp3SelectCategory(this)">'
                  + '<span class="bp3-cat-tile-ic">'+icon(c.ic,20)+'</span>'
                  + '<span class="bp3-cat-tile-body"><span class="bp3-cat-tile-name">'+esc(c.name)+'</span><span class="bp3-cat-tile-count">'+c.count+'</span></span>'
                + '</button>';
              }).join('')
          + '</div>'
          // Toolbar
          + '<div class="bp3-prods-toolbar">'
            + '<div class="bp3-prods-search">'
              + '<input type="text" id="bp3ProdsSearch" placeholder="Search products…" oninput="bp3ApplyProdsFilter()">'
              + '<span class="bp3-prods-search-ic">'+icon('grid',14)+'</span>'
            + '</div>'
            + '<div class="bp3-prods-right">'
              // Applications — custom dropdown matching site style
              + '<div class="bp3-dd" id="bp3ProdsAppDD" data-value="">'
                + '<button type="button" class="bp3-dd-trigger" onclick="bp3DDToggle(\'bp3ProdsAppDD\')"><span class="bp3-dd-lbl">Applications</span>'+_bpChev()+'</button>'
                + '<div class="bp3-dd-panel">'
                  + '<button type="button" class="bp3-dd-opt active" data-value="" onclick="bp3DDPick(\'bp3ProdsAppDD\',\'\',\'Applications\',\'bp3ApplyProdsFilter\')">Applications</button>'
                  + APPLICATIONS.map(function(a){ return '<button type="button" class="bp3-dd-opt" data-value="'+a+'" onclick="bp3DDPick(\'bp3ProdsAppDD\',\''+a+'\',\''+a+'\',\'bp3ApplyProdsFilter\')">'+a+'</button>'; }).join('')
                + '</div>'
              + '</div>'
              + '<label class="bp3-prods-check"><input type="checkbox" id="bp3ProdsSpecReady" onchange="bp3ApplyProdsFilter()"><span>Specification Ready</span></label>'
              // Sort — custom dropdown
              + '<div class="bp3-dd" id="bp3ProdsSortDD" data-value="relevant">'
                + '<button type="button" class="bp3-dd-trigger" onclick="bp3DDToggle(\'bp3ProdsSortDD\')"><span style="color:#7a8496;font-weight:600;margin-right:6px">Sort by:</span><span class="bp3-dd-lbl">Most Relevant</span>'+_bpChev()+'</button>'
                + '<div class="bp3-dd-panel">'
                  + '<button type="button" class="bp3-dd-opt active" data-value="relevant" onclick="bp3DDPick(\'bp3ProdsSortDD\',\'relevant\',\'Most Relevant\',\'bp3ApplyProdsFilter\')">Most Relevant</button>'
                  + '<button type="button" class="bp3-dd-opt" data-value="az" onclick="bp3DDPick(\'bp3ProdsSortDD\',\'az\',\'Product Name (A–Z)\',\'bp3ApplyProdsFilter\')">Product Name (A–Z)</button>'
                  + '<button type="button" class="bp3-dd-opt" data-value="za" onclick="bp3DDPick(\'bp3ProdsSortDD\',\'za\',\'Product Name (Z–A)\',\'bp3ApplyProdsFilter\')">Product Name (Z–A)</button>'
                  + '<button type="button" class="bp3-dd-opt" data-value="newest" onclick="bp3DDPick(\'bp3ProdsSortDD\',\'newest\',\'Newest Products\',\'bp3ApplyProdsFilter\')">Newest Products</button>'
                + '</div>'
              + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="bp3-prods-count" id="bp3ProdsCount">'+prods.length+' products found</div>'
          + '<div class="prod-grid" id="bp3-browse-grid" style="margin-top:14px">'
            + (prods.length
                ? prods.slice(0,12).map(renderProdCard).join('')
                : '<div style="grid-column:1/-1;padding:36px;text-align:center;background:#fff;border:1px solid #eceff5;border-radius:12px;color:#7a8496;font-size:13px">No products listed yet.</div>')
          + '</div>'
          + '<div class="bp3-pagination" id="bp3ProdsPagination"></div>'
        + '</div>'
      + '</div>';

    // ═══ FEATURED PRODUCTS ═════════════════════════════════════════
    var featuredList = prods.slice(0,4);
    var featuredHtml =
      '<div class="bp3-section" id="bp3-featured-section">'
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

    // ═══ TYPICAL APPLICATIONS ═══════════════════════════════════════
    var APPLICATIONS = [
      {label:'Commercial',    ic:'building'},
      {label:'Education',     ic:'book'},
      {label:'Industrial',    ic:'factory'},
      {label:'Hospitality',   ic:'bed'},
      {label:'Retail',        ic:'cart'},
      {label:'Infrastructure',ic:'bridge'},
      {label:'Residential',   ic:'home'},
      {label:'Healthcare',    ic:'heart'}
    ];
    var applicationsHtml =
      '<div class="bp3-section" id="bp3-applications-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Typical Applications</h2>'
          + '<div class="bp3-apps-grid">'
            + APPLICATIONS.map(function(a){
                return '<div class="bp3-app-tile">'+icon(a.ic,16)+'<span>'+a.label+'</span></div>';
              }).join('')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ WHY SPECIFY THIS MANUFACTURER ══════════════════════════════
    var WHY_SPECIFY = [
      {label:'Specification Texts',   ic:'doc'},
      {label:'Technical Datasheets',  ic:'catalogue'},
      {label:'CAD & Drawings',        ic:'cad'},
      {label:'BIM Objects',           ic:'bim'},
      {label:'Certifications',        ic:'cert'},
      {label:'Installation Guides',   ic:'guide'},
      {label:'Sample Requests',       ic:'bag'},
      {label:'Technical Assistance',  ic:'msg'}
    ];
    var whySpecifyHtml =
      '<div class="bp3-section" id="bp3-whyspecify-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Why Specify This Manufacturer</h2>'
          + '<div class="bp3-why-grid">'
            + WHY_SPECIFY.map(function(w){
                return '<div class="bp3-why-item"><span class="bp3-why-ic">'+icon(w.ic,16)+'</span><span class="bp3-why-lbl">'+w.label+'</span></div>';
              }).join('')
          + '</div>'
        + '</div>'
      + '</div>';

    // ═══ PROJECTS ═══════════════════════════════════════════════════
    // 4 project cards — flat image + title + location (no card border/shadow), mirroring product-page "Recently Used In Projects".
    var projects = brand.projects || [
      {name:'Dubai Hills Business Park',   loc:'Dubai, UAE',        img:STOCK_PROJ[0]},
      {name:'Ritz-Carlton Hotel',          loc:'Riyadh, Saudi Arabia', img:STOCK_PROJ[1]},
      {name:'King Abdullah Financial District', loc:'Riyadh, Saudi Arabia', img:STOCK_PROJ[2]},
      {name:'American University in Dubai',loc:'Dubai, UAE',        img:STOCK_PROJ[3]}
    ];
    var projectsHtml =
      '<div class="bp3-section" id="bp3-projects-section">'
        + '<div class="bp3-wrap">'
          + '<div class="bp3-secthead">'
            + '<h2 class="bp3-h2">Recently Used In Projects</h2>'
            + '<a class="bp3-viewall bp3-viewall-caps" href="#projects" onclick="event.preventDefault();typeof showPage===\'function\'?showPage(\'projects\'):null">View All Projects '+icon('arrow',12)+'</a>'
          + '</div>'
          + '<div class="bp3-grid4 bp3-proj-grid">'+projects.slice(0,4).map(function(p){ return renderProjCard(p.name, p.loc, p.img); }).join('')+'</div>'
        + '</div>'
      + '</div>';

    // ═══ RESOURCES TAB ══════════════════════════════════════════════
    // Six grouped sections rendered as 2-col icon+metadata cards.
    // Structure: [{groupLabel, ic, items:[{name, format, size}]}]
    var RESOURCE_GROUPS = [
      { label:'Specification Resources', ic:'doc', items:[
        {name:'Specification Text',   format:'PDF', size:'0.3 MB'},
        {name:'CSI Specification',    format:'ZIP', size:'0.8 MB'},
        {name:'NBS Specification',    format:'ZIP', size:'0.8 MB'},
        {name:'Product Schedule',     format:'PDF', size:'0.5 MB'},
        {name:'BOQ Description',      format:'PDF', size:'0.4 MB'},
        {name:'Tender Description',   format:'PDF', size:'0.4 MB'}
      ]},
      { label:'Technical Documentation', ic:'doc', items:[
        {name:'Technical Datasheet',  format:'PDF', size:'0.9 MB'},
        {name:'Installation Guide',   format:'PDF', size:'1.8 MB'},
        {name:'Maintenance Guide',    format:'PDF', size:'0.6 MB'},
        {name:'Warranty',             format:'PDF', size:'0.2 MB'},
        {name:'Product Catalogue',    format:'PDF', size:'8.4 MB'},
        {name:'Product Brochure',     format:'PDF', size:'2.1 MB'}
      ]},
      { label:'Technical Drawings', ic:'grid', items:[
        {name:'PDF Drawings',         format:'PDF', size:'1.2 MB'},
        {name:'CAD Drawings',         format:'DWG', size:'2.1 MB'},
        {name:'BIM Models',           format:'RVT', size:'12.6 MB'}
      ]},
      { label:'Compliance & Testing', ic:'cert', items:[
        {name:'Test Reports',             format:'PDF', size:'1.4 MB'},
        {name:'Certificates',             format:'PDF', size:'0.6 MB'},
        {name:'Declaration of Performance', format:'PDF', size:'0.3 MB'},
        {name:'Regional Approvals',       format:'PDF', size:'0.5 MB'},
        {name:'Fire Reports',             format:'PDF', size:'1.1 MB'},
        {name:'Acoustic Reports',         format:'PDF', size:'0.9 MB'}
      ]},
      { label:'Sustainability', ic:'leaf', items:[
        {name:'EPD',                        format:'PDF', size:'0.4 MB'},
        {name:'LEED Contribution',          format:'PDF', size:'0.3 MB'},
        {name:'Recycled-Content Statement', format:'PDF', size:'0.2 MB'},
        {name:'VOC Certificate',            format:'PDF', size:'0.2 MB'},
        {name:'Environmental Certificates', format:'PDF', size:'0.5 MB'}
      ]},
      { label:'Company Documents', ic:'company', items:[
        {name:'Company Profile',      format:'PDF', size:'2.4 MB'},
        {name:'Corporate Brochure',   format:'PDF', size:'3.8 MB'},
        {name:'Brand Presentation',   format:'PDF', size:'6.2 MB'}
      ]}
    ];
    // Update the tab counter with the total items across all groups.
    var _resCount = RESOURCE_GROUPS.reduce(function(n,g){ return n + g.items.length; }, 0);
    var specResourcesHtml =
      '<div class="bp3-section" id="bp3-resources-section">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Technical Resources</h2>'
          + '<p class="bp3-po-intro">Access technical documentation, BIM content, certifications, specifications, installation guides and additional resources to support your project.</p>'
          + RESOURCE_GROUPS.map(function(g){
              return '<div class="bp3-res-group">'
                + '<div class="bp3-res-group-lbl">'+_esc(g.label)+'</div>'
                + '<div class="bp3-res-grid">'
                  + g.items.map(function(it){
                      return '<button type="button" class="bp3-res-item">'
                        + '<span class="bp3-res-ic">'+icon(g.ic,16)+'</span>'
                        + '<span class="bp3-res-body">'
                          + '<span class="bp3-res-name">'+_esc(it.name)+'</span>'
                          + '<span class="bp3-res-meta">'+_esc(it.format)+' · '+_esc(it.size)+'</span>'
                        + '</span>'
                      + '</button>';
                    }).join('')
                + '</div>'
              + '</div>';
            }).join('')
        + '</div>'
      + '</div>';
    // Legacy brand-resources section kept but hidden — the Resources tab now shows everything above.
    var brandResourcesHtml = '';
    // Expose resource count for the Resources tab label.
    window._bp3ResourceCount = _resCount;

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
      '<div class="bp3-section" id="bp3-gcc-section" style="border-bottom:none;padding-bottom:60px">'
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

    // ═══ CONTACT TAB ════════════════════════════════════════════════
    // 4 blocks: Company Information (5 icon tiles) + Contact Persons (4 cards) + Office Locations (3 cards) + Need Help CTA strip.
    var hqAddress = brand.hq_address || '24-26 Boulevard d\'Avranches, L-1160 Luxembourg, Luxembourg';
    var brandWebsite = website || 'www.'+String(name).toLowerCase().replace(/\s+/g,'')+'.com';
    var brandEmail = brand.email || 'info@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com';
    var brandPhone = brand.phone || '+352 4792 2000';
    var brandHours = brand.hours || 'Monday – Friday<br>8:30 AM – 5:30 PM (CET)';
    var CONTACT_PERSONS = [
      {role:'Sales Contact',         ic:'user',    name:'John Smith',        title:'Regional Sales Manager – GCC', email:'john.smith@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com', phone:'+971 50 123 4567'},
      {role:'Technical Support',     ic:'headset', name:'Sara Al Mansoori',  title:'Technical Support Engineer',    email:'sara.almansoori@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com', phone:'+971 50 987 6543'},
      {role:'Specification Support', ic:'doc',     name:'Michael Brown',     title:'Specification Manager',         email:'michael.brown@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com', phone:'+971 50 246 8101'},
      {role:'Customer Service',      ic:'user',    name:'Customer Care Team',title:'Customer Service',              email:'customerservice@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com', phone:'+971 4 123 4567'}
    ];
    var OFFICE_LOCATIONS = [
      {label:'Dubai Office',           addr:['Dubai Knowledge Park','Block 2A, Office 204','Dubai, UAE'],                phone:'+971 4 123 4567',    email:'dubai@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com'},
      {label:'Riyadh Office',          addr:['King Abdullah Financial District','Building 1.10, Office 303','Riyadh, KSA'], phone:'+966 11 123 4567', email:'riyadh@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com'},
      {label:'Luxembourg Headquarters',addr:['24-26 Boulevard d\'Avranches','L-1160 Luxembourg','Luxembourg'],           phone:'+352 4792 2000',    email:'luxembourg@'+String(name).toLowerCase().replace(/\s+/g,'')+'.com'}
    ];
    var contactHtml =
      '<div class="bp3-section" id="bp3-contact-section" style="border-bottom:none;padding-bottom:40px">'
        + '<div class="bp3-wrap">'
          + '<h2 class="bp3-h2">Get In Touch</h2>'
          + '<p class="bp3-po-intro">Contact the manufacturer directly or send your inquiry through ArchSpex. Whether you need technical information, samples, pricing, or specification support, we\'re here to help.</p>'
          // Company Information row
          + '<div class="bp3-res-group"><div class="bp3-res-group-lbl">Company Information</div>'
            + '<div class="bp3-cinfo-grid">'
              + '<div class="bp3-cinfo-item"><span class="bp3-cinfo-ic">'+icon('pin',18)+'</span><div class="bp3-cinfo-body"><div class="bp3-cinfo-lbl">Headquarters</div><div class="bp3-cinfo-val">'+_esc(hqAddress).replace(/,\s*/g,'<br>')+'</div></div></div>'
              + '<div class="bp3-cinfo-item"><span class="bp3-cinfo-ic">'+icon('globe',18)+'</span><div class="bp3-cinfo-body"><div class="bp3-cinfo-lbl">Website</div><a class="bp3-cinfo-link" href="'+_esc(brandWebsite.indexOf('http')===0?brandWebsite:'https://'+brandWebsite.replace(/^www\./,''))+'" target="_blank" rel="noopener">'+_esc(brandWebsite.replace(/^https?:\/\//,''))+'</a></div></div>'
              + '<div class="bp3-cinfo-item"><span class="bp3-cinfo-ic">'+icon('envelope',18)+'</span><div class="bp3-cinfo-body"><div class="bp3-cinfo-lbl">General Email</div><a class="bp3-cinfo-link" href="mailto:'+_esc(brandEmail)+'">'+_esc(brandEmail)+'</a></div></div>'
              + '<div class="bp3-cinfo-item"><span class="bp3-cinfo-ic">'+icon('phone',18)+'</span><div class="bp3-cinfo-body"><div class="bp3-cinfo-lbl">Telephone</div><a class="bp3-cinfo-link" href="tel:'+_esc(brandPhone.replace(/\s/g,''))+'">'+_esc(brandPhone)+'</a></div></div>'
              + '<div class="bp3-cinfo-item"><span class="bp3-cinfo-ic">'+icon('clock',18)+'</span><div class="bp3-cinfo-body"><div class="bp3-cinfo-lbl">Business Hours</div><div class="bp3-cinfo-val">'+brandHours+'</div></div></div>'
            + '</div>'
          + '</div>'
          // Contact Persons row
          + '<div class="bp3-res-group"><div class="bp3-res-group-lbl">Contact Persons</div>'
            + '<div class="bp3-cperson-grid">'
              + CONTACT_PERSONS.map(function(p){
                  return '<div class="bp3-cperson-card">'
                    + '<div class="bp3-cperson-top">'
                      + '<span class="bp3-cperson-ic">'+icon(p.ic,20)+'</span>'
                      + '<div class="bp3-cperson-titles">'
                        + '<div class="bp3-cperson-role">'+_esc(p.role)+'</div>'
                        + '<div class="bp3-cperson-name">'+_esc(p.name)+'</div>'
                        + '<div class="bp3-cperson-title">'+_esc(p.title)+'</div>'
                      + '</div>'
                    + '</div>'
                    + '<div class="bp3-cperson-line"><span class="bp3-cperson-lineic">'+icon('envelope',13)+'</span><a href="mailto:'+_esc(p.email)+'">'+_esc(p.email)+'</a></div>'
                    + '<div class="bp3-cperson-line"><span class="bp3-cperson-lineic">'+icon('phone',13)+'</span><a href="tel:'+_esc(p.phone.replace(/\s/g,''))+'">'+_esc(p.phone)+'</a></div>'
                  + '</div>';
                }).join('')
            + '</div>'
          + '</div>'
          // Office Locations row
          + '<div class="bp3-res-group"><div class="bp3-res-group-lbl">Office Locations</div>'
            + '<div class="bp3-office-grid">'
              + OFFICE_LOCATIONS.map(function(o){
                  return '<div class="bp3-office-card">'
                    + '<div class="bp3-office-head">'
                      + '<span class="bp3-office-ic">'+icon('pin',16)+'</span>'
                      + '<div class="bp3-office-titles">'
                        + '<div class="bp3-office-name">'+_esc(o.label)+'</div>'
                        + '<div class="bp3-office-addr">'+o.addr.map(_esc).join('<br>')+'</div>'
                      + '</div>'
                    + '</div>'
                    + '<div class="bp3-office-contacts">'
                      + '<div class="bp3-cperson-line"><span class="bp3-cperson-lineic">'+icon('phone',13)+'</span><a href="tel:'+_esc(o.phone.replace(/\s/g,''))+'">'+_esc(o.phone)+'</a></div>'
                      + '<div class="bp3-cperson-line"><span class="bp3-cperson-lineic">'+icon('envelope',13)+'</span><a href="mailto:'+_esc(o.email)+'">'+_esc(o.email)+'</a></div>'
                    + '</div>'
                  + '</div>';
                }).join('')
            + '</div>'
          + '</div>'
          // Need Help CTA strip
          + '<div class="bp3-needhelp">'
            + '<div class="bp3-needhelp-left">'
              + '<span class="bp3-needhelp-ic">'+icon('headset',22)+'</span>'
              + '<div>'
                + '<div class="bp3-needhelp-title">Need help?</div>'
                + '<div class="bp3-needhelp-sub">Can\'t find the right contact?<br>Please reach out to us and we\'ll connect you.</div>'
              + '</div>'
            + '</div>'
            + '<button class="bp3-needhelp-btn" onclick="typeof openReq===\'function\'?openReq(null):null">'+icon('envelope',14)+' Contact Us</button>'
          + '</div>'
        + '</div>'
      + '</div>';

    // Backbar sits OUTSIDE the white shell on grey — mirrors product page (.pp-page-header outside .pp-wrap).
    // Main shell holds hero → featured products.
    // Projects Using X gets its own detached shell below (mirrors product page's "Recently Used In Projects" card).
    page.innerHTML = backbarHtml
                   + '<div class="bp3-shell">' + heroHtml + statsHtml + tabsHtml + aboutHtml + portfolioHtml + browseHtml + applicationsHtml + whySpecifyHtml + specResourcesHtml + brandResourcesHtml + contactHtml + gccHtml + '</div>'
                   + '<div class="bp3-shell bp3-shell-secondary">' + projectsHtml + '</div>';

    if(typeof showPage === 'function') showPage('brandprofile');

    // Apply default tab AFTER page is visible so measurements are accurate.
    // Double rAF is a safety net: first frame lets showPage swap display,
    // second frame lets layout settle before we read getBoundingClientRect.
    try {
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          if(typeof window.bp3InitTabs === 'function') window.bp3InitTabs();
        });
      });
    } catch(e){
      if(typeof window.bp3InitTabs === 'function') window.bp3InitTabs();
    }
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

  // Tab switch — hide/show sections rather than scroll (matches product page behavior)
  window.bp3Tab = function(btn, id){
    try {
      document.querySelectorAll('#page-brandprofile .bp3-tab').forEach(function(t){ t.classList.remove('active'); });
      // If called programmatically without a button (e.g. bp3InitTabs), look it up by id.
      if(!btn) btn = document.querySelector('#page-brandprofile .bp3-tab[data-bp3-tab="'+id+'"]');
      if(btn && btn.classList) btn.classList.add('active');
      var map = {
        overview: ['bp3-about-section','bp3-portfolio-section','bp3-applications-section','bp3-whyspecify-section'],
        products: ['bp3-portfolio-section','bp3-products-section'],
        resources:['bp3-resources-section'],
        about:    ['bp3-about-section'],
        contact:  ['bp3-contact-section']
      };
      // Sections that are ALWAYS visible regardless of active tab (they sit in their own detached shell below).
      var ALWAYS_VISIBLE = ['bp3-projects-section'];
      var showIds = (map[id] || []).concat(ALWAYS_VISIBLE);
      document.querySelectorAll('#page-brandprofile .bp3-section').forEach(function(s){
        s.style.display = showIds.indexOf(s.id) >= 0 ? '' : 'none';
      });
      // Scroll to just below the sticky tab bar so content isn't hidden
      var tabsEl = document.querySelector('#page-brandprofile .bp3-tabs');
      if(tabsEl){
        var tabsTop = tabsEl.getBoundingClientRect().top + window.pageYOffset;
        if(window.pageYOffset > tabsTop){
          window.scrollTo({top: tabsTop, behavior:'instant'});
        }
      }
    } catch(e){}
  };
  // Initialize default tab (Overview) on first render
  window.bp3InitTabs = function(){
    try { window.bp3Tab(null, 'overview'); } catch(e){}
    // Clean up any leftover spacer from previous rAF-based attempts
    try {
      var oldSpacer = document.querySelector('#page-brandprofile .bp3-tabs-spacer');
      if(oldSpacer) oldSpacer.remove();
    } catch(e){}
    // Cancel any leftover rAF loop
    try {
      if(window._bp3StickyRaf){ cancelAnimationFrame(window._bp3StickyRaf); window._bp3StickyRaf = null; }
    } catch(e){}
  };

  // ─── PRODUCTS TAB: state + filter/sort/paginate ─────────────────
  window._bp3ProdsState = { cat:'', app:'', spec:false, sort:'relevant', page:1, perPage:12 };
  // Category tile click: sets state.cat + re-renders
  window.bp3SelectCategory = function(btn){
    try{
      var tiles = document.querySelectorAll('#page-brandprofile .bp3-cat-tile');
      tiles.forEach(function(t){ t.classList.remove('active'); });
      btn.classList.add('active');
      window._bp3ProdsState.cat = btn.getAttribute('data-cat') || '';
      window._bp3ProdsState.page = 1;
      window.bp3ApplyProdsFilter();
    }catch(e){ console.warn('bp3SelectCategory', e); }
  };
  // Read search/app/spec/sort inputs, filter list, paginate, render + pagination controls.
  window.bp3ApplyProdsFilter = function(){
    var st = window._bp3ProdsState || {};
    var all = window._bp3AllProds || [];
    // Read live control values
    var qEl = document.getElementById('bp3ProdsSearch');
    var appEl = document.getElementById('bp3ProdsAppDD');
    var specEl = document.getElementById('bp3ProdsSpecReady');
    var sortEl = document.getElementById('bp3ProdsSortDD');
    var q = (qEl && qEl.value || '').trim().toLowerCase();
    var app = (appEl && appEl.getAttribute('data-value') || '').trim();
    var spec = !!(specEl && specEl.checked);
    var sort = (sortEl && sortEl.getAttribute('data-value')) || 'relevant';
    // Filter
    var out = all.slice();
    if(st.cat){
      out = out.filter(function(p){
        var t = p.subtype || p.type || p.category || '';
        return String(t).toLowerCase() === String(st.cat).toLowerCase();
      });
    }
    if(q){
      out = out.filter(function(p){
        var hay = ((p.name||p.product_name||'') + ' ' + (p.subtype||p.type||p.category||'') + ' ' + (p.brand||'') + ' ' + (p.description||'')).toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    if(app){
      out = out.filter(function(p){
        var apps = (p.applications || p.suitable_applications || p.application || '');
        if(Array.isArray(apps)) return apps.some(function(a){ return String(a).toLowerCase() === app.toLowerCase(); });
        return String(apps).toLowerCase().indexOf(app.toLowerCase()) >= 0;
      });
    }
    if(spec){
      out = out.filter(function(p){
        var s = p.spec_ready || p.specification_ready || p.specReady;
        return s === true || String(s).toLowerCase() === 'true' || String(s).toLowerCase() === 'yes';
      });
    }
    // Sort
    if(sort === 'az') out.sort(function(a,b){ return String(a.name||a.product_name||'').localeCompare(String(b.name||b.product_name||'')); });
    else if(sort === 'za') out.sort(function(a,b){ return String(b.name||b.product_name||'').localeCompare(String(a.name||a.product_name||'')); });
    else if(sort === 'newest') out.sort(function(a,b){ return (b.id||0) - (a.id||0); });
    // Paginate
    var perPage = st.perPage || 12;
    var total = out.length;
    var pages = Math.max(1, Math.ceil(total / perPage));
    if(st.page > pages) st.page = pages;
    var start = (st.page - 1) * perPage;
    var pageItems = out.slice(start, start + perPage);
    // Render count
    var countEl = document.getElementById('bp3ProdsCount');
    if(countEl) countEl.textContent = total + (total === 1 ? ' product found' : ' products found');
    // Render grid
    var grid = document.getElementById('bp3-browse-grid');
    if(grid){
      if(!pageItems.length){
        grid.innerHTML = '<div style="grid-column:1/-1;padding:36px;text-align:center;background:#fff;border:1px solid #eceff5;border-radius:12px;color:#7a8496;font-size:13px">No products match your filters.</div>';
      } else {
        var render = (typeof prodCard === 'function') ? prodCard : (typeof renderProdCard === 'function' ? renderProdCard : null);
        grid.innerHTML = pageItems.map(function(p){
          if(render){ try{ return render(p); }catch(e){} }
          return '<div style="padding:14px">'+(p.name||'')+'</div>';
        }).join('');
      }
    }
    // Render pagination
    var pagEl = document.getElementById('bp3ProdsPagination');
    if(pagEl){
      if(pages <= 1){ pagEl.innerHTML = ''; }
      else {
        var html = '';
        var cur = st.page;
        // Prev
        html += '<button class="bp3-page-btn'+(cur===1?' disabled':'')+'" onclick="bp3GotoPage('+(cur-1)+')">‹</button>';
        // Page numbers with ellipsis
        function pbtn(n){ return '<button class="bp3-page-btn'+(n===cur?' active':'')+'" onclick="bp3GotoPage('+n+')">'+n+'</button>'; }
        if(pages <= 7){
          for(var i=1;i<=pages;i++) html += pbtn(i);
        } else {
          html += pbtn(1);
          if(cur > 3) html += '<span class="bp3-page-dots">…</span>';
          var from = Math.max(2, cur-1), to = Math.min(pages-1, cur+1);
          for(var i=from;i<=to;i++) html += pbtn(i);
          if(cur < pages-2) html += '<span class="bp3-page-dots">…</span>';
          html += pbtn(pages);
        }
        html += '<button class="bp3-page-btn'+(cur===pages?' disabled':'')+'" onclick="bp3GotoPage('+(cur+1)+')">›</button>';
        pagEl.innerHTML = html;
      }
    }
  };
  window.bp3GotoPage = function(n){
    window._bp3ProdsState.page = n;
    window.bp3ApplyProdsFilter();
    var el = document.getElementById('bp3-products-section');
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };

  // ─── Custom dropdown helpers (matching site style) ──────────────
  window.bp3DDToggle = function(id){
    try{
      var dd = document.getElementById(id);
      if(!dd) return;
      var wasOpen = dd.classList.contains('open');
      // Close any other open dropdown
      document.querySelectorAll('#page-brandprofile .bp3-dd.open').forEach(function(el){ el.classList.remove('open'); });
      if(!wasOpen) dd.classList.add('open');
    }catch(e){}
  };
  window.bp3DDPick = function(id, value, label, applyFn){
    try{
      var dd = document.getElementById(id);
      if(!dd) return;
      dd.setAttribute('data-value', value);
      dd.classList.remove('open');
      // Update trigger label + active state
      var lblEl = dd.querySelector('.bp3-dd-lbl');
      if(lblEl) lblEl.textContent = label;
      dd.querySelectorAll('.bp3-dd-opt').forEach(function(o){
        o.classList.toggle('active', o.getAttribute('data-value') === value);
      });
      if(applyFn && typeof window[applyFn] === 'function') window[applyFn]();
    }catch(e){}
  };
  // Close open dropdowns on outside click.
  document.addEventListener('click', function(e){
    try{
      var t = e.target;
      if(t.closest && t.closest('.bp3-dd')) return;
      document.querySelectorAll('#page-brandprofile .bp3-dd.open').forEach(function(el){ el.classList.remove('open'); });
    }catch(e){}
  }, true);

  // Legacy filter pill click — kept for portfolio card clicks that still call bp3FilterType.
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

// ─── Save Brand + Share (brand profile) ────────────────────────────
// Uses the shared window.SavedBrands store (defined in ax2.js).
(function(){
  window.toggleSaveBrand = function(id){
    if(!window.SavedBrands){ return; }
    var brand = (window._bpBrand && String(window._bpBrand.id) === String(id)) ? window._bpBrand : {id:id, name:'Brand'};
    var nowSaved = window.SavedBrands.toggle(brand);
    try{ if(typeof showToast === 'function') showToast(nowSaved ? 'Saved to your brands' : 'Removed from saved'); }catch(e){}
  };

  window.shareBrand = function(id){
    var url;
    try {
      var base = (location && location.origin) ? location.origin : '';
      url = base + '/brand/' + id;
    } catch(e){ url = (location && location.href) || ''; }
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
