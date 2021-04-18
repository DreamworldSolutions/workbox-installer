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