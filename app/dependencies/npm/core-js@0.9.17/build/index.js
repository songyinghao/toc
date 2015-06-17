/* */ 
"format cjs";
(function() {
  var banner,
      ref$,
      readFile,
      writeFile,
      unlink,
      webpack,
      list,
      experimental,
      libraryBlacklist;
  banner = require("./config").banner;
  ref$ = require("fs"), readFile = ref$.readFile, writeFile = ref$.writeFile, unlink = ref$.unlink;
  webpack = require("webpack");
  list = ['es5', 'es6.symbol', 'es6.object.assign', 'es6.object.is', 'es6.object.set-prototype-of', 'es6.object.to-string', 'es6.object.statics-accept-primitives', 'es6.function.name', 'es6.function.has-instance', 'es6.number.constructor', 'es6.number.statics', 'es6.math', 'es6.string.from-code-point', 'es6.string.raw', 'es6.string.iterator', 'es6.string.code-point-at', 'es6.string.ends-with', 'es6.string.includes', 'es6.string.repeat', 'es6.string.starts-with', 'es6.array.from', 'es6.array.of', 'es6.array.iterator', 'es6.array.species', 'es6.array.copy-within', 'es6.array.fill', 'es6.array.find', 'es6.array.find-index', 'es6.regexp', 'es6.promise', 'es6.map', 'es6.set', 'es6.weak-map', 'es6.weak-set', 'es6.reflect', 'es7.array.includes', 'es7.string.at', 'es7.string.lpad', 'es7.string.rpad', 'es7.regexp.escape', 'es7.object.get-own-property-descriptors', 'es7.object.to-array', 'es7.map.to-json', 'es7.set.to-json', 'web.immediate', 'web.dom.iterable', 'web.timers', 'core.dict', 'core.iter-helpers', 'core.$for', 'core.delay', 'core.function.part', 'core.object', 'core.array.turn', 'core.number.iterator', 'core.number.math', 'core.string.escape-html', 'core.date', 'core.global', 'core.log', 'js.array.statics'];
  experimental = [];
  libraryBlacklist = ['es6.object.to-string', 'es6.function.name', 'es6.regexp', 'es6.number.constructor'];
  module.exports = function(arg$, next) {
    var modules,
        ref$,
        blacklist,
        library;
    modules = (ref$ = arg$.modules) != null ? ref$ : [], blacklist = (ref$ = arg$.blacklist) != null ? ref$ : [], library = (ref$ = arg$.library) != null ? ref$ : false;
    (function() {
      var check,
          i$,
          x$,
          ref$,
          len$,
          ns,
          name,
          j$,
          len1$,
          ENTRY,
          PATH,
          this$ = this;
      check = function(err) {
        if (err) {
          next(err, '');
          return true;
        }
      };
      if (this.exp) {
        for (i$ = 0, len$ = (ref$ = experimental).length; i$ < len$; ++i$) {
          x$ = ref$[i$];
          this[x$] = true;
        }
      }
      for (ns in this) {
        if (this[ns]) {
          for (i$ = 0, len$ = (ref$ = list).length; i$ < len$; ++i$) {
            name = ref$[i$];
            if (name.indexOf(ns + ".") === 0 && !in$(name, experimental)) {
              this[name] = true;
            }
          }
        }
      }
      if (library) {
        blacklist = blacklist.concat(libraryBlacklist);
      }
      for (i$ = 0, len$ = blacklist.length; i$ < len$; ++i$) {
        ns = blacklist[i$];
        for (j$ = 0, len1$ = (ref$ = list).length; j$ < len1$; ++j$) {
          name = ref$[j$];
          if (name === ns || name.indexOf(ns + ".") === 0) {
            this[name] = false;
          }
        }
      }
      ENTRY = "./__tmp" + Math.random() + "__.js";
      PATH = "." + (library ? '/library' : '') + "/modules/";
      writeFile(ENTRY, list.filter(function(it) {
        return this$[it];
      }).map(function(it) {
        return "require('" + PATH + it + "');";
      }).join('\n'), function(err) {
        var TARGET;
        if (check(err)) {
          return;
        }
        TARGET = "./__tmp" + Math.random() + "__.js";
        webpack({
          entry: ENTRY,
          output: {
            path: '',
            filename: TARGET
          }
        }, function(err, info) {
          if (check(err)) {
            return;
          }
          readFile(TARGET, function(err, script) {
            if (check(err)) {
              return;
            }
            unlink(ENTRY, function(err) {
              if (check(err)) {
                return;
              }
              unlink(TARGET, function(err) {
                if (check(err)) {
                  return;
                }
                next(null, "" + banner + "\n!function(undefined){\n'use strict';\nvar __e = null, __g = null;\n\n" + script + "\n// CommonJS export\nif(typeof module != 'undefined' && module.exports)module.exports = __e;\n// RequireJS export\nelse if(typeof define == 'function' && define.amd)define(function(){return __e});\n// Export to global object\nelse __g.core = __e;\n}();");
              });
            });
          });
        });
      });
    }.call(modules.reduce(function(memo, it) {
      memo[it] = true;
      return memo;
    }, {})));
  };
  function in$(x, xs) {
    var i = -1,
        l = xs.length >>> 0;
    while (++i < l)
      if (x === xs[i])
        return true;
    return false;
  }
}).call(this);
