import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "github_access_token";
const STATE_COOKIE = "github_oauth_state";
const KEY_ENV = "INTEGRATIONS_ENCRYPTION_KEY";

type TokenEnvelope = {
  iv: string;
  tag: string;
  value: string;
};

function encryptionKey() {
  const encoded = process.env[KEY_ENV];
  if (!encoded) {
    throw new Error(`${KEY_ENV} no está configurada.`);
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV} debe ser una clave base64 de 32 bytes.`);
  }
  return key;
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const envelope: TokenEnvelope = {
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    value: encrypted.toString("base64url"),
  };
  return Buffer.from(JSON.stringify(envelope)).toString("base64url");
}

function decrypt(value: string) {
  try {
    const envelope = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as TokenEnvelope;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(envelope.iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(envelope.value, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export async function saveGithubToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, encrypt(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getGithubToken() {
  const cookieStore = await cookies();
  const value = cookieStore.get(TOKEN_COOKIE)?.value;
  return value ? decrypt(value) : null;
}

export async function clearGithubToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function saveGithubOauthState(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export async function consumeGithubOauthState(state: string) {
  const cookieStore = await cookies();
  const expected = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  return Boolean(expected && state && expected === state);
}

export { TOKEN_COOKIE };
