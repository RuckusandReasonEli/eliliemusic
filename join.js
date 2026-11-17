(function () {
  "use strict";
  var C = window.ELI_CONFIG || {};
  var form = document.getElementById("joinForm");
  var status = document.getElementById("joinStatus");
  var err = document.getElementById("joinError");
  var btn = document.getElementById("joinSubmit");
  var lcd = document.getElementById("lcd");

  function showError(msg, field) {
    err.textContent = msg; err.hidden = false;
    if (field) field.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.trim();
    var city = f.city.value.trim(), state = f.state.value;

    if (!name) return showError("Add your name.", f.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("That email doesn't look right.", f.email);
    if (phone && phone.replace(/\D/g, "").length < 7) return showError("That phone number looks short. Leave it blank if you'd rather skip it.", f.phone);
    if (!city) return showError("Add your city.", f.city);
    if (!state) return showError("Pick your state.", f.state);

    if (!C.signupEndpoint) {
      return showError("Sign-ups open very soon. Try again in a bit.");
    }

    var data = new URLSearchParams();
    data.append("name", name);
    data.append("email", email);
    data.append("phone", phone);
    data.append("city", city);
    data.append("state", state);
    data.append("website", f.website.value);
    data.append("page", "join");

    btn.disabled = true;
    btn.lastChild.nodeValue = "RECORDING...";
    lcd.textContent = "REC";

    // Apps Script doesn't send CORS headers, so the reply can't be read.
    // The request still reaches the sheet; a network failure is the only error we can see.
    fetch(C.signupEndpoint, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        lcd.textContent = "SAVED";
        status.textContent = "Got it, " + name.split(" ")[0] + ". You're on the list. Watch your inbox for new music and show dates.";
        form.hidden = true;
        try { localStorage.setItem("elilie.joined", "1"); } catch (x) { /* ignore */ }
        status.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        lcd.textContent = "ERR";
        btn.disabled = false;
        btn.lastChild.nodeValue = "RECORD AND JOIN";
        showError("The tape jammed. Check your connection and try again.");
      });
  });
})();
