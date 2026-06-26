(function(){
  if(typeof window==='undefined') return;
  var sid=sessionStorage.getItem('_lt_sid');
  if(!sid){ sid=Math.random().toString(36).slice(2)+Date.now().toString(36); sessionStorage.setItem('_lt_sid',sid); }
  var t0=Date.now();
  var page=location.pathname.replace(/\/$/,'').split('/').pop()||'index';

  function uid(){ try{ return localStorage.getItem('ta_user_id')||''; }catch(e){ return ''; } }
  function email(){ try{ return localStorage.getItem('ta_email')||''; }catch(e){ return ''; } }

  function send(type,extra){
    var d=Object.assign({event_type:type,page:page,session_id:sid,user_id:uid()||undefined,user_email:email()||undefined,referrer:document.referrer||undefined},extra||{});
    if(!d.user_id) delete d.user_id;
    if(!d.user_email) delete d.user_email;
    if(!d.referrer) delete d.referrer;
    try{ navigator.sendBeacon('/api/track',JSON.stringify(d)); }catch(e){}
  }

  // pageview
  send('pageview');

  // session_end avec durée
  window.addEventListener('beforeunload',function(){
    send('session_end',{duration_s:Math.round((Date.now()-t0)/1000)});
  });
  // visibilitychange comme fallback mobile
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='hidden') send('session_end',{duration_s:Math.round((Date.now()-t0)/1000)});
  });
})();
