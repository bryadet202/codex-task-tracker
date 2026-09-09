"use strict";
const STORAGE_KEY = "daylist.tasks.v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const warning = document.querySelector("#warning");
const filters = document.querySelector("#filters");
let tasks = [];
let filter = "all";
function storageWarning(message) {
  warning.textContent = message;
  warning.hidden = false;
  document.querySelector("#save-note").textContent = "Changes may not be saved.";
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(task => task && typeof task.id === "string" && typeof task.text === "string" && task.text.trim().length > 0 && typeof task.completed === "boolean") || new Set(parsed.map(task => task.id)).size !== parsed.length) throw new Error("Invalid saved tasks");
    tasks = parsed;
  }
} catch {
  storageWarning("Saved tasks could not be loaded. You can still use the list, but existing saved data may be replaced when you make changes.");
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    warning.hidden = true;
    document.querySelector("#save-note").textContent = "Saved in this browser.";
  } catch {
    storageWarning("Your changes are available for this session, but could not be saved. Browser storage may be full or disabled.");
  }
}
function announce(message) { document.querySelector("#announcement").textContent = message; }
function render() {
  const completed = tasks.filter(task => task.completed).length;
  document.querySelector("#count").textContent = `${tasks.length - completed} to do`;
  document.querySelector("#progress").textContent = tasks.length ? `${completed} of ${tasks.length} done` : "A fresh start";
  const visible = tasks.filter(task => filter === "all" || (filter === "completed" ? task.completed : !task.completed));
  list.replaceChildren();
  for (const task of visible) {
    const row = document.createElement("li");
    row.className = `task${task.completed ? " completed" : ""}`;
    row.dataset.id = task.id;
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    label.append(checkbox, text);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.setAttribute("aria-label", `Delete task: ${task.text}`);
    remove.title = "Delete task";
    remove.textContent = "×";
    row.append(label, remove);
    list.append(row);
  }
  document.querySelector("#empty").hidden = visible.length > 0;
  const emptyText = filter === "completed" ? ["Good things take a first step.", "Your completed tasks will appear here."] : filter === "active" && tasks.length ? ["All clear. Nicely done!", "Take a breath, or add something new above."] : ["A little space for your next big thing.", "Add your first task above to get started."];
  document.querySelector("#empty-title").textContent = emptyText[0];
  document.querySelector("#empty-description").textContent = emptyText[1];
  for (const button of filters.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
}
function createId() {
  // Also works on local file URLs and older browsers without randomUUID.
  let id;
  do { id = `${Date.now()}-${Math.random().toString(36).slice(2)}`; } while (tasks.some(task => task.id === id));
  return id;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.setCustomValidity("Please enter a task."); input.reportValidity(); return; }
  tasks.push({ id: createId(), text, completed: false });
  input.value = "";
  if (filter === "completed") filter = "all";
  save(); render(); input.focus(); announce("Task added.");
});
input.addEventListener("input", () => input.setCustomValidity(""));
filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  filter = button.dataset.filter;
  render();
});
function restoreFocus(id, index, selector) {
  const rows = Array.from(list.children);
  const row = rows.find(item => item.dataset.id === id) || rows[Math.min(index, rows.length - 1)];
  if (row) row.querySelector(selector).focus(); else input.focus();
}
list.addEventListener("change", event => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const row = event.target.closest("li");
  const index = Array.from(list.children).indexOf(row);
  const task = tasks.find(item => item.id === row.dataset.id);
  task.completed = event.target.checked;
  save(); render(); restoreFocus(task.id, index, "input");
  announce(task.completed ? "Task completed." : "Task marked to do.");
});
list.addEventListener("click", event => {
  const button = event.target.closest(".delete");
  if (!button) return;
  const row = button.closest("li");
  const index = Array.from(list.children).indexOf(row);
  tasks = tasks.filter(task => task.id !== row.dataset.id);
  save(); render(); restoreFocus(null, index, "button"); announce("Task deleted.");
});
render();
