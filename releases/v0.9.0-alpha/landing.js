!function(e){"use strict";var t=e.location.search;if("?inviteid="===t.substr(0,10)){var o=t.substr(10,64);e.localStorage.setItem("toc-state-local.contacts.invites."+o,"true")}e.tocState={destroy:function(){e.localStorage.clear();var t=e.indexedDB.open("remotestorage");t.onerror=function(e){console.log("IndexedDB open failed: "+e.target.errorCode)},t.onsuccess=function(t){var o=t.target.result,n=o.transaction(["nodes"],"readwrite").objectStore("nodes").clear();n.onerror=function(e){console.log("IndexedDB clear failed: "+e.target.errorCode)},n.onsuccess=function(t){e.setTimeout(function(){e.location.reload()},0)}}}};var n=e.document.getElementsByClassName("toc-anchor-scroll-link"),r=e.Array.prototype.map.call(n,function(t){var o=t.dataset.tocScroll;return function(t){e.location.href="#"+o}});e.Array.prototype.forEach.call(n,function(e,t){e.addEventListener("click",r[t])});var c=e.document.documentElement.style.scrollBehavior;if(void 0===c){var a=function(){!function(e,t){"function"==typeof define&&define.amd?define(["exports"],t):t("undefined"!=typeof exports?exports:e.naturalScroll={})}(e,function(t){var o=[[],[]],n="scrollTop",r="scrollLeft",c=function(t){return function(c,a,l){c=c.scroller||c,l=l||600;for(var i,s,u=o[t?0:1],f=t?n:r,d=0,v=c[f],m=0,p=0;d<u.length;d++)i=u[d].e==c?u[d]:i;i?(m=i.f[1],p=i.f[2]):u.push(i={e:c}),i.t=(new Date).getTime()+l;var g=i.n=l,y=g*g,E=y*g,b=v-a;i.f=[v,m,p,-(9*p*y+(36*m-9*p)*g-36*m+60*b)/(E-g),6*(6*p*y+(32*m-6*p)*g-32*m+60*b)/g/(E+2*y-g-2),-60*(p*y+(6*m-p)*g-6*m+12*b)/g/(y*y+5*(E+y-g)-6)],(s=function(t){for(;i.n&&i.n>i.t-(new Date).getTime();){for(t=4;t+1;)i.f[t]+=i.f[t--+1];i.n--}c[f]=i.f[0],i.n?(e.requestAnimationFrame||setTimeout(s,1),requestAnimationFrame(s)):i.f[1]=i.f[2]=0})()}};t[n]=c(t[r]=c())})};a();var l=e.document.getElementsByClassName("toc-body")[0];e.Array.prototype.forEach.call(n,function(t,o){var n=t.dataset.tocScroll,c=e.document.getElementById(n);t.removeEventListener("click",r[o]),t.addEventListener("click",function(o){if(!o.invokeDefault){o.preventDefault();var n=c.getBoundingClientRect().top+document.body.scrollTop;e.naturalScroll.scrollTop(l,n),e.setTimeout(function(){var o=new MouseEvent("click",{view:e,bubbles:!0,cancelable:!0});o.invokeDefault=!0,t.dispatchEvent(o)},600)}})})}}(window);