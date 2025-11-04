// lib/tokenStorage.js
// وظائف بسيطة لقراءة وكتابة access/refresh tokens و user data.
// ملاحظة: في Next.js تأكد أن هذه الدوال تُستدعى في client-only code ("use client").

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user_data";

/* ---------- access token (localStorage) ---------- */
export const setAccessToken = (token) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(ACCESS_TOKEN_KEY, token || ""); } catch (e) {}
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(ACCESS_TOKEN_KEY); } catch (e) { return null; }
};

export const clearAccessToken = () => {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(ACCESS_TOKEN_KEY); } catch (e) {}
};

/* ---------- refresh token (cookie non-HttpOnly fallback) ---------- */
// Note: الأفضل أن يُدير السيرفر refresh token كـ HttpOnly cookie.
// لكن إن عاد refresh token في body أو أردت تخزينه في الـ client (development)، هذه الدوال تساعد.

const _readCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const _setCookie = (name, value, days = 30, sameSite = "Lax") => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Default SameSite=Lax; for cross-site use SameSite=None; Secure=true (requires HTTPS)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=${sameSite}`;
};

const _clearCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

// export const setRefreshToken = (refreshToken, days = 30) => {
//   // يحفظ في كوكي عادية (غير HttpOnly). الأفضل أن يكون الخادم هو الذي يضع HttpOnly cookie.
//   _setCookie(REFRESH_TOKEN_KEY, refreshToken, days, "Lax");
// };

// export const getRefreshToken = () => {
//   // يرجع null إن كانت الكوكي HttpOnly أو غير موجودة
//   return _readCookie(REFRESH_TOKEN_KEY);
// };

export const clearRefreshToken = () => {
  _clearCookie(REFRESH_TOKEN_KEY);
};

/* ---------- user data (localStorage) ---------- */
export const setUserData = (userObj) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(USER_KEY, JSON.stringify(userObj || {})); } catch (e) {}
};

export const getUserData = () => {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch (e) { return null; }
};

export const clearUserData = () => {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(USER_KEY); } catch (e) {}
};
