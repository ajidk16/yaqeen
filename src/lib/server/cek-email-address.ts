// utils/emailSecurity.ts
import dns from 'dns/promises';

// ==== 1. CEK ALAMAT EMAIL ==== //

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'yopmail.com'
]);

export type EmailAddressCheck = {
  isValidFormat: boolean;
  hasMxRecord: boolean;
  isDisposable: boolean;
  domain: string | null;
  reason: string[];
};

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function checkEmailAddress(email: string): Promise<EmailAddressCheck> {
  const result: EmailAddressCheck = {
    isValidFormat: false,
    hasMxRecord: false,
    isDisposable: false,
    domain: null,
    reason: []
  };

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    result.reason.push('Format email tidak valid');
    return result;
  }

  result.isValidFormat = true;

  const [, domain] = trimmed.split('@');
  result.domain = domain;

  // Cek disposable
  if (DISPOSABLE_DOMAINS.has(domain)) {
    result.isDisposable = true;
    result.reason.push('Menggunakan domain disposable / sementara');
  }

  // Cek MX record (apakah domain punya server email)
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords.length > 0) {
      result.hasMxRecord = true;
    } else {
      result.reason.push('Domain tidak memiliki MX record');
    }
  } catch {
    result.reason.push('Gagal resolve MX: kemungkinan domain tidak valid');
  }

  return result;
}

// ==== 2. CEK ISI / PERILAKU EMAIL (PHISHING SCORE) ==== //

export type EmailContentCheck = {
  score: number;          // 0–100 (semakin tinggi = semakin mencurigakan)
  flags: string[];        // alasan kenapa dicurigai
  isSuspicious: boolean;  // true jika melewati threshold
};

export type EmailContentInput = {
  from: string;       // alamat pengirim (mis: no-reply@bca.co.id)
  subject: string;
  textBody?: string;  // isi text/plain
  htmlBody?: string;  // isi HTML (opsional)
};

const URGENCY_KEYWORDS = [
  'segera',
  'urgent',
  'darurat',
  'akhir hari ini',
  'last chance',
  'terakhir',
  'now',
  'immediately'
];

const CREDENTIAL_KEYWORDS = [
  'password',
  'kata sandi',
  'pin',
  'otp',
  'kode rahasia',
  'one time password',
  'credential'
];

const MONEY_KEYWORDS = [
  'hadiah',
  'menang undian',
  'lotere',
  'transfer',
  'klik untuk klaim',
  'hadiah besar'
];

const SUSPICIOUS_LINK_KEYWORDS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  'cutt.ly',
  'rebrand.ly'
];

export function checkEmailContent(input: EmailContentInput): EmailContentCheck {
  const flags: string[] = [];
  let score = 0;

  const subject = (input.subject || '').toLowerCase();
  const body = (
    (input.textBody || '') +
    ' ' +
    (input.htmlBody || '')
  ).toLowerCase();

  // 1. Urgency / tekanan berlebihan
  if (URGENCY_KEYWORDS.some((k) => subject.includes(k) || body.includes(k))) {
    score += 20;
    flags.push('Bahasa sangat mendesak/urgent');
  }

  // 2. Meminta password / OTP / PIN
  if (CREDENTIAL_KEYWORDS.some((k) => subject.includes(k) || body.includes(k))) {
    score += 35;
    flags.push('Meminta credential sensitif (password/OTP/PIN)');
  }

  // 3. Janji hadiah tidak wajar
  if (MONEY_KEYWORDS.some((k) => subject.includes(k) || body.includes(k))) {
    score += 20;
    flags.push('Menjanjikan hadiah / uang tidak wajar');
  }

  // 4. Link shortener / mencurigakan
  if (SUSPICIOUS_LINK_KEYWORDS.some((k) => body.includes(k))) {
    score += 15;
    flags.push('Mengandung link shortener mencurigakan');
  }

  // 5. Banyak tanda seru
  const exclamationCount =
    (subject.match(/!/g) || []).length + (body.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    score += 10;
    flags.push('Terlalu banyak tanda seru');
  }

  // 6. Sender free-mail tapi mengaku institusi besar
  const from = input.from.toLowerCase();
  const freeMailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = from.split('@')[1] || '';
  const claimsBankLike =
    subject.includes('bank') || body.includes('bank') || body.includes('bca') || body.includes('bri');

  if (freeMailDomains.includes(domain) && claimsBankLike) {
    score += 25;
    flags.push('Mengaku institusi tapi pakai free-mail domain');
  }

  // Normalize score (maksimal 100)
  if (score > 100) score = 100;

  const isSuspicious = score >= 40;

  return { score, flags, isSuspicious };
}
