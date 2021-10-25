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
 * Holds last known updates value.
 */
let lastUpdates;

export const install = (options) => {
  options = parseOptions(options);
  console.log('install-workbox: install called', options);
  const wb = new Workbox(options.url);
  window.__WB = wb;
  window._wbInstallOptions = options;
  // window.wb = wb;

  wb.addEventListener('redundant', async (e) => {
    //When 2 versions are released while a user is live, 
    //the first installed service-worker becomes redundant when
    //the second service-worker is installed. In that case,
    //page shouldn't be reloaded when that first service-worker
    //became redundant, as it wasn't controlling the page ever.

    //This event is received in all the active tabs, so every tabs will
    //be do page reload.
    if (e.sw == await wb.controlling) {
      console.log('service worker became redundant:', e.sw);
      window.location.reload();
      setTimeout(() => {
        console.error(`workbox-installer: page is not reloaded withing 5 seconds after service worker became redundant.`);
      }, 5000);
    } else {
      console.log('service worker became redundant but page is not reloaded');
    }
  });

  let pendingUpdateConfirm = false;

  /**
   * Updates service-worker upon the confirmUpdate.
   */
  const updateOnConfirm = async (e) => {
    pendingUpdateConfirm = true;
    if (!lastUpdates) {
      lastUpdates = await options.updateChecker.getUpdates();
    }
    await options.confirmUpdate(lastUpdates);
    pendingUpdateConfirm = false;
    wb.messageSkipWaiting();
    console.trace('updateOnConfirm: skipWaiting called');

    //Automatically reload the window, if service-worker isn't activated even
    //after few seconds of skipWaiting.
    //It's actually a hack to resolve the browser issue.
    //See https://stackoverflow.com/questions/54628657/self-skipwaiting-not-working-in-service-worker
    //for the reference.
    window.setTimeout(() => window.location.reload(), 3000);
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', () => {
    updateOnConfirm();
  });

  wb.register();

  options.updateChecker.onUpdate((updates) => {
    lastUpdates = updates;

    //Note: While the App Tab is open, and 2 new versions are released 
    //we don't receive `waiting` event again. So, notification (update confirmation)
    //view isn't updated (if required). To solve this issue, we call the `updateOnConfirm` 
    //in advance (before new service-worker is installed & ready); if user hasn't 
    //confirmed earlier updates yet.
    if (pendingUpdateConfirm) {
      updateOnConfirm(updates);
    }

    wb.update();
    console.log('wb.update called');
  });
}

export default install;