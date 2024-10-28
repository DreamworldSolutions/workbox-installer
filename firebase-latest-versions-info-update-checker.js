import AbstractUpdateChecker from './abstract-update-checker';
import { ref, onValue, child, get } from 'firebase/database';

/**
 * Note:: versionInfo declared on firebase should be an object and it should contains `latest` field.
 */

export default class FirebaseLatestVersionsInfoUpdateChecker extends AbstractUpdateChecker {
  constructor({ fbDatabase, latestVersionsInfoPath, latestVersionPath, curVersion }) {
    super();

    if (!fbDatabase || !latestVersionsInfoPath || !latestVersionPath || !curVersion) {
      throw new Error(
        'Required config not found. Make sure you have specified' +
          '`fbDatabase`, `latestVersionsInfoPath`, `latestVersionPath` and `curVersion`.'
      );
    }

    this.fbDatabase = fbDatabase;
    this.latestVersionsInfoPath = latestVersionsInfoPath;
    this.latestVersionPath = latestVersionPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  /**
   * It watches the `latestVersionsInfoPath`, and whenever a new release is found, sets `updates` property.
   */
  _watchReleases() {
    let _ref = ref(this.fbDatabase, this.latestVersionsInfoPath);
    onValue(_ref, snapshot => {
      const latestVersionsInfo = snapshot.val();
      const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
      this.updates = latestVersion === this.curVersion ? null : latestVersionsInfo;
    });
  }

  async _getUpdates() {
    const snapshot = await get(child(this.fbDatabase, this.latestVersionsInfoPath));
    const latestVersionsInfo = snapshot.val();
    const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
    return latestVersion === this.curVersion ? null : latestVersionsInfo;
  }
}
