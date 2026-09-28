import crypto from "crypto";

export interface GeneratedApiKey {
  apiKey: string;  // Full raw key (returned ONLY ONCE to tenant)
  keyHash: string; // Saved in MongoDB `keyHash`
  prefix: string;  // Saved in MongoDB `prefix` (e.g., "tr_live_a1b2...")
}

/**
 * Generates a tenant API key along with its database-ready hash and UI display prefix.
 */
export const generateApiKey = (env: "live" | "test" = "live"): GeneratedApiKey => {
  // 32 bytes (256 bits) of cryptographically secure random entropy
  const randomHex = crypto.randomBytes(32).toString("hex");
  const prefixHeader = `tr_${env}_`;
  
  const apiKey = `${prefixHeader}${randomHex}`;
  const keyHash = hashApiKey(apiKey);
  
  // Truncated preview for UI display in the tenant dashboard
  const prefix = `${prefixHeader}${randomHex.slice(0, 4)}...`;

  return {
    apiKey,
    keyHash,
    prefix,
  };
};

/**
 * Hashes an incoming API key using SHA-256 for database lookups.
 */
export const hashApiKey = (apiKey: string): string => {
  return crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");
};