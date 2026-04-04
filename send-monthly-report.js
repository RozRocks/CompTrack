/**
 * MBM LeadTool — Automated Monthly Report Sender
 *
 * Run by GitHub Actions on the last day of each month at 5 PM EST.
 * Fetches prior month's leads from Firestore, builds a summary,
 * and sends it to management via EmailJS REST API.
 *
 * Required environment variables (set as GitHub Secrets):
 *   FIREBASE_SERVICE_ACCOUNT     — JSON string of Firebase service account key
 *   EMAILJS_PUBLIC_KEY           — EmailJS account public key
 *   EMAILJS_SERVICE_ID           — EmailJS service ID
 *   EMAILJS_REPORT_TEMPLATE_ID   — EmailJS template ID (see below for variables)
 *   REPORT_RECIPIENT_EMAIL       — Email address to send report to
 *   REPORT_RECIPIENT_NAME        — Display name of report recipient
 *   FORCE_SEND                   — Set to "true" to bypass date check (testing)
 *
 * EmailJS template variables used:
 *   {{to_name}}        — Recipient name
 *   {{to_email}}       — Recipient email
 *   {{report_month}}   — e.g. "March 2025"
 *   {{total_leads}}    — Total lead count
 *   {{hot_count}}      — Hot leads
 *   {{warm_count}}     — Warm leads
 *   {{cold_count}}     — Cold leads
 *   {{new_count}}      — New status
 *   {{in_progress}}    — In Progress status
 *   {{won_count}}      — Won status
 *   {{lost_count}}     — Lost status
 *   {{top_submitters}} — Formatted list of top tech submitters
 *   {{unassigned}}     — Count of unassigned leads
 *   {{dashboard_url}}  — Link to the dashboard
 */

import admin from 'firebase-admin';

// ── DATE CHECK ────────────────────────────────────────────
// Exit early unless it is actually the last day of the month.
// This protects against the cron running on the 28th–30th of longer months.
const now = new Date();
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const isLastDay = now.getDate() === lastDayOfMonth;
const forceSend = process.env.FORCE_SEND === 'true';

if (!isLastDay && !forceSend) {
  console.log(`Today is the ${now.getDate()}th — not the last day of the month (${lastDayOfMonth}). Skipping.`);
  process.exit(0);
}

console.log(`Running monthly report for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}...`);

// ── FIREBASE INIT ─────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── DATE RANGE: prior calendar month ─────────────────────
const reportDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
const rangeEnd   = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
const reportMonthLabel = reportDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ── FETCH LEADS ───────────────────────────────────────────
console.log(`Fetching leads from ${new Date(rangeStart).toISOString()} to ${new Date(rangeEnd).toISOString()}...`);
const snap = await db.collection('leads')
  .where('createdAt', '>=', rangeStart)
  .where('createdAt', '<', rangeEnd)
  .get();

const leads = snap.docs.map(d => d.data());
console.log(`Found ${leads.length} leads.`);

if (leads.length === 0 && !forceSend) {
  console.log('No leads this month — skipping email to avoid empty report.');
  process.exit(0);
}

// ── BUILD SUMMARY ─────────────────────────────────────────
const total    = leads.length;
const hot      = leads.filter(l => l.priority === 'Hot').length;
const warm     = leads.filter(l => l.priority === 'Warm').length;
const cold     = leads.filter(l => l.priority === 'Cold').length;
const newCount = leads.filter(l => l.status === 'New').length;
const inProg   = leads.filter(l => l.status === 'In Progress').length;
const won      = leads.filter(l => l.status === 'Won').length;
const lost     = leads.filter(l => l.status === 'Lost').length;
const unassigned = leads.filter(l => !l.assignedTo || l.assignedToName === 'Unassigned').length;

// Top submitters (techs who logged the most leads this month)
const submitterCounts = {};
leads.forEach(l => {
  const name = l.submittedByName || 'Unknown';
  submitterCounts[name] = (submitterCounts[name] || 0) + 1;
});
const topSubmitters = Object.entries(submitterCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, count]) => `${name}: ${count}`)
  .join('\n');

const dashboardUrl = 'https://rozrocks.github.io/CompTrack/dashboard.html';

console.log(`Summary: ${total} leads | Hot: ${hot} | Won: ${won} | Unassigned: ${unassigned}`);

// ── SEND EMAIL ────────────────────────────────────────────
const emailPayload = {
  service_id:    process.env.EMAILJS_SERVICE_ID,
  template_id:   process.env.EMAILJS_REPORT_TEMPLATE_ID,
  user_id:       process.env.EMAILJS_PUBLIC_KEY,
  template_params: {
    to_name:       process.env.REPORT_RECIPIENT_NAME || 'Management',
    to_email:      process.env.REPORT_RECIPIENT_EMAIL,
    report_month:  reportMonthLabel,
    total_leads:   String(total),
    hot_count:     String(hot),
    warm_count:    String(warm),
    cold_count:    String(cold),
    new_count:     String(newCount),
    in_progress:   String(inProg),
    won_count:     String(won),
    lost_count:    String(lost),
    top_submitters: topSubmitters || 'No submissions',
    unassigned:    String(unassigned),
    dashboard_url: dashboardUrl,
  }
};

const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(emailPayload),
});

if (response.ok) {
  console.log(`✓ Report sent to ${process.env.REPORT_RECIPIENT_EMAIL} for ${reportMonthLabel}`);
} else {
  const body = await response.text();
  console.error(`✗ EmailJS error ${response.status}: ${body}`);
  process.exit(1);
}

await admin.app().delete();
