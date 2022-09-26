# FirebaseLatestVersionsInfoUpdateChecker

## Usage
- Store the information about the latest version of the App onto Firebase Database. **Make sure that you update the latest version information on the Firebase, only after your app is deployed successuflly.**
- Embed the current release (version) detail with your app. e.g. `index.html`.
- Install Workbox as follows:

```javascript
import { default as installWorkbox } from '@dreamworld/workbox-installer';
import FirebaseLatestVersionsInfoUpdateChecker from '@dreamworld/workbox-installer/firebase-latest-versions-info-update-checker.js';

const appCurVersion = '1.0.0'; //This might be read from one of the configuration, in the real implementation

installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate: (latestVersion) => {
    //Create a Promise & return it.
    //Show notification to your user
    //When user confirms, resolve the promise.
  },
  updateChecker: new FirebaseLatestVersionsInfoUpdateChecker({
    fbDatabase,
    latestVersionsInfoPath: 'app/app-pwa',
    latestVersionField: 'latest',
    curVersion: appCurVersion
  })
});
```


## How does this work?
- It will watch the Firebase Database changes on the `latestVersionsInfoPath`. 
- As soon as it finds that the `curVersion` isn't same as the `latestVersionField` of the document, it notifies the installer to check for the updates.
- It sends value of the latest versions info (as a Object), as the `updates` to the installer. 
- So, `confirmUpdate` function may use the latest versions info to show notification type based on it.