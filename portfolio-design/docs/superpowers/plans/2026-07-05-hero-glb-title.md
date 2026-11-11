# Hero GLB Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible `Y VAN DANG` hero headline with the `assets/text-ydang.glb` 3D model while keeping accessible text fallback.

**Architecture:** Keep the site as static HTML. Add a focused hero title canvas container in `index.html`, load Three.js and `GLTFLoader` from CDN, render the local GLB into that container, and reveal fallback text if the model fails.

**Tech Stack:** Static HTML, CSS, Three.js ES modules, GLTFLoader, Node-based static verification.

---

### Task 1: Static Contract Test

**Files:**
- Create: `tests/hero-glb-title-static.test.cjs`
- Modify: `index.html`

- [ ] **Step 1: Write the failing test**

Create a Node script that reads `index.html` and asserts the GLB title contract.

- [ ] **Step 2: Verify the test fails**

Run: `node tests/hero-glb-title-static.test.cjs`

Expected before implementation: fails for missing 3D title container, GLB reference, Three.js import, and GLTFLoader import.

### Task 2: Implement Hero GLB Title

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add CSS for the 3D title**

Add `.hero-title-3d`, `.hero-title-3d__canvas`, and `.hero-title-3d__fallback` styles near the existing hero title styles.

- [ ] **Step 2: Replace visible title markup**

Replace the two visible `h1` headline layers with a `div.hero-title-3d` that contains a canvas and fallback accessible text.

- [ ] **Step 3: Add Three.js loader script**

Add a module script that imports Three.js and GLTFLoader, loads `./assets/text-ydang.glb`, centers/scales it, renders on resize, and reveals fallback on load failure.

- [ ] **Step 4: Verify static contract passes**

Run: `node tests/hero-glb-title-static.test.cjs`

Expected: all checks pass.

### Task 3: Browser Verification

**Files:**
- Read: `index.html`
- Read: `assets/text-ydang.glb`

- [ ] **Step 1: Serve the static page locally**

Run a local static server from `E:\portfolio\portfolio` so GLB fetch works over HTTP instead of `file://`.

- [ ] **Step 2: Capture/render check**

Open the page in browser automation and verify the title canvas exists, has non-zero dimensions, and renders nonblank pixels.
