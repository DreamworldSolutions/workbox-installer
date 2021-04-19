import { Workbox } from 'workbox-window';
import UpdateChecker from './update-checker.js';

const DEF_OPTIONS = {
  url: '/service-worker.js',
  confirmUpdate: async () => { }, //No op functions
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

  const wb = new Workbox(options.url);
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
      window.location.reload();
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
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', () => {
    console.log('on waiting:');
    updateOnConfirm();
  });

  wb.register();

  options.updateChecker.onUpdate((updates) => {
    lastUpdates = updates;
    console.log('updates found:', updates);

    //Note: While the App Tab is open, and 2 new versions are released 
    //we don't receive `waiting` event again. So, notification (update confirmation)
    //view isn't updated (if required). To solve this issue, we call the `updateOnConfirm` 
    //in advance (before new service-worker is installed & ready); if user hasn't 
    //confirmed earlier updates yet.
    if (pendingUpdateConfirm) {
      updateOnConfirm(updates);
    }
    
    wb.update();
  });
}

export default install;