/**
 * auth.js
 * Thin wrapper around localStorage for persisting the signed-in user.
 * Stores: { _id, email, name, isProfessional, professionalRole }
 */

const USER_KEY = "feelit_user";

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function isPro() {
  return Boolean(getUser()?.isProfessional);
}
