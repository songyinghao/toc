!function(e){"use strict";e.tocVersion="0.9.1",e.tocProd=!0;var t=e.location.search;if("?inviteid="===t.substr(0,10)){var o=t.substr(10,64);e.localStorage.setItem("toc-state-local.contacts.invites."+o,"true")}e.tocState={destroy:function(){e.localStorage.clear();var t=e.indexedDB.open("remotestorage");t.onerror=function(e){console.log("IndexedDB open failed: "+e.target.errorCode)},t.onsuccess=function(t){var o=t.target.result,n=o.transaction(["nodes"],"readwrite").objectStore("nodes").clear();n.onerror=function(e){console.log("IndexedDB clear failed: "+e.target.errorCode)},n.onsuccess=function(t){e.setTimeout(function(){e.location.reload()},0)}}}};var n=e.document.getElementsByClassName("toc-body")[0],r=e.document.getElementsByClassName("toc-app-link"),c=function(t){return t.preventDefault(),n.classList.add("toc-hide"),setTimeout(function(){e.location.href="app/"},1e3)};e.Array.prototype.forEach.call(r,function(e,t){e.addEventListener("click",c)});var a=e.document.getElementsByClassName("toc-anchor-scroll-link"),l=e.Array.prototype.map.call(a,function(t){var o=t.dataset.tocScroll;return function(t){e.location.href="#"+o}});e.Array.prototype.forEach.call(a,function(e,t){e.addEventListener("click",l[t])});var i=e.document.documentElement.style.scrollBehavior;if(void 0===i){var s=function(){!function(e,t){"function"==typeof define&&define.amd?define(["exports"],t):t("undefined"!=typeof exports?exports:e.naturalScroll={})}(e,function(t){var o=[[],[]],n="scrollTop",r="scrollLeft",c=function(t){return function(c,a,l){c=c.scroller||c,l=l||600;for(var i,s,u=o[t?0:1],f=t?n:r,d=0,m=c[f],v=0,p=0;d<u.length;d++)i=u[d].e==c?u[d]:i;i?(v=i.f[1],p=i.f[2]):u.push(i={e:c}),i.t=(new Date).getTime()+l;var y=i.n=l,g=y*y,E=g*y,h=m-a;i.f=[m,v,p,-(9*p*g+(36*v-9*p)*y-36*v+60*h)/(E-y),6*(6*p*g+(32*v-6*p)*y-32*v+60*h)/y/(E+2*g-y-2),-60*(p*g+(6*v-p)*y-6*v+12*h)/y/(g*g+5*(E+g-y)-6)],(s=function(t){for(;i.n&&i.n>i.t-(new Date).getTime();){for(t=4;t+1;)i.f[t]+=i.f[t--+1];i.n--}c[f]=i.f[0],i.n?(e.requestAnimationFrame||setTimeout(s,1),requestAnimationFrame(s)):i.f[1]=i.f[2]=0})()}};t[n]=c(t[r]=c())})};s();var u=e.document.getElementsByClassName("toc-body")[0];e.Array.prototype.forEach.call(a,function(t,o){var n=t.dataset.tocScroll,r=e.document.getElementById(n);t.removeEventListener("click",l[o]),t.addEventListener("click",function(o){if(!o.invokeDefault){o.preventDefault();var n=r.getBoundingClientRect().top+document.body.scrollTop;e.naturalScroll.scrollTop(u,n),e.setTimeout(function(){var o=new MouseEvent("click",{view:e,bubbles:!0,cancelable:!0});o.invokeDefault=!0,t.dispatchEvent(o)},600)}})})}}(window);