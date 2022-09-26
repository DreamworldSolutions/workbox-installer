import AbstractUpdateChecker from './abstract-update-checker';

/**
 * Note:: versionInfo declared on firebase should be an object and it should contains `latest` field.
 */

export default class FirebaseLatestVersionsInfoUpdateChecker extends AbstractUpdateChecker {

  constructor({ fbDatabase, latestVersionsInfoPath, latestVersionPath, curVersion }) {
    super();

    if (!fbDatabase || !latestVersionsInfoPath || !latestVersionPath || !curVersion) {
      throw new Error('Required config not found. Make sure you have specified' +
        '`fbDatabase`, `latestVersionsInfoPath`, `latestVersionPath` and `curVersion`.')
    }

    this.fbDatabase = fbDatabase;
    this.latestVersionsInfoPath = latestVersionsInfoPath;
    this.latestVersionPath = latestVersionPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  async _buildQuery() {
    return this.fbDatabase.ref(this.latestVersionsInfoPath);
  }

  /**
   * It watches the `latestVersionsInfoPath`, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    let query = await this._buildQuery();
    query.on('value', (snapshot) => {
      const latestVersionsInfo = snapshot.val();
      const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
      this.updates = latestVersion === this.curVersion ? null : latestVersionsInfo;
    });
  }

  async _getUpdates() {
    const query = await this._buildQuery();
    const snapshot = await query.once('value');
    const latestVersionsInfo = snapshot.val();
    const latestVersion = latestVersionsInfo && latestVersionsInfo[this.latestVersionPath];
    return latestVersion === this.curVersion ? null : latestVersionsInfo;
  }
}