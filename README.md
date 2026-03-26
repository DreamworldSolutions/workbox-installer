# @dreamworld/workbox-installer

A PWA service worker lifecycle manager built on [`workbox-window`](https://developer.chrome.com/docs/workbox/modules/workbox-window/) that handles SW registration, update detection, user confirmation flow, and activation — with optional Firebase/Firestore-backed update-checking strategies.

---

## 1. User Guide

### Installation & Setup

**Package name:** `@dreamworld/workbox-installer`
**Module system:** ES Module only (`"type": "module"` in package.json)

**Declared dependencies** (from `package.json`):

| Package | Version |
|---------|---------|
| `firebase` | `^11.0.1` |
| `workbox-window` | `^7.1.0` |

> **Build steps:** Not determinable from provided source. No build script is defined in `package.json`.

---

### Basic Usage

**Minimal — URL string shorthand:**

```javascript
import installWorkbox from '@dreamworld/workbox-installer';

installWorkbox('/service-worker.js');
```

**Standard — with update confirmation:**

```javascript
import installWorkbox from '@dreamworld/workbox-installer';

installWorkbox({
  url: '/service-worker.js',
  confirmUpdate: (updates) => {
    return new Promise((resolve) => {
      // Show your update notification UI here.
      // Call resolve() when the user confirms the update.
      showUpdateBanner({ onConfirm: resolve });
    });
  }
});
```

---

### API Reference

#### `install(options)` — default export

```javascript
import installWorkbox from '@dreamworld/workbox-installer';
// or
import { install } from '@dreamworld/workbox-installer';
```

**`options`** can be a `string` (treated as `{ url: options }`) or an object:

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `url` | `string` | `'/service-worker.js'` | No | Path to the service worker script. |
| `confirmUpdate` | `(updates: any) => Promise<void>` | No-op promise (never resolves) | No | Called when a new SW is in the `waiting` state. Resolve the returned promise to trigger `skipWaiting` and proceed with the update. |
| `updateChecker` | `UpdateChecker` instance | `new UpdateChecker()` (no-op) | No | Strategy instance for detecting updates via Firebase/Firestore. When its `onUpdate` fires, `wb.update()` is called and the confirmation flow is re-triggered if already pending. |
| `onActivated` | `() => void` | `() => window.location.reload()` | No | Called once the new SW takes control of the page. Override to implement custom post-activation logic. |

> **String shorthand:** Passing a string is equivalent to `{ url: '<string>' }`. All other options take their defaults.

**Internal behavior (not configurable):**
- If `skipWaiting` is triggered but the SW has not reached `activated` state within **5 seconds**, `onActivated()` is called automatically as a fallback.

---

#### Update Checker Classes

All checkers are separate named exports imported by file path.

##### `UpdateChecker` — Base no-op interface

```javascript
import UpdateChecker from '@dreamworld/workbox-installer/update-checker.js';
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `onUpdate` | `(listener: function) => void` | No-op in base class. |
| `getUpdates` | `() => Promise<null>` | Always returns `null` in base class. |

---

##### `AbstractUpdateChecker` — Abstract base for custom checkers

```javascript
import AbstractUpdateChecker from '@dreamworld/workbox-installer/abstract-update-checker.js';
```

Extend this class to implement a custom update-checking strategy.

| Member | Type | Description |
|--------|------|-------------|
| `listeners` | `Array<function>` | Registered listener functions. |
| `_updates` | `any` | Internal updates state (initially `undefined`). |
| `updates` (getter) | `any` | Returns `_updates`. |
| `updates` (setter) | `any` | Sets `_updates`; notifies all listeners if the value is truthy. |
| `onUpdate(listener)` | `(function) => void` | Registers a listener. If updates are already known, the listener is called immediately. |
| `getUpdates()` | `() => Promise<any>` | Returns cached updates if known; otherwise awaits `_getUpdates()` and caches the result. |
| `_getUpdates()` | `() => Promise<any\|null>` | **Override this.** Perform a one-time check; return the updates value or `null`. Do not return `undefined`. |
| `_notifyListeners()` | `() => void` | Calls every registered listener with the current `updates` value. |

**Custom checker pattern:**

```javascript
import AbstractUpdateChecker from '@dreamworld/workbox-installer/abstract-update-checker.js';

class MyUpdateChecker extends AbstractUpdateChecker {
  constructor(options) {
    super();
    // Start watching for updates and call: this.updates = <value>;
  }

  async _getUpdates() {
    // One-time fetch; return null if no updates.
    return null;
  }
}
```

---

##### `FirebaseReleasesUpdateChecker`

Watches a Firebase Realtime Database path for release objects newer than `curVersion`, ordered by their `time` field.

```javascript
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker.js';
```

**Constructor — `{ fbDatabase, releasesPath, curVersion }`:**

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `fbDatabase` | `firebase.database.Database` | — | Yes | Initialized Firebase Realtime Database instance. |
| `releasesPath` | `string` | `'releases'` | No | RTDB path where release objects are stored. |
| `curVersion` | `string` | — | Yes | Current deployed version string. |

**Updates value:** `Array<Release>` sorted ascending by `time`, or `null` if no newer releases exist.

**Expected Firebase data structure at `releasesPath`:**

```json
{
  "1_0_0": { "version": "1.0.0", "time": 1617271930000 },
  "1_0_1": { "version": "1.0.1", "time": 1617358330000 }
}
```

- Keys use `_` as version separator (`.` is replaced with `_` when querying `curVersion`).
- Each release object must have at minimum `version` (string) and `time` (number, Unix ms). Additional fields are passed through.
- The RTDB index on `time` must be configured in Firebase security rules.

---

##### `FirebaseLatestVersionUpdateChecker`

Watches a single Firebase Realtime Database path for a version string.

```javascript
import FirebaseLatestVersionUpdateChecker from '@dreamworld/workbox-installer/firebase-latest-version-update-checker.js';
```

**Constructor — `{ fbDatabase, latestVersionPath, curVersion }`:**

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `fbDatabase` | `firebase.database.Database` | — | Yes | Initialized Firebase Realtime Database instance. |
| `latestVersionPath` | `string` | — | Yes | RTDB path containing the latest version string. |
| `curVersion` | `string` | — | Yes | Current deployed version string. |

**Updates value:** The latest version string, or `null` if it equals `curVersion`.

---

##### `FirestoreLatestVersionUpdateChecker`

Watches a Firestore document for a version field.

```javascript
import FirestoreLatestVersionUpdateChecker from '@dreamworld/workbox-installer/firestore-latest-version-update-checker.js';
```

**Constructor — `{ latestVersionDocumentPath, latestVersionField, curVersion }`:**

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `latestVersionDocumentPath` | `string` | — | Yes | Firestore document path with an odd number of `/`-separated segments (e.g. `'app/app-pwa'`). Must not start or end with `/`. |
| `latestVersionField` | `string` | — | Yes | Field name within the document that holds the version string. |
| `curVersion` | `string` | — | Yes | Current deployed version string. |

**Updates value:** The value of `latestVersionField`, or `null` if it equals `curVersion`.

**Validation:** The constructor throws if `latestVersionDocumentPath` starts/ends with `/` or has an even number of segments (which would be a collection path, not a document path).

**Note:** Uses `getFirestore()` (no-argument form) from `firebase/firestore` — Firebase must be initialized before constructing this checker.

---

##### `FirebaseLatestVersionsInfoUpdateChecker`

Watches a Firebase Realtime Database path for a version info object and notifies with the full object (not just the version string).

```javascript
import FirebaseLatestVersionsInfoUpdateChecker from '@dreamworld/workbox-installer/firebase-latest-versions-info-update-checker.js';
```

**Constructor — `{ latestVersionsInfoPath, latestVersionPath, curVersion }`:**

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `latestVersionsInfoPath` | `string` | — | Yes | RTDB path to the versions info object. |
| `latestVersionPath` | `string` | — | Yes | Field name within that object used to compare against `curVersion`. |
| `curVersion` | `string` | — | Yes | Current deployed version string. |

**Updates value:** The entire versions info object, or `null` if `latestVersionsInfoObject[latestVersionPath]` equals `curVersion`.

**Note:** Uses `getDatabase()` (no-argument form) from `firebase/database` — Firebase must be initialized before constructing this checker.

---

### Configuration Options

No global constants or environment variables are defined in the source. All configuration is instance-level via the `install()` options object and UpdateChecker constructors.

---

### Advanced Usage

#### Pre-SW-update notification with `onUpdate`

You can register a listener directly on a checker instance to react to update detection before the service worker is ready — useful for showing an early notification:

```javascript
import installWorkbox from '@dreamworld/workbox-installer';
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker.js';

const updateChecker = new FirebaseReleasesUpdateChecker({
  fbDatabase,
  releasesPath: 'releases',
  curVersion: '1.0.0'
});

// React as soon as Firebase signals an update (before SW is ready)
updateChecker.onUpdate((updates) => {
  console.log('New releases detected:', updates);
  // e.g. show a non-blocking banner early
});

installWorkbox({
  url: '/service-worker.js',
  confirmUpdate: (updates) => new Promise((resolve) => {
    showModal({ updates, onConfirm: resolve });
  }),
  updateChecker
});
```

#### Release-dependent notification type

When using `FirebaseReleasesUpdateChecker`, each release object can carry application-defined metadata fields alongside the required `version` and `time`. The `updates` array passed to `confirmUpdate` contains the full release objects, enabling the handler to conditionally render different UI based on release content:

```javascript
confirmUpdate: (updates) => new Promise((resolve) => {
  const latestRelease = updates[updates.length - 1]; // sorted ascending by time

  if (latestRelease.notificationType === 'none') {
    // Do not prompt; update silently on next reload
    return;
  }

  if (latestRelease.notificationType === 'blocking') {
    showBlockingModal({ onConfirm: resolve });
  } else {
    showNonBlockingBanner({ onConfirm: resolve });
  }
})
```

> The specific field names (e.g. `notificationType`, `forceRelogin`) are not enforced by this library. They are conventions from your Firebase release data. See [`docs/release-dependent-notification.md`](docs/release-dependent-notification.md) for the full pattern.

#### Custom `onActivated`

```javascript
installWorkbox({
  url: '/service-worker.js',
  onActivated: () => {
    // Custom logic before reload, e.g. clear caches or notify analytics
    window.location.reload();
  }
});
```

---

## 2. Developer Guide / Architecture

### Architecture Overview

**Design patterns: Observer / Strategy**

- **Observer** — `AbstractUpdateChecker` maintains a `listeners` array. Any number of consumers (the installer, application code) can call `onUpdate(listener)` to subscribe. When `this.updates` is set to a truthy value, all listeners are synchronously notified.
- **Strategy** — `install()` accepts any object implementing the `UpdateChecker` interface (`onUpdate`, `getUpdates`). The four Firebase/Firestore checkers are interchangeable strategies. Custom strategies can be built by extending `AbstractUpdateChecker`.

**Module responsibilities:**

| Module | Responsibility |
|--------|---------------|
| `index.js` | Public entry point; re-exports `install` as default. |
| `install-workbox.js` | Registers the SW via `Workbox`, wires lifecycle events, owns the `confirmUpdate` → `skipWaiting` → reload flow. |
| `update-checker.js` | Defines the no-op base interface (default when no checker is provided). |
| `abstract-update-checker.js` | Implements listener management and result caching; to be subclassed. |
| `firebase-releases-update-checker.js` | Strategy: RTDB releases array, version lookup by `time` ordering. |
| `firebase-latest-version-update-checker.js` | Strategy: RTDB single version string at a path. |
| `firestore-latest-version-update-checker.js` | Strategy: Firestore document field. |
| `firebase-latest-versions-info-update-checker.js` | Strategy: RTDB version info object; delivers the full object as the updates payload. |

**SW update flow:**

```
updateChecker.onUpdate fires
        │
        ▼
  wb.update() called
        │
        ▼
  'waiting' event on wb
        │
        ▼
  confirmUpdate(updates) called
        │
  user resolves promise
        │
        ▼
  wb.messageSkipWaiting()  ◄── 5s auto-reload fallback if SW never activates
        │
        ▼
  'controlling' event on wb (new SW takes over page)
        │
        ▼
  onActivated() [default: window.location.reload()]
```

**Key implementation details in `install-workbox.js`:**

- `pendingUpdateConfirm` flag: if `updateChecker.onUpdate` fires while a `confirmUpdate` promise is already pending (e.g. two releases before the user confirmed), `updateOnConfirm` is called again with the latest updates so the UI can refresh.
- `controllingSW` is captured from `wb.controlling` at startup to distinguish a genuine SW update from a first-time installation in the `controlling` event handler.
- `e.isUpdate` from `workbox-window` is explicitly not used (commented out in source) due to observed unreliability in certain scenarios.

**Multi-tab behavior:**
- `workbox-window` emits `externalwaiting` when a SW update is waiting due to activity in another tab. This event is logged at debug level; no confirmation is triggered from it.
- When a user confirms in one tab and the new SW takes control, all other open tabs receive the `controlling` event via `workbox-window`'s broadcast mechanism and `onActivated()` is called in each.
