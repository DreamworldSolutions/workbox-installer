import { default as installWorkbox } from '@dreamworld/workbox-installer';

export const installWithoutNotification = () => {
  installWorkbox('/service-worker.js');
}

export const installWithNotification = (elNewVersionNotification) => {
  installWorkbox({
    url: '/service-worker.js',
    confirmUpdate: () => {
      return elNewVersionNotification.show('non-blocking');
    }
  });
}