// ============================================================
// app.js — Couche de robustesse centrale — La Croix Glorieuse
// ============================================================
const APP = { TIMEOUT_MS:5000, RETRY_COUNT:2, RETRY_DELAY:800, CACHE_TTL:300000 };

function esc(str) {
    if (str===null||str===undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function debounce(fn,delay=300){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay);};}
function hapticFeedback(ms=15){if(window.navigator?.vibrate)window.navigator.vibrate(ms);}

function showToast(message,type='info',duration=3500){
    const e=document.getElementById('app-toast');if(e)e.remove();
    const colors={success:'#16a34a',error:'#dc2626',info:'#1e293b',warn:'#d97706'};
    const t=document.createElement('div');t.id='app-toast';t.setAttribute('role','alert');
    t.style.cssText=`position:fixed;top:20px;left:16px;right:16px;z-index:9999;padding:14px 18px;border-radius:16px;color:white;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.25);opacity:0;transform:translateY(-8px);transition:all 0.25s cubic-bezier(0.175,0.885,0.32,1.275);background:${colors[type]||colors.info};`;
    t.textContent=message;document.body.appendChild(t);
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateY(0)';});
    setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(-8px)';setTimeout(()=>t.remove(),300);},duration);
}

const _cache={
    get(k){try{const r=localStorage.getItem('lcg_cache_'+k);if(!r)return null;const{data,ts}=JSON.parse(r);if(Date.now()-ts>APP.CACHE_TTL){localStorage.removeItem('lcg_cache_'+k);return null;}return data;}catch{return null;}},
    set(k,d){try{localStorage.setItem('lcg_cache_'+k,JSON.stringify({data:d,ts:Date.now()}));}catch{}}
};

async function sbFetch(queryFn,{cacheKey=null,forceRefresh=false}={}){
    if(cacheKey&&!forceRefresh){const c=_cache.get(cacheKey);if(c!==null)return{data:c,error:null,fromCache:true};}
    let lastError=null;
    for(let i=0;i<=APP.RETRY_COUNT;i++){
        if(i>0)await new Promise(r=>setTimeout(r,APP.RETRY_DELAY*i));
        try{
            const result=await Promise.race([queryFn(),new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),APP.TIMEOUT_MS))]);
            if(!result.error){if(cacheKey)_cache.set(cacheKey,result.data);return result;}
            lastError=result.error;
        }catch(err){lastError=err;if(err.message!=='timeout'&&i===0)break;}
    }
    if(cacheKey){try{const r=localStorage.getItem('lcg_cache_'+cacheKey);if(r){const{data}=JSON.parse(r);return{data,error:null,fromCache:true,stale:true};}}catch{}}
    return{data:null,error:lastError};
}

async function loadSection({containerId,queryFn,renderFn,emptyMsg='Aucun contenu.',cacheKey=null,forceRefresh=false}){
    const c=document.getElementById(containerId);if(!c)return;
    const{data,error}=await sbFetch(queryFn,{cacheKey,forceRefresh});
    if(error&&!data){c.innerHTML=`<div class="text-center py-10 space-y-2"><p class="text-2xl">📡</p><p class="text-sm font-bold text-slate-500">Connexion indisponible</p><p class="text-xs text-slate-400">Réessayez dans quelques instants.</p><button onclick="location.reload()" class="mt-2 text-[10px] font-black text-red-600 uppercase tracking-widest">Réessayer</button></div>`;return;}
    if(!data||(Array.isArray(data)&&data.length===0)){c.innerHTML=`<p class="text-center text-xs text-slate-400 italic py-10">${esc(emptyMsg)}</p>`;return;}
    c.innerHTML=renderFn(data);
}

window.APP=APP;window.esc=esc;window.debounce=debounce;window.hapticFeedback=hapticFeedback;
window.showToast=showToast;window.sbFetch=sbFetch;window.loadSection=loadSection;
