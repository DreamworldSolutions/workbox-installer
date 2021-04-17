# New Version Notification based on the Release

We use this technique in most of our applications. 

## Requirements

### Notification Type
The concept is that each release can require one of the following type of the notifications:
- **None**: No notification should be shown to the user. And application should be updated only on the reload (or next visit)
- **Non Blocking**: Notification should be shown to the user in non-blocking way. See [Example][non-blocking-notification]. User can dismiss this notification too. And there is a button, which can be used to update the application now. App won't be updated until user confirms.
- **Blocking**: Notification should be shown using a Modal Dialog. See [Example][blocking-notification]. User has no way to dismiss this notification. So, user is interrupted and forced to update the app to the latest version.


### Always update on reload
In addition, we want to ensure that the App gets always updated on the reload (or next visit). At this time, no need to take any confirmation from the user. But, User should get information that the App is being updated. See [Example][update-on-realod]

### Force re-login
As most of our apps are having offline-first experience, app keeps a local database & few other data into the Browser's localStorage & IndexDb. Though it's very rare, with a new release, we might need to force user to re-login (to clear authentication tokens & all of the locally stored data).

## Implementation
- Store 2 more fields with each `Release` on the firebase.
  - `notification`:
    - data type: String
    - required: true
    - Possible values: `none`, `non-blocking`, `blocking`
  - `forceRelogin`: 
    - data type: Boolean
    - required : false
- Write the `confirmUpdate` handler like [this sample][sample-notification]
- Register a listener on the `firebaseReleasesUpdateChecker.onUpdate`, which shows full-screen notification to the user, if the updates are found within N seconds of the page reload. This notification will be shown from the moment `FirebaseReleasesUpdateChecker` finds updates, and till the workbox updates the service worker.

So, your installation code will look like following:


```javascript
import { default as installWorkbox } from '@dreamworld/workbox-installer';
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker.js';
import { onUpdate, confirmUpdate } from 'demo/sample-notification.js';

const appCurVersion = '1.0.0'; //This might be read from one of the configuration, in the real implementation

const fbUpdateChecker = new FirebaseReasesUpdatechecker({
    fbDatabase,
    releasesPath: '/releases',
    curVersion: appCurVersion
  });

fbUpdateChecker.onUpdate(onUpdate);

installWorkbox({
  url: '/service-worker.js', 
  confirmUpdate,
  updateChecker: fbUpdateChecker
});
```

# TODO
- Set links to show mocks for the various updates.

[non-blocking-notification]: http://example.com/link-to-the-non-blocking-notification-image 
[blocking-notification]: http://example.com/link-to-the-blocking-notification-image
[update-on-realod]: http://example.com/update-on-reload
[sample-notification]: ./demo/sample-notification.js