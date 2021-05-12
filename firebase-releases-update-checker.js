import AbstractUpdateChecker from './abstract-update-checker';
import loglevel from 'loglevel';

const logger = loglevel.getLogger('workbox-installer.firebase-releases-update-checker');
export default class FirebaseUpdateReleasesChecker extends AbstractUpdateChecker {

  constructor({ fbDatabase, releasesPath = "releases", curVersion }) {
    super();

    if (!fbDatabase || !releasesPath || !curVersion) {
      throw new Error('Required config not found. Make sure you have specified' +
        '`fbDatabase`, `releasesPath` and `curVersion`.')
    }

    this.fbDatabase = fbDatabase;
    this.releasesPath = releasesPath;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  /**
   * It watches the `releasesPath`, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    let query = await this._buildQuery();
    query.on('value', (snapshot) => {
      let releases = this._parseQueryResponse(snapshot.val());
      logger.info('_watchReleases: found updates', releases);
      this.updates = releases;
    });
  }

  /**
   * Returns the `Release.time` for the curVersion release.
   * If no such release is found, then it returns 0.
   */
  async _getCurVersionReleaseTime() {
    let curVersion = this.curVersion.replaceAll('.', '_');
    let snapshot = await this.fbDatabase.ref(`${this.releasesPath}/${curVersion}`).once('value');
    return snapshot.val() && snapshot.val().time || 0;
  }

  async _buildQuery() {
    let curReleaseTime = await this._getCurVersionReleaseTime();
    return this.fbDatabase.ref(this.releasesPath).orderByChild('time').startAfter(curReleaseTime);
  }

  async _getUpdates() {
    let query = await this._buildQuery();
    let snapshot = await query.once('value');
    let val = this._parseQueryResponse(snapshot.val());
    logger.debug('_getUpdates: val', val);
    return val;
  }

  /**
   * Parses a releases hash as an Array sorted by their release time.
   * Returns `null` when input hash is empty.
   * @param {*} response A Hash of the Releases. key = version, value = Release.
   * @returns {Array} Releases sorted by their release time.
   */
  _parseQueryResponse(response) {
    logger.debugs("_parseQueryResponse: response", response);
    if (!response) {
      return null;
    }

    let releases = Object.values(response).sort((r1, r2) => {
      return r1.time - r2.time;
    });

    return releases.length == 0 ? null : releases;
  }

}