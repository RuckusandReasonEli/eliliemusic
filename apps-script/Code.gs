/**
 * Eli Lie mailing list: receives sign-ups from the website and writes them
 * to the "Signups" tab of the Google Sheet this script is attached to.
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
