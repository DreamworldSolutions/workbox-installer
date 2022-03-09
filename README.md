# Workbox Installer

A helper library to install a Service Worker generated using [Workbox][workbox] into/for PWA(Progressive Web App).


## Behaviours
- When the app is accessed for the very first time, that tab starts using the service-worker as soon as the service-worker is installed. So, for example, when a page is switched, a new fragment is loaded from the service-worker cache.
- When an app is updated from one of the browser tabs, other tabs are automatically reloaded to ensure that all the tabs are using the latest version of the app.
- Asks for the confirmation only when the new service worker is installed & ready to use (when all the updated and new resources are already pre-cached).
## Getting Strated 
1. Configure your PWA build-script to build `service-worker.js` using workbox, and set `clientsClaim=true & skipWaiting=false` options. You would like to configure other options for your PWA as shown in [this demo][demo-workbox-build]. Feel free to chose your preferred way of the build.
2. Add this library to your dependency. `npm install --save workbox-installer`
3. Install Service Worker.

```javascript
import { default as installWorkbox } from '@dreamworld/workbox-installer';

installWorkbox('/service-worker.js');
```

User won't see any notification about the new version available. But, This will ensure that the user will get the latest version of the App (service-worker) installed/updated on the page reload (or on the next visit).

Though, It’s side effect is that, when the app is opened in the 2nd browser tab, it is updated automatically; unwantedly.

## New Version Notification
If you want to show your users a notification when a new version is available. And want to update the App only after user confirms update. Then register a `confirmUpdate` handler function too.

```javascript
installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate: () => {
    //Create a Promise & return it.
    //Show notification to your user
    //When user confirms, resolve the promise.
  }
});
```

## Update Checker
In the above methods, whether a new version of the service-worker is available or not, is checked only on the page reload. But, if you want to customize the update checking process, e.g. Listen on the firebase realtime database changes and show a notification to the user as soon as the new version is released. Then, you need to provide [`UpdateChecker`][update-checker].

Example usage:

```javascript
installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate: (updates) => {
    //Here, `updates` is the updates notified by the `UpdateChecker` you provided.
    //Create a Promise & return it.
    //Show notification to your user
    //When user confirms, resolve the promise.
  },
  updateChecker: yourUpdateChecker
});
```

Following implementations of the `UpdateChecker` are available, check them if you can use one of them. Otherwise, you can always provide your custom implementation as per your requirement.

- [FirebaseReleasesUpdateChecker](docs/firebase-releases-update-checker.md)
- [FirebaseLatestVersionUpdateChecker](docs/firebase-latest-version-update-checker.md)
- [FirestoreLatestVersionUpdateChecker](docs/firestore-latest-version-update-checker.md)

[workbox]: https://developers.google.com/web/tools/workbok
[demo-workbox-build]: demo/buildsw.js
[update-checker]: update-checker.js