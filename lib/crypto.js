import crypto from "crypto";

/**
 * AES-256-GCM encryption for creator payout credentials (Razorpay key secret).
 *
 * Format of stored value:  v1:<iv-hex>:<authTag-hex>:<ciphertext-hex>
 * Values that don't start with "v1:" are treated as legacy plaintext so an
 * existing database keeps working after this change.
 *
 * CREDENTIALS_KEY must be 32 bytes, hex encoded (64 hex chars):
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
const PREFIX = "v1:";

function getKey() {
  const hex = process.env.CREDENTIALS_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "CREDENTIALS_KEY missing or invalid. It must be a 64-char hex string (32 bytes). See .env.example."
    );
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plain) {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decrypt(value) {
  if (!value) return "";
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext
  const [, ivHex, tagHex, dataHex] = value.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return dec.toString("utf8");
}

export function isEncrypted(value) {
  return typeof value === "string" && value.startsWith(PREFIX);
}
