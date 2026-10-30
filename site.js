'use strict';
const CATEGORY_INFO=[['정육·고기','🥩',['한우','소고기','쇠고기','등심','안심','채끝','갈비','불고기','육회','돼지고기','삼겹살','목살','이베리코','한돈','닭고기','닭다리','오리고기','정육','스테이크']],['과일·제철과일','🍎',['과일','애플망고','망고','사과','배세트','배즙','감귤','귤','딸기','포도','샤인머스캣','복숭아','수박','멜론','참외','체리','블루베리','키위','레몬','오렌지','자두','감']],['채소·농산물','🥬',['채소','야채','버섯','배추','대파','양파','마늘','무우','무  ','고구마','감자','시금치','나물','당근','양배추','상추']],['수산·해산물','🐟',['생선','수산','해산물','전복','새우','고등어','갈치','연어','굴비','오징어','문어','꽃게','김세트','멸치','장어','대게']],['쌀·곡물·견과','🌾',['쌀','현미','잡곡','귀리','견과','호두','아몬드','콩류','누룽지']],['양념·소스·식재료','🧂',['양념','소스','간장','고추장','된장','참기름','들기름','올리브유','식용유','식초','고춧가루','소금','설탕']],['가공식품·간편식','🍲',['밀키트','간편식','즉석','냉동','만두','떡갈비','곰탕','국밥','반찬','김치','햄','소시지']],['간식·디저트','🍰',['과자','쿠키','케이크','초콜릿','디저트','떡세트','베이커리','빵세트']],['음료·차·커피','☕',['커피','차세트','녹차','홍차','주스','음료','탄산']],['냄비·프라이팬','🍳',['프라이팬','후라이팬','팬세트','냄비','그린팬','웍','무쇠팬']],['조리도구','🔪',['조리도구','도마','칼세트','식칼','채칼','국자','뒤집개','집게','다지기']],['주방가전','⚡',['에어프라이어','믹서기','블렌더','전자레인지','오븐','전기밥솥','인덕션','전기포트']],['보관·정리용품','🥡',['밀폐용기','보관용기','지퍼백','수납','정리함','보관통']],['식기·주방소품','🍽️',['접시','그릇','수저','젓가락','식기','머그컵','와인잔']],['주방세척·위생','🧽',['수세미','세제','행주','고무장갑','키친타월']],['선물세트·기타','🎁',[]]];
// products.json의 category_override가 있으면 최우선 적용. 기존 category와 링크는 수정하지 않음.
function categoryOf(p){
 if(p.category_override)return p.category_override;
 const cat=String(p.category||'').trim();
 // Always honor V33 server-side category first; fallback inference only for legacy items.
 if(CATEGORY_INFO.some(c=>c[0]===cat))return cat;
 if(cat==='프라이팬'||cat==='냄비')return '냄비·프라이팬';
 if(cat==='칼·도마')return '조리도구';
 const name=String(p.name||'').toLowerCase();
 if(/보조배터리|충전기|이어폰/.test(name))return '선물세트·기타';
 if(/진공\s*포장기|식품\s*건조기|건조기|포장기/.test(name))return '주방가전';
 if(/마카롱|뚱카롱/.test(name))return '간식·디저트';
 for(const [label,,keywords] of CATEGORY_INFO){if(keywords.some(k=>name.includes(k.toLowerCase())))return label}
 return cat||'선물세트·기타';
}
function emojiOf(cat){return CATEGORY_INFO.find(c=>c[0]===cat)?.[1]||'🛍️'}

let products=[], videos=[], active='전체', limit=24;
const $=id=>document.getElementById(id),q=$('q'),sort=$('sort');
const hosts=['link.coupang.com','coupa.ng','coupang.com','www.coupang.com','gift-link.kakao.com'];
function safeLink(link){try{const u=new URL(link);return u.protocol==='https:'&&hosts.includes(u.hostname)&&!u.username&&!u.password}catch{return false}}
function providerOf(p){try{return new URL(p.link).hostname==='gift-link.kakao.com'?'kakao':safeLink(p.link)?'coupang':'unknown'}catch{return 'unknown'}}
const providerRank=p=>providerOf(p)==='coupang'?0:1;
const params=new URLSearchParams(location.search);
const campaign={source:params.get('utm_source')||'direct',medium:params.get('utm_medium')||'unknown',campaign:params.get('utm_campaign')||'none'};
// Explicit local opt-in only: no remote endpoint, IDs, fingerprint, or purchase inference.
const STORAGE='ott-local-events-v1',OPTIN='ott-local-metrics-v1';
function enabled(){try{return localStorage.getItem(OPTIN)==='yes'}catch{return false}}
function events(){try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return []}}
function record(type,product=null){if(!enabled())return;try{const allow=['longform','shorts','instagram','naver_clip','youtube_profile','instagram_profile','blog','direct'];const source=allow.includes(campaign.source)?campaign.source:'other';const e={time:new Date().toISOString(),type,source,medium:['organic','profile'].includes(campaign.medium)?campaign.medium:'unknown',campaign:campaign.campaign==='recipe14'?'recipe14':'none',video:$('video-select').value||null,product:product?.id||null,provider:product?providerOf(product):null};localStorage.setItem(STORAGE,JSON.stringify([...events(),e].slice(-2000)))}catch{}}
function metricsStatus(){$('metrics-toggle').textContent=enabled()?'로컬 기록 끄기':'로컬 기록 켜기';$('metrics-status').textContent=`이 브라우저 기록 ${events().length}건 · ${enabled()?'켜짐':'꺼짐'} · 전체 실적 아님`}
$('metrics-toggle').onclick=()=>{try{localStorage.setItem(OPTIN,enabled()?'no':'yes');if(enabled())record('page_view');metricsStatus()}catch{$('metrics-status').textContent='브라우저 저장 불가'}};
$('metrics-clear').onclick=()=>{try{localStorage.removeItem(STORAGE);localStorage.removeItem(OPTIN)}catch{}metricsStatus()};
$('metrics-export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({scope:'this_browser_only',events:events()},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='one-tasty-touch-local-events.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
function fallback(art,p){art.querySelector('img')?.remove();if(art.querySelector('.fallback'))return;const el=document.createElement('div');el.className='fallback';el.textContent=(p.emoji||emojiOf(categoryOf(p)))+' 상품 이미지 준비 중';art.append(el)}
function productLink(p){const a=document.createElement('a');a.href=p.link;a.target='_blank';a.rel='noopener noreferrer sponsored';a.addEventListener('click',()=>{record('outbound_click',p);metricsStatus()});return a}
function card(p,badge,selection){const el=document.createElement('article');el.className='card';el.dataset.productId=p.id;const art=productLink(p);art.className='art';art.setAttribute('aria-label',p.name);if(badge){const b=document.createElement('span');b.className='badge';b.textContent=badge;art.append(b)}
 if(typeof p.image==='string'&&p.image.startsWith('https://')){const img=document.createElement('img');img.src=p.image;img.alt=p.name;img.loading='lazy';img.decoding='async';img.width=400;img.height=400;img.addEventListener('error',()=>fallback(art,p),{once:true});art.append(img)}else fallback(art,p);
 const body=document.createElement('div');body.className='body';const vendor=document.createElement('span');const type=providerOf(p);vendor.className='provider '+type;vendor.textContent=type==='coupang'?'COUPANG · 쿠팡':'KAKAO · 카카오 선물하기';const title=document.createElement('h3');title.className='name';const titleLink=productLink(p);titleLink.textContent=p.name;title.append(titleLink);const cat=document.createElement('div');cat.className='card-category';cat.textContent=categoryOf(p);body.append(vendor,title,cat);
 if(selection){const note=document.createElement('div');note.className='selection-note';for(const [label,key] of [['필요한 분','who'],['쓰임','use'],['선택 전 확인','caution']]){const strong=document.createElement('strong');strong.textContent=label;note.append(strong,document.createTextNode(selection[key]))}body.append(note)}
 const price=document.createElement('p');price.className='price-note';price.textContent='가격·재고·배송·반품 조건은 판매처에서 확인';const link=productLink(p);link.className='buy';link.textContent=(type==='coupang'?'쿠팡':'카카오 선물하기')+'에서 상품 확인 ↗';link.setAttribute('aria-label',p.name+' · '+link.textContent);body.append(price,link);el.append(art,body);return el}
function renderCards(id,rows,badge){$(id).replaceChildren(...rows.map(p=>card(p,badge)))}
function setCategory(cat){active=cat;limit=24;render();$('shop').scrollIntoView({behavior:'smooth'})}
function videoRender(){const id=$('video-select').value;const v=videos.find(v=>v.id===id);$('video-products').replaceChildren();if(!v){$('video-status').textContent=id?'등록되지 않은 영상입니다. 아래에서 다른 영상을 선택하거나 상품을 검색하세요.':'요리별로 관련성이 높은 상품만 보여드립니다.';return}const matches=v.products.slice(0,3).map(s=>({s,p:products.find(p=>p.id===s.id)})).filter(x=>x.p).sort((a,b)=>providerRank(a.p)-providerRank(b.p));$('video-status').textContent=v.title+' · 관련 상품 '+matches.length+'개 · 구매는 선택입니다.';$('video-products').replaceChildren(...matches.map(({s,p})=>card(p,'요리 관련 상품',s)))}
function setup(){const cats=['전체',...new Set(products.map(categoryOf))];$('filters').replaceChildren();cats.forEach(cat=>{const b=document.createElement('button');b.type='button';b.textContent=cat;b.dataset.category=cat;b.onclick=()=>setCategory(cat);$('filters').append(b)});
 $('featuredCats').replaceChildren();cats.slice(1,7).forEach(cat=>{const b=document.createElement('button');b.type='button';b.className='category';b.dataset.category=cat;const icon=document.createElement('span');icon.textContent=emojiOf(cat);const title=document.createElement('strong');title.textContent=cat;b.append(icon,title);b.onclick=()=>setCategory(cat);$('featuredCats').append(b)});
 const picks=videos.flatMap(v=>v.products).map(s=>products.find(p=>p.id===s.id)).filter(Boolean).filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,4);renderCards('recommended',picks,'요리 관련 상품');renderCards('new-products',products.slice().sort((a,b)=>providerRank(a)-providerRank(b)).slice(0,4),'등록 상품');render();
 const hero=picks[0];if(hero?.image){const img=document.createElement('img');img.src=hero.image;img.alt=hero.name;img.width=480;img.height=315;img.onerror=()=>fallback($('hero-art'),hero);$('hero-art').prepend(img)}
 for(const v of videos){const o=document.createElement('option');o.value=v.id;o.textContent=v.title;$('video-select').append(o)}
 const requested=params.get('video');if(requested){if(!videos.some(v=>v.id===requested)){const o=document.createElement('option');o.value=requested;o.textContent='등록되지 않은 영상';$('video-select').append(o)}$('video-select').value=requested}videoRender();record('page_view');metricsStatus();
}
$('video-select').onchange=()=>{const u=new URL(location.href);u.searchParams.set('video',$('video-select').value);history.replaceState(null,'',u);videoRender();record('video_select')};
function filtered(){const search=q.value.trim().toLocaleLowerCase('ko');let rows=products.filter(p=>(active==='전체'||categoryOf(p)===active)&&[p.name,p.description,categoryOf(p)].join(' ').toLocaleLowerCase('ko').includes(search));if(sort.value==='recent')rows.reverse();if(sort.value==='name')rows.sort((a,b)=>String(a.name).localeCompare(String(b.name),'ko'));return rows.sort((a,b)=>providerRank(a)-providerRank(b))}
function render(){const rows=filtered();document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===active)));$('count').textContent=`총 ${rows.length}개 상품 · ${Math.min(limit,rows.length)}개 표시 · 쿠팡 우선`;renderCards('grid',rows.slice(0,limit));$('grid').setAttribute('aria-busy','false');if(!rows.length){const e=document.createElement('div');e.className='empty';e.textContent='검색 결과가 없습니다. 다른 검색어 또는 카테고리를 선택하세요.';$('grid').append(e)}$('load-more').hidden=rows.length<=limit}
function reset(){active='전체';q.value='';sort.value='recent';limit=24;render()}
q.addEventListener('input',()=>{limit=24;render()});$('search-form').addEventListener('submit',e=>{e.preventDefault();$('shop').scrollIntoView({behavior:'smooth'})});sort.addEventListener('change',()=>{limit=24;render()});$('reset').onclick=reset;$('load-more').onclick=()=>{limit+=24;render()};
async function getJson(file){const r=await fetch(file);if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
getJson('./products.json').then(async data=>{if(!Array.isArray(data)||data.some(p=>!p||typeof p!=='object'))throw Error('Invalid catalog');products=data.filter(p=>typeof p.id==='string'&&typeof p.name==='string'&&safeLink(p.link));try{videos=await getJson('./video_products.json');if(!Array.isArray(videos))throw Error('Invalid videos')}catch{videos=[];$('video-status').textContent='영상별 목록을 불러오지 못했습니다. 전체 상품 검색을 이용하세요.'}setup();if(!videos.length)$('video-status').textContent='영상별 목록을 불러오지 못했습니다. 전체 상품 검색을 이용하세요.'}).catch(()=>{$('grid').setAttribute('aria-busy','false');$('grid').textContent='상품을 불러오지 못했습니다. 잠시 후 다시 시도하세요.';$('count').textContent='상품 로딩 실패';const b=document.createElement('button');b.className='loadmore';b.textContent='다시 불러오기';b.onclick=()=>location.reload();$('grid').append(b)});
// Prepared GA4 collector. Deliberately disabled; no fake measurement ID.
const GA4_CONFIG = Object.freeze({enabled:false, measurementId:''});
function ga4Event(name, params={}) {
 if(!GA4_CONFIG.enabled || !/^G-[A-Z0-9]+$/.test(GA4_CONFIG.measurementId)) return;
 if(typeof window.gtag==='function') window.gtag(name==='page_view'?'event':'event',name,params);
}
if(GA4_CONFIG.enabled && /^G-[A-Z0-9]+$/.test(GA4_CONFIG.measurementId)) {
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments)};
 const tag=document.createElement('script');tag.async=true;
 tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA4_CONFIG.measurementId);
 document.head.append(tag);window.gtag('js',new Date());
 window.gtag('config',GA4_CONFIG.measurementId,{send_page_view:false});
 ga4Event('page_view',{page_location:location.origin+location.pathname,referrer_host:document.referrer?new URL(document.referrer).hostname:''});
 document.addEventListener('click',e=>{const a=e.target.closest('a.buy');if(!a)return;
  const host=new URL(a.href).hostname;
  ga4Event('product_click',{provider:host.includes('kakao')?'kakao':'coupang',video:new URLSearchParams(location.search).get('video')||'',utm_source:new URLSearchParams(location.search).get('utm_source')||''});
 });
}
