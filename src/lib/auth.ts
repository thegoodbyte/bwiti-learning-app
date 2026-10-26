export const ADMIN_COOKIE_NAME = "admin_session";

export async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminSessionToken() {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return null;
  }
  return sha256Hex(sitePassword);
}
