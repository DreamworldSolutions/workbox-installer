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

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', async (e) => {
    await options.confirmUpdate();
    wb.messageSkipWaiting();
  });

  wb.register();
}

export default install;