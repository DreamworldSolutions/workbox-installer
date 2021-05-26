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

export const confirmUpdate = (releases) => {
  return new Promise((resolve) => {
    if(!releases || !Array.isArray(releases) || releases.length == 0) {
      logger.error("releases detail not available. So, no notification is shown");
      return;
    }

    if(forceRelogin(releases)) {
      //TODO: Do logout or cleanup data
    }

    // If it's within 20 seconds of the window load, then no need to confirm
    // from the user.
    if (new Date().getTime() - windowLoadedAt <= 20 * 1000) {
      resolve();
      return;
    }

    let notificationType = maxNotificationType(releases);
    if (notificationType === 'none') {
      return;
    }

    return showNewVersionAvailableNotification(notificationType, releases);
  });
}

// Here, showNewVersionAvailableNotification is a function which returns Promise. 
// The Promise is resolved only when user confirms update. 
// It's never rejected. 
// On Dimiss, It closes the notification. But, doesn't resolve the Promise.


export const onUpdate = (releases) => {

  if(!releases || !Array.isArray(releases) || releases.length == 0) {
    logger.error("releases detail not available. So, no notification is shown");
    return;
  }

  // If it's within 20 seconds of the window load, then no need to confirm
  // from the user.
  if (new Date().getTime() - windowLoadedAt <= 20 * 1000) {
    //TODO: Show full-screen notification to the user.
  }

}