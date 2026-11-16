(function () {
  "use strict";
  var C = window.ELI_CONFIG || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function linkButton(l, cls) {
    if (l.url) {
      return '<a class="px ' + (cls || "") + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.name) + "</a>";
    }
    return '<span class="px" aria-disabled="true">' + esc(l.name) + ' <span class="soon-tag">SOON</span></span>';
  }

  /* ----- Music ----- */
  var rel = document.getElementById("releases");
  if (rel) {
    rel.innerHTML = (C.releases || []).map(function (r, i) {
      var cover = r.cover
        ? '<div class="cover has-img"><img src="' + esc(r.cover) + '" alt="Cover art for ' + esc(r.title) + '"></div>'
        : '<div class="cover" aria-hidden="true"><div class="t">' + esc(r.title) + '</div><div class="k">ELI LIE</div></div>';
      var links = (r.links || []).map(function (l, j) { return linkButton(l, i === 0 && j === 0 && l.url ? "primary" : "teal"); }).join("");
      return '<article class="release">' + cover +
        '<div><h3>' + esc(r.title) + '</h3><div class="meta">' + esc([r.kind, r.year].filter(Boolean).join(" · ")) + '</div>' +
        (r.note ? '<p class="note">' + esc(r.note) + "</p>" : "") +
        '<div class="links">' + links + "</div></div></article>";
    }).join("");
  }
  var prof = document.getElementById("profiles");
  if (prof) {
    prof.innerHTML = (C.profiles || []).map(function (p) { return linkButton(p); }).join("");
  }

  /* ----- Shows ----- */
  var cal = document.getElementById("calendar");
  if (cal) {
    var shows = (C.shows || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    var monthName = now.toLocaleString("en-US", { month: "long" }).toUpperCase();
    var gigDays = {};
    shows.forEach(function (s) {
      var p = String(s.date).split("-");
      if (+p[0] === y && +p[1] === m + 1) gigDays[+p[2]] = true;
    });
    var h = '<div class="cal-head"><span>' + monthName + " " + y + '</span><small>ELI LIE · LIVE</small></div><div class="cal-grid">';
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach(function (d) { h += '<div class="cal-dow">' + d + "</div>"; });
    for (var i = 0; i < first; i++) h += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= days; d++) {
      var cls = "cal-day" + (d === now.getDate() ? " today" : "") + (gigDays[d] ? " gig" : "");
      h += '<div class="' + cls + '">' + d + "</div>";
    }
    var tail = (7 - ((first + days) % 7)) % 7;
    for (var t = 0; t < tail; t++) h += '<div class="cal-day empty"></div>';
    h += "</div>";
    var upcoming = shows.filter(function (s) { return new Date(s.date + "T23:59:59") >= now; });
    if (!upcoming.length) h += '<div class="stamp">COMING SOON</div>';
    cal.innerHTML = h;

    var list = document.getElementById("showList");
    if (upcoming.length) {
      list.innerHTML = upcoming.map(function (s) {
        var dt = new Date(s.date + "T12:00:00");
        var label = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
        return '<li><span class="d">' + esc(label) + '</span><span class="v">' + esc(s.venue) + (s.city ? " · " + esc(s.city) : "") + "</span>" +
          (s.tickets ? '<a class="px primary" href="' + esc(s.tickets) + '" target="_blank" rel="noopener">TICKETS</a>' : "") + "</li>";
      }).join("");
    } else {
      list.innerHTML = '<li><span class="d">NO DATES YET</span><span class="v">Shows are coming soon. Check back, or keep an eye on the corkboard.</span></li>';
    }
  }

  /* ----- Games ----- */
  var play = document.getElementById("playDrunk");
  if (play && C.drunkGame) play.href = C.drunkGame;
})();
