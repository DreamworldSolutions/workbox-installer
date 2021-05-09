import { Workbox } from 'workbox-window';
import UpdateChecker from './update-checker.js';
import loglevel from 'loglevel';

const logger = loglevel.getLogger('workbox-installer');

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
      logger.info('on redundant: Going to reload....');
      window.location.reload();
    } else {
      logger.debug('on redundant: A waiting service-worker might became redundant...');
    }
  });

  let pendingUpdateConfirm = false;

  /**
   * Updates service-worker upon the confirmUpdate.
   */
  const updateOnConfirm = async (e) => {
    logger.debug('updateOnConfirm: invoked.');
    pendingUpdateConfirm = true;
    if (!lastUpdates) {
      logger.debug('updateOnConfirm: waiting for the updates detail....');
      lastUpdates = await options.updateChecker.getUpdates();
    }
    logger.debug('updateOnConfirm: waiting on the user/integrator confirmation');
    await options.confirmUpdate(lastUpdates);
    logger.debug('updateOnConfirm: User confirmed.');
    await options.confirmUpdate(lastUpdates);
    pendingUpdateConfirm = false;
    wb.messageSkipWaiting();
    logger.debug('updateOnConfirm: skipWaiting sent.');

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
    logger.info('on waiting...');
    updateOnConfirm();
  });

  wb.register();

  options.updateChecker.onUpdate((updates) => {
    lastUpdates = updates;
    logger.info('updates found:', updates);

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