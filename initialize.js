window.tocProd=true;!function(){var n=function(){window.console.log=function(){},window.console.debug=function(){}};window.tocProd&&n();var o,e=2800,t=1500,c=document.getElementsByClassName("toc-loading-screen")[0];o=Date.now(),System["import"]("app").then(function(n){n.initialize()}).then(function(){var n=Date.now(),i=(n-o)%e;setTimeout(function(){c.className+=" toc-fadeout-loading-screen",setTimeout(function(){c.className+=" toc-non-interactive"},t)},e-i)})["catch"](console.error.bind(console))}();