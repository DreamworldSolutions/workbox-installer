import AbstractUpdateChecker from './abstract-update-checker';
export default class FirebaseUpdateLatestVersionChecker extends AbstractUpdateChecker {

  constructor({ fbDatabase, releasePath, curVersion }) {
    super();

    if (!fbDatabase || !releasePath || !curVersion) {
      throw new Error('Required config not found. Make sure you have specified' +
        '`fbDatabase`, `releasePath` and `curVersion`.')
    }

    this.fbDatabase = fbDatabase;
    this.releasePath = releasePath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  async _buildQuery() {
    return this.fbDatabase.ref(this.releasePath);
  }

  /**
   * It watches the `releasePath`, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    let query = await this._buildQuery();
    query.on('value', (snapshot) => {
      this.updates = snapshot.val();
    });
  }

  async _getUpdates() {
    let query = await this._buildQuery();
    let snapshot = await query.once('value');
    return snapshot.val();
  }
}