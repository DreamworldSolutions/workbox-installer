
## Setup project
- Checkout Git Repository to your local
- Switch to `demo` directory
- Run `yarn install` to install the dependencies.
- Run `npm run start:build`. It builds the application into `build` directory, and starts a server to serve the content from the `build` directory.

### Validate the Basics of the App
- Open the application in a new Incognito Window, using localhost url available in your console. e.g. `http://localhost:8000`
- Open Chrome Dev Tools > Application > Service Workers. And validate that it shows service-worker is installed.
- Click on the "Login" button.
- Observe that you are presented 3 buttons: Logout , "load 1" and "load 2".
- Click on the "load 1", and observe that the ES Module (JS) is loadd from the service-worker cache. (Chrome Dev Tools > Network)
- Do page refresh. 
- Observe that you are still logged-in. So, "Logout" and other 2 buttons are still visible.

> By default project is setup without any UpdateChecker. So, whenever a new version is released you won't receive any notification, in real-time.

## Upgrade Service Worker (Without any UpdateChecker)

### Without Notification
- It's the default setup. So, you don't need to update anything in `demo-app.js`.
- Just update any other file e.g. `script1.js` or `script2.js`; change something in it's `console.log` message.
- Stop the current server: `Ctrl + C`.
- Run `npm run start:build`, to rebuild the app and start server.
- After the server is started, Reload the App page. 
- [Validate new service-worker is in waiting status](#validate-new-service-worker-is-in-waiting-status)
- Open a new Blank Tab. And then close all the opened tab of the Application. Make sure, you don't endup closing your last tab of the incognito window. Otherwise, you will end-up your incognito session at all.
- Now, open the App in the Blank Tab.
- [Validate that new service-worker is activated](#validate-that-new-service-worker-is-activated)

#### Validate new service-worker is in waiting status
- Open Chrome Dev Tools > Application > Service Workers.
- Observe that the new service worker is installed & is in waiting status.
- Go to Chrome Dev Tools > Networks tab.
- Observe that either `script1.js` or `script2.js` (only one) is loaded by the service-worker (to update in the pre-cache entry). And the file which wasn't changed, isn't loaded.
- Click on the "load 1" or "load 2" button, and observe that the console log message is still the old. This signifies that, those modules are still being served by the current active service-worker, with the pre-cached content of the installation time.


#### Validate that new service-worker is activated
- Open Chrome Dev Tools > Application > Service Workers.
- Observe that the new service-worker is activated.
- Click on "load 1" or "load 2" button. And observe that it shows you the new/updated log message.
### With Notification
- Update `demo-app.js > firstUpdated` as follows:

```javascript
  firstUpdated() {
    // installWithoutNotification();
    installWithNotification(this.elNewVersionNotification);
    // installWithReleasesUpdateChecker(this.elNewVersionNotification, '1.20.4', this.logout.bind(this));
  }
```

- Build & Run the app: `npm run start:build`
- Close all of the existing Incognito windows & open a new Incognito Window.
- Perform steps: [Validate the Basics of the App](#validate-the-basics-of-the-app)
- Just update any other file e.g. `script1.js` or `script2.js`; change something in it's `console.log` message.
- Stop the current server: `Ctrl + C`.
- Run `npm run start:build`, to rebuild the app and start server.
- After the server is started, Reload the App page. 
- On Reload, observe that a Notification is shown on the top of the page with 2 buttons: INSTALL & NOT NOW.
- Click on NOT NOW.
- [Validate new service-worker is in waiting status](#validate-new-service-worker-is-in-waiting-status)
- Reload the App Page, again.
- Observe that, the Notification is shown again.
- And [Still new service-worker is in waiting status](#validate-new-service-worker-is-in-waiting-status)
- Open App in another Browser Tab (of the Incognito Window).
- Observe that, the Notification is shown on the new tab too.
- Optionally, come back to the first tab.
- Click INSTALL button in the notification.
- Observe that, both of the browser tabs get auto-reloaded.
- [Validate that new service-worker is activated](#validate-that-new-service-worker-is-activated)

## Upgrade Service Worker (With FirebaseReleasesUpdateChecker)
- Create your own firebase project, and set it's configuration into `init-firebase.js`.
- Add following data to the firebase realtime database at path: `/releases/1_0_0`

```json
{
	"forceRelogin": false,
	"notification": "none",
	"time": 1620536719716,
	"version": "1.0.0"
}
```

- Update `demo-app.js` import statements as follows:

```javascript
// import {installWithNotification, installWithoutNotification} from './install-sw.js';
import { installWithReleasesUpdateChecker } from './install-sw-with-firebase.js';
```

- Update `demo-app.js > firstUpdated` as follows:

```javascript
  firstUpdated() {
    // installWithoutNotification();
    // installWithNotification(this.elNewVersionNotification);
    installWithReleasesUpdateChecker(this.elNewVersionNotification, '1.0.0', this.logout.bind(this));
  }
```

- Build & Run the app: `npm run start:build`
- Close all of the existing Incognito windows & open a new Incognito Window.
- Perform steps: [Validate the Basics of the App](#validate-the-basics-of-the-app)
- Update `demo-app.js` to change the version from `1.0.0` to `1.0.1`.
- Just update any other file e.g. `script1.js` or `script2.js`; change something in it's `console.log` message.
- Stop the current server: `Ctrl + C`.
- Run `npm run start:build`, to rebuild the app and start server.
- Once the server is startd, add detail about the new release on the Firebase. e.g. Add following at the firebase path: `/releases/1_0_1`

```json
{
	"forceRelogin": false,
	"notification": "non-blocking",
	"time": 1620537278498, //To current timestampe
	"version": "1.0.1"
}
```
- Switch to the Incognito Window > App; and observe that the new version availalbe notification is shown at the top of the screen.
- [Validate new service-worker is in waiting status](#validate-new-service-worker-is-in-waiting-status)
- Reload the page
- Observe that, for a while you are shown the "Installing new version..." message; and then page is reloaded again.
- [Validate that new service-worker is activated](#validate-that-new-service-worker-is-activated)


### Other Behaviors of this setup
- It's guranteed that user will get new version installed on the page reload.
- When `notification=none`, no notification is shown to the user. But, stil on page reload, user will always get the new version installed.
- When `notification=blocking`, a blocking notification is shown to the user. So, user isn't allowed to do anything on the screen. And has to upgrade to the new version.
- When `forceRelogin=true`, user is forced to do the relogin when the new service-worker is activated. It works with any notification types.