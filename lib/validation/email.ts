export const PLACEHOLDER_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "test.net",
  "sample.com",
  "sample.org",
  "domain.com",
  "fake.com",
  "placeholder.com",
  "demo.com",
  "mycompany.com",
  "email.com",
  "mail.com",
  "invalid.com",
]);

export function extractAndValidateEmail(emailStr: string): {
  valid: boolean;
  email?: string;
  error?: string;
} {
  if (!emailStr || typeof emailStr !== "string") {
    return { valid: false, error: "Recipient email address ('to') is required." };
  }

  const trimmed = emailStr.trim();
  const bracketMatch = trimmed.match(/<([^>]+)>/);
  const cleanEmail = (bracketMatch ? bracketMatch[1] : trimmed).trim().toLowerCase();

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      error: `Invalid email address format: "${emailStr}". Please provide a valid email address.`,
    };
  }

  const parts = cleanEmail.split("@");
  const domain = parts[1];

  if (PLACEHOLDER_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: `Recipient email "${cleanEmail}" uses placeholder domain "${domain}". You must find the recipient's real email address using search_emails or ask the user. NEVER guess or invent email addresses.`,
    };
  }

  return { valid: true, email: cleanEmail };
}
