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

let products=[], active='전체', limit=24;
const $=id=>document.getElementById(id), q=$('q'), sort=$('sort');
const hosts=['link.coupang.com','coupa.ng','coupang.com','www.coupang.com'];
function safeLink(link){try{const u=new URL(link);return u.protocol==='https:'&&hosts.includes(u.hostname)}catch{return false}}
function providerOf(p){try{return safeLink(p.link)?'coupang':'unknown'}catch{return 'unknown'}}
function fallback(art,p){art.querySelector('img')?.remove();if(art.querySelector('.fallback'))return;const el=document.createElement('div');el.className='fallback';const icon=document.createElement('span');icon.textContent=emojiOf(categoryOf(p));el.append(icon,document.createTextNode('상품 이미지를 준비하고 있어요'));art.append(el)}
function productLink(p){const a=document.createElement('a');a.href=p.link;a.target='_blank';a.rel='noopener noreferrer sponsored';return a}
function card(p,badge){const el=document.createElement('article');el.className='card';const art=productLink(p);art.className='art';art.setAttribute('aria-label',p.name);if(badge){const b=document.createElement('span');b.className='badge';b.textContent=badge;art.append(b)}
 if(typeof p.image==='string'&&p.image.startsWith('https://')){const img=document.createElement('img');img.src=p.image;img.alt=p.name||'상품 이미지';img.loading='lazy';img.decoding='async';img.width=400;img.height=400;img.addEventListener('error',()=>fallback(art,p),{once:true});art.append(img)}else fallback(art,p);
 const body=document.createElement('div');body.className='body';const vendor=document.createElement('span');const type=providerOf(p);vendor.className='provider '+type;vendor.textContent='COUPANG ? 쿠팡';const title=document.createElement('h3');title.className='name';const titleLink=productLink(p);titleLink.textContent=p.name||'상품';title.append(titleLink);const cat=document.createElement('div');cat.className='card-category';cat.textContent=categoryOf(p);const note=document.createElement('div');note.className='price-note';note.textContent='가격은 판매처에서 확인';const link=productLink(p);link.className='buy';link.textContent='쿠팡에서 상품 보기 ↗';link.setAttribute('aria-label',`${p.name} · ${link.textContent}`);body.append(vendor,title,cat,note,link);el.append(art,body);return el}
function renderCards(id,rows,badge){$(id).replaceChildren(...rows.map(p=>card(p,badge)))}
function setCategory(cat){active=cat;limit=24;render();$('shop').scrollIntoView({behavior:'smooth'})}
function setup(){const cats=['전체',...new Set(products.map(categoryOf))];$('filters').replaceChildren();cats.forEach(cat=>{const b=document.createElement('button');b.type='button';b.textContent=cat;b.dataset.category=cat;b.onclick=()=>setCategory(cat);$('filters').append(b)});
 const featured=['냄비·프라이팬','조리도구','주방가전','식기·주방소품','정육·고기','과일·제철과일'];$('featuredCats').replaceChildren();featured.filter(cat=>products.some(p=>categoryOf(p)===cat)).forEach(cat=>{const b=document.createElement('button');b.type='button';b.className='category';b.dataset.category=cat;const icon=document.createElement('span');icon.textContent=emojiOf(cat);icon.setAttribute('aria-hidden','true');const title=document.createElement('strong');title.textContent=cat;const n=document.createElement('small');n.textContent=products.filter(p=>categoryOf(p)===cat).length+'개 상품';b.append(icon,title,n);b.onclick=()=>setCategory(cat);$('featuredCats').append(b)});
 const picks=featured.slice(0,4).map(cat=>products.find(p=>categoryOf(p)===cat)).filter(Boolean);renderCards('recommended',picks,'PICK');renderCards('new-products',products.slice(-4).reverse(),'NEW');
 const hero=picks[0];if(hero?.image){const img=document.createElement('img');img.src=hero.image;img.alt=hero.name;img.fetchPriority='high';img.width=480;img.height=315;img.onerror=()=>fallback($('hero-art'),hero);$('hero-art').prepend(img)}render()}
function filtered(){const search=q.value.trim().toLocaleLowerCase('ko');let rows=products.filter(p=>(active==='전체'||categoryOf(p)===active)&&[p.name,p.description,categoryOf(p)].join(' ').toLocaleLowerCase('ko').includes(search));if(sort.value==='recent')rows.reverse();if(sort.value==='name')rows.sort((a,b)=>String(a.name).localeCompare(String(b.name),'ko'));return rows}
function render(){const rows=filtered();document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===active)));$('count').textContent=`총 ${rows.length}개 상품 · ${Math.min(limit,rows.length)}개 표시`;
 renderCards('grid',rows.slice(0,limit));$('grid').setAttribute('aria-busy','false');if(!rows.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='조건에 맞는 상품이 없어요. 다른 검색어나 카테고리를 선택해 주세요.';const b=document.createElement('button');b.textContent='검색 및 필터 초기화';b.onclick=reset;empty.append(b);$('grid').append(empty)}$('load-more').hidden=rows.length<=limit}
function reset(){active='전체';q.value='';sort.value='recent';limit=24;render()}
q.addEventListener('input',()=>{limit=24;render()});$('search-form').addEventListener('submit',e=>{e.preventDefault();$('shop').scrollIntoView({behavior:'smooth'})});sort.addEventListener('change',()=>{limit=24;render()});$('reset').onclick=reset;$('load-more').onclick=()=>{limit+=24;render()};
fetch('./products.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{if(!Array.isArray(data)||data.some(p=>!p||typeof p!=='object'))throw Error('상품 데이터 형식을 확인해 주세요');products=data.filter(p=>providerOf(p)==='coupang');setup()}).catch(()=>{$('grid').setAttribute('aria-busy','false');$('grid').textContent='상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';$('count').textContent='상품 로딩 실패';const b=document.createElement('button');b.className='loadmore';b.textContent='다시 불러오기';b.onclick=()=>location.reload();$('grid').append(b)});
