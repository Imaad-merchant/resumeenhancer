/**
 * Two-way sync between the "Summer 2027 Internship Tracker" Google Sheet and the website.
 *
 * Setup (once):
 *  1. Open the sheet → Extensions → Apps Script. Replace everything with this file.
 *  2. Set TOKEN below to a long random string (e.g. a password generator output).
 *  3. Deploy → New deployment → type "Web app" → Execute as: Me, Who has access: Anyone → Deploy.
 *     Approve the permission prompt, then copy the Web app URL.
 *  4. In Vercel → Settings → Environment Variables add:
 *       SHEET_WEBAPP_URL = <the Web app URL>
 *       SHEET_TOKEN      = <the same TOKEN as below>
 *     then redeploy the site.
 *
 * Columns are found by header name, so you can reorder/insert columns freely.
 * The script adds "Notes" and "App ID" columns if they're missing. Don't edit "App ID".
 */

const TOKEN = 'CHANGE_ME';
const SHEET_NAME = ''; // blank = first tab

// website field → sheet column header
const FIELDS = {
  status: 'My Status',
  appliedOn: 'Applied On',
  contact: 'Contact / Referral',
  followUp: 'Follow-Up',
  nextAction: 'Next Action',
  notes: 'Notes',
};
const REQUIRED = ['Notes', 'App ID'];

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

function headers_(sh) {
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  REQUIRED.forEach((name) => {
    if (h.indexOf(name) < 0) {
      sh.getRange(1, h.length + 1).setValue(name);
      h.push(name);
    }
  });
  return h;
}

function fmt_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.token !== TOKEN) return json_({ error: 'unauthorized' });
  const sh = sheet_();
  const h = headers_(sh);
  const n = sh.getLastRow();
  const vals = n > 1 ? sh.getRange(2, 1, n - 1, h.length).getValues() : [];
  const rows = vals
    .map((r, i) => {
      const o = { row: i + 2 };
      h.forEach((k, j) => { if (k) o[k] = fmt_(r[j]); });
      return o;
    })
    .filter((o) => o.Company);
  return json_({ rows });
}

function doPost(e) {
  const body = JSON.parse((e.postData && e.postData.contents) || '{}');
  if (body.token !== TOKEN) return json_({ error: 'unauthorized' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const h = headers_(sh);
    const col = (name) => h.indexOf(name) + 1;
    const idCol = col('App ID');
    const n = sh.getLastRow();

    // 1) row already stamped with this App ID
    let row = 0;
    if (n > 1) {
      const ids = sh.getRange(2, idCol, n - 1, 1).getValues();
      const k = ids.findIndex((r) => String(r[0]) === String(body.id));
      if (k >= 0) row = k + 2;
    }
    // 2) row number the website matched, if it still holds the same company
    if (!row && body.row && body.row <= n && String(sh.getRange(body.row, col('Company')).getValue()) === body.company) {
      row = body.row;
    }
    // 3) not in the sheet yet → append
    if (!row) {
      row = n + 1;
      sh.getRange(row, col('Company')).setValue(body.company || '');
      if (col('Role')) sh.getRange(row, col('Role')).setValue(body.role || '');
      if (col('Link') && body.link) sh.getRange(row, col('Link')).setValue(body.link);
    }

    sh.getRange(row, idCol).setValue(String(body.id));
    Object.keys(body.fields || {}).forEach((k) => {
      const c = col(FIELDS[k]);
      if (c > 0) sh.getRange(row, c).setValue(body.fields[k]);
    });
    return json_({ ok: true, row });
  } finally {
    lock.releaseLock();
  }
}
