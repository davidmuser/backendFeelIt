const STORAGE_KEYS = {
  currentEmail: "dailyMoodTracker_currentEmail",
  emailList: "dailyMoodTracker_emailList",
};

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeKey(email) {
  return `dailyMoodTracker_${encodeURIComponent(normalizeEmail(email))}`;
}

function getStorageKey(email, suffix) {
  return `${safeKey(email)}_${suffix}`;
}

export function getCurrentEmail() {
  return localStorage.getItem(STORAGE_KEYS.currentEmail) || "";
}

export function clearCurrentEmail() {
  localStorage.removeItem(STORAGE_KEYS.currentEmail);
}

export function getEmailList() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.emailList) || "[]");
  } catch {
    return [];
  }
}

export function setCurrentEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return "";

  const existingList = getEmailList();
  if (!existingList.includes(normalized)) {
    existingList.push(normalized);
    localStorage.setItem(STORAGE_KEYS.emailList, JSON.stringify(existingList));
  }

  localStorage.setItem(STORAGE_KEYS.currentEmail, normalized);
  return normalized;
}

export function loadUserMoodState(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const today = getTodayKey();
  const storedDate = localStorage.getItem(getStorageKey(normalized, "date"));
  const mood = localStorage.getItem(getStorageKey(normalized, "mood"));
  const note = localStorage.getItem(getStorageKey(normalized, "note"));
  const startDate = localStorage.getItem(getStorageKey(normalized, "startDate"));

  if (storedDate !== today || !mood) {
    return {
      answeredToday: false,
      mood: null,
      note: "",
      startDate,
      date: storedDate,
    };
  }

  return {
    answeredToday: true,
    mood,
    note: note || "",
    startDate,
    date: storedDate,
  };
}

export function saveUserMoodState(email, mood, note) {
  const normalized = normalizeEmail(email);
  if (!normalized || !mood) return null;

  const today = getTodayKey();
  const startDateKey = getStorageKey(normalized, "startDate");
  const existingStartDate = localStorage.getItem(startDateKey) || today;

  localStorage.setItem(getStorageKey(normalized, "mood"), mood);
  localStorage.setItem(getStorageKey(normalized, "note"), note || "");
  localStorage.setItem(getStorageKey(normalized, "date"), today);
  localStorage.setItem(startDateKey, existingStartDate);

  return {
    answeredToday: true,
    mood,
    note: note || "",
    startDate: existingStartDate,
    date: today,
  };
}
