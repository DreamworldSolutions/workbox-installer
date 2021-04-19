import { default as installWorkbox } from '@dreamworld/workbox-installer';
import firebase from "./init-firebase.js";
import FirebaseReleasesUpdateChecker from '@dreamworld/workbox-installer/firebase-releases-update-checker';

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

const confirmUpdate = (releases, el) => {
  return new Promise((resolve) => {
    if (!releases || !Array.isArray(releases) || releases.length == 0) {
      console.error("releases detail not available. So, no notification is shown");
      return;
    }

    if (forceRelogin(releases)) {
      console.log('do logout....');
      //TODO: Do logout or cleanup data
    }

    // If it's within 20 seconds of the window load, then no need to confirm
    // from the user.
    if (new Date().getTime() - windowLoadedAt <= 20 * 1000) {
      resolve();
      return;
    }

    let notificationType = maxNotificationType(releases);
    console.log('notificationType:', notificationType);
    if (notificationType === 'none') {
      return;
    }

    return import('./new-version-notification.js').then(()=>{
      el.show(notificationType, releases).then(resolve);
    });
  });
}

// Here, showNewVersionAvailableNotification is a function which returns Promise. 
// The Promise is resolved only when user confirms update. 
// It's never rejected. 
// On Dimiss, It closes the notification. But, doesn't resolve the Promise.


export const onUpdate = async (releases, el) => {

  if (!releases || !Array.isArray(releases) || releases.length == 0) {
    console.error("releases detail not available. So, no notification is shown");
    return;
  }

  // If it's within 20 seconds of the window load, then no need to confirm
  // from the user.
  if (new Date().getTime() - windowLoadedAt <= 20 * 1000) {
    await import('./new-version-notification.js');
    el.show('full-screen');
  }

}

export const installWithReleasesUpdateChecker = (el, curVersion) => {
  let fbReleasesUpdateChecker = new FirebaseReleasesUpdateChecker({
    fbDatabase: firebase.database(),
    releasesPath: 'releases',
    curVersion
  });

  fbReleasesUpdateChecker.onUpdate((releases) => onUpdate(releases, el));

  installWorkbox({
    url: '/service-worker.js',
    confirmUpdate: (releases) => {
      return confirmUpdate(releases, el);
    },
    updateChecker: fbReleasesUpdateChecker
  });
}