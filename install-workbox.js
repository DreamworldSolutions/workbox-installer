import { Workbox } from 'workbox-window';
import UpdateChecker from './update-checker.js';

const DEF_OPTIONS = {
  url: '/service-worker.js',
  confirmUpdate: () => { return new Promise(() => { }); }, //No op functions
  updateChecker: new UpdateChecker()
};

const parseOptions = (options) => {
  if (typeof options === 'string') {
    options = {
      url: options
    };
  }

  return { ...DEF_OPTIONS, ...options };
}

/**
 * Count's of updates in current sessions.
 */
let newVersionReleaseCount = 0;

/**
 * Holds last known updates value.
 */
let lastUpdates;

export const install = (options) => {
  options = parseOptions(options);

  const wb = new Workbox(options.url);
  // window.wb = wb;

  /*
  wb.addEventListener('redundant', async (e) => {
    //When 2 versions are released while a user is live,
    //the first installed service-worker becomes redundant when
    //the second service-worker is installed. In that case,
    //page shouldn't be reloaded when that first service-worker
    //became redundant, as it wasn't controlling the page ever.

    //This event is received in all the active tabs, so every tabs will
    //be do page reload.
    const controlling =  await wb.controlling;
    if (e.sw == controlling) {
      window.setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  });
   */

  let controllingSW;

  wb.controlling.then((sw) => controllingSW = sw);

  wb.addEventListener('controlling', async (e) => {

    // Note: e.isUpdate doesn't work reliably, so it's not used.
    // In following scenario e.isUpdate should be `true`, but it's found `false`.
    // - Open app in incognito window (so a new service-worker is installed)
    // - While user is using the App and window isn't yet reloaded, a new version is released
    // - User confirms update
    // - Now this event is dispatched, and at this time e.isUpdate is found `false`; While expected result
    //   is `true`.

    // if (!e.isUpdate) {
    //   console.debug("install-workbox: controlling service-worker is changed, but it's not an update");
    //   return;
    // }


    // Alternate (Manual) check for whether it's update or the fresh install
    const sw = navigator.serviceWorker.controller; //new ServiceWorker
    if(!sw || !controllingSW || controllingSW === sw) {
      console.debug("install-workbox: controlling service-worker is changed, but it's not an update");
      return;
    }

    console.debug('install-workbox: on controlling. sw.state', sw.state, controllingSW);

    if (sw.state !== 'activated') {
      console.debug('install-workbox: controlling service-worker is updated. Will wait till it is activated.');
      const listener = () => {
        if (sw.state == 'activated') {
          console.debug('install-workbox: controlling service-worker is updated and activated. Going to reload now...');
          window.location.reload();
          sw.removeEventListener('statechange', listener);
        }
      };
      sw.addEventListener('statechange', listener);
      return;
    }
    console.debug('install-workbox: controlling service-worker is updated. Going to reload...');
    window.location.reload();
  });

  let pendingUpdateConfirm = false;

  /**
   * Updates service-worker upon the confirmUpdate.
   */
  const updateOnConfirm = async (e) => {
    pendingUpdateConfirm = true;
    console.debug('install-workbox: updateOnConfirm > START', pendingUpdateConfirm, newVersionReleaseCount);
    if (!lastUpdates) {
      lastUpdates = await options.updateChecker.getUpdates();
    }
    console.debug('install-workbox: updateOnConfirm > WAITING', pendingUpdateConfirm, newVersionReleaseCount);
    await options.confirmUpdate(lastUpdates);
    pendingUpdateConfirm = false;
    wb.messageSkipWaiting();
    console.debug('install-workbox: updateOnConfirm > COMPLETED', pendingUpdateConfirm, newVersionReleaseCount);

    //Automatically reload the window, if service-worker isn't activated even
    //after few seconds of skipWaiting.
    //It's actually a hack to resolve the browser issue.
    //See https://stackoverflow.com/questions/54628657/self-skipwaiting-not-working-in-service-worker
    //for the reference.
    window.setTimeout(() => {
      console.error("install-workbox: service-worker isn't activated in 5 seconds.");
      window.location.reload();
    }, 5000);
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', () => {
    console.debug('install-workbox: on waiting invoked.');
    updateOnConfirm();
  });

  wb.register();

  options.updateChecker.onUpdate((updates) => {
    lastUpdates = updates;

    newVersionReleaseCount++;
    console.debug('install-workbox: updateChecker.onUpdate invoked.', updates, pendingUpdateConfirm, newVersionReleaseCount);

    //Note: While the App Tab is open, and 2 new versions are released
    //we don't receive `waiting` event again. So, notification (update confirmation)
    //view isn't updated (if required). To solve this issue, we call the `updateOnConfirm`
    //in advance (before new service-worker is installed & ready); if user hasn't
    //confirmed earlier updates yet.
    if (pendingUpdateConfirm || newVersionReleaseCount > 1) {
      updateOnConfirm(updates);
    }

    wb.update();
  });
}

export default install;