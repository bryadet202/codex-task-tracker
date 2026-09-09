# Codex Task Tracker

A dependency-free task tracker built with plain HTML, CSS, and JavaScript.

## Run locally

Open `index.html` in a modern browser. No installation or build step is needed.

Add a task with **Add task** or Enter. Use its checkbox to complete or reopen it,
and its × button to delete it. Filter by All, To do, or Completed.

Tasks are saved in localStorage in the same browser. Browser settings may restrict
storage for local files; the app displays a warning if saving fails. For a stable
local origin, you can serve this directory with any static web server you already
have installed (for example, `python -m http.server 8000`), then visit
`http://localhost:8000`. File and server URLs have separate storage. Clearing
browser data removes saved tasks.

## Files

- `index.html` — page structure and accessible controls.
- `styles.css` — responsive layout and styling.
- `app.js` — task interactions, filters, and persistence.
