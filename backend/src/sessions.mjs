import { createHash, randomBytes, randomUUID } from "node:crypto";
import { query } from "./db.mjs";

export const sessionCookieName = "cqp_session";

const sessionDays = Number(process.env.SESSION_DAYS || 30);
const cookieSecure = process.env.COOKIE_SECURE !== "false";

function hashToken(token) {
  return createHash("sha256").update(token).digest("base64url");
}

export function readCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        if (index === -1) return [item, ""];
        return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

export function makeSessionCookie(token) {
  const maxAge = sessionDays * 24 * 60 * 60;
  const secure = cookieSecure ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function makeClearSessionCookie() {
  const secure = cookieSecure ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), userId, hashToken(token), expiresAt]
  );

  return { token, expiresAt };
}

export async function getSessionUser(req) {
  const token = readCookies(req)[sessionCookieName];
  if (!token) return null;

  const result = await query(
    `SELECT users.id, users.email, users.display_name, users.role, sessions.id AS session_id
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1
       AND sessions.expires_at > now()
     LIMIT 1`,
    [hashToken(token)]
  );

  const user = result.rows[0];
  if (!user) return null;

  await query("UPDATE sessions SET last_seen_at = now() WHERE id = $1", [user.session_id]);
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role
  };
}

export async function destroySession(req) {
  const token = readCookies(req)[sessionCookieName];
  if (!token) return;
  await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}
