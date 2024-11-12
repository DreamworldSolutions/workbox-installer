import AbstractUpdateChecker from './abstract-update-checker';
import { getDatabase, ref, onValue, child, get } from 'firebase/database';

/**
 * Note:: versionInfo declared on firebase should be an object and it should contains `latest` field.
 */

export default class FirebaseLatestVersionsInfoUpdateChecker extends AbstractUpdateChecker {
  constructor({ latestVersionsInfoPath, latestVersionPath, curVersion }) {
    super();

    if (!latestVersionsInfoPath || !latestVersionPath || !curVersion) {
      throw new Error(
        'Required config not found. Make sure you have specified' + '`latestVersionsInfoPath`, `latestVersionPath` and `curVersion`.'
      );
    }

    this.latestVersionsInfoPath = latestVersionsInfoPath;
    this.latestVersionPath = latestVersionPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  /**
   * It watches the `latestVersionsInfoPath`, and whenever a new release is found, sets `updates` property.
   */
  _watchReleases() {
    const dbRef = ref(getDatabase(), this.latestVersionsInfoPath);
    onValue(dbRef, snapshot => {
      const latestVersionsInfo = snapshot.val();
      const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
      this.updates = latestVersion === this.curVersion ? null : latestVersionsInfo;
    });
  }

  async _getUpdates() {
    const dbRef = ref(getDatabase());
    const snapshot = await get(child(dbRef, this.latestVersionsInfoPath));
    const latestVersionsInfo = snapshot.val();
    const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
    return latestVersion === this.curVersion ? null : latestVersionsInfo;
  }
}
