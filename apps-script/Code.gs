/**
 * Eli Lie fan data: receives mailing list sign-ups from the website and
 * anonymous play sessions from the DRUNK game, and writes them to the
 * "Signups" and "Game Sessions" tabs of the Google Sheet this script is attached to.
 *
 * After editing: Deploy > Manage deployments > pencil > Version: New version > Deploy
 * (keeps the same web app URL, which the website and game use).
 *
 * Setup (one time):
 *   1. In the sheet: Extensions > Apps Script, paste this file, save.
 *   2. Deploy > New deployment > Web app.
 *      Execute as: Me.  Who has access: Anyone.
 *   3. Copy the web app URL into signupEndpoint in config.js.
 *
 * A repeat sign-up with the same email updates that person's row
 * instead of adding a duplicate.
 */
var SHEET_NAME = 'Signups';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.type === 'game') return saveGame_(p);

  // Hidden field that only bots fill in. Pretend it worked.
  if (p.website) return json_({ ok: true });

  var name = clean_(p.name, 100);
  var email = clean_(p.email, 200).toLowerCase();
  var phone = clean_(p.phone, 40);
  // Texts only with an explicit opt-in AND a phone number.
  var textsOk = (phone && p.textsOk === 'yes') ? 'Yes' : 'No';
  var city = clean_(p.city, 100);
  var state = clean_(p.state, 60);
  var page = clean_(p.page, 200);

  if (!name || !city || !state || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json_({ ok: false, error: 'missing_fields' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var row = [new Date(), name, email, phone, textsOk, city, state, page];
    var last = sheet.getLastRow();
    var existing = 0;
    if (last > 1) {
      var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === email) { existing = i + 2; break; }
      }
    }
    if (existing) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// ---- DRUNK game sessions: one row per session, updated in place ----
var GAME_SHEET = 'Game Sessions';
var GAME_FIELDS = ['returning', 'device', 'city', 'region', 'country', 'source', 'medium', 'campaign', 'ending',
  't_total', 't_home', 't_tavern', 't_club', 't_exhouse', 't_town', 't_car', 'path', 'drinks', 'blackouts', 'cops',
  'key', 'spell', 'lyrics', 'cups', 'hints', 'listens', 'listenFrom', 'backFromSong', 'continued'];
var NUMERIC = { t_total: 1, t_home: 1, t_tavern: 1, t_club: 1, t_exhouse: 1, t_town: 1, t_car: 1, drinks: 1, blackouts: 1,
  cops: 1, lyrics: 1, cups: 1, hints: 1, listens: 1, backFromSong: 1 };

function saveGame_(p) {
  var session = clean_(p.session, 40);
  if (!/^s[a-z0-9]+$/.test(session)) return json_({ ok: false, error: 'bad_session' });
  var started = new Date(p.started);
  if (isNaN(started.getTime())) started = new Date();
  var row = [started, new Date(), session, clean_(p.visitor, 40)];
  GAME_FIELDS.forEach(function (f) {
    if (NUMERIC[f]) { var n = Math.max(0, Math.min(100000, parseInt(p[f], 10) || 0)); row.push(n); }
    else row.push(clean_(p[f], f === 'path' ? 400 : 120));
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GAME_SHEET);
    var last = sheet.getLastRow();
    var existing = 0;
    if (last > 1) {
      // newest rows are at the bottom; search from the end
      var ids = sheet.getRange(2, 3, last - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (ids[i][0] === session) { existing = i + 2; break; }
      }
    }
    if (existing) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, service: 'Eli Lie mailing list' });
}

// Trim, cap length, and stop anything that would run as a formula in the sheet.
function clean_(value, max) {
  var v = String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
