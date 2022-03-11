import { doc, getDoc, onSnapshot, getFirestore } from "firebase/firestore";
import AbstractUpdateChecker from "./abstract-update-checker";

export default class FirestoreLatestVersionUpdateChecker extends AbstractUpdateChecker {
  constructor({ latestVersionDocumentPath, latestVersionField, curVersion }) {
    super();

    if (!this.__isValidDocumentPath(latestVersionDocumentPath)) {
      throw new Error(
        `workbox-installer > Please provide valid document path. e.g. "app/app-pwa"`
      );
    }

    if (!latestVersionField || !curVersion) {
      throw new Error(
        `Make sure you have specified latestVersionField and curVersion.`
      );
    }

    this.db = getFirestore();
    this.pathSegments = latestVersionDocumentPath.split("/");
    this.latestVersionField = latestVersionField;
    this.curVersion = curVersion;
    this._watchReleases();
  }

  /**
   * It watches the latest version document path, and whenever a new release is found, sets `updates` property.
   */
  async _watchReleases() {
    onSnapshot(
      doc(this.db, ...this.pathSegments),
      (snapshot) => {
        const val = snapshot.data();
        const latestVersion = val && val[this.latestVersionField];
        this.updates = latestVersion === this.curVersion ? null : latestVersion;
      },
      (error) => {
        console.error(
          "workbox-installer > _watchReleases : Failed to load latest version data.",
          error
        );
      }
    );
  }

  async _getUpdates() {
    try {
      const docRef = doc(this.db, ...this.pathSegments);
      const snapshot = await getDoc(docRef);
      const val = snapshot.data();
      const latestVersion = val && val[this.latestVersionField];
      return latestVersion === this.curVersion ? null : latestVersion;
    } catch (error) {
      console.error(
        "workbox-installer > _getUpdates : Failed to load latest version data.",
        error
      );
    }
  }

  /**
   * @private
   */
  __isValidDocumentPath(path) {
    return (
      path &&
      !path.startsWith("/") &&
      !path.endsWith("/") &&
      (path.match(/\//g) || []).length % 2 === 1
    );
  }
}
