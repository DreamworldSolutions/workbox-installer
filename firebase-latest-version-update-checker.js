import AbstractUpdateChecker from './abstract-update-checker';
export default class FirebaseLatestVersionUpdateChecker extends AbstractUpdateChecker {

  constructor({ fbDatabase, latestVersionPath, curVersion }) {
    super();

    if (!fbDatabase || !latestVersionPath || !curVersion) {
      throw new Error('Required config not found. Make sure you have specified' +
        '`fbDatabase`, `latestVersionPath` and `curVersion`.')
    }

    this.fbDatabase = fbDatabase;
    this.latestVersionPath = latestVersionPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  async _buildQuery() {
    return this.fbDatabase.ref(this.latestVersionPath);
  }

  /**
   * It watches the `latestVersionPath`, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    let query = await this._buildQuery();
    query.on('value', (snapshot) => {
      const latestVersion = snapshot.val();
      this.updates = latestVersion === this.curVersion ? null : latestVersion;
    });
  }

  async _getUpdates() {
    const query = await this._buildQuery();
    const snapshot = await query.once('value');
    const latestVersion = snapshot.val();
    return latestVersion === this.curVersion ? null : latestVersion;
  }
}