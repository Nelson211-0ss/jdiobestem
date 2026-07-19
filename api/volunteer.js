/**
 * Volunteer application endpoint.
 *
 * Emails a submitted volunteer application to the organization. Uses the Resend
 * REST API directly over fetch, so no extra npm dependency is required (Node 18+
 * has a global fetch; this project runs Node 24).
 *
 * Required environment variables:
 *   RESEND_API_KEY   API key from https://resend.com  (starts "re_")
 *   VOLUNTEER_TO     Destination inbox. Defaults to info@jdiobestem.org
 *   VOLUNTEER_FROM   Verified sender on your Resend domain.
 *                    Defaults to "Jdiobe STEM Foundation <onboarding@resend.dev>",
 *                    which only delivers to the account owner's own address —
 *                    set a verified domain sender before going live.
 *
 * Without RESEND_API_KEY the endpoint responds 503 with a clear message rather
 * than silently accepting submissions that go nowhere.
 */

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

function readBody(req) {
  // Vercel may have parsed the body already; the local dev server passes a string.
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

const INTEREST_LABELS = {
  mentorship: 'Mentorship',
  event: 'Event organization',
  tutoring: 'STEM tutoring',
  outreach: 'Community outreach',
  other: 'Other',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await readBody(req);
  if (!body) return res.status(400).json({ error: 'Invalid JSON body' });

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const interest = String(body.interest || '').trim();
  const message = String(body.message || '').trim();

  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!phone) missing.push('phone');
  if (!interest) missing.push('interest');
  if (!message) missing.push('message');
  if (missing.length) {
    return res.status(400).json({ error: 'Missing required fields', fields: missing });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  // Basic length guards so the endpoint can't be used to relay bulk content.
  if (name.length > 120 || email.length > 200 || phone.length > 60 || message.length > 5000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.VOLUNTEER_TO || 'info@jdiobestem.org';
  const from = process.env.VOLUNTEER_FROM || 'Jdiobe STEM Foundation <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('[volunteer] RESEND_API_KEY is not set — application not sent:', {
      name,
      email,
      interest,
    });
    return res.status(503).json({
      error:
        'The application form is not fully configured yet. Please email info@jdiobestem.org directly.',
    });
  }

  const interestLabel = INTEREST_LABELS[interest] || interest;

  const html = `
    <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;">New volunteer application</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="font-weight:bold;">Name</td><td>${esc(name)}</td></tr>
      <tr><td style="font-weight:bold;">Email</td><td>${esc(email)}</td></tr>
      <tr><td style="font-weight:bold;">Phone</td><td>${esc(phone)}</td></tr>
      <tr><td style="font-weight:bold;">Area of interest</td><td>${esc(interestLabel)}</td></tr>
    </table>
    <p style="margin:20px 0 6px;font-weight:bold;font-family:Arial,sans-serif;font-size:14px;">Why they want to volunteer</p>
    <p style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">${esc(message)}</p>
  `;

  const text = [
    'New volunteer application',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Area of interest: ${interestLabel}`,
    '',
    'Why they want to volunteer:',
    message,
  ].join('\n');

  try {
    const resend = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying in the mail client goes straight back to the applicant.
        reply_to: email,
        subject: `Volunteer application — ${name} (${interestLabel})`,
        html,
        text,
      }),
    });

    if (!resend.ok) {
      const detail = await resend.text();
      console.error('[volunteer] Resend responded', resend.status, detail);
      return res
        .status(502)
        .json({ error: 'We could not send your application right now. Please try again shortly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[volunteer] send failed', err);
    return res
      .status(502)
      .json({ error: 'We could not send your application right now. Please try again shortly.' });
  }
};
