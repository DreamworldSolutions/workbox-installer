import { default as installWorkbox } from '@dreamworld/workbox-installer';
import firebase from "./init-firebase.js";
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker';
import { setReloginRequired, clearReloginRequired, isReloginPending } from './relogin.js';


/**
 * Represents the no of seconds. If updates are found within N seconds from the page
 * reload, then user isn't asked to confirm the udpate. And updates are applied 
 * automatically.
 */
const AUTO_CONFIRM_WITHIN_SECONDS = 20;

let windowLoadedAt;

if (document.readyState === 'complete') {
  windowLoadedAt = new Date().getTime();
} else {
  window.addEventListener('load', () => { windowLoadedAt = new Date().getTime() });
}

/**
 * Returns `true` if any of the releases forces relogin.
 */
const forceRelogin = (releases) => {
  let required = false;
  releases.forEach((release) => {
    required = required || release.forceRelogin;
  });
  return required;
};

const notificationTypes = ['none', 'non-blocking', 'blocking'];

/**
 * Finds the maximum notificationType from all the releases
 */
const maxNotificationType = (releases) => {
  let value = 0;
  releases.forEach((release) => {
    value = Math.max(value, notificationTypes.indexOf(release.notification));
  });
  return notificationTypes[value]; //Convert numeric value of notificationType to String
}

const confirmUpdate = ({ releases, el, logout, curVersion }) => {
  return new Promise((resolve) => {
    if (!releases || !Array.isArray(releases) || releases.length == 0) {
      console.error("releases detail not available. So, no notification is shown");
      return;
    }
    
    let logoutReqd = forceRelogin(releases);
    if (logoutReqd) {
      setReloginRequired(curVersion);
    }

    /**
     * Resolves the promise, after performing logout if `logoutReqd=true`.
     */
    const resolveWithLogout = async () => {
      if(logoutReqd) {
        await logout();
        clearReloginRequired();
      }
      resolve();
    }

    // If it's within 20 seconds of the window load, then no need to confirm
    // from the user.
    if (new Date().getTime() - windowLoadedAt <= AUTO_CONFIRM_WITHIN_SECONDS * 1000) {
      resolveWithLogout();
      return;
    }

    let notificationType = maxNotificationType(releases);
    console.log('notificationType:', notificationType);
    if (notificationType === 'none') {
      return;
    }

    return import('./new-version-notification.js').then(() => {
      el.show(notificationType, releases).then(resolveWithLogout);
    });
  });
}

// Here, showNewVersionAvailableNotification is a function which returns Promise. 
// The Promise is resolved only when user confirms update. 
// It's never rejected. 
// On Dimiss, It closes the notification. But, doesn't resolve the Promise.


export const onUpdate = async ({ releases, el }) => {

  if (!releases || !Array.isArray(releases) || releases.length == 0) {
    console.error("releases detail not available. So, no notification is shown");
    return;
  }

  // If it's within 20 seconds of the window load, then no need to confirm
  // from the user.
  if (new Date().getTime() - windowLoadedAt <= AUTO_CONFIRM_WITHIN_SECONDS * 1000) {
    await import('./new-version-notification.js');
    el.show('full-screen');
  }

}

export const installWithReleasesUpdateChecker = async (el, curVersion, logout) => {
  if (isReloginPending()) {
    await logout();
    clearReloginRequired();
  }

  let fbReleasesUpdateChecker = new FirebaseReleasesUpdateChecker({
    fbDatabase: firebase.database(),
    releasesPath: 'releases',
    curVersion
  });

  fbReleasesUpdateChecker.onUpdate((releases) => onUpdate({ releases, el }));

  installWorkbox({
    url: '/service-worker.js',
    confirmUpdate: (releases) => {
      return confirmUpdate({ releases, el, logout, curVersion });
    },
    updateChecker: fbReleasesUpdateChecker
  });
}