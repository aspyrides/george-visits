import { CONFIG } from "./config.js";
import { db, authReady } from "./firebase-init.js";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/* ---------------------------------------------------------------- *
 * Date / time helpers
 * ---------------------------------------------------------------- */
const pad2 = (n) => String(n).padStart(2, "0");

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}
function generateSlotTimes() {
  const start = timeToMinutes(CONFIG.dayStart);
  const end = timeToMinutes(CONFIG.dayEnd);
  const slots = [];
  for (let t = start; t < end; t += CONFIG.slotMinutes) slots.push(minutesToTime(t));
  return slots;
}
function formatTime12h(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}
function formatDayLabel(d) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function formatDayShort(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}
function isPastDay(d) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < t;
}
function isPastSlot(dateISO, timeStr) {
  const now = new Date();
  const slotDate = fromISODate(dateISO);
  const [h, m] = timeStr.split(":").map(Number);
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() < now.getTime();
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const SLOT_TIMES = generateSlotTimes();

/* ---------------------------------------------------------------- *
 * LocalStorage
 * ---------------------------------------------------------------- */
const LS_PIN_OK = "gv_pin_ok";
const LS_PROFILE = "gv_profile";

const getPinOk = () => localStorage.getItem(LS_PIN_OK) === "yes";
const setPinOk = () => localStorage.setItem(LS_PIN_OK, "yes");

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(LS_PROFILE));
  } catch {
    return null;
  }
}
function setProfile(p) {
  localStorage.setItem(LS_PROFILE, JSON.stringify(p));
}

/* ---------------------------------------------------------------- *
 * State
 * ---------------------------------------------------------------- */
let currentUid = null;
let slotsMap = {}; // `${date}_${time}` -> { date, time, bookings: [...], totalVisitors }
let activeTab = "calendar";
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDay = new Date();
let pendingBooking = null; // { dateISO, time }
let isEditingProfile = false;

/* ---------------------------------------------------------------- *
 * DOM refs
 * ---------------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);

const screens = {
  pin: $("#pin-gate"),
  profile: $("#profile-setup"),
  main: $("#main-app"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

/* ---------------------------------------------------------------- *
 * Toast
 * ---------------------------------------------------------------- */
let toastTimer = null;
function showToast(message, isError = false) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3000);
}

/* ---------------------------------------------------------------- *
 * Relationship dropdown
 * ---------------------------------------------------------------- */
function populateRelationshipSelect(selectEl, selectedValue) {
  selectEl.innerHTML = '<option value="">Prefer not to say</option>';
  CONFIG.relationshipOptions.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    if (opt === selectedValue) o.selected = true;
    selectEl.appendChild(o);
  });
}

/* ---------------------------------------------------------------- *
 * PIN gate
 * ---------------------------------------------------------------- */
$("#pin-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const value = $("#pin-input").value.trim();
  if (value === CONFIG.appPin) {
    setPinOk();
    $("#pin-error").classList.add("hidden");
    afterPinAccepted();
  } else {
    $("#pin-error").classList.remove("hidden");
  }
});

function afterPinAccepted() {
  if (getProfile()) {
    enterMainApp();
  } else {
    isEditingProfile = false;
    showScreen("profile");
  }
}

/* ---------------------------------------------------------------- *
 * Profile setup
 * ---------------------------------------------------------------- */
$("#profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#profile-name").value.trim();
  const relationship = $("#profile-relationship").value;
  if (!name) return;
  setProfile({ name, relationship });
  enterMainApp();
});

$("#edit-profile-btn").addEventListener("click", () => {
  const p = getProfile() || { name: "", relationship: "" };
  $("#profile-name").value = p.name;
  populateRelationshipSelect($("#profile-relationship"), p.relationship);
  $("#profile-heading").textContent = "Edit your info";
  $("#profile-cancel").classList.remove("hidden");
  isEditingProfile = true;
  showScreen("profile");
});

$("#profile-cancel").addEventListener("click", () => {
  isEditingProfile = false;
  $("#profile-heading").textContent = "Who's visiting?";
  $("#profile-cancel").classList.add("hidden");
  showScreen("main");
});

function enterMainApp() {
  isEditingProfile = false;
  $("#profile-heading").textContent = "Who's visiting?";
  $("#profile-cancel").classList.add("hidden");
  $("#app-title").textContent = CONFIG.appTitle;
  updateProfileBadge();
  showScreen("main");
  renderActiveTab();
}

function updateProfileBadge() {
  const p = getProfile();
  if (!p) return;
  $("#profile-badge").textContent = p.relationship ? `${p.name} · ${p.relationship}` : p.name;
}

/* ---------------------------------------------------------------- *
 * Tabs
 * ---------------------------------------------------------------- */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("hidden"));
  $(`#tab-${tab}`).classList.remove("hidden");
  renderActiveTab();
}

function renderActiveTab() {
  if (activeTab === "calendar") renderCalendar();
  else if (activeTab === "day") renderDayView();
  else if (activeTab === "mine") renderMyBookings();
}

/* ---------------------------------------------------------------- *
 * Calendar view
 * ---------------------------------------------------------------- */
$("#prev-month").addEventListener("click", () => {
  calendarMonth = addMonths(calendarMonth, -1);
  renderCalendar();
});
$("#next-month").addEventListener("click", () => {
  calendarMonth = addMonths(calendarMonth, 1);
  renderCalendar();
});

function dayFullness(dateISO) {
  const maxCapacity = SLOT_TIMES.length * CONFIG.slotCapacity;
  let total = 0;
  for (const t of SLOT_TIMES) {
    const slot = slotsMap[`${dateISO}_${t}`];
    if (slot) total += slot.totalVisitors || 0;
  }
  if (total <= 0) return "available";
  if (total >= maxCapacity) return "full";
  if (total >= maxCapacity * 0.6) return "limited";
  return "available";
}

function renderCalendar() {
  $("#month-label").textContent = calendarMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const grid = $("#calendar-grid");
  grid.innerHTML = "";

  const firstOfMonth = calendarMonth;
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell empty";
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), day);
    const dateISO = toISODate(d);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (isSameDay(d, new Date())) cell.classList.add("today");
    if (isSameDay(d, selectedDay)) cell.classList.add("selected");
    const past = isPastDay(d);
    if (past) cell.classList.add("past");

    const fullness = dayFullness(dateISO);
    cell.innerHTML = `<span>${day}</span>${past ? "" : `<i class="dot ${fullness}"></i>`}`;

    if (!past) {
      cell.addEventListener("click", () => {
        selectedDay = d;
        switchTab("day");
      });
    }
    grid.appendChild(cell);
  }
}

/* ---------------------------------------------------------------- *
 * Day view
 * ---------------------------------------------------------------- */
$("#prev-day").addEventListener("click", () => {
  selectedDay = addDays(selectedDay, -1);
  renderDayView();
});
$("#next-day").addEventListener("click", () => {
  selectedDay = addDays(selectedDay, 1);
  renderDayView();
});

function renderDayView() {
  $("#day-label").textContent = formatDayLabel(selectedDay);
  const dateISO = toISODate(selectedDay);
  const list = $("#slot-list");
  list.innerHTML = "";

  SLOT_TIMES.forEach((time) => {
    const slot = slotsMap[`${dateISO}_${time}`] || { bookings: [], totalVisitors: 0 };
    const remaining = CONFIG.slotCapacity - (slot.totalVisitors || 0);
    const past = isPastSlot(dateISO, time);
    const mine = slot.bookings.find((b) => b.uid === currentUid);

    const card = document.createElement("div");
    card.className = "slot-card" + (past ? " past" : "") + (mine ? " mine" : "");

    const guestsHtml = slot.bookings.length
      ? `<div class="slot-guests">${slot.bookings
          .map(
            (b) =>
              `<span class="guest-chip">${escapeHtml(b.name)}${b.relationship ? " · " + escapeHtml(b.relationship) : ""}${
                b.visitorCount > 1 ? ` (+${b.visitorCount - 1})` : ""
              }</span>`
          )
          .join("")}</div>`
      : "";

    let statusText;
    if (past) statusText = "Past";
    else if (remaining <= 0) statusText = "Fully booked";
    else statusText = `${remaining} of ${CONFIG.slotCapacity} spot${remaining === 1 ? "" : "s"} open`;

    let actionHtml;
    if (past) {
      actionHtml = "";
    } else if (mine) {
      actionHtml = `<button class="btn-danger" data-cancel="${time}">Cancel your visit</button>`;
    } else if (remaining <= 0) {
      actionHtml = `<button class="btn-full" disabled>Full</button>`;
    } else {
      actionHtml = `<button class="btn-book" data-book="${time}">Book</button>`;
    }

    card.innerHTML = `
      <div class="slot-time">${formatTime12h(time)}</div>
      <div class="slot-info">
        <div class="slot-status">${statusText}</div>
        ${guestsHtml}
      </div>
      <div class="slot-action">${actionHtml}</div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => openBookingModal(dateISO, btn.dataset.book));
  });
  list.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => handleCancel(dateISO, btn.dataset.cancel));
  });
}

/* ---------------------------------------------------------------- *
 * My bookings
 * ---------------------------------------------------------------- */
function renderMyBookings() {
  const container = $("#my-bookings-list");
  container.innerHTML = "";

  const mine = [];
  Object.values(slotsMap).forEach((slot) => {
    const b = slot.bookings.find((x) => x.uid === currentUid);
    if (b) mine.push({ date: slot.date, time: slot.time, ...b });
  });
  mine.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (mine.length === 0) {
    container.innerHTML = '<div class="empty-state">You haven’t booked a visit yet.</div>';
    return;
  }

  mine.forEach((b) => {
    const d = fromISODate(b.date);
    const past = isPastSlot(b.date, b.time);
    const row = document.createElement("div");
    row.className = "booking-row" + (past ? " past" : "");
    row.innerHTML = `
      <div>
        <strong>${formatDayShort(d)}</strong> at ${formatTime12h(b.time)}
        ${b.visitorCount > 1 ? `<div class="muted">${b.visitorCount} visitors</div>` : ""}
      </div>
      ${past ? "" : `<button class="btn-danger" data-cancel-date="${b.date}" data-cancel-time="${b.time}">Cancel</button>`}
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("[data-cancel-date]").forEach((btn) => {
    btn.addEventListener("click", () => handleCancel(btn.dataset.cancelDate, btn.dataset.cancelTime));
  });
}

/* ---------------------------------------------------------------- *
 * Booking modal
 * ---------------------------------------------------------------- */
function openBookingModal(dateISO, time) {
  pendingBooking = { dateISO, time };
  const slot = slotsMap[`${dateISO}_${time}`] || { bookings: [], totalVisitors: 0 };
  const remaining = CONFIG.slotCapacity - (slot.totalVisitors || 0);

  $("#modal-subtitle").textContent = `${formatDayLabel(fromISODate(dateISO))} at ${formatTime12h(time)}`;

  const guestsEl = $("#modal-slot-guests");
  guestsEl.innerHTML = slot.bookings.length
    ? "Already booked: " +
      slot.bookings
        .map((b) => escapeHtml(b.name) + (b.relationship ? ` (${escapeHtml(b.relationship)})` : ""))
        .join(", ")
    : "";

  const select = $("#visitor-count");
  select.innerHTML = "";
  for (let i = 1; i <= remaining; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i;
    select.appendChild(o);
  }

  $("#booking-modal").classList.remove("hidden");
}

function closeModal() {
  $("#booking-modal").classList.add("hidden");
  pendingBooking = null;
}
$("#modal-close").addEventListener("click", closeModal);
$("#booking-modal").addEventListener("click", (e) => {
  if (e.target.id === "booking-modal") closeModal();
});

$("#booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!pendingBooking) return;
  const count = Number($("#visitor-count").value);
  const { dateISO, time } = pendingBooking;
  try {
    await bookSlot(dateISO, time, count);
    closeModal();
    showToast("Visit booked!");
  } catch (err) {
    closeModal();
    if (err.message === "FULL") showToast("Sorry, that slot just filled up.", true);
    else if (err.message === "ALREADY_BOOKED") showToast("You already have a booking in this slot.", true);
    else showToast("Something went wrong. Please try again.", true);
    console.error(err);
  }
});

async function handleCancel(dateISO, time) {
  try {
    await cancelSlot(dateISO, time);
    showToast("Booking canceled.");
  } catch (err) {
    showToast("Something went wrong. Please try again.", true);
    console.error(err);
  }
}

/* ---------------------------------------------------------------- *
 * Firestore: booking / cancellation
 * ---------------------------------------------------------------- */
async function bookSlot(dateISO, time, visitorCount) {
  const profile = getProfile();
  const slotRef = doc(db, "slots", `${dateISO}_${time}`);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(slotRef);
    const data = snap.exists() ? snap.data() : { date: dateISO, time, bookings: [], totalVisitors: 0 };

    if ((data.bookings || []).some((b) => b.uid === currentUid)) {
      throw new Error("ALREADY_BOOKED");
    }
    const newTotal = (data.totalVisitors || 0) + visitorCount;
    if (newTotal > CONFIG.slotCapacity) {
      throw new Error("FULL");
    }
    const bookings = [
      ...(data.bookings || []),
      {
        uid: currentUid,
        name: profile.name,
        relationship: profile.relationship || "",
        visitorCount,
        bookedAt: Date.now(),
      },
    ];
    tx.set(slotRef, { date: dateISO, time, bookings, totalVisitors: newTotal });
  });
}

async function cancelSlot(dateISO, time) {
  const slotRef = doc(db, "slots", `${dateISO}_${time}`);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(slotRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const mine = (data.bookings || []).find((b) => b.uid === currentUid);
    if (!mine) return;
    const bookings = data.bookings.filter((b) => b.uid !== currentUid);
    const totalVisitors = Math.max(0, (data.totalVisitors || 0) - mine.visitorCount);
    tx.set(slotRef, { date: dateISO, time, bookings, totalVisitors });
  });
}

/* ---------------------------------------------------------------- *
 * Real-time subscription
 * ---------------------------------------------------------------- */
function subscribeSlots() {
  onSnapshot(collection(db, "slots"), (snapshot) => {
    const map = {};
    snapshot.forEach((docSnap) => {
      map[docSnap.id] = docSnap.data();
    });
    slotsMap = map;
    renderActiveTab();
  });
}

/* ---------------------------------------------------------------- *
 * Init
 * ---------------------------------------------------------------- */
async function init() {
  populateRelationshipSelect($("#profile-relationship"));

  if (!getPinOk()) {
    showScreen("pin");
  } else if (!getProfile()) {
    showScreen("profile");
  } else {
    $("#app-title").textContent = CONFIG.appTitle;
    updateProfileBadge();
    showScreen("main");
  }

  try {
    currentUid = await authReady;
  } catch (err) {
    console.error("Firebase auth failed. Did you fill in js/firebase-init.js?", err);
    showToast("Setup incomplete: check the Firebase config in js/firebase-init.js", true);
    return;
  }

  subscribeSlots();
  if (getPinOk() && getProfile()) renderActiveTab();
}

init();
