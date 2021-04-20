/**
 * Q: why such complex implementation?
 * A: It's to manage the following scenario.
 * - Given User has opened the App
 * - And App isn't opened in any other browser tab either; it's the only tab.
 * - And a New Version is released with reloginRequired = true
 * - And User closes the current browser Tab; Without acting anywhere on the notification
 * - When User opens the App again
 * - Then User should be forced to do relogin.
 * 
 * ## How this is solved?
 * - As soon as it's known to the system that user needs to do relogin to upgrade 
 *   to the next version. System stores the curVersion information in the local storage.
 * - On page reload (when service worker is installed), this information is checked 
 *   against the user's current app version. If user's current app version doesn't match
 *   with the stored version; then user is forced to do relogin.
 */


const LOCAL_STORAGE_KEY = "workboxInstaller.reloginRequired";


/**
 * Saves detail about the curVersion (into local-storage).
 * This value is cleared once user is logged out.
 * 
 * On page reload (during sw installation), this value is used to check if there is
 * any relogin pending, if so; user is logged out immediately.
 * 
 * @param {*} curVersion 
 */
export const setReloginRequired = (curVersion) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, curVersion);
}

export const clearReloginRequired = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export const isReloginPending = (curVersion) => {
  let storedVersion = localStorage.getItem(LOCAL_STORAGE_KEY);
  return !!(storedVersion && storedVersion !== curVersion); 
}

