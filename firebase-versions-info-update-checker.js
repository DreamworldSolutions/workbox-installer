import AbstractUpdateChecker from './abstract-update-checker';

/**
 * Note:: versionInfo declared on firebase should be an object and it should contains `latest` field.
 */

export default class FirebaseVersionsInfoUpdateChecker extends AbstractUpdateChecker {

  constructor({ fbDatabase, versionsInfoPath, curVersion }) {
    super();

    if (!fbDatabase || !versionsInfoPath || !curVersion) {
      throw new Error('Required config not found. Make sure you have specified' +
        '`fbDatabase`, `versionsInfoPath` and `curVersion`.')
    }

    this.fbDatabase = fbDatabase;
    this.versionsInfoPath = versionsInfoPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  async _buildQuery() {
    return this.fbDatabase.ref(this.versionsInfoPath);
  }

  /**
   * It watches the `versionsInfoPath`, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    let query = await this._buildQuery();
    query.on('value', (snapshot) => {
      const latestVersion = snapshot.val();
      this.updates = latestVersion?.latest === this.curVersion ? null : latestVersion;
    });
  }

  async _getUpdates() {
    const query = await this._buildQuery();
    const snapshot = await query.once('value');
    const latestVersion = snapshot.val();
    return latestVersion?.latest === this.curVersion ? null : latestVersion;
  }
}