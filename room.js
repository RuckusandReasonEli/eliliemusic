(function () {
  "use strict";

  var C = window.ELI_CONFIG || {};
  var body = document.body;
  function $(id) { return document.getElementById(id); }

  var stage = $("stage"), pan = $("pan"), room = $("room"), hsWrap = $("hotspots");
  var line1 = $("line1"), line2 = $("line2");

  function load(key, fallback) {
    try { var v = localStorage.getItem("elilie." + key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem("elilie." + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  // Sound always starts OFF and is never remembered between visits.
  function track(name, params) { if (typeof window.track === "function") window.track(name, params); }

  var S = {
    sound: false, dark: false, stringLights: true, blinds: false, tissue: true, steam: true,
    rackOn: true, fuzz: true, pizzaOpen: false, poster: 0, digs: 0, pets: 0, couchDug: false,
    seq: [], zone: 1, off: 0, mode: "fit", scale: 1, picks: load("picks", [])
  };
  if (!Array.isArray(S.picks)) S.picks = [];

  /* ---------- Sound (Web Audio, synthesized, off until toggled) ---------- */
  var ac = null;
  function audio() {
    if (!ac) {
      var A = window.AudioContext || window.webkitAudioContext;
      if (A) { try { ac = new A(); } catch (e) { ac = null; } }
    }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  }
  function tone(freq, dur, type, vol, when) {
    if (!S.sound) return;
    var a = audio(); if (!a) return;
    var t = a.currentTime + (when || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + (dur || 0.2) + 0.05);
  }
  function noise(dur, vol) {
    if (!S.sound) return;
    var a = audio(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = a.createBufferSource(), g = a.createGain();
    g.gain.value = vol || 0.08; src.buffer = buf; src.connect(g); g.connect(a.destination); src.start();
  }
  function strum(freqs) { freqs.forEach(function (f, i) { tone(f, 1.1, "triangle", 0.045, i * 0.035); }); }
  function arp(freqs, step, type) { freqs.forEach(function (f, i) { tone(f, step * 1.6, type || "square", 0.035, i * step); }); }
  var SFX = {
    click: function () { noise(0.04, 0.12); },
    blip: function () { tone(880, 0.08, "square", 0.035); },
    beep: function () { tone(1000, 0.4, "sine", 0.06); },
    thud: function () { tone(70, 0.2, "sine", 0.14); tone(55, 0.25, "sine", 0.1, 0.25); },
    gameboy: function () { arp([523, 659, 784, 1047], 0.07, "square"); },
    found: function () { arp([784, 988, 1175, 1568], 0.08, "square"); },
    whoosh: function () { noise(0.35, 0.05); },
    fuzz: function () { tone(82, 0.5, "sawtooth", 0.05); tone(83, 0.5, "square", 0.03); }
  };
  var CHORDS = { g1: [196, 247, 294, 392], g2: [165, 196, 247, 330], g3: [131, 165, 196, 262], g4: [147, 185, 220, 294] };
  var SECRET = ["g1", "g3", "g4", "g2"];
  var SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784];

  /* ---------- Text lines ---------- */
  function defaultLine1() { return S.mode === "pan" ? "Tap anything in the studio." : "Point at anything in the studio."; }
  function say(l1, l2, primary) {
    if (l1 !== null && l1 !== undefined) line1.textContent = l1;
    if (l2 !== null && l2 !== undefined) {
      line2.textContent = l2;
      line2.classList.toggle("primary", !!primary);
    }
  }

  /* ---------- Guitar picks (hidden collectibles) ---------- */
  var picksEl = $("picks");
  function renderPicks() {
    var n = S.picks.length, h = "";
    for (var i = 0; i < 5; i++) {
      h += '<svg width="16" height="18" aria-hidden="true"><polygon points="1,1 15,1 15,7 8,17 1,7" fill="' + (i < n ? "#ffc857" : "#1b1428") + '" stroke="#5a4a78" stroke-width="1"/></svg>';
    }
    h += '<span class="count">' + n + "/5</span>";
    picksEl.innerHTML = h;
    picksEl.setAttribute("aria-label", "Guitar picks found: " + n + " of 5");
  }
  function findPick(id, msg) {
    if (S.picks.indexOf(id) !== -1) return false;
    S.picks.push(id); save("picks", S.picks); renderPicks(); SFX.found();
    var n = S.picks.length;
    track("pick_found", { pick: id, picks_found: n });
    say(null, msg + " Guitar pick found! (" + n + " of 5)" + (n === 5 ? " That's all of them. You're officially a roadie." : ""), true);
    return true;
  }

  /* ---------- Scene helpers ---------- */
  function anim(id, cls) {
    var el = $(id); if (!el) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
    el.addEventListener("animationend", function done(ev) {
      if (ev.target !== el) return;
      el.classList.remove(cls); el.removeEventListener("animationend", done);
    });
  }
  function show(id, on) { var el = $(id); if (el) el.style.display = on ? "" : "none"; }
  function setAttr(id, a, v) { var el = $(id); if (el) el.setAttribute(a, v); }

  function timeOfDay() {
    var h = new Date().getHours();
    if (h >= 20 || h < 6) return "night";
    if (h < 8 || h >= 17) return "dusk";
    return "day";
  }
  function paintSky() {
    var t = timeOfDay();
    var sky = { night: ["#121638", "#1b2050", "#0a0c22"], dusk: ["#5a3d7a", "#e0835a", "#2b1d3d"], day: ["#7ec3e8", "#b4def2", "#5b6b8c"] }[t];
    setAttr("sky", "fill", sky[0]); setAttr("skyLow", "fill", sky[1]); setAttr("city", "fill", sky[2]);
    show("sun", t === "day"); show("night", t !== "day");
    return t;
  }
  function applyDark() {
    setAttr("shade", "opacity", S.dark ? "0.78" : "0");
    setAttr("cone", "opacity", S.dark ? "0" : "0.1");
    setAttr("bulb", "opacity", S.dark ? "0.15" : "1");
    var b = $("btnLights");
    b.textContent = S.dark ? "LIGHTS: OFF" : "LIGHTS: ON";
    b.setAttribute("aria-pressed", S.dark ? "false" : "true");
  }

  /* ---------- Navigation and popups ---------- */
  function go(url, msg) {
    say(null, msg || "Opening...", true);
    SFX.whoosh();
    setTimeout(function () { window.location.href = url; }, 280);
  }

  var modal = $("modal"), mTitle = $("modalTitle"), mBody = $("modalBody"), mActions = $("modalActions");
  var lastFocus = null;
  var mBox = $("modalBox");
  function openModal(title, bodyHtml, actions, wide) {
    lastFocus = document.activeElement;
    mBox.classList.toggle("wide", !!wide);
    mTitle.textContent = title;
    mBody.innerHTML = bodyHtml;
    mActions.innerHTML = "";
    (actions || [{ label: "OK", close: true, primary: true }]).forEach(function (a) {
      var el;
      if (a.href) {
        el = document.createElement("a"); el.href = a.href;
        if (a.external) { el.target = "_blank"; el.rel = "noopener"; }
      } else {
        el = document.createElement("button"); el.type = "button";
      }
      el.className = "px" + (a.primary ? " primary" : "");
      el.textContent = a.label;
      if (a.close) el.addEventListener("click", closeModal);
      if (a.copy) el.addEventListener("click", function () { copyText(a.copy, el); });
      mActions.appendChild(el);
    });
    modal.hidden = false;
    var first = modal.querySelector("a, button");
    if (first) first.focus();
  }
  function copyText(text, btn) {
    var done = function () { btn.textContent = "COPIED. PASTE IT IN SAFARI OR CHROME"; track("presave_click", { where: "copy_link" }); };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else btn.textContent = text;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  function closeModal() {
    modal.hidden = true;
    var arr = document.querySelector(".escape-arrow"); if (arr) arr.parentNode.removeChild(arr);
    mBody.innerHTML = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = modal.querySelectorAll("a, button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function comingSoon(title, text) {
    openModal(title, "<p>" + text + "</p>", [{ label: "BACK TO THE STUDIO", close: true, primary: true }]);
  }
  function openInstagram() {
    if (C.instagram) {
      window.open(C.instagram, "_blank", "noopener");
      say(null, "Opening Instagram in a new tab.", true);
    } else {
      comingSoon("PHOTOS", "The Instagram link is coming soon.");
    }
  }
  function openMap() {
    var items = [
      ["Music", "music.html", false],
      ["Shows", "shows.html", false],
      ["Games", "games.html", false],
      ["Mailing list", "join.html", false],
      ["Photos (Instagram)", C.instagram || "", true],
      ["Videos", "", false],
      ["Merch", "", false]
    ];
    var h = '<p>Every page, no clicking around required.</p><ul class="maplist">';
    items.forEach(function (it) {
      if (it[1]) {
        h += '<li><a class="px" href="' + it[1] + '"' + (it[2] ? ' target="_blank" rel="noopener"' : "") + ">" + it[0] + "<span>&rsaquo;</span></a></li>";
      } else {
        h += '<li><span class="px" aria-disabled="true">' + it[0] + '<span class="soon">SOON</span></span></li>';
      }
    });
    h += "</ul>";
    h += '<p style="font-size:18px;line-height:19px;color:#a99cc0;margin:0 0 12px">This site counts anonymous visits with Google Analytics.</p>';
    openModal("MAP", h, [{ label: "CLOSE", close: true }]);
  }

  /* ---------- Hotspots ---------- */
  function guitar(id, name, extra) {
    return function () {
      strum(CHORDS[id]); anim(id, "shake");
      S.seq.push(id); if (S.seq.length > 4) S.seq.shift();
      if (S.seq.join() === SECRET.join() && findPick("guitars", "That's the progression.")) return null;
      return "Strum. " + name + extra;
    };
  }

  var SPOTS = [
    ["foam", 198, 18, 144, 74, "Acoustic foam", "Look at the acoustic foam", false, function () { return "Wedge foam. It absorbs reflections and most of the sighing."; }],
    ["window", 22, 26, 74, 72, "Window", "Open the blinds", false, function () {
      S.blinds = !S.blinds; show("blinds", !S.blinds); show("blindsUp", S.blinds); SFX.click();
      if (!S.blinds) return "Blinds down. Back to work.";
      var t = paintSky();
      return t === "day" ? "Blinds up. It's daytime out there. Weird." : t === "dusk" ? "Blinds up. Golden hour, more or less." : "Blinds up. Late. The city's still awake, though.";
    }],
    ["lights", 150, 12, 330, 14, "String lights", "Flip the string lights", false, function () {
      S.stringLights = !S.stringLights; body.classList.toggle("lights-off", !S.stringLights); SFX.click();
      return S.stringLights ? "String lights back on. Obviously." : "String lights off. It feels wrong already.";
    }],
    ["poster", 112, 34, 54, 66, "Gig poster", "Peel back the gig poster", false, function () {
      var colors = ["#d64f3c", "#3f6fb0", "#6fc2b0", "#e09a3c"];
      S.poster = (S.poster + 1) % colors.length; setAttr("posterBg", "fill", colors[S.poster]); anim("poster", "hop"); SFX.click();
      return S.poster === 0 ? "Back to the first one. It's posters all the way down." : "There's an older poster underneath. Then another.";
    }],
    ["plant", 76, 70, 18, 24, "Dead plant", "Water the plant", false, function () { anim("plant", "shake"); return "Too late. Much, much too late."; }],
    ["couch", 394, 138, 86, 72, "Couch", "Dig in the couch cushions", false, function () {
      anim("couch", "hop");
      if (findPick("couch", "You dig through the cushions.")) return null;
      return "Just crumbs now.";
    }],
    ["g1", 20, 108, 20, 100, "Sunburst guitar", "Strum the sunburst guitar", false, guitar("g1", "Chord one.", " Each guitar plays a single chord.")],
    ["g2", 41, 108, 19, 100, "Red guitar", "Strum the red guitar", false, guitar("g2", "Chord two.", " Moody.")],
    ["g3", 61, 104, 19, 104, "Seafoam guitar", "Strum the seafoam guitar", false, guitar("g3", "Chord three.", " Bright and jangly.")],
    ["g4", 80, 104, 22, 104, "Semi-hollow guitar", "Strum the semi-hollow", false, guitar("g4", "Chord four.", " Warm and a little hollow.")],
    ["synthTop", 104, 134, 82, 14, "Upper synth", "Play the upper synth", false, function () {
      tone(SCALE[Math.floor(Math.random() * SCALE.length)], 0.5, "sawtooth", 0.035);
      setAttr("keyFlashTop", "x", String(112 + Math.floor(Math.random() * 30) * 2)); setAttr("keyFlashTop", "opacity", "1");
      setTimeout(function () { setAttr("keyFlashTop", "opacity", "0"); }, 220);
      return "Every key is locked to one scale, so nothing sounds wrong.";
    }],
    ["synthBot", 102, 154, 86, 18, "Lower synth", "Hit the arpeggiator", false, function () {
      var start = Math.floor(Math.random() * 4);
      arp([SCALE[start], SCALE[start + 2], SCALE[start + 4], SCALE[start + 2], SCALE[start + 5]], 0.11, "square");
      setAttr("keyFlashBot", "opacity", "1"); setTimeout(function () { setAttr("keyFlashBot", "opacity", "0"); }, 600);
      return "Arp on. It wanders off by itself.";
    }],
    ["trash", 172, 190, 20, 28, "Trash can", "Dig through the trash", false, function () {
      S.digs++; anim("trash", "shake"); SFX.click();
      if (S.digs === 1) return "A crumpled draft that just says: rhymes with orange???";
      if (S.digs === 2) return "A setlist with every single song crossed out.";
      if (findPick("trash", "Way at the bottom, under the coffee filters.")) return null;
      return "Nothing left but regret and coffee filters.";
    }],
    ["ns10L", 192, 112, 32, 52, "Left studio monitor", "Look at the left NS10", false, function () {
      S.tissue = !S.tissue; show("tissue", S.tissue); SFX.click();
      return S.tissue ? "Tissue back over the tweeter. Peace restored." : "You peel the tissue off the tweeter. Somewhere, an engineer gasps.";
    }],
    ["ns10R", 320, 112, 32, 52, "Right studio monitor", "Tap the right NS10", false, function () {
      var w = $("wooferR"); w.classList.add("fast"); setTimeout(function () { w.classList.remove("fast"); }, 1600); SFX.thud();
      return "The woofer thumps along with whatever is playing.";
    }],
    ["lamp", 184, 118, 14, 48, "Desk lamp", "Switch the desk lamp", false, function () {
      S.dark = !S.dark; applyDark(); SFX.click();
      return S.dark ? "Lights off. Glowing things are easier to find in the dark." : "Lights back on.";
    }],
    ["mug", 220, 146, 16, 22, "Coffee mug", "Drink the coffee", false, function () {
      S.steam = !S.steam; show("steam", S.steam); anim("mug", "hop");
      return S.steam ? "Fresh pot. Optimism returns." : "Cold. Third one today.";
    }],
    ["mixer", 236, 152, 68, 16, "Mixer", "Push a fader", false, function () {
      var caps = $("faders").children;
      for (var i = 0; i < caps.length; i++) caps[i].setAttribute("y", String(158 + Math.floor(Math.random() * 6)));
      SFX.blip();
      return "Faders slide. Channel 7 is soloed, for reasons.";
    }],
    ["chair", 248, 162, 50, 66, "Desk chair", "Spin the chair", false, function () { anim("chair", "spin"); SFX.whoosh(); return "Wheeeeee."; }],
    ["bottle", 324, 194, 14, 24, "Empty bottle", "Pick up the bottle", false, function () { anim("bottle", "shake"); SFX.blip(); return "Empty. Research for the single."; }],
    ["rack", 352, 140, 40, 72, "Rack gear", "Flip the rack power", false, function () {
      S.rackOn = !S.rackOn; body.classList.toggle("rack-off", !S.rackOn); SFX.thud();
      return S.rackOn ? "Rack on. The LEDs are mostly for morale." : "Rack off. Suddenly very quiet in here.";
    }],
    ["helix", 350, 218, 44, 16, "Floor effects unit", "Stomp a footswitch", false, function () {
      S.fuzz = !S.fuzz; setAttr("helixRings", "opacity", S.fuzz ? "1" : "0.25"); SFX.fuzz();
      return S.fuzz ? "Fuzz on. Everything is louder now." : "Fuzz off. Polite mode.";
    }],
    ["dog", 114, 222, 66, 38, "Sleeping dog", "Pet the dog", false, function () {
      S.pets++; anim("tail", "wag");
      if (S.pets >= 3 && findPick("dog", "The dog rolls over. Something was under there.")) return null;
      return "Tail thumps twice. Back to sleep.";
    }],
    ["tapes", 66, 242, 30, 22, "VHS tapes", "Read the tape labels", false, function () { return "Labels in marker: LIVE, B-ROLL, DO NOT TAPE OVER."; }],
    ["pizza", 396, 220, 40, 18, "Pizza box", "Open the pizza box", false, function () {
      S.pizzaOpen = !S.pizzaOpen; show("pizzaOpen", S.pizzaOpen); show("pizzaLid", !S.pizzaOpen); SFX.click();
      if (S.pizzaOpen && findPick("pizza", "One slice left, with a guitar pick stuck to the lid.")) return null;
      return S.pizzaOpen ? "One slice left. Nobody is touching it." : "Lid closed. Out of sight, out of mind.";
    }],
    ["notebook", 302, 152, 26, 18, "Lyric notebook", "Read the notebook", false, function () {
      anim("notebook", "hop");
      return "Lyrics aren't public yet. In the margin someone scribbled: 1, 3, 4, 2.";
    }],
    // Glowing ones: these open pages or popups.
    ["screen", 230, 94, 84, 58, "Computer screen", "Use the computer: MUSIC", true, function () { go("music.html", "Booting the session. Opening MUSIC."); return null; }],
    ["calendar", 348, 30, 48, 58, "Corkboard calendar", "Check the calendar: SHOWS", true, function () { go("shows.html", "Opening SHOWS."); return null; }],
    ["answering", 352, 120, 40, 20, "Answering machine", "Leave your number: MAILING LIST", true, function () {
      SFX.beep(); go("join.html", "BEEP. Opening the MAILING LIST."); return null;
    }],
    ["photos", 398, 34, 80, 52, "Photo wall", "Look at the photos: INSTAGRAM", true, function () { openInstagram(); return null; }],
    ["gameboy", 418, 152, 24, 24, "Handheld game", "Play the handheld: GAMES", true, function () { SFX.gameboy(); go("games.html", "Loading GAMES."); return null; }],
    ["merch", 432, 212, 46, 48, "Merch box", "Open the box: MERCH", true, function () { SFX.click(); comingSoon("MERCH", "Coming soon. The box is still taped shut."); return null; }],
    ["tv", 22, 194, 46, 44, "Old TV", "Turn on the TV: VIDEOS", true, function () { SFX.click(); comingSoon("VIDEOS", "Coming soon. The tapes are still rewinding."); return null; }]
  ];

  function pct(v, total) { return (v / total * 100).toFixed(3) + "%"; }

  SPOTS.forEach(function (sp) {
    var id = sp[0], name = sp[5], verb = sp[6], primary = sp[7], fn = sp[8];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "hs" + (primary ? " primary" : "");
    b.style.left = pct(sp[1], 480); b.style.top = pct(sp[2], 270);
    b.style.width = pct(sp[3], 480); b.style.height = pct(sp[4], 270);
    b.setAttribute("aria-label", primary ? verb : name + ": " + verb.toLowerCase());
    b.dataset.id = id;
    b.addEventListener("mouseenter", function () { say(verb); b.classList.add("hot"); });
    b.addEventListener("mouseleave", function () { say(defaultLine1()); b.classList.remove("hot"); });
    b.addEventListener("focus", function () { say(verb); });
    b.addEventListener("blur", function () { say(defaultLine1()); });
    b.addEventListener("click", function () {
      track("studio_object", { object: id, opens_page: primary ? "yes" : "no" });
      say(verb);
      var out = fn();
      if (out) say(null, out, false);
    });
    hsWrap.appendChild(b);
  });

  /* ---------- Bar buttons ---------- */
  $("btnSound").addEventListener("click", function () {
    S.sound = !S.sound;
    if (S.sound) { audio(); SFX.blip(); track("sound_on"); }
    this.textContent = S.sound ? "SOUND: ON" : "SOUND: OFF";
    this.setAttribute("aria-pressed", S.sound ? "true" : "false");
  });
  $("btnLights").addEventListener("click", function () {
    S.dark = !S.dark; applyDark(); SFX.click();
    say(null, S.dark ? "Lights off. Glowing things are easier to find in the dark." : "Lights back on.", false);
  });
  $("btnMap").addEventListener("click", function () { track("map_open"); openMap(); });

  /* ---------- Layout: fit the whole room, or pan on narrow portrait screens ---------- */
  var ZONE_CENTERS = [60, 270, 430];
  var zoneBtns = Array.prototype.slice.call(document.querySelectorAll("#zones .zone"));

  function offsetFor(z) {
    var W = 480 * S.scale, sw = stage.clientWidth;
    return Math.max(0, Math.min(W - sw, ZONE_CENTERS[z] * S.scale - sw / 2));
  }
  var ZONE_NAMES = ["guitars", "desk", "lounge"], zoneSince = Date.now();
  function logZoneTime() {
    if (S.mode !== "pan") return;
    var secs = Math.round((Date.now() - zoneSince) / 1000);
    if (secs >= 1) track("zone_time", { zone: ZONE_NAMES[S.zone], seconds: secs });
    zoneSince = Date.now();
  }
  addEventListener("pagehide", logZoneTime);
  function setZone(z) {
    z = Math.max(0, Math.min(2, z));
    if (z !== S.zone) logZoneTime();
    S.zone = z;
    S.off = offsetFor(S.zone);
    pan.style.transform = "translateX(" + (-S.off) + "px)";
    zoneBtns.forEach(function (btn, i) { btn.setAttribute("aria-current", i === S.zone ? "true" : "false"); });
  }
  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var panMode = vw < 720 && vh > vw * 1.05;
    var was = S.mode;
    S.mode = panMode ? "pan" : "fit";
    body.classList.toggle("pan-mode", panMode);
    var sw = stage.clientWidth, sh = stage.clientHeight;
    var s = panMode ? Math.max(sh / 270, sw / 480) : Math.min(sw / 480, sh / 270);
    S.scale = s;
    var w = (480 * s) + "px", h = (270 * s) + "px";
    room.style.width = w; room.style.height = h; pan.style.width = w; pan.style.height = h;
    if (panMode) setZone(S.zone); else pan.style.transform = "";
    if (was !== S.mode) say(defaultLine1());
  }
  var raf = 0;
  window.addEventListener("resize", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });

  zoneBtns.forEach(function (btn, i) { btn.addEventListener("click", function () { setZone(i); }); });
  $("zonePrev").addEventListener("click", function () { setZone(S.zone - 1); });
  $("zoneNext").addEventListener("click", function () { setZone(S.zone + 1); });

  // Swipe to pan (phones)
  var drag = null, suppressClick = false;
  stage.addEventListener("pointerdown", function (e) {
    if (S.mode !== "pan") return;
    drag = { x: e.clientX, off: S.off, zone: S.zone, moved: false, id: e.pointerId };
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 8) {
      drag.moved = true; body.classList.add("dragging");
      try { stage.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
    }
    if (drag.moved) {
      var W = 480 * S.scale, sw = stage.clientWidth;
      S.off = Math.max(0, Math.min(W - sw, drag.off - dx));
      pan.style.transform = "translateX(" + (-S.off) + "px)";
    }
  });
  function endDrag(e) {
    if (!drag) return;
    if (drag.moved) {
      suppressClick = true; setTimeout(function () { suppressClick = false; }, 60);
      body.classList.remove("dragging");
      var dx = e.clientX - drag.x;
      setZone(Math.abs(dx) > 40 ? drag.zone + (dx < 0 ? 1 : -1) : drag.zone);
    }
    drag = null;
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("click", function (e) { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ---------- "Out now" popup (once per visit) ---------- */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function showRelease() {
    var R = C.release;
    if (!R || !R.links || !R.links.length) return;
    var seen = false;
    try { seen = sessionStorage.getItem("elilie.releaseSeen") === "1"; } catch (e) { /* storage unavailable */ }
    if (seen) return;
    try { sessionStorage.setItem("elilie.releaseSeen", "1"); } catch (e) { /* ignore */ }
    var cover = R.cover
      ? '<img class="rel-cover" src="' + esc(R.cover) + '" alt="Cover art for ' + esc(R.title) + ' by Eli Lie" width="300" height="300"' +
        ' onerror="if(this.dataset.fb){this.onerror=null;this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';}else{this.dataset.fb=1;this.src=\'' + esc(R.coverFallback || "") + '\';}">'
      : "";
    var card = '<div class="presave-card"' + (R.cover ? ' style="display:none"' : "") + ' aria-hidden="true"><div class="pc-kicker">ELI LIE · NEW SINGLE</div><div class="pc-title">' + esc(String(R.title).toUpperCase()) + '</div></div>';
    var buttons = R.links.map(function (l, i) {
      return '<a class="px' + (i === 0 ? " primary" : "") + '" href="' + esc(l.url) + '" target="_blank" rel="noopener" data-platform="' + esc(l.name) + '">' + esc(l.name.toUpperCase()) + "</a>";
    }).join("");
    if (R.allPlatforms) buttons += '<a class="px" href="' + esc(R.allPlatforms) + '" target="_blank" rel="noopener" data-platform="All platforms">ALL PLATFORMS</a>';
    var more = "";
    if (C.drunkGame) {
      var gameUrl = C.drunkGame + (C.drunkGame.indexOf("?") === -1 ? "?" : "&") + "utm_source=eliliemusic&utm_medium=website&utm_content=popup";
      more = '<a class="px rel-game" href="' + esc(gameUrl) + '" target="_blank" rel="noopener" data-game="drunk">' +
        '<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" shape-rendering="crispEdges"><path d="M3 0h12v2h2v8h-2v2H3v-2H1V2h2z" fill="#f3e6c4"/><path d="M4 4h1v1h1v1H5v1H4V6H3V5h1zM12 4h2v2h-2zM14 6h2v2h-2z" fill="#b8263a"/></svg>' +
        'PLAY THE DRUNK GAME</a>';
    }
    openModal(
      "OUT NOW: " + String(R.title).toUpperCase(),
      '<div class="rel">' + cover + card +
      '<p class="presave-lede">The new single from Eli Lie. Pick where you listen.</p>' +
      '<div class="rel-links">' + buttons + "</div>" + more + "</div>",
      [{ label: "ENTER THE STUDIO", close: true }],
      true
    );
    track("release_popup_shown", { release: R.title });
    mBody.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a[data-game]")) track("game_start_click", { game: "drunk", where: "popup" });
      var a = e.target.closest && e.target.closest("a[data-platform]");
      if (a) track("listen_click", { platform: a.getAttribute("data-platform"), release: R.title, where: "popup" });
    });
  }

  /* ---------- Start ---------- */
  paintSky();
  applyDark();
  renderPicks();
  layout();
  say(defaultLine1());
  showRelease();
})();
