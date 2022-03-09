# FirestoreLatestVersionUpdateChecker

## Usage
- Store the information about the latest version of the App onto Firestore Database. **Make sure that you update the latest version information on the Firestore, only after your app is deployed successuflly.**
- Embed the current release (version) detail with your app. e.g. `index.html`.
- Install Workbox as follows:

```javascript
import { default as installWorkbox } from '@dreamworld/workbox-installer';
import FirestoreLatestVersionUpdateChecker from '@dreamworld/workbox-installer/firestore-latest-version-update-checker.js';

const appCurVersion = '1.0.0'; //This might be read from one of the configuration, in the real implementation

installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate: (latestVersion) => {
    //Create a Promise & return it.
    //Show notification to your user
    //When user confirms, resolve the promise.
  },
  updateChecker: new FirestoreLatestVersionUpdatechecker({
    latestVersionDocumentPath: 'app/app_0',
    latestVersionField: "version"
    curVersion: appCurVersion
  })
});
```


## How does this work?
- It will watch the Firestore Database changes on the `latestVersionDocumentPath`. 
- As soon as it finds that the `curVersion` isn't same as the `latestVersionField` of the document, it notifies the installer to check for the updates.
- It sends value of the latest version (as a String), as the `updates` to the installer. 
- So, `confirmUpdate` function may use the latestVersion to print it into notification.