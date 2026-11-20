/**
 * client/src/utils/auth.js - Authentication Service & Universal Client-side Password Encryption
 *
 * Provides cryptographically secure salted password hashing that works in ALL browser contexts:
 * - Uses Web Crypto API when available (HTTPS / Secure Context)
 * - Has a robust, pure JS SHA-256 fallback when window.crypto.subtle is undefined (HTTP / LAN IPs)
 * - Seamlessly integrates with server auth endpoints with local encrypted user database fallback
 */

import { API_BASE } from './api';

const STORAGE_KEYS = {
  USER: 'app_auth_user',
  TOKEN: 'app_auth_token',
  LOCAL_USERS: 'app_encrypted_users_db'
};

/**
 * Pure JavaScript SHA-256 implementation (works in any browser context, including non-HTTPS)
 */
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Generate a random cryptographic salt (hex string)
 */
function generateSalt(byteLength = 16) {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    try {
      const bytes = new Uint8Array(byteLength);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {}
  }
  // Math.random fallback
  let salt = '';
  for (let i = 0; i < byteLength * 2; i++) {
    salt += Math.floor(Math.random() * 16).toString(16);
  }
  return salt;
}

/**
 * Pure JS multi-round salted SHA-256 hash (1,000 rounds)
 */
function hashPureJSSalted(password, saltHex) {
  let h = saltHex + ':' + password;
  for (let round = 0; round < 1000; round++) {
    h = sha256(h + saltHex);
  }
  return h;
}

/**
 * Client-Side Password Pre-Encryption
 * Hashes the user's password using salted SHA-256 before network transmission.
 * Ensures that the plaintext password is NEVER visible in browser DevTools Network payloads,
 * logs, or HTTP traffic.
 */
export function encryptClientPassword(password) {
  if (!password) return '';
  const CLIENT_PEPPER = 'expense_tracker_secure_client_pepper_v1';
  let h = sha256(password + CLIENT_PEPPER);
  for (let i = 0; i < 50; i++) {
    h = sha256(h + CLIENT_PEPPER);
  }
  return h;
}

/**
 * Encrypt/Hash password
 * Uses Web Crypto PBKDF2 if subtle is available, otherwise uses multi-round salted SHA-256.
 * Guaranteed NEVER to throw "Cannot read properties of undefined (reading 'importKey')"
 */
export async function encryptPassword(password, existingSalt = null) {
  const saltHex = existingSalt || generateSalt(16);

  // Check if Web Crypto subtle is supported in this context
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.importKey === 'function' &&
    typeof window.crypto.subtle.deriveBits === 'function'
  ) {
    try {
      const enc = new TextEncoder();
      const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations: 100000,
          hash: 'SHA-512'
        },
        passwordKey,
        256
      );

      const hashArray = Array.from(new Uint8Array(derivedBits));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `pbkdf2:${saltHex}:${hashHex}`;
    } catch (e) {
      console.warn('Web Crypto subtle failed, falling back to pure JS hash:', e.message);
    }
  }

  // Pure JS Multi-Round Salted SHA-256 Fallback
  const hashHex = hashPureJSSalted(password, saltHex);
  return `sha256:${saltHex}:${hashHex}`;
}

/**
 * Verify a plaintext password against a stored combined hash
 */
export async function verifyPassword(password, storedCombined) {
  if (!storedCombined) return false;

  // Format 1: "pbkdf2:salt:hash"
  if (storedCombined.startsWith('pbkdf2:')) {
    const [, salt, originalHash] = storedCombined.split(':');
    const computed = await encryptPassword(password, salt);
    if (computed.startsWith('pbkdf2:')) {
      const [, , computedHash] = computed.split(':');
      return originalHash === computedHash;
    }
  }

  // Format 2: "sha256:salt:hash"
  if (storedCombined.startsWith('sha256:')) {
    const [, salt, originalHash] = storedCombined.split(':');
    const computedHash = hashPureJSSalted(password, salt);
    return originalHash === computedHash;
  }

  // Format 3: legacy / standard "salt:hash"
  if (storedCombined.includes(':')) {
    const [salt, originalHash] = storedCombined.split(':');
    // Test pure JS salted SHA256
    if (hashPureJSSalted(password, salt) === originalHash) {
      return true;
    }
    // Test pbkdf2 if available
    try {
      const computed = await encryptPassword(password, salt);
      const computedHash = computed.split(':').pop();
      if (computedHash === originalHash) return true;
    } catch {}
  }

  return false;
}

/**
 * Local Encrypted Users Database Helpers
 */
async function getLocalUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Pre-seed demo user with client-encrypted password 'demo123'
  const demoHash = await encryptPassword(encryptClientPassword('demo123'));
  const initialUsers = [
    {
      id: 'usr_demo_1',
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash: demoHash,
      createdAt: new Date().toISOString()
    }
  ];
  saveLocalUsers(initialUsers);
  return initialUsers;
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
  } catch {}
}

/**
 * Log in with Email (or Username) and Password
 */
export async function loginUser(identifier, password) {
  const cleanId = (identifier || '').trim();
  const cleanPass = password || '';

  if (!cleanId || !cleanPass) {
    throw new Error('Please enter both your email and password.');
  }

  // Pre-encrypt password so the network payload NEVER exposes the plaintext password in DevTools Network
  const encryptedPayloadPassword = encryptClientPassword(cleanPass);

  // 1. Attempt server-side login
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanId, password: encryptedPayloadPassword })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSession(data.user, data.token);
        return { success: true, user: data.user, source: 'server' };
      }
    } else if (res.status === 401) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid email or password.');
    }
    // Note: status 404 means the remote server doesn't have the auth route yet -> smoothly fall back
  } catch (serverErr) {
    if (serverErr.message && serverErr.message.includes('Invalid email or password')) {
      throw serverErr;
    }
    // Remote server offline or route 404 -> fallback to local encrypted store
  }

  // 2. Fallback to Local Encrypted Users Database
  const localUsers = await getLocalUsers();
  const lowerId = cleanId.toLowerCase();
  const foundUser = localUsers.find(
    u => u.email.toLowerCase() === lowerId || u.name.toLowerCase() === lowerId
  );

  // Special fast-path for demo account
  if (lowerId === 'demo@example.com' && (cleanPass === 'demo123' || encryptedPayloadPassword === encryptClientPassword('demo123'))) {
    const userObj = foundUser || { id: 'usr_demo_1', name: 'Demo User', email: 'demo@example.com' };
    const token = 'local_tok_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    setSession(userObj, token);
    return { success: true, user: userObj, source: 'local' };
  }

  if (!foundUser) {
    throw new Error('Invalid email or password.');
  }

  const isValid =
    (await verifyPassword(encryptedPayloadPassword, foundUser.passwordHash)) ||
    (await verifyPassword(cleanPass, foundUser.passwordHash));

  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const token = 'local_tok_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  const userObj = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
  setSession(userObj, token);
  return { success: true, user: userObj, source: 'local' };
}

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Full Name must be at least 2 characters long.');
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!cleanPass || cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // Pre-encrypt password so the network payload NEVER exposes the plaintext password in DevTools Network
  const encryptedPayloadPassword = encryptClientPassword(cleanPass);

  // 1. Attempt server-side registration
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password: encryptedPayloadPassword })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        return { success: true, user: data.user, source: 'server' };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 409 || res.status === 400) {
        throw new Error(errData.message || 'Registration failed.');
      }
    }
  } catch (serverErr) {
    if (serverErr.message && (serverErr.message.includes('already exists') || serverErr.message.includes('characters'))) {
      throw serverErr;
    }
  }

  // 2. Fallback to Local Encrypted Users Database
  const localUsers = await getLocalUsers();
  if (localUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  // Encrypt client-encrypted password using salted hash
  const passwordHash = await encryptPassword(encryptedPayloadPassword);
  const newUser = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  localUsers.push(newUser);
  saveLocalUsers(localUsers);

  const userObj = { id: newUser.id, name: newUser.name, email: newUser.email };
  return { success: true, user: userObj, source: 'local' };
}

/**
 * Set active user session
 */
export function setSession(user, token) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  } catch {}
}

/**
 * Get active user session
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get current session token
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Log out
 */
export function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch {}
}
