/*
  Google Analytics (GA4) for the Eli Lie site.
  Visits, city, referrers and time on page come from GA automatically.
  window.track(name, params) sends the site's own events (studio objects,
  presave popup, listen clicks, sign-ups). Set analyticsId in config.js.
*/
(function () {
  "use strict";
  var C = window.ELI_CONFIG || {};
  var id = C.analyticsId;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.track = function (name, params) {
    if (!id) return;
    try { window.gtag("event", name, params || {}); } catch (e) { /* never break the page */ }
  };
  if (!id) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", id);
})();
