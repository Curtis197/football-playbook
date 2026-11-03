# Antigravity Task Specification: Firebase NoSQL Integration & Playbook Library

## 1. Goal & Context

Integrate **Google Cloud Firestore (NoSQL)** into the existing Football Playbook & Philosophy web application without user authentication (direct, frictionless single-user access). The application must persist, fetch, duplicate, and delete custom plays and base formation templates, as well as load plays filtered by strategy tags (e.g., `3-5-counter`, `zone-read`, `rpo`).

---

## 2. Technical Stack & Architecture

* **Framework:** Existing TypeScript + Vite + React / SVG Canvas architecture.
* **Backend / Database:** Firebase JS SDK (`firebase/firestore`, `firebase/app`).
* **Auth Strategy:** Auth-free (no login screen, no user sessions; open Firestore root collections with local environment configuration).
* **Primary Data Schema:** Existing `Play` and `Player` interfaces conforming to Spec 1 (`src/types/playbook.ts`).

---

## 3. Scope of Work & Deliverables

### Phase 1: Dependency Setup & Config

1. **Install Firebase SDK:**
```bash
npm install firebase
```

2. **Environment Variable Configuration:**
Create `.env.example` and load variables via Vite (`import.meta.env`):
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

3. **Firebase Client Init (`src/services/firebase.ts`):**
* Initialize Firebase App and export the Firestore `db` instance.
* Include a graceful console warning if environment variables are not yet populated.

---

### Phase 2: Persistence Service Layer (`src/services/playbookDb.ts`)

Implement the root Firestore operations with full TypeScript types:

1. **Formation Templates Collection (`formations`):**
* `saveFormation(formation: Formation): Promise<void>` (upsert using `setDoc(..., { merge: true })`).
* `fetchFormations(): Promise<Formation[]>` (retrieve all offensive and defensive alignment presets).
* `deleteFormation(id: string): Promise<void>`.

2. **Plays Collection (`plays`):**
* `savePlay(play: Play): Promise<void>` (upsert using `setDoc`).
* `fetchPlay(id: string): Promise<Play | null>`.
* `fetchAllPlays(): Promise<Play[]>`.
* `fetchPlaysByCategory(category: PlayCategory): Promise<Play[]>`.
* `fetchPlaysByTag(tag: string): Promise<Play[]>` (query via `where("tags", "array-contains", tag)`).
* `deletePlay(id: string): Promise<void>`.

3. **Fallback & Seeding:**
* If the remote `plays` collection is empty on initial fetch, provide a one-click `Seed Default Presets` utility that populates Firestore with the existing preset plays (`Shotgun Wishbone vs 3-5 Odd`, `Gun Trey Boot vs 3-4 Over`, `Pistol Counter Trey vs 4-2-5`).

---

### Phase 3: UI Integration (Toolbar & Drawer Modals)

1. **Play Library Modal / Drawer (`src/components/PlayLibraryModal.tsx`):**
* Triggerable from the main top toolbar ("My Playbook" button).
* Displays all saved plays in a grid/list with their Strategy Badges:
  * Run Concept (Amber badge)
  * Counter / PA Action (Cyan badge)
  * Defensive Front (Rose badge)
* Filter bar: Filter by Category (`run`, `pass_action`, `rpo`, `screen`) or Search by Tag (`3-5-counter`, `glance`, etc.).
* Actions per card: **Load Play onto Chalkboard**, **Duplicate Play**, and **Delete Play**.

2. **Formations Template Switcher:**
* Allow saving the current player positions as a new base formation (e.g., "Shotgun Wishbone 21 Pers").
* Dropdown to apply an existing formation template onto the canvas without clearing existing route assignments unless confirmed.

3. **Save / Cloud Sync Indicators:**
* Add a "Save to Cloud" button in the header with visual feedback (Idle -> Saving -> Saved checkmark).
* Display a non-intrusive error banner if Firestore rejects the write (e.g., network timeout or invalid API keys).

---

## 4. Acceptance Criteria & Verification Plan

1. **Build & Type Check:**
* Run `npm run build` (`tsc -b && vite build`) with zero TypeScript errors.

2. **Local Feature Test:**
* Save the active Shotgun Wishbone play under a custom name (e.g., "Shotgun Wishbone - Zone Glance v2").
* Reload the browser, open the Library Drawer, and verify that the play appears with all player coordinates, Bézier route points, sharp cut markers, and coaching notes intact.
* Verify that deleting a play in the Library removes it from Firestore and updates the UI state.

3. **Tag Query Test:**
* Filter the library by tag `3-5-counter` and confirm only matching plays are displayed.

4. **Offline / Error Handling:**
* If offline or missing keys, UI must display a clear inline toast message without crashing the SVG canvas.
