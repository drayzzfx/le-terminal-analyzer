(function(){
  if(typeof window==='undefined') return;
  var sid=sessionStorage.getItem('_lt_sid');
  if(!sid){ sid=Math.random().toString(36).slice(2)+Date.now().toString(36); sessionStorage.setItem('_lt_sid',sid); }
  var t0=Date.now(), ended=false;
  var page=location.pathname.replace(/\/$/,'').split('/').pop()||'index';

  function uid(){ try{ return localStorage.getItem('ta_user_id')||''; }catch(e){ return ''; } }
  function email(){ try{ return localStorage.getItem('ta_email')||''; }catch(e){ return ''; } }

  function send(type,extra){
    var d=Object.assign({event_type:type,page:page,session_id:sid,user_id:uid()||undefined,user_email:email()||undefined,referrer:document.referrer||undefined},extra||{});
    if(!d.user_id) delete d.user_id;
    if(!d.user_email) delete d.user_email;
    if(!d.referrer) delete d.referrer;
    var body=JSON.stringify(d);
    // Beacon en Blob typé application/json → l'API reçoit un vrai JSON (sendBeacon
    // envoie sinon en text/plain, non parsé côté serveur). Repli fetch keepalive.
    try{
      var blob=new Blob([body],{type:'application/json'});
      if(navigator.sendBeacon && navigator.sendBeacon('/api/track',blob)) return;
    }catch(e){}
    try{ fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true}); }catch(e){}
  }

  // pageview (une connexion / vue de page)
  send('pageview');

  // session_end avec durée — une seule fois (beforeunload / pagehide / onglet caché)
  function endSession(){
    if(ended) return; ended=true;
    send('session_end',{duration_s:Math.round((Date.now()-t0)/1000)});
  }
  window.addEventListener('beforeunload',endSession);
  window.addEventListener('pagehide',endSession);
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='hidden') endSession();
  });
})();
