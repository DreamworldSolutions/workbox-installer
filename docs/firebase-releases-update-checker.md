# FirebaseReleasesUpdateChecker

## Usage
- Store detail about each App Release (e.g. `version`, `time`) on the Firebase Realtime Database. Learn more about this at the last section of this doc. **Make sure, you add the release detail on the Firebase, only after your app is deployed successuflly.**
- Embed the current release (version) detail with your app. e.g. `index.html`.
- Install workbox as follows:

```javascript
import { default as installWorkbox } from '@dreamworld/workbox-installer';
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker.js';

const appCurVersion = '1.0.0'; //This might be read from one of the configuration, in the real implementation

installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate: (newReleases) => {
    //Here, `newReleases` is the Release objects representing the release done after the curVersion.
    //Create a Promise & return it.
    //Show notification to your user
    //When user confirms, resolve the promise.
  },
  updateChecker: new FirebaseReasesUpdatechecker({
    fbDatabase,
    releasesPath: '/releases',
    curVersion: appCurVersion
  })
});
```

Here, `fbDatabase` is the instance of the [`firebase.database.Database`](https://firebase.google.com/docs/reference/js/firebase.database.Database)


## How does this work?
- It will watch the Firebase Realtime Database on the `releasesPath`. And as soon as the new update is found, it asks the installer to check for the updates.
- It sends detail about all the releases, which have been released after the `curVersion` (based on `time` field), as the `updates` to the installer. So, `updates` is an array of `Release` object sorted by the release time; latest at the end.
- So, you will get this `updates` detail as input in `confirmUpdate` handler. You can use this `updates` detail to customize your notification or sometimes to skip the notification to the user. 

In our apps we use the `updates` to decide which type of the notification to be shown to the user. [Read more](./release-dependent-notification.md)

## Releases detail on the Firebase Database

- `Release` is an Object:
  - It should have at least 2 fields: `version` and `time`. Both are mandatory.
  - `version` is String, and could be anything.
  - `time` is a Number. DateTime as millis (`new Date().getTime()`) when this is released.
  - It could have any number of other fields, as per your need. For Example, In our apps we add fields like: `notificationType` and `reloginRequired`.
- It should be stored on the firebase path: `/releases/{version}`.
- So, if you look at the `/releases` path of the Firebase, it's data would look like following:

```json
{
  "1.0.0": {
    "version": "1.0.0",
    "time": 1617271930000
  },
  "1.0.1": {
    "version": "1.0.1",
    "time": 1617358330000
  },
  "1.1.0": {
    "version": "1.1.0",
    "time": 1618481530000
  }
}
```

You are free to choose your base path other than the `/releases`. But, data stored at that path should be as above suggested.