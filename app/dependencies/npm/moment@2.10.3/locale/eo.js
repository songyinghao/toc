/* */ 
"format cjs";
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require("../moment")) : typeof define === 'function' && define.amd ? define(["../moment"], factory) : factory(global.moment);
}(this, function(moment) {
  'use strict';
  var eo = moment.defineLocale('eo', {
    months: 'januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro'.split('_'),
    monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec'.split('_'),
    weekdays: 'Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato'.split('_'),
    weekdaysShort: 'Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab'.split('_'),
    weekdaysMin: 'Di_Lu_Ma_Me_Ĵa_Ve_Sa'.split('_'),
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'LT:ss',
      L: 'YYYY-MM-DD',
      LL: 'D[-an de] MMMM, YYYY',
      LLL: 'D[-an de] MMMM, YYYY LT',
      LLLL: 'dddd, [la] D[-an de] MMMM, YYYY LT'
    },
    meridiemParse: /[ap]\.t\.m/i,
    isPM: function(input) {
      return input.charAt(0).toLowerCase() === 'p';
    },
    meridiem: function(hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'p.t.m.' : 'P.T.M.';
      } else {
        return isLower ? 'a.t.m.' : 'A.T.M.';
      }
    },
    calendar: {
      sameDay: '[Hodiaŭ je] LT',
      nextDay: '[Morgaŭ je] LT',
      nextWeek: 'dddd [je] LT',
      lastDay: '[Hieraŭ je] LT',
      lastWeek: '[pasinta] dddd [je] LT',
      sameElse: 'L'
    },
    relativeTime: {
      future: 'je %s',
      past: 'antaŭ %s',
      s: 'sekundoj',
      m: 'minuto',
      mm: '%d minutoj',
      h: 'horo',
      hh: '%d horoj',
      d: 'tago',
      dd: '%d tagoj',
      M: 'monato',
      MM: '%d monatoj',
      y: 'jaro',
      yy: '%d jaroj'
    },
    ordinalParse: /\d{1,2}a/,
    ordinal: '%da',
    week: {
      dow: 1,
      doy: 7
    }
  });
  return eo;
}));